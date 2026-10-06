<?php
// ============================================================
// Api.php — single-entry REST-style API for Lost & Found.
//   backend/Api.php?resource=...&id=...&action=...
//
// Same resources, actions and JSON shapes that backend/Sync.js
// already expects, but every permission is enforced HERE on the
// server using the PHP session — never what the browser claims.
//
//   Customers  : browse, checkout, reviews, feedback, event interest
//   Merchants  : ONLY their own brand's products/orders/reviews/events
//   Admin      : everything + approvals + site settings
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');
lf_send_cors_headers();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

set_exception_handler(function ($e) {
    error_log('[lostfound] ' . $e->getMessage());
    $out = ['error' => 'Server error. Please try again.'];
    if (lf_config()['show_db_errors']) $out['detail'] = $e->getMessage();
    respond($out, 500);
});

lf_start_session();

try {
    $pdo = lf_db();
} catch (PDOException $e) {
    respond(['error' => 'Cannot connect to the database. Start MySQL in XAMPP and check that the database was imported.'], 503);
}

$resource = (string)($_GET['resource'] ?? '');
$id       = isset($_GET['id']) && $_GET['id'] !== '' ? (string)$_GET['id'] : null;
$action   = isset($_GET['action']) && $_GET['action'] !== '' ? (string)$_GET['action'] : null;
$method   = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// 1) CSRF + origin check for every POST/PUT/DELETE
requireCsrf();

// 2) Accounts with a temporary password may do nothing but change it
if (isLoggedIn() && mustChangePassword() && $method !== 'GET'
    && !($resource === 'auth' && in_array($action, ['change_password', 'logout'], true))) {
    respond(['error' => 'Please change your temporary password first.', 'code' => 'must_change_password'], 403);
}

switch ($resource) {
    case 'auth':                 handleAuth($pdo, $method, $action); break;
    case 'brands':               handleBrands($pdo, $method, $id); break;
    case 'products':             handleProducts($pdo, $method, $id, $action); break;
    case 'orders':               handleOrders($pdo, $method, $id, $action); break;
    case 'reviews':              handleReviews($pdo, $method, $id, $action); break;
    case 'testimonials':         handleTestimonials($pdo, $method, $id); break;
    case 'testimonial_requests': handleTestimonialRequests($pdo, $method, $id, $action); break;
    case 'notifications':        handleNotifications($pdo, $method, $id); break;
    case 'pending_images':       handlePendingImages($pdo, $method, $id, $action); break;
    case 'events':               handleEvents($pdo, $method, $id, $action); break;
    case 'event_interests':      handleEventInterests($pdo, $method); break;
    case 'feedback':             handleFeedback($pdo, $method); break;
    case 'settings':             handleSettings($pdo, $method); break;
    case 'upload':               handleUpload($method); break;
    default: respond(['error' => 'Unknown resource'], 404);
}

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════
function loginSuccess(string $merchantId, bool $isAdmin, bool $mustChange): void {
    session_regenerate_id(true);                 // prevent session fixation
    $_SESSION['merchant_id'] = $merchantId;
    $_SESSION['is_admin']    = $isAdmin;
    $_SESSION['must_change'] = $mustChange;
    $_SESSION['login_at']    = time();
    $token = rotateCsrfToken();
    respond(['ok' => true, 'isAdmin' => $isAdmin, 'merchantId' => $merchantId,
             'mustChangePassword' => $mustChange, 'csrfToken' => $token]);
}

function lockedResponse(int $sec): void {
    $min = max(1, (int)ceil($sec / 60));
    respond(['ok' => false, 'locked' => true,
             'error' => "Too many failed attempts. Try again in $min minute" . ($min > 1 ? 's' : '') . '.'], 429);
}

function handleAuth(PDO $pdo, string $method, ?string $action): void {
    if ($method === 'GET' && $action === 'check') {
        respond([
            'loggedIn'           => isLoggedIn(),
            'isAdmin'            => isLoggedInAsAdmin(),
            'merchantId'         => currentMerchantId(),
            'mustChangePassword' => isLoggedIn() && mustChangePassword(),
            'csrfToken'          => csrfToken(),
            'setupRequired'      => !adminExists($pdo),
        ]);
    }

    if ($method === 'POST' && $action === 'admin_login') {
        $b    = input();
        $user = substr(trim((string)($b['username'] ?? '')), 0, 100);
        $pass = (string)($b['password'] ?? '');
        $key  = 'admin:' . strtolower($user);

        if (!adminExists($pdo)) respond(['ok' => false, 'error' => 'Admin account not set up yet. Open backend/setup.php first.'], 503);
        if ($sec = loginLockRemaining($pdo, $key)) lockedResponse($sec);

        $st = $pdo->prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('admin_username','admin_password')");
        $st->execute();
        $cred = [];
        foreach ($st->fetchAll() as $r) $cred[$r['setting_key']] = $r['setting_value'];

        $ok = $user !== '' && hash_equals((string)($cred['admin_username'] ?? ''), $user)
              && verifyPassword($pass, $cred['admin_password'] ?? null);
        if (!$ok) {
            recordLoginFailure($pdo, $key);
            if ($sec = loginLockRemaining($pdo, $key)) lockedResponse($sec);
            respond(['ok' => false, 'error' => 'Incorrect username or password.'], 401);
        }
        if (isBannedPassword($pass)) {
            respond(['ok' => false, 'error' => 'The old default admin password is disabled. Run backend/setup.php to create your own admin login.'], 403);
        }
        clearLoginFailures($pdo, $key);
        loginSuccess('lostandfound', true, false);
    }

    if ($method === 'POST' && $action === 'merchant_login') {
        $b       = input();
        $brandId = strtolower(substr(trim((string)($b['brandId'] ?? '')), 0, 50));
        $pass    = (string)($b['password'] ?? '');
        $key     = 'merchant:' . $brandId;

        if ($sec = loginLockRemaining($pdo, $key)) lockedResponse($sec);

        $row = false;
        if ($brandId !== '' && $brandId !== 'lostandfound') {        // admin brand can't log in as a merchant
            $st = $pdo->prepare("SELECT password, must_change_password FROM brands WHERE id=?");
            $st->execute([$brandId]);
            $row = $st->fetch();
        }
        if (!$row || !verifyPassword($pass, $row['password'])) {
            recordLoginFailure($pdo, $key);
            if ($sec = loginLockRemaining($pdo, $key)) lockedResponse($sec);
            respond(['ok' => false, 'error' => 'Incorrect brand or password.'], 401);
        }
        if (isBannedPassword($pass)) {
            respond(['ok' => false, 'error' => 'This default password is disabled. Ask the admin for your temporary password.'], 403);
        }
        clearLoginFailures($pdo, $key);
        loginSuccess($brandId, false, (bool)$row['must_change_password']);
    }

    if ($method === 'POST' && $action === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', ['expires' => time() - 42000, 'path' => $p['path'], 'domain' => $p['domain'],
                                           'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Lax']);
        }
        session_destroy();
        respond(['ok' => true]);
    }

    if ($method === 'POST' && $action === 'change_password') {
        requireLogin();
        $b   = input();
        $cur = (string)($b['currentPassword'] ?? '');
        $new = (string)($b['newPassword'] ?? '');
        if ($err = passwordStrengthError($new)) respond(['ok' => false, 'error' => $err], 400);
        if ($cur === $new) respond(['ok' => false, 'error' => 'New password must be different from the current one.'], 400);

        if (isLoggedInAsAdmin()) {
            $st = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key='admin_password'");
            $st->execute();
            if (!verifyPassword($cur, $st->fetchColumn() ?: null)) respond(['ok' => false, 'error' => 'Current password is incorrect.'], 400);
            $pdo->prepare("UPDATE site_settings SET setting_value=? WHERE setting_key='admin_password'")->execute([hashPassword($new)]);
        } else {
            $mid = currentMerchantId();
            $st  = $pdo->prepare("SELECT password FROM brands WHERE id=?");
            $st->execute([$mid]);
            if (!verifyPassword($cur, $st->fetchColumn() ?: null)) respond(['ok' => false, 'error' => 'Current password is incorrect.'], 400);
            $pdo->prepare("UPDATE brands SET password=?, must_change_password=0 WHERE id=?")->execute([hashPassword($new), $mid]);
        }
        session_regenerate_id(true);
        $_SESSION['must_change'] = false;
        respond(['ok' => true, 'csrfToken' => rotateCsrfToken(), 'mustChangePassword' => false]);
    }

    respond(['error' => 'Unknown auth action'], 400);
}

// ════════════════════════════════════════════════════════════
// BRANDS
// ════════════════════════════════════════════════════════════
function mapBrandRow(array $r): array {
    return [
        'id' => $r['id'], 'name' => $r['name'], 'tag' => $r['tag'],
        'desc' => $r['description'], 'img' => $r['img'], 'color' => $r['color'],
        'location' => $r['location'], 'year' => $r['year'], 'schedule' => $r['schedule'],
        'instagram' => $r['instagram'], 'follows' => (int)$r['follows'],
    ];
}

function handleBrands(PDO $pdo, string $method, ?string $id): void {
    if ($method === 'GET') {
        $rows = $pdo->query("SELECT id,name,tag,description,img,color,location,year,schedule,instagram,follows
                             FROM brands ORDER BY FIELD(id,'lostandfound') DESC, name ASC")->fetchAll();
        respond(array_map('mapBrandRow', $rows));
    }

    if ($method === 'POST') {
        requireAdmin();
        $b     = input();
        $newId = cleanBrandId($b['id'] ?? '');
        $name  = requireText($b, 'name', 'Brand name', 150);
        $pass  = (string)($b['password'] ?? '');
        if ($pass === '') respond(['error' => 'Enter a password for this merchant.'], 400);
        if ($err = passwordStrengthError($pass)) respond(['error' => $err], 400);

        $check = $pdo->prepare("SELECT 1 FROM brands WHERE id=?");
        $check->execute([$newId]);
        if ($check->fetch()) respond(['error' => 'Brand ID already exists. Use a different ID.'], 409);

        $pdo->prepare("INSERT INTO brands (id,name,tag,description,img,color,location,year,schedule,instagram,follows,password,must_change_password)
                       VALUES (?,?,?,?,?,?,?,?,?,?,0,?,1)")
            ->execute([
                $newId, $name, cleanText($b['tag'] ?? 'thrift', 50) ?: 'thrift', cleanText($b['desc'] ?? '', 2000, true),
                '', '#111', cleanText($b['location'] ?? '', 150), cleanText($b['year'] ?? '', 10), '',
                cleanText($b['instagram'] ?? '', 100), hashPassword($pass),
            ]);
        respond(['id' => $newId], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);

    if ($method === 'PUT') {
        requireLogin();
        requireOwnerOrAdmin($id);
        $st = $pdo->prepare("SELECT * FROM brands WHERE id=?");
        $st->execute([$id]);
        $cur = $st->fetch();
        if (!$cur) respond(['error' => 'Brand not found'], 404);

        $b = input();
        // empty name/tag/desc/img keep the current value (same behaviour as before)
        $name = array_key_exists('name', $b) ? (cleanText($b['name'], 150) ?: $cur['name']) : $cur['name'];
        $tag  = array_key_exists('tag',  $b) ? (cleanText($b['tag'], 50) ?: $cur['tag']) : $cur['tag'];
        $desc = array_key_exists('desc', $b) ? (cleanText($b['desc'], 2000, true) ?: $cur['description']) : $cur['description'];
        $img  = $cur['img'];
        if (array_key_exists('img', $b) && trim((string)$b['img']) !== '') {
            $img = (trim((string)$b['img']) === (string)$cur['img']) ? $cur['img'] : cleanImageRef($b['img'], 'Brand image');
        }
        $loc   = array_key_exists('location',  $b) ? cleanText($b['location'], 150)  : $cur['location'];
        $year  = array_key_exists('year',      $b) ? cleanText($b['year'], 10)       : $cur['year'];
        $ig    = array_key_exists('instagram', $b) ? cleanText($b['instagram'], 100) : $cur['instagram'];
        $sched = array_key_exists('schedule',  $b) ? cleanText($b['schedule'], 150)  : $cur['schedule'];

        $pdo->prepare("UPDATE brands SET name=?,tag=?,description=?,img=?,location=?,year=?,instagram=?,schedule=? WHERE id=?")
            ->execute([$name, $tag, $desc, $img, $loc, $year, $ig, $sched, $id]);
        respond(['ok' => true]);
    }

    if ($method === 'DELETE') {
        requireAdmin();
        if ($id === 'lostandfound') respond(['error' => 'The Lost & Found admin brand cannot be deleted.'], 400);
        $pdo->prepare("DELETE FROM brands WHERE id=?")->execute([$id]);
        respond(['ok' => true]);
    }

    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════════════════════════
function mapProductRow(array $r): array {
    return [
        'id' => (int)$r['id'], 'brand' => $r['brand_id'], 'name' => $r['name'],
        'tag' => $r['tag'], 'price' => is_numeric($r['price']) ? (float)$r['price'] : $r['price'],
        'size' => $r['size'], 'img' => $r['img'],
        'imgs' => $r['imgs'] ? (json_decode($r['imgs'], true) ?: []) : [],
        'originalPrice' => ($r['original_price'] !== null && $r['original_price'] !== '')
            ? (is_numeric($r['original_price']) ? (float)$r['original_price'] : $r['original_price']) : null,
        'new' => (bool)$r['is_new'], 'stock' => (int)$r['stock'], 'views' => (int)$r['views'],
    ];
}

/** Validates the product fields shared by create and edit. */
function productFields(array $b, ?array $current = null): array {
    $imgs = [];
    $oldImgs = $current && $current['imgs'] ? (json_decode($current['imgs'], true) ?: []) : [];
    foreach (array_slice((array)($b['imgs'] ?? []), 0, 5) as $im) {
        $im = trim((string)$im);
        if ($im === '') continue;
        // images that are already saved on this product are kept as-is
        $imgs[] = in_array($im, $oldImgs, true) ? $im : cleanImageRef($im, 'Product image');
    }
    $img = trim((string)($b['img'] ?? ''));
    if ($img !== '' && !in_array($img, $imgs, true) && !($current && $img === $current['img'])) $img = cleanImageRef($img, 'Product image');
    if ($img === '' && $imgs) $img = $imgs[0];
    if ($img !== '' && !$imgs) $imgs = [$img];

    return [
        'name'  => requireText($b, 'name', 'Product name', 200),
        'tag'   => requireText($b, 'tag', 'Tag', 100),
        'size'  => requireText($b, 'size', 'Size', 100),
        'price' => cleanMoney($b['price'] ?? null, 'Price'),
        'orig'  => cleanMoney($b['originalPrice'] ?? null, 'Original price', false),
        'stock' => cleanInt($b['stock'] ?? 0, 0, 100000, 'Stock'),
        'img'   => $img,
        'imgs'  => json_encode(array_values($imgs), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    ];
}

function handleProducts(PDO $pdo, string $method, ?string $id, ?string $action): void {
    if ($method === 'GET') {
        $rows = $pdo->query("SELECT * FROM products ORDER BY id ASC")->fetchAll();
        respond(array_map('mapProductRow', $rows));
    }

    if ($method === 'POST' && !$id) {
        requireLogin();
        $b     = input();
        $brand = isLoggedInAsAdmin() ? strtolower(trim((string)($b['brand'] ?? 'lostandfound'))) : currentMerchantId();
        requireOwnerOrAdmin($brand);
        $chk = $pdo->prepare("SELECT 1 FROM brands WHERE id=?");
        $chk->execute([$brand]);
        if (!$chk->fetch()) respond(['error' => 'Brand not found'], 404);

        $f = productFields($b);
        $pdo->prepare("INSERT INTO products (brand_id,name,tag,price,size,img,imgs,original_price,is_new,stock,views)
                       VALUES (?,?,?,?,?,?,?,?,?,?,0)")
            ->execute([$brand, $f['name'], $f['tag'], $f['price'], $f['size'], $f['img'], $f['imgs'], $f['orig'],
                       boolField($b['new'] ?? true), $f['stock']]);
        respond(['id' => (int)$pdo->lastInsertId()], 201);
    }

    if (!$id || !ctype_digit($id)) respond(['error' => 'Missing or invalid id'], 400);

    // public: count a product view (once per visitor session)
    if ($method === 'POST' && $action === 'view') {
        if (empty($_SESSION['viewed'][$id])) {
            $_SESSION['viewed'][$id] = 1;
            $pdo->prepare("UPDATE products SET views = views + 1 WHERE id=?")->execute([$id]);
        }
        respond(['ok' => true]);
    }

    $st = $pdo->prepare("SELECT * FROM products WHERE id=?");
    $st->execute([$id]);
    $current = $st->fetch();
    if (!$current) respond(['error' => 'Product not found'], 404);

    requireLogin();
    requireOwnerOrAdmin($current['brand_id']);          // merchants: ONLY their own products

    if ($method === 'PUT' && $action === 'stock') {
        $b = input();
        $pdo->prepare("UPDATE products SET stock=? WHERE id=?")
            ->execute([cleanInt($b['stock'] ?? 0, 0, 100000, 'Stock'), $id]);
        respond(['ok' => true]);
    }

    if ($method === 'PUT') {
        $b = input();
        $f = productFields($b, $current);
        $isNew = array_key_exists('new', $b) ? boolField($b['new']) : (int)$current['is_new'];
        $pdo->prepare("UPDATE products SET name=?,price=?,tag=?,size=?,img=?,imgs=?,original_price=?,stock=?,is_new=? WHERE id=?")
            ->execute([$f['name'], $f['price'], $f['tag'], $f['size'], $f['img'], $f['imgs'], $f['orig'], $f['stock'], $isNew, $id]);
        respond(['ok' => true]);
    }

    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM products WHERE id=?")->execute([$id]);
        respond(['ok' => true]);
    }

    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// ORDERS
//  - customers see only orders placed from their own browser
//    (anonymous visitor id, ?session=...)
//  - merchants see orders that contain their products
//  - admin sees everything
// ════════════════════════════════════════════════════════════
function notify(PDO $pdo, string $audience, ?string $merchantId, ?string $sessionId, string $icon, string $text, ?string $target): void {
    $pdo->prepare("INSERT INTO notifications (audience,merchant_id,session_id,icon,text,target) VALUES (?,?,?,?,?,?)")
        ->execute([$audience, $merchantId, $sessionId, $icon, mb_substr($text, 0, 500), $target]);
}

function orderAccess(PDO $pdo, string $orderId): array {
    $st = $pdo->prepare("SELECT * FROM orders WHERE id=?");
    $st->execute([$orderId]);
    $o = $st->fetch();
    if (!$o) respond(['error' => 'Order not found'], 404);
    requireLogin();
    if (!isLoggedInAsAdmin()) {
        $st = $pdo->prepare("SELECT 1 FROM order_items WHERE order_id=? AND brand_id=? LIMIT 1");
        $st->execute([$orderId, currentMerchantId()]);
        if (!$st->fetch()) respond(['error' => 'This order does not include your products.', 'code' => 'forbidden'], 403);
    }
    return $o;
}

function handleOrders(PDO $pdo, string $method, ?string $id, ?string $action): void {
    if ($method === 'GET') {
        if (isLoggedInAsAdmin()) {
            $orders = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC")->fetchAll();
        } elseif (isLoggedIn()) {
            $st = $pdo->prepare("SELECT DISTINCT o.* FROM orders o JOIN order_items i ON i.order_id=o.id
                                 WHERE i.brand_id=? ORDER BY o.created_at DESC");
            $st->execute([currentMerchantId()]);
            $orders = $st->fetchAll();
        } else {
            $sid = visitorSession();
            if ($sid === '') respond([]);
            $st = $pdo->prepare("SELECT * FROM orders WHERE session_id=? ORDER BY created_at DESC");
            $st->execute([$sid]);
            $orders = $st->fetchAll();
        }
        $itemsStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id=?");
        $msgStmt   = $pdo->prepare("SELECT * FROM order_messages WHERE order_id=? ORDER BY created_at ASC");
        $out = [];
        foreach ($orders as $o) {
            $itemsStmt->execute([$o['id']]);
            $msgStmt->execute([$o['id']]);
            $out[] = [
                'id' => $o['id'], 'customer' => $o['customer_name'], 'email' => $o['email'],
                'phone' => $o['phone'], 'address' => $o['address'], 'payMethod' => $o['pay_method'],
                'status' => $o['status'], 'trackingNumber' => $o['tracking_number'],
                'total' => (float)$o['total'], 'shippingFee' => (float)$o['shipping_fee'],
                'date' => $o['date_placed'], 'timeline' => $o['timeline'] ? json_decode($o['timeline'], true) : [],
                'items' => array_map(function ($i) {
                    return [
                        'product_id' => $i['product_id'], 'brand' => $i['brand_id'], 'name' => $i['name'],
                        'price' => is_numeric($i['price']) ? (float)$i['price'] : $i['price'],
                        'qty' => (int)$i['qty'], 'size' => $i['size'], 'img' => $i['img'],
                    ];
                }, $itemsStmt->fetchAll()),
                'messages' => array_map(function ($m) {
                    return ['role' => $m['role'], 'text' => $m['text'], 'time' => $m['time']];
                }, $msgStmt->fetchAll()),
            ];
        }
        respond($out);
    }

    // ── place order: prices come from the DATABASE, stock checked + decreased in one transaction
    if ($method === 'POST' && !$id) {
        $b     = input();
        $sid   = visitorSession();
        $items = is_array($b['items'] ?? null) ? $b['items'] : [];
        if (!$items)            respond(['error' => 'Your cart is empty.'], 400);
        if (count($items) > 50) respond(['error' => 'Too many items in one order.'], 400);

        $customer = requireText($b, 'customer', 'Name', 150);
        $email    = trim((string)($b['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) respond(['error' => 'Please enter a valid email address.'], 400);
        $phone    = requireText($b, 'phone', 'Phone number', 50);
        $address  = requireText($b, 'address', 'Address', 500, true);
        $pay      = (string)($b['payMethod'] ?? '');
        if (!in_array($pay, ['gcash', 'paymaya'], true)) respond(['error' => 'Please select a payment method.'], 400);
        $allowedFees = [105, 110, 120, 130, 140, 150, 155, 170, 200, 220, 270, 290];   // SHIPPING_RATES in lostandfound.js
        $ship = (float)($b['shippingFee'] ?? 0);
        if (!in_array((int)$ship, $allowedFees, true) || (int)$ship != $ship) respond(['error' => 'Please select a shipping area.'], 400);

        // merge duplicate product lines
        $want = [];
        foreach ($items as $i) {
            $pid = (int)($i['id'] ?? $i['productId'] ?? 0);
            $qty = (int)($i['qty'] ?? 1);
            if ($pid <= 0 || $qty < 1 || $qty > 100) respond(['error' => 'Invalid item in cart.'], 400);
            $want[$pid] = ($want[$pid] ?? 0) + $qty;
        }

        $orderId = 'ORD-' . strtoupper(bin2hex(random_bytes(4)));
        $pdo->beginTransaction();
        try {
            $lock = $pdo->prepare("SELECT id,brand_id,name,price,size,img,stock FROM products WHERE id=? FOR UPDATE");
            $lines = [];
            $subtotal = 0.0;
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
            }
            $total = $subtotal + $ship;
            $timeline = json_encode(['placed' => date('M j'), 'confirmed' => null, 'packed' => null, 'shipped' => null, 'delivered' => null]);

            $pdo->prepare("INSERT INTO orders (id,session_id,customer_name,email,phone,address,pay_method,status,subtotal,shipping_fee,total,date_placed,timeline)
                           VALUES (?,?,?,?,?,?,?,'pending',?,?,?,?,?)")
                ->execute([$orderId, $sid ?: null, $customer, $email, $phone, $address, $pay, $subtotal, $ship, $total, date('F j, Y'), $timeline]);

            $itemStmt  = $pdo->prepare("INSERT INTO order_items (order_id,product_id,brand_id,name,price,qty,size,img) VALUES (?,?,?,?,?,?,?,?)");
            $stockStmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id=?");
            $brands = [];
            foreach ($lines as [$p, $qty]) {
                $itemStmt->execute([$orderId, $p['id'], $p['brand_id'], $p['name'], $p['price'], $qty, $p['size'], $p['img']]);
                $stockStmt->execute([$qty, $p['id']]);
                $brands[$p['brand_id']] = true;
            }
            notify($pdo, 'customer', null, $sid ?: null, 'package', "Order $orderId placed — ₱" . number_format($total), 'orders');
            foreach (array_keys($brands) as $bid) {
                notify($pdo, 'merchant', $bid, null, 'bag', "New order $orderId from $customer", 'orders-merch');
            }
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }
        respond(['id' => $orderId, 'total' => $total], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);

    if ($method === 'PUT' && $action === 'status') {
        $o = orderAccess($pdo, $id);
        $b = input();
        $status = (string)($b['status'] ?? '');
        $valid = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
        if (!in_array($status, $valid, true)) respond(['error' => 'Invalid status'], 400);
        $timeline = $o['timeline'] ? (json_decode($o['timeline'], true) ?: []) : [];
        $timeline[$status] = date('M j');
        $pdo->prepare("UPDATE orders SET status=?, timeline=? WHERE id=?")->execute([$status, json_encode($timeline), $id]);
        notify($pdo, 'customer', null, $o['session_id'], 'package', "Your order $id is now: $status", 'orders');
        respond(['ok' => true]);
    }

    if ($method === 'POST' && $action === 'message') {
        $o = orderAccess($pdo, $id);
        $b = input();
        $text     = cleanText($b['text'] ?? '', 1000, true);
        $tracking = cleanText($b['trackingNumber'] ?? '', 50);
        if ($text === '' && $tracking === '') respond(['error' => 'Enter a message or tracking number.'], 400);
        if ($tracking !== '') $pdo->prepare("UPDATE orders SET tracking_number=? WHERE id=?")->execute([$tracking, $id]);
        if ($text !== '') {
            $pdo->prepare("INSERT INTO order_messages (order_id,role,text,time) VALUES (?,?,?,?)")
                ->execute([$id, 'merchant', $text, date('M j, g:i A')]);
        }
        notify($pdo, 'customer', null, $o['session_id'], 'message', "Merchant message for order $id", 'orders');
        respond(['ok' => true]);
    }

    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// REVIEWS  (customers can edit/delete only their own reviews)
// ════════════════════════════════════════════════════════════
function handleReviews(PDO $pdo, string $method, ?string $id, ?string $action): void {
    $sid = visitorSession();

    if ($method === 'GET') {
        $rows = $pdo->query("SELECT * FROM reviews ORDER BY created_at DESC")->fetchAll();
        respond(array_map(function ($r) use ($sid) {
            $mine = $sid !== '' && $r['session_id'] !== null && hash_equals((string)$r['session_id'], $sid);
            $author = $r['author'];
            if (!$mine && ($author === 'You' || $author === '')) $author = 'Verified buyer';
            return [
                'id' => $r['id'], 'product_id' => (int)$r['product_id'], 'author' => $author,
                'rating' => (int)$r['rating'], 'text' => $r['text'], 'img' => $r['img'],
                'date' => $r['date'], 'merchant_reply' => $r['merchant_reply'], 'mine' => $mine,
            ];
        }, $rows));
    }

    if ($method === 'POST' && !$id) {
        if ($sid === '') respond(['error' => 'Missing visitor session. Refresh the page.'], 400);
        rateLimit('review', 10, 3600);
        $b      = input();
        $pid    = (int)($b['productId'] ?? 0);
        $rating = cleanInt($b['rating'] ?? 0, 1, 5, 'Rating');
        $text   = requireText($b, 'text', 'Review', 2000, true);
        $img    = cleanImageRef($b['img'] ?? '', 'Review photo');
        // only customers who received this product (a delivered order from this browser) may review it
        $st = $pdo->prepare("SELECT 1 FROM orders o JOIN order_items i ON i.order_id=o.id
                             WHERE o.session_id=? AND o.status='delivered' AND i.product_id=? LIMIT 1");
        $st->execute([$sid, $pid]);
        if (!$st->fetch()) respond(['error' => 'You can review a product after your order is delivered.'], 403);

        $rid = newId('rv');
        $pdo->prepare("INSERT INTO reviews (id,product_id,session_id,author,rating,text,img,date) VALUES (?,?,?,?,?,?,?,?)")
            ->execute([$rid, $pid, $sid, cleanText($b['author'] ?? 'You', 150) ?: 'You', $rating, $text, $img !== '' ? $img : null, date('M j, Y')]);
        respond(['id' => $rid], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);

    $st = $pdo->prepare("SELECT r.*, p.brand_id FROM reviews r LEFT JOIN products p ON p.id=r.product_id WHERE r.id=?");
    $st->execute([$id]);
    $rev = $st->fetch();
    if (!$rev) respond(['error' => 'Review not found'], 404);

    if ($method === 'PUT' && $action === 'reply') {
        requireLogin();
        requireOwnerOrAdmin((string)$rev['brand_id']);   // only the product's merchant (or admin)
        $b = input();
        $pdo->prepare("UPDATE reviews SET merchant_reply=? WHERE id=?")->execute([cleanText($b['reply'] ?? '', 1000, true), $id]);
        respond(['ok' => true]);
    }

    $isAuthor = $sid !== '' && $rev['session_id'] !== null && hash_equals((string)$rev['session_id'], $sid);
    if (!$isAuthor && !isLoggedInAsAdmin()) respond(['error' => 'You can only change your own review.', 'code' => 'forbidden'], 403);

    if ($method === 'PUT') {
        $b = input();
        $img = trim((string)($b['img'] ?? ''));
        if ($img !== (string)$rev['img']) $img = cleanImageRef($img, 'Review photo');
        $pdo->prepare("UPDATE reviews SET rating=?,text=?,img=? WHERE id=?")
            ->execute([cleanInt($b['rating'] ?? 0, 1, 5, 'Rating'), requireText($b, 'text', 'Review', 2000, true), $img !== '' ? $img : null, $id]);
        respond(['ok' => true]);
    }

    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM reviews WHERE id=?")->execute([$id]);
        respond(['ok' => true]);
    }

    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// TESTIMONIALS
// ════════════════════════════════════════════════════════════
function initials(string $name): string {
    $out = '';
    foreach (preg_split('/\s+/', trim($name)) as $w) if ($w !== '') $out .= mb_substr($w, 0, 1);
    return mb_strtoupper(mb_substr($out, 0, 2));
}

function handleTestimonials(PDO $pdo, string $method, ?string $id): void {
    if ($method === 'GET') {
        $rows = $pdo->query("SELECT * FROM testimonials WHERE approved=1 ORDER BY id DESC")->fetchAll();
        respond(array_map(function ($r) {
            return ['id' => $r['id'], 'name' => $r['name'], 'location' => $r['location'],
                    'rating' => (int)$r['rating'], 'text' => $r['text'], 'avatar' => $r['avatar'], 'approved' => (bool)$r['approved']];
        }, $rows));
    }
    requireAdmin();
    if ($method === 'POST') {
        $b    = input();
        $name = requireText($b, 'name', 'Name', 150);
        $tid  = newId('t');
        $pdo->prepare("INSERT INTO testimonials (id,name,location,rating,text,avatar,approved) VALUES (?,?,?,?,?,?,1)")
            ->execute([$tid, $name, requireText($b, 'location', 'Location', 150), cleanInt($b['rating'] ?? 5, 1, 5, 'Rating'),
                       requireText($b, 'text', 'Testimonial', 2000, true), initials($name)]);
        respond(['id' => $tid], 201);
    }
    if ($method === 'DELETE') {
        if (!$id) respond(['error' => 'Missing id'], 400);
        $pdo->prepare("DELETE FROM testimonials WHERE id=?")->execute([$id]);
        respond(['ok' => true]);
    }
    respond(['error' => 'Method not allowed'], 405);
}

function handleTestimonialRequests(PDO $pdo, string $method, ?string $id, ?string $action): void {
    requireLogin();
    $map = function ($r) {
        return ['id' => $r['id'], 'brandId' => $r['brand_id'], 'brandName' => $r['brand_name'],
                'name' => $r['name'], 'location' => $r['location'], 'rating' => (int)$r['rating'],
                'text' => $r['text'], 'avatar' => $r['avatar'], 'status' => $r['status'], 'submittedAt' => $r['submitted_at']];
    };

    if ($method === 'GET') {
        if (isLoggedInAsAdmin()) {
            $rows = $pdo->query("SELECT * FROM testimonial_requests ORDER BY submitted_at DESC, id DESC")->fetchAll();
        } else {
            $st = $pdo->prepare("SELECT * FROM testimonial_requests WHERE brand_id=? ORDER BY id DESC");
            $st->execute([currentMerchantId()]);
            $rows = $st->fetchAll();
        }
        respond(array_map($map, $rows));
    }

    if ($method === 'POST' && !$id) {
        $b   = input();
        $bid = currentMerchantId();                       // never trust brandId from the browser
        $st  = $pdo->prepare("SELECT name FROM brands WHERE id=?");
        $st->execute([$bid]);
        $bname = (string)$st->fetchColumn();
        $name  = requireText($b, 'name', 'Name', 150);
        $rid   = newId('treq');
        $pdo->prepare("INSERT INTO testimonial_requests (id,brand_id,brand_name,name,location,rating,text,avatar,status,submitted_at)
                       VALUES (?,?,?,?,?,?,?,?,'pending',?)")
            ->execute([$rid, $bid, $bname, $name, requireText($b, 'location', 'Location', 150), cleanInt($b['rating'] ?? 5, 1, 5, 'Rating'),
                       requireText($b, 'text', 'Testimonial', 2000, true), initials($name), date('M j, Y')]);
        notify($pdo, 'merchant', 'lostandfound', null, 'star', "Testimonial request from $bname waiting for approval", null);
        respond(['id' => $rid], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);

    if ($method === 'PUT' && ($action === 'approve' || $action === 'reject')) {
        requireAdmin();
        $st = $pdo->prepare("SELECT * FROM testimonial_requests WHERE id=?");
        $st->execute([$id]);
        $r = $st->fetch();
        if (!$r) respond(['error' => 'Not found'], 404);
        if ($action === 'reject') {
            $pdo->prepare("UPDATE testimonial_requests SET status='rejected' WHERE id=?")->execute([$id]);
            respond(['ok' => true]);
        }
        $pdo->beginTransaction();
        $pdo->prepare("UPDATE testimonial_requests SET status='approved' WHERE id=?")->execute([$id]);
        $pdo->prepare("INSERT INTO testimonials (id,name,location,rating,text,avatar,approved) VALUES (?,?,?,?,?,?,1)")
            ->execute([newId('t'), $r['name'], $r['location'], $r['rating'], $r['text'], $r['avatar']]);
        $pdo->commit();
        respond(['ok' => true]);
    }

    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════════════
function handleNotifications(PDO $pdo, string $method, ?string $id): void {
    $audience = ($_GET['audience'] ?? 'customer') === 'merchant' ? 'merchant' : 'customer';
    $sid = visitorSession();
    $cols = "id,audience,merchant_id,icon,text,target,is_read,created_at";

    // WHERE clause limiting rows to what this requester may see
    if ($audience === 'merchant') {
        requireLogin();
        if (isLoggedInAsAdmin()) { $where = "audience='merchant'"; $args = []; }
        else { $where = "audience='merchant' AND (merchant_id=? OR merchant_id IS NULL)"; $args = [currentMerchantId()]; }
    } else {
        if ($sid === '') { if ($method === 'GET') respond([]); respond(['ok' => true]); }
        $where = "audience='customer' AND session_id=?"; $args = [$sid];
    }

    if ($method === 'GET') {
        $st = $pdo->prepare("SELECT $cols FROM notifications WHERE $where ORDER BY created_at DESC, id DESC LIMIT 20");
        $st->execute($args);
        respond($st->fetchAll());
    }
    if ($method === 'PUT') {
        if (!$id || !ctype_digit($id)) respond(['error' => 'Missing id'], 400);
        // customer notifications may be marked read without specifying audience
        if (!isset($_GET['audience']) && isLoggedIn()) {
            $st = $pdo->prepare("UPDATE notifications SET is_read=1 WHERE id=? AND ((audience='customer' AND session_id=?) OR (audience='merchant' AND (? OR merchant_id=? OR merchant_id IS NULL)))");
            $st->execute([$id, $sid, isLoggedInAsAdmin() ? 1 : 0, currentMerchantId()]);
        } else {
            $st = $pdo->prepare("UPDATE notifications SET is_read=1 WHERE id=? AND $where");
            $st->execute(array_merge([$id], $args));
        }
        respond(['ok' => true]);
    }
    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM notifications WHERE $where")->execute($args);
        respond(['ok' => true]);
    }
    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// PENDING IMAGES (merchant site-image submissions → admin approval)
// ════════════════════════════════════════════════════════════
function handlePendingImages(PDO $pdo, string $method, ?string $id, ?string $action): void {
    if ($method === 'GET') {
        requireAdmin();
        $rows = $pdo->query("SELECT * FROM pending_images WHERE status='pending' ORDER BY submitted_at DESC")->fetchAll();
        respond(array_map(function ($r) {
            return ['id' => $r['id'], 'merchantId' => $r['merchant_id'], 'merchantName' => $r['merchant_name'],
                    'type' => $r['type'], 'imageData' => $r['image_data'],
                    'targetIndex' => $r['target_index'] !== null ? (int)$r['target_index'] : null,
                    'label' => $r['label'], 'status' => $r['status'], 'submittedAt' => $r['submitted_at']];
        }, $rows));
    }

    if ($method === 'POST' && !$id) {
        requireLogin();
        $b    = input();
        $type = (string)($b['type'] ?? '');
        if (!in_array($type, ['hero', 'carousel', 'arrivals', 'events'], true)) respond(['error' => 'Invalid image type'], 400);
        $idx = null;
        if ($type === 'carousel') $idx = cleanInt($b['targetIndex'] ?? 0, 0, 3, 'Slide');
        $img = cleanImageRef($b['imageData'] ?? '', 'Image');
        if (strpos($img, 'uploads/') !== 0) respond(['error' => 'Please upload the image file.'], 400);
        $mid = currentMerchantId();
        $st = $pdo->prepare("SELECT name FROM brands WHERE id=?");
        $st->execute([$mid]);
        $iid = newId('img');
        $pdo->prepare("INSERT INTO pending_images (id,merchant_id,merchant_name,type,image_data,target_index,label,status,submitted_at)
                       VALUES (?,?,?,?,?,?,?,'pending',?)")
            ->execute([$iid, $mid, (string)$st->fetchColumn(), $type, $img, $idx, cleanText($b['label'] ?? $type, 100), date('M j, Y')]);
        notify($pdo, 'merchant', 'lostandfound', null, 'clock', 'New site image waiting for approval', null);
        respond(['id' => $iid], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);
    requireAdmin();
    $st = $pdo->prepare("SELECT * FROM pending_images WHERE id=?");
    $st->execute([$id]);
    $r = $st->fetch();
    if (!$r) respond(['error' => 'Not found'], 404);

    if ($method === 'PUT' && $action === 'reject') {
        $pdo->prepare("UPDATE pending_images SET status='rejected' WHERE id=?")->execute([$id]);
        notify($pdo, 'merchant', $r['merchant_id'], null, 'x', '"' . $r['label'] . '" was not approved', null);
        respond(['ok' => true]);
    }
    if ($method === 'PUT' && $action === 'approve') {
        $key = null;
        if ($r['type'] === 'carousel' && $r['target_index'] !== null) $key = 'carousel_' . (int)$r['target_index'];
        elseif ($r['type'] === 'hero')     $key = 'hero_bg';
        elseif ($r['type'] === 'arrivals') $key = 'arrivals_bg';
        elseif ($r['type'] === 'events')   $key = 'events_bg';
        $pdo->beginTransaction();
        $pdo->prepare("UPDATE pending_images SET status='approved' WHERE id=?")->execute([$id]);
        if ($key) {
            $pdo->prepare("INSERT INTO site_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)")
                ->execute([$key, $r['image_data']]);
        }
        $pdo->commit();
        notify($pdo, 'merchant', $r['merchant_id'], null, 'check', '"' . $r['label'] . '" was approved and is now live', null);
        respond(['ok' => true]);
    }
    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// EVENTS (merchant events need admin approval; admin's go live)
// ════════════════════════════════════════════════════════════
function handleEvents(PDO $pdo, string $method, ?string $id, ?string $action): void {
    if ($method === 'GET') {
        $session = visitorSession();
        if (isLoggedInAsAdmin()) {
            $rows = $pdo->query("SELECT * FROM events ORDER BY event_date ASC")->fetchAll();
        } elseif (isLoggedIn()) {
            $st = $pdo->prepare("SELECT * FROM events WHERE status='approved' OR brand_id=? ORDER BY event_date ASC");
            $st->execute([currentMerchantId()]);
            $rows = $st->fetchAll();
        } else {
            $rows = $pdo->query("SELECT * FROM events WHERE status='approved' ORDER BY event_date ASC")->fetchAll();
        }
        $int = $pdo->prepare("SELECT 1 FROM event_interests WHERE event_id=? AND session_id=?");
        foreach ($rows as &$r) {
            $int->execute([$r['id'], $session]);
            $r['interested'] = (bool)$int->fetchColumn();
        }
        unset($r);
        respond($rows);
    }

    if ($method === 'POST' && !$id) {
        requireLogin();
        $b    = input();
        $date = (string)($b['date'] ?? '');
        $d    = DateTime::createFromFormat('Y-m-d', $date);
        if (!$d || $d->format('Y-m-d') !== $date) respond(['error' => 'Please choose a valid event date.'], 400);
        $brand  = currentMerchantId();
        $status = isLoggedInAsAdmin() ? 'approved' : 'pending';
        $eid = newId('ev');
        $title = requireText($b, 'title', 'Title', 200);
        $pdo->prepare("INSERT INTO events (id,brand_id,title,event_date,event_time,location,description,img,status) VALUES (?,?,?,?,?,?,?,?,?)")
            ->execute([$eid, $brand, $title, $date, cleanText($b['time'] ?? '', 50), requireText($b, 'location', 'Location', 200),
                       cleanText($b['desc'] ?? '', 2000, true), cleanImageRef($b['img'] ?? '', 'Event image'), $status]);
        if ($status === 'pending') notify($pdo, 'merchant', 'lostandfound', null, 'calendar', "Event \"$title\" is waiting for approval", null);
        respond(['id' => $eid, 'status' => $status], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);
    $st = $pdo->prepare("SELECT * FROM events WHERE id=?");
    $st->execute([$id]);
    $ev = $st->fetch();
    if (!$ev) respond(['error' => 'Event not found'], 404);

    if ($method === 'PUT' && ($action === 'approve' || $action === 'reject')) {
        requireAdmin();
        $status = $action === 'approve' ? 'approved' : 'rejected';
        $pdo->prepare("UPDATE events SET status=? WHERE id=?")->execute([$status, $id]);
        notify($pdo, 'merchant', $ev['brand_id'], null, $action === 'approve' ? 'check' : 'x',
               'Your event "' . $ev['title'] . '" was ' . ($action === 'approve' ? 'approved' : 'not approved'), null);
        respond(['ok' => true]);
    }

    if ($method === 'DELETE') {
        requireLogin();
        requireOwnerOrAdmin((string)$ev['brand_id']);
        $pdo->prepare("DELETE FROM event_interests WHERE event_id=?")->execute([$id]);
        $pdo->prepare("DELETE FROM events WHERE id=?")->execute([$id]);
        respond(['ok' => true]);
    }
    respond(['error' => 'Method not allowed'], 405);
}

function handleEventInterests(PDO $pdo, string $method): void {
    if ($method !== 'POST') respond(['error' => 'Method not allowed'], 405);
    $b = input();
    $eventId   = (string)($b['eventId'] ?? '');
    $sessionId = cleanSessionId($b['sessionId'] ?? '');
    if ($sessionId === '') respond(['error' => 'Missing visitor session. Refresh the page.'], 400);
    $st = $pdo->prepare("SELECT 1 FROM events WHERE id=? AND status='approved'");
    $st->execute([$eventId]);
    if (!$st->fetch()) respond(['error' => 'Event not found'], 404);

    $chk = $pdo->prepare("SELECT 1 FROM event_interests WHERE event_id=? AND session_id=?");
    $chk->execute([$eventId, $sessionId]);
    if ($chk->fetch()) {
        $pdo->prepare("DELETE FROM event_interests WHERE event_id=? AND session_id=?")->execute([$eventId, $sessionId]);
        respond(['interested' => false]);
    }
    $pdo->prepare("INSERT INTO event_interests (event_id,session_id) VALUES (?,?)")->execute([$eventId, $sessionId]);
    respond(['interested' => true]);
}

// ════════════════════════════════════════════════════════════
// FEEDBACK (anyone can send; only admin can read)
// ════════════════════════════════════════════════════════════
function handleFeedback(PDO $pdo, string $method): void {
    if ($method === 'GET') {
        requireAdmin();
        respond($pdo->query("SELECT id,name,type,msg,time FROM feedback ORDER BY id DESC")->fetchAll());
    }
    if ($method === 'POST') {
        rateLimit('feedback', 5, 600);
        $b = input();
        $type = (string)($b['type'] ?? 'other');
        if (!in_array($type, ['suggestion', 'complaint', 'compliment', 'bug', 'other'], true)) $type = 'other';
        $pdo->prepare("INSERT INTO feedback (name,type,msg,time) VALUES (?,?,?,?)")
            ->execute([requireText($b, 'name', 'Name', 150), $type, requireText($b, 'msg', 'Message', 2000, true), date('M j, Y g:i A')]);
        notify($pdo, 'merchant', 'lostandfound', null, 'message', 'New customer feedback received', null);
        respond(['ok' => true], 201);
    }
    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// SITE SETTINGS (hero, mascot, logo, carousel, banners)
// ════════════════════════════════════════════════════════════
function handleSettings(PDO $pdo, string $method): void {
    $imageKeys = ['hero_bg', 'mascot_bg', 'logo_bg', 'carousel_0', 'carousel_1', 'carousel_2', 'carousel_3', 'arrivals_bg', 'events_bg'];

    if ($method === 'GET') {
        $in = implode(',', array_fill(0, count($imageKeys), '?'));
        $st = $pdo->prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ($in)");
        $st->execute($imageKeys);
        $out = [];
        foreach ($st->fetchAll() as $r) $out[$r['setting_key']] = $r['setting_value'];
        respond($out ?: new stdClass());   // always a JSON object
    }
    requireAdmin();
    if ($method === 'PUT') {
        $b   = input();
        $key = (string)($b['key'] ?? '');
        if (!in_array($key, $imageKeys, true)) respond(['error' => 'Invalid setting key'], 400);
        $val = cleanImageRef($b['value'] ?? '', 'Image');
        $pdo->prepare("INSERT INTO site_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)")
            ->execute([$key, $val]);
        respond(['ok' => true]);
    }
    if ($method === 'DELETE') {
        $in = implode(',', array_fill(0, count($imageKeys), '?'));
        $pdo->prepare("DELETE FROM site_settings WHERE setting_key IN ($in)")->execute($imageKeys);
        respond(['ok' => true]);
    }
    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// UPLOAD  (multipart/form-data, field "file")
//   ?resource=upload&category=products|brands|events|site|reviews
// ════════════════════════════════════════════════════════════
function handleUpload(string $method): void {
    if ($method !== 'POST') respond(['error' => 'Method not allowed'], 405);
    $category = (string)($_GET['category'] ?? '');
    $allowed  = ['products', 'brands', 'events', 'site', 'reviews'];
    if (!in_array($category, $allowed, true)) respond(['error' => 'Invalid upload category'], 400);

    if ($category === 'reviews') {
        if (visitorSession() === '') respond(['error' => 'Missing visitor session. Refresh the page.'], 400);
        rateLimit('upload_review', 10, 3600);
    } else {
        requireLogin();
        if ($category !== 'site' || !isLoggedInAsAdmin()) rateLimit('upload', 60, 3600);
    }
    respond(['path' => handleImageUpload($category)], 201);
}
