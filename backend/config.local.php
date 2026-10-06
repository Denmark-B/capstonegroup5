<?php
// ============================================================
// config.local.email-example.php — turn on REAL email sending.
//
// Without this, emails are saved as files in backend/mail_outbox/
// (test mode). To send real emails with Gmail:
//
//   1. Use a Gmail account for the shop (e.g. lostandfound.batangas@gmail.com).
//   2. Turn on 2-Step Verification:  myaccount.google.com → Security.
//   3. Create an App Password:       myaccount.google.com → Security →
//      2-Step Verification → App passwords → name it "Lost and Found" →
//      copy the 16-letter password (remove the spaces).
//   4. Copy this file, rename the copy to  config.local.php  (same folder),
//      and fill in the 3 lines marked ← below.
//
// If you already have a config.local.php, just add these lines to it.
// Never upload this file to GitHub.
// ============================================================

return [
    'smtp_host'      => 'smtp.gmail.com',
    'smtp_port'      => 587,
    'smtp_secure'    => 'tls',
    'smtp_user'      => 'hareymagtibay@gmail.com',     // ← the Gmail address
    'smtp_pass'      => 'capstonepota1234',       // ← the 16-letter App Password (not your normal password)
    'mail_from'      => 'hareymagtibay@gmail.com',     // ← same Gmail address
    'mail_from_name' => 'Lost & Found Batangas',

    // Address used inside email links. Leave commented on XAMPP (auto-detected).
    // On real hosting / a public link, set it, e.g.:
    // 'app_url' => 'https://your-site.com',
];
