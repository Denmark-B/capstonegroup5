<?php
// ============================================================
// Checkout.php — orders with J&T shipping calculated ON THE SERVER.
//   GET  ?action=rates   → rate table for the checkout page
//   POST ?action=quote   → {zone, items:[{id,qty}]} → shipping breakdown
//   POST ?action=place   → place the order (same rules as Api.php:
//                          DB prices, stock check + decrease in one
//                          transaction) but shipping = J&T table,
//                          never a number sent by the browser.
// Api.php is not modified.
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';
require_once __DIR__ . '/Shipping.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
lf_send_cors_headers();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

set_exception_handler(function ($e) {
    error_log('[lostfound checkout] ' . $e->getMessage());
    respond(['error' => 'Server error. Please try again.'], 500);
});

$action = (string)($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET' && $action === 'rates') {
    respond(lf_shipping_public_config());
}

lf_start_session();
try {
    $pdo = lf_db();
} catch (PDOException $e) {
    respond(['error' => 'Cannot connect to the database. Start MySQL in XAMPP.'], 503);
}
requireCsrf();

/** Reads [{id,qty}] → merged [productId => qty]. */
function wantedItems(array $b): array {
    $items = is_array($b['items'] ?? null) ? $b['items'] : [];
    if (!$items)            respond(['error' => 'Your cart is empty.'], 400);
    if (count($items) > 50) respond(['error' => 'Too many items in one order.'], 400);
    $want = [];
    foreach ($items as $i) {
        $pid = (int)($i['id'] ?? $i['productId'] ?? 0);
        $qty = (int)($i['qty'] ?? 1);
        if ($pid <= 0 || $qty < 1 || $qty > 100) respond(['error' => 'Invalid item in cart.'], 400);
        $want[$pid] = ($want[$pid] ?? 0) + $qty;
    }
    return $want;
}

// ── QUOTE ────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'quote') {
    $b    = input();
    $want = wantedItems($b);
    $in   = implode(',', array_fill(0, count($want), '?'));
    $st   = $pdo->prepare("SELECT p.id, p.brand_id, p.name, p.tag, p.price, b.name AS brand_name
                           FROM products p LEFT JOIN brands b ON b.id=p.brand_id WHERE p.id IN ($in)");
    $st->execute(array_keys($want));
    $lines = []; $subtotal = 0.0;
    foreach ($st->fetchAll() as $p) {
        $qty = $want[(int)$p['id']];
        $lines[] = ['brand_id' => $p['brand_id'], 'brand_name' => $p['brand_name'], 'name' => $p['name'], 'tag' => $p['tag'], 'qty' => $qty];
        $subtotal += (is_numeric($p['price']) ? (float)$p['price'] : 0) * $qty;
    }
    $ship = lf_calc_shipping((string)($b['zone'] ?? ''), $lines);
    if (!$ship['ok']) respond(['error' => $ship['error']], 400);
    respond($ship + ['subtotal' => $subtotal, 'total' => $subtotal + $ship['shippingTotal']]);
}

// ── PLACE ORDER ──────────────────────────────────────────────
if ($method === 'POST' && $action === 'place') {
    $b    = input();
    $sid  = visitorSession();
    $want = wantedItems($b);
    $zone = (string)($b['zone'] ?? '');
    if (!isset(LF_SHIP_ZONES[$zone])) respond(['error' => 'Please select a shipping area.'], 400);

    $customer = requireText($b, 'customer', 'Name', 150);
    $email    = trim((string)($b['email'] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) respond(['error' => 'Please enter a valid email address.'], 400);
    $phone    = requireText($b, 'phone', 'Phone number', 50);
    $address  = requireText($b, 'address', 'Address', 500, true);
    $pay      = (string)($b['payMethod'] ?? '');
    if (!in_array($pay, ['gcash', 'paymaya'], true)) respond(['error' => 'Please select a payment method.'], 400);

    $orderId = 'ORD-' . strtoupper(bin2hex(random_bytes(4)));
    $pdo->beginTransaction();
    try {
        $lock = $pdo->prepare("SELECT p.id, p.brand_id, p.name, p.tag, p.price, p.size, p.img, p.stock, b.name AS brand_name
                               FROM products p LEFT JOIN brands b ON b.id=p.brand_id WHERE p.id=? FOR UPDATE");
        $lines = []; $subtotal = 0.0; $shipLines = [];
        foreach ($want as $pid => $qty) {
            $lock->execute([$pid]);
            $p = $lock->fetch();
            if (!$p) { $pdo->rollBack(); respond(['error' => 'A product in your cart no longer exists.'], 409); }
            if ((int)$p['stock'] < $qty) {
                $pdo->rollBack();
                respond(['error' => 'Only ' . (int)$p['stock'] . ' left of "' . $p['name'] . '". Please update your cart.'], 409);
            }
            if (!is_numeric($p['price'])) { $pdo->rollBack(); respond(['error' => '"' . $p['name'] . '" has no valid price.'], 409); }
            $subtotal += (float)$p['price'] * $qty;
            $lines[] = [$p, $qty];
            $shipLines[] = ['brand_id' => $p['brand_id'], 'brand_name' => $p['brand_name'], 'name' => $p['name'], 'tag' => $p['tag'], 'qty' => $qty];
        }
        $ship  = lf_calc_shipping($zone, $shipLines);
        $fee   = (float)$ship['shippingTotal'];
        $total = $subtotal + $fee;
        $timeline = json_encode(['placed' => date('M j'), 'confirmed' => null, 'packed' => null, 'shipped' => null, 'delivered' => null]);

        $pdo->prepare("INSERT INTO orders (id,session_id,customer_name,email,phone,address,pay_method,status,subtotal,shipping_fee,total,date_placed,timeline)
                       VALUES (?,?,?,?,?,?,?,'pending',?,?,?,?,?)")
            ->execute([$orderId, $sid ?: null, $customer, $email, $phone, $address, $pay, $subtotal, $fee, $total, date('F j, Y'), $timeline]);

        $itemStmt  = $pdo->prepare("INSERT INTO order_items (order_id,product_id,brand_id,name,price,qty,size,img) VALUES (?,?,?,?,?,?,?,?)");
        $stockStmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id=?");
        foreach ($lines as [$p, $qty]) {
            $itemStmt->execute([$orderId, $p['id'], $p['brand_id'], $p['name'], $p['price'], $qty, $p['size'], $p['img']]);
            $stockStmt->execute([$qty, $p['id']]);
        }

        $notif = $pdo->prepare("INSERT INTO notifications (audience,merchant_id,session_id,icon,text,target) VALUES (?,?,?,?,?,?)");
        $notif->execute(['customer', null, $sid ?: null, 'package', "Order $orderId placed — ₱" . number_format($total), 'orders']);
        foreach ($ship['parcels'] as $parcel) {
            $notif->execute(['merchant', $parcel['brandId'], null, 'bag',
                "New order $orderId from $customer — J&T parcel " . $parcel['weightKg'] . ' kg, shipping ₱' . $parcel['fee'], 'orders-merch']);
        }
        // the shipping breakdown is also saved as the first order message, so merchants see it
        $pdo->prepare("INSERT INTO order_messages (order_id,role,text,time) VALUES (?,?,?,?)")
            ->execute([$orderId, 'merchant', 'J&T shipping to ' . $ship['zoneLabel'] . ': ' . implode(', ', array_map(function ($p) {
                return $p['brandName'] . ' ' . $p['weightKg'] . ' kg = ₱' . $p['fee'];
            }, $ship['parcels'])) . ' · Total shipping ₱' . (int)$fee, date('M j, g:i A')]);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
    respond(['id' => $orderId, 'subtotal' => $subtotal, 'shippingFee' => $fee, 'total' => $total,
             'parcels' => $ship['parcels'], 'zoneLabel' => $ship['zoneLabel'], 'days' => $ship['days']], 201);
}

respond(['error' => 'Unknown action'], 400);
