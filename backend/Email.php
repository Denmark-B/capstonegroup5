<?php
// ============================================================
// Email.php — verified recovery e-mails + "forgot password" links.
//
//   GET  ?action=verify&token=…        (link in the e-mail → HTML page)
//   GET  ?action=status                (logged in) my recovery e-mail
//   POST ?action=set_email             (logged in) {email,currentPassword}
//   POST ?action=resend                (logged in) resend verification
//   GET  ?action=list                  (admin) every account's e-mail status
//   POST ?action=admin_set_email       (admin) {brandId,email} for a merchant
//   POST ?action=forgot                (public) {accountType:'merchant',brandId}
//                                               {accountType:'admin',username}
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';
require_once __DIR__ . '/EmailLib.php';

$action = (string)($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

lf_start_session();

// ── VERIFY LINK (HTML page) ──────────────────────────────────
if ($method === 'GET' && $action === 'verify') {
    header('Content-Type: text/html; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: no-referrer');
    header('Cache-Control: no-store');
    $page = function (string $title, string $msg, bool $ok) {
        $c = $ok ? '#16a34a' : '#b91c1c';
        echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
           . '<meta name="robots" content="noindex"><title>' . htmlspecialchars($title) . ' — Lost &amp; Found</title></head>'
           . '<body style="font-family:Inter,Arial,sans-serif;background:#f6f4ef;margin:0;padding:48px 16px;color:#0c0b09">'
           . '<div style="max-width:520px;margin:0 auto;background:#fff;border:2px solid ' . $c . ';border-radius:14px;padding:30px">'
           . '<h1 style="margin:0 0 12px;font-size:1.5rem;color:' . $c . '">' . htmlspecialchars($title) . '</h1>'
           . '<p style="line-height:1.6">' . $msg . '</p>'
           . '<p><a href="../lostandfound.html" style="display:inline-block;margin-top:10px;background:#0c0b09;color:#fff;text-decoration:none;padding:11px 24px;border-radius:30px;font-weight:700">Go to Lost &amp; Found</a></p>'
           . '</div></body></html>';
        exit;
    };
    try { $pdo = lf_db(); lf_email_tables($pdo); }
    catch (Throwable $e) { $page('Server error', 'The database is not available. Start MySQL and try the link again.', false); }

    $tok = lf_find_token($pdo, (string)($_GET['token'] ?? ''), 'verify');
    if (!$tok) $page('Link expired or already used', 'This verification link is no longer valid. Log in and click <b>Resend verification</b> in the Security tab to get a new one.', false);

    $pdo->beginTransaction();
    $pdo->prepare("UPDATE email_tokens SET used_at=NOW() WHERE id=?")->execute([$tok['id']]);
    $pdo->prepare("INSERT INTO account_emails (account_type, account_id, email, verified_at, pending_email) VALUES (?,?,?,NOW(),NULL)
                   ON DUPLICATE KEY UPDATE email=VALUES(email), verified_at=NOW(),
                   pending_email=IF(pending_email=VALUES(email), NULL, pending_email)")
        ->execute([$tok['account_type'], $tok['account_id'], $tok['email']]);
    $pdo->prepare("INSERT INTO notifications (audience, merchant_id, icon, text, target) VALUES ('merchant', ?, 'check', ?, NULL)")
        ->execute([$tok['account_type'] === 'admin' ? 'lostandfound' : $tok['account_id'], 'Recovery email verified: ' . lf_mask_email($tok['email'])]);
    $pdo->commit();
    $page('Email verified ✓', 'Your recovery email <b>' . htmlspecialchars($tok['email']) . '</b> is now verified for the '
        . ($tok['account_type'] === 'admin' ? 'admin account' : 'merchant account <b>' . htmlspecialchars(lf_account_name($pdo, $tok['account_type'], $tok['account_id'])) . '</b>')
        . '. If you ever forget your password, a reset link will be sent here.', true);
}

// ── everything else is JSON ──────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
lf_send_cors_headers();
if ($method === 'OPTIONS') { http_response_code(204); exit; }
set_exception_handler(function ($e) {
    error_log('[lostfound email] ' . $e->getMessage());
    respond(['error' => 'Server error. Please try again.'], 500);
});
try { $pdo = lf_db(); } catch (PDOException $e) { respond(['error' => 'Cannot connect to the database. Start MySQL in XAMPP.'], 503); }
requireCsrf();
lf_email_tables($pdo);

function lf_mail_result(array $r): array {
    $out = ['mailMode' => $r['mode']];
    if ($r['mode'] === 'outbox' && lf_is_local_request()) $out['devOutbox'] = true;   // only shown on your own PC
    return $out;
}

// ── FORGOT PASSWORD (public) ─────────────────────────────────
if ($method === 'POST' && $action === 'forgot') {
    rateLimit('forgot_pw', 5, 3600);
    $b    = input();
    $type = ($b['accountType'] ?? '') === 'admin' ? 'admin' : 'merchant';

    if ($type === 'admin') {
        $generic = ['ok' => true, 'sent' => true,
            'message' => 'If that admin username is correct, a password reset link has been sent to the trusted email linked to the admin account. It expires in 30 minutes.'];
        $user = trim((string)($b['username'] ?? ''));
        $st = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key='admin_username'");
        $st->execute();
        $real = (string)$st->fetchColumn();
        if ($user === '' || $real === '' || !hash_equals($real, $user)) respond($generic);   // never reveal wrong usernames
        $row = lf_get_email_row($pdo, 'admin', 'lostandfound');
        if (!$row['email'] || !$row['verified_at']) respond($generic);
        if (lf_count_recent_tokens($pdo, 'admin', 'lostandfound', 'reset', 60) >= 3) respond($generic);
        $r = lf_send_reset($pdo, 'admin', 'lostandfound', $row['email']);
        respond($generic + lf_mail_result($r));
    }

    $brandId = strtolower(trim((string)($b['brandId'] ?? '')));
    $st = $pdo->prepare("SELECT name FROM brands WHERE id=? AND id<>'lostandfound'");
    $st->execute([$brandId]);
    $brandName = $st->fetchColumn();
    if ($brandName === false) respond(['error' => 'Please choose your brand.'], 400);

    $row = lf_get_email_row($pdo, 'merchant', $brandId);
    if (!$row['email'] || !$row['verified_at']) {
        respond(['ok' => true, 'sent' => false, 'noVerifiedEmail' => true,
            'message' => "$brandName has no verified recovery email yet, so a reset link can't be emailed. You can ask the admin to reset your password instead."]);
    }
    if (lf_count_recent_tokens($pdo, 'merchant', $brandId, 'reset', 60) >= 3) {
        respond(['error' => 'A reset link was already sent several times in the last hour. Check your inbox and spam folder, or try again later.'], 429);
    }
    $r = lf_send_reset($pdo, 'merchant', $brandId, $row['email']);
    if (!$r['sent']) respond(['error' => $r['error'] ?? 'The email could not be sent.'], 502);
    respond(['ok' => true, 'sent' => true, 'maskedEmail' => lf_mask_email($row['email']),
        'message' => 'A password reset link has been sent to your trusted email (' . lf_mask_email($row['email']) . ') linked to the merchant account ' . $brandName . '. It expires in 30 minutes.']
        + lf_mail_result($r));
}

// ── logged-in actions ────────────────────────────────────────
requireLogin();
$isAdmin = isLoggedInAsAdmin();
$type    = $isAdmin ? 'admin' : 'merchant';
$id      = $isAdmin ? 'lostandfound' : (string)currentMerchantId();

function lf_status(PDO $pdo, string $type, string $id): array {
    $r = lf_get_email_row($pdo, $type, $id);
    return ['email' => $r['email'], 'verified' => (bool)($r['email'] && $r['verified_at']),
            'verifiedAt' => $r['verified_at'], 'pendingEmail' => $r['pending_email'],
            'smtpConfigured' => lf_smtp_configured()];
}

if ($method === 'GET' && $action === 'status') respond(lf_status($pdo, $type, $id));

if ($method === 'POST' && $action === 'set_email') {
    rateLimit('set_email', 6, 3600);
    $b = input();
    $email = lf_clean_email($b['email'] ?? '');
    if ($email === '') respond(['error' => 'Please enter a valid email address.'], 400);
    // confirm it's really the account owner
    if ($isAdmin) {
        $st = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key='admin_password'");
        $st->execute();
        $hash = $st->fetchColumn();
    } else {
        $st = $pdo->prepare("SELECT password FROM brands WHERE id=?");
        $st->execute([$id]);
        $hash = $st->fetchColumn();
    }
    if (!verifyPassword((string)($b['currentPassword'] ?? ''), $hash ?: null)) respond(['error' => 'Current password is incorrect.'], 400);

    $cur = lf_get_email_row($pdo, $type, $id);
    if ($cur['email'] === $email && $cur['verified_at']) respond(['ok' => true, 'alreadyVerified' => true, 'message' => 'This email is already verified.'] + lf_status($pdo, $type, $id));

    $pdo->prepare("INSERT INTO account_emails (account_type, account_id, pending_email) VALUES (?,?,?)
                   ON DUPLICATE KEY UPDATE pending_email=VALUES(pending_email)")->execute([$type, $id, $email]);
    $r = lf_send_verification($pdo, $type, $id, $email);
    if (!$r['sent']) respond(['error' => $r['error'] ?? 'The email could not be sent.'], 502);
    respond(['ok' => true, 'message' => 'Verification link sent to ' . $email . '. Open it to finish.'] + lf_mail_result($r) + lf_status($pdo, $type, $id));
}

if ($method === 'POST' && $action === 'resend') {
    $cur = lf_get_email_row($pdo, $type, $id);
    if (!$cur['pending_email']) respond(['error' => 'There is no email waiting for verification.'], 400);
    if (lf_count_recent_tokens($pdo, $type, $id, 'verify', 60) >= 5) respond(['error' => 'Too many verification emails in the last hour. Please wait.'], 429);
    $r = lf_send_verification($pdo, $type, $id, $cur['pending_email']);
    if (!$r['sent']) respond(['error' => $r['error'] ?? 'The email could not be sent.'], 502);
    respond(['ok' => true, 'message' => 'Verification link sent again to ' . $cur['pending_email'] . '.'] + lf_mail_result($r));
}

// ── admin-only ───────────────────────────────────────────────
if ($method === 'GET' && $action === 'list') {
    requireAdmin();
    $rows = $pdo->query("SELECT b.id, b.name, e.email, e.verified_at, e.pending_email
                         FROM brands b LEFT JOIN account_emails e ON e.account_type='merchant' AND e.account_id=b.id
                         WHERE b.id<>'lostandfound' ORDER BY b.name")->fetchAll();
    $admin = lf_get_email_row($pdo, 'admin', 'lostandfound');
    respond([
        'admin' => ['email' => $admin['email'], 'verified' => (bool)($admin['email'] && $admin['verified_at']), 'pendingEmail' => $admin['pending_email']],
        'merchants' => array_map(function ($r) {
            return ['brandId' => $r['id'], 'name' => $r['name'], 'email' => $r['email'],
                    'verified' => (bool)($r['email'] && $r['verified_at']), 'pendingEmail' => $r['pending_email']];
        }, $rows),
        'smtpConfigured' => lf_smtp_configured(),
    ]);
}

if ($method === 'POST' && $action === 'admin_set_email') {
    requireAdmin();
    $b = input();
    $brandId = strtolower(trim((string)($b['brandId'] ?? '')));
    $email = lf_clean_email($b['email'] ?? '');
    if ($email === '') respond(['error' => 'Please enter a valid email address.'], 400);
    $st = $pdo->prepare("SELECT 1 FROM brands WHERE id=? AND id<>'lostandfound'");
    $st->execute([$brandId]);
    if (!$st->fetch()) respond(['error' => 'Brand not found.'], 404);
    $pdo->prepare("INSERT INTO account_emails (account_type, account_id, pending_email) VALUES ('merchant',?,?)
                   ON DUPLICATE KEY UPDATE pending_email=VALUES(pending_email)")->execute([$brandId, $email]);
    $r = lf_send_verification($pdo, 'merchant', $brandId, $email);
    if (!$r['sent']) respond(['error' => $r['error'] ?? 'The email could not be sent.'], 502);
    respond(['ok' => true, 'message' => 'Verification link sent to ' . $email . '. The merchant must open it to verify.'] + lf_mail_result($r));
}

respond(['error' => 'Unknown action'], 400);
