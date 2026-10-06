<?php
// ============================================================
// ResetPassword.php — the page the "Reset password" e-mail opens.
//   GET  ?token=…   → form (new password + repeat)
//   POST           → saves the new password (bcrypt), the link is
//                    used up, the change is logged, lockouts cleared.
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';
require_once __DIR__ . '/EmailLib.php';

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');
lf_start_session();

function rp_h($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function rp_page(string $title, string $body, string $tone = 'neutral'): void {
    $c = ['neutral' => '#0c0b09', 'ok' => '#16a34a', 'bad' => '#b91c1c'][$tone] ?? '#0c0b09';
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
       . '<meta name="robots" content="noindex"><title>' . rp_h($title) . ' — Lost &amp; Found</title><style>'
       . 'body{font-family:Inter,Arial,sans-serif;background:#f6f4ef;margin:0;padding:48px 16px;color:#0c0b09}'
       . '.card{max-width:480px;margin:0 auto;background:#fff;border:2px solid ' . $c . ';border-radius:14px;padding:30px}'
       . 'h1{margin:0 0 12px;font-size:1.5rem;color:' . $c . '}label{display:block;font-weight:600;margin:14px 0 6px;font-size:.92rem}'
       . 'input{width:100%;box-sizing:border-box;padding:11px 12px;border:1.5px solid #d6d3cc;border-radius:8px;font-size:1rem}'
       . 'button,.btn{display:inline-block;margin-top:18px;background:#0c0b09;color:#fff;border:0;border-radius:30px;padding:12px 26px;font-weight:700;cursor:pointer;font-size:.95rem;text-decoration:none}'
       . '.warn{background:#fef2f2;border:1px solid #b91c1c;color:#991b1b;padding:11px;border-radius:8px;font-size:.9rem}.hint{color:#6b6860;font-size:.85rem}'
       . '</style></head><body><div class="card"><h1>' . rp_h($title) . '</h1>' . $body . '</div></body></html>';
    exit;
}

try { $pdo = lf_db(); lf_email_tables($pdo); }
catch (Throwable $e) { rp_page('Server error', '<p>The database is not available. Start MySQL and open the link again.</p>', 'bad'); }

$raw = (string)($_POST['token'] ?? $_GET['token'] ?? '');
$tok = lf_find_token($pdo, $raw, 'reset');
if (!$tok) {
    rp_page('Link expired or already used',
        '<p>This password reset link is no longer valid. Links expire after 30 minutes and work only once.</p>'
      . '<p>Go back to the website and click <b>Forgot password?</b> to get a new link.</p>'
      . '<a class="btn" href="../lostandfound.html">Go to Lost &amp; Found</a>', 'bad');
}
$type = $tok['account_type'];
$id   = $tok['account_id'];
$name = lf_account_name($pdo, $type, $id);
$who  = $type === 'admin' ? 'the admin account' : 'merchant account <b>' . rp_h($name) . '</b>';

$error = '';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $pass = (string)($_POST['password'] ?? '');
    $conf = (string)($_POST['confirm'] ?? '');
    if (!hash_equals(csrfToken(), (string)($_POST['csrf'] ?? ''))) $error = 'Form expired. Please try again.';
    elseif ($err = passwordStrengthError($pass)) $error = $err;
    elseif (isBannedPassword($pass)) $error = 'That password is not allowed.';
    elseif ($pass !== $conf) $error = 'The two passwords do not match.';
    else {
        $ua = substr(cleanText($_SERVER['HTTP_USER_AGENT'] ?? '', 255), 0, 255);
        $pdo->beginTransaction();
        try {
            // re-check inside the transaction so the link can't be used twice at the same moment
            $st = $pdo->prepare("UPDATE email_tokens SET used_at=NOW() WHERE id=? AND used_at IS NULL");
            $st->execute([$tok['id']]);
            if ($st->rowCount() !== 1) throw new RuntimeException('used');
            if ($type === 'admin') {
                $pdo->prepare("UPDATE site_settings SET setting_value=? WHERE setting_key='admin_password'")->execute([hashPassword($pass)]);
            } else {
                $pdo->prepare("UPDATE brands SET password=?, must_change_password=0 WHERE id=?")->execute([hashPassword($pass), $id]);
            }
            $pdo->prepare("UPDATE email_tokens SET used_at=NOW() WHERE account_type=? AND account_id=? AND purpose='reset' AND used_at IS NULL")
                ->execute([$type, $id]);
            $pdo->prepare("INSERT INTO password_changes (account_type, account_id, reason, ip, user_agent) VALUES (?,?, 'email_reset', ?, ?)")
                ->execute([$type, $id, clientIp(), $ua]);
            $keys = $type === 'admin'
                ? ['pwchange:admin:lostandfound']
                : ['merchant:' . $id, 'pwchange:merchant:' . $id];
            foreach ($keys as $k) $pdo->prepare("DELETE FROM login_attempts WHERE login_key=?")->execute([$k]);
            if ($type === 'admin') $pdo->exec("DELETE FROM login_attempts WHERE login_key LIKE 'admin:%'");
            $n = $pdo->prepare("INSERT INTO notifications (audience, merchant_id, icon, text, target) VALUES ('merchant', ?, 'key', ?, NULL)");
            $n->execute([$type === 'admin' ? 'lostandfound' : $id, 'Your password was reset using the link sent to ' . lf_mask_email($tok['email'])]);
            if ($type !== 'admin') $n->execute(['lostandfound', $name . ' reset their password by email']);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            if ($e->getMessage() === 'used') rp_page('Link already used', '<p>This link was just used. Go back and log in.</p><a class="btn" href="../lostandfound.html">Go to Lost &amp; Found</a>', 'bad');
            throw $e;
        }
        rotateCsrfToken();
        rp_page('Password changed ✓',
            '<p>The password for ' . $who . ' was changed and saved. You can now log in with your new password.</p>'
          . '<a class="btn" href="../lostandfound.html">Go to Lost &amp; Found and log in</a>', 'ok');
    }
}

rp_page('Choose a new password',
    '<p>Set a new password for ' . $who . '.</p>'
  . ($error ? '<p class="warn">' . rp_h($error) . '</p>' : '')
  . '<form method="post" autocomplete="off">'
  . '<input type="hidden" name="csrf" value="' . rp_h(csrfToken()) . '">'
  . '<input type="hidden" name="token" value="' . rp_h($raw) . '">'
  . '<label for="p">New password</label><input id="p" name="password" type="password" required minlength="10" maxlength="72" autocomplete="new-password">'
  . '<p class="hint">At least 10 characters, with letters and numbers.</p>'
  . '<label for="c">Repeat new password</label><input id="c" name="confirm" type="password" required minlength="10" maxlength="72" autocomplete="new-password">'
  . '<button type="submit">Save new password</button></form>'
  . '<p class="hint" style="margin-top:16px">This link expires 30 minutes after it was sent and works only once.</p>');
