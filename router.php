<?php
// ============================================================
// router.php — used ONLY when the site runs on port 8000
// (start-site-8000.bat → php -S localhost:8000 router.php).
//  • http://localhost:8000/  shows the website (lostandfound.html)
//    without ".html" in the address bar
//  • blocks private files, like the .htaccess rules do on Apache
// Apache / web hosting ignore this file.
// ============================================================
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');

// private files: never served
$blocked = '#(^|/)\.|\.(sql|md|log|bak|zip|bat|py)$'
         . '|^/backend/(config\.local.*|Config|Security|EmailLib|Shipping)\.php$'
         . '|^/backend/(lib|mail_outbox)/|^/tools/|^/router\.php$#i';
if (preg_match($blocked, $path)) {
    http_response_code(403);
    echo 'Forbidden';
    return true;
}
// uploaded files are images only, never scripts
if (strpos($path, '/uploads/') === 0 && preg_match('#\.(php\d?|phtml|phar|html?|js|svg)$#i', $path)) {
    http_response_code(403);
    echo 'Forbidden';
    return true;
}
// home page = the website
if ($path === '/' || $path === '/index' ) {
    header('Content-Type: text/html; charset=utf-8');
    readfile(__DIR__ . '/lostandfound.html');
    return true;
}
return false;   // everything else (css, js, images, backend/*.php) is served normally
