<?php
// ============================================================
// MailSettings.php — lets the ADMIN turn on real e-mail sending
// from the website (no file editing needed).
//
//   GET  ?action=status   → is sending set up? (never returns the password)
//   POST ?action=save     → {gmail, appPassword, testTo?}
//                           saves the settings into backend/config.local.php
//                           and sends a TEST e-mail; reports the exact error
//                           if Gmail refuses
//   POST ?action=remove   → back to test mode (mail_outbox)
//
// Admin only, CSRF-protected. Other settings already in
// config.local.php (database, app_url, …) are kept.
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';
require_once __DIR__ . '/EmailLib.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
lf_send_cors_headers();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }
set_exception_handler(function ($e) {
    error_log('[lostfound mailsettings] ' . $e->getMessage());
    respond(['error' => 'Server error. Please try again.'], 500);
});

lf_start_session();
try { $pdo = lf_db(); } catch (PDOException $e) { respond(['error' => 'Cannot connect to the database. Start MySQL in XAMPP.'], 503); }
requireCsrf();
requireLogin();
requireAdmin();
lf_email_tables($pdo);

const LF_LOCAL_CFG = __DIR__ . '/config.local.php';
$action = (string)($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function ms_read_local(): array {
    if (!is_file(LF_LOCAL_CFG)) return [];
    $a = include LF_LOCAL_CFG;
    return is_array($a) ? $a : [];
}
function ms_write_local(array $cfg): void {
    $dir = dirname(LF_LOCAL_CFG);
    if (is_file(LF_LOCAL_CFG)) @copy(LF_LOCAL_CFG, LF_LOCAL_CFG . '.bak');   // keep one backup
    $php = "<?php\n// backend/config.local.php — written by the admin Security tab (MailSettings.php).\n"
         . "// Private settings: never upload this file to GitHub.\nreturn " . var_export($cfg, true) . ";\n";
    $tmp = $dir . '/config.local.tmp.' . bin2hex(random_bytes(4));
    if (@file_put_contents($tmp, $php, LOCK_EX) === false || !@rename($tmp, LF_LOCAL_CFG)) {
        @unlink($tmp);
        respond(['error' => 'The server could not write backend/config.local.php. Check that the backend folder is writable.'], 500);
    }
    if (function_exists('opcache_invalidate')) @opcache_invalidate(LF_LOCAL_CFG, true);
}

/** Sends one message with the given SMTP settings and returns [ok, errorText]. */
function ms_try_send(array $s, string $to, string $subject, string $html, string $text): array {
    try {
        $m = new PHPMailer\PHPMailer\PHPMailer(true);
        $m->isSMTP();
        $m->Host = $s['smtp_host']; $m->Port = (int)$s['smtp_port'];
        $m->SMTPAuth = true; $m->Username = $s['smtp_user']; $m->Password = $s['smtp_pass'];
        $sec = $s['smtp_secure'];
        $m->SMTPSecure = $sec === 'ssl' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
                       : ($sec === 'none' ? '' : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS);
        if ($sec === 'none') $m->SMTPAutoTLS = false;
        $m->Timeout = 15;
        $m->getSMTPInstance()->Timelimit = 20;
        $m->CharSet = 'UTF-8';
        $m->setFrom($s['mail_from'], $s['mail_from_name']);
        $m->addAddress($to);
        $m->Subject = $subject; $m->isHTML(true); $m->Body = $html; $m->AltBody = $text;
        $m->send();
        return [true, null];
    } catch (Throwable $e) {
        $raw = isset($m) && $m->ErrorInfo ? $m->ErrorInfo : $e->getMessage();
        return [false, (string)$raw];
    }
}

/** Turns technical SMTP errors into plain advice. */
function ms_explain(string $raw): string {
    $r = strtolower($raw);
    if (strpos($r, 'could not authenticate') !== false || strpos($r, 'username and password not accepted') !== false || strpos($r, '535') !== false)
        return 'Gmail rejected the login. Use the 16-letter App Password from myaccount.google.com/apppasswords (not your normal Gmail password), and make sure 2-Step Verification is ON for that Gmail.';
    if (strpos($r, 'could not connect') !== false || strpos($r, 'connection') !== false || strpos($r, 'timed out') !== false)
        return 'Could not reach Gmail\'s mail server. Check your internet connection, or a firewall/antivirus blocking port 587.';
    if (strpos($r, 'openssl') !== false || strpos($r, 'starttls') !== false || strpos($r, 'tls') !== false)
        return 'Secure connection failed. In C:\\xampp\\php\\php.ini make sure the line "extension=openssl" has no ";" in front, then restart the server.';
    return 'Sending failed: ' . mb_substr(strip_tags($raw), 0, 200);
}

// ── STATUS ───────────────────────────────────────────────────
if ($method === 'GET' && $action === 'status') {
    $c = lf_config();
    respond([
        'configured' => lf_smtp_configured(),
        'gmail'      => lf_smtp_configured() ? (string)($c['smtp_user'] ?? '') : null,
        'host'       => lf_smtp_configured() ? (string)($c['smtp_host'] ?? '') : null,
        'writable'   => is_writable(is_file(LF_LOCAL_CFG) ? LF_LOCAL_CFG : dirname(LF_LOCAL_CFG)),
    ]);
}

// ── SAVE + TEST ──────────────────────────────────────────────
if ($method === 'POST' && $action === 'save') {
    rateLimit('mail_settings', 10, 3600);
    $b = input();
    $gmail = lf_clean_email($b['gmail'] ?? '');
    $pass  = preg_replace('/\s+/', '', (string)($b['appPassword'] ?? ''));   // App Passwords are shown with spaces
    if ($gmail === '') respond(['error' => 'Enter the Gmail address that will send the emails.'], 400);
    if (!preg_match('/^[A-Za-z0-9]{8,64}$/', $pass)) respond(['error' => 'Enter the App Password (16 letters, spaces are removed automatically).'], 400);

    // advanced (optional): another SMTP provider; Gmail by default
    $host = trim((string)($b['host'] ?? 'smtp.gmail.com'));
    if (!preg_match('/^[A-Za-z0-9.-]{3,190}$/', $host)) respond(['error' => 'Invalid mail server name.'], 400);
    $port = (int)($b['port'] ?? 587);
    if ($port < 1 || $port > 65535) respond(['error' => 'Invalid port.'], 400);
    $secure = in_array(($b['secure'] ?? 'tls'), ['tls', 'ssl', 'none'], true) ? $b['secure'] ?? 'tls' : 'tls';

    $settings = ['smtp_host' => $host, 'smtp_port' => $port, 'smtp_secure' => $secure, 'smtp_user' => $gmail,
                 'smtp_pass' => $pass, 'mail_from' => $gmail, 'mail_from_name' => 'Lost & Found Batangas'];

    // send the test first — only save settings that actually work
    $to = lf_clean_email($b['testTo'] ?? '') ?: (lf_get_email_row($pdo, 'admin', 'lostandfound')['email'] ?: $gmail);
    $html = lf_mail_layout('Email sending works!',
        'Your Lost &amp; Found website can now send real emails (verification and password reset links).',
        'Open Lost & Found', lf_app_url() . '/', 'Sent as a test from the admin Security tab.');
    [$ok, $err] = ms_try_send($settings, $to, 'Test email — Lost & Found', $html, "Your Lost & Found website can now send real emails.");
    if (!$ok) respond(['ok' => false, 'error' => ms_explain((string)$err), 'detail' => mb_substr((string)$err, 0, 300)], 400);

    ms_write_local(array_merge(ms_read_local(), $settings));
    // links created in test mode only exist as files — clear them so "Resend" works right away
    $pdo->exec("DELETE FROM email_tokens WHERE purpose='verify' AND used_at IS NULL");
    respond(['ok' => true, 'message' => 'Saved! A test email was sent to ' . $to . '. From now on, emails go to real inboxes.', 'sentTo' => $to]);
}

// ── REMOVE (back to test mode) ───────────────────────────────
if ($method === 'POST' && $action === 'remove') {
    $cfg = ms_read_local();
    foreach (['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'mail_from', 'mail_from_name'] as $k) unset($cfg[$k]);
    ms_write_local($cfg);
    respond(['ok' => true, 'message' => 'Email sending turned off. Emails are saved in backend/mail_outbox again (test mode).']);
}

respond(['error' => 'Unknown action'], 400);
