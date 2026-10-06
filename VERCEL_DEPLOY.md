# Lost & Found — Deploying with Vercel (optional)

This guide is an **add-on**. Nothing in your existing code was changed. Only 4 new files were added:

| New file | What it does |
|---|---|
| `vercel.json` | Tells Vercel to open `lostandfound.html` at `/`, and to **forward** `backend/Api.php`, `Account.php`, `PasswordReset.php`, `Checkout.php`, `Email.php`, `ResetPassword.php` and `uploads/…` to your PHP host. |
| `.vercelignore` | Stops Vercel from ever uploading your PHP files, SQL files and docs (Vercel would show them as plain text). |
| `backend/config.local.vercel-example.php` | Template for the PHP host: database details + your Vercel address in `allowed_origins`. |
| `VERCEL_DEPLOY.md` | This guide. |

If you never use Vercel, these files do nothing. XAMPP and normal PHP hosting work exactly as before.

---

## 1. How it works

Vercel **cannot run PHP or MySQL**. So the site is split across two hosts, but the browser only ever sees Vercel:

````text
Visitor's browser
      │   https://your-project.vercel.app
      ▼
┌──────────────────────── VERCEL ────────────────────────┐
│  serves: lostandfound.html / .css / .js, Sync.js,      │
│          SyncSecure.js, brand pics/, products for …/   │
│                                                        │
│  forwards ─►  /backend/Api.php  ─┐                     │
│  forwards ─►  /uploads/…        ─┤                     │
└──────────────────────────────────┼─────────────────────┘
                                   ▼
┌──────────────────── YOUR PHP HOST ─────────────────────┐
│  backend/Api.php, Config.php, Security.php             │
│  MySQL database  ·  uploads/ (product photos)          │
└────────────────────────────────────────────────────────┘
````

Because Vercel forwards the API instead of the browser calling another domain, **no frontend code needs to change**. Login cookies, CSRF protection and image uploads keep working.

**You still need a PHP host.** Vercel replaces only the "serving the pages" part.

---

## 2. What you need

1. **A PHP host with MySQL** (PHP 7.4+), with **HTTPS** turned on — for example Hostinger or any cPanel host.
   > ⚠️ **InfinityFree's free plan is known to block requests that come from other servers** (it shows a browser security check instead of your API), so it usually **won't work** as the backend for Vercel. It is fine for hosting the *whole* site by itself without Vercel.
2. **A GitHub account** with this project in a repository.
3. **A free Vercel account** (sign in with GitHub).

---

## 3. Step by step

### Step A — Set up the backend on your PHP host

1. In the host panel, create a MySQL database and note the host, name, user and password.
2. In the host's phpMyAdmin, select that database and **Import** your data. Use an **Export** of your XAMPP `lostfound` database, or `Schema.sql` for an empty site. *(If you use `Schema.sql`, first delete its two lines `CREATE DATABASE …` and `USE lostfound;`.)*
3. Upload the whole `lostandfound` folder to the host (for example into `public_html/`).
4. In `backend/`, copy `config.local.vercel-example.php` → rename the copy to **`config.local.php`** → fill in the database details. For now, leave the Vercel address as it is; you'll fix it in Step D.
5. If you imported an empty `Schema.sql`, open `https://YOUR-PHP-HOST/backend/setup.php`, create your admin, copy the temporary merchant passwords, then **delete `setup.php`**.
6. Check it works: open `https://YOUR-PHP-HOST/backend/Api.php?resource=brands` → you should see JSON text listing your brands.

### Step B — Point `vercel.json` at your PHP host

Open `vercel.json` and replace **all seven** `https://YOUR-PHP-HOST.com` with your real PHP host address (https, no slash at the end). Example: if your backend check in Step A6 worked at `https://lostandfound-api.com/backend/Api.php`, use `https://lostandfound-api.com`.

If you put the project inside a subfolder on the host (e.g. `public_html/lostandfound/`), include it: `https://lostandfound-api.com/lostandfound/backend/Api.php`.

### Step C — Deploy on Vercel

1. Push the project (including `vercel.json` and `.vercelignore`) to your GitHub repository.
2. Go to **vercel.com → Add New… → Project → Import** your repository.
3. Settings:
   - **Framework Preset:** `Other`
   - **Build Command:** leave empty
   - **Output Directory:** leave empty
   - **Root Directory:** the folder that contains `lostandfound.html` (leave empty if it's the repository root)
4. Click **Deploy**. Copy the address Vercel gives you, e.g. `https://lostandfound-batangas.vercel.app`.

### Step D — Allow the Vercel address on the PHP host

Also add `'app_url' => 'https://your-project.vercel.app',` to `config.local.php` so links in password emails point to your Vercel site.


In `backend/config.local.php` **on the PHP host**, set:

````php
'allowed_origins' => ['https://lostandfound-batangas.vercel.app'],
````

Use your real Vercel address, with no slash at the end. If you later add a custom domain, add it to the list too.

### Step E — Test

Open your Vercel address and go through the checklist in section 7 of `LOSTANDFOUND_FULL_CODE.md` (admin login, merchant login, add a product with a photo, refresh, checkout).

Every future `git push` to GitHub redeploys the frontend automatically. Backend changes (PHP files) are still uploaded to the PHP host.

---

## 4. Troubleshooting

| What you see | Cause | Fix |
|---|---|---|
| Pages load but login says **"Request blocked: origin not allowed."** | The PHP host doesn't trust your Vercel address yet | Step D: add the exact Vercel URL to `allowed_origins` (https, no trailing slash). |
| Products don't load, toast says **"Server error"** or **"Cannot reach the server"** | `vercel.json` still has `YOUR-PHP-HOST.com`, a typo, or the wrong subfolder | Step B, then redeploy. Check Step A6 works in the browser first. |
| Step A6 shows a **"security check" / JavaScript page** instead of JSON | The host blocks non-browser requests (e.g. InfinityFree free plan) | Use a different PHP host, or host the whole site there without Vercel. |
| Login succeeds but you're **logged out immediately** | The PHP host isn't using HTTPS | Enable SSL on the PHP host and use `https://` in `vercel.json`. |
| **New product photos don't show** (old ones do) | The `/uploads/` forward is wrong | Check the second address in `vercel.json` (Step B). |
| Opening `/backend/Config.php` on Vercel shows code | `.vercelignore` wasn't pushed | Make sure `.vercelignore` is in the repository root next to `vercel.json`, then redeploy. |

---

## 5. How this was tested

A local simulator reproduced Vercel's behaviour exactly as configured in `vercel.json` and `.vercelignore` (static files + forwarding to a separate PHP server on another address). Results:

- Site, scripts and images load through "Vercel"; all PHP, SQL and `.md` files return **404** (not exposed).
- Without `allowed_origins`: pages load, logins are blocked with "origin not allowed" (the expected safe default).
- With `allowed_origins`: **all 26 frontend tests passed** — admin and merchant login, forced password change, image upload saved to `uploads/` and served back through the forward, product saved and reloaded, cross-brand edit blocked, event approval, checkout with stock decrease, feedback.

Real Vercel can only be tested once you have both hosts, so follow the troubleshooting table if anything differs.

---

## 6. The new files

### `vercel.json`
````json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": false,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/",
      "destination": "/lostandfound.html"
    },
    {
      "source": "/backend/Api.php",
      "destination": "https://YOUR-PHP-HOST.com/backend/Api.php"
    },
    {
      "source": "/backend/Account.php",
      "destination": "https://YOUR-PHP-HOST.com/backend/Account.php"
    },
    {
      "source": "/backend/ResetPassword.php",
      "destination": "https://YOUR-PHP-HOST.com/backend/ResetPassword.php"
    },
    {
      "source": "/backend/Email.php",
      "destination": "https://YOUR-PHP-HOST.com/backend/Email.php"
    },
    {
      "source": "/backend/Checkout.php",
      "destination": "https://YOUR-PHP-HOST.com/backend/Checkout.php"
    },
    {
      "source": "/backend/PasswordReset.php",
      "destination": "https://YOUR-PHP-HOST.com/backend/PasswordReset.php"
    },
    {
      "source": "/uploads/:path*",
      "destination": "https://YOUR-PHP-HOST.com/uploads/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "Referrer-Policy",
          "value": "same-origin"
        }
      ]
    },
    {
      "source": "/backend/Api.php",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store"
        }
      ]
    },
    {
      "source": "/backend/Account.php",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store"
        }
      ]
    },
    {
      "source": "/backend/PasswordReset.php",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store"
        }
      ]
    },
    {
      "source": "/backend/Checkout.php",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store"
        }
      ]
    },
    {
      "source": "/backend/Email.php",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store"
        }
      ]
    },
    {
      "source": "/backend/ResetPassword.php",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store"
        }
      ]
    }
  ]
}
````

### `.vercelignore`
````text
# ============================================================
# .vercelignore — files that must NEVER be uploaded to Vercel.
# Vercel cannot run PHP: it would serve these files as plain
# text and expose your source code / database structure.
# They belong on your PHP host instead.
# ============================================================
backend/*.php
backend/.htaccess
Schema.sql
Schema_update.sql
*.md
.htaccess
uploads/
backend/lib/
backend/mail_outbox/
````

### `backend/config.local.vercel-example.php`
````php
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
````
