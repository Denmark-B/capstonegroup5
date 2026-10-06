<?php
// ============================================================
// PasswordReset.php — "Forgot password?" for merchant accounts.
//
// The site has no e-mail server (XAMPP), so resets go through the
// admin, which is the safe way without e-mail:
//
//   1. Merchant clicks "Forgot password?" → sends a request
//        POST ?action=request            (public, rate-limited)
//   2. Admin sees it in the Security tab and clicks Reset
//        GET  ?action=list               (admin)
//        POST ?action=reset              (admin) → temporary password, shown once
//        POST ?action=reject             (admin)
//   3. Merchant logs in with the temporary password and is forced
//      to choose a new one (same as first login).
//
// Everything is saved in the database:
//   password_reset_requests (new table, created automatically)
//   password_changes        (reason 'admin_reset')
//   brands.password / must_change_password, notifications
//
// The ADMIN password can never be reset from the website.
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
lf_send_cors_headers();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

set_exception_handler(function ($e) {
    error_log('[lostfound reset] ' . $e->getMessage());
    respond(['error' => 'Server error. Please try again.'], 500);
});

lf_start_session();
try {
    $pdo = lf_db();
} catch (PDOException $e) {
    respond(['error' => 'Cannot connect to the database. Start MySQL in XAMPP.'], 503);
}
requireCsrf();

// ── tables (created automatically, same text collation as `brands`) ──
$coll = $pdo->query("SELECT COLLATION_NAME FROM information_schema.COLUMNS
                     WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='brands' AND COLUMN_NAME='id'")->fetchColumn();
$coll = preg_match('/^utf8mb4_[a-z0-9_]+$/', (string)$coll) ? $coll : 'utf8mb4_unicode_ci';
$pdo->exec("CREATE TABLE IF NOT EXISTS password_reset_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id VARCHAR(50) NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    contact_info VARCHAR(150) NOT NULL,
    message TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    ip VARCHAR(45) NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_prr_status (status, requested_at),
    INDEX idx_prr_brand (brand_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=$coll");
$pdo->exec("CREATE TABLE IF NOT EXISTS password_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_type ENUM('merchant','admin') NOT NULL,
    account_id VARCHAR(50) NOT NULL,
    reason VARCHAR(20) NOT NULL DEFAULT 'voluntary',
    ip VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pwc_account (account_type, account_id, changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=$coll");

$action = (string)($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function notifyReset(PDO $pdo, string $merchantId, string $text): void {
    $pdo->prepare("INSERT INTO notifications (audience, merchant_id, icon, text, target) VALUES ('merchant', ?, 'key', ?, NULL)")
        ->execute([$merchantId, mb_substr($text, 0, 500)]);
}

// ── 1. MERCHANT: send a reset request (no login) ─────────────
if ($method === 'POST' && $action === 'request') {
    rateLimit('pw_reset_request', 3, 3600);                 // max 3 requests per hour per browser
    $b       = input();
    $brandId = strtolower(trim((string)($b['brandId'] ?? '')));
    $name    = requireText($b, 'name', 'Your name', 150);
    $contact = requireText($b, 'contact', 'Phone number or e-mail', 150);
    $message = cleanText($b['message'] ?? '', 1000, true);

    $st = $pdo->prepare("SELECT name FROM brands WHERE id=? AND id<>'lostandfound'");
    $st->execute([$brandId]);
    $brandName = $st->fetchColumn();
    if ($brandName === false) respond(['error' => 'Please choose your brand.'], 400);

    $st = $pdo->prepare("SELECT 1 FROM password_reset_requests WHERE brand_id=? AND status='pending' LIMIT 1");
    $st->execute([$brandId]);
    if ($st->fetch()) {
        respond(['ok' => true, 'alreadyPending' => true,
                 'message' => 'A reset request for this brand is already waiting. The admin will contact you.']);
    }

    $pdo->beginTransaction();
    $pdo->prepare("INSERT INTO password_reset_requests (brand_id, contact_name, contact_info, message, ip) VALUES (?,?,?,?,?)")
        ->execute([$brandId, $name, $contact, $message !== '' ? $message : null, clientIp()]);
    notifyReset($pdo, 'lostandfound', "Password reset request from $brandName");
    $pdo->commit();
    respond(['ok' => true, 'message' => 'Request sent. The admin will contact you with a temporary password.'], 201);
}

// everything below is admin-only
requireAdmin();

// ── 2. ADMIN: list requests ──────────────────────────────────
if ($method === 'GET' && $action === 'list') {
    $rows = $pdo->query("SELECT r.*, b.name AS brand_name FROM password_reset_requests r
                         LEFT JOIN brands b ON b.id = r.brand_id
                         ORDER BY (r.status='pending') DESC, r.requested_at DESC, r.id DESC LIMIT 50")->fetchAll();
    respond(array_map(function ($r) {
        return [
            'id' => (int)$r['id'], 'brandId' => $r['brand_id'], 'brandName' => $r['brand_name'] ?? $r['brand_id'],
            'name' => $r['contact_name'], 'contact' => $r['contact_info'], 'message' => $r['message'],
            'status' => $r['status'], 'requestedAt' => $r['requested_at'], 'resolvedAt' => $r['resolved_at'],
        ];
    }, $rows));
}

// ── 3. ADMIN: reset a merchant password → temporary password ─
if ($method === 'POST' && $action === 'reset') {
    $b         = input();
    $requestId = isset($b['requestId']) ? (int)$b['requestId'] : 0;
    $brandId   = strtolower(trim((string)($b['brandId'] ?? '')));

    if ($requestId > 0) {
        $st = $pdo->prepare("SELECT brand_id, status FROM password_reset_requests WHERE id=?");
        $st->execute([$requestId]);
        $req = $st->fetch();
        if (!$req) respond(['error' => 'Request not found.'], 404);
        if ($req['status'] !== 'pending') respond(['error' => 'This request was already handled.'], 409);
        $brandId = $req['brand_id'];
    }
    if ($brandId === '' || $brandId === 'lostandfound') respond(['error' => 'Choose a merchant brand.'], 400);

    $st = $pdo->prepare("SELECT name FROM brands WHERE id=?");
    $st->execute([$brandId]);
    $brandName = $st->fetchColumn();
    if ($brandName === false) respond(['error' => 'Brand not found.'], 404);

    $temp = randomTempPassword();
    $ua   = substr(cleanText($_SERVER['HTTP_USER_AGENT'] ?? '', 255), 0, 255);

    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE brands SET password=?, must_change_password=1 WHERE id=?")
            ->execute([hashPassword($temp), $brandId]);
        $pdo->prepare("INSERT INTO password_changes (account_type, account_id, reason, ip, user_agent) VALUES ('merchant', ?, 'admin_reset', ?, ?)")
            ->execute([$brandId, clientIp(), $ua]);
        // this resolves every pending request for the brand
        $pdo->prepare("UPDATE password_reset_requests SET status='completed', resolved_at=NOW() WHERE brand_id=? AND status='pending'")
            ->execute([$brandId]);
        // unlock the merchant if they were locked out by wrong guesses
        $pdo->prepare("DELETE FROM login_attempts WHERE login_key=? OR login_key=?")
            ->execute(['merchant:' . $brandId, 'pwchange:merchant:' . $brandId]);
        notifyReset($pdo, $brandId, 'Your password was reset by the admin. Log in with the temporary password and choose a new one.');
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
    respond(['ok' => true, 'brandId' => $brandId, 'brandName' => $brandName, 'tempPassword' => $temp]);
}

// ── 4. ADMIN: reject a request ───────────────────────────────
if ($method === 'POST' && $action === 'reject') {
    $b  = input();
    $id = (int)($b['requestId'] ?? 0);
    $st = $pdo->prepare("UPDATE password_reset_requests SET status='rejected', resolved_at=NOW() WHERE id=? AND status='pending'");
    $st->execute([$id]);
    if ($st->rowCount() === 0) respond(['error' => 'Request not found or already handled.'], 404);
    respond(['ok' => true]);
}

respond(['error' => 'Unknown action'], 400);
