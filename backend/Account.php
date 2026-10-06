<?php
// ============================================================
// Account.php — change password + password history.
//   backend/Account.php?action=status          (GET)
//   backend/Account.php?action=history         (GET, admin: &all=1)
//   backend/Account.php?action=change_password (POST)
//
// Every successful password change is saved in the database:
//   • brands.password (or the admin password) → new bcrypt hash
//   • password_changes table → who, when, why, IP, browser
//   • notifications → the merchant and the admin both get a notice
//
// Uses the same session, CSRF protection, password rules and
// lockout as Api.php. Api.php itself is not modified.
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
lf_send_cors_headers();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

set_exception_handler(function ($e) {
    error_log('[lostfound account] ' . $e->getMessage());
    respond(['error' => 'Server error. Please try again.'], 500);
});

lf_start_session();
try {
    $pdo = lf_db();
} catch (PDOException $e) {
    respond(['error' => 'Cannot connect to the database. Start MySQL in XAMPP.'], 503);
}
requireCsrf();

// The history table is created automatically the first time (no manual SQL needed).
// It copies the text collation of your brands table so the two can be joined on any MySQL/MariaDB.
$coll = $pdo->query("SELECT COLLATION_NAME FROM information_schema.COLUMNS
                     WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='brands' AND COLUMN_NAME='id'")->fetchColumn();
$coll = preg_match('/^utf8mb4_[a-z0-9_]+$/', (string)$coll) ? $coll : 'utf8mb4_unicode_ci';
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

requireLogin();
$isAdmin     = isLoggedInAsAdmin();
$accountType = $isAdmin ? 'admin' : 'merchant';
$accountId   = $isAdmin ? 'lostandfound' : (string)currentMerchantId();

function accountName(PDO $pdo, string $id): string {
    $st = $pdo->prepare("SELECT name FROM brands WHERE id=?");
    $st->execute([$id]);
    return (string)($st->fetchColumn() ?: $id);
}

function lastChange(PDO $pdo, string $type, string $id): array {
    $st = $pdo->prepare("SELECT COUNT(*) AS n, MAX(changed_at) AS last FROM password_changes WHERE account_type=? AND account_id=?");
    $st->execute([$type, $id]);
    $r = $st->fetch();
    return ['changeCount' => (int)$r['n'], 'lastChanged' => $r['last']];
}

// ── STATUS ───────────────────────────────────────────────────
if ($method === 'GET' && $action === 'status') {
    respond(array_merge([
        'accountType' => $accountType,
        'accountId'   => $accountId,
        'name'        => $isAdmin ? 'Admin' : accountName($pdo, $accountId),
        'mustChange'  => mustChangePassword(),
    ], lastChange($pdo, $accountType, $accountId)));
}

// ── HISTORY ──────────────────────────────────────────────────
if ($method === 'GET' && $action === 'history') {
    $map = function ($r) {
        return [
            'accountType' => $r['account_type'],
            'accountId'   => $r['account_id'],
            'name'        => $r['account_type'] === 'admin' ? 'Admin' : ($r['name'] ?? $r['account_id']),
            'reason'      => $r['reason'],
            'ip'          => $r['ip'],
            'browser'     => $r['user_agent'],
            'changedAt'   => $r['changed_at'],
        ];
    };
    if ($isAdmin && !empty($_GET['all'])) {
        $rows = $pdo->query("SELECT pc.*, b.name FROM password_changes pc
                             LEFT JOIN brands b ON b.id = pc.account_id AND pc.account_type='merchant'
                             ORDER BY pc.changed_at DESC, pc.id DESC LIMIT 100")->fetchAll();
    } else {
        $st = $pdo->prepare("SELECT pc.*, b.name FROM password_changes pc
                             LEFT JOIN brands b ON b.id = pc.account_id
                             WHERE pc.account_type=? AND pc.account_id=?
                             ORDER BY pc.changed_at DESC, pc.id DESC LIMIT 20");
        $st->execute([$accountType, $accountId]);
        $rows = $st->fetchAll();
    }
    respond(array_map($map, $rows));
}

// ── CHANGE PASSWORD ──────────────────────────────────────────
if ($method === 'POST' && $action === 'change_password') {
    $b       = input();
    $cur     = (string)($b['currentPassword'] ?? '');
    $new     = (string)($b['newPassword'] ?? '');
    $confirm = array_key_exists('confirmPassword', $b) ? (string)$b['confirmPassword'] : $new;
    $lockKey = 'pwchange:' . $accountType . ':' . $accountId;

    if ($sec = loginLockRemaining($pdo, $lockKey)) {
        respond(['ok' => false, 'error' => 'Too many wrong current passwords. Try again in ' . max(1, (int)ceil($sec / 60)) . ' minute(s).'], 429);
    }
    if ($cur === '')              respond(['ok' => false, 'error' => 'Enter your current password.'], 400);
    if ($err = passwordStrengthError($new)) respond(['ok' => false, 'error' => $err], 400);
    if (isBannedPassword($new))   respond(['ok' => false, 'error' => 'That password is not allowed.'], 400);
    if ($new !== $confirm)        respond(['ok' => false, 'error' => 'The new passwords do not match.'], 400);
    if ($new === $cur)            respond(['ok' => false, 'error' => 'New password must be different from the current one.'], 400);

    // current stored hash
    if ($isAdmin) {
        $st = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key='admin_password'");
        $st->execute();
        $stored = $st->fetchColumn();
        $wasForced = false;
    } else {
        $st = $pdo->prepare("SELECT password, must_change_password FROM brands WHERE id=?");
        $st->execute([$accountId]);
        $row = $st->fetch();
        if (!$row) respond(['ok' => false, 'error' => 'Account not found.'], 404);
        $stored = $row['password'];
        $wasForced = (bool)$row['must_change_password'];
    }
    if (!verifyPassword($cur, $stored ?: null)) {
        recordLoginFailure($pdo, $lockKey);
        respond(['ok' => false, 'error' => 'Current password is incorrect.'], 400);
    }
    clearLoginFailures($pdo, $lockKey);

    $reason = $wasForced ? 'first_login' : 'voluntary';
    $name   = $isAdmin ? 'Admin' : accountName($pdo, $accountId);
    $ua     = substr(cleanText($_SERVER['HTTP_USER_AGENT'] ?? '', 255), 0, 255);

    $pdo->beginTransaction();
    try {
        if ($isAdmin) {
            $pdo->prepare("UPDATE site_settings SET setting_value=? WHERE setting_key='admin_password'")
                ->execute([hashPassword($new)]);
        } else {
            $pdo->prepare("UPDATE brands SET password=?, must_change_password=0 WHERE id=?")
                ->execute([hashPassword($new), $accountId]);
        }
        $pdo->prepare("INSERT INTO password_changes (account_type, account_id, reason, ip, user_agent) VALUES (?,?,?,?,?)")
            ->execute([$accountType, $accountId, $reason, clientIp(), $ua]);

        $notif = $pdo->prepare("INSERT INTO notifications (audience, merchant_id, icon, text, target) VALUES ('merchant', ?, 'key', ?, NULL)");
        if ($isAdmin) {
            $notif->execute(['lostandfound', 'Admin password was changed']);
        } else {
            $notif->execute([$accountId, 'Your password was changed' . ($wasForced ? ' (first login)' : '')]);
            $notif->execute(['lostandfound', $name . ' changed their password']);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }

    // keep the user logged in, but with a fresh session id and CSRF token
    session_regenerate_id(true);
    $_SESSION['must_change'] = false;

    respond(array_merge([
        'ok'                 => true,
        'message'            => 'Password changed and saved.',
        'reason'             => $reason,
        'mustChangePassword' => false,
        'csrfToken'          => rotateCsrfToken(),
    ], lastChange($pdo, $accountType, $accountId)));
}

respond(['error' => 'Unknown action'], 400);
