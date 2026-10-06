<?php
// ============================================================
// Security.php — CSRF, CORS/origin checks, input validation,
// XSS-safe text cleaning, image uploads and login throttling.
// Required by Api.php and setup.php. Prints nothing by itself.
// ============================================================

if (!defined('LF_APP')) { http_response_code(403); exit; }

// ── ORIGIN / CORS ─────────────────────────────────────────────
function lf_request_origin(): ?string {
    $o = $_SERVER['HTTP_ORIGIN'] ?? '';
    return $o === '' ? null : rtrim($o, '/');
}
function lf_own_origin(): string {
    return (lf_is_https() ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
}
function lf_origin_allowed(?string $origin): bool {
    if ($origin === null) return true;                       // same-origin requests often omit Origin
    if (strcasecmp($origin, lf_own_origin()) === 0) return true;
    foreach ((array)lf_config()['allowed_origins'] as $allowed) {
        if (strcasecmp($origin, rtrim((string)$allowed, '/')) === 0) return true;
    }
    return false;
}
/** Sends CORS headers ONLY for your own / configured origins (never echoes random origins). */
function lf_send_cors_headers(): void {
    $origin = lf_request_origin();
    if ($origin !== null && lf_origin_allowed($origin) && strcasecmp($origin, lf_own_origin()) !== 0) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        header('Vary: Origin');
    }
}

// ── CSRF ──────────────────────────────────────────────────────
function csrfToken(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function rotateCsrfToken(): string {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
/** Every POST/PUT/DELETE must carry the session's CSRF token in X-CSRF-Token. */
function requireCsrf(): void {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) return;
    if (!lf_origin_allowed(lf_request_origin())) {
        respond(['error' => 'Request blocked: origin not allowed.', 'code' => 'origin'], 403);
    }
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $real = $_SESSION['csrf'] ?? '';
    if ($real === '' || !is_string($sent) || !hash_equals($real, $sent)) {
        respond(['error' => 'Your session expired. Please try again.', 'code' => 'csrf'], 403);
    }
}

// ── REQUEST BODY ──────────────────────────────────────────────
function input(): array {
    static $data = null;
    if ($data !== null) return $data;
    $raw = file_get_contents('php://input');
    if ($raw !== false && strlen($raw) > 1024 * 1024) respond(['error' => 'Request too large.'], 413);
    $d = json_decode((string)$raw, true);
    $data = is_array($d) ? $d : [];
    return $data;
}

// ── XSS-SAFE TEXT CLEANING ────────────────────────────────────
// The frontend builds HTML with template strings, so every text
// value is cleaned BEFORE it is stored: tags removed, <>/" and
// backticks neutralised, control characters dropped, length capped.
// That way nothing stored in the database can become markup when
// lostandfound.js renders it.
function cleanText($v, int $max = 255, bool $multiline = false): string {
    if (is_array($v) || is_object($v)) return '';
    $s = (string)$v;
    if (!mb_check_encoding($s, 'UTF-8')) $s = mb_convert_encoding($s, 'UTF-8', 'UTF-8');
    $s = strip_tags($s);
    $s = str_replace(['<', '>', '"', '`'], ['‹', '›', '”', "'"], $s);
    $s = $multiline
        ? preg_replace('/[^\P{C}\n]/u', '', str_replace("\r\n", "\n", $s))
        : preg_replace('/\p{C}/u', '', $s);
    $s = trim((string)$s);
    return mb_substr($s, 0, $max);
}
function requireText(array $b, string $key, string $label, int $max = 255, bool $multiline = false): string {
    $v = cleanText($b[$key] ?? '', $max, $multiline);
    if ($v === '') respond(['error' => "$label is required."], 400);
    return $v;
}

function cleanBrandId($v): string {
    $id = strtolower(preg_replace('/\s+/', '', (string)$v));
    if (!preg_match('/^[a-z0-9][a-z0-9_-]{1,49}$/', $id)) {
        respond(['error' => 'Brand ID must be 2–50 characters: lowercase letters, numbers, - or _.'], 400);
    }
    return $id;
}

function cleanMoney($v, string $label, bool $required = true): ?string {
    if ($v === null || $v === '') {
        if ($required) respond(['error' => "$label is required."], 400);
        return null;
    }
    $s = str_replace([',', '₱', ' '], '', (string)$v);
    if (!is_numeric($s) || (float)$s < 0 || (float)$s > 10000000) {
        respond(['error' => "$label must be a valid amount."], 400);
    }
    $f = round((float)$s, 2);
    return (floor($f) == $f) ? (string)(int)$f : number_format($f, 2, '.', '');
}

function cleanInt($v, int $min, int $max, string $label): int {
    if (!is_numeric($v)) respond(['error' => "$label must be a number."], 400);
    $i = (int)$v;
    if ($i < $min || $i > $max) respond(['error' => "$label must be between $min and $max."], 400);
    return $i;
}

/**
 * Image references allowed in the database:
 *  - files uploaded through this API:   uploads/<folder>/<random>.jpg|png|webp
 *  - images bundled with the project:   brand pics/..., products for .../...
 *  - external https:// image URLs (e.g. Unsplash)
 * Base64 data: URIs and javascript: URLs are rejected.
 */
function isAllowedImageRef(string $v): bool {
    if ($v === '') return true;
    if (strlen($v) > 1000) return false;
    if (preg_match('/["\'<>\\\\`]/', $v)) return false;     // quotes, brackets, backslash, backtick
    if (preg_match('/\p{C}/u', $v)) return false;              // control characters
    if (strpos($v, '..') !== false) return false;               // no path traversal
    if (preg_match('#^uploads/[a-z]+/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$#', $v)) return true;
    if (preg_match('#^(brand pics|products for [^/]+)/[^/]+\.(jpg|jpeg|png|webp|gif|jfif)$#i', $v)) return true;
    if (preg_match('#^https://[^\s]+$#i', $v)) return true;
    return false;
}
function cleanImageRef($v, string $label = 'Image'): string {
    $s = trim((string)($v ?? ''));
    if (!isAllowedImageRef($s)) {
        respond(['error' => "$label must be an uploaded image or an https:// link (JPG, PNG or WEBP)."], 400);
    }
    return $s;
}

function cleanSessionId($v): string {
    $s = (string)$v;
    return preg_match('/^[A-Za-z0-9_]{8,100}$/', $s) ? $s : '';
}
/** Anonymous visitor id (from localStorage lf_session_id), sent as ?session= */
function visitorSession(): string {
    return cleanSessionId($_GET['session'] ?? '');
}

// ── IMAGE UPLOADS → real files in /uploads ────────────────────
function lf_uploads_root(): string {
    return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads';
}
function lf_image_mime(string $path): ?string {
    $mime = null;
    if (function_exists('finfo_open')) {
        $f = finfo_open(FILEINFO_MIME_TYPE);
        if ($f) { $mime = finfo_file($f, $path) ?: null; finfo_close($f); }
    }
    $info = @getimagesize($path);
    if ($info === false) return null;                       // not a real image
    if ($mime === null) $mime = $info['mime'] ?? null;
    return $mime;
}
function lf_ext_for_mime(?string $mime): ?string {
    $map = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    return $map[$mime] ?? null;
}
/** Saves $_FILES['file'] into uploads/<folder>/ and returns the relative path. */
function handleImageUpload(string $folder): string {
    $f = $_FILES['file'] ?? null;
    if (!$f || !is_array($f) || is_array($f['error'])) respond(['error' => 'No image file was sent.'], 400);
    if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE) respond(['error' => 'Image is larger than 5 MB.'], 413);
    if ($f['error'] !== UPLOAD_ERR_OK) respond(['error' => 'Upload failed. Please try again.'], 400);
    if ($f['size'] <= 0 || $f['size'] > (int)lf_config()['upload_max_bytes']) respond(['error' => 'Image is larger than 5 MB.'], 413);
    if (!is_uploaded_file($f['tmp_name'])) respond(['error' => 'Invalid upload.'], 400);

    $ext = lf_ext_for_mime(lf_image_mime($f['tmp_name']));
    if ($ext === null) respond(['error' => 'Only JPG, PNG or WEBP images are allowed.'], 415);

    $dir = lf_uploads_root() . DIRECTORY_SEPARATOR . $folder;
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) respond(['error' => 'Server cannot create the uploads folder. Check folder permissions.'], 500);
    $name = bin2hex(random_bytes(16)) . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], $dir . DIRECTORY_SEPARATOR . $name)) {
        respond(['error' => 'Server could not save the image. Check folder permissions.'], 500);
    }
    @chmod($dir . DIRECTORY_SEPARATOR . $name, 0644);
    return "uploads/$folder/$name";
}
/** Converts an old base64 data: URI into a real file (used by setup.php migration). */
function storeDataUri(string $uri, string $folder): ?string {
    if (!preg_match('#^data:(image/(?:jpeg|jpg|png|webp));base64,(.+)$#s', $uri, $m)) return null;
    $bin = base64_decode($m[2], true);
    if ($bin === false || strlen($bin) > 10 * 1024 * 1024) return null;
    $info = @getimagesizefromstring($bin);
    $ext = lf_ext_for_mime($info['mime'] ?? null);
    if ($ext === null) return null;
    $dir = lf_uploads_root() . DIRECTORY_SEPARATOR . $folder;
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) return null;
    $name = bin2hex(random_bytes(16)) . '.' . $ext;
    if (file_put_contents($dir . DIRECTORY_SEPARATOR . $name, $bin) === false) return null;
    return "uploads/$folder/$name";
}

// ── LOGIN THROTTLING (5 fails → 10-minute lockout) ────────────
function clientIp(): string {
    return substr((string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), 0, 45);
}
/** Seconds remaining on a lockout for this login key, 0 when not locked. */
function loginLockRemaining(PDO $pdo, string $key): int {
    $cfg = lf_config();
    $st = $pdo->prepare("SELECT COUNT(*) AS n, MAX(attempted_at) AS last FROM login_attempts
                         WHERE login_key=? AND attempted_at > (NOW() - INTERVAL ? SECOND)");
    $st->execute([$key, (int)$cfg['login_lock_sec']]);
    $r = $st->fetch();
    if ((int)$r['n'] < (int)$cfg['login_max_fails']) return 0;
    $st = $pdo->prepare("SELECT GREATEST(0, ? - TIMESTAMPDIFF(SECOND, ?, NOW()))");
    $st->execute([(int)$cfg['login_lock_sec'], $r['last']]);
    return (int)$st->fetchColumn();
}
function recordLoginFailure(PDO $pdo, string $key): void {
    $pdo->prepare("INSERT INTO login_attempts (login_key, ip) VALUES (?, ?)")->execute([$key, clientIp()]);
    // housekeeping
    $pdo->exec("DELETE FROM login_attempts WHERE attempted_at < (NOW() - INTERVAL 1 DAY)");
}
function clearLoginFailures(PDO $pdo, string $key): void {
    $pdo->prepare("DELETE FROM login_attempts WHERE login_key=?")->execute([$key]);
}

// ── SIMPLE PER-SESSION RATE LIMIT (reviews, feedback, uploads) ─
function rateLimit(string $bucket, int $max, int $windowSec): void {
    $now = time();
    $hits = array_filter($_SESSION['rl'][$bucket] ?? [], function ($t) use ($now, $windowSec) { return $t > $now - $windowSec; });
    if (count($hits) >= $max) respond(['error' => 'Too many requests. Please wait a few minutes and try again.'], 429);
    $hits[] = $now;
    $_SESSION['rl'][$bucket] = array_values($hits);
}
