<?php
// ============================================================
// Config.php — configuration, database connection, secure
// session start, password helpers and auth helpers.
//
// Nothing here prints output, so it can be shared by Api.php
// (JSON) and setup.php (HTML).
//
// HOSTING-READY: every setting can be overridden WITHOUT editing
// this file, either by environment variables (LF_DB_HOST, ...)
// or by creating backend/config.local.php (see
// config.local.example.php). On XAMPP the defaults just work.
// ============================================================

if (!defined('LF_APP')) define('LF_APP', true);

// ── Fallbacks for hosts without the PHP "mbstring" extension ──
// (XAMPP has it; some cheap shared hosts don't.)
if (!function_exists('mb_check_encoding')) {
    function mb_check_encoding($s, $enc = null) { return (bool)preg_match('//u', (string)$s); }
}
if (!function_exists('mb_convert_encoding')) {
    function mb_convert_encoding($s, $to, $from = null) { return (string)iconv('UTF-8', 'UTF-8//IGNORE', (string)$s); }
}
if (!function_exists('mb_substr')) {
    function mb_substr($s, $start, $len = null, $enc = null) {
        $chars = preg_split('//u', (string)$s, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        return implode('', array_slice($chars, $start, $len));
    }
}
if (!function_exists('mb_strtoupper')) {
    function mb_strtoupper($s, $enc = null) { return strtoupper((string)$s); }
}

function lf_config(): array {
    static $cfg = null;
    if ($cfg !== null) return $cfg;

    $env = function (string $k, $default) {
        $v = getenv($k);
        return ($v === false) ? $default : $v;
    };

    $cfg = [
        // XAMPP defaults. Override on a real host.
        'db_host' => $env('LF_DB_HOST', '127.0.0.1'),
        'db_port' => $env('LF_DB_PORT', '3306'),
        'db_name' => $env('LF_DB_NAME', 'lostfound'),
        'db_user' => $env('LF_DB_USER', 'root'),
        'db_pass' => $env('LF_DB_PASS', ''),

        // Extra origins allowed to call the API from another domain
        // (only needed if the frontend is hosted on a different
        // domain than the PHP backend). Same-origin always works.
        // Example: ['https://lostandfound.example.com']
        'allowed_origins' => [],

        // null = auto-detect HTTPS. true = always send Secure cookies.
        'secure_cookies' => null,

        'timezone'         => 'Asia/Manila',
        'upload_max_bytes' => 5 * 1024 * 1024,   // 5 MB
        'session_idle_sec' => 2 * 60 * 60,       // 2 hours idle logout
        'login_max_fails'  => 5,                 // attempts ...
        'login_lock_sec'   => 10 * 60,           // ... then 10-minute lockout
        'show_db_errors'   => false,             // never leak SQL details
    ];

    $local = __DIR__ . '/config.local.php';
    if (is_file($local)) {
        $over = require $local;
        if (is_array($over)) $cfg = array_merge($cfg, $over);
    }
    date_default_timezone_set($cfg['timezone']);
    return $cfg;
}

// ── HTTPS detection (works behind hosting proxies too) ─────────
function lf_is_https(): bool {
    if (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') return true;
    if (strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') return true;
    return (int)($_SERVER['SERVER_PORT'] ?? 80) === 443;
}

// ── SECURE SESSION ────────────────────────────────────────────
function lf_start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $cfg = lf_config();
    $secure = $cfg['secure_cookies'] === null ? lf_is_https() : (bool)$cfg['secure_cookies'];

    ini_set('session.use_strict_mode', '1');   // reject unknown session ids
    ini_set('session.use_only_cookies', '1');  // never accept ids from the URL
    ini_set('session.use_trans_sid', '0');
    ini_set('session.cookie_httponly', '1');

    session_name('LFSESSID');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();

    // idle timeout
    $now = time();
    if (isset($_SESSION['last_seen']) && ($now - (int)$_SESSION['last_seen']) > (int)$cfg['session_idle_sec']) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['last_seen'] = $now;
}

// ── DATABASE ──────────────────────────────────────────────────
function lf_db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    $c = lf_config();
    $dsn = 'mysql:host=' . $c['db_host'] . ';port=' . $c['db_port'] . ';dbname=' . $c['db_name'] . ';charset=utf8mb4';
    $pdo = new PDO($dsn, $c['db_user'], $c['db_pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,   // real prepared statements
    ]);
    return $pdo;
}

// ── PASSWORD HELPERS (bcrypt only — no plain-text fallback) ────
function hashPassword(string $plain): string {
    return password_hash($plain, PASSWORD_BCRYPT);
}

function isPasswordHash(?string $stored): bool {
    if ($stored === null || $stored === '') return false;
    return password_get_info($stored)['algoName'] !== 'unknown';
}

function verifyPassword(string $plain, ?string $stored): bool {
    // Plain-text values in the database are NEVER accepted.
    if (!isPasswordHash($stored)) return false;
    return password_verify($plain, (string)$stored);
}

/**
 * The old demo defaults (admin login and merchant login) are permanently
 * banned. Only their SHA-256 fingerprints are stored here, never the text.
 */
const LF_BANNED_PASSWORD_SHA256 = [
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
];
function isBannedPassword(string $plain): bool {
    return in_array(hash('sha256', $plain), LF_BANNED_PASSWORD_SHA256, true);
}

/** Returns an error message, or null when the password is strong enough. */
function passwordStrengthError(string $p): ?string {
    if (strlen($p) < 10)  return 'Password must be at least 10 characters.';
    if (strlen($p) > 72)  return 'Password must be at most 72 characters.';
    if (!preg_match('/[A-Za-z]/', $p)) return 'Password must contain at least one letter.';
    if (!preg_match('/[0-9]/', $p))    return 'Password must contain at least one number.';
    return null;
}

/** Random temporary password: 12 chars, always has letters and digits. */
function randomTempPassword(): string {
    $letters = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    $digits  = '23456789';
    $all     = $letters . $digits;
    $chars   = [$letters[random_int(0, strlen($letters) - 1)], $digits[random_int(0, strlen($digits) - 1)]];
    while (count($chars) < 12) $chars[] = $all[random_int(0, strlen($all) - 1)];
    for ($i = count($chars) - 1; $i > 0; $i--) {      // Fisher-Yates shuffle
        $j = random_int(0, $i);
        [$chars[$i], $chars[$j]] = [$chars[$j], $chars[$i]];
    }
    return implode('', $chars);
}

// ── AUTH HELPERS (read ONLY the server session) ───────────────
function currentMerchantId(): ?string { return $_SESSION['merchant_id'] ?? null; }
function isLoggedInAsAdmin(): bool    { return !empty($_SESSION['is_admin']); }
function isLoggedIn(): bool           { return currentMerchantId() !== null; }
function mustChangePassword(): bool   { return !empty($_SESSION['must_change']); }

function requireLogin(): void {
    if (!isLoggedIn()) respond(['error' => 'Please log in first.', 'code' => 'not_logged_in'], 401);
}
function requireAdmin(): void {
    if (!isLoggedInAsAdmin()) respond(['error' => 'Admin access required.', 'code' => 'forbidden'], 403);
}
function requireOwnerOrAdmin(string $brandId): void {
    if (isLoggedInAsAdmin()) return;
    if (currentMerchantId() === null || currentMerchantId() !== $brandId) {
        respond(['error' => 'You do not have permission to modify this.', 'code' => 'forbidden'], 403);
    }
}

// ── RESPONSE HELPERS ──────────────────────────────────────────
function respond($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
    exit;
}

function newId(string $prefix): string {
    return $prefix . bin2hex(random_bytes(6));
}

function boolField($v): int {
    return (!empty($v) && $v !== 'false' && $v !== '0') ? 1 : 0;
}

/** True when the admin account has been created by setup.php. */
function adminExists(PDO $pdo): bool {
    $st = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key='admin_password'");
    $st->execute();
    $v = $st->fetchColumn();
    return $v !== false && isPasswordHash((string)$v);
}
