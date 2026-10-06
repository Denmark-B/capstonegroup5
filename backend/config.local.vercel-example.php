<?php
// ============================================================
// config.local.vercel-example.php
// ONLY needed when the frontend is on Vercel and this backend
// folder is on a separate PHP host.
//
//   1. On your PHP host, copy this file to  backend/config.local.php
//   2. Fill in the database details from your host's panel.
//   3. Put your exact Vercel address(es) in allowed_origins.
//
// Without allowed_origins, every login/save coming through Vercel
// is blocked with "Request blocked: origin not allowed."
// ============================================================

return [
    'db_host' => 'localhost',
    'db_port' => '3306',
    'db_name' => 'your_database_name',
    'db_user' => 'your_database_user',
    'db_pass' => 'your_database_password',

    // Your Vercel site address(es): https:// + domain, no slash at the end.
    'allowed_origins' => [
        'https://your-project.vercel.app',
        // 'https://www.your-custom-domain.com',
    ],

    // Vercel is always HTTPS, so session cookies are always Secure.
    'secure_cookies' => true,
];
