<?php
// ============================================================
// config.local.example.php — settings for a REAL web host.
//
// XAMPP does NOT need this file.
// When you move to hosting:
//   1. Copy this file and rename the copy to  config.local.php
//   2. Fill in the database details your host gives you
//      (hPanel / cPanel → MySQL Databases).
//   3. Upload it into the backend/ folder. It is protected by
//      backend/.htaccess and never sent to browsers.
// ============================================================

return [
    'db_host' => 'localhost',            // e.g. 'localhost' or 'sql123.yourhost.com'
    'db_port' => '3306',
    'db_name' => 'your_database_name',   // hosts usually prefix it, e.g. 'u123456_lostfound'
    'db_user' => 'your_database_user',
    'db_pass' => 'your_database_password',

    // Only if the frontend runs on a DIFFERENT domain than the PHP files:
    // 'allowed_origins' => ['https://www.your-frontend-domain.com'],

    // Force secure (HTTPS-only) cookies. Leave null to auto-detect.
    // 'secure_cookies' => true,
];
