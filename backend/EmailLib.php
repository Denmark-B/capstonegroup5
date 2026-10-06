<?php
// ============================================================
// EmailLib.php — shared code for verified recovery emails and
// password-reset links. Required by Email.php and ResetPassword.php.
//
// Sending mail:
//   • If SMTP is set in backend/config.local.php → real e-mail
//     (e.g. Gmail with an App Password) via PHPMailer.
//   • If not → the e-mail is saved as an .html file in
//     backend/mail_outbox/ so you can still test on XAMPP.
//
// Tokens: 32 random bytes, only the SHA-256 hash is stored,
// single use, short expiry (verify 24 h, reset 30 min).
// ============================================================

if (!defined('LF_APP')) { http_response_code(403); exit; }

require_once __DIR__ . '/lib/PHPMailer/Exception.php';
require_once __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/lib/PHPMailer/SMTP.php';

const LF_VERIFY_TTL_MIN = 24 * 60;
const LF_RESET_TTL_MIN  = 30;

// ── tables (created automatically, same collation as `brands`) ──
function lf_email_tables(PDO $pdo): void {
    static $done = false;
    if ($done) return;
    $coll = $pdo->query("SELECT COLLATION_NAME FROM information_schema.COLUMNS
                         WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='brands' AND COLUMN_NAME='id'")->fetchColumn();
    $coll = preg_match('/^utf8mb4_[a-z0-9_]+$/', (string)$coll) ? $coll : 'utf8mb4_unicode_ci';
    $pdo->exec("CREATE TABLE IF NOT EXISTS account_emails (
        account_type ENUM('merchant','admin') NOT NULL,
        account_id VARCHAR(50) NOT NULL,
        email VARCHAR(190) NULL,              -- verified recovery e-mail
        verified_at DATETIME NULL,
        pending_email VARCHAR(190) NULL,      -- new e-mail waiting for verification
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (account_type, account_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=$coll");
    $pdo->exec("CREATE TABLE IF NOT EXISTS email_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        account_type ENUM('merchant','admin') NOT NULL,
        account_id VARCHAR(50) NOT NULL,
        purpose ENUM('verify','reset') NOT NULL,
        token_hash CHAR(64) NOT NULL,
        email VARCHAR(190) NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        ip VARCHAR(45) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_token (token_hash),
        INDEX idx_tok_account (account_type, account_id, purpose, created_at)
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
    $done = true;
}

// ── helpers ──────────────────────────────────────────────────
function lf_clean_email($v): string {
    $e = strtolower(trim((string)$v));
    if (strlen($e) > 190 || !filter_var($e, FILTER_VALIDATE_EMAIL)) return '';
    return $e;
}
function lf_strlen(string $s): int {      // works with or without the mbstring extension
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : (int)preg_match_all('/./us', $s);
}
function lf_mask_email(?string $e): string {
    if (!$e || strpos($e, '@') === false) return '';
    [$user, $domain] = explode('@', $e, 2);
    $len   = lf_strlen($user);
    $shown = mb_substr($user, 0, min(2, max(1, $len - 1)));
    return $shown . str_repeat('•', max(3, $len - lf_strlen($shown))) . '@' . $domain;
}
function lf_account_name(PDO $pdo, string $type, string $id): string {
    if ($type === 'admin') return 'Admin';
    $st = $pdo->prepare("SELECT name FROM brands WHERE id=?");
    $st->execute([$id]);
    return (string)($st->fetchColumn() ?: $id);
}
function lf_get_email_row(PDO $pdo, string $type, string $id): array {
    $st = $pdo->prepare("SELECT email, verified_at, pending_email FROM account_emails WHERE account_type=? AND account_id=?");
    $st->execute([$type, $id]);
    return $st->fetch() ?: ['email' => null, 'verified_at' => null, 'pending_email' => null];
}

/** Public base URL of the site, e.g. http://localhost/lostandfound (no trailing slash). */
function lf_app_url(): string {
    $cfg = lf_config();
    if (!empty($cfg['app_url'])) return rtrim((string)$cfg['app_url'], '/');
    $scheme = lf_is_https() ? 'https' : 'http';
    $host   = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? ($_SERVER['HTTP_HOST'] ?? 'localhost');
    $host   = preg_replace('/[^A-Za-z0-9.\-:\[\]]/', '', (string)$host);
    $dir    = rtrim(str_replace('\\', '/', dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/backend/x.php'))), '/');
    return $scheme . '://' . $host . $dir;
}

// ── tokens ───────────────────────────────────────────────────
function lf_issue_token(PDO $pdo, string $type, string $id, string $purpose, string $email): string {
    $raw = bin2hex(random_bytes(32));
    $ttl = $purpose === 'reset' ? LF_RESET_TTL_MIN : LF_VERIFY_TTL_MIN;
    // older unused tokens of the same purpose stop working
    $pdo->prepare("UPDATE email_tokens SET used_at=NOW() WHERE account_type=? AND account_id=? AND purpose=? AND used_at IS NULL")
        ->execute([$type, $id, $purpose]);
    $pdo->prepare("INSERT INTO email_tokens (account_type, account_id, purpose, token_hash, email, expires_at, ip)
                   VALUES (?,?,?,?,?, NOW() + INTERVAL ? MINUTE, ?)")
        ->execute([$type, $id, $purpose, hash('sha256', $raw), $email, $ttl, clientIp()]);
    return $raw;
}
/** Returns the token row if valid (not used, not expired), else null. */
function lf_find_token(PDO $pdo, string $raw, string $purpose): ?array {
    if (!preg_match('/^[a-f0-9]{64}$/', $raw)) return null;
    $st = $pdo->prepare("SELECT * FROM email_tokens WHERE token_hash=? AND purpose=? AND used_at IS NULL AND expires_at > NOW()");
    $st->execute([hash('sha256', $raw), $purpose]);
    return $st->fetch() ?: null;
}
function lf_count_recent_tokens(PDO $pdo, string $type, string $id, string $purpose, int $minutes): int {
    $st = $pdo->prepare("SELECT COUNT(*) FROM email_tokens WHERE account_type=? AND account_id=? AND purpose=? AND created_at > NOW() - INTERVAL ? MINUTE");
    $st->execute([$type, $id, $purpose, $minutes]);
    return (int)$st->fetchColumn();
}

// ── sending mail ─────────────────────────────────────────────
function lf_smtp_configured(): bool {
    $c = lf_config();
    return !empty($c['smtp_host']) && !empty($c['smtp_user']) && !empty($c['smtp_pass']);
}
function lf_is_local_request(): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    return in_array($ip, ['127.0.0.1', '::1'], true);
}

/** Returns ['sent'=>bool, 'mode'=>'smtp'|'outbox', 'error'=>?string]. */
function lf_send_mail(string $to, string $subject, string $html, string $text): array {
    $cfg = lf_config();
    if (!lf_smtp_configured()) {
        $dir = __DIR__ . '/mail_outbox';
        if (!is_dir($dir)) @mkdir($dir, 0755, true);
        $name = date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.html';
        $ok = @file_put_contents($dir . '/' . $name,
            "<!-- To: $to | Subject: " . htmlspecialchars($subject, ENT_QUOTES) . " -->\n"
            . '<p style="font:13px monospace;background:#fef3c7;padding:8px">TEST OUTBOX — To: ' . htmlspecialchars($to, ENT_QUOTES)
            . ' · Subject: ' . htmlspecialchars($subject, ENT_QUOTES) . '</p>' . $html) !== false;
        return ['sent' => $ok, 'mode' => 'outbox', 'error' => $ok ? null : 'Could not write to backend/mail_outbox'];
    }
    try {
        $m = new PHPMailer\PHPMailer\PHPMailer(true);
        $m->isSMTP();
        $m->Host       = (string)$cfg['smtp_host'];
        $m->Port       = (int)($cfg['smtp_port'] ?? 587);
        $m->SMTPAuth   = true;
        $m->Username   = (string)$cfg['smtp_user'];
        $m->Password   = (string)$cfg['smtp_pass'];
        $secure        = strtolower((string)($cfg['smtp_secure'] ?? 'tls'));
        $m->SMTPSecure = $secure === 'ssl' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
                       : ($secure === 'none' ? '' : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS);
        if ($secure === 'none') $m->SMTPAutoTLS = false;
        $m->Timeout    = 15;
        $m->getSMTPInstance()->Timelimit = 20;   // never freeze the page for long on a bad mail server
        $m->CharSet    = 'UTF-8';
        $m->setFrom((string)($cfg['mail_from'] ?? $cfg['smtp_user']), (string)($cfg['mail_from_name'] ?? 'Lost & Found Batangas'));
        $m->addAddress($to);
        $m->Subject = $subject;
        $m->isHTML(true);
        $m->Body    = $html;
        $m->AltBody = $text;
        $m->send();
        return ['sent' => true, 'mode' => 'smtp', 'error' => null];
    } catch (Throwable $e) {
        error_log('[lostfound mail] ' . $e->getMessage());
        return ['sent' => false, 'mode' => 'smtp', 'error' => 'The email could not be sent. Check the SMTP settings in backend/config.local.php.'];
    }
}

// ── templates ────────────────────────────────────────────────
function lf_mail_layout(string $title, string $intro, string $buttonText, string $url, string $footer): string {
    $h = function ($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); };
    return '<!DOCTYPE html><html><body style="margin:0;background:#f6f4ef;font-family:Arial,Helvetica,sans-serif;color:#0c0b09">'
         . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 12px">'
         . '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">'
         . '<tr><td style="background:#0c0b09;color:#ffffff;padding:22px 28px;font-size:20px;font-weight:bold;letter-spacing:1px">LOST &amp; FOUND · BATANGAS</td></tr>'
         . '<tr><td style="padding:28px">'
         . '<h1 style="font-size:22px;margin:0 0 14px">' . $h($title) . '</h1>'
         . '<p style="font-size:15px;line-height:1.6;margin:0 0 22px">' . $intro . '</p>'
         . '<p style="margin:0 0 22px"><a href="' . $h($url) . '" style="background:#0c0b09;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:30px;font-weight:bold;display:inline-block">' . $h($buttonText) . '</a></p>'
         . '<p style="font-size:12px;color:#6b6860;line-height:1.6;margin:0 0 6px">If the button doesn\'t work, copy this link into your browser:</p>'
         . '<p style="font-size:12px;word-break:break-all;margin:0 0 22px"><a href="' . $h($url) . '" style="color:#0c0b09">' . $h($url) . '</a></p>'
         . '<p style="font-size:12px;color:#6b6860;line-height:1.6;margin:0">' . $footer . '</p>'
         . '</td></tr></table></td></tr></table></body></html>';
}

function lf_send_verification(PDO $pdo, string $type, string $id, string $email): array {
    $raw  = lf_issue_token($pdo, $type, $id, 'verify', $email);
    $url  = lf_app_url() . '/backend/Email.php?action=verify&token=' . $raw;
    $name = lf_account_name($pdo, $type, $id);
    $who  = $type === 'admin' ? 'the <strong>admin account</strong>' : 'the merchant account <strong>' . htmlspecialchars($name, ENT_QUOTES) . '</strong>';
    $html = lf_mail_layout('Verify your recovery email',
        "Confirm that this is the trusted email for $who on Lost &amp; Found. Once verified, password reset links will be sent here.",
        'Verify email', $url, 'This link expires in 24 hours. If you didn\'t request this, you can ignore this email.');
    $text = "Verify your recovery email for $name on Lost & Found:\n$url\n\nThis link expires in 24 hours.";
    return lf_send_mail($email, 'Verify your recovery email — Lost & Found', $html, $text);
}

function lf_send_reset(PDO $pdo, string $type, string $id, string $email): array {
    $raw  = lf_issue_token($pdo, $type, $id, 'reset', $email);
    $url  = lf_app_url() . '/backend/ResetPassword.php?token=' . $raw;
    $name = lf_account_name($pdo, $type, $id);
    $who  = $type === 'admin' ? 'the <strong>admin account</strong>' : 'the merchant account <strong>' . htmlspecialchars($name, ENT_QUOTES) . '</strong>';
    $html = lf_mail_layout('Reset your password',
        "Someone (hopefully you) asked to reset the password for $who on Lost &amp; Found. Click the button to choose a new password.",
        'Reset password', $url, 'This link expires in 30 minutes and works once. If you didn\'t ask for this, ignore this email — your password stays the same.');
    $text = "Reset the password for $name on Lost & Found:\n$url\n\nThis link expires in 30 minutes and works once.";
    return lf_send_mail($email, 'Reset your password — Lost & Found', $html, $text);
}
