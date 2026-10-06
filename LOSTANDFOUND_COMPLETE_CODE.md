# Lost & Found — Flea Market Batangas
## Complete website code — every file, from the start, sorted and structured

Jan Tristan H. Garcia · BSIT-3A · Capstone project

Stack: HTML / CSS / vanilla JS + PHP 7.4+ (PDO) + MySQL/MariaDB · runs on XAMPP now, ready for a PHP web host later.

This is the **single master document**. It replaces the earlier separate guides. It contains every code file of the website, every edit made to your original files, the setup steps (including real email sending), and the test checklist. The zip has the same files in the right folders.

---

## Table of contents

- 1. What the website does now
- 2. Folder structure
- 3. Script load order
- 4. Setup on XAMPP (fresh, step by step)
- 5. Turn on real emails (Gmail)
- 6. How password recovery works
- 7. Moving to hosting later
- 8. Test checklist
- 9. CHANGED LINES in your original files
- 10. New / replaced / deleted files
- 11. Full source code

---

## 1. What the website does now

| Feature | What it does |
|---|---|
| **Frontend, PHP backend, MySQL connected** | Every create/edit/delete by customers, merchants and the admin is saved in MySQL and survives refresh, logout and other browsers. |
| **No default logins** | admin/admin123 and merchant "123" are gone. You create the admin in `setup.php`; merchants get random temporary passwords and must change them at first login. |
| **Login protection** | bcrypt passwords, 5 wrong tries → 10-minute lockout, new session id on login, HttpOnly/SameSite cookies, CSRF tokens on every save, CORS limited to your site. |
| **Permissions enforced on the server** | Merchants can only touch their own brand's products, orders, reviews and events. The admin can do everything. Customers only see their own orders. |
| **Real image uploads** | Saved as files in `uploads/` (JPG/PNG/WEBP, max 5 MB, checked as real images), with only the path in the database. |
| **Change Password button** | Next to Logout. Every change is recorded in the `password_changes` table, with a history table in the Security tab. |
| **Verified recovery emails** | Every admin and merchant account must add and verify an email (pop-up after login, banner, and a Security tab box). The admin sees every merchant's status. |
| **Forgot password → email link** | Sends a reset link to the verified email and shows *"A password reset link has been sent to your trusted email…"*. The link expires in 30 minutes and works once. Merchants without a verified email can still ask the admin. |
| **Philippine address picker** | Checkout asks for **City/Municipality → Province → Barangay** as **search boxes with suggestions while typing** (A→Z, numbers in natural order, accents optional, forgiving spellings like "Marawoy" → "Marauoy"; typing a city fills in the province) from the **latest official PSA PSGC list, 2Q 2026 (as of 30 June 2026)**: 84 provinces incl. Metro Manila, 1,655 cities/municipalities (Manila by district), **42,010 barangays**, including the 2025–2026 changes (Sawata, Calaca merger, Sulu → Region IX, 27 name corrections), plus **House no. / Street / Subdivision / Landmark**. The J&T shipping area is picked automatically from the city, and the full address is saved with the order. |
| **J&T Express shipping** | Latest "from Luzon (Batangas)" rates by weight and region, with one parcel per shop. |
| **Automatic total** | Subtotal + shipping = total, shown live with a breakdown. The server recalculates it, so it can't be tampered with. |
| **Event approval** | Merchant events go live after the admin approves them. |
| **Hosting-ready** | Relative paths everywhere; settings live in `backend/config.local.php`; works with Vercel + a PHP host too (`VERCEL_DEPLOY.md`). |

## 2. Folder structure

````text
htdocs/lostandfound/
├── .htaccess                      blocks .sql/.md downloads, security headers
├── .vercelignore / vercel.json    only used if you deploy on Vercel
├── lostandfound.html / .css / .js your website (tiny edits only, see section 9)
├── favicon.ico
├── Schema.sql                     fresh install (no default passwords)
├── Schema_update.sql              upgrades an OLD database
├── Schema_password_log.sql        optional (tables create themselves)
├── LOSTANDFOUND_COMPLETE_CODE.md  this document
├── VERCEL_DEPLOY.md               only for Vercel
├── backend/
│   ├── .htaccess                  hides Config/Security/config.local
│   ├── Config.php                 settings, DB, secure sessions, bcrypt
│   ├── Security.php               CSRF, CORS, validation, uploads, lockout
│   ├── Api.php                    main API (products, orders, brands, …)
│   ├── Account.php                change password + history
│   ├── PasswordReset.php          admin-approved reset (fallback)
│   ├── EmailLib.php               email tokens + mailer + templates
│   ├── Email.php                  verify email, forgot-password links
│   ├── ResetPassword.php          page the reset email opens
│   ├── Shipping.php               J&T rate table (edit rates here)
│   ├── Checkout.php               orders with server-calculated shipping
│   ├── setup.php                  one-time installer — delete after use
│   ├── config.local.example.php        template: hosting database
│   ├── config.local.email-example.php  template: Gmail sending
│   ├── config.local.vercel-example.php template: Vercel setup
│   ├── Sync.js                    bridge: localStorage → API
│   ├── SyncSecure.js              CSRF, uploads, password rules, approvals
│   ├── AccountSecurity.js         Change Password button + history
│   ├── PasswordReset.js           Forgot password button + admin panel
│   ├── ShippingJNT.js             J&T shipping + automatic total
│   ├── EmailFeature.js            recovery emails + reset links
│   ├── AddressPH.js               Province → City → Barangay checkout address
│   ├── lib/PHPMailer/             email library (PHPMailer 6.9.3, LGPL)
│   └── mail_outbox/               test-mode emails are saved here
├── data/ph-address/               PSGC 2Q 2026 address lists (provinces, nationwide city index, one file per province)
├── tools/update-address-data.py   rebuilds data/ph-address each quarter from the official list
├── uploads/                       uploaded images (scripts can't run here)
├── brand pics/                    brand logos
└── products for …/                product photos
````

## 3. Script load order

At the bottom of `lostandfound.html`, in exactly this order (the later files build on the earlier ones):

````html
<script src="lostandfound.js"></script>
<script src="backend/Sync.js"></script>
<script src="backend/SyncSecure.js"></script>
<script src="backend/AccountSecurity.js"></script>
<script src="backend/PasswordReset.js"></script>
<script src="backend/ShippingJNT.js"></script>
<script src="backend/EmailFeature.js"></script>
<script src="backend/AddressPH.js"></script>
````

---

## 4. Setup on XAMPP (fresh, step by step)

1. **Copy the folder.** Unzip and copy `lostandfound` into `htdocs` (e.g. `C:\Users\<you>\Documents\xampp\htdocs\lostandfound`). Move any older project folder out of `htdocs`.
2. **Start XAMPP:** **Apache** and **MySQL**.
3. **Database.** Open `http://localhost/phpmyadmin/`:
   - *No `lostfound` database yet:* **Import** → `Schema.sql` → Go.
   - *You already have one (old version):* click `lostfound` → **Import** → `Schema_update.sql` → Go.
   - *You already have one from a previous attempt and setup says "already exists":* click `lostfound` → **SQL** → run `DELETE FROM site_settings WHERE setting_key IN ('admin_username','admin_password');`
4. **Create the admin.** Open `http://localhost/lostandfound/backend/setup.php`, choose a username and a password (10+ characters, letters and numbers), and **write them down**. Screenshot the table of temporary merchant passwords, because it's shown once.
5. **Delete** `backend/setup.php`.
6. **Open the site:** `http://localhost/lostandfound/` → **Merchant** → **Admin** → log in.
7. **Add your recovery email** when the pop-up asks. In test mode, open the newest file in `backend/mail_outbox/` and click **Verify email**. With Gmail set up, check your inbox.

New tables (`password_changes`, `password_reset_requests`, `account_emails`, `email_tokens`) **create themselves** the first time they're needed.

---

## 5. Turn on real emails (Gmail)

Without this, the site runs in **test mode**: every email is saved as an `.html` file in `backend/mail_outbox/`. You can open it and click its button, and the whole flow works on your PC.

To send **real** emails:

1. Use a Gmail account for the shop.
2. **myaccount.google.com → Security → 2-Step Verification**: turn it on.
3. **myaccount.google.com → Security → 2-Step Verification → App passwords**: create one named "Lost and Found" and copy the 16 letters (remove the spaces).
4. In `backend/`, copy `config.local.email-example.php` → rename the copy to **`config.local.php`** → fill in your Gmail address (2 places) and the App Password.
5. Refresh the site. The admin **Security** tab no longer says "test mode".

> **Important:** links inside the emails point to the address the site was opened with. On XAMPP that's `http://localhost/...`, which works **only on your PC**. When you open the email on a phone, the link won't open until the site is on real hosting (or set `'app_url'` in `config.local.php` to a public address, such as your Cloudflare tunnel link).

Never upload `config.local.php` to GitHub.

---

## 6. How password recovery works

**Adding and verifying the email (required for every account)**
- After logging in, an account without a verified email gets a pop-up. **"Add a recovery email"** can't be skipped until an email is submitted (it requires the current password).
- A **Verify email** link is emailed (valid 24 hours, one use). Clicking it shows *"Email verified ✓"*.
- Until verified, the dashboard shows a yellow banner. **Security tab → Recovery email** lets you change or resend.
- **Admin:** Security tab → **Merchant recovery emails** shows every merchant's status (Verified / Pending / None), with **Set email** to send a verification link to a merchant. **Add Brand** now requires the merchant's email.

**Forgot password**
- Login box → **Forgot password?**
  - **Merchant:** pick the brand → **Send reset link**. If the brand has a verified email, the popup says ***"Reset link sent! A password reset link has been sent to your trusted email (ge•••@gmail.com) linked to the merchant account Geckoman. It expires in 30 minutes."***
  - **Admin:** enter the admin username → **Send reset link**. The popup says the link was sent to the trusted email linked to the admin account. It shows the same message even if the username is wrong, so strangers can't guess it.
- The email's **Reset password** button opens a page to choose a new password (10+ characters, letters and numbers). The link works **once** and **expires after 30 minutes**; older links stop working when a new one is sent.
- After a reset: the new bcrypt hash is saved, logged in `password_changes` (reason `email_reset`), notifications are sent, and that account's login lockout is cleared.
- **Merchant without a verified email:** the popup explains this and offers **"Ask the admin instead"**, the admin-approved temporary password (admin: Security tab → Password reset requests).
- **Limits:** 3 reset emails per account per hour, 5 forgot attempts per browser per hour.

**Where the admin sees things:** dashboard → **Security** tab, which holds Recovery email, Merchant recovery emails, Password reset requests and Password history. The bell shows notifications.

### Keeping the address list up to date

PSA publishes a new PSGC list about two weeks after every quarter (mid-January, April, July, October). Changes are usually small (name corrections, sometimes a merged or new barangay). To update:
1. Download the newest `ph-psgc-<version>.zip` from **github.com/Tenasia/ph-psgc → Releases** and unzip it.
2. Run `python tools/update-address-data.py path/to/ph-psgc-<version>/psgc` (needs Python 3).
3. Copy the new `data/ph-address` folder to the website, then change `LF_ADDR_VERSION` in `backend/AddressPH.js` (and `?v=` in `lostandfound.html`) to a new number so browsers load it.

### Troubleshooting: checkout still shows the old "Select your area" list

That means the browser is not running the new files. Check, in this order:
1. Open `http://localhost/lostandfound/backend/AddressPH.js`. You should see code starting with *AddressPH.js — Philippine address with typing suggestions. v4*. **Not Found** means the file wasn't copied into `backend`.
2. Open `http://localhost/lostandfound/data/ph-address/provinces.json`. You should see text starting with `{"source":"PSA…`. **Not Found** means the `data` folder wasn't copied into `lostandfound`.
3. Make sure you replaced `lostandfound.html` (its last script line must be `backend/AddressPH.js?v=4`), then press **Ctrl+F5**.
4. Always open the site through `http://localhost/lostandfound/`, never by double-clicking the file.

If a data file is missing, the checkout now shows a red message naming the exact file, and falls back to the old list so orders still work.

---

## 7. Moving to hosting later

Any PHP 7.4+ host with MySQL works (Hostinger, InfinityFree, cPanel hosts).

1. Create a database.
2. Import your data. Before importing `Schema.sql`, delete its `CREATE DATABASE` and `USE` lines.
3. Upload the folder.
4. Create `backend/config.local.php` with the database details (see `config.local.example.php`), plus the Gmail lines (section 5), plus `'app_url' => 'https://your-site.com'`.
5. If you imported an empty database, run `setup.php` once and delete it.
6. Enable SSL (HTTPS).

For Vercel, read `VERCEL_DEPLOY.md`; it needs a PHP host as well.

---

## 8. Test checklist

These were all run automatically against the real code (PHP 8.3 + MariaDB, case-sensitive Linux), with **no failures**:

| Suite | Result |
|---|---|
| Core security & data (logins, lockout, CSRF, permissions, uploads, orders/stock, reviews, events, feedback) | 66 / 66 |
| Website UI, driven in a headless browser | 26 / 26 |
| Change password + history | 22 + 14 |
| J&T shipping, checkout, admin-approved reset | 39 / 39 |
| Forgot password + shipping UI | 22 / 22 |
| Recovery emails + reset links (outbox and real SMTP) | 41 / 41 |
| Recovery email + forgot password UI | 21 / 21 |
| Address with typing suggestions (City/Province/Barangay, sorting, spelling, auto shipping, saved address, missing-data message) | 28 / 28 |
| Address data 2Q 2026 (42,010 barangays vs source: 0 missing/extra; Sawata, Calaca merger, Sulu → Region IX) | 4 / 4 + code-by-code check |

**Repeat these on your PC:**

| # | Test | Expected |
|---|---|---|
| 1 | Log in with admin / admin123 | Fails |
| 2 | Log in with your setup.php admin | Dashboard opens; a recovery email pop-up appears if no email is verified |
| 3 | Add your email → open the newest file in `backend/mail_outbox/` → **Verify email** | "Email verified ✓"; Security tab shows **Verified** |
| 4 | Log out → Forgot password? → Admin → your username → Send reset link | Popup: link sent to the trusted email |
| 5 | Open the newest outbox file → Reset password → new password | "Password changed ✓"; the new password logs in |
| 6 | Merchant first login with a temporary password | Must set a new password, then add a recovery email |
| 7 | Add a product with a photo → phpMyAdmin `products` | Row saved, `img` = `uploads/products/…` |
| 8 | Refresh / log out / other browser | Product still there |
| 9 | Console: `api('products',{method:'PUT',id:8,body:{name:'X',tag:'Top',size:'L',price:1}})` as another merchant | "You do not have permission" |
| 10 | Checkout 1 cap → type **lip** in City → choose *Lipa City — Batangas* (province fills in) → type a barangay → street | Shipping ₱85, Total = price + ₱85; switching to Metro Manila shows ₱95; phpMyAdmin `orders.address` = full address |
| 11 | 5 wrong passwords | 10-minute lockout (clear early with `DELETE FROM login_attempts;`) |

---

## 9. CHANGED LINES in your original files

Line numbers are from **your original files**. Generated automatically by comparing your originals with the final files, so this is the complete list. Everything else was added in new files.

### 1. `lostandfound.html` — line 554

*Why:* Removed default password "123"; password field.

**Old:**
````html
    <input id="nb-pass" class="pay-input" placeholder="e.g. 123" value="123">
````
**New:**
````html
    <input id="nb-pass" class="pay-input" type="password" placeholder="Min. 10 characters, letters + numbers" autocomplete="new-password">
````

### 2. `lostandfound.html` — line 572

*Why:* Placeholder shows the real password rule.

**Old:**
````html
    <input id="sec-new" class="pay-input" type="password" placeholder="Min. 4 characters">
````
**New:**
````html
    <input id="sec-new" class="pay-input" type="password" placeholder="Min. 10 characters, letters + numbers">
````

### 3. `lostandfound.html` — line 792

*Why:* Removed the visible "admin / admin123" hint.

**Old:**
````html
        <p class="mm-hint">Admin login: <strong>admin / admin123</strong></p>
````
**New:**
````html
(line left empty)
````

### 4. `lostandfound.html` — line 799

*Why:* Removed the visible "Default password for merchants: 123" hint.

**Old:**
````html
        <p class="mm-hint">Default password for merchants: <strong>123</strong></p>
````
**New:**
````html
(line left empty)
````

### 5. `lostandfound.html` — line 1016

*Why:* Fixed the wrong path/capitalisation of Sync.js and loaded the new feature files in order (7 script tags).

**Old:**
````html
<script src="../backend/sync.js"></script>
````
**New:**
````html
<script src="backend/Sync.js?v=4"></script>
<script src="backend/SyncSecure.js?v=4"></script>
<script src="backend/AccountSecurity.js?v=4"></script>
<script src="backend/PasswordReset.js?v=4"></script>
<script src="backend/ShippingJNT.js?v=4"></script>
<script src="backend/EmailFeature.js?v=4"></script>
<script src="backend/AddressPH.js?v=4"></script>
````

### 6. `lostandfound.js` — line 80

*Why:* Removed hard-coded merchant passwords.

**Old:**
````javascript
const MERCHANT_ACCOUNTS={lostandfound:'123',geckoman:'123',hooksnloops:'123',outhrift:'123','10thrift':'123',chasingscents:'123',beadsunstoppable:'123',zero4thrift:'123',kriztianothrift:'123',perfumesbatangas:'123',selahessentials:'123',thriftthread:'123',soltheminishop:'123',daveskybiker:'123'};
````
**New:**
````javascript
const MERCHANT_ACCOUNTS={}; // passwords are checked ONLY by the server (backend/Api.php)
````

### 7. `lostandfound.js` — line 631

*Why:* Removed the client-side admin/admin123 check (server-only login).

**Old:**
````javascript
    if(user!=='admin'||pass!=='admin123'){document.getElementById('mm-error').style.display='block';return;}
````
**New:**
````javascript
    {document.getElementById('mm-error').style.display='block';return;} // login is verified ONLY by the server (backend/Sync.js → Api.php)
````

### 8. `lostandfound.js` — line 1479

*Why:* Removed default password "123".

**Old:**
````javascript
  const pass=document.getElementById('nb-pass').value.trim()||'123';
````
**New:**
````javascript
  const pass=document.getElementById('nb-pass').value;
````

### 9. `lostandfound.js` — line 1487

*Why:* Removed default password "123".

**Old:**
````javascript
  document.getElementById('nb-pass').value='123';
````
**New:**
````javascript
  document.getElementById('nb-pass').value='';
````

### 10. `backend/Sync.js` — line 17

*Why:* API file is Api.php (capital A), needed on Linux hosts.

**Old:**
````javascript
   const API = 'backend/api.php';
````
**New:**
````javascript
   const API = 'backend/Api.php';
````

### 11. `backend/Sync.js` — line 424

*Why:* Removed default password "123".

**Old:**
````javascript
  const pass = document.getElementById('nb-pass').value.trim() || '123';
````
**New:**
````javascript
  const pass = document.getElementById('nb-pass').value;
````

### 12. `backend/Sync.js` — line 431

*Why:* Removed default password "123".

**Old:**
````javascript
    document.getElementById('nb-pass').value = '123';
````
**New:**
````javascript
    document.getElementById('nb-pass').value = '';
````

### 13. `Schema.sql` — line 27

*Why:* No default merchant password.

**Old:**
````sql
  password VARCHAR(255) DEFAULT '123',
````
**New:**
````sql
  password VARCHAR(255) NULL DEFAULT NULL,
````

### 14. `Schema.sql` — lines 186–192

*Why:* Removed the seeded admin/admin123.

**Old:**
````sql
-- Admin password stored hashed (bcrypt) so it works with the real
-- login system in api.php. Login is still admin / admin123.
-- (This hash is password_hash('admin123', PASSWORD_DEFAULT) — verified
-- with password_verify() to actually match 'admin123'.)
INSERT INTO site_settings (setting_key, setting_value) VALUES
('admin_username','admin'),
('admin_password','$2y$10$HOCOrE2WBpvkXQIw5//q2udSuOvIsprd2wPPKruttd4S67Gt0hgji');
````
**New:**
````sql
-- No admin account is seeded. Run backend/setup.php once to create
-- your own admin username and password (stored as a bcrypt hash).

````

### 15. `Schema.sql` — lines 197–199

*Why:* Comment updated.

**Old:**
````sql
-- looks identical on day one. Merchant passwords are seeded as
-- plain '123' — api.php accepts either plain-text (legacy/seed)
-- or bcrypt hashes, and always re-hashes on password change.
````
**New:**
````sql
-- looks identical on day one. Merchant passwords are NOT seeded:
-- backend/setup.php gives each merchant a random temporary password
-- that must be changed on first login.
````

### 16. `Schema.sql` — lines 203–216

*Why:* Seed merchants get NULL passwords (setup.php gives temporary ones).

**Old:**
````sql
('lostandfound','Lost & Found','admin','Lost & Found system administrator. Full access to all merchants, products, orders, and settings.','brand pics/logolostandfound.jpg','#0c0b09','Batangas','','', '', 0,'admin123'),
('geckoman','Geckoman','hat','Quality caps and headwear for every style. Hats only — snapbacks, buckets, truckers & more.','brand pics/gecko.jpg','#1a0a00','Batangas','2021','Every Saturday, 8AM–5PM','@geckoman_ph',142,'123'),
('hooksnloops','Hooks n Loops','crochet','Crochet items and so much more! Bags, accessories, stuffed toys & handmade creations by Batangas locals.','brand pics/Hooks  Loops.jpg','#0a1a0a','Batangas','2022','Weekends','@hooksnloops',98,'123'),
('outhrift','Outhrift','thrift','Curated vintage tees, hoodies, and streetwear at affordable prices. Hand-picked thrift finds — tshirts, hoodies, jackets & more.','brand pics/outhrift.jpg','#001a0a','Batangas','2020','Every Weekend, 9AM–6PM','@outhrift',318,'123'),
('10thrift','10 Thrift','thrift','Affordable thrift finds, hand-picked weekly from local bazaars and ukay-ukay. Tops, bottoms, outerwear & more.','brand pics/10thrift.jpg','#0a0a1a','Batangas','2020','Every Saturday','@10thrift',187,'123'),
('chasingscents','Chasing Scents','perfume','Premium perfumes and niche fragrances. Wide selection of EDP, EDT, and body mists at great prices.','brand pics/chasingscents.jpg','#1a001a','Batangas','2022','Weekends, 10AM–5PM','@chasingscentsph',256,'123'),
('beadsunstoppable','Beads Unstoppable','thrift','Beads Unstoppable — quality thrift pieces at unbeatable prices. Tops, bottoms, outerwear & more.','brand pics/greatdilemma.jpg','#1a1a00','Batangas','2022','Sundays, 8AM–4PM','@beadsunstoppable',98,'123'),
('zero4thrift','Zero4Thrift','thrift','Fresh thrift drops every week. Tops, bottoms, outerwear & more at zero-budget prices.','brand pics/zero4thrift.jpg','#0a0010','Batangas','2021','Weekends','@zero4thrift',134,'123'),
('kriztianothrift','Kriztiano Thrift','thrift','Kriztiano Thrift — your go-to for affordable pre-loved fashion finds in Batangas.','brand pics/kriztianothrift.jpg','#1a0800','Batangas','2023','Every Weekend','@kriztianothrift',77,'123'),
('perfumesbatangas','Arranged by Annita','aniknik','Arranged by Annita — beautiful handcrafted bouquets and floral arrangements for every occasion.','brand pics/Perfumes Batangas by Arashi.jpg','#1a000a','Batangas','2022','Weekends','@arrangedbyannita',201,'123'),
('selahessentials','Selah Essentials','perfume','Carefully curated essential perfumes and scents. Calm your senses with Selah.','brand pics/Selah Essentials.jpg','#001010','Batangas','2023','Weekends','@selahessentials',88,'123'),
('thriftthread','Thrift Thread','thrift','Thrift Thread — curated pre-loved fashion finds for the budget-conscious fashionista in Batangas.','brand pics/Fivis Thrift.jpg','#0a1000','Batangas','2021','Every Weekend','@thriftthread',145,'123'),
('soltheminishop','Sol The Mini Shop','aniknik','Your neighborhood anik-anik shop! Collectibles, cute finds, accessories, novelty items & lifestyle products.','brand pics/soltheminishop.jpg','#10001a','Batangas','2023','Weekends','@soltheminishop',109,'123'),
('daveskybiker','Daveskybiker 3D Printing','3dprint','3D printing services for students, schools, creators & local businesses. Powered by Bambu Lab P2S, A1 & Elegoo Centauri Carbon.','brand pics/Daveskybiker 3D Printing.jpg','#001020','Batangas','2022','Order anytime, pickup on market days','@daveskybiker',77,'123');
````
**New:**
````sql
('lostandfound','Lost & Found','admin','Lost & Found system administrator. Full access to all merchants, products, orders, and settings.','brand pics/logolostandfound.jpg','#0c0b09','Batangas','','', '', 0,NULL),
('geckoman','Geckoman','hat','Quality caps and headwear for every style. Hats only — snapbacks, buckets, truckers & more.','brand pics/gecko.jpg','#1a0a00','Batangas','2021','Every Saturday, 8AM–5PM','@geckoman_ph',142,NULL),
('hooksnloops','Hooks n Loops','crochet','Crochet items and so much more! Bags, accessories, stuffed toys & handmade creations by Batangas locals.','brand pics/Hooks  Loops.jpg','#0a1a0a','Batangas','2022','Weekends','@hooksnloops',98,NULL),
('outhrift','Outhrift','thrift','Curated vintage tees, hoodies, and streetwear at affordable prices. Hand-picked thrift finds — tshirts, hoodies, jackets & more.','brand pics/outhrift.jpg','#001a0a','Batangas','2020','Every Weekend, 9AM–6PM','@outhrift',318,NULL),
('10thrift','10 Thrift','thrift','Affordable thrift finds, hand-picked weekly from local bazaars and ukay-ukay. Tops, bottoms, outerwear & more.','brand pics/10thrift.jpg','#0a0a1a','Batangas','2020','Every Saturday','@10thrift',187,NULL),
('chasingscents','Chasing Scents','perfume','Premium perfumes and niche fragrances. Wide selection of EDP, EDT, and body mists at great prices.','brand pics/chasingscents.jpg','#1a001a','Batangas','2022','Weekends, 10AM–5PM','@chasingscentsph',256,NULL),
('beadsunstoppable','Beads Unstoppable','thrift','Beads Unstoppable — quality thrift pieces at unbeatable prices. Tops, bottoms, outerwear & more.','brand pics/greatdilemma.jpg','#1a1a00','Batangas','2022','Sundays, 8AM–4PM','@beadsunstoppable',98,NULL),
('zero4thrift','Zero4Thrift','thrift','Fresh thrift drops every week. Tops, bottoms, outerwear & more at zero-budget prices.','brand pics/zero4thrift.jpg','#0a0010','Batangas','2021','Weekends','@zero4thrift',134,NULL),
('kriztianothrift','Kriztiano Thrift','thrift','Kriztiano Thrift — your go-to for affordable pre-loved fashion finds in Batangas.','brand pics/kriztianothrift.jpg','#1a0800','Batangas','2023','Every Weekend','@kriztianothrift',77,NULL),
('perfumesbatangas','Arranged by Annita','aniknik','Arranged by Annita — beautiful handcrafted bouquets and floral arrangements for every occasion.','brand pics/Perfumes Batangas by Arashi.jpg','#1a000a','Batangas','2022','Weekends','@arrangedbyannita',201,NULL),
('selahessentials','Selah Essentials','perfume','Carefully curated essential perfumes and scents. Calm your senses with Selah.','brand pics/Selah Essentials.jpg','#001010','Batangas','2023','Weekends','@selahessentials',88,NULL),
('thriftthread','Thrift Thread','thrift','Thrift Thread — curated pre-loved fashion finds for the budget-conscious fashionista in Batangas.','brand pics/Fivis Thrift.jpg','#0a1000','Batangas','2021','Every Weekend','@thriftthread',145,NULL),
('soltheminishop','Sol The Mini Shop','aniknik','Your neighborhood anik-anik shop! Collectibles, cute finds, accessories, novelty items & lifestyle products.','brand pics/soltheminishop.jpg','#10001a','Batangas','2023','Weekends','@soltheminishop',109,NULL),
('daveskybiker','Daveskybiker 3D Printing','3dprint','3D printing services for students, schools, creators & local businesses. Powered by Bambu Lab P2S, A1 & Elegoo Centauri Carbon.','brand pics/Daveskybiker 3D Printing.jpg','#001020','Batangas','2022','Order anytime, pickup on market days','@daveskybiker',77,NULL);
````

---

## 10. New / replaced / deleted files

**Replaced** (same API routes and JSON, rebuilt so permissions are enforced on the server): `backend/Api.php`, `backend/Config.php`.

**Deleted:** `backend/reset-admin-password.php` and `fix-admin-login.sql` (both reset the login to admin/admin123); the 10 duplicate bridge files `core.js`, `auth.js`, `products.js`, `orders.js`, `brands.js`, `events.js`, `images.js`, `testimonials.js`, `notifications.js`, `feedback.js`; and the XAMPP leftovers `applications.html` and `bitnami.css`.

**New:** every other file under `backend/`, the address data in `data/ph-address/` (official PSA PSGC 2Q 2026, taken from the Tenasia/ph-psgc JSON mirror and verified code-by-code against PSA’s announced changes; data files are not printed below), `tools/update-address-data.py`, plus `Schema_update.sql`, `Schema_password_log.sql`, the `.htaccess` files, `vercel.json`, `.vercelignore` and the `uploads/` folder. Their purpose is shown in section 2. PHPMailer (`backend/lib/PHPMailer/`) is the official open-source library (LGPL 2.1, license included) and is not printed below.

---

## 11. Full source code

Sorted by folder. Images and the PHPMailer library are only in the zip.

### 11.1 `.htaccess`  (22 lines)

````apache
# ============================================================
# .htaccess (project root) — works on XAMPP and most PHP hosts
# ============================================================
Options -Indexes
DirectoryIndex lostandfound.html index.php index.html

# Never serve database dumps, docs or backups over the web
<FilesMatch "\.(sql|md|log|bak|zip)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</FilesMatch>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "same-origin"
</IfModule>
````

### 11.2 `.vercelignore`  (15 lines)

````apache
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

### 11.3 `vercel.json`  (112 lines)

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

### 11.4 `lostandfound.html`  (1024 lines)

````html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lost &amp; Found — Flea Market</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="lostandfound.css">
</head>
<body>
<div class="site-badge">Lost &amp; Found · Flea Market · Batangas</div>
<div class="spinner-overlay" id="spinner"><div class="spinner"></div></div>
<button id="back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})">↑</button>

<header id="topbar">
<div class="topbar-brand" onclick="navigateTo('home')">
  <div style="display:flex;flex-direction:column;gap:1px">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:1.25rem;letter-spacing:.12em;color:var(--black);line-height:1">Lost &amp; Found</div>
    <div style="font-size:.58rem;letter-spacing:.22em;text-transform:uppercase;color:var(--g4);font-weight:600">Flea Market · Batangas</div>
  </div>
</div>
  <nav class="topbar-nav customer-nav" id="customer-nav">
    <button class="tn-btn active" onclick="navigateTo('home')">Home</button>
    <button class="tn-btn" onclick="navigateTo('catalog')">Catalog</button>
    <button class="tn-btn" onclick="navigateTo('arrivals')">New Arrivals</button>
    <button class="tn-btn" onclick="navigateTo('orders')">My Orders</button>
    <button class="tn-btn" onclick="navigateTo('events')"> Events</button>
  </nav>

  <button class="tb-icon-btn" id="search-toggle-btn" onclick="toggleSearchOverlay()" aria-label="Search" title="Search (Ctrl+K)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
  <div class="topbar-actions">
<div class="tb-social">
  <a class="tb-social-link fb-link" href="https://www.facebook.com/profile.php?id=61573977934781" target="_blank" rel="noopener" title="Facebook">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  </a>
  <a class="tb-social-link ig-link" href="https://www.instagram.com/lostandfound043/" target="_blank" rel="noopener" title="Instagram">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  </a>
</div>
    <div class="notif-wrapper" id="customer-notif-wrapper">
      <button class="tb-icon-btn" onclick="toggleNotif('customer')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="tb-badge" id="notif-count">0</span></button>
      <div class="notif-dropdown" id="notif-dropdown">
        <div class="notif-hd"><span class="notif-hd-title">Notifications</span><button class="notif-clear-btn" onclick="clearNotifs('customer')">Clear all</button></div>
        <div id="notif-list"><div class="notif-empty-msg"><span class="notif-empty-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span>No notifications yet</div></div>
      </div>
    </div>
    <div class="notif-wrapper merch-notif-wrap" id="merch-notif-wrap">
      <button class="tb-icon-btn" style="border-color:var(--accent)" onclick="toggleNotif('merchant')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"/></svg><span class="tb-badge" id="merch-notif-count">0</span></button>
      <div class="notif-dropdown" id="merch-notif-dropdown">
        <div class="notif-hd"><span class="notif-hd-title">Merchant Alerts</span><button class="notif-clear-btn" onclick="clearNotifs('merchant')">Clear all</button></div>
        <div id="merch-notif-list"><div class="notif-empty-msg"><span class="notif-empty-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"/></svg></span>No merchant alerts</div></div>
      </div>
    </div>
    <button id="merchant-btn" onclick="openMerchantModal()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Merchant</button>
    <button class="cart-btn" onclick="openCart()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Cart <span class="tb-badge on" id="cart-badge" style="position:static;opacity:0;margin-left:2px">0</span></button>
  </div>
</header>

<div class="search-overlay" id="search-overlay" role="dialog" aria-modal="true" aria-label="Search" onclick="if(event.target===this)closeSearchOverlay()">
  <div class="search-overlay-panel">
    <div class="search-overlay-bar">
      <span class="search-overlay-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
      <input class="search-overlay-input" id="search-input" type="text" placeholder="Search items, brands, categories...">
      <button class="search-overlay-close" onclick="closeSearchOverlay()" aria-label="Close search">✕</button>
    </div>
    <div id="search-results"></div>
  </div>
</div>

<main id="main">
<section class="page active" id="page-home">
  <div class="carousel-section" id="carousel-section">
    <div class="carousel-track" id="carousel-track">
      <div class="carousel-slide cs-slide-1">
        <div class="cs-bg"></div><div class="cs-overlay"></div>
        <div class="cs-content" style="color:#fff">
          <div class="cs-eyebrow">Flash Sale</div>
          <div class="cs-title">UP TO 50% OFF</div>
          <div class="cs-countdown">
            <span class="cs-countdown-label">Ends in</span>
            <div class="cs-cd-block"><span class="cs-cd-num" id="cd-days">00</span><span class="cs-cd-label">days</span></div>
            <div class="cs-cd-block"><span class="cs-cd-num" id="cd-hours">00</span><span class="cs-cd-label">hrs</span></div>
            <div class="cs-cd-block"><span class="cs-cd-num" id="cd-mins">00</span><span class="cs-cd-label">min</span></div>
            <div class="cs-cd-block"><span class="cs-cd-num" id="cd-secs">00</span><span class="cs-cd-label">sec</span></div>
          </div>
          <button class="cs-btn" style="background:var(--accent);color:var(--black)" onclick="navigateTo('catalog')">Shop Now</button>
        </div>
      </div>
      <div class="carousel-slide cs-slide-2">
        <div class="cs-bg"></div><div class="cs-overlay"></div>
        <div class="cs-content" style="color:#fff">
          <div class="cs-eyebrow">Weekend Event</div>
          <div class="cs-title">JULY 15–16 MARKET DAY</div>
          <div class="cs-desc">Join us at Batangas for the biggest flea market event of the year.</div>
          <button class="cs-btn" style="background:#fff;color:var(--black)" onclick="navigateTo('catalog')">See Brands</button>
        </div>
      </div>
      <div class="carousel-slide cs-slide-3">
        <div class="cs-bg"></div><div class="cs-overlay"></div>
        <div class="cs-content" style="color:#fff">
          <div class="cs-eyebrow">New Arrivals</div>
          <div class="cs-title">FRESH DROPS WEEKLY</div>
          <div class="cs-desc">New thrift finds, kicks, and fragrances added every week from local Batangas brands.</div>
          <button class="cs-btn" style="background:var(--green);color:#fff" onclick="navigateTo('arrivals')">See New</button>
        </div>
      </div>
      <div class="carousel-slide cs-slide-4">
        <div class="cs-bg"></div><div class="cs-overlay"></div>
        <div class="cs-content" style="color:#fff">
          <div class="cs-eyebrow">GCash &amp; PayMaya</div>
          <div class="cs-title">EASY ONLINE PAYMENT</div>
          <div class="cs-desc">Secure digital payment only. We do not accept Cash on Delivery.</div>
          <button class="cs-btn" style="background:var(--accent);color:var(--black)" onclick="navigateTo('catalog')">Shop Now</button>
        </div>
      </div>
    </div>
    <button class="carousel-arrow carousel-prev" onclick="carouselMove(-1)">←</button>
    <button class="carousel-arrow carousel-next" onclick="carouselMove(1)">→</button>
    <div class="carousel-dots" id="carousel-dots">
      <button class="carousel-dot active" onclick="carouselGo(0)"></button>
      <button class="carousel-dot" onclick="carouselGo(1)"></button>
      <button class="carousel-dot" onclick="carouselGo(2)"></button>
      <button class="carousel-dot" onclick="carouselGo(3)"></button>
    </div>
  </div>

  <div class="home-hero">
    <div class="home-hero-bg"></div>
    <div class="home-hero-content">
      <div style="position:relative;min-height:400px;overflow:visible;">
  <div style="display:inline-flex;align-items:center;gap:.6rem;background:rgba(196,144,48,.12);border:1px solid rgba(196,144,48,.3);border-radius:30px;padding:.4rem 1rem;margin-bottom:1.1rem">
    <span style="width:8px;height:8px;border-radius:50%;background:var(--accent);display:inline-block;box-shadow:0 0 8px var(--accent)"></span>
    <span style="font-size:.72rem;font-weight:700;color:var(--accent);letter-spacing:.18em;text-transform:uppercase">Batangas Flea Market</span>
  </div>
  <h1 class="home-hero-title">Lost &amp;<br><span>Found</span></h1>
  <p class="home-hero-desc">Curated thrift, perfumes, hats, crochet &amp; more from local merchants in Batangas.</p>
<img src="brand pics/LostandFound_brand-removebg-preview.png" alt="Lost & Found Mascot" id="hero-mascot" style="display:block;width:200px;position:absolute;left:-220px;top:30%;transform:translateY(-30%);z-index:2;filter:drop-shadow(0 12px 40px rgba(0,0,0,0.5)) brightness(1.05);mix-blend-mode:multiply;pointer-events:none;">
        <div class="hero-btns">
          <button class="hero-cta-primary" onclick="navigateTo('catalog')">Shop Now</button>
          <button class="hero-cta-secondary" onclick="navigateTo('arrivals')">New Arrivals</button>
        </div>
      </div>
      <div class="hero-brand-pills" id="hero-brands"></div>
    </div>
  </div>

  <div class="stats-strip">
    <div class="stats-strip-inner">
      <div class="strip-stat"><div class="strip-val" id="stat-brands">0</div><div class="strip-lbl">Brands</div></div>
      <div class="strip-stat"><div class="strip-val" id="stat-products">0</div><div class="strip-lbl">Products</div></div>
      <div class="strip-stat"><div class="strip-val" id="stat-new">0</div><div class="strip-lbl">New Drops</div></div>
      <div class="strip-stat"><div class="strip-val">J&amp;T</div><div class="strip-lbl">Express Shipping</div></div>
    </div>
  </div>

  <section class="arrivals-banner-section" id="rv-section" style="display:none">
    <div class="rv-static-title">Recently Viewed</div>
    <div class="arrivals-collage" id="rv-collage"></div>
  </section>

  <section class="arrivals-banner-section" id="reco-section" style="display:none">
    <div class="rv-static-title">Recommended For You</div>
    <div class="arrivals-collage" id="reco-collage"></div>
  </section>

  <section class="arrivals-banner-section">
    <div class="arrivals-marquee-wrap">
      <div class="arrivals-marquee-track" id="merchants-marquee-track"></div>
    </div>
    <div class="arrivals-collage" id="merchants-collage"></div>
    <div class="arrivals-viewall-bar"><span onclick="navigateTo('catalog')">All Brands</span></div>
  </section>

  <section class="arrivals-banner-section">
    <div class="arrivals-marquee-wrap">
      <div class="arrivals-marquee-track" id="arrivals-marquee-track"></div>
    </div>
    <div class="arrivals-collage" id="arrivals-collage"></div>
    <div class="arrivals-viewall-bar"><span onclick="navigateTo('arrivals')">View All New Arrivals</span></div>
  </section>

  <section class="arrivals-banner-section">
    <div class="arrivals-marquee-wrap">
      <div class="arrivals-marquee-track" id="trending-marquee-track"></div>
    </div>
    <div class="arrivals-collage" id="trending-collage"></div>
  </section>

  <div class="testimonials-section">
    <div class="testimonials-inner">
      <div class="section-hd"><h2>What Customers Say</h2></div>
      <div class="testimonials-grid" id="testimonials-grid"></div>
    </div>
  </div>

  <div class="newsletter-section">
    <div class="newsletter-inner">
      <h3>Stay in the Loop</h3>
      <p>Get notified about flash sales, new drops, and market events in Batangas.</p>
      <div class="newsletter-form">
        <input type="email" id="newsletter-email" placeholder="your@email.com">
        <button class="newsletter-submit" onclick="subscribeNewsletter()">Subscribe</button>
      </div>
    </div>
  </div>

  <footer>
    <div class="footer-inner">
      <div>
        <div class="footer-brand-name">Lost &amp; Found</div>
        <p class="footer-desc">Flea Market · Batangas, PH<br>Supporting local Batangas merchants.</p>
        <div class="footer-social">
          <a class="footer-social-link" href="https://www.facebook.com/profile.php?id=61573977934781" target="_blank">f</a>
          <a class="footer-social-link" href="https://www.instagram.com/lostandfound043/" target="_blank" style="font-style:italic">ig</a>
        </div>
      </div>
      <div class="footer-col"><h4>Shop</h4><ul><li><span onclick="navigateTo('catalog')">All Brands</span></li><li><span onclick="navigateTo('arrivals')">New Arrivals</span></li><li><span onclick="navigateTo('events')">Events</span></li></ul></div>
      <div class="footer-col"><h4>Account</h4><ul><li><span onclick="navigateTo('orders')">My Orders</span></li><li><span onclick="openMerchantModal()">Merchant Login</span></li></ul></div>
      <div class="footer-col"><h4>Follow Us</h4><ul>
        <li><a href="https://www.facebook.com/profile.php?id=61573977934781" target="_blank">Facebook</a></li>
        <li><a href="https://www.instagram.com/lostandfound043/" target="_blank">Instagram</a></li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Lost &amp; Found · Flea Market · Batangas</span>
      <span>Powered by HTML/CSS/JS</span>
    </div>
  </footer>
</section>

<section class="page" id="page-catalog">
  <div class="page-container">
    <div class="breadcrumb" id="catalog-bc">
      <a onclick="navigateTo('home')">Home</a><span>›</span><span>Catalog</span>
    </div>
    <div class="brand-selected-header" id="bsh">
      <div class="bsh-thumb" id="bsh-thumb"></div>
      <div><div class="bsh-name" id="bsh-name"></div><div class="bsh-count" id="bsh-count"></div></div>
      <button class="bsh-back" onclick="showAllBrands()">← All Brands</button>
    </div>
    <div id="brand-grid-wrap">
      <div class="filter-sort-bar">
        <button class="f-btn on" onclick="filterBrands('all',this)">All</button>
        <button class="f-btn" onclick="filterBrands('thrift',this)">Thrift</button>
        <button class="f-btn" onclick="filterBrands('perfume',this)">Perfumes</button>
        <button class="f-btn" onclick="filterBrands('hat',this)">Hats</button>
        <button class="f-btn" onclick="filterBrands('crochet',this)">Crochet</button>
        <button class="f-btn" onclick="filterBrands('3dprint',this)">3D Print</button>
        <button class="f-btn" onclick="filterBrands('aniknik',this)">Anik-anik</button>
        <select class="sort-select" id="brand-sort" onchange="renderBrandGrid()">
          <option value="default">Default</option>
          <option value="name-az">Name A–Z</option>
          <option value="name-za">Name Z–A</option>
          <option value="items">Most Items</option>
        </select>
      </div>
      <div class="brand-grid" id="brand-grid"></div>
    </div>
    <div id="brand-prods-wrap" style="display:none">
      <div class="filter-sort-bar">
        <button class="f-btn on" onclick="filterProdNew('all',this)">All</button>
        <button class="f-btn" onclick="filterProdNew('new',this)">New</button>
        <select class="sort-select" id="prod-sort" onchange="applyBrandProdFilters()">
          <option value="default">Sort: Default</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="name-az">Name A–Z</option>
          <option value="newest">Newest First</option>
        </select>
      </div>
      <div id="brand-events-section" style="display:none;margin-bottom:2rem">
  <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;margin-bottom:1.1rem;padding-bottom:.7rem;border-bottom:1px solid var(--g2)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Upcoming Events from this Brand</div>
  <div id="brand-events-list"></div>
</div>
<div class="product-grid" id="brand-prods-grid"></div>
<div class="pagination" id="catalog-pg"></div>
    </div>
  </div>
</section>

<section class="page" id="page-arrivals">
  <div class="arrivals-banner">
    <div class="arrivals-banner-bg"></div>
    <div class="arrivals-banner-content">
      <h1>New Arrivals</h1>
      <p style="font-size:.95rem;color:rgba(255,255,255,.55);margin:.5rem 0 1.1rem">Fresh finds added weekly from Batangas merchants</p>
      <div class="arr-badge">Just In</div>
    </div>
  </div>
  <div class="page-container">
    <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a><span>›</span><span>New Arrivals</span></div>
    <div class="filter-sort-bar">
      <select class="sort-select" id="arr-sort" onchange="renderArrivals()">
        <option value="default">Sort: Default</option>
        <option value="price-low">Price: Low → High</option>
        <option value="price-high">Price: High → High</option>
        <option value="name-az">Name A–Z</option>
      </select>
    </div>
    <div class="product-grid" id="arrivals-grid"></div>
  </div>
</section>

<section class="page" id="page-product">
  <div class="pd-container">
    <div class="breadcrumb" id="pd-bc">
      <a onclick="navigateTo('home')">Home</a><span>›</span>
      <a onclick="navigateTo('catalog')">Catalog</a><span>›</span>
      <span id="pd-bc-name">Product</span>
    </div>
    <div id="pd-container"></div>
  </div>
</section>

<section class="page" id="page-orders">
  <div class="page-container">
    <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a><span>›</span><span>My Orders</span></div>
    <div class="orders-hd">My Orders</div>
    <div id="orders-list"></div>
  </div>
</section>

<section class="page" id="page-events">
  <div class="events-banner">
    <div class="events-banner-bg"></div>
    <div class="events-banner-content">
      <h1>Market Events</h1>
      <p style="font-size:.9rem;color:rgba(255,255,255,.5);margin:.4rem 0 .9rem">Where to find us next — flea markets, pop-ups & bazaars</p>
      <div class="events-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Batangas & Beyond</div>
    </div>
  </div>
  <div class="page-container">
    <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a><span>›</span><span>Events</span></div>
    <div id="events-filter-bar" style="display:flex;gap:.55rem;margin-bottom:1.6rem;flex-wrap:wrap;align-items:center">
      <button class="f-btn on" onclick="filterEvents('all',this)">All</button>
      <button class="f-btn" onclick="filterEvents('upcoming',this)">Upcoming</button>
      <button class="f-btn" onclick="filterEvents('ongoing',this)">Ongoing</button>
      <button class="f-btn" onclick="filterEvents('past',this)">Past</button>
    </div>
    <div id="events-list"></div>
  </div>
</section>

<!-- ════════════════════════════════════════════ -->
<!-- MERCHANT DASHBOARD -->
<!-- ════════════════════════════════════════════ -->
<section class="page" id="page-merchant">
  <div class="page-container">
    <div class="merch-page-hd">
      <div class="merch-page-title" id="merch-title">Dashboard</div>
      <button class="merch-logout-btn" onclick="merchantLogout()">Logout</button>
    </div>
    <div class="merch-stats" id="merch-stats-grid"></div>
    <div class="merch-tabs">
      <div class="mt-tab-indicator" id="mt-tab-indicator"></div>
      <div class="ms-brand"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> Management</div>
      <button class="mt-tab active" data-tab="products" onclick="showMerchTab('products',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Products</button>
      <button class="mt-tab" data-tab="orders" onclick="showMerchTab('orders',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z"/><rect x="4" y="5" width="16" height="16" rx="2"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/></svg> Orders</button>
      <button class="mt-tab" data-tab="analytics" onclick="showMerchTab('analytics',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> Analytics</button>
      <button class="mt-tab" data-tab="inventory" onclick="showMerchTab('inventory',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> Inventory</button>
      <button class="mt-tab" data-tab="brand" onclick="showMerchTab('brand',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> My Brand</button>
      <button class="mt-tab" data-tab="reviews" onclick="showMerchTab('reviews',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Reviews</button>
      <button class="mt-tab" data-tab="events" onclick="showMerchTab('events',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Events</button>
      <button class="mt-tab" data-tab="feedback" onclick="showMerchTab('feedback',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> Feedback</button>
<button class="mt-tab" data-tab="siteimages" onclick="showMerchTab('siteimages',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Site Images</button>
<button class="mt-tab admin-only-tab" data-tab="brands" onclick="showMerchTab('brands',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"/></svg> Manage Merchants</button>
<button class="mt-tab admin-only-tab" data-tab="categories" onclick="showMerchTab('categories',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Categories</button>
<button class="mt-tab admin-only-tab" data-tab="approvals" onclick="showMerchTab('approvals',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Approvals</button>
<button class="mt-tab" data-tab="security" onclick="showMerchTab('security',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg> Security</button>
      <button class="mt-tab" data-tab="testimonial" onclick="showMerchTab('testimonial',this)"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Request Testimonial</button>
      <div class="ms-divider"></div>
      <button class="mt-tab mgmt-home-btn" onclick="navigateTo('home')">🏠 Customer Homepage</button>
    </div>

    <!-- PRODUCTS PANEL -->
    <div id="merch-panel-products" class="merch-panel">
      <div class="merch-product-toolbar">
        <button class="merch-add-btn" onclick="openProductModal(null)" style="margin-bottom:0">+ Add Product</button>
        <div class="merch-search-wrap">
          <span class="merch-search-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          <input type="text" id="merch-prod-search" placeholder="Search products by name, ID, category..." oninput="renderMerchProductTable()">
        </div>
      </div>
      <div style="overflow-x:auto">
        <table class="merch-table">
          <thead><tr><th>ID</th><th>Image</th><th>Product</th><th>Category</th><th>Price</th><th>Size</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody id="merch-product-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- ORDERS PANEL -->
    <div id="merch-panel-orders" class="merch-panel" style="display:none">
      <!-- Order Status Navigation Tabs -->
      <div class="order-status-nav" id="order-status-nav">
        <button class="osn-tab active" onclick="setOrderStatusFilter('all',this)">
          <span class="osn-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z"/><rect x="4" y="5" width="16" height="16" rx="2"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/></svg></span>
          <span class="osn-label">All Orders</span>
          <span class="osn-count" id="osn-count-all">0</span>
        </button>
        <button class="osn-tab" onclick="setOrderStatusFilter('pending',this)">
          <span class="osn-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
          <span class="osn-label">Pending</span>
          <span class="osn-count has-items" id="osn-count-pending">0</span>
        </button>
        <button class="osn-tab" onclick="setOrderStatusFilter('confirmed',this)">
          <span class="osn-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>
          <span class="osn-label">Confirmed</span>
          <span class="osn-count" id="osn-count-confirmed">0</span>
        </button>
        <button class="osn-tab" onclick="setOrderStatusFilter('packed',this)">
          <span class="osn-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>
          <span class="osn-label">Packed</span>
          <span class="osn-count" id="osn-count-packed">0</span>
        </button>
        <button class="osn-tab" onclick="setOrderStatusFilter('shipped',this)">
          <span class="osn-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></span>
          <span class="osn-label">Shipped</span>
          <span class="osn-count" id="osn-count-shipped">0</span>
        </button>
        <button class="osn-tab" onclick="setOrderStatusFilter('delivered',this)">
          <span class="osn-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M5.8 11.3L2 22l10.7-3.8"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="M11 13c1.7-1.28 3.5-1.28 5.2 0L18 15l1.5-1.5"/></svg></span>
          <span class="osn-label">Delivered</span>
          <span class="osn-count" id="osn-count-delivered">0</span>
        </button>
      </div>
      <div id="merch-orders-list"></div>
    </div>

    <div id="merch-panel-analytics" class="merch-panel" style="display:none">
      <div class="chart-container"><canvas id="salesChart"></canvas></div>
      <div style="font-family:'Bebas Neue';font-size:1.5rem;margin-bottom:1.1rem">Top Selling Products</div>
      <ul class="top-products-list" id="top-products-list"></ul>
    </div>
    <div id="merch-panel-inventory" class="merch-panel" style="display:none">
      <p style="font-size:.9rem;color:var(--g4);margin-bottom:1.6rem">Manage your product stock levels.</p>
      <div id="inventory-list"></div>
    </div>
    <div id="merch-panel-brand" class="merch-panel" style="display:none"><div id="merch-brand-profile"></div></div>
    <div id="merch-panel-reviews" class="merch-panel" style="display:none"><div id="merch-reviews-list"></div></div>
    <div id="merch-panel-testimonial" class="merch-panel" style="display:none">
  <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;margin-bottom:2rem;box-shadow:var(--shadow)">
    <h3 style="font-family:'Bebas Neue',sans-serif;font-size:1.45rem;margin-bottom:1.1rem;letter-spacing:.04em">Request a Testimonial</h3>
    <p style="font-size:.875rem;color:var(--g4);margin-bottom:1.1rem;line-height:1.6">Submit a customer testimonial for admin review. Once approved it will appear on the homepage.</p>
    <label class="pay-label">Customer Name *</label>
    <input id="tr-name" class="pay-input" placeholder="e.g. Maria Santos">
    <label class="pay-label">Location *</label>
    <input id="tr-loc" class="pay-input" placeholder="e.g. Lipa, Batangas">
    <label class="pay-label">Star Rating *</label>
    <select id="tr-rating" class="pay-input">
      <option value="5">★★★★★ 5 stars</option>
      <option value="4">★★★★☆ 4 stars</option>
      <option value="3">★★★☆☆ 3 stars</option>
      <option value="2">★★☆☆☆ 2 stars</option>
      <option value="1">★☆☆☆☆ 1 star</option>
    </select>
    <label class="pay-label">Testimonial Text *</label>
    <textarea id="tr-text" class="pay-input" style="min-height:100px;resize:vertical" placeholder="What did the customer say?"></textarea>
    <button class="edit-save-btn" style="max-width:220px;margin-top:.5rem" onclick="submitTestimonialRequest()">Submit for Approval</button>
  </div>
  <div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;margin-bottom:1rem">Your Submitted Requests</div>
  <div id="merch-testim-requests-list"></div>
</div>
<div id="merch-panel-siteimages" class="merch-panel" style="display:none">
  <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;margin-bottom:1.6rem;box-shadow:var(--shadow)">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin-bottom:1.1rem;letter-spacing:.02em"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Site Image Manager</div>
    <p style="font-size:.875rem;color:var(--g4);margin-bottom:1.6rem;line-height:1.6">Upload custom images for different sections of the site. Changes apply immediately.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem">
      <label style="display:flex;flex-direction:column;gap:.5rem;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r2);padding:1.1rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--g2)'">
        <input type="file" accept="image/*" style="display:none" onchange="adminUploadLogo(this)">
        <span style="font-size:1.8rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>
        <span style="font-size:.875rem;font-weight:700;color:var(--black)">Logo</span>
        <span style="font-size:.78rem;color:var(--g4)">Topbar logo image</span>
      </label>
      <label style="display:flex;flex-direction:column;gap:.5rem;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r2);padding:1.1rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--g2)'">
        <input type="file" accept="image/*" style="display:none" onchange="adminUploadHero(this)">
        <span style="font-size:1.8rem"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1h-3"/><path d="m8 6 4 6 2-3 4 6H4Z"/></svg></span>
        <span style="font-size:.875rem;font-weight:700;color:var(--black)">Hero Background</span>
        <span style="font-size:.78rem;color:var(--g4)">Main hero section BG</span>
      </label>
      <label style="display:flex;flex-direction:column;gap:.5rem;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r2);padding:1.1rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--g2)'">
        <input type="file" accept="image/*" style="display:none" onchange="adminUploadMascot(this)">
        <span style="font-size:1.8rem"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
        <span style="font-size:.875rem;font-weight:700;color:var(--black)">Mascot</span>
        <span style="font-size:.78rem;color:var(--g4)">Hero mascot image</span>
      </label>
      <label style="display:flex;flex-direction:column;gap:.5rem;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r2);padding:1.1rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--g2)'">
        <input type="file" accept="image/*" style="display:none" onchange="adminUploadCarousel(this,0)">
        <span style="font-size:1.8rem">1</span>
        <span style="font-size:.875rem;font-weight:700;color:var(--black)">Carousel Slide 1</span>
        <span style="font-size:.78rem;color:var(--g4)">Flash sale slide</span>
      </label>
      <label style="display:flex;flex-direction:column;gap:.5rem;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r2);padding:1.1rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--g2)'">
        <input type="file" accept="image/*" style="display:none" onchange="adminUploadCarousel(this,1)">
        <span style="font-size:1.8rem">2</span>
        <span style="font-size:.875rem;font-weight:700;color:var(--black)">Carousel Slide 2</span>
        <span style="font-size:.78rem;color:var(--g4)">Weekend event slide</span>
      </label>
      <label style="display:flex;flex-direction:column;gap:.5rem;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r2);padding:1.1rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--g2)'">
        <input type="file" accept="image/*" style="display:none" onchange="adminUploadCarousel(this,2)">
        <span style="font-size:1.8rem">3</span>
        <span style="font-size:.875rem;font-weight:700;color:var(--black)">Carousel Slide 3</span>
        <span style="font-size:.78rem;color:var(--g4)">New arrivals slide</span>
      </label>
      <label style="display:flex;flex-direction:column;gap:.5rem;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r2);padding:1.1rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--g2)'">
        <input type="file" accept="image/*" style="display:none" onchange="adminUploadCarousel(this,3)">
        <span style="font-size:1.8rem">4</span>
        <span style="font-size:.875rem;font-weight:700;color:var(--black)">Carousel Slide 4</span>
        <span style="font-size:.78rem;color:var(--g4)">Payment slide</span>
      </label>
      <label style="display:flex;flex-direction:column;gap:.5rem;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r2);padding:1.1rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--g2)'">
        <input type="file" accept="image/*" style="display:none" onchange="adminUploadArrivalsBanner(this)">
        <span style="font-size:1.8rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>
        <span style="font-size:.875rem;font-weight:700;color:var(--black)">Arrivals Banner</span>
        <span style="font-size:.78rem;color:var(--g4)">New arrivals page banner</span>
      </label>
      <label style="display:flex;flex-direction:column;gap:.5rem;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r2);padding:1.1rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--g2)'">
        <input type="file" accept="image/*" style="display:none" onchange="adminUploadEventsBanner(this)">
        <span style="font-size:1.8rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
        <span style="font-size:.875rem;font-weight:700;color:var(--black)">Events Banner</span>
        <span style="font-size:.78rem;color:var(--g4)">Events page banner</span>
      </label>
    </div>
    <button onclick="adminResetAllImages()" style="margin-top:1.6rem;display:inline-flex;align-items:center;gap:.5rem;background:#fee2e2;border:1.5px solid var(--red);color:var(--red);font-size:.855rem;font-weight:600;padding:.6rem 1.3rem;border-radius:20px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s" onmouseover="this.style.background='var(--red)';this.style.color='#fff'" onmouseout="this.style.background='#fee2e2';this.style.color='var(--red)'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Reset All Images to Default</button>
  </div>
</div>

<div id="merch-panel-approvals" class="merch-panel" style="display:none">
  <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin-bottom:1.1rem;letter-spacing:.02em"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Pending Image Approvals</div>
  <p style="font-size:.875rem;color:var(--g4);margin-bottom:1.3rem;line-height:1.6">Images uploaded by merchants waiting for your approval before going live on the site.</p>
  <div id="admin-img-approvals-list"></div>
</div>

<div id="merch-panel-brands" class="merch-panel" style="display:none">
  <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;margin-bottom:1.6rem;box-shadow:var(--shadow)">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin-bottom:1.1rem;letter-spacing:.02em"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add New Brand</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.9rem;margin-bottom:.9rem">
      <div><label class="pay-label">Brand ID * (no spaces, lowercase)</label><input id="nb-id" class="pay-input" placeholder="e.g. mybrand2024"></div>
      <div><label class="pay-label">Brand Name *</label><input id="nb-name" class="pay-input" placeholder="e.g. My Brand"></div>
      <div><label class="pay-label">Category *</label><select id="nb-tag" class="pay-input"><option value="thrift">Thrift</option><option value="perfume">Perfume</option><option value="hat">Hat</option><option value="crochet">Crochet</option><option value="3dprint">3D Print</option><option value="aniknik">Anik-anik</option></select></div>
      <div><label class="pay-label">Location</label><input id="nb-loc" class="pay-input" placeholder="e.g. Lipa City, Batangas"></div>
      <div><label class="pay-label">Year Est.</label><input id="nb-year" class="pay-input" placeholder="e.g. 2024"></div>
      <div><label class="pay-label">Instagram</label><input id="nb-ig" class="pay-input" placeholder="@yourbrand"></div>
    </div>
    <label class="pay-label">Description</label>
    <textarea id="nb-desc" class="pay-input" style="min-height:80px;resize:vertical" placeholder="Describe the brand..."></textarea>
    <label class="pay-label">Password for this merchant</label>
    <input id="nb-pass" class="pay-input" type="password" placeholder="Min. 10 characters, letters + numbers" autocomplete="new-password">
    <button onclick="adminAddBrand()" style="background:var(--black);color:#fff;border:none;padding:.75rem 1.6rem;font-family:'Inter',sans-serif;font-size:.855rem;font-weight:700;border-radius:30px;cursor:pointer;letter-spacing:.06em;text-transform:uppercase;transition:all .2s;margin-top:.5rem" onmouseover="this.style.background='var(--g5)'" onmouseout="this.style.background='var(--black)'">+ Add Brand</button>
  </div>
  <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin-bottom:1.1rem;letter-spacing:.02em"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"/></svg> All Brands</div>
  <div id="admin-brands-list"></div>
</div>
<div id="merch-panel-categories" class="merch-panel" style="display:none">
  <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin-bottom:.4rem;letter-spacing:.02em"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Product Categories</div>
  <p style="font-size:.875rem;color:var(--g4);margin-bottom:1.3rem;line-height:1.6">Categories are drawn live from the "Tag" field on every merchant's products across the whole marketplace.</p>
  <div id="admin-categories-list"></div>
</div>
<div id="merch-panel-security" class="merch-panel" style="display:none">
  <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;max-width:480px;box-shadow:var(--shadow)">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin-bottom:.4rem;letter-spacing:.02em"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg> Change Password</div>
    <p style="font-size:.875rem;color:var(--g4);margin-bottom:1.3rem;line-height:1.6">Update your merchant login password. Changes take effect immediately.</p>
    <label class="pay-label">Current Password *</label>
    <input id="sec-cur" class="pay-input" type="password" placeholder="Your current password">
    <label class="pay-label">New Password *</label>
    <input id="sec-new" class="pay-input" type="password" placeholder="Min. 10 characters, letters + numbers">
    <label class="pay-label">Confirm New Password *</label>
    <input id="sec-confirm" class="pay-input" type="password" placeholder="Repeat new password" onkeydown="if(event.key==='Enter')saveMerchantPassword()">
    <div id="sec-error" style="background:#fee2e2;border:1px solid var(--red);border-radius:var(--r);padding:.65rem 1rem;font-size:.855rem;color:var(--red);margin-bottom:.9rem;display:none"></div>
    <button class="edit-save-btn" style="max-width:220px" onclick="saveMerchantPassword()">Update Password</button>
  </div>
</div>
    <div id="merch-panel-feedback" class="merch-panel" style="display:none">
  <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin-bottom:1.1rem">Testimonial Requests</div>
  <div id="admin-testim-requests-list" style="margin-bottom:2rem"></div>
  <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin-bottom:1.1rem">Add Testimonial Manually</div>
  <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;margin-bottom:2rem;box-shadow:var(--shadow)">
    <label class="pay-label">Customer Name *</label>
    <input id="at-name" class="pay-input" placeholder="e.g. Maria Santos">
    <label class="pay-label">Location *</label>
    <input id="at-loc" class="pay-input" placeholder="e.g. Lipa, Batangas">
    <label class="pay-label">Star Rating *</label>
    <select id="at-rating" class="pay-input">
      <option value="5">★★★★★ 5 stars</option>
      <option value="4">★★★★☆ 4 stars</option>
      <option value="3">★★★☆☆ 3 stars</option>
      <option value="2">★★☆☆☆ 2 stars</option>
      <option value="1">★☆☆☆☆ 1 star</option>
    </select>
    <label class="pay-label">Testimonial Text *</label>
    <textarea id="at-text" class="pay-input" style="min-height:100px;resize:vertical" placeholder="What did the customer say?"></textarea>
    <button class="edit-save-btn" style="max-width:200px;margin-top:.5rem" onclick="adminAddTestimonial()">Add to Homepage</button>
  </div>
  <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin-bottom:1.1rem">Current Testimonials</div>
  <div id="admin-testimonials-list"></div>
  <div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin:.9rem 0 1.1rem">Customer Feedback</div>
  <div id="feedback-list"></div>
</div>
    <div id="merch-panel-events" class="merch-panel" style="display:none">
  <div class="add-event-form">
    <h3>Post an Event / Announcement</h3>
    <div class="edit-row"><label>Event Title *</label><input id="ev-title" placeholder="e.g. Saturday Flea Market — Lipa City"></div>
    <div class="event-form-grid">
      <div class="edit-row"><label>Date *</label><input id="ev-date" type="date"></div>
      <div class="edit-row"><label>Time</label><input id="ev-time" placeholder="e.g. 8:00 AM – 5:00 PM"></div>
    </div>
    <div class="edit-row"><label>Location / Venue *</label><input id="ev-location" placeholder="e.g. Robinsons Place Lipa, Batangas"></div>
    <div class="edit-row"><label>Description / Announcement</label><textarea id="ev-desc" style="width:100%;background:var(--g1);border:1.5px solid var(--g2);padding:.72rem 1rem;font-family:'Inter',sans-serif;font-size:.9rem;border-radius:var(--r);min-height:90px;resize:vertical" placeholder="Tell customers what to expect, what products you'll bring, promos, etc."></textarea></div>
    <div class="edit-row"><label>Banner Image URL (optional)</label><input id="ev-img" placeholder="https://images.unsplash.com/..." oninput="previewEvImgFromUrl(this.value)"></div>
    <div class="edit-row">
      <label>Or Upload Banner Image</label>
      <div class="brand-img-upload-area" id="ev-upload-area" onclick="document.getElementById('ev-file').click()" style="cursor:pointer">
        <input type="file" id="ev-file" accept="image/*" style="display:none" onchange="handleEvImgUpload(this)">
        <img class="brand-img-preview-full" id="ev-preview" alt="Event banner preview">
        <div class="brand-upload-change-overlay">
          <span style="font-size:1.5rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
          <span>Click to change image</span>
        </div>
        <div class="brand-upload-placeholder">
          <div style="font-size:2.2rem;margin-bottom:.5rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <div style="font-size:.875rem;color:var(--g4);font-weight:500">Click to upload event banner</div>
          <div style="font-size:.8rem;color:var(--g3);margin-top:.25rem">JPG, PNG, WebP</div>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:.8rem;margin-top:.5rem">
      <button class="edit-save-btn" onclick="saveEvent()" style="max-width:200px">Post Event</button>
    </div>
  </div>
  <div style="font-family:'Bebas Neue';font-size:1.4rem;margin-bottom:1rem">Your Posted Events</div>
  <div id="merch-events-list"></div>
</div>
  </div>
</section>

<!-- Event Detail Modal -->
<div id="event-detail-modal" style="position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:700;display:none;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(6px)" onclick="if(event.target===this)closeEventDetail()">
  <div style="background:#fff;width:640px;max-width:100%;border-radius:20px;overflow:hidden;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,.35)">
    <div id="edm-banner" style="height:240px;background:var(--black);position:relative;overflow:hidden;flex-shrink:0">
      <img id="edm-img" src="" alt="" style="width:100%;height:100%;object-fit:cover;display:none">
      <div id="edm-placeholder" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M3.5 21L12 3l8.5 18"/><path d="M12 3v18"/><path d="M6 21l6-9 6 9"/></svg></div>
      <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 55%)"></div>
      <button onclick="closeEventDetail()" aria-label="Close event details" style="position:absolute;top:1rem;right:1rem;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.3);color:#fff;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">✕</button>
      <div id="edm-status-badge" style="position:absolute;top:1rem;left:1rem;font-size:.72rem;font-weight:700;padding:.3rem .85rem;border-radius:20px;text-transform:uppercase;letter-spacing:.08em"></div>
      <div id="edm-brand-pill" style="position:absolute;bottom:1rem;left:1rem;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:.8rem;font-weight:600;padding:.35rem .9rem;border-radius:20px;backdrop-filter:blur(4px)"></div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:1.8rem">
      <h2 id="edm-title" style="font-family:'Bebas Neue',sans-serif;font-size:2.2rem;line-height:1;margin-bottom:1.1rem;color:var(--black)"></h2>
      <div id="edm-meta" style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1.3rem"></div>
      <div id="edm-desc" style="font-size:.95rem;color:var(--g5);line-height:1.8;margin-bottom:1.6rem"></div>
      <div style="display:flex;gap:.8rem;align-items:center;flex-wrap:wrap">
        <button id="edm-interest-btn" onclick="toggleInterestedModal()" style="background:var(--accent);color:var(--black);border:none;padding:.7rem 1.6rem;font-family:'Inter',sans-serif;font-size:.875rem;font-weight:700;border-radius:30px;cursor:pointer;transition:all .2s;letter-spacing:.04em">☆ Mark as Interested</button>
        <button onclick="closeEventDetail()" style="background:none;border:1.5px solid var(--g2);color:var(--g4);padding:.7rem 1.4rem;font-family:'Inter',sans-serif;font-size:.875rem;font-weight:500;border-radius:30px;cursor:pointer">Close</button>
      </div>
    </div>
  </div>
</div>
</main>

<!-- Cart Drawer -->
<div class="overlay" id="cart-overlay" onclick="closeCart()"></div>
<div class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
  <div class="cd-header">
    <span class="cd-header-title">Cart (<span id="cart-count">0</span>)</span>
    <button class="cd-close" onclick="closeCart()" aria-label="Close cart">✕</button>
  </div>
  <div class="cd-items" id="cd-items">
    <div class="cd-empty"><div style="font-size:3.5rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div><div>Your cart is empty</div><button class="hero-cta-primary" onclick="closeCart();navigateTo('catalog')" style="margin-top:.9rem;font-size:.85rem;padding:.55rem 1.3rem">Shop Now</button></div>
  </div>
  <div class="cd-summary" id="cd-summary" style="display:none">
    <div class="cd-summary-row"><span>Subtotal</span><span id="cd-subtotal">₱0</span></div>
    <div class="cd-summary-row cd-total"><span>Total</span><span id="cd-total">₱0</span></div>
    <div class="cd-actions">
      <button class="cd-checkout" onclick="openCheckout()">Proceed to Checkout</button>
      <button class="cd-clear" onclick="clearCart()">Remove All Items</button>
    </div>
  </div>
</div>

<!-- Checkout Modal -->
<div class="pay-modal" id="pay-modal" role="dialog" aria-modal="true" aria-label="Checkout">
  <div class="pay-card">
    <div class="pay-head"><h3>Checkout</h3><button class="pay-head-close" onclick="closeCheckout()" aria-label="Close checkout">✕</button></div>
    <div class="pay-steps">
      <button class="pay-step-btn active" id="ps-1">1. Order Review</button>
      <button class="pay-step-btn" id="ps-2">2. Contact</button>
      <button class="pay-step-btn" id="ps-3">3. Payment</button>
    </div>
    <div class="pay-body">
      <div class="pay-section active" id="pay-step-1">
        <div class="receipt-box" id="receipt-items"></div>
        <label class="pay-label" for="shipping-zone">Shipping Area</label>
        <select class="pay-select" id="shipping-zone" onchange="updateShippingRate()">
          <option value="">— Select your area —</option>
          <option value="lipa">Lipa City, Batangas — ₱110</option>
          <option value="batangas_city">Batangas City — ₱120</option>
          <option value="santo_tomas">Santo Tomas, Batangas — ₱110</option>
          <option value="tanauan">Tanauan, Batangas — ₱110</option>
          <option value="rosario">Rosario, Batangas — ₱120</option>
          <option value="bauan">Bauan, Batangas — ₱120</option>
          <option value="san_jose">San Jose, Batangas — ₱120</option>
          <option value="nasugbu">Nasugbu, Batangas — ₱130</option>
          <option value="other_batangas">Other Batangas Towns — ₱130</option>
          <option value="lucena">Lucena City, Quezon — ₱105</option>
          <option value="quezon_province">Quezon Province (other) — ₱130</option>
          <option value="laguna">Laguna — ₱140</option>
          <option value="cavite">Cavite — ₱150</option>
          <option value="rizal">Rizal — ₱155</option>
          <option value="metro_manila">Metro Manila (NCR) — ₱170</option>
          <option value="luzon_south">Southern Luzon (Bicol, etc.) — ₱200</option>
          <option value="luzon_north">Northern Luzon — ₱220</option>
          <option value="visayas">Visayas — ₱270</option>
          <option value="mindanao">Mindanao — ₱290</option>
        </select>
        <div class="delivery-estimate" id="delivery-est" style="display:none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Estimated delivery: <strong id="est-date"></strong></div>
        <div class="receipt-totals">
          <div class="receipt-total-row"><span>Subtotal</span><span id="pay-sub">₱0</span></div>
          <div class="receipt-total-row"><span>Shipping (J&amp;T Express)</span><span id="pay-ship">Select area first</span></div>
          <div class="receipt-total-row receipt-grand"><span>Total</span><span id="pay-total">—</span></div>
        </div>
      </div>
      <div class="pay-section" id="pay-step-2">
        <label class="pay-label" for="pay-name">Full Name *</label>
        <input class="pay-input" id="pay-name" placeholder="Juan dela Cruz">
        <label class="pay-label" for="pay-email">Email Address *</label>
        <input class="pay-input" id="pay-email" placeholder="juan@email.com" type="email">
        <label class="pay-label" for="pay-phone">Phone Number *</label>
        <input class="pay-input" id="pay-phone" placeholder="+63 9XX XXX XXXX">
        <label class="pay-label" for="pay-address">Delivery Address *</label>
        <input class="pay-input" id="pay-address" placeholder="House/Lot, Street, Barangay, City">
      </div>
      <div class="pay-section" id="pay-step-3">
        <div class="no-cod-notice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> <strong>We do NOT accept Cash on Delivery.</strong> Please pay via GCash or PayMaya before your order is processed.</div>
        <p style="font-size:.875rem;color:var(--g4);margin-bottom:1.1rem">Select payment method:</p>
        <div class="pay-methods-grid">
          <div class="pay-method" data-method="gcash" onclick="selectPayMethod(this)" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPayMethod(this)}" aria-label="Pay with GCash"><div class="pay-method-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div><div class="pay-method-name">GCash</div><div class="pay-method-desc">Scan QR to pay</div></div>
          <div class="pay-method" data-method="paymaya" onclick="selectPayMethod(this)" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPayMethod(this)}" aria-label="Pay with PayMaya"><div class="pay-method-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div><div class="pay-method-name">PayMaya</div><div class="pay-method-desc">Scan QR to pay</div></div>
        </div>
        <div class="pay-qr" id="pay-qr-box">
          <div class="qr-box">
            <div style="font-size:.82rem;color:var(--g4);margin-bottom:.9rem" id="qr-method-label">GCash QR Code</div>
            <div class="qr-grid" id="qr-pattern"></div>
            <div class="pay-qr-amount" id="qr-amount">₱0</div>
            <div style="font-size:.82rem;color:var(--g4);margin-top:.5rem">Scan with your app to pay</div>
          </div>
        </div>
        <button class="i-have-paid-btn" id="i-paid-btn" onclick="placeOrder()" style="display:none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><polyline points="20 6 9 17 4 12"/></svg> I Have Paid — Place Order</button>
      </div>
    </div>
    <div class="pay-nav">
      <button class="pay-nav-back" id="pay-back" onclick="checkoutBack()" style="display:none">← Back</button>
      <button class="pay-nav-next" id="pay-next" onclick="checkoutNext()">Next</button>
    </div>
  </div>
</div>

<!-- Confirm Modal -->
<div class="confirm-modal" id="confirm-modal" role="dialog" aria-modal="true" aria-label="Order confirmation">
  <div class="confirm-card">
    <div class="confirm-head"><div class="confirm-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M5.8 11.3L2 22l10.7-3.8"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="M11 13c1.7-1.28 3.5-1.28 5.2 0L18 15l1.5-1.5"/></svg></div><h3>Order Placed!</h3><p style="font-size:.875rem;opacity:.8;margin-top:.3rem">Thank you for your purchase</p></div>
    <div class="confirm-body">
      <div class="confirm-order-id" id="conf-order-id">ORD-000000</div>
      <div class="confirm-items" id="conf-items"></div>
      <div class="confirm-total" id="conf-total"></div>
      <p style="font-size:.875rem;color:var(--g4);margin-bottom:1.6rem;line-height:var(--lh-relaxed)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22 6 12 13 2 6"/></svg> Confirmation for <strong id="conf-email">your email</strong>.<br><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Order processed within 1–2 business days via J&amp;T Express.</p>
      <button class="confirm-ok-btn" onclick="closeConfirm()">View My Orders</button>
    </div>
  </div>
</div>

<!-- Merchant Login Modal -->
<div class="merchant-modal" id="merchant-modal" role="dialog" aria-modal="true" aria-label="Merchant and admin login">
  <div class="merchant-modal-card">
    <div class="mm-head"><div class="mm-head-icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><h3>Login to Dashboard</h3><p style="font-size:.82rem;opacity:.6;margin-top:.35rem">Select your role to continue</p></div>
    <div class="mm-body">
      <div style="display:flex;background:var(--g1);border:1.5px solid var(--g2);border-radius:30px;padding:.25rem;margin-bottom:1.3rem;gap:.25rem">
        <button id="role-admin-btn" onclick="setLoginRole('admin')" style="flex:1;padding:.5rem;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:700;border-radius:25px;border:none;cursor:pointer;transition:all .2s;background:var(--black);color:#fff"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg> Admin</button>
        <button id="role-merch-btn" onclick="setLoginRole('merchant')" style="flex:1;padding:.5rem;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:600;border-radius:25px;border:none;cursor:pointer;transition:all .2s;background:transparent;color:var(--g4)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"/></svg> Merchant</button>
      </div>
      <div class="mm-error" id="mm-error" role="alert">Incorrect credentials. Please try again.</div>
      <div id="mm-admin-fields">
        <label class="mm-label" for="mm-admin-user">Username</label>
        <input class="mm-input" id="mm-admin-user" placeholder="admin">
        <label class="mm-label" for="mm-admin-pass">Password</label>
        <input class="mm-input" id="mm-admin-pass" type="password" placeholder="Enter admin password" onkeydown="if(event.key==='Enter')merchantLogin()">

      </div>
      <div id="mm-merch-fields" style="display:none">
        <label class="mm-label" for="mm-brand-select">Select Your Brand</label>
        <select class="mm-select" id="mm-brand-select"></select>
        <label class="mm-label" for="mm-pass">Password</label>
        <input class="mm-input" id="mm-pass" type="password" placeholder="Enter password" onkeydown="if(event.key==='Enter')merchantLogin()">

      </div>
      <button class="mm-submit" onclick="merchantLogin()">Login</button>
<button class="mm-cancel" onclick="closeMerchantModal()">Cancel</button>
    </div>
  </div>
</div>
 

<!-- Product Edit Modal -->
<div class="edit-modal" id="product-modal" role="dialog" aria-modal="true" aria-label="Add or edit product">
  <div class="edit-card">
    <div class="edit-head"><h3 id="pm-title">Add Product</h3><button class="edit-close" onclick="closeProductModal()" aria-label="Close">✕</button></div>
    <div class="edit-body">
      <input type="hidden" id="pm-id">
      <div class="edit-row"><label for="pm-name">Product Name *</label><input id="pm-name" placeholder="e.g. Vintage Snapback"></div>
      <div class="edit-row-2">
        <div class="edit-row">
          <label for="pm-price">Price (₱) *</label>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.55rem">
            <button type="button" class="price-chip" onclick="selectPriceChip(this,'300')">₱300</button>
            <button type="button" class="price-chip" onclick="selectPriceChip(this,'400')">₱400</button>
            <button type="button" class="price-chip" onclick="selectPriceChip(this,'500')">₱500</button>
            <button type="button" class="price-chip" onclick="selectPriceChip(this,'300-400')">₱300–400</button>
          </div>
          <input id="pm-price" placeholder="Or type any price (e.g. 250, Negotiable)" style="width:100%;background:var(--g1);border:1.5px solid var(--g2);padding:.75rem 1rem;font-family:'Inter',sans-serif;font-size:.9rem;border-radius:var(--r);transition:var(--tr)" oninput="clearChipSelection()">
          <label for="pm-original-price" style="margin-top:.7rem;display:block">Original Price (optional — shows a Sale badge)</label>
          <input id="pm-original-price" placeholder="e.g. 450 — leave blank for no sale" style="width:100%;background:var(--g1);border:1.5px solid var(--g2);padding:.75rem 1rem;font-family:'Inter',sans-serif;font-size:.9rem;border-radius:var(--r);transition:var(--tr)">
        </div>
        <div class="edit-row"><label for="pm-tag">Category *</label><input id="pm-tag" placeholder="Hat, Top, Shoes..."></div>
      </div>
      <div class="edit-row-2">
        <div class="edit-row"><label for="pm-size">Size *</label><input id="pm-size" placeholder="M, L, US9, Adjustable..."></div>
        <div class="edit-row"><label for="pm-stock">Stock Qty</label><input id="pm-stock" type="number" placeholder="10"></div>
      </div>
      <div class="edit-row">
        <label>Product Images (up to 5) — First image is the cover</label>
        <div id="pm-imgs-preview" style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.7rem"></div>
        <div class="img-upload-area" onclick="document.getElementById('pm-file').click()" style="margin-bottom:.5rem">
          <input type="file" id="pm-file" accept="image/*" multiple onchange="handleImgsUpload(this)" style="display:none">
          <div class="img-upload-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
          <div style="font-size:.875rem;color:var(--g4)">Click to upload images (select multiple)</div>
        </div>
        <input id="pm-img" placeholder="Or paste image URL here then press Enter" style="width:100%;background:var(--g1);border:1.5px solid var(--g2);padding:.72rem 1rem;font-family:'Inter',sans-serif;font-size:.875rem;border-radius:var(--r);transition:var(--tr)" onkeydown="if(event.key==='Enter'){addImgUrl(this.value);this.value=''}">
        <div style="font-size:.76rem;color:var(--g4);margin-top:.35rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg> Upload multiple photos or paste URLs one at a time.</div>
      </div>
      <div class="edit-actions">
        <button class="edit-cancel-btn" onclick="closeProductModal()">Cancel</button>
        <button class="edit-save-btn" onclick="saveProduct()">Save Product</button>
      </div>
    </div>
  </div>
</div>

<!-- Brand Edit Modal -->
<div class="edit-modal" id="brand-modal" role="dialog" aria-modal="true" aria-label="Edit brand profile">
  <div class="edit-card">
    <div class="edit-head"><h3>Edit Brand Profile</h3><button class="edit-close" onclick="closeBrandModal()" aria-label="Close">✕</button></div>
    <div class="edit-body">
      <div class="edit-row"><label for="bm-name">Brand Name</label><input id="bm-name" placeholder="Brand Name"></div>
      <div class="edit-row"><label for="bm-tag">Category / Tag</label><input id="bm-tag" placeholder="thrift, hat, perfume, crochet, aniknik, 3dprint..."></div>
      <div class="edit-row"><label for="bm-desc">Description</label><textarea id="bm-desc" placeholder="Describe your brand..."></textarea></div>
      <div class="edit-row"><label for="bm-loc">Location</label><input id="bm-loc" placeholder="e.g. Lipa City, Batangas"></div>
      <div class="edit-row-2">
        <div class="edit-row"><label for="bm-year">Year Est.</label><input id="bm-year" placeholder="2021"></div>
        <div class="edit-row"><label for="bm-ig">Instagram</label><input id="bm-ig" placeholder="@yourbrand"></div>
      </div>
      <div class="edit-row"><label for="bm-sched">Market Schedule</label><input id="bm-sched" placeholder="Every Saturday, 8AM-5PM"></div>
      <div class="edit-row">
        <label for="bm-img">Brand Banner Image</label>
        <input id="bm-img" placeholder="https://images.unsplash.com/... (paste URL)" style="margin-bottom:.7rem;width:100%;background:var(--g1);border:1.5px solid var(--g2);padding:.72rem 1rem;font-family:'Inter',sans-serif;font-size:.9rem;border-radius:var(--r);transition:var(--tr)" oninput="previewBrandImgFromUrl(this.value)">
        <div class="brand-img-upload-area" id="bm-upload-area" onclick="document.getElementById('bm-file').click()">
          <input type="file" id="bm-file" accept="image/*" onchange="handleBrandImgUpload(this)" style="display:none">
          <img class="brand-img-preview-full" id="bm-preview" alt="Brand image preview">
          <div class="brand-upload-change-overlay">
            <span style="font-size:1.5rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
            <span>Click to change image</span>
          </div>
          <div class="brand-upload-placeholder">
            <div style="font-size:2.2rem;margin-bottom:.5rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
            <div style="font-size:.875rem;color:var(--g4);font-weight:500">Click to upload brand image</div>
            <div style="font-size:.8rem;color:var(--g3);margin-top:.25rem">JPG, PNG, WebP · shows as brand banner</div>
          </div>
        </div>
        <div style="font-size:.78rem;color:var(--g4);margin-top:.5rem;line-height:1.6"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg> Upload a photo or paste a URL above. Image will appear as your brand's banner.</div>
      </div>
      <div class="edit-actions">
        <button class="edit-cancel-btn" onclick="closeBrandModal()">Cancel</button>
        <button class="edit-save-btn" onclick="saveBrand()">Save Brand</button>
      </div>
    </div>
  </div>
</div>

<!-- Review Modal -->
<div class="review-modal" id="review-modal" role="dialog" aria-modal="true" aria-label="Write a review">
  <div class="review-modal-card">
    <div class="review-modal-head"><h3>Write a Review</h3><button onclick="closeReviewModal()" aria-label="Close" style="background:none;border:none;color:#fff;cursor:pointer;font-size:1.2rem">✕</button></div>
    <div class="edit-body">
      <input type="hidden" id="rm-pid">
      <input type="hidden" id="rm-rid">
      <div style="font-size:.875rem;color:var(--g4);margin-bottom:.6rem">Product: <strong id="rm-pname"></strong></div>
      <label class="pay-label">Your Rating</label>
      <div class="star-picker" id="star-picker" role="radiogroup" aria-label="Star rating">
        <span onclick="setReviewStar(1)" role="radio" aria-checked="false" aria-label="1 star" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();setReviewStar(1)}">★</span><span onclick="setReviewStar(2)" role="radio" aria-checked="false" aria-label="2 stars" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();setReviewStar(2)}">★</span>
        <span onclick="setReviewStar(3)" role="radio" aria-checked="false" aria-label="3 stars" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();setReviewStar(3)}">★</span><span onclick="setReviewStar(4)" role="radio" aria-checked="false" aria-label="4 stars" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();setReviewStar(4)}">★</span>
        <span onclick="setReviewStar(5)" role="radio" aria-checked="false" aria-label="5 stars" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();setReviewStar(5)}">★</span>
      </div>
      <label class="pay-label" for="rm-text">Your Review</label>
      <textarea id="rm-text" class="pay-input" style="min-height:110px;resize:vertical" placeholder="Share your experience..."></textarea>
      <label class="pay-label">Upload Photo (optional)</label>
      <div class="review-img-upload" onclick="document.getElementById('rm-file').click()">
        <input type="file" id="rm-file" accept="image/*" onchange="handleReviewImg(this)" style="display:none">
        <div style="font-size:.875rem;color:var(--g4)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Click to upload a photo</div>
        <div class="review-img-preview" id="rm-img-preview"></div>
      </div>
      <div class="edit-actions">
        <button class="edit-cancel-btn" onclick="closeReviewModal()">Cancel</button>
        <button class="edit-save-btn" onclick="submitReview()">Submit Review</button>
      </div>
    </div>
  </div>
</div>

<!-- Welcome Modal -->
<div id="welcome-modal" class="wm-backdrop" role="dialog" aria-modal="true" aria-label="Welcome to Lost and Found">
  <div class="wm-card">
    <div class="wm-eyelet"></div>
    <button class="wm-close" onclick="closeWelcomeModal()" aria-label="Close">✕</button>

    <div class="wm-header">
      <div class="wm-logo">
  <img src="brand pics/LostandFound_brand-removebg-preview.png" onerror="this.style.display='none';this.parentElement.classList.add('logo-fallback')">
</div>
      <div class="wm-word">Lost &amp; Found</div>
      <div class="wm-stamp">
        <span class="wm-stamp-dot"></span>
        Flea Market · Batangas
      </div>
    </div>

    <div class="wm-perf"></div>

    <div class="wm-body">
      <p class="wm-tagline">Every piece here has a past &mdash; <em>come find what's next.</em></p>

      <div class="wm-facts">
        <div class="wm-fact">
          <span class="wm-fact-label">Payment</span>
          <span class="wm-fact-leader"></span>
          <span class="wm-fact-val"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> GCash &amp; PayMaya</span>
        </div>
        <div class="wm-fact">
          <span class="wm-fact-label">Shipping</span>
          <span class="wm-fact-leader"></span>
          <span class="wm-fact-val"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> J&amp;T Express</span>
        </div>
        <div class="wm-fact">
          <span class="wm-fact-label">Merchants</span>
          <span class="wm-fact-leader"></span>
          <span class="wm-fact-val" id="welcome-brand-count"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> Multiple Brands</span>
        </div>
        <div class="wm-fact" style="border-bottom:none">
          <span class="wm-fact-label">Markets</span>
          <span class="wm-fact-leader"></span>
          <span class="wm-fact-val"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Weekend pop-ups</span>
        </div>
      </div>

      <div class="wm-stall">
        <span class="wm-stall-tag">Today's stall pick</span>
        <div class="wm-stall-thumb" id="welcome-merch-thumb"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/></svg></div>
        <div style="flex:1;min-width:0">
          <div class="wm-stall-name" id="welcome-merchant-name">—</div>
          <div class="wm-stall-sub" id="welcome-merchant-sub"></div>
        </div>
      </div>

      <div class="wm-ctas">
        <button class="wm-cta-primary" onclick="closeWelcomeModal()">Start Browsing</button>
        <button class="wm-cta-secondary" onclick="closeWelcomeModal();setTimeout(()=>navigateTo('events'),100)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Market Dates</button>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"><span class="toast-icon" id="toast-icon"></span><span class="toast-text" id="toast-text"></span></div>

<button id="feedback-btn" onclick="openFeedback()" style="position:fixed;bottom:5rem;right:2rem;background:var(--accent);color:#fff;border:none;padding:.6rem 1.2rem;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:700;border-radius:30px;cursor:pointer;z-index:9996;box-shadow:var(--shadow-lg);letter-spacing:.04em;transition:var(--tr)" onmouseover="this.style.background='var(--accent2)'" onmouseout="this.style.background='var(--accent)'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> Feedback</button>

<div id="feedback-modal" role="dialog" aria-modal="true" aria-label="Send feedback" style="position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9998;display:none;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(6px)">
  <div style="background:#fff;width:480px;max-width:100%;border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow-xl)">
    <div style="background:var(--black);padding:1.3rem 1.7rem;display:flex;justify-content:space-between;align-items:center">
      <span style="font-family:'Bebas Neue',sans-serif;font-size:1.35rem;color:#fff;letter-spacing:.04em">Send Feedback</span>
      <button onclick="closeFeedback()" aria-label="Close" style="background:none;border:none;color:rgba(255,255,255,.6);cursor:pointer;font-size:1.2rem">✕</button>
    </div>
    <div style="padding:1.7rem">
      <label class="pay-label" for="fb-name">Your Name *</label>
      <input id="fb-name" class="pay-input" placeholder="Juan dela Cruz">
      <label class="pay-label" for="fb-type">Type</label>
      <select id="fb-type" class="pay-input">
        <option value="suggestion"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg> Suggestion</option>
        <option value="complaint"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Complaint</option>
        <option value="compliment"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg> Compliment</option>
        <option value="other"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;display:inline-block"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> Other</option>
      </select>
      <label class="pay-label" for="fb-msg">Message *</label>
      <textarea id="fb-msg" class="pay-input" style="min-height:110px;resize:vertical" placeholder="Share your thoughts..."></textarea>
      <div style="display:flex;gap:.8rem;margin-top:.5rem">
        <button onclick="closeFeedback()" class="edit-cancel-btn" style="flex:1">Cancel</button>
        <button onclick="submitFeedback()" class="edit-save-btn" style="flex:2">Send Feedback</button>
      </div>
    </div>
  </div>
</div>

<script src="lostandfound.js"></script>
<script src="backend/Sync.js?v=4"></script>
<script src="backend/SyncSecure.js?v=4"></script>
<script src="backend/AccountSecurity.js?v=4"></script>
<script src="backend/PasswordReset.js?v=4"></script>
<script src="backend/ShippingJNT.js?v=4"></script>
<script src="backend/EmailFeature.js?v=4"></script>
<script src="backend/AddressPH.js?v=4"></script>
</body>
</html>
````

### 11.5 `lostandfound.css`  (1424 lines)

````css
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  /* ── EDITORIAL PALETTE ── */
  --black:#0a0a09;
  --white:#faf8f4;
  --g1:#f3f0ea;
  --g2:#e7e2d8;
  --g3:#c7bfb0;
  --g4:#8f8676;
  --g5:#38352e;
  --accent:#a9803a;      /* pared-back gold, used sparingly */
  --accent2:#8f6a2c;
  --accent3:#c9a25f;
  --accent-ink:#6b4e1f;
  --red:#a13328;
  --green:#256b46;
  --blue:#294f74;
  --top-h:76px;
  --r:2px;--r2:2px;      /* editorial = sharp corners, not pills */
  --shadow:none;
  --shadow-lg:0 2px 24px rgba(10,10,9,.08);
  --shadow-xl:0 12px 48px rgba(10,10,9,.16);
  --tr:all .35s cubic-bezier(.16,1,.3,1);
  --text-xs:.85rem;--text-sm:.95rem;--text-base:1.02rem;
  --text-lg:1.2rem;--text-xl:1.4rem;--text-2xl:1.7rem;--text-3xl:2.1rem;
  --lh-tight:1.15;--lh-normal:1.6;--lh-relaxed:1.8;
}
html{scroll-behavior:smooth;font-size:17px}
body{
  font-family:'Inter',sans-serif;
  font-size:var(--text-base);
  font-weight:400;
  background:var(--white);
  color:var(--black);
  min-height:100vh;
  overflow-x:hidden;
  line-height:var(--lh-normal);
  -webkit-font-smoothing:antialiased;
  letter-spacing:.005em;
}

a,button,input,select,textarea,[tabindex]{outline:none;font-family:inherit}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,
textarea:focus-visible,[tabindex]:focus-visible,.price-chip:focus-visible,
.pay-method:focus-visible,.event-interested-btn:focus-visible{
  outline:1.5px solid var(--black);
  outline-offset:3px;
}
.product-card:focus-within,.brand-card:focus-within,.event-card:focus-within{
  outline:1.5px solid var(--black);outline-offset:2px;
}

@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{
    animation-duration:.001ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.001ms !important;
    scroll-behavior:auto !important;
  }
  .carousel-track{transition:none}
}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--white)}
::-webkit-scrollbar-thumb{background:var(--g3);border-radius:0}
::-webkit-scrollbar-thumb:hover{background:var(--g4)}

/* ══════════════════════ TOPBAR — editorial nav ══════════════════════ */
#topbar{
  position:fixed;top:0;left:0;right:0;height:var(--top-h);
  background:rgba(250,248,244,.88);
  backdrop-filter:blur(18px) saturate(1.1);-webkit-backdrop-filter:blur(18px) saturate(1.1);
  border-bottom:1px solid var(--g2);
  box-shadow:none;
  z-index:200;display:flex;align-items:center;padding:0 2.4rem;gap:1.4rem;
  transition:var(--tr);
}
.topbar-brand{display:flex;align-items:center;gap:.7rem;cursor:pointer;text-decoration:none}
.topbar-brand-name{
  font-family:'Bebas Neue',sans-serif;
  font-size:1.9rem;letter-spacing:.06em;
  color:var(--black);
}
.topbar-brand-sub{font-size:.62rem;letter-spacing:.26em;text-transform:uppercase;color:var(--g4);margin-top:1px;font-weight:500}
.topbar-nav{display:flex;gap:.3rem;margin:0 auto}
.tn-btn{
  background:none;border:none;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:.78rem;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;color:var(--g4);
  padding:.5rem 1.05rem;border-radius:0;transition:var(--tr);
  position:relative;
}
.tn-btn::after{content:'';position:absolute;left:1.05rem;right:1.05rem;bottom:.28rem;height:1px;background:var(--black);transform:scaleX(0);transform-origin:left;transition:var(--tr)}
.tn-btn:hover{color:var(--black)}
.tn-btn:hover::after{transform:scaleX(1)}
.tn-btn.active{color:var(--black)}
.tn-btn.active::after{transform:scaleX(1)}
#search-results{
  max-height:60vh;overflow-y:auto;
  border-top:1px solid var(--g2);
}
.sr-item{
  display:flex;align-items:center;gap:.9rem;
  padding:.85rem 1.1rem;cursor:pointer;
  border-bottom:1px solid var(--g1);transition:var(--tr);
}
.sr-item:hover{background:var(--g1)}
.sr-thumb{
  width:52px;height:52px;border-radius:0;overflow:hidden;
  background:var(--g2);display:flex;align-items:center;justify-content:center;
  font-size:1.5rem;flex-shrink:0;color:var(--g4);
}
.sr-thumb img{width:100%;height:100%;object-fit:cover}
.sr-name{font-size:.92rem;color:var(--black);font-weight:600}
.sr-meta{font-size:.78rem;color:var(--g4);margin-top:2px;text-transform:uppercase;letter-spacing:.05em}
.sr-price{font-size:.92rem;color:var(--black);margin-left:auto;font-weight:700;white-space:nowrap}

/* ══════════════════════ SEARCH OVERLAY ══════════════════════ */
.search-overlay{
  position:fixed;inset:0;z-index:500;
  background:rgba(10,10,9,.5);
  backdrop-filter:blur(3px);
  display:none;
  align-items:flex-start;justify-content:center;
  padding-top:calc(var(--top-h) + 24px);
}
.search-overlay.open{display:flex;animation:fadeUp .2s ease}
.search-overlay-panel{
  background:var(--white);
  width:640px;max-width:calc(100% - 32px);
  box-shadow:var(--shadow-xl);
  max-height:calc(100vh - var(--top-h) - 48px);
  display:flex;flex-direction:column;
  overflow:hidden;
}
.search-overlay-bar{
  display:flex;align-items:center;gap:.8rem;
  padding:1.1rem 1.3rem;
  border-bottom:1px solid var(--g2);
  flex-shrink:0;
}
.search-overlay-icon{display:flex;color:var(--g4);flex-shrink:0}
.search-overlay-input{
  flex:1;border:none;background:transparent;
  font-family:'Inter',sans-serif;font-size:1.05rem;color:var(--black);
}
.search-overlay-input:focus{outline:none}
.search-overlay-close{
  background:none;border:none;color:var(--g4);cursor:pointer;
  font-size:1.05rem;flex-shrink:0;transition:var(--tr);
  width:28px;height:28px;display:flex;align-items:center;justify-content:center;
}
.search-overlay-close:hover{color:var(--black)}

.topbar-actions{display:flex;gap:.3rem;align-items:center}
.tb-social{display:flex;gap:.25rem}
.tb-social-link{
  background:none;border:none;
  color:var(--g4);width:32px;height:32px;border-radius:0;
  cursor:pointer;font-size:.85rem;font-weight:700;transition:var(--tr);
  display:flex;align-items:center;justify-content:center;
  text-decoration:none;overflow:hidden;padding:0;
}
.tb-social-link:hover{color:var(--black)}
.tb-icon-btn{
  background:none;border:none;
  color:var(--g5);width:36px;height:36px;border-radius:0;
  cursor:pointer;font-size:1.05rem;transition:var(--tr);
  position:relative;display:flex;align-items:center;justify-content:center;
}
.tb-icon-btn:hover{color:var(--black)}
.tb-badge{
  position:absolute;top:2px;right:2px;
  background:var(--black);color:var(--white);font-size:.6rem;
  min-width:15px;height:15px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  opacity:0;font-weight:700;padding:0 3px;transition:opacity .2s;
  border:none;
}
.tb-badge.on{opacity:1}
.cart-btn{
  display:flex;align-items:center;gap:.5rem;
  background:var(--black);color:var(--white);border:none;cursor:pointer;
  padding:.6rem 1.3rem;font-family:'Inter',sans-serif;
  font-size:.78rem;font-weight:600;border-radius:0;transition:var(--tr);
  letter-spacing:.12em;text-transform:uppercase;
}
.cart-btn:hover{background:var(--g5)}
#merchant-btn{
  display:flex;align-items:center;gap:.45rem;
  background:transparent;color:var(--g5);
  border:1px solid var(--g3);cursor:pointer;
  padding:.55rem 1.1rem;font-family:'Inter',sans-serif;
  font-size:.72rem;font-weight:600;border-radius:0;transition:var(--tr);white-space:nowrap;
  letter-spacing:.12em;text-transform:uppercase;
}
#merchant-btn:hover{border-color:var(--black);color:var(--black)}
#merchant-btn.logged-in{background:var(--black);color:var(--white);border-color:var(--black);font-weight:600}
.notif-wrapper{position:relative}
.notif-dropdown{
  position:absolute;top:calc(100% + 16px);right:0;width:370px;
  background:var(--white);border:1px solid var(--g2);
  border-radius:0;z-index:400;display:none;
  box-shadow:var(--shadow-xl);overflow:hidden;
}
.notif-dropdown.open{display:block;animation:fadeUp .22s ease}
.notif-hd{
  padding:1.1rem 1.3rem;border-bottom:1px solid var(--g2);
  display:flex;justify-content:space-between;align-items:center;
  background:var(--black);
}
.notif-hd-title{font-size:.72rem;font-weight:700;color:var(--white);letter-spacing:.18em;text-transform:uppercase}
.notif-clear-btn{
  font-size:.72rem;color:rgba(250,248,244,.5);
  background:none;border:1px solid rgba(250,248,244,.2);
  cursor:pointer;padding:.28rem .7rem;border-radius:0;transition:var(--tr);
  letter-spacing:.05em;text-transform:uppercase;
}
.notif-clear-btn:hover{color:#fff;border-color:rgba(255,255,255,.5)}
.notif-item{
  padding:1rem 1.3rem;border-bottom:1px solid var(--g1);
  display:flex;gap:.9rem;cursor:pointer;transition:var(--tr);position:relative;
}
.notif-item:hover{background:var(--g1)}
.notif-item.unread{background:var(--white);border-left:2px solid var(--black)}
.notif-item.unread::after{content:'';position:absolute;top:1rem;right:1rem;width:5px;height:5px;background:var(--accent);border-radius:50%}
.notif-icon-c{font-size:1.05rem;flex-shrink:0;width:34px;height:34px;background:var(--g1);border-radius:0;display:flex;align-items:center;justify-content:center}
.notif-text{font-size:.88rem;color:var(--black);line-height:1.5;flex:1}
.notif-time{font-size:.74rem;color:var(--g4);margin-top:.25rem;letter-spacing:.03em}
.notif-arrow{font-size:.8rem;color:var(--g3);flex-shrink:0;align-self:center}
.notif-empty-msg{padding:2.8rem 1rem;font-size:.88rem;color:var(--g4);text-align:center;display:flex;flex-direction:column;align-items:center;gap:.6rem;letter-spacing:.02em}
.notif-empty-icon{font-size:2rem;opacity:.3;display:flex}
.merch-notif-wrap{display:none}
.merch-notif-wrap.visible{display:block}
.spinner-overlay{position:fixed;inset:0;background:rgba(250,248,244,.94);z-index:9990;display:none;align-items:center;justify-content:center}
.spinner-overlay.on{display:flex}
.spinner{width:28px;height:28px;border:1.5px solid var(--g2);border-top-color:var(--black);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
#main{margin-top:var(--top-h)}
.page{display:none}
.page.active{display:block;animation:fadeUp .4s cubic-bezier(.16,1,.3,1)}
.merch-panel{grid-area:content;animation:fadeUp .35s cubic-bezier(.16,1,.3,1)}
::view-transition-old(root),::view-transition-new(root){animation-duration:.32s;animation-timing-function:cubic-bezier(.16,1,.3,1)}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

/* ══════════════════════ CAROUSEL — big minimal hero ══════════════════════ */
.carousel-section{position:relative;overflow:hidden;height:78vh;min-height:520px}
.carousel-track{display:flex;height:100%;transition:transform .8s cubic-bezier(.16,1,.3,1)}
.carousel-slide{min-width:100%;height:100%;display:flex;align-items:flex-end;padding:0 4vw 5.5rem;position:relative;overflow:hidden}
.cs-bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:transform 9s ease;filter:saturate(.92)}
.carousel-slide:hover .cs-bg{transform:scale(1.03)}
.cs-overlay{position:absolute;inset:0;background:linear-gradient(0deg,rgba(10,10,9,.72) 0%,rgba(10,10,9,.15) 45%,rgba(10,10,9,.05) 100%) !important}
.cs-content{position:relative;z-index:2;max-width:620px}
.cs-eyebrow{font-size:.72rem;letter-spacing:.36em;text-transform:uppercase;margin-bottom:1rem;display:flex;align-items:center;gap:.7rem;opacity:.85;font-weight:600;color:#fff !important}
.cs-eyebrow::before{content:'';width:30px;height:1px;background:currentColor}
.cs-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.8rem,7vw,5.4rem);line-height:.9;margin-bottom:1.1rem;letter-spacing:.005em;color:#fff !important}
.cs-desc{font-size:1rem;line-height:var(--lh-relaxed);margin-bottom:1.7rem;opacity:.78;max-width:420px;color:#fff !important}
.cs-btn{
  display:inline-block;padding:.9rem 2.1rem !important;
  font-family:'Inter',sans-serif;font-size:.78rem;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;
  border-radius:0 !important;cursor:pointer;border:1px solid transparent;transition:var(--tr);
  background:#fff !important;color:var(--black) !important;
}
.cs-btn:hover{background:transparent !important;color:#fff !important;border-color:#fff !important}
.cs-slide-1 .cs-bg{background:url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070') center/cover}
.cs-slide-2 .cs-bg{background:url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070') center/cover}
.cs-slide-3 .cs-bg{background:url('https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=2070') center/cover}
.cs-slide-4 .cs-bg{background:url('https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070') center/cover}
.cs-countdown{display:flex;gap:.6rem;margin-bottom:1.3rem;align-items:center}
.cs-countdown-label{font-size:.7rem;letter-spacing:.16em;color:rgba(255,255,255,.55);margin-right:.3rem;font-weight:600;text-transform:uppercase}
.cs-cd-block{display:flex;flex-direction:column;align-items:center}
.cs-cd-num{
  font-family:'Bebas Neue',sans-serif;font-size:1.9rem;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);
  padding:.1rem .6rem;border-radius:0;min-width:50px;text-align:center;line-height:1.2;color:#fff;
}
.cs-cd-label{font-size:.62rem;color:rgba(255,255,255,.45);margin-top:3px;font-weight:600;letter-spacing:.12em;text-transform:uppercase}
.carousel-arrow{
  position:absolute;top:50%;transform:translateY(-50%);z-index:10;
  background:transparent;border:1px solid rgba(255,255,255,.35);
  color:#fff;width:42px;height:42px;border-radius:50%;cursor:pointer;
  font-size:1rem;transition:var(--tr);backdrop-filter:blur(6px);
}
.carousel-arrow:hover{background:rgba(255,255,255,.15);border-color:#fff}
.carousel-prev{left:2rem}.carousel-next{right:2rem}
.carousel-dots{position:absolute;bottom:1.6rem;left:4vw;display:flex;gap:.6rem;z-index:10}
.carousel-dot{width:22px;height:2px;border-radius:0;background:rgba(255,255,255,.32);border:none;cursor:pointer;transition:var(--tr)}
.carousel-dot.active{background:#fff}

/* ══════════════════════ HOME HERO ══════════════════════ */
.home-hero{min-height:56vh;display:flex;align-items:center;position:relative;padding:3rem 1.5rem;background:var(--black);overflow:hidden}
.home-hero::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 65% 45%,rgba(169,128,58,.06) 0%,transparent 65%);pointer-events:none}
.home-hero-bg{position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070') center/cover;filter:brightness(.16) saturate(1) grayscale(.15);transform:scale(1.02)}
.home-hero-content{position:relative;z-index:2;max-width:1800px;margin:0 auto;display:grid;grid-template-columns:1.15fr 1fr;gap:5rem;align-items:center;width:100%}
.home-hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(3.6rem,9vw,7.8rem);color:#fff;line-height:.85;margin-bottom:1.4rem;letter-spacing:0}
.home-hero-title span{color:var(--accent3);font-family:'Instrument Serif',serif;font-style:italic;display:block}
.home-hero-desc{font-size:1.02rem;color:rgba(250,248,244,.5);margin-bottom:2.3rem;line-height:var(--lh-relaxed);max-width:400px;font-weight:300}
.hero-btns{display:flex;gap:1rem;flex-wrap:wrap}
.hero-cta-primary{
  background:#fff;color:var(--black);border:1px solid #fff;cursor:pointer;
  padding:.95rem 2.5rem;font-family:'Inter',sans-serif;
  font-size:.78rem;font-weight:700;border-radius:0;
  letter-spacing:.14em;text-transform:uppercase;transition:var(--tr);
}
.hero-cta-primary:hover{background:transparent;color:#fff}
.hero-cta-secondary{
  background:transparent;color:#fff;
  border:1px solid rgba(255,255,255,.3);cursor:pointer;
  padding:.95rem 2.5rem;font-family:'Inter',sans-serif;
  font-size:.78rem;font-weight:600;border-radius:0;transition:var(--tr);
  letter-spacing:.14em;text-transform:uppercase;
}
.hero-cta-secondary:hover{border-color:#fff;background:rgba(255,255,255,.06)}
.hero-brand-pills{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,.1)}
.hero-brand-pill{
  background:var(--black);border:none;
  padding:1.2rem 1.3rem;
  display:flex;align-items:center;gap:.9rem;cursor:pointer;transition:var(--tr);
}
.hero-brand-pill:hover{background:rgba(255,255,255,.04)}
.hbp-icon{width:44px;height:44px;border-radius:0;overflow:hidden;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hbp-icon img{width:100%;height:100%;object-fit:cover;filter:grayscale(.15)}
.hbp-name{font-size:.92rem;color:rgba(255,255,255,.9);font-weight:600;letter-spacing:.01em}
.hbp-tag{font-size:.68rem;color:rgba(255,255,255,.35);margin-top:2px;text-transform:uppercase;letter-spacing:.1em}

/* ══════════════════════ STATS STRIP ══════════════════════ */
.stats-strip{background:var(--black);padding:2.2rem 2rem;border-top:1px solid rgba(255,255,255,.06)}
.stats-strip-inner{max-width:1800px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr)}
.strip-stat{text-align:center;padding:.6rem;position:relative}
.strip-stat:not(:last-child)::after{content:'';position:absolute;right:0;top:25%;bottom:25%;width:1px;background:rgba(255,255,255,.08)}
.strip-val{font-family:'Bebas Neue',sans-serif;font-size:2.6rem;color:#fff;letter-spacing:.01em}
.strip-lbl{font-size:.68rem;letter-spacing:.24em;color:rgba(255,255,255,.35);text-transform:uppercase;margin-top:4px;font-weight:600}

/* ══════════════════════ PRODUCT CARD — dense editorial grid ══════════════════════ */
.product-grid{display:flex;flex-wrap:wrap;gap:6px;background:var(--white)}
.product-card{
  flex:1 1 calc(25% - 5px);
  background:var(--white);
  border:none;
  cursor:pointer;border-radius:0;overflow:visible;
  transition:var(--tr);
  position:relative;
  box-shadow:none;
}
.product-card:hover{transform:none;box-shadow:none}
.card-img{
  width:100%;aspect-ratio:.85;
  background:var(--g1);
  display:flex;align-items:center;justify-content:center;
  position:relative;overflow:hidden;border-radius:0;
}
.card-img img{
  width:100%;height:100%;object-fit:cover;
  transition:transform .7s cubic-bezier(.16,1,.3,1);
  position:absolute;inset:0;
}
.product-card:hover .card-img img{transform:scale(1.045)}
.card-img::after{content:none}
.card-badges{position:absolute;top:0;left:0;display:flex;gap:1px;flex-direction:column;z-index:2}
.card-new-badge{
  background:var(--black);color:#fff;
  font-size:.62rem;font-weight:700;
  padding:.4rem .85rem;border-radius:0;display:inline-block;
  letter-spacing:.16em;text-transform:uppercase;
}
.card-soldout-badge{
  background:var(--red);color:#fff;
  font-size:.62rem;font-weight:700;
  padding:.4rem .85rem;border-radius:0;display:inline-block;
  letter-spacing:.16em;text-transform:uppercase;
}
.card-sale-badge{
  background:var(--red);color:#fff;
  font-size:.62rem;font-weight:700;
  padding:.4rem .85rem;border-radius:0;display:inline-block;
  letter-spacing:.16em;text-transform:uppercase;
}
.card-stock-badge{display:none}
.card-size{display:none}
.stock-in{color:var(--g4)}
.stock-low{color:var(--accent-ink)}
.stock-out{color:var(--red)}
.card-actions{display:none}
.card-action-btn{
  position:absolute;bottom:.85rem;right:.85rem;z-index:3;
  background:#fff;
  backdrop-filter:none;
  border:1px solid var(--g2);
  font-size:.85rem;width:34px;height:34px;border-radius:50%;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:var(--tr);box-shadow:0 2px 10px rgba(10,10,9,.1);
}
.card-action-btn:hover{background:var(--black);color:#fff;border-color:var(--black)}
.card-action-btn:disabled{opacity:.35;cursor:not-allowed}
.card-action-btn:disabled:hover{background:#fff;color:var(--black);border-color:var(--g2)}
.card-quick-add{display:none}
.card-body{padding:6px 8px 8px}
.card-brand{font-size:.6rem;color:var(--g4);text-transform:uppercase;letter-spacing:.12em;margin-bottom:.15rem;font-weight:600}
.card-name{font-size:.84rem;font-weight:700;margin-bottom:0;line-height:1.3;color:var(--black);text-transform:uppercase;letter-spacing:.01em}
.card-row{display:flex;justify-content:space-between;align-items:flex-start;gap:.6rem;margin-top:0}
.card-price-wrap{display:flex;align-items:baseline;gap:.5rem;flex-shrink:0;white-space:nowrap}
.card-price-original{font-size:.74rem;color:var(--g4);text-decoration:line-through;font-weight:500}
.card-price{font-size:.86rem;font-weight:700;color:var(--black);letter-spacing:0;white-space:nowrap;flex-shrink:0}
.card-price.on-sale{color:var(--red)}
.card-avg-rating{font-size:.72rem;color:var(--accent-ink);margin-top:.45rem;font-weight:500;letter-spacing:.03em}
.trending-rank{
  position:absolute;bottom:.85rem;left:.85rem;
  background:transparent;color:#fff;
  font-family:'Bebas Neue',sans-serif;font-size:2.3rem;
  width:auto;height:auto;border-radius:0;
  display:flex;align-items:center;justify-content:center;z-index:3;
  box-shadow:none;text-shadow:0 2px 12px rgba(0,0,0,.5);
  -webkit-text-stroke:1px rgba(255,255,255,.4);
}

/* ══════════════════════ BRAND CARD — editorial ══════════════════════ */
.brand-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:6px;background:transparent;
  width:100vw;position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;
}
.brand-card{
  position:relative;height:320px;
  background:var(--black);border:none;
  border-radius:0;overflow:hidden;cursor:pointer;
  transition:var(--tr);
  box-shadow:none;
}
.brand-card:hover{transform:none;box-shadow:none}
.brand-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;transition:transform .8s cubic-bezier(.16,1,.3,1)}
.brand-card:hover img{transform:scale(1.06)}
.brand-card-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,9,.05) 0%,rgba(10,10,9,.1) 45%,rgba(10,10,9,.82) 100%);transition:var(--tr)}
.brand-card:hover .brand-card-overlay{background:linear-gradient(180deg,rgba(10,10,9,.02) 0%,rgba(10,10,9,.08) 40%,rgba(10,10,9,.9) 100%)}
.brand-card-content{position:absolute;left:14px;right:14px;bottom:14px;z-index:2;color:#fff}
.brand-name{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.4rem;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff}
.brand-desc{font-size:.86rem;color:var(--g4);margin-bottom:1rem;line-height:var(--lh-relaxed);font-weight:400}
.brand-tag{
  font-size:.64rem;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.4);
  padding:.22rem .65rem;border-radius:0;display:inline-block;
  font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#fff;
  backdrop-filter:blur(2px);
  margin-bottom:.5rem;
}
.brand-meta-row{font-size:.72rem;color:rgba(255,255,255,.7);margin-top:0;display:flex;align-items:center;gap:.35rem;letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ══════════════════════ HOME SECTIONS ══════════════════════ */
.home-section{padding:14px 10px}
.home-section-inner{max-width:1800px;margin:0 auto}
.section-hd{
  display:flex;justify-content:space-between;align-items:flex-end;
  margin-bottom:8px;padding-bottom:4px;
  border-bottom:1px solid var(--g2);
}
.section-hd h2{
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(2.2rem,4vw,3.2rem);letter-spacing:.01em;
  display:flex;align-items:center;gap:.7rem;line-height:.9;
}
.see-all-btn{
  background:none;border:none;
  padding:.3rem 0;font-family:'Inter',sans-serif;
  font-size:.76rem;font-weight:600;border-radius:0;
  cursor:pointer;transition:var(--tr);letter-spacing:.12em;text-transform:uppercase;
  border-bottom:1px solid var(--black);
}
.see-all-btn:hover{opacity:.55}
.trending-row{display:flex;gap:0;overflow-x:auto;padding-bottom:.5rem;scroll-snap-type:x mandatory;scrollbar-width:none}
.trending-row::-webkit-scrollbar{display:none}
.trending-row .product-card{flex:0 0 255px;min-width:255px;scroll-snap-align:start;flex-shrink:0}

/* ══════════════════════ TESTIMONIALS ══════════════════════ */
.testimonials-section{background:var(--black);padding:3rem 1.5rem}
.testimonials-inner{max-width:1800px;margin:0 auto}
.testimonials-inner .section-hd{border-bottom-color:rgba(255,255,255,.1)}
.testimonials-inner .section-hd h2{color:#fff}
.testimonials-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:1px;background:rgba(255,255,255,.08)}
.testimonial-card{
  background:var(--black);
  border:none;
  border-radius:0;padding:2rem;transition:var(--tr);
}
.testimonial-card:hover{background:rgba(255,255,255,.02)}
.t-stars{color:var(--accent3);font-size:.9rem;margin-bottom:1.2rem;letter-spacing:.1em}
.t-text{font-size:1.05rem;color:rgba(250,248,244,.65);line-height:var(--lh-relaxed);margin-bottom:1.6rem;font-style:italic;font-family:'Instrument Serif',serif}
.t-author{display:flex;align-items:center;gap:.85rem}
.t-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:600;color:var(--accent3);letter-spacing:.02em}
.t-name{font-size:.92rem;color:#fff;font-weight:600;letter-spacing:.02em}
.t-location{font-size:.74rem;color:rgba(255,255,255,.32);margin-top:2px;letter-spacing:.05em;display:flex;align-items:center;gap:.3rem;text-transform:uppercase}

/* ══════════════════════ NEWSLETTER ══════════════════════ */
.newsletter-section{background:var(--g1);padding:2.6rem 1.5rem;border-top:1px solid var(--g2)}
.newsletter-inner{max-width:560px;margin:0 auto;text-align:center}
.newsletter-inner h3{font-family:'Bebas Neue',sans-serif;font-size:2.6rem;margin-bottom:.8rem;letter-spacing:.01em}
.newsletter-inner p{font-size:.95rem;color:var(--g5);margin-bottom:2rem;line-height:var(--lh-relaxed);font-weight:400}
.newsletter-form{display:flex;gap:0;max-width:440px;margin:0 auto;border-bottom:1px solid var(--g5)}
.newsletter-form input{
  flex:1;background:transparent;border:none;
  padding:.85rem .2rem;font-family:'Inter',sans-serif;font-size:.95rem;border-radius:0;transition:var(--tr);
}
.newsletter-form input:focus{outline:none}
.newsletter-submit{
  background:transparent;color:var(--black);border:none;
  padding:.85rem 1rem;font-family:'Inter',sans-serif;
  font-size:.76rem;font-weight:700;border-radius:0;
  cursor:pointer;transition:var(--tr);white-space:nowrap;letter-spacing:.14em;text-transform:uppercase;
}
.newsletter-submit:hover{opacity:.55}

/* ══════════════════════ FOOTER ══════════════════════ */
footer{background:var(--black);padding:2.6rem 1.5rem 1.4rem;color:#fff}
.footer-inner{max-width:1800px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem}
.footer-brand-name{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:#fff;margin-bottom:.7rem;letter-spacing:.03em}
.footer-desc{font-size:.86rem;color:rgba(255,255,255,.35);line-height:var(--lh-relaxed);font-weight:300}
.footer-col h4{font-size:.68rem;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:1.4rem;font-weight:700}
.footer-col ul{list-style:none}
.footer-col ul li{margin-bottom:.75rem}
.footer-col ul li a,.footer-col ul li span{font-size:.86rem;color:rgba(255,255,255,.5);cursor:pointer;text-decoration:none;transition:var(--tr)}
.footer-col ul li a:hover,.footer-col ul li span:hover{color:#fff}
.footer-social{display:flex;gap:.7rem;margin-top:1.2rem}
.footer-social-link{
  display:flex;align-items:center;justify-content:center;
  width:34px;height:34px;border-radius:50%;
  border:1px solid rgba(255,255,255,.16);
  color:rgba(255,255,255,.5);text-decoration:none;
  font-size:.85rem;font-weight:700;transition:var(--tr);
}
.footer-social-link:hover{border-color:#fff;color:#fff}
.footer-bottom{
  max-width:1800px;margin:2.6rem auto 0;padding-top:1.6rem;
  border-top:1px solid rgba(255,255,255,.08);
  display:flex;justify-content:space-between;
  font-size:.74rem;color:rgba(255,255,255,.25);flex-wrap:wrap;gap:.5rem;letter-spacing:.03em;
}

/* ══════════════════════ PAGE CONTAINER ══════════════════════ */
.page-container{max-width:1800px;margin:0 auto;padding:18px 14px}
.breadcrumb{
  display:flex;align-items:center;gap:.5rem;
  font-size:.78rem;color:var(--g4);padding:1.3rem 0;flex-wrap:wrap;
  letter-spacing:.04em;text-transform:uppercase;
}
.breadcrumb a{color:inherit;text-decoration:none;cursor:pointer;transition:var(--tr)}
.breadcrumb a:hover{color:var(--black)}

/* ══════════════════════ FILTERS ══════════════════════ */
.filter-sort-bar{display:flex;gap:0;margin-bottom:1.1rem;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--g2)}
.f-btn{
  background:none;border:none;border-bottom:2px solid transparent;
  padding:.75rem 1.1rem;font-family:'Inter',sans-serif;
  font-size:.78rem;font-weight:600;border-radius:0;cursor:pointer;transition:var(--tr);
  letter-spacing:.1em;text-transform:uppercase;color:var(--g4);
}
.f-btn:hover{color:var(--black)}
.f-btn.on{color:var(--black);border-bottom-color:var(--black)}
.sort-select{
  margin-left:auto;background:transparent;border:none;
  padding:.6rem .2rem;font-family:'Inter',sans-serif;font-size:.78rem;border-radius:0;cursor:pointer;
  letter-spacing:.06em;text-transform:uppercase;color:var(--g5);
}
.price-chip{background:transparent;border:1px solid var(--g3);padding:.4rem 1rem;font-family:'Inter',sans-serif;font-size:.78rem;font-weight:600;border-radius:0;cursor:pointer;transition:var(--tr);letter-spacing:.05em}
.price-chip:hover{border-color:var(--black)}
.price-chip.on{background:var(--black);color:#fff;border-color:var(--black)}
.brand-selected-header{
  display:none;align-items:center;gap:0;padding:0;
  background:var(--black);color:#fff;border-radius:0;
  margin-bottom:1.2rem;overflow:hidden;position:relative;
}
.brand-selected-header.show{display:flex}
.bsh-thumb{width:54px;height:54px;border-radius:0;overflow:hidden;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:1.9rem}
.bsh-thumb img{width:100%;height:100%;object-fit:cover}
.bsh-name{font-family:'Bebas Neue',sans-serif;font-size:1.7rem}
.bsh-count{font-size:.82rem;color:rgba(255,255,255,.4)}
.bsh-back{
  margin-left:auto;background:none;border:1px solid rgba(255,255,255,.2);
  color:rgba(255,255,255,.6);padding:.55rem 1.2rem;font-family:'Inter',sans-serif;
  font-size:.72rem;font-weight:600;border-radius:0;cursor:pointer;transition:var(--tr);
  letter-spacing:.1em;text-transform:uppercase;
}
.bsh-back:hover{border-color:#fff;color:#fff}
.pagination{display:flex;justify-content:center;gap:.4rem;margin-top:3rem;flex-wrap:wrap}
.page-num{
  background:none;border:1px solid var(--g2);
  padding:.5rem 1rem;font-family:'Inter',sans-serif;
  font-size:.82rem;font-weight:500;border-radius:0;cursor:pointer;transition:var(--tr);
}
.page-num:hover,.page-num.active{background:var(--black);color:#fff;border-color:var(--black)}

/* ══════════════════════ HOME — NEW ARRIVALS MARQUEE + COLLAGE ══════════════════════ */
.arrivals-banner-section{width:100%}
.arrivals-marquee-wrap{background:var(--black);overflow:hidden;padding:1rem 0;position:relative;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}
.rv-static-title{
  background:var(--black);color:#fff;
  padding:1.6rem 1.5rem;
  text-align:center;
  font-family:'Instrument Serif',serif;font-style:italic;font-size:2.6rem;letter-spacing:.01em;text-transform:none;
  border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);
}
.arrivals-marquee-track{display:flex;white-space:nowrap;width:max-content;animation:arrivalsMarquee 26s linear infinite}
.arrivals-marquee-track .amq-item{font-family:'Instrument Serif',serif;font-style:italic;font-size:2.4rem;letter-spacing:.01em;color:#fff;padding:0 1.6rem;display:inline-flex;align-items:center;gap:1.6rem;flex-shrink:0}
@keyframes arrivalsMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.arrivals-collage{display:flex;height:620px;overflow:hidden;background:var(--black)}
.arrivals-collage-col{flex:0 0 33.333%;max-width:33.333%;position:relative;cursor:pointer;overflow:hidden;border-right:1px solid rgba(255,255,255,.08);min-width:0}
.arrivals-collage-col:last-child{border-right:none}
.arrivals-collage-col img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.16,1,.3,1);filter:saturate(.92)}
.arrivals-collage-col:hover img{transform:scale(1.07)}
.arrivals-collage-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,9,.1) 0%,rgba(10,10,9,.15) 45%,rgba(10,10,9,.7) 100%);transition:var(--tr)}
.arrivals-collage-col:hover .arrivals-collage-overlay{background:linear-gradient(180deg,rgba(10,10,9,.05) 0%,rgba(10,10,9,.1) 40%,rgba(10,10,9,.78) 100%)}
.arrivals-collage-content{position:absolute;left:1.8rem;right:1.8rem;bottom:2.2rem;z-index:2;color:#fff}
.arrivals-collage-eyebrow{font-size:.66rem;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:.5rem;font-weight:600}
.arrivals-collage-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.6rem,2.4vw,2.1rem);letter-spacing:.01em;margin-bottom:1.1rem;text-transform:uppercase;line-height:1.05}
.arrivals-collage-btn{display:inline-block;border:1px solid rgba(255,255,255,.75);color:#fff;background:rgba(10,10,9,.15);backdrop-filter:blur(2px);padding:.7rem 1.6rem;font-family:'Inter',sans-serif;font-size:.74rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;transition:var(--tr)}
.arrivals-collage-col:hover .arrivals-collage-btn{background:#fff;color:var(--black);border-color:#fff}
.arrivals-viewall-bar{background:var(--white);text-align:center;padding:1.3rem 1rem;border-bottom:1px solid var(--g2)}
.arrivals-viewall-bar span{font-family:'Inter',sans-serif;font-size:.76rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--black);cursor:pointer;padding-bottom:.2rem;border-bottom:1px solid var(--black);transition:var(--tr)}
.arrivals-viewall-bar span:hover{opacity:.55}
@media(max-width:900px){
  .arrivals-collage{flex-direction:column;height:auto}
  .arrivals-collage-col{height:300px;border-right:none;border-bottom:1px solid rgba(255,255,255,.08)}
  .arrivals-collage-col:last-child{border-bottom:none}
}

/* ══════════════════════ ARRIVALS BANNER ══════════════════════ */
.arrivals-banner{min-height:260px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:var(--black)}
.arrivals-banner-bg{position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070') center/cover;filter:brightness(.28) saturate(.9)}
.arrivals-banner-content{position:relative;z-index:2;text-align:center;color:#fff;padding:3rem 2rem}
.arrivals-banner h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,7vw,5.2rem);margin-bottom:.7rem;letter-spacing:0}
.arr-badge{
  background:transparent;color:#fff;display:inline-block;
  padding:.5rem 1.3rem;border-radius:0;font-size:.72rem;border:1px solid rgba(255,255,255,.35);
  letter-spacing:.18em;font-weight:600;text-transform:uppercase;
}

/* ══════════════════════ PRODUCT DETAIL ══════════════════════ */
.pd-container{max-width:1800px;margin:0 auto;padding:1.2rem 1.5rem}
.pd-layout{display:grid;grid-template-columns:1.1fr 1fr;gap:2.4rem;align-items:start}
.pd-main-img{
  aspect-ratio:.82;background:var(--g1);border-radius:0;
  display:flex;align-items:center;justify-content:center;font-size:9rem;
  overflow:hidden;position:relative;box-shadow:none;
}
.pd-main-img img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
.pd-brand-link{font-size:.76rem;color:var(--g4);text-transform:uppercase;letter-spacing:.16em;margin-bottom:.9rem;cursor:pointer;font-weight:600;display:flex;align-items:center;gap:.4rem}
.pd-brand-link:hover{color:var(--black)}
.pd-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.4rem,4vw,3.6rem);line-height:.95;margin-bottom:1.1rem;letter-spacing:.005em}
.pd-price{font-size:1.7rem;font-weight:600;margin-bottom:.8rem;letter-spacing:0}
.pd-stock{display:inline-block;font-size:.76rem;font-weight:600;padding:0;border-radius:0;margin-bottom:1.8rem;letter-spacing:.1em;text-transform:uppercase;background:transparent !important}
.pd-detail-rows{border-top:1px solid var(--g2);border-bottom:none;border-radius:0;overflow:hidden;margin-bottom:2rem;box-shadow:none}
.pd-detail-row{display:flex;justify-content:space-between;padding:.9rem 0;border-bottom:1px solid var(--g1);font-size:.88rem}
.pd-detail-row:last-child{border-bottom:none}
.pd-detail-row span:first-child{color:var(--g4);font-weight:500;letter-spacing:.06em;text-transform:uppercase;font-size:.76rem}
.pd-detail-row .size-val{color:var(--black);font-weight:600}
.pd-atc-btn{
  width:100%;background:var(--black);color:#fff;border:1px solid var(--black);
  padding:1.05rem;font-family:'Inter',sans-serif;
  font-size:.82rem;font-weight:700;border-radius:0;cursor:pointer;
  transition:var(--tr);letter-spacing:.14em;text-transform:uppercase;margin-bottom:.8rem;
}
.pd-atc-btn:hover:not(:disabled){background:transparent;color:var(--black)}
.pd-atc-btn:disabled{opacity:.4;cursor:not-allowed}
.pd-bin-btn{
  width:100%;background:transparent;color:var(--black);border:1px solid var(--black);
  padding:1.05rem;font-family:'Inter',sans-serif;
  font-size:.82rem;font-weight:700;border-radius:0;cursor:pointer;
  transition:var(--tr);letter-spacing:.14em;text-transform:uppercase;margin-bottom:.8rem;
}
.pd-bin-btn:hover:not(:disabled){background:var(--black);color:#fff}
.pd-bin-btn:disabled{opacity:.4;cursor:not-allowed}
.pd-section-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;margin:3rem 0 1.4rem;letter-spacing:.01em}
.recommendations-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.6rem}

/* ══════════════════════ REVIEWS ══════════════════════ */
.review-section{margin-top:3.5rem;border-top:1px solid var(--g2);padding-top:2.6rem}
.review-section h3{font-family:'Bebas Neue',sans-serif;font-size:2rem;margin-bottom:1.8rem;letter-spacing:.01em}
.review-summary{
  display:flex;gap:2.4rem;align-items:center;
  background:transparent;border-radius:0;
  padding:0 0 2rem;margin-bottom:2rem;flex-wrap:wrap;
  border:none;border-bottom:1px solid var(--g2);
}
.review-big-score{font-family:'Bebas Neue',sans-serif;font-size:4.2rem;line-height:1;color:var(--black)}
.review-stars-bar{flex:1;min-width:150px}
.review-star-row{display:flex;align-items:center;gap:.7rem;font-size:.8rem;margin-bottom:.35rem;color:var(--g4)}
.review-star-track{flex:1;height:2px;background:var(--g2);border-radius:0;overflow:hidden}
.review-star-fill{height:100%;border-radius:0;background:var(--black)}
.review-write-btn{
  background:transparent;color:var(--black);border:1px solid var(--black);
  padding:.8rem 1.8rem;font-family:'Inter',sans-serif;
  font-size:.76rem;font-weight:700;border-radius:0;cursor:pointer;
  transition:var(--tr);letter-spacing:.12em;text-transform:uppercase;
}
.review-write-btn:hover{background:var(--black);color:#fff}
.review-card{background:transparent;border:none;border-bottom:1px solid var(--g1);border-radius:0;padding:1.6rem 0;margin-bottom:0;box-shadow:none}
.review-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.7rem;flex-wrap:wrap;gap:.3rem}
.review-card-author{font-size:.92rem;font-weight:700}
.review-card-date{font-size:.76rem;color:var(--g4);letter-spacing:.03em}
.review-card-stars{color:var(--accent-ink);font-size:.88rem;margin-bottom:.6rem;letter-spacing:.08em}
.review-card-text{font-size:.9rem;color:var(--g5);line-height:var(--lh-relaxed)}
.review-card-img{width:78px;height:78px;object-fit:cover;border-radius:0;margin-top:.9rem;cursor:pointer}
.review-reply{
  background:var(--g1);border-radius:0;border-left:2px solid var(--black);
  padding:.9rem 1.1rem;margin-top:.9rem;font-size:.86rem;color:var(--g4);line-height:var(--lh-normal);
}
.review-actions{display:flex;gap:.9rem;margin-top:.9rem;flex-wrap:wrap}
.review-action-btn{
  background:none;border:none;
  padding:0;font-family:'Inter',sans-serif;
  font-size:.74rem;font-weight:600;border-radius:0;cursor:pointer;transition:var(--tr);
  letter-spacing:.08em;text-transform:uppercase;color:var(--g4);border-bottom:1px solid transparent;
}
.review-action-btn:hover{color:var(--black);border-bottom-color:var(--black)}
.review-action-btn.danger:hover{color:var(--red);border-bottom-color:var(--red)}

/* ══════════════════════ ORDERS ══════════════════════ */
.orders-hd{font-family:'Bebas Neue',sans-serif;font-size:2.7rem;margin-bottom:1rem;letter-spacing:.01em}
.order-card{background:var(--white);border:1px solid var(--g2);border-radius:0;margin-bottom:1px;overflow:hidden;box-shadow:none}
.order-card-summary{
  padding:1.6rem 1.8rem;cursor:pointer;
  display:flex;justify-content:space-between;align-items:center;
  flex-wrap:wrap;gap:.5rem;transition:var(--tr);
}
.order-card-summary:hover{background:var(--g1)}
.order-id{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:.03em}
.order-date{font-size:.8rem;color:var(--g4);margin-top:2px}
.order-status{font-size:.68rem;padding:.3rem .9rem;border-radius:0;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:1px solid currentColor;background:transparent !important}
.status-pending{color:#92400e}
.status-confirmed{color:#076a35}
.status-packed{color:#0c5460}
.status-shipped{color:#1e40af}
.status-delivered{color:#076a35}
.order-expand-btn{font-size:.9rem;color:var(--g4);background:none;border:none;cursor:pointer;transition:var(--tr)}
.order-expand-btn.open{transform:rotate(180deg)}
.order-details{display:none;border-top:1px solid var(--g2);padding:1.8rem}
.order-details.open{display:block}
.order-progress{display:flex;gap:0;margin-bottom:2rem;position:relative}
.order-progress::before{content:'';position:absolute;top:10px;left:0;right:0;height:1px;background:var(--g2);z-index:0}
.progress-step{flex:1;text-align:center;position:relative;z-index:1}
.ps-dot{width:20px;height:20px;border-radius:50%;background:var(--white);border:1px solid var(--g3);margin:0 auto .5rem;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:var(--g4)}
.progress-step.done .ps-dot{background:var(--black);border-color:var(--black);color:#fff}
.progress-step.active .ps-dot{background:var(--white);border-color:var(--black);color:var(--black);box-shadow:0 0 0 3px var(--g1)}
.ps-label{font-size:.66rem;color:var(--g4);text-transform:uppercase;letter-spacing:.1em;font-weight:600}
.progress-step.done .ps-label,.progress-step.active .ps-label{color:var(--black);font-weight:700}
.order-tracking-box{background:var(--g1);border:none;border-radius:0;padding:1.2rem;margin-bottom:1.2rem}
.tracking-link{color:var(--black);font-size:.86rem;cursor:pointer;text-decoration:underline}
.order-item-row{display:flex;align-items:center;gap:.9rem;padding:.7rem 0;border-bottom:1px solid var(--g1);font-size:.88rem}
.order-item-thumb{width:52px;height:52px;border-radius:0;overflow:hidden;background:var(--g2);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0}
.order-item-thumb img{width:100%;height:100%;object-fit:cover}
.order-actions{display:flex;gap:1.1rem;flex-wrap:wrap;margin-top:1.2rem}
.order-action-btn{
  background:none;border:none;border-bottom:1px solid var(--g4);
  padding:0 0 .1rem;font-family:'Inter',sans-serif;
  font-size:.76rem;font-weight:600;border-radius:0;cursor:pointer;transition:var(--tr);
  letter-spacing:.08em;text-transform:uppercase;color:var(--g5);
}
.order-action-btn:hover{color:var(--black);border-color:var(--black)}

/* ══════════════════════ CART DRAWER ══════════════════════ */
.overlay{position:fixed;inset:0;background:rgba(10,10,9,.5);z-index:300;opacity:0;pointer-events:none;transition:opacity .4s ease;backdrop-filter:blur(2px)}
.overlay.on{opacity:1;pointer-events:all}
.cart-drawer{
  position:fixed;top:0;right:-440px;width:420px;height:100vh;
  background:var(--white);z-index:301;display:flex;flex-direction:column;
  transition:right .45s cubic-bezier(.16,1,.3,1);
  box-shadow:none;border-left:1px solid var(--g2);
}
.cart-drawer.on{right:0}
.cd-header{background:var(--white);color:var(--black);padding:1.7rem 1.8rem;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;border-bottom:1px solid var(--g2)}
.cd-header-title{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:.03em}
.cd-close{background:none;border:none;color:var(--g4);cursor:pointer;font-size:1.3rem;transition:var(--tr)}
.cd-close:hover{color:var(--black)}
.cd-items{flex:1;overflow-y:auto;padding:0 1.8rem}
.cd-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--g4);font-size:.92rem;gap:.7rem;text-align:center;padding:2rem}
.cart-item{display:flex;align-items:center;gap:1rem;padding:1.4rem 0;border-bottom:1px solid var(--g1)}
.cart-item-thumb{width:70px;height:70px;background:var(--g2);border-radius:0;display:flex;align-items:center;justify-content:center;font-size:1.7rem;flex-shrink:0;overflow:hidden;color:var(--g4)}
.cart-item-thumb img{width:100%;height:100%;object-fit:cover}
.cart-item-info{flex:1;min-width:0}
.cart-item-name{font-size:.9rem;font-weight:600;margin-bottom:.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cart-item-brand{font-size:.76rem;color:var(--g4);text-transform:uppercase;letter-spacing:.04em}
.cart-item-price{font-size:.92rem;font-weight:700;letter-spacing:0;margin-top:.3rem}
.qty-control{display:flex;align-items:center;gap:.7rem;margin-top:.55rem}
.qty-btn{
  background:transparent;border:1px solid var(--g3);width:24px;height:24px;
  border-radius:50%;cursor:pointer;font-size:1rem;transition:var(--tr);
  display:flex;align-items:center;justify-content:center;font-weight:600;
}
.qty-btn:hover{border-color:var(--black)}
.cart-item-remove{background:none;border:none;color:var(--g3);cursor:pointer;font-size:1rem;transition:var(--tr);flex-shrink:0}
.cart-item-remove:hover{color:var(--red)}
.cd-summary{padding:1.4rem 1.8rem 1.8rem;border-top:1px solid var(--g2);flex-shrink:0;background:var(--white)}
.cd-summary-row{display:flex;justify-content:space-between;font-size:.86rem;margin-bottom:.6rem;color:var(--g4)}
.cd-total{font-weight:700;font-size:1.1rem;color:var(--black)}
.cd-actions{display:flex;flex-direction:column;gap:.7rem;margin-top:1rem}
.cd-checkout{
  width:100%;background:var(--black);color:#fff;border:1px solid var(--black);
  padding:1rem;border-radius:0;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:.8rem;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;transition:var(--tr);
}
.cd-checkout:hover{background:transparent;color:var(--black)}
.cd-clear{
  width:100%;background:transparent;color:var(--g4);
  border:1px solid var(--g2);padding:.85rem;
  border-radius:0;cursor:pointer;font-family:'Inter',sans-serif;
  font-size:.74rem;font-weight:600;transition:var(--tr);letter-spacing:.08em;text-transform:uppercase;
}
.cd-clear:hover{border-color:var(--red);color:var(--red)}

/* ══════════════════════ CHECKOUT MODAL ══════════════════════ */
.pay-modal{position:fixed;inset:0;background:rgba(10,10,9,.55);z-index:400;display:none;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px)}
.pay-modal.on{display:flex}
.pay-card{background:var(--white);width:640px;max-width:100%;border-radius:0;overflow:hidden;max-height:92vh;display:flex;flex-direction:column;box-shadow:var(--shadow-xl)}
.pay-head{background:var(--white);padding:1.7rem 2rem;display:flex;justify-content:space-between;align-items:center;color:var(--black);flex-shrink:0;border-bottom:1px solid var(--g2)}
.pay-head h3{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.03em}
.pay-head-close{background:none;border:none;color:var(--g4);cursor:pointer;font-size:1.3rem;transition:var(--tr)}
.pay-head-close:hover{color:var(--black)}
.pay-steps{display:flex;background:var(--white);border-bottom:1px solid var(--g2);flex-shrink:0}
.pay-step-btn{
  flex:1;padding:1rem;text-align:center;font-size:.72rem;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;border:none;background:none;
  cursor:pointer;position:relative;transition:var(--tr);color:var(--g4);
  font-family:'Inter',sans-serif;
}
.pay-step-btn::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:transparent;transition:var(--tr)}
.pay-step-btn.active{color:var(--black)}
.pay-step-btn.active::after{background:var(--black)}
.pay-step-btn.done{color:var(--g5)}
.pay-body{flex:1;overflow-y:auto}
.pay-section{display:none;padding:2rem}
.pay-section.active{display:block}
.receipt-box{background:transparent;border:none;border-bottom:1px solid var(--g2);border-radius:0;padding:0 0 1.4rem;margin-bottom:1.4rem}
.receipt-item{display:flex;justify-content:space-between;padding:.6rem 0;border-bottom:1px solid var(--g1);font-size:.86rem}
.receipt-item:last-child{border-bottom:none}
.receipt-totals{margin-top:1.2rem;padding-top:1rem;border-top:1px solid var(--g2)}
.receipt-total-row{display:flex;justify-content:space-between;font-size:.86rem;margin-bottom:.5rem}
.receipt-grand{font-weight:700;font-size:1.1rem}
.pay-label{font-size:.72rem;color:var(--g4);display:block;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.12em;font-weight:600}
.pay-input{
  width:100%;background:transparent;border:none;border-bottom:1px solid var(--g3);
  padding:.7rem .1rem;font-family:'Inter',sans-serif;font-size:.95rem;
  border-radius:0;margin-bottom:1.1rem;transition:var(--tr);
}
.pay-input:focus{border-color:var(--black);outline:none}
.pay-select{
  width:100%;background:transparent;border:none;border-bottom:1px solid var(--g3);
  padding:.7rem .1rem;font-family:'Inter',sans-serif;font-size:.95rem;
  border-radius:0;margin-bottom:1.1rem;cursor:pointer;
}
.delivery-estimate{font-size:.82rem;color:var(--g4);margin-top:-.5rem;margin-bottom:1rem;padding:0;background:transparent;border-radius:0;border:none;display:flex;align-items:center;gap:.4rem}
.pay-methods-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-bottom:1.4rem;background:var(--g2)}
.pay-method{
  border:none;padding:1.5rem;text-align:center;
  cursor:pointer;border-radius:0;transition:var(--tr);background:var(--white);
}
.pay-method:hover{background:var(--g1)}
.pay-method.selected{background:var(--black);color:#fff;box-shadow:none}
.pay-method-icon{font-size:1.9rem;margin-bottom:.5rem}
.pay-method-name{font-size:.92rem;font-weight:700}
.pay-method-desc{font-size:.76rem;color:var(--g4);margin-top:.3rem}
.pay-method.selected .pay-method-desc{color:rgba(255,255,255,.5)}
.no-cod-notice{background:transparent;border:1px solid var(--g3);border-radius:0;padding:1rem 1.2rem;font-size:.84rem;color:var(--g5);margin-bottom:1.3rem;line-height:var(--lh-relaxed)}
.pay-qr{display:none;margin-top:1.4rem;text-align:center}
.pay-qr.show{display:block}
.qr-box{background:transparent;border:1px solid var(--g2);border-radius:0;padding:1.8rem;display:inline-block;box-shadow:none}
.qr-grid{display:grid;grid-template-columns:repeat(10,17px);gap:2px;margin:0 auto 1rem}
.qr-cell{width:17px;height:17px;background:var(--black);border-radius:0}
.qr-cell.w{background:transparent}
.pay-qr-amount{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;color:var(--black);letter-spacing:.02em}
.i-have-paid-btn{
  width:100%;background:var(--black);color:#fff;border:1px solid var(--black);
  padding:1rem;border-radius:0;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:.85rem;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;transition:var(--tr);margin-top:1rem;
  display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
}
.i-have-paid-btn:hover{background:transparent;color:var(--black)}
.pay-nav{display:flex;gap:1rem;padding:1.5rem 2rem;border-top:1px solid var(--g2);flex-shrink:0;background:var(--white)}
.pay-nav-back{
  flex:1;background:transparent;color:var(--g4);
  border:1px solid var(--g3);padding:.9rem;border-radius:0;
  cursor:pointer;font-family:'Inter',sans-serif;font-size:.78rem;font-weight:500;transition:var(--tr);
  letter-spacing:.08em;text-transform:uppercase;
}
.pay-nav-back:hover{border-color:var(--black);color:var(--black)}
.pay-nav-next{
  flex:2;background:var(--black);color:#fff;border:1px solid var(--black);
  padding:.9rem;border-radius:0;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:.8rem;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;transition:var(--tr);
}
.pay-nav-next:hover{background:transparent;color:var(--black)}

/* ══════════════════════ CONFIRM MODAL ══════════════════════ */
.confirm-modal{position:fixed;inset:0;background:rgba(10,10,9,.6);z-index:500;display:none;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px)}
.confirm-modal.on{display:flex}
.confirm-card{background:var(--white);width:560px;max-width:100%;border-radius:0;overflow:hidden;text-align:center;box-shadow:var(--shadow-xl)}
.confirm-head{background:var(--black);padding:2.6rem 2rem;color:#fff}
.confirm-icon{margin-bottom:1rem;display:flex;justify-content:center;color:#fff}
.confirm-head h3{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;letter-spacing:.01em}
.confirm-body{padding:2.4rem}
.confirm-order-id{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:var(--g4);margin-bottom:1.5rem;letter-spacing:.05em}
.confirm-items{background:var(--g1);border-radius:0;padding:1.2rem;text-align:left;margin-bottom:1.5rem;font-size:.88rem;max-height:210px;overflow-y:auto}
.confirm-total{font-size:1.1rem;font-weight:700;margin-bottom:1.8rem}
.confirm-ok-btn{
  background:var(--black);color:#fff;border:1px solid var(--black);
  padding:1rem 3rem;border-radius:0;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:.8rem;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;transition:var(--tr);
}
.confirm-ok-btn:hover{background:transparent;color:var(--black)}

/* ══════════════════════ MERCHANT MODAL ══════════════════════ */
.merchant-modal{position:fixed;inset:0;background:rgba(10,10,9,.6);z-index:500;display:none;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
.merchant-modal.on{display:flex}
.merchant-modal-card{background:var(--white);width:460px;max-width:100%;border-radius:0;overflow:hidden;box-shadow:var(--shadow-xl)}
.mm-head{background:var(--black);padding:2.6rem;text-align:center;color:#fff}
.mm-head-icon{margin-bottom:.7rem;display:flex;justify-content:center;color:var(--accent3)}
.mm-head h3{font-family:'Bebas Neue',sans-serif;font-size:1.75rem;letter-spacing:.03em}
.mm-body{padding:2.2rem}
.mm-label{font-size:.72rem;color:var(--g4);display:block;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.14em;font-weight:600}
.mm-select,.mm-input{
  width:100%;background:transparent;border:none;border-bottom:1px solid var(--g3);
  padding:.75rem .1rem;font-family:'Inter',sans-serif;font-size:.95rem;
  border-radius:0;margin-bottom:1.3rem;transition:var(--tr);
}
.mm-select:focus,.mm-input:focus{border-color:var(--black);outline:none}
.mm-submit{
  width:100%;background:var(--black);color:#fff;border:1px solid var(--black);
  padding:1rem;border-radius:0;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:.82rem;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;margin-bottom:.9rem;transition:var(--tr);
}
.mm-submit:hover{background:transparent;color:var(--black)}
.mm-cancel{width:100%;background:transparent;border:none;color:var(--g4);cursor:pointer;font-family:'Inter',sans-serif;font-size:.78rem;padding:.55rem;letter-spacing:.06em;text-transform:uppercase}
.mm-hint{font-size:.8rem;color:var(--g4);margin-bottom:1.2rem;line-height:1.6}
.mm-error{background:transparent;border:1px solid var(--red);border-radius:0;padding:.7rem 1.1rem;font-size:.84rem;color:var(--red);margin-bottom:1rem;display:none}

/* ══════════════════════ MERCHANT DASHBOARD ══════════════════════ */
.merch-page-hd{grid-area:header;display:flex;justify-content:space-between;align-items:center;margin-bottom:0;flex-wrap:wrap;gap:.6rem;border-bottom:1px solid var(--g2);padding-bottom:.8rem}
.merch-page-title{font-family:'Bebas Neue',sans-serif;font-size:2.6rem;letter-spacing:.01em}
.merch-logout-btn{
  background:none;border:1px solid var(--g3);color:var(--g5);
  padding:.5rem 1.2rem;font-family:'Inter',sans-serif;font-size:.72rem;font-weight:600;
  border-radius:20px;cursor:pointer;transition:var(--tr);letter-spacing:.1em;text-transform:uppercase;
}
.merch-logout-btn:hover{border-color:var(--red);color:var(--red)}
#page-merchant .page-container{
  max-width:none;margin:0;padding:28px 32px 48px;
  display:grid;grid-template-columns:300px 1fr;
  grid-template-areas:"sidebar header" "sidebar stats" "sidebar content";
  grid-template-rows:auto auto 1fr;gap:1.6rem 2.2rem;align-items:start;
}
.merch-stats{grid-area:stats;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:0;background:transparent}
.merch-stat-card{
  background:var(--white);border:1px solid var(--g2);border-radius:16px;
  padding:1.5rem 1.4rem;text-align:left;box-shadow:0 2px 10px rgba(12,11,9,.04);
  transition:var(--tr);
}
.merch-stat-card:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(12,11,9,.09)}
.merch-stat-val{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;color:var(--black);letter-spacing:.01em}
.merch-stat-lbl{font-size:.66rem;color:var(--g4);text-transform:uppercase;letter-spacing:.16em;margin-top:5px;font-weight:600}
.merch-tabs{
  grid-area:sidebar;display:flex;flex-direction:column;gap:.3rem;
  background:#101a30;border-radius:20px;padding:1.5rem 1.1rem 1.7rem;
  border-bottom:none;position:sticky;top:calc(var(--top-h) + 20px);align-self:start;
  max-height:calc(100vh - var(--top-h) - 40px);overflow-y:auto;overflow-x:hidden;
  scrollbar-width:thin;
}
.ms-brand{
  color:#fff;font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.06em;
  padding:.4rem .8rem 1.3rem;border-bottom:1px solid rgba(255,255,255,.09);margin-bottom:.7rem;
  display:flex;align-items:center;gap:.6rem;text-transform:uppercase;
}
.mt-tab-indicator{
  position:absolute;left:1.1rem;right:1.1rem;top:0;height:0;
  background:#2f6fed;border-radius:12px;
  transform:translateY(0);
  transition:transform .38s cubic-bezier(.16,1,.3,1),height .38s cubic-bezier(.16,1,.3,1);
  z-index:0;pointer-events:none;
}
.mt-tab{
  position:relative;z-index:1;
  background:none;border:none;border-bottom:none;border-radius:12px;
  padding:.85rem 1rem;font-family:'Inter',sans-serif;width:100%;text-align:left;
  font-size:.86rem;font-weight:600;cursor:pointer;transition:color .2s ease,background-color .2s ease;
  display:flex;align-items:center;gap:.7rem;letter-spacing:.01em;text-transform:none;color:#9aa7c2;
}
.mt-tab.active{color:#fff;background:transparent}
.mt-tab:hover:not(.active){color:#fff;background:rgba(255,255,255,.07)}
.ms-divider{height:1px;background:rgba(255,255,255,.09);margin:.6rem .3rem}
.mgmt-home-btn{background:#fff;color:#0c0b09}
.mgmt-home-btn:hover{background:#eee;color:#0c0b09}
@media(max-width:900px){
  #page-merchant .page-container{grid-template-columns:1fr;grid-template-areas:"header" "sidebar" "stats" "content";padding:18px 16px 32px}
  .merch-tabs{position:static;flex-direction:row;overflow-x:auto;overflow-y:hidden;max-height:none;flex-wrap:nowrap}
  .mt-tab{flex:0 0 auto;white-space:nowrap}
  .mt-tab-indicator{display:none}
  .mt-tab.active{background:#2f6fed}
  .ms-brand,.ms-divider{display:none}
  .merch-stats{grid-template-columns:repeat(2,1fr)}
}
.merch-add-btn{
  background:var(--black);color:#fff;border:1px solid var(--black);
  padding:.7rem 1.5rem;font-family:'Inter',sans-serif;
  font-size:.76rem;font-weight:700;border-radius:0;cursor:pointer;
  margin-bottom:1.2rem;transition:var(--tr);letter-spacing:.1em;text-transform:uppercase;
}
.merch-add-btn:hover{background:transparent;color:var(--black)}
.merch-product-toolbar{display:flex;align-items:center;gap:.8rem;margin-bottom:1.2rem;flex-wrap:wrap}
.merch-search-wrap{position:relative;flex:1;min-width:220px;max-width:360px}
.merch-search-wrap input{
  width:100%;background:transparent;border:none;border-bottom:1px solid var(--g3);
  padding:.65rem .1rem .65rem 1.8rem;font-family:'Inter',sans-serif;
  font-size:.88rem;border-radius:0;transition:var(--tr);
}
.merch-search-wrap input:focus{border-color:var(--black);outline:none}
.merch-search-icon{position:absolute;left:0;top:50%;transform:translateY(-50%);color:var(--g4);font-size:.9rem;pointer-events:none;display:flex;align-items:center}
.merch-table{width:100%;border-collapse:collapse;font-size:.9rem}
.merch-table th,.merch-table td{border:none;border-bottom:1px solid var(--g2);padding:.9rem .8rem;text-align:left;vertical-align:middle}
.merch-table th{background:transparent;font-size:.66rem;text-transform:uppercase;letter-spacing:.12em;color:var(--g4);font-weight:700;border-bottom:1px solid var(--black)}
.merch-table tr:hover td{background:var(--g1)}
.tbl-action{
  background:none;border:none;border-bottom:1px solid var(--g4);
  padding:0;font-family:'Inter',sans-serif;
  font-size:.74rem;font-weight:600;border-radius:0;cursor:pointer;transition:var(--tr);margin-right:.9rem;
  letter-spacing:.05em;text-transform:uppercase;color:var(--g5);
}
.tbl-action:hover{color:var(--black);border-color:var(--black)}
.tbl-action.danger:hover{color:var(--red);border-color:var(--red)}
.status-select{background:transparent;border:1px solid var(--g3);padding:.3rem .6rem;font-family:'Inter',sans-serif;font-size:.82rem;border-radius:0}
.prod-id-badge{display:inline-block;background:transparent;color:var(--g4);font-size:.7rem;font-weight:600;padding:0;border-radius:0;font-family:'Inter',monospace;letter-spacing:.06em}

/* ══════════════════════ ORDER STATUS TABS ══════════════════════ */
.order-status-nav{
  display:flex;gap:0;margin-bottom:2rem;
  background:var(--white);border:none;border-bottom:1px solid var(--g2);
  border-radius:0;overflow:hidden;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;
  box-shadow:none;
}
.order-status-nav::-webkit-scrollbar{display:none}
.osn-tab{
  flex:1;min-width:110px;padding:.9rem .6rem;
  font-family:'Inter',sans-serif;font-size:.76rem;font-weight:600;
  text-align:center;cursor:pointer;background:none;border:none;border-bottom:2px solid transparent;
  color:var(--g4);transition:var(--tr);
  display:flex;flex-direction:column;align-items:center;gap:3px;white-space:nowrap;
  letter-spacing:.04em;text-transform:uppercase;
}
.osn-tab:hover{color:var(--black)}
.osn-tab.active{color:var(--black);border-bottom-color:var(--black)}
.osn-tab.active .osn-count{background:var(--black);color:#fff}
.osn-icon{font-size:1.1rem;line-height:1;display:flex}
.osn-label{font-size:.72rem;letter-spacing:.02em}
.osn-count{background:var(--g2);color:var(--g5);font-size:.64rem;font-weight:700;min-width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0 4px}
.osn-count.has-items{background:var(--red);color:#fff}

/* ══════════════════════ INVENTORY ══════════════════════ */
.inv-bar{display:flex;align-items:center;gap:1rem;margin-bottom:.9rem;font-size:.86rem}
.inv-label{min-width:150px;color:var(--black);font-weight:500}
.inv-track{flex:1;height:2px;background:var(--g2);border-radius:0;overflow:hidden}
.inv-fill{height:100%;border-radius:0;background:var(--black)}
.inv-fill.low{background:var(--accent-ink)}
.inv-fill.out{background:var(--red)}
.inv-num{font-size:.8rem;color:var(--g4);min-width:70px;text-align:right;font-weight:600}
.inv-edit{background:none;border:1px solid var(--g3);padding:.22rem .6rem;font-family:'Inter',sans-serif;font-size:.76rem;font-weight:600;border-radius:0;cursor:pointer;transition:var(--tr)}
.inv-edit:hover{background:var(--black);color:#fff;border-color:var(--black)}
.merch-order-detail{background:transparent;border:1px solid var(--g2);border-radius:0;padding:1.5rem;margin-bottom:1px;box-shadow:none}
.mod-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem}
.mod-id{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:.03em}
.mod-customer-info{font-size:.86rem;color:var(--g4);margin-bottom:1rem;line-height:var(--lh-relaxed)}
.mod-tracking-input{display:flex;gap:.6rem;margin-bottom:1rem;flex-wrap:wrap}
.mod-tracking-input input{
  flex:1;min-width:0;background:transparent;border:none;border-bottom:1px solid var(--g3);
  padding:.6rem .1rem;font-family:'Inter',sans-serif;font-size:.86rem;
  border-radius:0;transition:var(--tr);
}
.mod-tracking-input input:focus{border-color:var(--black);outline:none}
.mod-send-btn{
  background:var(--black);color:#fff;border:1px solid var(--black);
  padding:.6rem 1.2rem;font-family:'Inter',sans-serif;
  font-size:.74rem;font-weight:700;border-radius:0;
  cursor:pointer;white-space:nowrap;transition:var(--tr);letter-spacing:.06em;text-transform:uppercase;
}
.mod-send-btn:hover{background:transparent;color:var(--black)}
.review-respond-btn{
  background:none;border:none;border-bottom:1px solid var(--g4);
  padding:0;font-family:'Inter',sans-serif;
  font-size:.74rem;font-weight:600;border-radius:0;cursor:pointer;transition:var(--tr);margin-top:.6rem;
  letter-spacing:.06em;text-transform:uppercase;color:var(--g5);
}
.review-respond-btn:hover{color:var(--black);border-color:var(--black)}
.review-respond-area{display:none;margin-top:.6rem}
.review-respond-area.open{display:block}
.review-respond-area textarea{
  width:100%;background:transparent;border:1px solid var(--g3);
  padding:.7rem;font-family:'Inter',sans-serif;font-size:.86rem;
  border-radius:0;resize:vertical;min-height:75px;transition:var(--tr);
}
.review-respond-area textarea:focus{border-color:var(--black);outline:none}
.review-respond-submit{
  background:var(--black);color:#fff;border:1px solid var(--black);
  padding:.5rem 1.1rem;font-family:'Inter',sans-serif;font-size:.74rem;font-weight:700;
  border-radius:0;cursor:pointer;margin-top:.5rem;letter-spacing:.06em;text-transform:uppercase;
}
.review-respond-submit:hover{background:transparent;color:var(--black)}
.chart-container{background:var(--white);border:1px solid var(--g2);border-radius:0;padding:1.8rem;margin-bottom:2.6rem;height:290px;box-shadow:none}
.top-products-list{list-style:none}
.top-product-item{display:flex;align-items:center;gap:1rem;padding:.9rem 0;border-bottom:1px solid var(--g1)}
.tp-rank{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;color:var(--g3);width:26px;flex-shrink:0}
.tp-name{flex:1;font-size:.92rem;font-weight:600}

/* ══════════════════════ EDIT MODALS ══════════════════════ */
.edit-modal{position:fixed;inset:0;background:rgba(10,10,9,.55);z-index:600;display:none;align-items:center;justify-content:center;backdrop-filter:blur(4px);padding:1rem}
.edit-modal.on{display:flex}
.edit-card{background:var(--white);width:580px;max-width:100%;border-radius:0;overflow:hidden;max-height:92vh;display:flex;flex-direction:column;box-shadow:var(--shadow-xl)}
.edit-head{background:var(--white);padding:1.6rem 1.9rem;display:flex;justify-content:space-between;align-items:center;color:var(--black);flex-shrink:0;border-bottom:1px solid var(--g2)}
.edit-head h3{font-family:'Bebas Neue',sans-serif;font-size:1.45rem;letter-spacing:.03em}
.edit-close{background:none;border:none;color:var(--g4);cursor:pointer;font-size:1.2rem;transition:var(--tr)}
.edit-close:hover{color:var(--black)}
.edit-body{padding:1.9rem;overflow-y:auto;flex:1 1 auto;min-height:0;-webkit-overflow-scrolling:touch}
.edit-row{margin-bottom:1.3rem}
.edit-row label{font-size:.72rem;color:var(--g4);display:block;margin-bottom:.55rem;text-transform:uppercase;letter-spacing:.12em;font-weight:600}
.edit-row input,.edit-row select,.edit-row textarea{
  width:100%;background:transparent;border:none;border-bottom:1px solid var(--g3);
  padding:.7rem .1rem;font-family:'Inter',sans-serif;font-size:.95rem;
  border-radius:0;transition:var(--tr);
}
.edit-row input:focus,.edit-row select:focus,.edit-row textarea:focus{border-color:var(--black);outline:none}
.edit-row textarea{min-height:95px;resize:vertical}
.edit-row-2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.img-upload-area{border:1px dashed var(--g3);border-radius:0;padding:1.8rem;text-align:center;cursor:pointer;transition:var(--tr)}
.img-upload-area:hover{border-color:var(--black)}
.img-upload-icon{margin-bottom:.5rem;display:flex;justify-content:center;color:var(--g4)}
.img-preview{width:84px;height:84px;object-fit:cover;border-radius:0;margin:0 auto .6rem;display:none}
.edit-actions{display:flex;gap:1rem;margin-top:1.6rem;padding-top:1.2rem;border-top:1px solid var(--g2)}
.edit-save-btn{
  flex:2;background:var(--black);color:#fff;border:1px solid var(--black);
  padding:.9rem;border-radius:0;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:.8rem;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;transition:var(--tr);
}
.edit-save-btn:hover{background:transparent;color:var(--black)}
.edit-cancel-btn{
  flex:1;background:transparent;border:1px solid var(--g3);
  color:var(--g4);padding:.9rem;border-radius:0;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:.78rem;font-weight:500;transition:var(--tr);
  letter-spacing:.06em;text-transform:uppercase;
}
.edit-cancel-btn:hover{border-color:var(--black);color:var(--black)}

/* ══════════════════════ BRAND IMAGE UPLOAD ══════════════════════ */
.brand-img-upload-area{border:1px dashed var(--g3);border-radius:0;padding:1.4rem;text-align:center;cursor:pointer;transition:var(--tr);background:var(--g1);position:relative;overflow:hidden}
.brand-img-upload-area:hover{border-color:var(--black)}
.brand-img-upload-area.has-image{padding:0;border-style:solid;border-color:var(--black)}
.brand-img-preview-full{width:100%;height:145px;object-fit:cover;display:none;border-radius:0}
.brand-img-upload-area.has-image .brand-img-preview-full{display:block}
.brand-img-upload-area.has-image .brand-upload-placeholder{display:none}
.brand-upload-placeholder{padding:.9rem}
.brand-upload-change-overlay{display:none;position:absolute;inset:0;background:rgba(10,10,9,.6);align-items:center;justify-content:center;flex-direction:column;gap:.3rem;color:#fff;font-size:.85rem;letter-spacing:.08em;border-radius:0}
.brand-img-upload-area.has-image:hover .brand-upload-change-overlay{display:flex}

/* ══════════════════════ REVIEW MODAL ══════════════════════ */
.review-modal{position:fixed;inset:0;background:rgba(10,10,9,.55);z-index:600;display:none;align-items:center;justify-content:center;backdrop-filter:blur(4px);padding:1rem}
.review-modal.on{display:flex}
.review-modal-card{background:var(--white);width:540px;max-width:100%;border-radius:0;overflow:hidden;max-height:92vh;display:flex;flex-direction:column;box-shadow:var(--shadow-xl)}
.review-modal-head{background:var(--black);padding:1.6rem 1.9rem;display:flex;justify-content:space-between;align-items:center;color:#fff;flex-shrink:0}
.review-modal-head h3{font-family:'Bebas Neue',sans-serif;font-size:1.45rem;letter-spacing:.03em}
.star-picker{display:flex;gap:.5rem;font-size:2.2rem;cursor:pointer;margin:1rem 0}
.star-picker span{color:var(--g2);transition:var(--tr);border-radius:0}
.star-picker span.on{color:var(--accent-ink)}
.review-img-upload{border:1px dashed var(--g3);border-radius:0;padding:1.2rem;text-align:center;cursor:pointer;transition:var(--tr);margin-bottom:1rem}
.review-img-upload:hover{border-color:var(--black)}
.review-img-preview{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.6rem}
.review-img-preview img{width:66px;height:66px;object-fit:cover;border-radius:0}

/* ══════════════════════ TOAST ══════════════════════ */
.toast{
  position:fixed;bottom:2rem;right:2rem;
  background:var(--white);color:var(--black);
  padding:1.1rem 1.4rem 1.1rem 1.2rem;font-size:.9rem;
  border-left:2px solid var(--black);
  opacity:0;z-index:9999;border-radius:0;
  transform:translateY(14px);
  transition:opacity .3s cubic-bezier(.16,1,.3,1),transform .3s cubic-bezier(.16,1,.3,1);
  pointer-events:none;max-width:320px;
  font-family:'Inter',sans-serif;
  box-shadow:var(--shadow-xl);
  border:1px solid var(--g2);border-left-width:2px;
  display:flex;align-items:flex-start;gap:.8rem;line-height:1.5;
}
.toast.on{opacity:1;transform:translateY(0)}
.toast.success{border-left-color:var(--green)}
.toast.error{border-left-color:var(--red)}
.toast-icon{flex-shrink:0;margin-top:-.05rem;display:flex;align-items:center}
.toast-text{flex:1;font-size:.88rem;color:var(--g5);line-height:1.5}

.pd-gallery{position:relative;user-select:none}
.pd-img-track{display:flex;transition:transform .45s cubic-bezier(.16,1,.3,1);height:100%}
.pd-img-slide{min-width:100%;aspect-ratio:1;object-fit:cover;flex-shrink:0}
.pd-gallery-wrap{aspect-ratio:.82;border-radius:0;overflow:hidden;position:relative;box-shadow:none;background:var(--g2);touch-action:pan-y}
.pd-gallery-dots{display:flex;gap:.5rem;justify-content:center;margin-top:.9rem}
.pd-gallery-dot{width:6px;height:6px;border-radius:50%;background:var(--g3);border:none;cursor:pointer;transition:var(--tr);padding:0}
.pd-gallery-dot.active{width:6px;background:var(--black)}
.pd-gallery-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:5;background:rgba(250,248,244,.9);backdrop-filter:blur(4px);border:none;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:.95rem;display:flex;align-items:center;justify-content:center;transition:var(--tr);box-shadow:none}
.pd-gallery-arrow:hover{background:var(--white)}
.pd-gallery-prev{left:.9rem}.pd-gallery-next{right:.9rem}
.pd-img-counter{position:absolute;bottom:.9rem;right:.9rem;background:rgba(10,10,9,.65);color:#fff;font-size:.74rem;font-weight:600;padding:.28rem .7rem;border-radius:0;backdrop-filter:blur(3px);letter-spacing:.06em}

/* ══════════════════════ BACK TO TOP ══════════════════════ */
#back-to-top{
  position:fixed;bottom:2rem;right:2rem;
  background:var(--black);color:#fff;border:none;
  width:42px;height:42px;border-radius:50%;font-size:1.2rem;
  cursor:pointer;z-index:100;opacity:0;transform:translateY(14px);
  transition:var(--tr);box-shadow:var(--shadow-lg);
}
#back-to-top.show{opacity:1;transform:translateY(0)}
#back-to-top:hover{background:var(--g5)}

/* ══════════════════════ SKELETON ══════════════════════ */
.skeleton{
  background:linear-gradient(90deg,var(--g2) 25%,var(--g1) 50%,var(--g2) 75%);
  background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:0;
}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ══════════════════════ SITE BADGE ══════════════════════ */
.site-badge{
  position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);
  background:var(--black);color:var(--accent3);
  padding:.45rem 1.4rem;font-size:.66rem;font-weight:700;
  letter-spacing:.24em;text-transform:uppercase;border-radius:0;
  z-index:9997;pointer-events:none;white-space:nowrap;
  border:none;font-family:'Inter',sans-serif;
  backdrop-filter:none;
}

/* ══════════════════════ EVENTS ══════════════════════ */
.events-banner{min-height:220px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:var(--black)}
.events-banner-bg{position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070') center/cover;filter:brightness(.26) saturate(.9)}
.events-banner-content{position:relative;z-index:2;text-align:center;color:#fff;padding:2.5rem 2rem}
.events-banner h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.6rem,6vw,4.4rem);margin-bottom:.6rem;letter-spacing:0}
.events-badge{background:transparent;color:#fff;display:inline-block;padding:.5rem 1.3rem;border-radius:0;font-size:.72rem;letter-spacing:.18em;font-weight:600;text-transform:uppercase;border:1px solid rgba(255,255,255,.35)}
.event-card{background:var(--white);border:1px solid var(--g2);border-radius:0;overflow:hidden;margin-bottom:1px;transition:var(--tr);box-shadow:none}
.event-card:hover{transform:none;box-shadow:none;border-color:var(--g4)}
.event-card-banner{height:190px;background:var(--black);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.event-card-banner img{width:100%;height:100%;object-fit:cover;opacity:.85;transition:transform .5s ease}
.event-card:hover .event-card-banner img{transform:scale(1.04)}
.event-card-banner-placeholder{font-size:3.7rem}
.event-card-body{padding:1.5rem 1.7rem}
.event-card-meta{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.9rem}
.event-meta-pill{font-size:.7rem;font-weight:600;padding:.24rem .8rem;border-radius:0;display:inline-flex;align-items:center;gap:.3rem;letter-spacing:.05em;border:1px solid currentColor;background:transparent}
.event-meta-date{color:#92400e}
.event-meta-location{color:#0c5460}
.event-meta-brand{color:var(--g5);border-color:var(--g3)}
.event-card-title{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;line-height:1.1;margin-bottom:.6rem;letter-spacing:.01em}
.event-card-desc{font-size:.9rem;color:var(--g4);line-height:var(--lh-relaxed);margin-bottom:1rem}
.event-card-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;padding-top:.9rem;border-top:1px solid var(--g1)}
.event-card-posted-by{font-size:.8rem;color:var(--g4)}
.event-card-posted-by strong{color:var(--black)}
.event-interested-btn{
  background:none;border:1px solid var(--g3);
  padding:.4rem 1rem;font-family:'Inter',sans-serif;
  font-size:.76rem;font-weight:600;border-radius:0;cursor:pointer;transition:var(--tr);
  letter-spacing:.05em;text-transform:uppercase;
}
.event-interested-btn:hover,.event-interested-btn.on{background:var(--black);color:#fff;border-color:var(--black)}
.events-empty{text-align:center;padding:5rem 2rem;color:var(--g4)}
.events-empty-icon{margin-bottom:1.2rem;opacity:.4;display:flex;justify-content:center}
.events-empty-text{font-size:.95rem;line-height:1.7}
.add-event-form{background:var(--white);border:1px solid var(--g2);border-radius:0;padding:1.9rem;margin-bottom:2.2rem;box-shadow:none}
.add-event-form h3{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;margin-bottom:1.2rem;letter-spacing:.03em}
.event-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}

/* ══════════════════════ WELCOME MODAL — editorial swing tag ══════════════════════ */
.wm-backdrop{position:fixed;inset:0;background:rgba(10,10,9,.86);z-index:9995;display:none;align-items:center;justify-content:center;padding:2.4rem 1rem 1rem;backdrop-filter:blur(8px)}
.wm-backdrop.show{display:flex}
.wm-card{
  position:relative;width:460px;max-width:100%;
  background:var(--white);
  border-radius:0;
  box-shadow:var(--shadow-xl);
  animation:wmDrop .5s cubic-bezier(.16,1,.3,1);
  transform-origin:top center;
}
@keyframes wmDrop{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
.wm-eyelet{
  position:absolute;top:-14px;left:50%;transform:translateX(-50%);
  width:26px;height:26px;border-radius:50%;
  background:var(--black);
  border:2px solid var(--accent3);
  box-shadow:none;
  z-index:3;
}
.wm-eyelet::after{content:'';position:absolute;inset:8px;border-radius:50%;background:var(--white)}
.wm-close{
  position:absolute;top:.9rem;right:.9rem;z-index:3;
  width:30px;height:30px;border-radius:50%;
  background:rgba(255,255,255,.12);color:#fff;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:1rem;transition:var(--tr);
}
.wm-close:hover{background:rgba(255,255,255,.25)}
.wm-header{
  padding:2.4rem 2rem 1.7rem;text-align:center;position:relative;overflow:hidden;
  border-radius:0;
  background:var(--black);
}
.wm-header::before{content:none}
.wm-logo{width:52px;height:52px;border-radius:0;overflow:hidden;margin:0 auto 1rem;border:1px solid rgba(255,255,255,.15);background:#161614;display:flex;align-items:center;justify-content:center;box-shadow:none;position:relative;z-index:1}
.wm-logo img{width:100%;height:100%;object-fit:cover}
.wm-word{font-family:'Bebas Neue',sans-serif;font-size:2.1rem;color:#fff;letter-spacing:.03em;line-height:1;position:relative;z-index:1}
.wm-stamp{
  display:inline-flex;align-items:center;gap:.5rem;margin-top:.9rem;position:relative;z-index:1;
  border:1px solid rgba(255,255,255,.2);border-radius:0;
  padding:.32rem .9rem;transform:none;
  font-size:.66rem;letter-spacing:.22em;text-transform:uppercase;font-weight:600;color:rgba(255,255,255,.6);
}
.wm-stamp-dot{width:4px;height:4px;border-radius:50%;background:var(--accent3);flex-shrink:0}
.wm-perf{display:none}
.wm-body{padding:2rem 2rem 2.2rem}
.wm-tagline{font-family:'Instrument Serif',serif;font-style:italic;font-size:1.35rem;line-height:1.4;color:var(--g5);text-align:center;margin-bottom:1.6rem}
.wm-tagline em{color:var(--accent-ink);font-style:italic}
.wm-facts{border-top:1px solid var(--g2);margin-bottom:1.4rem}
.wm-fact{display:flex;align-items:baseline;gap:.5rem;padding:.6rem 0;border-bottom:1px solid var(--g1)}
.wm-fact-label{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--g4);font-weight:600;white-space:nowrap}
.wm-fact-leader{flex:1;border-bottom:none}
.wm-fact-val{font-size:.86rem;font-weight:500;color:var(--black);white-space:nowrap;display:flex;align-items:center;gap:.4rem;margin-left:auto}
.wm-fact-val svg{flex-shrink:0;color:var(--g5)}
.wm-stall{
  display:flex;align-items:center;gap:1.2rem;
  border:1px solid var(--g2);border-radius:0;
  padding:1.2rem 1.4rem;margin-bottom:1.6rem;
  background:var(--g1);
  position:relative;
  box-shadow:none;
}
.wm-stall-tag{
  position:absolute;top:-11px;left:20px;
  background:var(--black);color:#fff;
  font-size:.66rem;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;padding:.3rem .9rem;
  border-radius:0;
  white-space:nowrap;
}
.wm-stall-thumb{
  width:86px;height:86px;min-width:86px;
  border-radius:0;
  background:var(--white);
  border:1px solid var(--g2);
  overflow:hidden;
}
.wm-stall-thumb img{width:86px;height:86px;object-fit:cover}
.wm-stall-name{
  font-family:'Bebas Neue',sans-serif;font-size:1.35rem;
  letter-spacing:.02em;line-height:1.1;color:var(--black);
}
.wm-stall-sub{
  font-size:.84rem;color:var(--g5);margin-top:.35rem;
  font-weight:500;text-transform:capitalize;
}
.wm-ctas{display:flex;gap:0;border-top:1px solid var(--g2)}
.wm-cta-primary{flex:2;background:var(--black);color:#fff;border:none;padding:1rem;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:700;border-radius:0;cursor:pointer;letter-spacing:.08em;text-transform:uppercase;transition:var(--tr);margin-top:1.5rem;margin-right:.2rem}
.wm-cta-primary:hover{background:var(--g5)}
.wm-cta-secondary{flex:1;background:transparent;color:var(--g5);border:1px solid var(--g3);padding:1rem;font-family:'Inter',sans-serif;font-size:.76rem;font-weight:600;border-radius:0;cursor:pointer;transition:var(--tr);display:inline-flex;align-items:center;justify-content:center;gap:.4rem;margin-top:1.5rem;letter-spacing:.04em;text-transform:uppercase}
.wm-cta-secondary:hover{border-color:var(--black);color:var(--black)}
@media(max-width:480px){
  .wm-card{width:100%}
  .wm-facts{font-size:.95em}
}

/* Fallback icon for logo image failing to load */
.logo-fallback{position:relative}
.logo-fallback::after{
  content:'';
  position:absolute;inset:0;
  background:center/60% no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a9803a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 2l1.5 4h9L18 2'/%3E%3Cpath d='M3.5 6h17l-1.4 14.2a2 2 0 0 1-2 1.8H6.9a2 2 0 0 1-2-1.8z'/%3E%3Cline x1='9' y1='10' x2='9' y2='13'/%3E%3Cline x1='15' y1='10' x2='15' y2='13'/%3E%3C/svg%3E");
}

/* ══════════════════════ RESPONSIVE ══════════════════════ */
@media(max-width:1024px){
  .footer-inner{grid-template-columns:1fr 1fr;gap:2.4rem}
  .merch-stats{grid-template-columns:repeat(2,1fr)}
  .pd-layout{gap:3rem}
}
@media(max-width:900px){
  .topbar-nav{display:none}
  .home-hero-content{grid-template-columns:1fr}
  .pd-layout{grid-template-columns:1fr}
  .hero-brand-pills{display:none}
  .footer-inner{grid-template-columns:1fr}
  .product-card{flex-basis:calc(33.333% - 4px)}
  .brand-grid{grid-template-columns:repeat(3,1fr)}
  .brand-card{height:280px}
}
@media(max-width:640px){
  html{font-size:16px}
  #topbar{padding:0 1.2rem}
  .search-overlay-panel{width:100%;max-width:calc(100% - 24px)}
  .cart-drawer{width:100%;right:-100%}
  .carousel-section{height:64vh;min-height:420px}
  .carousel-slide{padding:0 1.5rem 3.5rem}
  .home-hero{padding:4rem 1.5rem;min-height:56vh}
  .home-section{padding:24px 14px}
  .page-container{padding:16px 14px}
  .pay-card{width:100%;border-radius:0;position:fixed;bottom:0;max-height:92vh}
  .pay-modal{align-items:flex-end;padding:0}
  .merch-stats{grid-template-columns:1fr 1fr}
  .tb-social{display:none}
  .edit-row-2{grid-template-columns:1fr}
  .order-status-nav{flex-wrap:nowrap}
  .event-form-grid{grid-template-columns:1fr}
  .product-card{flex-basis:calc(50% - 4px)}
  .brand-grid{grid-template-columns:repeat(2,1fr)}
  .brand-card{height:260px}
  .section-hd{flex-direction:column;align-items:flex-start;gap:.6rem}
}
/* ============================================================
   MANAGEMENT MODE — visually separates the Merchant/Admin
   dashboard from the customer-facing storefront.
   ============================================================ */
body.management-mode .customer-nav{display:none}
body.management-mode #topbar{background:#141210;border-bottom:2px solid #c8a96e}
body.management-mode .topbar-brand > div > div:first-child{color:#fff}
body.management-mode .topbar-brand > div > div:last-child{color:#c8a96e}
body.management-mode .tb-icon-btn{color:#fff}
body.management-mode .tb-social{display:none}
````

### 11.6 `lostandfound.js`  (1539 lines)

````javascript
const SHIPPING_RATES={lipa:{label:'Lipa City, Batangas',fee:110,days:4},batangas_city:{label:'Batangas City',fee:120,days:4},santo_tomas:{label:'Santo Tomas, Batangas',fee:110,days:4},tanauan:{label:'Tanauan, Batangas',fee:110,days:4},rosario:{label:'Rosario, Batangas',fee:120,days:4},bauan:{label:'Bauan, Batangas',fee:120,days:4},san_jose:{label:'San Jose, Batangas',fee:120,days:4},nasugbu:{label:'Nasugbu, Batangas',fee:130,days:5},other_batangas:{label:'Other Batangas Towns',fee:130,days:5},lucena:{label:'Lucena City, Quezon',fee:105,days:1},quezon_province:{label:'Quezon Province (other)',fee:130,days:3},laguna:{label:'Laguna',fee:140,days:3},cavite:{label:'Cavite',fee:150,days:3},rizal:{label:'Rizal',fee:155,days:2},metro_manila:{label:'Metro Manila (NCR)',fee:170,days:2},luzon_south:{label:'Southern Luzon (Bicol, etc)',fee:200,days:5},luzon_north:{label:'Northern Luzon',fee:220,days:6},visayas:{label:'Visayas',fee:270,days:7},mindanao:{label:'Mindanao',fee:290,days:8}};

const DEFAULT_BRANDS=[
  {id:'lostandfound',name:'Lost & Found',tag:'admin',desc:'Lost & Found system administrator. Full access to all merchants, products, orders, and settings.',img:'brand pics/logolostandfound.jpg',color:'#0c0b09'},
  {id:'geckoman',name:'Geckoman',tag:'hat',desc:'Quality caps and headwear for every style. Hats only — snapbacks, buckets, truckers & more.',img:'brand pics/gecko.jpg',color:'#1a0a00',location:'Batangas',year:'2021',schedule:'Every Saturday, 8AM–5PM',instagram:'@geckoman_ph',follows:142},
  {id:'hooksnloops',name:'Hooks n Loops',tag:'crochet',desc:'Crochet items and so much more! Bags, accessories, stuffed toys & handmade creations by Batangas locals.',img:'brand pics/Hooks  Loops.jpg',color:'#0a1a0a',location:'Batangas',year:'2022',schedule:'Weekends',instagram:'@hooksnloops',follows:98},
  {id:'outhrift',name:'Outhrift',tag:'thrift',desc:'Curated vintage tees, hoodies, and streetwear at affordable prices. Hand-picked thrift finds — tshirts, hoodies, jackets & more.',img:'brand pics/outhrift.jpg',color:'#001a0a',location:'Batangas',year:'2020',schedule:'Every Weekend, 9AM–6PM',instagram:'@outhrift',follows:318},
  {id:'10thrift',name:'10 Thrift',tag:'thrift',desc:'Affordable thrift finds, hand-picked weekly from local bazaars and ukay-ukay. Tops, bottoms, outerwear & more.',img:'brand pics/10thrift.jpg',color:'#0a0a1a',location:'Batangas',year:'2020',schedule:'Every Saturday',instagram:'@10thrift',follows:187},
  {id:'chasingscents',name:'Chasing Scents',tag:'perfume',desc:'Premium perfumes and niche fragrances. Wide selection of EDP, EDT, and body mists at great prices.',img:'brand pics/chasingscents.jpg',color:'#1a001a',location:'Batangas',year:'2022',schedule:'Weekends, 10AM–5PM',instagram:'@chasingscentsph',follows:256},
  {id:'beadsunstoppable',name:'Beads Unstoppable',tag:'thrift',desc:'Beads Unstoppable — quality thrift pieces at unbeatable prices. Tops, bottoms, outerwear & more.',img:'brand pics/greatdilemma.jpg',color:'#1a1a00',location:'Batangas',year:'2022',schedule:'Sundays, 8AM–4PM',instagram:'@beadsunstoppable',follows:98},
  {id:'zero4thrift',name:'Zero4Thrift',tag:'thrift',desc:'Fresh thrift drops every week. Tops, bottoms, outerwear & more at zero-budget prices.',img:'brand pics/zero4thrift.jpg',color:'#0a0010',location:'Batangas',year:'2021',schedule:'Weekends',instagram:'@zero4thrift',follows:134},
  {id:'kriztianothrift',name:'Kriztiano Thrift',tag:'thrift',desc:'Kriztiano Thrift — your go-to for affordable pre-loved fashion finds in Batangas.',img:'brand pics/kriztianothrift.jpg',color:'#1a0800',location:'Batangas',year:'2023',schedule:'Every Weekend',instagram:'@kriztianothrift',follows:77},
  {id:'perfumesbatangas',name:'Arranged by Annita',tag:'aniknik',desc:'Arranged by Annita — beautiful handcrafted bouquets and floral arrangements for every occasion.',img:'brand pics/Perfumes Batangas by Arashi.jpg',color:'#1a000a',location:'Batangas',year:'2022',schedule:'Weekends',instagram:'@arrangedbyannita',follows:201},
  {id:'selahessentials',name:'Selah Essentials',tag:'perfume',desc:'Carefully curated essential perfumes and scents. Calm your senses with Selah.',img:'brand pics/Selah Essentials.jpg',color:'#001010',location:'Batangas',year:'2023',schedule:'Weekends',instagram:'@selahessentials',follows:88},
  {id:'thriftthread',name:'Thrift Thread',tag:'thrift',desc:'Thrift Thread — curated pre-loved fashion finds for the budget-conscious fashionista in Batangas.',img:'brand pics/Fivis Thrift.jpg',color:'#0a1000',location:'Batangas',year:'2021',schedule:'Every Weekend',instagram:'@thriftthread',follows:145},
  {id:'soltheminishop',name:'Sol The Mini Shop',tag:'aniknik',desc:'Your neighborhood anik-anik shop! Collectibles, cute finds, accessories, novelty items & lifestyle products.',img:'brand pics/soltheminishop.jpg',color:'#10001a',location:'Batangas',year:'2023',schedule:'Weekends',instagram:'@soltheminishop',follows:109},
  {id:'daveskybiker',name:'Daveskybiker 3D Printing',tag:'3dprint',desc:'3D printing services for students, schools, creators & local businesses. Powered by Bambu Lab P2S, A1 & Elegoo Centauri Carbon.',img:'brand pics/Daveskybiker 3D Printing.jpg',color:'#001020',location:'Batangas',year:'2022',schedule:'Order anytime, pickup on market days',instagram:'@daveskybiker',follows:77},
];

const DEFAULT_PRODUCTS=[
  {id:1,brand:'geckoman',name:'Bass Pro',tag:'Hat',price:699,size:'56-58cm',img:'products for gecko/BASS PRO.jfif',new:true,stock:15,views:142},
  {id:2,brand:'geckoman',name:'Dont Trip',tag:'Hat',price:645,size:'57-59cm',img:'products for gecko/DONT PIRT.jfif',new:true,stock:8,views:98},
  {id:3,brand:'geckoman',name:'Supreme',tag:'Hat',price:795,size:'Adjustable',img:'products for gecko/SUPREME.jfif',new:false,stock:14,views:76},
  {id:4,brand:'geckoman',name:'Wake N Bake',tag:'Hat',price:695,size:'Adjustable',img:'products for gecko/WAKE  N BAKE.jfif',new:true,stock:6,views:55},
  {id:5,brand:'hooksnloops',name:'Mera Mera no Mi',tag:'KeyChain',price:480,size:'12cm',img:'products for hooks/in-love-with-a-boy-so-i-crocheted-him-a-mera-mera-no-mi-v0-ags6ibjlvgug1-removebg-preview.png',new:true,stock:7,views:88},
  {id:6,brand:'hooksnloops',name:'Baby Totoro',tag:'KeyChain',price:320,size:'Adjustable',img:'products for hooks/Baby_Totoro_Keychains-removebg-preview.png',new:true,stock:5,views:72},
  {id:7,brand:'hooksnloops',name:'Mr Bean Teddy',tag:'Toy',price:250,size:'10cm',img:'products for hooks/Mr._Bean_Teddy_handmade_crochet_keychain-removebg-preview.png',new:false,stock:12,views:44},
  {id:8,brand:'outhrift',name:'Vintage Tee — Washed',tag:'Top',price:350,size:'L',img:'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=500',new:true,stock:5,views:203},
  {id:9,brand:'outhrift',name:'Oversized Hoodie',tag:'Top',price:650,size:'XL',img:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=500',new:false,stock:12,views:87},
  {id:10,brand:'outhrift',name:'Graphic Band Tee',tag:'Top',price:280,size:'M',img:'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=500',new:true,stock:2,views:158},
  {id:11,brand:'10thrift',name:'Denim Jacket Raw',tag:'Outerwear',price:780,size:'M',img:'products for 10thrift/acme.jpg',new:false,stock:6,views:134},
  {id:12,brand:'10thrift',name:'Y2K Cargo Pants',tag:'Bottoms',price:520,size:'32',img:'products for 10thrift/loewe.jpg',new:true,stock:9,views:175},
  {id:13,brand:'10thrift',name:'Windbreaker Jacket',tag:'Outerwear',price:920,size:'L',img:'products for 10thrift/harley.jpg',new:true,stock:3,views:143},
  {id:14,brand:'chasingscents',name:'Midnight Bloom EDP',tag:'Perfume',price:850,size:'30ml',img:'https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500',new:true,stock:20,views:310},
  {id:15,brand:'chasingscents',name:'Cedar & Oud',tag:'Perfume',price:1200,size:'50ml',img:'https://images.unsplash.com/photo-1588776814546-1ffbb74cc0b7?q=80&w=500',new:false,stock:7,views:188},
  {id:17,brand:'beadsunstoppable',name:'necklace',tag:'Top',price:480,size:'M',img:'products for beads unstoppable/6390f4de-243e-4c03-b7ab-74af4318c9b0.jfif',new:false,stock:11,views:92},
  {id:34,brand:'beadsunstoppable',name:'bracelet',tag:'Bottoms',price:580,size:'30',img:'products for beads unstoppable/necklace.jfif',new:true,stock:5,views:112},
  {id:18,brand:'zero4thrift',name:'Washed Polo Shirt',tag:'Top',price:220,size:'L',img:'products for zero4thrift/cahmps.jpg',new:true,stock:8,views:66},
  {id:19,brand:'zero4thrift',name:'Vintage Crewneck',tag:'Top',price:350,size:'M',img:'products for zero4thrift/vntg.jpg',new:false,stock:4,views:54},
  {id:20,brand:'kriztianothrift',name:'Balenciaga Polo',tag:'Top',price:380,size:'M/L',img:'products for kriztiano/balen.jfif',new:true,stock:6,views:89},
  {id:21,brand:'kriztianothrift',name:'Vintage Graphic Hoodie',tag:'Top',price:490,size:'L',img:'products for kriztiano/vntg wres.jfif',new:false,stock:4,views:67},
  {id:22,brand:'perfumesbatangas',name:'Classic Rose Bouquet',tag:'Bouquet',price:750,size:'Medium',img:'https://images.unsplash.com/photo-1487530811015-780780d13b82?q=80&w=500',new:true,stock:15,views:231},
  {id:23,brand:'perfumesbatangas',name:'Sunflower Arrangement',tag:'Bouquet',price:450,size:'Small',img:'https://images.unsplash.com/photo-1490750967868-88df5691cc4a?q=80&w=500',new:false,stock:18,views:144},
  {id:24,brand:'selahessentials',name:'Selah Rose & Musk',tag:'Perfume',price:580,size:'50ml',img:'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=500',new:true,stock:12,views:88},
  {id:25,brand:'selahessentials',name:'Selah Amber Collection',tag:'Perfume',price:650,size:'30ml',img:'https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500',new:false,stock:9,views:71},
  {id:26,brand:'thriftthread',name:'Vintage Oversized Jacket',tag:'Outerwear',price:620,size:'L',img:'products for thrift thread/ae104824-0b70-468c-a40a-2e3b7d60e493.jfif',new:true,stock:4,views:101},
  {id:27,brand:'thriftthread',name:'Thrift Graphic Tee',tag:'Top',price:260,size:'M',img:'products for thrift thread/stuss.jfif',new:false,stock:8,views:74},
  {id:28,brand:'soltheminishop',name:'Enamel Pin Collection',tag:'Anik-anik',price:120,size:'One size',img:'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',new:true,stock:30,views:177},
  {id:29,brand:'soltheminishop',name:'Mini Keychain Set',tag:'Anik-anik',price:95,size:'One size',img:'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',new:false,stock:25,views:88},
  {id:30,brand:'soltheminishop',name:'Novelty Sticker Pack',tag:'Anik-anik',price:75,size:'One size',img:'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',new:true,stock:40,views:112},
  {id:31,brand:'daveskybiker',name:'Custom 3D Print (Small)',tag:'3D Print',price:150,size:'Custom',img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',new:true,stock:99,views:143},
  {id:32,brand:'daveskybiker',name:'Engineering Part Prototype',tag:'3D Print',price:350,size:'Custom',img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',new:false,stock:99,views:88},
  {id:33,brand:'daveskybiker',name:'Custom 3D Print (Large)',tag:'3D Print',price:650,size:'Custom',img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',new:true,stock:99,views:65},
];

// NOTE: previous versions of this file force-cleared localStorage on every
// load (wiping carts, orders, merchant edits, everything). That reset has
// been removed — data now actually persists across page loads as intended.
// If you ever want a guaranteed-fresh demo state, use the "Reset All Images"
// button (site images only) or clear site data in devtools manually.

const DEFAULT_ORDERS=[
  {id:'ORD-20240101',items:[{id:14,name:'Midnight Bloom EDP',price:850,qty:1,brand:'chasingscents',size:'30ml',img:'https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500'},{id:28,name:'Enamel Pin Collection',price:120,qty:1,brand:'soltheminishop',size:'One size',img:'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600'}],total:1140,shippingFee:170,date:'January 15, 2026',customer:'Maria Santos',email:'maria@email.com',phone:'+63 912 345 6789',address:'123 Rizal St, Lipa City, Batangas',payMethod:'gcash',status:'delivered',trackingNumber:'JT2026011501234',messages:[{role:'merchant',text:'Your order has been packed and shipped! Tracking: JT2026011501234',time:'Jan 16, 9:00 AM'},{role:'customer',text:'Thank you! Will wait for it.',time:'Jan 16, 10:15 AM'}],timeline:{placed:'Jan 15',confirmed:'Jan 15',packed:'Jan 16',shipped:'Jan 16',delivered:'Jan 18'}},
  {id:'ORD-20240202',items:[{id:1,name:'Bass Pro',price:699,qty:1,brand:'geckoman',size:'56-58cm',img:'products for gecko/BASS PRO.jfif'}],total:620,shippingFee:170,date:'February 5, 2026',customer:'Juan dela Cruz',email:'juan@email.com',phone:'+63 998 765 4321',address:'456 Mabini Ave, Manila',payMethod:'paymaya',status:'shipped',trackingNumber:'JT2026020567890',messages:[{role:'merchant',text:'Hi! Your cap is on the way. Tracking: JT2026020567890',time:'Feb 6, 2:00 PM'}],timeline:{placed:'Feb 5',confirmed:'Feb 5',packed:'Feb 6',shipped:'Feb 6',delivered:null}},
];

const DEFAULT_REVIEWS=[
  {id:'rv1',productId:14,author:'Maria Santos',rating:5,text:'Absolutely love Midnight Bloom! The scent lasts all day and I get compliments everywhere.',img:null,date:'Jan 20, 2026',merchantReply:"Thank you so much Maria! We're so glad you love it."},
  {id:'rv2',productId:1,author:'Juan dela Cruz',rating:4,text:'Great cap, fits perfectly and the quality is solid. Very happy with my purchase from Geckoman!',img:null,date:'Feb 12, 2026',merchantReply:null},
];

let TESTIMONIALS=JSON.parse(localStorage.getItem('lf_testimonials')||'null')||[
  {id:'t1',name:'Mika Santos',location:'Lipa, Batangas',rating:5,text:'Got a gorgeous vintage tee from Outhrift — came super fast and quality was amazing! Will definitely order again.',avatar:'MS',approved:true},
  {id:'t2',name:'Jake Reyes',location:'Batangas City',rating:5,text:"The snapback from Geckoman fits perfectly. Best cap I've bought! Great quality and fast shipping.",avatar:'JR',approved:true},
  {id:'t3',name:'Camille Cruz',location:'Tanauan',rating:4,text:'Chasing Scents has the best selections. Midnight Bloom is now my everyday scent!',avatar:'CC',approved:true},
  {id:'t4',name:'Renz Villanueva',location:'Nasugbu',rating:5,text:"Sol The Mini Shop has the cutest anik-anik finds! Got a whole set of enamel pins. Supporting local Batangas brands has never been this easy!",avatar:'RV',approved:true},
];
let TESTIMONIAL_REQUESTS=JSON.parse(localStorage.getItem('lf_testim_reqs')||'[]');

const MERCHANT_ACCOUNTS={}; // passwords are checked ONLY by the server (backend/Api.php)

let BRANDS=JSON.parse(localStorage.getItem('lf_brands2')||'null')||DEFAULT_BRANDS;
let PENDING_IMAGES=JSON.parse(localStorage.getItem('lf_pending_imgs')||'[]');
function persistImgs(){localStorage.setItem('lf_pending_imgs',JSON.stringify(PENDING_IMAGES));}
function submitForApproval(type,imageData,targetIndex,label){
  if(!currentMerchant)return;
  PENDING_IMAGES.push({id:'img'+Date.now(),merchantId:currentMerchant.id,merchantName:currentMerchant.name,type,imageData,targetIndex,label,status:'pending',submittedAt:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})});
  persistImgs();
  toast('Image submitted — waiting for admin approval','success');
  addNotif('merchant',ICONS.clock,'"'+label+'" pending admin approval',null);
}
function approveImage(imgId){
  const img=PENDING_IMAGES.find(i=>i.id===imgId);if(!img)return;
  img.status='approved';persistImgs();
  if(img.type==='carousel'){const slides=document.querySelectorAll('.carousel-slide .cs-bg');if(slides[img.targetIndex])slides[img.targetIndex].style.backgroundImage=`url('${img.imageData}')`;const s=JSON.parse(localStorage.getItem('lf_admin_carousel')||'[]');s[img.targetIndex]=img.imageData;localStorage.setItem('lf_admin_carousel',JSON.stringify(s));}
  else if(img.type==='arrivals'){const bg=document.querySelector('.arrivals-banner-bg');if(bg)bg.style.backgroundImage=`url('${img.imageData}')`;localStorage.setItem('lf_admin_arrivals_bg',img.imageData);}
  else if(img.type==='events'){const bg=document.querySelector('.events-banner-bg');if(bg)bg.style.backgroundImage=`url('${img.imageData}')`;localStorage.setItem('lf_admin_events_bg',img.imageData);}
  else if(img.type==='hero'){const bg=document.querySelector('.home-hero-bg');if(bg)bg.style.backgroundImage=`url('${img.imageData}')`;localStorage.setItem('lf_admin_hero_bg',img.imageData);}
  toast('Image approved and live','success');renderImageApprovals();
}
function rejectImage(imgId){
  const img=PENDING_IMAGES.find(i=>i.id===imgId);if(!img)return;
  img.status='rejected';persistImgs();toast('Image rejected','error');renderImageApprovals();
}
function renderImageApprovals(){
  const el=document.getElementById('admin-img-approvals-list');if(!el)return;
  const pending=PENDING_IMAGES.filter(i=>i.status==='pending');
  if(!pending.length){el.innerHTML='<div style="color:var(--g4);font-size:.875rem;padding:1rem 0">No pending image approvals.</div>';return;}
  el.innerHTML=pending.map(img=>`<div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem;display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap;box-shadow:var(--shadow)"><img src="${img.imageData}" style="width:110px;height:75px;object-fit:cover;border-radius:10px;flex-shrink:0"><div style="flex:1;min-width:150px"><div style="font-weight:700;font-size:.9rem;margin-bottom:.25rem">${img.label}</div><div style="font-size:.78rem;color:var(--g4)">From: <strong>${img.merchantName}</strong> · ${img.submittedAt}</div><div style="font-size:.78rem;color:var(--g4);margin-top:.15rem">Type: ${img.type}${img.targetIndex!=null?' (slot '+(img.targetIndex+1)+')':''}</div><div style="display:flex;gap:.5rem;margin-top:.75rem"><button class="tbl-action" style="background:#dcf5eb;border-color:#076a35;color:#076a35" onclick="approveImage('${img.id}')">${ICONS.check} Approve</button><button class="tbl-action danger" onclick="rejectImage('${img.id}')">${ICONS.x} Reject</button></div></div></div>`).join('');
}
let PRODUCTS=JSON.parse(localStorage.getItem('lf_products2')||'null')||DEFAULT_PRODUCTS;
let cart=JSON.parse(localStorage.getItem('lf_cart')||'[]');
let orders=JSON.parse(localStorage.getItem('lf_orders2')||'null')||DEFAULT_ORDERS;
let reviews=JSON.parse(localStorage.getItem('lf_reviews2')||'null')||DEFAULT_REVIEWS;
let recentlyViewed=JSON.parse(localStorage.getItem('lf_rv')||'[]');
let browseHistory=JSON.parse(localStorage.getItem('lf_browse')||'[]');
let customerNotifs=JSON.parse(localStorage.getItem('lf_cnotifs')||'[]');
let merchantNotifs=JSON.parse(localStorage.getItem('lf_mnotifs')||'[]');
let currentMerchant=null,shippingFee=0,selPayMethod=null,checkoutStep=1,buyNowItem=null;
let carouselIdx=0,carouselTimer=null;
let curBrandProds=[],curPage=1,prodNewFilter='all';
let reviewStar=0,reviewImgData=null,salesChart=null;
let saleEnd=Date.now()+2*24*60*60*1000+3*3600*1000;
let activeBrandFilter='all';
let activeOrderStatusFilter='all'; // NEW: for merchant order tabs

// ── ICON LIBRARY (inline SVG, replaces emoji for a cleaner look) ──
const ICONS={
  search:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  bell:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  store:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"/></svg>',
  user:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  key:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg>',
  lock:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  cart:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  package:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  clipboard:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z"/><rect x="4" y="5" width="16" height="16" rx="2"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
  clock:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polyline points="20 6 9 17 4 12"/></svg>',
  checkCircle:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  truck:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  barChart:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
  archive:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
  tag:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  star:'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="vertical-align:-2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  calendar:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  message:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  image:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  plus:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  camera:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  x:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  mapPin:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  creditCard:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  mail:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
  alertTriangle:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  heart:'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="vertical-align:-2px"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>',
  lightbulb:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
  sparkle:'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="vertical-align:-1px"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z"/></svg>',
  tent:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 21L12 3l8.5 18"/><path d="M12 3v18"/><path d="M6 21l6-9 6 9"/></svg>',
  qr:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  bag:'<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2l1.5 4h9L18 2"/><path d="M3.5 6h17l-1.4 14.2a2 2 0 0 1-2 1.8H6.9a2 2 0 0 1-2-1.8z"/><line x1="9" y1="10" x2="9" y2="13"/><line x1="15" y1="10" x2="15" y2="13"/></svg>',
  partyPopper:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3L2 22l10.7-3.8"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="M11 13c1.7-1.28 3.5-1.28 5.2 0L18 15l1.5-1.5"/></svg>',
};

// ── FOCUS MANAGEMENT (accessibility) ──
// Remembers what was focused before a modal/drawer opens, moves focus
// into the panel, and restores it on close so keyboard users don't get lost.
let _focusStack=[];
function openA11yPanel(panelEl){
  if(!panelEl)return;
  _focusStack.push(document.activeElement);
  setTimeout(()=>{
    const focusable=panelEl.querySelector('input,button,select,textarea,[tabindex]:not([tabindex="-1"])');
    if(focusable)focusable.focus();
  },60);
}
function closeA11yPanel(){
  const prev=_focusStack.pop();
  if(prev&&typeof prev.focus==='function')prev.focus();
}

// ── PERSISTENT SESSION ──
(function restoreSession(){
  const saved = sessionStorage.getItem('lf_session');
  if(saved){
    try{
      const s = JSON.parse(saved);
      currentMerchant = s.merchant;
      if(currentMerchant){
        const isAdmin = currentMerchant.id==='lostandfound';
        document.getElementById('merchant-btn').innerHTML = ICONS[isAdmin?'key':'store']+' '+(isAdmin?'Admin':currentMerchant.name);
        document.getElementById('merchant-btn').classList.add('logged-in');
        if(isAdmin) document.getElementById('merchant-btn').style.background='linear-gradient(135deg,#c8a96e,#f0d9a8)';
        document.getElementById('merch-notif-wrap').classList.add('visible');
      }
    }catch(e){}
  }
})();

function saveSession(){
  sessionStorage.setItem('lf_session',JSON.stringify({merchant:currentMerchant}));
}

function persist(){localStorage.setItem('lf_testimonials',JSON.stringify(TESTIMONIALS));
localStorage.setItem('lf_testim_reqs',JSON.stringify(TESTIMONIAL_REQUESTS));localStorage.setItem('lf_brands2',JSON.stringify(BRANDS));localStorage.setItem('lf_products2',JSON.stringify(PRODUCTS));localStorage.setItem('lf_cart',JSON.stringify(cart));localStorage.setItem('lf_orders2',JSON.stringify(orders));localStorage.setItem('lf_reviews2',JSON.stringify(reviews));localStorage.setItem('lf_rv',JSON.stringify(recentlyViewed));localStorage.setItem('lf_browse',JSON.stringify(browseHistory));localStorage.setItem('lf_cnotifs',JSON.stringify(customerNotifs));localStorage.setItem('lf_mnotifs',JSON.stringify(merchantNotifs));}

function toast(msg,type=''){const icons={success:ICONS.check,error:ICONS.x,'':ICONS.bell};const el=document.getElementById('toast');document.getElementById('toast-icon').innerHTML=icons[type]||ICONS.bell;document.getElementById('toast-text').textContent=msg;el.className='toast on'+(type?' '+type:'');clearTimeout(el._t);el._t=setTimeout(()=>el.className='toast',3000);}
function fmtMoney(n){if(typeof n==='string'&&isNaN(Number(n)))return n.startsWith('₱')?n:'₱'+n;return '₱'+Number(n).toLocaleString();}
function getBrand(id){return BRANDS.find(b=>b.id===id)||{id,name:id,color:'#111',tag:'',location:'Batangas',year:'',schedule:'',instagram:'',img:'',desc:''};}
function getBrandName(id){return getBrand(id).name;}
function getProduct(id){return PRODUCTS.find(p=>p.id==id);}
function stockStatus(s){if(s<=0)return['Out of Stock','stock-out'];if(s<=5)return['Low Stock','stock-low'];return['In Stock','stock-in'];}
function nowTime(){return new Date().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});}
function getProductAvgRating(pid){const r=reviews.filter(rv=>rv.productId==pid);return r.length?(r.reduce((s,rv)=>s+rv.rating,0)/r.length).toFixed(1):null;}
function sortProds(arr,sv){let s=[...arr];if(sv==='price-low')s.sort((a,b)=>a.price-b.price);if(sv==='price-high')s.sort((a,b)=>b.price-a.price);if(sv==='name-az')s.sort((a,b)=>a.name.localeCompare(b.name));if(sv==='newest')s.sort((a,b)=>(b.new?1:0)-(a.new?1:0));return s;}
function showSpinner(ms=600){const s=document.getElementById('spinner');s.classList.add('on');setTimeout(()=>s.classList.remove('on'),ms);}
function brandEmoji(tag){return ICONS.tag;}

function _navigateToImpl(page){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const el=document.getElementById('page-'+page);if(!el)return;el.classList.add('active');document.querySelectorAll('.tn-btn').forEach(b=>b.classList.remove('active'));const nav=document.querySelector(`.tn-btn[onclick*="'${page}'"]`);if(nav)nav.classList.add('active');window.scrollTo({top:0,behavior:'smooth'});closeAllDropdowns();if(page==='home')renderHome();if(page==='catalog'){renderBrandGrid();showAllBrands();}if(page==='arrivals')renderArrivals();if(page==='orders')renderOrders();if(page==='events'){renderEventsPage();}if(page==='merchant'){if(!currentMerchant){openMerchantModal();return;}document.body.classList.add('management-mode');renderMerchantDash();}else{document.body.classList.remove('management-mode');}}
function navigateTo(page){if(document.startViewTransition){document.startViewTransition(()=>_navigateToImpl(page));}else{_navigateToImpl(page);}}
function goMerchTab(tab){if(!currentMerchant){openMerchantModal();return;}navigateTo('merchant');const btn=document.querySelector('.mt-tab[data-tab="'+tab+'"]');showMerchTab(tab,btn);}
function closeAllDropdowns(){document.getElementById('notif-dropdown')?.classList.remove('open');document.getElementById('merch-notif-dropdown')?.classList.remove('open');}

function carouselGo(n){carouselIdx=n;document.getElementById('carousel-track').style.transform=`translateX(-${n*100}%)`;document.querySelectorAll('.carousel-dot').forEach((d,i)=>d.classList.toggle('active',i===n));}
function carouselMove(dir){carouselIdx=(carouselIdx+dir+4)%4;carouselGo(carouselIdx);resetCarouselTimer();}
function startCarouselTimer(){carouselTimer=setInterval(()=>carouselMove(1),5000);}
function resetCarouselTimer(){clearInterval(carouselTimer);startCarouselTimer();}
function updateCountdown(){const diff=Math.max(0,saleEnd-Date.now());const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v).padStart(2,'0');};set('cd-days',Math.floor(diff/86400000));set('cd-hours',Math.floor((diff%86400000)/3600000));set('cd-mins',Math.floor((diff%3600000)/60000));set('cd-secs',Math.floor((diff%60000)/1000));}

function getFirstImg(p){return(p.imgs&&p.imgs[0])||p.img||'';}
function makeGallery(imgs,productId){
  if(!imgs||!imgs.length)imgs=[''];
  const multi=imgs.length>1;
  return`<div class="pd-gallery-wrap" id="gallery-${productId}" data-idx="0" data-imgs='${JSON.stringify(imgs)}' ontouchstart="galleryTouchStart(event,'${productId}')" ontouchend="galleryTouchEnd(event,'${productId}')"><div class="pd-img-track" id="gtrack-${productId}" style="display:flex">${imgs.map(src=>`<div style="min-width:100%;aspect-ratio:1;background:var(--g2);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;color:var(--g3)">${src?`<img src="${src}" style="width:100%;height:100%;object-fit:cover" loading="lazy">`:`<span style="transform:scale(6)">${ICONS.tag}</span>`}</div>`).join('')}</div>${multi?`<button class="pd-gallery-arrow pd-gallery-prev" onclick="galleryMove('${productId}',-1)" aria-label="Previous image">←</button><button class="pd-gallery-arrow pd-gallery-next" onclick="galleryMove('${productId}',1)" aria-label="Next image">→</button><div class="pd-img-counter" id="gcounter-${productId}">1 / ${imgs.length}</div>`:''}</div>${multi?`<div class="pd-gallery-dots" id="gdots-${productId}">${imgs.map((_,i)=>`<button class="pd-gallery-dot ${i===0?'active':''}" onclick="galleryGo('${productId}',${i})" aria-label="Image ${i+1}"></button>`).join('')}</div>`:''}`;
}
function galleryGo(pid,idx){
  const wrap=document.getElementById('gallery-'+pid);
  const track=document.getElementById('gtrack-'+pid);
  const imgs=JSON.parse(wrap.dataset.imgs);
  idx=Math.max(0,Math.min(imgs.length-1,idx));
  wrap.dataset.idx=idx;
  track.style.transform=`translateX(-${idx*100}%)`;
  document.querySelectorAll(`#gdots-${pid} .pd-gallery-dot`).forEach((d,i)=>d.classList.toggle('active',i===idx));
  const counter=document.getElementById('gcounter-'+pid);
  if(counter)counter.textContent=`${idx+1} / ${imgs.length}`;
}
function galleryMove(pid,dir){
  const wrap=document.getElementById('gallery-'+pid);
  const imgs=JSON.parse(wrap.dataset.imgs);
  galleryGo(pid,parseInt(wrap.dataset.idx)+dir);
}
let _touchStartX=0;
function galleryTouchStart(e,pid){_touchStartX=e.touches[0].clientX;}
function galleryTouchEnd(e,pid){const diff=_touchStartX-e.changedTouches[0].clientX;if(Math.abs(diff)>40)galleryMove(pid,diff>0?1:-1);}

function makeCard(p,ranked=false){const soldOut=p.stock<=0;const onSale=p.originalPrice&&parseFloat(p.originalPrice)>parseFloat(p.price);const avg=getProductAvgRating(p.id);const rank=ranked?[...PRODUCTS].sort((a,b)=>b.views-a.views).findIndex(x=>x.id===p.id)+1:0;return `<div class="product-card" onclick="openProductDetail(${p.id})" role="button" tabindex="0" aria-label="${p.name}, ${fmtMoney(p.price)}" onkeydown="if(event.key==='Enter'){openProductDetail(${p.id})}"><div class="card-img"><div class="card-badges">${soldOut?'<div class="card-soldout-badge">Sold Out</div>':(onSale?'<div class="card-sale-badge">Sale</div>':(p.new?'<div class="card-new-badge">New</div>':''))}</div>${getFirstImg(p)?`<img src="${getFirstImg(p)}" alt="${p.name}" loading="lazy">`:`<span style="z-index:1;position:relative;color:var(--g3);transform:scale(3)">${ICONS.tag}</span>`}${ranked&&rank?`<div class="trending-rank">${rank}</div>`:''}<button class="card-action-btn" onclick="event.stopPropagation();addToCart(${p.id})" title="Add to cart" aria-label="Add ${p.name} to cart" ${soldOut?'disabled':''}>${ICONS.plus}</button></div><div class="card-body"><div class="card-row"><div><div class="card-brand">${getBrandName(p.brand)}</div><div class="card-name">${p.name}</div></div><div class="card-price-wrap">${onSale?`<span class="card-price-original">${fmtMoney(p.originalPrice)}</span>`:''}<span class="card-price${onSale?' on-sale':''}">${fmtMoney(p.price)}</span></div></div>${avg?`<div class="card-avg-rating">${'★'.repeat(Math.round(parseFloat(avg)))} ${avg}</div>`:''}</div></div>`;}
function renderGrid(id,list,ranked=false){const el=document.getElementById(id);if(!el)return;el.innerHTML=list.length?list.map(p=>makeCard(p,ranked)).join(''):'<p style="color:var(--g4);font-size:.9rem;padding:1.1rem">No items found.</p>';}

function renderHome(){showSpinner(400);renderArrivalsCollage();renderMerchantsCollage();renderTrendingCollage();const sb=document.getElementById('stat-brands');if(sb)sb.textContent=BRANDS.length;const sp=document.getElementById('stat-products');if(sp)sp.textContent=PRODUCTS.length;const sn=document.getElementById('stat-new');if(sn)sn.textContent=PRODUCTS.filter(p=>p.new).length;const hb=document.getElementById('hero-brands');if(hb)hb.innerHTML=BRANDS.filter(b=>b.id!=='lostandfound').slice(0,6).map(b=>`<div class="hero-brand-pill" onclick="navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)"><div class="hbp-icon">${b.img?`<img src="${b.img}" alt="${b.name}" loading="lazy">`:'&nbsp;'}</div><div><div class="hbp-name">${b.name}</div><div class="hbp-tag">${b.tag}</div></div></div>`).join('');const tg=document.getElementById('testimonials-grid');if(tg)tg.innerHTML=TESTIMONIALS.filter(t=>t.approved).map(t=>`<div class="testimonial-card"><div class="t-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div><p class="t-text">"${t.text}"</p><div class="t-author"><div class="t-avatar">${t.avatar}</div><div><div class="t-name">${t.name}</div><div class="t-location">${ICONS.mapPin} ${t.location}</div></div></div></div>`).join('');const rv=recentlyViewed.map(id=>getProduct(id)).filter(Boolean);const rvs=document.getElementById('rv-section');if(rvs)rvs.style.display=rv.length?'block':'none';renderRecentlyViewedCollage(rv);renderRecommended();
}

// ── NEW ARRIVALS: marquee ticker + full-bleed collage ──
function renderArrivalsCollage(){
  const track=document.getElementById('arrivals-marquee-track');
  if(track){
    const words=['NEW ARRIVALS','LOST & FOUND','BATANGAS FLEA MARKET'];
    let items='';
    for(let i=0;i<10;i++)items+=`<span class="amq-item">${words[i%words.length]}</span>`;
    track.innerHTML=items+items; // duplicated for a seamless loop
  }
  const el=document.getElementById('arrivals-collage');
  if(!el)return;
  const items=PRODUCTS.filter(p=>p.new).slice(0,3);
  if(!items.length){el.style.display='none';return;}
  el.style.display='flex';
  el.innerHTML=items.map(p=>`<div class="arrivals-collage-col" onclick="openProductDetail(${p.id})" role="button" tabindex="0" aria-label="View ${p.name}" onkeydown="if(event.key==='Enter'){openProductDetail(${p.id})}">
    ${getFirstImg(p)?`<img src="${getFirstImg(p)}" alt="${p.name}" loading="lazy">`:''}
    <div class="arrivals-collage-overlay"></div>
    <div class="arrivals-collage-content">
      <div class="arrivals-collage-eyebrow">${getBrandName(p.brand)}</div>
      <div class="arrivals-collage-title">${p.name}</div>
      <span class="arrivals-collage-btn">View Product</span>
    </div>
  </div>`).join('');
}

// ── OUR MERCHANTS: same full-bleed marquee + collage treatment ──
function renderMerchantsCollage(){
  const track=document.getElementById('merchants-marquee-track');
  if(track){
    const words=['OUR MERCHANTS','LOST & FOUND','BATANGAS FLEA MARKET'];
    let items='';
    for(let i=0;i<10;i++)items+=`<span class="amq-item">${words[i%words.length]}</span>`;
    track.innerHTML=items+items;
  }
  const el=document.getElementById('merchants-collage');
  if(!el)return;
  const items=BRANDS.filter(b=>b.id!=='lostandfound').slice(0,4);
  if(!items.length){el.style.display='none';return;}
  el.style.display='flex';
  const count=b=>PRODUCTS.filter(p=>p.brand===b.id).length;
  el.innerHTML=items.map(b=>`<div class="arrivals-collage-col" onclick="navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)" role="button" tabindex="0" aria-label="View ${b.name}" onkeydown="if(event.key==='Enter'){navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)}">
    ${b.img?`<img src="${b.img}" alt="${b.name}" loading="lazy">`:''}
    <div class="arrivals-collage-overlay"></div>
    <div class="arrivals-collage-content">
      <div class="arrivals-collage-eyebrow">${b.tag} · ${b.location||'Batangas'} · ${count(b)} items</div>
      <div class="arrivals-collage-title">${b.name}</div>
      <span class="arrivals-collage-btn">Visit Shop</span>
    </div>
  </div>`).join('');
}

// ── TRENDING NOW: same full-bleed marquee + collage treatment ──
function renderTrendingCollage(){
  const track=document.getElementById('trending-marquee-track');
  if(track){
    const words=['TRENDING NOW','MOST VIEWED THIS WEEK','LOST & FOUND'];
    let items='';
    for(let i=0;i<10;i++)items+=`<span class="amq-item">${words[i%words.length]}</span>`;
    track.innerHTML=items+items;
  }
  const el=document.getElementById('trending-collage');
  if(!el)return;
  const items=[...PRODUCTS].sort((a,b)=>b.views-a.views).slice(0,3);
  if(!items.length){el.style.display='none';return;}
  el.style.display='flex';
  el.innerHTML=items.map(p=>`<div class="arrivals-collage-col" onclick="openProductDetail(${p.id})" role="button" tabindex="0" aria-label="View ${p.name}" onkeydown="if(event.key==='Enter'){openProductDetail(${p.id})}">
    ${getFirstImg(p)?`<img src="${getFirstImg(p)}" alt="${p.name}" loading="lazy">`:''}
    <div class="arrivals-collage-overlay"></div>
    <div class="arrivals-collage-content">
      <div class="arrivals-collage-eyebrow">${getBrandName(p.brand)}</div>
      <div class="arrivals-collage-title">${p.name}</div>
      <span class="arrivals-collage-btn">View Product</span>
    </div>
  </div>`).join('');
}

// ── RECOMMENDATION ENGINE ──
// Scores every product the person hasn't already viewed by how often
// they've browsed that same tag/brand, weighting recent views more
// heavily than older ones. Falls back to hidden (no section shown) if
// there's not enough browse history yet to make a personal call.
// ── Shared helper: full-bleed product collage (same treatment as New Arrivals / Trending), with an optional marquee ──
function buildProductCollage(items,sectionId,marqueeId,collageId,words){
  const section=document.getElementById(sectionId);
  if(marqueeId){
    const track=document.getElementById(marqueeId);
    if(track){
      let t='';
      for(let i=0;i<10;i++)t+=`<span class="amq-item">${words[i%words.length]}</span>`;
      track.innerHTML=t+t;
    }
  }
  const el=document.getElementById(collageId);
  if(!el)return;
  if(!items.length){
    if(section)section.style.display='none';
    el.style.display='none';
    return;
  }
  if(section)section.style.display='block';
  el.style.display='flex';
  el.innerHTML=items.slice(0,3).map(p=>`<div class="arrivals-collage-col" onclick="openProductDetail(${p.id})" role="button" tabindex="0" aria-label="View ${p.name}" onkeydown="if(event.key==='Enter'){openProductDetail(${p.id})}">
    ${getFirstImg(p)?`<img src="${getFirstImg(p)}" alt="${p.name}" loading="lazy">`:''}
    <div class="arrivals-collage-overlay"></div>
    <div class="arrivals-collage-content">
      <div class="arrivals-collage-eyebrow">${getBrandName(p.brand)}</div>
      <div class="arrivals-collage-title">${p.name}</div>
      <span class="arrivals-collage-btn">View Product</span>
    </div>
  </div>`).join('');
}
function renderRecentlyViewedCollage(items){
  buildProductCollage(items,'rv-section',null,'rv-collage',[]);
}

function getRecommendedProducts(limit=8){
  if(!browseHistory.length)return[];
  const tagScore={},brandScore={};
  browseHistory.forEach((h,i)=>{
    const weight=1/(i+1); // more recent views count more
    if(h.tag)tagScore[h.tag]=(tagScore[h.tag]||0)+weight;
    if(h.brand)brandScore[h.brand]=(brandScore[h.brand]||0)+weight;
  });
  const viewedIds=new Set(browseHistory.map(h=>h.productId));
  const scored=PRODUCTS.filter(p=>!viewedIds.has(p.id)).map(p=>({
    p,
    score:(tagScore[p.tag]||0)*1.5+(brandScore[p.brand]||0)
  })).filter(x=>x.score>0);
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,limit).map(x=>x.p);
}
function renderRecommended(){
  const recos=getRecommendedProducts(8);
  buildProductCollage(recos,'reco-section',null,'reco-collage',[]);
}

function makeBrandCard(b){const count=PRODUCTS.filter(p=>p.brand===b.id).length;return `<div class="brand-card" onclick="navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)" role="button" tabindex="0" aria-label="View ${b.name}" onkeydown="if(event.key==='Enter'){navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)}">${b.img?`<img src="${b.img}" alt="${b.name}" loading="lazy">`:`<div style="position:absolute;inset:0;background:${b.color||'#111'};display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.5)"><span style="transform:scale(2.4)">${ICONS.store}</span></div>`}<div class="brand-card-overlay"></div><div class="brand-card-content"><span class="brand-tag">${b.tag}</span><div class="brand-name">${b.name}</div><div class="brand-meta-row">${ICONS.mapPin} ${b.location||'Batangas'} · ${count} items</div></div></div>`;}

function filterBrands(tag,btn){activeBrandFilter=tag;document.querySelectorAll('#brand-grid-wrap .f-btn').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');renderBrandGrid();}
function renderBrandGrid(){let arr=(activeBrandFilter==='all'?[...BRANDS]:BRANDS.filter(b=>b.tag===activeBrandFilter)).filter(b=>b.id!=='lostandfound');const sv=document.getElementById('brand-sort')?.value||'default';if(sv==='name-az')arr.sort((a,b)=>a.name.localeCompare(b.name));if(sv==='name-za')arr.sort((a,b)=>b.name.localeCompare(a.name));if(sv==='items')arr.sort((a,b)=>PRODUCTS.filter(p=>p.brand===b.id).length-PRODUCTS.filter(p=>p.brand===a.id).length);const el=document.getElementById('brand-grid');if(el)el.innerHTML=arr.map(b=>makeBrandCard(b)).join('');}
function showBrand(brandId){
  const b=getBrand(brandId);
  curBrandProds=PRODUCTS.filter(p=>p.brand===brandId);
  curPage=1;prodNewFilter='all';

  const oldStrip=document.getElementById('bsh-details-strip');
  if(oldStrip)oldStrip.remove();

  const isOwn=currentMerchant&&currentMerchant.id===brandId;

  const svgPin=ICONS.mapPin;
  const svgCal=ICONS.calendar;
  const svgIg=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`;
  const svgClock=ICONS.clock;

  const meta=[];
  if(b.location) meta.push(`${svgPin} ${b.location}`);
  if(b.schedule) meta.push(`${svgCal} ${b.schedule}`);
  if(b.instagram) meta.push(`<a href="https://instagram.com/${b.instagram.replace('@','')}" target="_blank" style="color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:.3rem">${svgIg} ${b.instagram}</a>`);
  if(b.year) meta.push(`${svgClock} Est. ${b.year}`);

  const descBlock=`
    <div style="position:relative;margin-bottom:.75rem;max-width:560px">

      <!-- Display mode -->
      <div id="brand-desc-display" style="display:flex;align-items:flex-start;gap:.6rem">
        <p style="font-size:.875rem;color:var(--g5);line-height:1.7;margin:0;padding-left:.85rem;border-left:2px solid rgba(196,144,48,.4);flex:1">
          ${b.desc||`<em style="color:var(--g3)">No description yet.</em>`}
        </p>
        ${isOwn?`
          <button onclick="editBrandDesc('${brandId}')"
            title="Edit description"
            aria-label="Edit brand description"
            style="flex-shrink:0;background:rgba(196,144,48,.1);border:1px solid rgba(196,144,48,.3);color:var(--accent);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:.75rem;display:flex;align-items:center;justify-content:center;transition:all .18s;margin-top:2px"
            onmouseover="this.style.background='rgba(196,144,48,.22)'"
            onmouseout="this.style.background='rgba(196,144,48,.1)'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        `:''}
      </div>

      <!-- Edit mode (hidden by default) -->
      ${isOwn?`
        <div id="brand-desc-edit" style="display:none">
          <textarea id="brand-desc-ta"
            style="width:100%;background:#fff;border:1.5px solid rgba(196,144,48,.4);color:var(--black);padding:.75rem .9rem;font-family:'Inter',sans-serif;font-size:.875rem;line-height:1.65;border-radius:10px;resize:vertical;min-height:80px;outline:none;margin-bottom:.5rem"
            placeholder="Describe your brand — what you sell, your vibe, what makes you unique..."
            onfocus="this.style.borderColor='var(--accent)'"
            onblur="this.style.borderColor='rgba(200,169,110,.4)'"
          >${b.desc||''}</textarea>
          <div style="display:flex;gap:.5rem">
            <button onclick="saveBrandDesc('${brandId}')"
              style="background:var(--accent);color:var(--black);border:none;padding:.45rem 1.1rem;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:700;border-radius:20px;cursor:pointer;transition:all .18s;letter-spacing:.04em"
              onmouseover="this.style.background='var(--accent2)'"
              onmouseout="this.style.background='var(--accent)'">Save</button>
            <button onclick="document.getElementById('brand-desc-display').style.display='flex';document.getElementById('brand-desc-edit').style.display='none'"
              style="background:var(--g1);color:var(--g4);border:1px solid var(--g2);padding:.45rem .95rem;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:500;border-radius:20px;cursor:pointer">Cancel</button>
          </div>
        </div>
      `:''}
    </div>
  `;

  const bsh=document.getElementById('bsh');
  bsh.classList.add('show');
  bsh.innerHTML=`
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#f8f6f2 0%,#f0ebe3 100%);pointer-events:none"></div>
    <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(to bottom,var(--accent) 0%,rgba(196,144,48,.3) 100%)"></div>

    <div style="position:relative;display:flex;align-items:center;gap:1.6rem;padding:1.75rem 1.9rem 1.75rem 2.2rem;width:100%;flex-wrap:wrap">

      <div style="width:82px;height:82px;flex-shrink:0;border-radius:16px;overflow:hidden;border:1.5px solid rgba(255,255,255,.1);box-shadow:0 6px 28px rgba(0,0,0,.45),0 0 0 1px rgba(200,169,110,.08);background:rgba(255,255,255,.05)">
        ${b.img
          ?`<img src="${b.img}" style="width:100%;height:100%;object-fit:cover;display:block">`
          :`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--accent);transform:scale(1.8)">${ICONS.store}</div>`}
      </div>

      <div style="flex:1;min-width:200px">
        <div style="display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;margin-bottom:.5rem">
          <span style="font-family:'Bebas Neue',sans-serif;font-size:2.1rem;letter-spacing:.04em;line-height:1;color:var(--black)">${b.name}</span>
          <span style="background:rgba(196,144,48,.12);color:var(--accent-ink);font-size:.68rem;font-weight:700;padding:.24rem .85rem;border-radius:20px;border:1px solid rgba(196,144,48,.3);letter-spacing:.1em;text-transform:uppercase">${curBrandProds.length} items</span>
          <span style="background:var(--g2);color:var(--g5);font-size:.67rem;font-weight:600;padding:.24rem .8rem;border-radius:20px;border:1px solid var(--g3);letter-spacing:.1em;text-transform:uppercase">${b.tag}</span>
        </div>

        <div style="height:1px;background:linear-gradient(to right,var(--g3),transparent);margin-bottom:.65rem;max-width:500px"></div>

        ${descBlock}

        ${meta.length
          ?`<div style="display:flex;flex-wrap:wrap;align-items:center;gap:0;font-size:.75rem;color:var(--g4)">
              ${meta.map((m,i)=>`
                <span style="display:inline-flex;align-items:center;gap:.3rem">${m}</span>
                ${i<meta.length-1?`<span style="margin:0 .7rem;color:rgba(255,255,255,.15)">·</span>`:''}
              `).join('')}
            </div>`
          :''}
      </div>

      <button onclick="showAllBrands()"
        style="flex-shrink:0;align-self:flex-start;background:rgba(0,0,0,.04);border:1px solid var(--g2);color:var(--g4);padding:.5rem 1.1rem;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:500;border-radius:20px;cursor:pointer;transition:all .2s;white-space:nowrap;letter-spacing:.03em"
        onmouseover="this.style.background='var(--black)';this.style.color='#fff';this.style.borderColor='var(--black)'"
        onmouseout="this.style.background='rgba(0,0,0,.04)';this.style.color='var(--g4)';this.style.borderColor='var(--g2)'">
        ← All Brands
      </button>
    </div>
  `;

  document.getElementById('brand-grid-wrap').style.display='none';
  document.getElementById('brand-prods-wrap').style.display='block';
  const pd=document.getElementById('price-max-disp');if(pd)pd.textContent='₱5,000';
  const bc=document.getElementById('catalog-bc');
  if(bc)bc.innerHTML=`<a onclick="navigateTo('home')">Home</a><span>›</span><a onclick="showAllBrands()">Catalog</a><span>›</span><span>${b.name}</span>`;
  document.querySelectorAll('#brand-prods-wrap .f-btn').forEach(btn=>btn.classList.remove('on'));
  document.querySelector('#brand-prods-wrap .f-btn')?.classList.add('on');
  renderPaginatedProds(curBrandProds);
  renderBrandEvents(brandId);
}
function showAllBrands(){document.getElementById('bsh').classList.remove('show');document.getElementById('brand-grid-wrap').style.display='block';document.getElementById('brand-prods-wrap').style.display='none';const bc=document.getElementById('catalog-bc');if(bc)bc.innerHTML=`<a onclick="navigateTo('home')">Home</a><span>›</span><span>Catalog</span>`;renderBrandGrid();}
function filterProdNew(val,btn){prodNewFilter=val;document.querySelectorAll('#brand-prods-wrap .f-btn').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');applyBrandProdFilters();}
function applyBrandProdFilters(){const sv=document.getElementById('prod-sort')?.value||'default';let f=prodNewFilter==='new'?curBrandProds.filter(p=>p.new):curBrandProds;curPage=1;renderPaginatedProds(sortProds(f,sv));}
const PER_PAGE=8;
function renderPaginatedProds(list){const pages=Math.ceil(list.length/PER_PAGE),start=(curPage-1)*PER_PAGE;renderGrid('brand-prods-grid',list.slice(start,start+PER_PAGE));const pg=document.getElementById('catalog-pg');if(!pg)return;if(pages<=1){pg.innerHTML='';return;}let pgHTML='';for(let i=1;i<=pages;i++)pgHTML+=`<button class="page-num ${i===curPage?'active':''}" onclick="curPage=${i};applyBrandProdFilters()">${i}</button>`;pg.innerHTML=pgHTML;}

function renderArrivals(){const sv=document.getElementById('arr-sort')?.value||'default';renderGrid('arrivals-grid',sortProds(PRODUCTS.filter(p=>p.new),sv));}

function openProductDetail(id){const p=getProduct(id);if(!p)return;p.views=(p.views||0)+1;recentlyViewed=[id,...recentlyViewed.filter(x=>x!=id)].slice(0,12);browseHistory.unshift({tag:p.tag,productId:p.id,brand:p.brand});browseHistory=browseHistory.slice(0,50);persist();const b=getBrand(p.brand);const[stLbl,stCls]=stockStatus(p.stock);const pRevs=reviews.filter(r=>r.productId==id);const avg=pRevs.length?(pRevs.reduce((s,r)=>s+r.rating,0)/pRevs.length).toFixed(1):null;const canRev=orders.some(o=>o.status==='delivered'&&o.items.some(i=>(i.id||i.productId)==id));const recs=PRODUCTS.filter(x=>x.id!=id&&(x.brand===p.brand||x.tag===p.tag)).slice(0,4);const starDist=[5,4,3,2,1].map(star=>({star,count:pRevs.filter(r=>r.rating===star).length}));document.getElementById('pd-bc-name').textContent=p.name;document.getElementById('pd-container').innerHTML=`<div class="pd-layout"><div class="pd-gallery">${makeGallery(p.imgs||[p.img],p.id)}</div><div class="pd-info"><div class="pd-brand-link" onclick="navigateTo('catalog');setTimeout(()=>showBrand('${b.id}'),200)">${ICONS.store} ${b.name}</div><h1 class="pd-title">${p.name}</h1><div class="pd-price">${fmtMoney(p.price)}</div>${avg?`<div style="color:var(--accent-ink);font-size:.9rem;margin-bottom:.6rem">${'★'.repeat(Math.round(parseFloat(avg)))} ${avg} (${pRevs.length} review${pRevs.length!==1?'s':''})</div>`:''}<span class="pd-stock card-stock-badge ${stCls}" style="margin-bottom:1.3rem;display:inline-block">${stLbl}</span><div class="pd-detail-rows"><div class="pd-detail-row"><span>Brand</span><span>${b.name}</span></div><div class="pd-detail-row"><span>Category</span><span>${p.tag}</span></div><div class="pd-detail-row"><span>Size</span><span class="size-val">${p.size}</span></div><div class="pd-detail-row"><span>Stock</span><span>${p.stock>0?p.stock+' available':'Out of stock'}</span></div><div class="pd-detail-row"><span>Views</span><span>${p.views}</span></div><div class="pd-detail-row"><span>Location</span><span>${b.location||'Batangas'}</span></div></div><button class="pd-atc-btn" onclick="addToCart(${p.id})" ${p.stock<=0?'disabled':''}>${p.stock<=0?'Out of Stock':ICONS.cart+' Add to Cart — '+fmtMoney(p.price)}</button><button class="pd-bin-btn" onclick="buyItNow(${p.id})" ${p.stock<=0?'disabled':''}>${p.stock<=0?'Unavailable':'Buy It Now'}</button><div style="background:var(--g1);border:1px solid var(--g2);border-radius:var(--r);padding:.7rem 1rem;font-size:.875rem;color:var(--g4);margin-top:.55rem">${ICONS.creditCard} Payment via <strong>GCash</strong> or <strong>PayMaya</strong> only. No Cash on Delivery.</div></div></div><div class="review-section"><h3>Customer Reviews</h3>${pRevs.length?`<div class="review-summary"><div><div class="review-big-score">${avg}</div><div style="color:var(--accent-ink);font-size:1.2rem">${'★'.repeat(Math.round(parseFloat(avg)))}</div><div style="font-size:.875rem;color:var(--g4)">${pRevs.length} reviews</div></div><div class="review-stars-bar">${starDist.map(({star,count})=>`<div class="review-star-row"><span>${star}★</span><div class="review-star-track"><div class="review-star-fill" style="width:${pRevs.length?Math.round(count/pRevs.length*100):0}%"></div></div><span>${count}</span></div>`).join('')}</div>${canRev?`<button class="review-write-btn" onclick="openReviewModal(${id},null)">Write Review</button>`:''}</div>`:`<div style="font-size:.9rem;color:var(--g4);margin-bottom:1.1rem">No reviews yet.${canRev?' Be the first!':' Purchase to leave a review.'}</div>${canRev?`<button class="review-write-btn" onclick="openReviewModal(${id},null)">Write First Review</button>`:''}`}${pRevs.map(rv=>makeReviewCard(rv)).join('')}</div>${recs.length?`<div class="pd-section-title">You Might Also Like</div><div class="recommendations-grid">${recs.map(r=>makeCard(r)).join('')}</div>`:''}`; navigateTo('product');}
function makeReviewCard(rv){return `<div class="review-card" id="rvc-${rv.id}"><div class="review-card-header"><span class="review-card-author">${rv.author}</span><span class="review-card-date">${rv.date}</span></div><div class="review-card-stars">${'★'.repeat(rv.rating)}${'☆'.repeat(5-rv.rating)}</div><div class="review-card-text">${rv.text}</div>${rv.img?`<img class="review-card-img" src="${rv.img}" alt="Review photo" onclick="window.open('${rv.img}')">`:''} ${rv.merchantReply?`<div class="review-reply"><strong>${ICONS.store} Merchant Reply:</strong> ${rv.merchantReply}</div>`:''}<div class="review-actions"><button class="review-action-btn" onclick="openReviewModal(${rv.productId},'${rv.id}')">Edit</button><button class="review-action-btn danger" onclick="deleteReview('${rv.id}',${rv.productId})">Delete</button></div></div>`;}

function buyItNow(id){const p=getProduct(id);if(!p||p.stock<=0){toast('This item is out of stock!','error');return;}buyNowItem={productId:id,qty:1};buildReceipt([buyNowItem]);checkoutStep=1;updateCheckoutStep(1);selPayMethod=null;document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));document.getElementById('pay-qr-box').classList.remove('show');const ipb=document.getElementById('i-paid-btn');if(ipb)ipb.style.display='none';document.getElementById('pay-modal').classList.add('on');openA11yPanel(document.querySelector('.pay-card'));closeCart();}

function openReviewModal(productId,reviewId){const p=getProduct(productId);if(!p)return;const ex=reviewId?reviews.find(r=>r.id===reviewId):null;document.getElementById('rm-pid').value=productId;document.getElementById('rm-rid').value=reviewId||'';document.getElementById('rm-pname').textContent=p.name;document.getElementById('rm-text').value=ex?ex.text:'';document.getElementById('rm-img-preview').innerHTML='';reviewImgData=ex?.img||null;reviewStar=ex?ex.rating:0;updateStarPicker(reviewStar);document.getElementById('review-modal').classList.add('on');openA11yPanel(document.querySelector('.review-modal-card'));}
function closeReviewModal(){document.getElementById('review-modal').classList.remove('on');closeA11yPanel();}
function setReviewStar(n){reviewStar=n;updateStarPicker(n);}
function updateStarPicker(n){document.querySelectorAll('#star-picker span').forEach((s,i)=>{s.classList.toggle('on',i<n);s.setAttribute('aria-checked',i<n?'true':'false');});}
function handleReviewImg(input){const file=input.files[0];if(!file)return;const reader=new FileReader();reader.onload=e=>{reviewImgData=e.target.result;document.getElementById('rm-img-preview').innerHTML=`<img src="${reviewImgData}" alt="preview">`;};reader.readAsDataURL(file);}
function submitReview(){const pid=parseInt(document.getElementById('rm-pid').value);const rid=document.getElementById('rm-rid').value;const text=document.getElementById('rm-text').value.trim();if(!reviewStar){toast('Please select a star rating','error');return;}if(!text){toast('Please write a review','error');return;}const p=getProduct(pid);if(rid){const rv=reviews.find(r=>r.id===rid);if(rv){rv.rating=reviewStar;rv.text=text;rv.img=reviewImgData;}toast('Review updated!','success');}else{reviews.push({id:'rv'+Date.now(),productId:pid,author:'You',rating:reviewStar,text,img:reviewImgData,date:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}),merchantReply:null});toast('Review submitted!','success');addNotif('customer',ICONS.star,'Your review for '+(p?.name||'item')+' was submitted',null);}persist();closeReviewModal();openProductDetail(pid);}
function deleteReview(reviewId,productId){if(!confirm('Delete this review?'))return;reviews=reviews.filter(r=>r.id!==reviewId);persist();toast('Review deleted');document.getElementById('rvc-'+reviewId)?.remove();}

// FIX: cart quantity is now capped at available stock so the storefront can
// never let someone order more than a merchant actually has.
function addToCart(id){
  const p=getProduct(id);
  if(!p||p.stock<=0){toast('This item is out of stock!','error');return;}
  const ex=cart.find(i=>i.productId==id);
  const currentQty=ex?ex.qty:0;
  if(currentQty+1>p.stock){toast('Only '+p.stock+' in stock','error');return;}
  if(ex)ex.qty++;else cart.push({productId:id,qty:1});
  persist();updateCartUI();toast('Added to cart — '+p.name,'success');addNotif('customer',ICONS.cart,'Added "'+p.name+'" to cart',null);
}
function removeFromCart(id){cart=cart.filter(i=>i.productId!=id);persist();updateCartUI();}
function changeQty(id,delta){
  const i=cart.find(x=>x.productId==id);
  const p=getProduct(id);
  if(!i)return;
  let nq=i.qty+delta;
  if(p&&p.stock&&nq>p.stock){toast('Only '+p.stock+' in stock','error');nq=p.stock;}
  i.qty=Math.max(1,nq);
  persist();updateCartUI();
}
function clearCart(){if(!confirm('Remove all items?'))return;cart=[];persist();updateCartUI();}
function getCartTotal(){return cart.reduce((s,i)=>{const p=getProduct(i.productId);return s+(p?p.price*i.qty:0);},0);}
function getCartCount(){return cart.reduce((s,i)=>s+i.qty,0);}
function updateCartUI(){const total=getCartCount();const badge=document.getElementById('cart-badge');if(badge){badge.textContent=total;badge.style.opacity=total>0?'1':'0';}document.getElementById('cart-count').textContent=cart.length;const itemsEl=document.getElementById('cd-items');const summaryEl=document.getElementById('cd-summary');if(!itemsEl)return;if(!cart.length){itemsEl.innerHTML=`<div class="cd-empty"><div style="color:var(--g3)">${ICONS.bag}</div><div>Your cart is empty</div><button class="hero-cta-primary" onclick="closeCart();navigateTo('catalog')" style="margin-top:.9rem;font-size:.85rem;padding:.55rem 1.3rem">Shop Now</button></div>`;if(summaryEl)summaryEl.style.display='none';return;}if(summaryEl)summaryEl.style.display='block';itemsEl.innerHTML=cart.map(item=>{const p=getProduct(item.productId);if(!p)return '';return `<div class="cart-item"><div class="cart-item-thumb">${p.img?`<img src="${p.img}" alt="${p.name}" loading="lazy">`:ICONS.tag}</div><div class="cart-item-info"><div class="cart-item-name">${p.name}</div><div class="cart-item-brand">${getBrandName(p.brand)} · ${p.size}</div><div class="cart-item-price">${fmtMoney(p.price*item.qty)}</div><div class="qty-control"><button class="qty-btn" onclick="changeQty(${p.id},-1)" aria-label="Decrease quantity">−</button><span style="font-size:.875rem;min-width:22px;text-align:center">${item.qty}</span><button class="qty-btn" onclick="changeQty(${p.id},1)" aria-label="Increase quantity">+</button></div></div><button class="cart-item-remove" onclick="removeFromCart(${p.id})" aria-label="Remove ${p.name} from cart">✕</button></div>`;}).join('');const sub=getCartTotal();document.getElementById('cd-subtotal').textContent=fmtMoney(sub);document.getElementById('cd-total').textContent=fmtMoney(sub);}
function openCart(){document.getElementById('cart-drawer').classList.add('on');document.getElementById('cart-overlay').classList.add('on');openA11yPanel(document.getElementById('cart-drawer'));}
function closeCart(){document.getElementById('cart-drawer').classList.remove('on');document.getElementById('cart-overlay').classList.remove('on');closeA11yPanel();}

function buildReceipt(sourceItems){const ri=document.getElementById('receipt-items');if(!ri)return;ri.innerHTML=sourceItems.map(item=>{const p=getProduct(item.productId);if(!p)return '';return `<div class="receipt-item"><span>${p.name} × ${item.qty}</span><span>${fmtMoney(p.price*item.qty)}</span></div>`;}).join('');const sub=sourceItems.reduce((s,i)=>{const p=getProduct(i.productId);return s+(p?p.price*i.qty:0);},0);shippingFee=0;const pSub=document.getElementById('pay-sub');if(pSub)pSub.textContent=fmtMoney(sub);const pShip=document.getElementById('pay-ship');if(pShip)pShip.textContent='Select area first';const pTotal=document.getElementById('pay-total');if(pTotal)pTotal.textContent='—';document.getElementById('shipping-zone').value='';document.getElementById('delivery-est').style.display='none';}
function openCheckout(){if(!cart.length){toast('Cart is empty!','error');return;}buyNowItem=null;closeCart();buildReceipt(cart);checkoutStep=1;updateCheckoutStep(1);selPayMethod=null;document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));document.getElementById('pay-qr-box').classList.remove('show');const ipb=document.getElementById('i-paid-btn');if(ipb)ipb.style.display='none';document.getElementById('pay-modal').classList.add('on');openA11yPanel(document.querySelector('.pay-card'));}
function closeCheckout(){document.getElementById('pay-modal').classList.remove('on');buyNowItem=null;checkoutStep=1;updateCheckoutStep(1);selPayMethod=null;document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));closeA11yPanel();}
function updateCheckoutStep(n){checkoutStep=n;document.querySelectorAll('.pay-section').forEach((s,i)=>s.classList.toggle('active',i===n-1));document.querySelectorAll('.pay-step-btn').forEach((b,i)=>{b.classList.toggle('active',i===n-1);b.classList.toggle('done',i<n-1);});document.getElementById('pay-back').style.display=n>1?'block':'none';document.getElementById('pay-next').style.display=n===3?'none':'block';}
function checkoutBack(){if(checkoutStep>1)updateCheckoutStep(checkoutStep-1);}
function checkoutNext(){if(checkoutStep===1){if(!document.getElementById('shipping-zone').value){toast('Please select a shipping area','error');return;}updateCheckoutStep(2);}else if(checkoutStep===2){const name=document.getElementById('pay-name').value.trim();const email=document.getElementById('pay-email').value.trim();const phone=document.getElementById('pay-phone').value.trim();const addr=document.getElementById('pay-address').value.trim();if(!name||!email||!phone||!addr){toast('Please fill all required fields','error');return;}updateCheckoutStep(3);}}
function updateShippingRate(){const zone=document.getElementById('shipping-zone').value;const rate=SHIPPING_RATES[zone];if(!rate){shippingFee=0;return;}shippingFee=rate.fee;const sourceItems=buyNowItem?[buyNowItem]:cart;const sub=sourceItems.reduce((s,i)=>{const p=getProduct(i.productId);return s+(p?p.price*i.qty:0);},0);document.getElementById('pay-ship').textContent=fmtMoney(shippingFee);document.getElementById('pay-total').textContent=fmtMoney(sub+shippingFee);const estEl=document.getElementById('delivery-est');const estDate=document.getElementById('est-date');const d=new Date();d.setDate(d.getDate()+rate.days+1);estDate.textContent=d.toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'});estEl.style.display='block';}
function selectPayMethod(el){document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));el.classList.add('selected');selPayMethod=el.dataset.method;const qrBox=document.getElementById('pay-qr-box');const sourceItems=buyNowItem?[buyNowItem]:cart;const sub=sourceItems.reduce((s,i)=>{const p=getProduct(i.productId);return s+(p?p.price*i.qty:0);},0);const total=sub+shippingFee;document.getElementById('qr-method-label').textContent=selPayMethod==='gcash'?'GCash QR Code':'PayMaya QR Code';document.getElementById('qr-amount').textContent=fmtMoney(total);generateQR();qrBox.classList.add('show');const ipb=document.getElementById('i-paid-btn');if(ipb)ipb.style.display='block';}
function generateQR(){const grid=document.getElementById('qr-pattern');if(!grid)return;const p=[1,1,1,1,1,1,1,0,1,0,1,0,0,0,0,0,1,0,0,1,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,0,1,0,1,0,0,0,0,0,1,1,0,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,0,0];grid.innerHTML=p.map(c=>`<div class="qr-cell ${c?'':'w'}"></div>`).join('');}

// FIX: placing an order now actually decrements stock on the purchased
// products. Previously stock never changed after checkout, so "Low/Out of
// Stock" badges were disconnected from real sales.
function placeOrder(){if(!selPayMethod){toast('Please select a payment method','error');return;}const orderId='ORD-'+Date.now().toString().slice(-8);const name=document.getElementById('pay-name').value.trim()||'Customer';const email=document.getElementById('pay-email').value.trim()||'customer@email.com';const phone=document.getElementById('pay-phone').value.trim();const address=document.getElementById('pay-address').value.trim();const sourceItems=buyNowItem?[buyNowItem]:cart;const orderItems=sourceItems.map(i=>{const p=getProduct(i.productId);return p?{...p,qty:i.qty,id:p.id}:null;}).filter(Boolean);const sub=orderItems.reduce((s,i)=>s+i.price*i.qty,0);const total=sub+shippingFee;const order={id:orderId,items:orderItems,total,shippingFee,date:new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'}),customer:name,email,phone,address,payMethod:selPayMethod,status:'pending',trackingNumber:null,messages:[],timeline:{placed:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric'}),confirmed:null,packed:null,shipped:null,delivered:null}};orders.unshift(order);orderItems.forEach(i=>{const p=getProduct(i.id);if(p)p.stock=Math.max(0,(p.stock||0)-(i.qty||1));});addNotif('customer',ICONS.package,'Order '+orderId+' placed — '+fmtMoney(total),'orders');[...new Set(orderItems.map(i=>i.brand))].forEach(bid=>{addNotif('merchant',ICONS.bag,'New order '+orderId+' from '+name+' — '+getBrandName(bid),'orders-merch');});if(!buyNowItem){cart=[];updateCartUI();}buyNowItem=null;persist();closeCheckout();document.getElementById('conf-order-id').textContent=orderId;document.getElementById('conf-email').textContent=email;document.getElementById('conf-items').innerHTML=orderItems.map(i=>`<div style="display:flex;justify-content:space-between;padding:.35rem 0"><span>${i.name} ×${i.qty}</span><span>${fmtMoney(i.price*i.qty)}</span></div>`).join('');document.getElementById('conf-total').textContent='Total: '+fmtMoney(total);document.getElementById('confirm-modal').classList.add('on');openA11yPanel(document.querySelector('.confirm-card'));toast('Order placed!','success');}
function closeConfirm(){document.getElementById('confirm-modal').classList.remove('on');closeA11yPanel();navigateTo('orders');}

function renderOrders(){const el=document.getElementById('orders-list');if(!el)return;if(!orders.length){el.innerHTML=`<div style="text-align:center;padding:4rem 2rem"><div style="color:var(--g3);margin-bottom:1.1rem;display:flex;justify-content:center;transform:scale(2.4)">${ICONS.package}</div><p style="color:var(--g4);font-size:.9rem">No orders yet.</p><button class="hero-cta-primary" onclick="navigateTo('catalog')" style="display:inline-block;margin-top:1.1rem">Shop Now</button></div>`;return;}el.innerHTML=orders.map(o=>makeOrderCard(o)).join('');}
function makeOrderCard(o){const steps=['pending','confirmed','packed','shipped','delivered'];const stepIdx=steps.indexOf(o.status||'pending');const progress=steps.map((s,i)=>`<div class="progress-step ${i<stepIdx?'done':i===stepIdx?'active':''}"><div class="ps-dot">${i<stepIdx?ICONS.check:i+1}</div><div class="ps-label">${s.charAt(0).toUpperCase()+s.slice(1)}</div></div>`).join('');return `<div class="order-card"><div class="order-card-summary" onclick="toggleOrderDetails('${o.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'){toggleOrderDetails('${o.id}')}"><div><div class="order-id">${o.id}</div><div class="order-date">${o.date}</div></div><div style="display:flex;align-items:center;gap:.9rem;flex-wrap:wrap"><span class="order-status status-${o.status||'pending'}">${(o.status||'pending').charAt(0).toUpperCase()+(o.status||'pending').slice(1)}</span><span style="font-size:.95rem;font-weight:700">${fmtMoney(o.total)}</span><button class="order-expand-btn" id="expbtn-${o.id}" aria-label="Toggle order details" onclick="event.stopPropagation();toggleOrderDetails('${o.id}')">▼</button></div></div><div class="order-details" id="od-${o.id}"><div style="font-size:.78rem;color:var(--g4);margin-bottom:.9rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Order Progress</div><div class="order-progress">${progress}</div>${Object.entries(o.timeline||{}).filter(([,v])=>v).map(([k,v])=>`<div style="font-size:.82rem;color:var(--g4);margin-bottom:.25rem"><strong style="color:var(--black)">${k.charAt(0).toUpperCase()+k.slice(1)}:</strong> ${v}</div>`).join('')}<div style="font-size:.78rem;color:var(--g4);margin-top:.9rem;margin-bottom:.55rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Items</div>${o.items.map(i=>`<div class="order-item-row"><div class="order-item-thumb">${i.img?`<img src="${i.img}" alt="${i.name}" loading="lazy">`:ICONS.tag}</div><div style="flex:1"><div style="font-size:.9rem;font-weight:600">${i.name}</div><div style="font-size:.78rem;color:var(--g4)">${getBrandName(i.brand||'')} · <strong>${i.size||''}</strong></div></div><div style="font-size:.875rem">× ${i.qty||1}</div><div style="font-size:.9rem;font-weight:600">${fmtMoney(i.price*(i.qty||1))}</div></div>`).join('')}<div style="display:flex;justify-content:space-between;padding:.65rem 0;font-weight:700;font-size:.95rem;border-top:1px solid var(--g2);margin-top:.55rem"><span>Total</span><span>${fmtMoney(o.total)}</span></div><div style="font-size:.875rem;color:var(--g4);margin-bottom:.9rem;line-height:1.7">${ICONS.mapPin} ${o.address||'—'} · ${ICONS.creditCard} ${(o.payMethod||'—').toUpperCase()} · ${ICONS.mail} ${o.email||'—'}</div>${o.trackingNumber?`<div class="order-tracking-box"><div style="font-size:.78rem;color:var(--g4);margin-bottom:.45rem;font-weight:600">${ICONS.truck} J&T Express Tracking</div><div style="font-size:.875rem;margin-bottom:.45rem"><strong>${o.trackingNumber}</strong></div><a class="tracking-link" href="https://www.jtexpress.ph/trajectoryQuery?flag=1&waybillNo=${o.trackingNumber}" target="_blank">Track on J&T</a></div>`:''} ${o.messages&&o.messages.length?`<div style="font-size:.78rem;color:var(--g4);margin-bottom:.45rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Messages from Merchant</div><div style="background:var(--g1);border-radius:var(--r2);padding:.9rem;margin-bottom:1.1rem;font-size:.875rem;color:var(--g5)">${o.messages.map(m=>`<div style="margin-bottom:.45rem"><strong>${m.role==='merchant'?ICONS.store+' Merchant':'You'}:</strong> ${m.text} <span style="font-size:.72rem;color:var(--g4)">${m.time||''}</span></div>`).join('')}</div>`:''}<div class="order-actions"><button class="order-action-btn" onclick="reorderItems('${o.id}')">Reorder</button>${o.status==='delivered'?o.items.map(i=>`<button class="order-action-btn" onclick="openReviewModal(${i.id||i.productId},null)">Review ${i.name}</button>`).join(''):''}</div></div></div>`;}
function toggleOrderDetails(orderId){document.getElementById('od-'+orderId)?.classList.toggle('open');document.getElementById('expbtn-'+orderId)?.classList.toggle('open');}
function reorderItems(orderId){const o=orders.find(x=>x.id===orderId);if(!o)return;let added=0;o.items.forEach(item=>{const p=getProduct(item.id||item.productId);if(p&&p.stock>0){const ex=cart.find(i=>i.productId==p.id);const curQty=ex?ex.qty:0;if(curQty+1>p.stock)return;if(ex)ex.qty++;else cart.push({productId:p.id,qty:1});added++;}});persist();updateCartUI();if(added){toast(added+' item(s) added to cart!','success');openCart();}else toast('All items are out of stock','error');}

function addNotif(type,icon,text,target){const n={icon,text,time:nowTime(),read:false,target:target||null};if(type==='customer'){customerNotifs.unshift(n);customerNotifs=customerNotifs.slice(0,20);}else{merchantNotifs.unshift(n);merchantNotifs=merchantNotifs.slice(0,20);}persist();renderNotifs();}
function handleNotifClick(type,idx){const notifs=type==='customer'?customerNotifs:merchantNotifs;if(notifs[idx]){notifs[idx].read=true;const target=notifs[idx].target;persist();renderNotifs();closeAllDropdowns();if(target==='orders')navigateTo('orders');else if(target==='orders-merch'&&currentMerchant)navigateTo('merchant');else if(target==='catalog')navigateTo('catalog');}}
function renderNotifs(){const cu=customerNotifs.filter(n=>!n.read).length;const cb=document.getElementById('notif-count');if(cb){cb.textContent=cu;cb.classList.toggle('on',cu>0);}const cl=document.getElementById('notif-list');if(cl)cl.innerHTML=customerNotifs.length?customerNotifs.map((n,i)=>`<div class="notif-item ${n.read?'':'unread'}" onclick="handleNotifClick('customer',${i})"><div class="notif-icon-c">${n.icon}</div><div style="flex:1"><div class="notif-text">${n.text}</div><div class="notif-time">${n.time}</div></div>${n.target?`<span class="notif-arrow">›</span>`:''}</div>`).join(''):`<div class="notif-empty-msg"><span class="notif-empty-icon">${ICONS.bell}</span>No notifications yet</div>`;const mu=merchantNotifs.filter(n=>!n.read).length;const mb=document.getElementById('merch-notif-count');if(mb){mb.textContent=mu;mb.classList.toggle('on',mu>0);}const ml=document.getElementById('merch-notif-list');if(ml)ml.innerHTML=merchantNotifs.length?merchantNotifs.map((n,i)=>`<div class="notif-item ${n.read?'':'unread'}" onclick="handleNotifClick('merchant',${i})"><div class="notif-icon-c">${n.icon}</div><div style="flex:1"><div class="notif-text">${n.text}</div><div class="notif-time">${n.time}</div></div>${n.target?`<span class="notif-arrow">›</span>`:''}</div>`).join(''):`<div class="notif-empty-msg"><span class="notif-empty-icon">${ICONS.store}</span>No merchant alerts</div>`;}
function toggleNotif(type){if(type==='customer'){const dd=document.getElementById('notif-dropdown');const willOpen=!dd.classList.contains('open');dd.classList.toggle('open');document.getElementById('merch-notif-dropdown').classList.remove('open');}else{const dd=document.getElementById('merch-notif-dropdown');dd.classList.toggle('open');document.getElementById('notif-dropdown').classList.remove('open');}}
function clearNotifs(type){if(type==='customer')customerNotifs=[];else merchantNotifs=[];persist();renderNotifs();closeAllDropdowns();}


let currentLoginRole='admin';
function setLoginRole(role){
  currentLoginRole=role;
  const adminBtn=document.getElementById('role-admin-btn');
  const merchBtn=document.getElementById('role-merch-btn');
  const adminFields=document.getElementById('mm-admin-fields');
  const merchFields=document.getElementById('mm-merch-fields');
  if(role==='admin'){
    adminBtn.style.background='var(--black)';adminBtn.style.color='#fff';
    merchBtn.style.background='transparent';merchBtn.style.color='var(--g4)';
    adminFields.style.display='block';merchFields.style.display='none';
  } else {
    merchBtn.style.background='var(--black)';merchBtn.style.color='#fff';
    adminBtn.style.background='transparent';adminBtn.style.color='var(--g4)';
    adminFields.style.display='none';merchFields.style.display='block';
  }
  document.getElementById('mm-error').style.display='none';
}
function openMerchantModal(){
  if(currentMerchant){navigateTo('merchant');return;}
  const sel=document.getElementById('mm-brand-select');
  sel.innerHTML=BRANDS.filter(b=>b.id!=='lostandfound').map(b=>`<option value="${b.id}">${b.name}</option>`).join('');
  document.getElementById('mm-admin-user').value='';
  document.getElementById('mm-admin-pass').value='';
  if(document.getElementById('mm-pass'))document.getElementById('mm-pass').value='';
  document.getElementById('mm-error').style.display='none';
  currentLoginRole='admin';
  setLoginRole('admin');
  document.getElementById('merchant-modal').classList.add('on');
  openA11yPanel(document.querySelector('.merchant-modal-card'));
}
function closeMerchantModal(){document.getElementById('merchant-modal').classList.remove('on');closeA11yPanel();}
function merchantLogin(){
  document.getElementById('mm-error').style.display='none';
  if(currentLoginRole==='admin'){
    const user=document.getElementById('mm-admin-user').value.trim();
    const pass=document.getElementById('mm-admin-pass').value;
    {document.getElementById('mm-error').style.display='block';return;} // login is verified ONLY by the server (backend/Sync.js → Api.php)
    currentMerchant=getBrand('lostandfound');
    saveSession();
    document.getElementById('merchant-btn').innerHTML=ICONS.key+' Admin';
    document.getElementById('merchant-btn').classList.add('logged-in');
    document.getElementById('merchant-btn').style.background='linear-gradient(135deg,#c8a96e,#f0d9a8)';
    document.getElementById('merch-notif-wrap').classList.add('visible');
    closeMerchantModal();navigateTo('merchant');
    toast('Admin access granted!','success');
    addNotif('merchant',ICONS.key,'Logged in as ADMIN — full access','orders-merch');
  } else {
    const brandId=document.getElementById('mm-brand-select').value;
    const pass=document.getElementById('mm-pass').value;
    const storedPass=JSON.parse(localStorage.getItem('lf_merchant_passwords')||'{}');
    const effectivePass=storedPass[brandId]||MERCHANT_ACCOUNTS[brandId];
    if(effectivePass!==pass){document.getElementById('mm-error').style.display='block';return;}
    currentMerchant=getBrand(brandId);
    saveSession();
    document.getElementById('merchant-btn').innerHTML=ICONS.store+' '+currentMerchant.name;
    document.getElementById('merchant-btn').classList.add('logged-in');
    document.getElementById('merchant-btn').style.background='';
    document.getElementById('merch-notif-wrap').classList.add('visible');
    closeMerchantModal();navigateTo('merchant');
    toast('Welcome back, '+currentMerchant.name+'!','success');
    addNotif('merchant',ICONS.store,'Logged in as '+currentMerchant.name,'orders-merch');
  }
}
function merchantLogout(){currentMerchant=null;saveSession();document.getElementById('merchant-btn').innerHTML=ICONS.user+' Merchant';document.getElementById('merchant-btn').classList.remove('logged-in');document.getElementById('merchant-btn').style.background='';document.getElementById('merch-notif-wrap').classList.remove('visible');navigateTo('home');toast('Logged out');}

/* ══ ORDER STATUS FILTER (NEW) ══ */
function setOrderStatusFilter(status, btn) {
  activeOrderStatusFilter = status;
  document.querySelectorAll('.osn-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMerchantOrdersList();
}

function updateOrderStatusCounts(myOrders) {
  const statuses = ['all','pending','confirmed','packed','shipped','delivered'];
  statuses.forEach(s => {
    const el = document.getElementById('osn-count-' + s);
    if (!el) return;
    const count = s === 'all' ? myOrders.length : myOrders.filter(o => o.status === s).length;
    el.textContent = count;
    el.classList.toggle('has-items', count > 0 && s !== 'all' && s !== 'delivered');
  });
}

function renderMerchantOrdersList() {
  if (!currentMerchant) return;
  const isAdmin=currentMerchant.id==='lostandfound';
  const myO=isAdmin?orders:orders.filter(o=>o.items.some(i=>i.brand===currentMerchant.id));
  updateOrderStatusCounts(myO);
  const filtered = activeOrderStatusFilter === 'all' ? myO : myO.filter(o => o.status === activeOrderStatusFilter);
  const ol = document.getElementById('merch-orders-list');
  if (!ol) return;
  if (!filtered.length) {
    const statusLabel = activeOrderStatusFilter === 'all' ? 'orders' : `"${activeOrderStatusFilter}" orders`;
    ol.innerHTML = `<div style="text-align:center;padding:3rem 1rem;color:var(--g4);font-size:.9rem">No ${statusLabel} found.</div>`;
    return;
  }
  ol.innerHTML = filtered.map(o => makeMerchantOrderCard(o)).join('');
}

/* ══ PRODUCT SEARCH (NEW) ══ */
function renderMerchProductTable() {
  if (!currentMerchant) return;
  const query = (document.getElementById('merch-prod-search')?.value || '').toLowerCase().trim();
  const isAdmin=currentMerchant.id==='lostandfound';
const myP=isAdmin?PRODUCTS:PRODUCTS.filter(p=>p.brand===currentMerchant.id);
  const filtered = query ? myP.filter(p =>
    p.name.toLowerCase().includes(query) ||
    String(p.id).includes(query) ||
    p.tag.toLowerCase().includes(query) ||
    p.size.toLowerCase().includes(query)
  ) : myP;
  const tbody = document.getElementById('merch-product-tbody');
  if (!tbody) return;
  tbody.innerHTML = filtered.length ? filtered.map(p => {
    const [sl, sc] = stockStatus(p.stock);
    return `<tr>
      <td><span class="prod-id-badge">#${p.id}</span></td>
      <td><div style="width:38px;height:38px;border-radius:5px;overflow:hidden;background:var(--g2);display:flex;align-items:center;justify-content:center;color:var(--g3)">${p.img ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover" loading="lazy">` : ICONS.tag}</div></td>
      <td style="font-size:.9rem;font-weight:500">${p.name}</td>
      <td><span style="font-size:.8rem;background:var(--g1);border:1px solid var(--g2);padding:.22rem .6rem;border-radius:5px;font-weight:500">${p.tag}</span></td>
      <td style="font-size:.9rem;font-weight:600">${fmtMoney(p.price)}</td>
      <td style="font-size:.875rem;font-weight:600;color:var(--g5)">${p.size}</td>
      <td><span class="card-stock-badge ${sc}">${sl} (${p.stock})</span></td>
      <td><button class="tbl-action" onclick="openProductModal(${p.id})">Edit</button><button class="tbl-action danger" onclick="deleteProduct(${p.id})">Del</button></td>
    </tr>`;
  }).join('') : `<tr><td colspan="8" style="text-align:center;color:var(--g4);padding:2rem;font-size:.875rem">No products match your search.</td></tr>`;
}

function renderMerchantDash(){
  if(!currentMerchant){openMerchantModal();return;}
  const isAdmin=currentMerchant.id==='lostandfound';
  const myP=isAdmin?PRODUCTS:PRODUCTS.filter(p=>p.brand===currentMerchant.id);
  const myO=isAdmin?orders:orders.filter(o=>o.items.some(i=>i.brand===currentMerchant.id));
  const rev=myO.reduce((s,o)=>s+o.total,0);
  document.getElementById('merch-title').innerHTML=currentMerchant.name+' Dashboard'+(isAdmin?' <span style="background:linear-gradient(135deg,#c8a96e,#f0d9a8);color:#0c0b09;font-size:.9rem;padding:.2rem .8rem;border-radius:20px;font-family:Inter,sans-serif;font-weight:700;letter-spacing:.08em;vertical-align:middle">'+ICONS.key+' ADMIN</span>':'');
  document.querySelectorAll('.admin-only-tab').forEach(el=>{el.style.display=isAdmin?'':'none';});
  if(isAdmin)renderCategoriesPanel();
  document.getElementById('merch-stats-grid').innerHTML=`<div class="merch-stat-card"><div class="merch-stat-val">${myP.length}</div><div class="merch-stat-lbl">Products</div></div><div class="merch-stat-card"><div class="merch-stat-val">${myO.length}</div><div class="merch-stat-lbl">Orders</div></div><div class="merch-stat-card"><div class="merch-stat-val">${fmtMoney(rev)}</div><div class="merch-stat-lbl">Revenue</div></div><div class="merch-stat-card"><div class="merch-stat-val">${myP.reduce((s,p)=>s+(p.stock||0),0)}</div><div class="merch-stat-lbl">Total Stock</div></div>`;
  renderMerchProductTable();
  renderMerchantOrdersList();
  const tl=document.getElementById('top-products-list');if(tl){const s=[...myP].sort((a,b)=>b.views-a.views).slice(0,5);tl.innerHTML=s.map((p,i)=>`<li class="top-product-item"><span class="tp-rank">${i+1}</span><span class="tp-name">${p.name}</span><span style="font-size:.82rem;color:var(--g4)">${p.views} views · ${fmtMoney(p.price)}</span></li>`).join('');}
  const il=document.getElementById('inventory-list');if(il)il.innerHTML=myP.map(p=>{const pct=Math.min(100,((p.stock||0)/30)*100);const cls=(p.stock||0)<=0?'out':(p.stock||0)<=5?'low':'';return `<div class="inv-bar"><span class="inv-label">${p.name}</span><div class="inv-track"><div class="inv-fill ${cls}" style="width:${pct}%"></div></div><span class="inv-num">${p.stock||0} units</span><button class="inv-edit" onclick="adjustStock(${p.id})">Edit</button></div>`;}).join('');
  const bp=document.getElementById('merch-brand-profile');
  if(bp)bp.innerHTML=`<div style="display:flex;align-items:center;gap:1.6rem;padding:1.6rem;background:#fff;border:1px solid var(--g2);border-radius:var(--r2);margin-bottom:1.6rem;flex-wrap:wrap"><div style="width:82px;height:82px;border-radius:var(--r2);overflow:hidden;background:var(--g2);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--g4)">${currentMerchant.img?`<img src="${currentMerchant.img}" style="width:100%;height:100%;object-fit:cover">`:ICONS.store}</div><div style="flex:1"><div style="font-family:'Bebas Neue';font-size:1.6rem">${currentMerchant.name}</div><div style="font-size:.9rem;color:var(--g4);margin:.25rem 0;line-height:1.6">${currentMerchant.desc||'—'}</div><div style="font-size:.82rem;color:var(--g4)">${ICONS.mapPin} ${currentMerchant.location||'Batangas'} · Est. ${currentMerchant.year||'—'}</div><div style="font-size:.82rem;color:var(--g4)">${ICONS.clock} ${currentMerchant.schedule||'—'} · ${currentMerchant.instagram||'—'}</div></div><button class="edit-save-btn" style="padding:.55rem 1.3rem;border-radius:20px;max-width:160px;font-size:.85rem" onclick="openBrandModal()">Edit Profile &amp; Image</button><button class="edit-cancel-btn" style="padding:.55rem 1.3rem;border-radius:20px;max-width:160px;font-size:.85rem;margin-top:.5rem;display:block" onclick="openChangePassword()">Change Password</button></div>${currentMerchant.img?`<div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);overflow:hidden;margin-bottom:1.6rem"><div style="font-size:.78rem;color:var(--g4);padding:.65rem 1.1rem .25rem;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Current Brand Banner</div><img src="${currentMerchant.img}" style="width:100%;height:185px;object-fit:cover;display:block" alt="Brand banner"><div style="padding:.55rem 1.1rem;font-size:.78rem;color:var(--g4)">This image appears as your banner in the catalog.</div></div>`:'<div style="background:var(--g1);border:2px dashed var(--g2);border-radius:var(--r2);padding:1.6rem;text-align:center;font-size:.875rem;color:var(--g4);margin-bottom:1.6rem">No banner image set yet. Click "Edit Profile &amp; Image" to add one.</div>'}`;
  const myIds=myP.map(p=>p.id);const myRevs=reviews.filter(r=>myIds.includes(r.productId));const rl=document.getElementById('merch-reviews-list');if(rl)rl.innerHTML=myRevs.length?myRevs.map(rv=>{const pr=getProduct(rv.productId);return `<div class="review-card"><div style="font-size:.78rem;color:var(--g4);margin-bottom:.35rem">Product: <strong>${pr?.name||'—'}</strong></div><div class="review-card-header"><span class="review-card-author">${rv.author}</span><span class="review-card-date">${rv.date}</span></div><div class="review-card-stars">${'★'.repeat(rv.rating)}${'☆'.repeat(5-rv.rating)}</div><div class="review-card-text">${rv.text}</div>${rv.merchantReply?`<div class="review-reply"><strong>Your Reply:</strong> ${rv.merchantReply}</div>`:`<div class="review-respond-area" id="rra-${rv.id}"><textarea placeholder="Write your reply..."></textarea><button class="review-respond-submit" onclick="submitMerchantReply('${rv.id}',this)">Send Reply</button></div><button class="review-respond-btn" onclick="document.getElementById('rra-${rv.id}').classList.toggle('open')">Reply to Review</button>`}</div>`;}).join(''):'<div style="color:var(--g4);font-size:.875rem;padding:1.1rem">No reviews yet on your products.</div>';
  setTimeout(drawSalesChart,100);
  setTimeout(()=>{const activeBtn=document.querySelector('.mt-tab.active');if(activeBtn)positionTabIndicator(activeBtn);},60);
}

function makeMerchantOrderCard(o){return `<div class="merch-order-detail"><div class="mod-header"><div><div class="mod-id">${o.id}</div><div style="font-size:.82rem;color:var(--g4)">${o.date}</div></div><select class="status-select" onchange="updateOrderStatus('${o.id}',this.value)">${['pending','confirmed','packed','shipped','delivered'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}</select></div><div class="mod-customer-info"><strong>${o.customer}</strong> · ${o.email} · ${o.phone||'—'}<br>${ICONS.mapPin} ${o.address||'—'} · ${ICONS.creditCard} ${(o.payMethod||'—').toUpperCase()}</div><div style="font-size:.875rem;margin-bottom:.9rem">${o.items.map(i=>`${i.name} ×${i.qty||1}`).join(' · ')}</div><div style="font-weight:700;font-size:.95rem;margin-bottom:.9rem">Total: ${fmtMoney(o.total)}</div><div class="mod-tracking-input"><input id="ti-${o.id}" placeholder="J&T Tracking Number..." value="${o.trackingNumber||''}"><input id="mi-${o.id}" placeholder="Message to customer..." style="flex:2"><button class="mod-send-btn" onclick="sendMerchantMsg('${o.id}')">Send</button></div><div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:.9rem;max-height:160px;overflow-y:auto;font-size:.875rem">${(o.messages||[]).map(m=>`<div style="margin-bottom:.45rem;color:${m.role==='merchant'?'var(--black)':'var(--g4)'}"><strong>${m.role==='merchant'?'You':'Customer'}:</strong> ${m.text}</div>`).join('')||'<span style="color:var(--g4)">No messages yet.</span>'}</div></div>`;}

function sendMerchantMsg(orderId){const o=orders.find(x=>x.id===orderId);if(!o)return;const ti=document.getElementById('ti-'+orderId);const mi=document.getElementById('mi-'+orderId);const tn=ti?.value.trim(),msg=mi?.value.trim();if(!msg&&!tn){toast('Enter a message or tracking number','error');return;}if(tn)o.trackingNumber=tn;if(!o.messages)o.messages=[];o.messages.push({role:'merchant',text:msg||(tn?'Tracking: '+tn:''),time:nowTime()});if(mi)mi.value='';persist();toast('Message sent!','success');addNotif('customer',ICONS.message,'Merchant message for order '+orderId,'orders');renderMerchantDash();}
function submitMerchantReply(reviewId,btn){const area=btn.closest('.review-respond-area');const txt=area?.querySelector('textarea')?.value.trim();if(!txt){toast('Enter a reply','error');return;}const rv=reviews.find(r=>r.id===reviewId);if(rv){rv.merchantReply=txt;persist();toast('Reply submitted!','success');renderMerchantDash();}}
function updateOrderStatus(orderId,status){const o=orders.find(x=>x.id===orderId);if(!o)return;o.status=status;if(!o.timeline)o.timeline={};o.timeline[status]=new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric'});persist();addNotif('customer',ICONS.package,'Your order '+orderId+' is now: '+status,'orders');addNotif('merchant',ICONS.checkCircle,'Updated '+orderId+' → '+status,'orders-merch');toast('Status updated: '+status,'success');renderMerchantDash();}
function adjustStock(id){const p=getProduct(id);if(!p)return;const v=prompt(`Stock for "${p.name}" (current: ${p.stock||0}):`,p.stock||0);if(v!==null&&!isNaN(parseInt(v))){p.stock=Math.max(0,parseInt(v));persist();renderMerchantDash();toast('Stock updated!','success');}}
function deleteProduct(id){if(!confirm('Delete this product?'))return;PRODUCTS=PRODUCTS.filter(p=>p.id!==id);persist();renderMerchantDash();toast('Product deleted');}
function positionTabIndicator(btn){const ind=document.getElementById('mt-tab-indicator');const wrap=document.querySelector('.merch-tabs');if(!ind||!wrap||!btn||window.innerWidth<=900)return;const wrapRect=wrap.getBoundingClientRect();const btnRect=btn.getBoundingClientRect();ind.style.height=btnRect.height+'px';ind.style.transform='translateY('+(btnRect.top-wrapRect.top)+'px)';}
window.addEventListener('resize',()=>{const active=document.querySelector('.mt-tab.active');if(active)positionTabIndicator(active);});
function _showMerchTabImpl(tab,btn){['products','orders','analytics','inventory','brand','reviews','events','feedback','testimonial','siteimages','brands','categories','approvals','security'].forEach(t=>{const el=document.getElementById('merch-panel-'+t);if(el)el.style.display=t===tab?'block':'none';});document.querySelectorAll('.mt-tab').forEach(b=>b.classList.toggle('active',b===btn));if(btn)positionTabIndicator(btn);if(tab==='analytics')setTimeout(drawSalesChart,150);if(tab==='orders')renderMerchantOrdersList();if(tab==='events')renderMerchEventsPanel();if(tab==='feedback')renderFeedbackPanel();if(tab==='testimonial')renderMerchTestimRequestsList();if(tab==='siteimages'){}if(tab==='brands')renderAdminBrandsList();
if(tab==='categories')renderCategoriesPanel();
if(tab==='approvals')renderImageApprovals();}
function showMerchTab(tab,btn){if(document.startViewTransition){document.startViewTransition(()=>_showMerchTabImpl(tab,btn));}else{_showMerchTabImpl(tab,btn);}}
function renderCategoriesPanel(){
  const el=document.getElementById('admin-categories-list');if(!el)return;
  const map={};
  PRODUCTS.forEach(p=>{const t=p.tag||'Uncategorized';(map[t]=map[t]||[]).push(p);});
  const tags=Object.keys(map).sort();
  el.innerHTML=tags.length?tags.map(t=>{
    const items=map[t];
    const stock=items.reduce((s,p)=>s+(p.stock||0),0);
    const merchants=new Set(items.map(p=>p.brand)).size;
    return `<div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1rem 1.2rem;margin-bottom:.8rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem">
      <div><div style="font-weight:700;font-size:1.05rem">${t}</div><div style="font-size:.82rem;color:var(--g4)">${items.length} product(s) · ${stock} units in stock · ${merchants} merchant(s)</div></div>
    </div>`;
  }).join(''):'<p style="color:var(--g4);font-size:.9rem;padding:1rem">No product categories yet — categories appear here as soon as merchants add products.</p>';
}

function openProductModal(id){
  const p=id?getProduct(id):null;
  pmImgs=p?(p.imgs||(p.img?[p.img]:[])):[];
  document.getElementById('pm-title').textContent=p?'Edit Product':'Add Product';
  document.getElementById('pm-id').value=p?p.id:'';
  document.getElementById('pm-name').value=p?p.name:'';
  document.getElementById('pm-price').value=p?p.price:'';
  document.getElementById('pm-original-price').value=p&&p.originalPrice?p.originalPrice:'';
  document.getElementById('pm-tag').value=p?p.tag:'';
  document.getElementById('pm-size').value=p?p.size:'';
  document.getElementById('pm-stock').value=p?(p.stock||0):'10';
  document.querySelectorAll('.price-chip').forEach(b=>b.classList.remove('on'));
  renderPmImgsPreview();
  document.getElementById('product-modal').classList.add('on');
  openA11yPanel(document.querySelector('#product-modal .edit-card'));
}
function closeProductModal(){document.getElementById('product-modal').classList.remove('on');closeA11yPanel();}
let pmImgs=[];
function handleImgsUpload(input){
  const files=Array.from(input.files).slice(0,5-pmImgs.length);
  files.forEach(file=>{
    const reader=new FileReader();
    reader.onload=e=>{pmImgs.push(e.target.result);renderPmImgsPreview();};
    reader.readAsDataURL(file);
  });
}
function addImgUrl(url){if(!url||pmImgs.length>=5)return;pmImgs.push(url);renderPmImgsPreview();}
function removePmImg(idx){pmImgs.splice(idx,1);renderPmImgsPreview();}
function renderPmImgsPreview(){
  const el=document.getElementById('pm-imgs-preview');
  if(!el)return;
  el.innerHTML=pmImgs.map((src,i)=>`<div style="position:relative;width:72px;height:72px"><img src="${src}" style="width:72px;height:72px;object-fit:cover;border-radius:var(--r);border:2px solid ${i===0?'var(--accent)':'var(--g2)'}"><button onclick="removePmImg(${i})" aria-label="Remove image ${i+1}" style="position:absolute;top:-6px;right:-6px;background:var(--red);color:#fff;border:none;width:18px;height:18px;border-radius:50%;font-size:.65rem;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>${i===0?'<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(196,144,48,.85);color:#fff;font-size:.6rem;text-align:center;font-weight:700;border-radius:0 0 var(--r) var(--r)">COVER</div>':''}</div>`).join('');
}
function saveProduct(){
  const idVal=document.getElementById('pm-id').value;
  const id=idVal?parseInt(idVal):null;
  const name=document.getElementById('pm-name').value.trim();
  const priceRaw=document.getElementById('pm-price').value.trim();
const price=isNaN(parseFloat(priceRaw))?priceRaw:parseFloat(priceRaw);
  const originalPriceRaw=document.getElementById('pm-original-price').value.trim();
  const originalPrice=originalPriceRaw?(isNaN(parseFloat(originalPriceRaw))?originalPriceRaw:parseFloat(originalPriceRaw)):null;
  const tag=document.getElementById('pm-tag').value.trim();
  const size=document.getElementById('pm-size').value.trim();
  const stock=parseInt(document.getElementById('pm-stock').value)||0;
  const urlInput=document.getElementById('pm-img').value.trim();
  if(urlInput&&!pmImgs.includes(urlInput))pmImgs.push(urlInput);
  const imgs=pmImgs.length?pmImgs:[];
  const img=imgs[0]||'';
  if(!name||!priceRaw||!tag||!size){toast('Fill all required fields (*)','error');return;}
  if(id){const p=getProduct(id);if(p){Object.assign(p,{name,price,originalPrice,tag,size,stock,img,imgs});toast('Product updated!','success');}}
  else{const newId=Math.max(0,...PRODUCTS.map(p=>p.id))+1;PRODUCTS.push({id:newId,brand:currentMerchant.id,name,tag,price,originalPrice,size,stock,img,imgs,new:true,views:0});toast('Product added!','success');}
  persist();closeProductModal();renderMerchantDash();
}

function openBrandModal(){const b=currentMerchant;document.getElementById('bm-name').value=b.name;document.getElementById('bm-tag').value=b.tag;document.getElementById('bm-desc').value=b.desc||'';document.getElementById('bm-loc').value=b.location||'';document.getElementById('bm-year').value=b.year||'';document.getElementById('bm-ig').value=b.instagram||'';document.getElementById('bm-sched').value=b.schedule||'';document.getElementById('bm-img').value=b.img||'';const fileInput=document.getElementById('bm-file');if(fileInput)fileInput.value='';const area=document.getElementById('bm-upload-area');const preview=document.getElementById('bm-preview');if(b.img){preview.src=b.img;preview.style.display='block';area.classList.add('has-image');}else{preview.src='';preview.style.display='none';area.classList.remove('has-image');}document.getElementById('brand-modal').classList.add('on');openA11yPanel(document.querySelector('#brand-modal .edit-card'));}
function closeBrandModal(){document.getElementById('brand-modal').classList.remove('on');closeA11yPanel();}
function handleBrandImgUpload(input){const file=input.files[0];if(!file)return;const reader=new FileReader();reader.onload=e=>{const data=e.target.result;const preview=document.getElementById('bm-preview');const area=document.getElementById('bm-upload-area');document.getElementById('bm-img').value=data;preview.src=data;preview.style.display='block';area.classList.add('has-image');toast('Image loaded — click Save Brand to apply','success');};reader.readAsDataURL(file);}
function previewBrandImgFromUrl(url){const preview=document.getElementById('bm-preview');const area=document.getElementById('bm-upload-area');if(url&&(url.startsWith('http')||url.startsWith('data:'))){preview.src=url;preview.style.display='block';area.classList.add('has-image');preview.onerror=()=>{preview.style.display='none';area.classList.remove('has-image');};}else{preview.src='';preview.style.display='none';area.classList.remove('has-image');}}
function saveBrand(){const i=BRANDS.findIndex(b=>b.id===currentMerchant.id);if(i>=0){const b=BRANDS[i];const name=document.getElementById('bm-name').value.trim();if(name)b.name=name;b.tag=document.getElementById('bm-tag').value.trim()||b.tag;b.desc=document.getElementById('bm-desc').value.trim()||b.desc;b.location=document.getElementById('bm-loc').value.trim();b.year=document.getElementById('bm-year').value.trim();b.instagram=document.getElementById('bm-ig').value.trim();b.schedule=document.getElementById('bm-sched').value.trim();const img=document.getElementById('bm-img').value.trim();if(img)b.img=img;currentMerchant={...currentMerchant,...b};}persist();toast('Brand updated!','success');closeBrandModal();renderMerchantDash();}

function initSearch(){const input=document.getElementById('search-input');const results=document.getElementById('search-results');let deb;input.addEventListener('input',()=>{clearTimeout(deb);deb=setTimeout(()=>{const q=input.value.trim().toLowerCase();if(!q){results.innerHTML='';return;}const matches=PRODUCTS.filter(p=>p.name.toLowerCase().includes(q)||getBrandName(p.brand).toLowerCase().includes(q)||p.tag.toLowerCase().includes(q)).slice(0,8);results.innerHTML=matches.length?matches.map(p=>`<div class="sr-item" onclick="selectSearchResult(${p.id})"><div class="sr-thumb">${p.img?`<img src="${p.img}" alt="${p.name}" loading="lazy">`:ICONS.tag}</div><div><div class="sr-name">${p.name}</div><div class="sr-meta">${getBrandName(p.brand)} · ${p.tag} · <strong style="color:var(--g5)">${p.size}</strong></div></div><div class="sr-price">${fmtMoney(p.price)}</div></div>`).join(''):'<div style="padding:1.1rem;font-size:.875rem;color:var(--g4)">No results found</div>';},200);});}
function toggleSearchOverlay(){const ov=document.getElementById('search-overlay');if(ov.classList.contains('open'))closeSearchOverlay();else openSearchOverlay();}
function openSearchOverlay(){const ov=document.getElementById('search-overlay');ov.classList.add('open');closeAllDropdowns();setTimeout(()=>document.getElementById('search-input')?.focus(),50);}
function closeSearchOverlay(){const ov=document.getElementById('search-overlay');ov.classList.remove('open');const input=document.getElementById('search-input');const results=document.getElementById('search-results');if(input)input.value='';if(results)results.innerHTML='';}
function selectSearchResult(productId){closeSearchOverlay();openProductDetail(productId);}

function showWelcomeModal(){
  const merchants=BRANDS.filter(b=>b.id!=='lostandfound');
  const pick=merchants[Math.floor(Math.random()*merchants.length)];
  if(pick){
    document.getElementById('welcome-merchant-name').textContent=pick.name;
    document.getElementById('welcome-merchant-sub').innerHTML=ICONS.mapPin+' '+(pick.location||'Batangas')+' · '+pick.tag;
    const thumb=document.getElementById('welcome-merch-thumb');
    if(thumb){
      if(pick.img){thumb.innerHTML=`<img src="${pick.img}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='${ICONS.store.replace(/'/g,"\\'")}'">`;}
      else{thumb.innerHTML=ICONS.store;}
    }
  }
  const brandCountEl=document.getElementById('welcome-brand-count');
  if(brandCountEl)brandCountEl.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> '+merchants.length+' Brands';
  document.getElementById('welcome-modal').classList.add('show');
  openA11yPanel(document.querySelector('.wm-card'));
}
function closeWelcomeModal(){
  document.getElementById('welcome-modal').classList.remove('show');
  closeA11yPanel();
}

function openChangePassword(){
  if(!currentMerchant)return;
  const current=prompt('Enter your CURRENT password:');
  if(current===null)return;
  if(MERCHANT_ACCOUNTS[currentMerchant.id]!==current){toast('Incorrect current password','error');return;}
  const next=prompt('Enter your NEW password (min 4 characters):');
  if(!next||next.length<4){toast('Password too short — minimum 4 characters','error');return;}
  const confirm2=prompt('Confirm new password:');
  if(next!==confirm2){toast('Passwords do not match','error');return;}
  MERCHANT_ACCOUNTS[currentMerchant.id]=next;
  toast('Password changed successfully!','success');
}

function saveMerchantPassword(){
  if(!currentMerchant||currentMerchant.id==='lostandfound')return;
  const cur=document.getElementById('sec-cur').value;
  const nw=document.getElementById('sec-new').value;
  const conf=document.getElementById('sec-confirm').value;
  const errEl=document.getElementById('sec-error');
  const storedPass=JSON.parse(localStorage.getItem('lf_merchant_passwords')||'{}');
  const effectivePass=storedPass[currentMerchant.id]||MERCHANT_ACCOUNTS[currentMerchant.id];
  if(cur!==effectivePass){errEl.textContent='Current password is incorrect.';errEl.style.display='block';return;}
  if(nw.length<4){errEl.textContent='New password must be at least 4 characters.';errEl.style.display='block';return;}
  if(nw!==conf){errEl.textContent='Passwords do not match.';errEl.style.display='block';return;}
  errEl.style.display='none';
  storedPass[currentMerchant.id]=nw;
  localStorage.setItem('lf_merchant_passwords',JSON.stringify(storedPass));
  MERCHANT_ACCOUNTS[currentMerchant.id]=nw;
  document.getElementById('sec-cur').value='';
  document.getElementById('sec-new').value='';
  document.getElementById('sec-confirm').value='';
  toast('Password updated successfully!','success');
}

function subscribeNewsletter(){const email=document.getElementById('newsletter-email').value.trim();if(!email||!email.includes('@')){toast('Please enter a valid email','error');return;}toast('Subscribed! Welcome to the family.','success');document.getElementById('newsletter-email').value='';}
function selectPriceChip(btn, val) {
  document.querySelectorAll('.price-chip').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('pm-price').value = val;
}
function clearChipSelection() {
  document.querySelectorAll('.price-chip').forEach(b => b.classList.remove('on'));
}
function loadChartJS(cb){if(window.Chart){cb();return;}const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js';s.onload=cb;document.head.appendChild(s);}
function drawSalesChart(){
  const canvas=document.getElementById('salesChart');
  if(!canvas||!currentMerchant)return;
  const isAdmin=currentMerchant.id==='lostandfound';
  const myOrders=isAdmin?orders:orders.filter(o=>o.items.some(i=>i.brand===currentMerchant.id));
  const delivered=myOrders.filter(o=>o.status==='delivered');
  let totalSales=0,itemsSold=0;
  delivered.forEach(o=>{o.items.forEach(i=>{if(isAdmin||(i.brand===currentMerchant.id)){totalSales+=i.price*(i.qty||1);itemsSold+=(i.qty||1);}});});
  const avgPrice=itemsSold?Math.round(totalSales/itemsSold):0;
  const inProgress=myOrders.filter(o=>o.status!=='delivered').reduce((s,o)=>s+o.total,0);
  const panel=document.getElementById('merch-panel-analytics');
  let mc=document.getElementById('analytics-metrics');
  if(!mc){mc=document.createElement('div');mc.id='analytics-metrics';mc.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:1rem;margin-bottom:1.6rem';panel.insertBefore(mc,panel.firstChild);}
  mc.innerHTML=[
    {label:'Total Sales',val:fmtMoney(totalSales),icon:ICONS.creditCard,bg:'#dcf5eb',tc:'#076a35'},
    {label:'Items Sold',val:itemsSold+' pcs',icon:ICONS.package,bg:'#dbeafe',tc:'#1e40af'},
    {label:'Avg Per Item',val:fmtMoney(avgPrice),icon:ICONS.barChart,bg:'#fef3c7',tc:'#92400e'},
    {label:'In Progress',val:fmtMoney(inProgress),icon:ICONS.clock,bg:'#fee2e2',tc:'#991b1b'},
  ].map(m=>`<div style="background:${m.bg};border-radius:16px;padding:1.2rem;text-align:center"><div style="margin-bottom:.25rem;color:${m.tc};display:flex;justify-content:center;transform:scale(1.5)">${m.icon}</div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.55rem;color:${m.tc}">${m.val}</div><div style="font-size:.68rem;color:${m.tc};opacity:.75;text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-top:.15rem">${m.label}</div></div>`).join('');
  loadChartJS(()=>{
    if(salesChart){salesChart.destroy();salesChart=null;}
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now=new Date();const labels=[];const data=[];
    for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);labels.push(months[d.getMonth()]);const ms=delivered.filter(o=>{const od=new Date(o.date);return od.getMonth()===d.getMonth()&&od.getFullYear()===d.getFullYear();}).reduce((s,o)=>s+o.total,0);data.push(ms);}
    const hasData=data.some(v=>v>0);
    const chartData=hasData?data:[1200,1800,1400,2200,1900,2800];
    const ctx=canvas.getContext('2d');
    const grad=ctx.createLinearGradient(0,0,0,240);
    grad.addColorStop(0,'rgba(200,169,110,0.28)');grad.addColorStop(1,'rgba(200,169,110,0.01)');
    salesChart=new Chart(canvas,{type:'line',data:{labels,datasets:[{label:'Revenue (₱)',data:chartData,borderColor:'#c8a96e',backgroundColor:grad,borderWidth:2.5,fill:true,tension:0.42,pointBackgroundColor:'#c8a96e',pointRadius:5,pointHoverRadius:7,pointBorderColor:'#fff',pointBorderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>'  ₱'+ctx.raw.toLocaleString()}}},scales:{x:{grid:{display:false},ticks:{font:{family:'Inter',size:12},color:'#8a8278'}},y:{ticks:{callback:v=>'₱'+v.toLocaleString(),font:{family:'Inter',size:12},color:'#8a8278'},grid:{color:'rgba(0,0,0,.04)'}}}}});
  });
}

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();closeCheckout();closeSearchOverlay();['confirm-modal','merchant-modal','product-modal','brand-modal','review-modal'].forEach(id=>document.getElementById(id)?.classList.remove('on'));closeEventDetail();closeAllDropdowns();if(document.getElementById('welcome-modal')?.classList.contains('show'))closeWelcomeModal();if(document.getElementById('feedback-modal')?.style.display==='flex')closeFeedback();}if(e.key==='ArrowLeft')carouselMove(-1);if(e.key==='ArrowRight')carouselMove(1);if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearchOverlay();}});
window.addEventListener('scroll',()=>{document.getElementById('back-to-top')?.classList.toggle('show',window.scrollY>400);});
document.addEventListener('click',e=>{if(!e.target.closest('#customer-notif-wrapper')&&!e.target.closest('#merch-notif-wrap'))closeAllDropdowns();});

function init(){showSpinner(700);startCarouselTimer();const cs=document.getElementById('carousel-section');if(cs){cs.addEventListener('mouseenter',()=>clearInterval(carouselTimer));cs.addEventListener('mouseleave',startCarouselTimer);}setInterval(updateCountdown,1000);updateCountdown();initSearch();renderHome();renderOrders();updateCartUI();renderNotifs();loadChartJS(()=>{});
applyAdminImages();
setTimeout(showWelcomeModal,900);
}
// ── EVENTS DATA ──
let events = JSON.parse(localStorage.getItem('lf_events') || '[]');

function persistEvents() {
  localStorage.setItem('lf_events', JSON.stringify(events));
}

let activeEventFilter = 'all';

function getEventStatus(ev) {
  const today = new Date(); today.setHours(0,0,0,0);
  const evDate = new Date(ev.date); evDate.setHours(0,0,0,0);
  if (evDate > today) return 'upcoming';
  if (evDate.toDateString() === today.toDateString()) return 'ongoing';
  return 'past';
}

function filterEvents(type, btn) {
  activeEventFilter = type;
  document.querySelectorAll('#events-filter-bar .f-btn').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  renderEventsPage();
}

function renderEventsPage() {
  const el = document.getElementById('events-list');
  if (!el) return;
  let list = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (activeEventFilter !== 'all') list = list.filter(ev => getEventStatus(ev) === activeEventFilter);
  if (!list.length) {
    el.innerHTML = `<div class="events-empty"><div class="events-empty-icon" style="display:flex;justify-content:center;transform:scale(2.4);color:var(--g3)">${ICONS.tent}</div><div class="events-empty-text">No ${activeEventFilter === 'all' ? '' : activeEventFilter + ' '}events yet.<br>Check back soon!</div></div>`;
    return;
  }
  el.innerHTML = list.map(ev => makeEventCard(ev)).join('');
}

function makeEventCard(ev) {
  const status = getEventStatus(ev);
  const statusColors = { upcoming: '#d4edda;color:#155724', ongoing: '#fff3cd;color:#856404', past: 'var(--g2);color:var(--g4)' };
  const brand = getBrand(ev.brandId);
  const dateStr = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const intKey = 'ev_int_' + ev.id;
  const interested = localStorage.getItem(intKey) === '1';
  return `<div class="event-card" onclick="openEventDetail('${ev.id}')" style="cursor:pointer" role="button" tabindex="0" onkeydown="if(event.key==='Enter'){openEventDetail('${ev.id}')}">
    <div class="event-card-banner">
      ${ev.img ? `<img src="${ev.img}" alt="${ev.title}" loading="lazy">` : `<div class="event-card-banner-placeholder" style="color:var(--g3);transform:scale(2.2)">${ICONS.tent}</div>`}
      <div style="position:absolute;top:.75rem;left:.75rem;background:${statusColors[status]};font-size:.72rem;font-weight:700;padding:.25rem .75rem;border-radius:20px;text-transform:uppercase;letter-spacing:.06em">${status}</div>
    </div>
    <div class="event-card-body">
      <div class="event-card-meta">
        <span class="event-meta-pill event-meta-date">${ICONS.calendar} ${dateStr}</span>
        ${ev.time ? `<span class="event-meta-pill event-meta-date">${ICONS.clock} ${ev.time}</span>` : ''}
        <span class="event-meta-pill event-meta-location">${ICONS.mapPin} ${ev.location}</span>
        <span class="event-meta-pill event-meta-brand">${ICONS.store} ${brand.name}</span>
      </div>
      <div class="event-card-title">${ev.title}</div>
      ${ev.desc ? `<div class="event-card-desc">${ev.desc}</div>` : ''}
      <div class="event-card-footer">
        <div class="event-card-posted-by">Posted by <strong>${brand.name}</strong></div>
        <button class="event-interested-btn ${interested ? 'on' : ''}" onclick="event.stopPropagation();toggleInterested('${ev.id}',this)">
          ${interested ? ICONS.star+' Interested' : 'Interested'}
        </button>
      </div>
    </div>
  </div>`;
}

function toggleInterested(evId, btn) {
  const key = 'ev_int_' + evId;
  const on = localStorage.getItem(key) === '1';
  localStorage.setItem(key, on ? '0' : '1');
  btn.classList.toggle('on', !on);
  btn.innerHTML = !on ? ICONS.star+' Interested' : 'Interested';
  toast(!on ? 'Marked as interested!' : 'Removed interest', !on ? 'success' : '');
}

function saveEvent() {
  if (!currentMerchant) return;
  const title = document.getElementById('ev-title').value.trim();
  const date = document.getElementById('ev-date').value;
  const time = document.getElementById('ev-time').value.trim();
  const location = document.getElementById('ev-location').value.trim();
  const desc = document.getElementById('ev-desc').value.trim();
  const img = document.getElementById('ev-img').value.trim();
  if (!title || !date || !location) { toast('Fill in Title, Date, and Location', 'error'); return; }
  const ev = { id: 'ev' + Date.now(), brandId: currentMerchant.id, title, date, time, location, desc, img, postedAt: new Date().toISOString() };
  events.unshift(ev);
  persistEvents();
  ['ev-title','ev-date','ev-time','ev-location','ev-desc','ev-img'].forEach(id => { document.getElementById(id).value = ''; });
  toast('Event posted!', 'success');
  addNotif('merchant', ICONS.calendar, 'Event "' + title + '" posted', null);
  renderMerchEventsPanel();
}

function renderBrandEvents(brandId) {
  const section = document.getElementById('brand-events-section');
  const el = document.getElementById('brand-events-list');
  if (!section || !el) return;
  const brandEvs = events.filter(e => e.brandId === brandId);
  if (!brandEvs.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  el.innerHTML = brandEvs.map(ev => {
    const status = getEventStatus(ev);
    const dateStr = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const intKey = 'ev_int_' + ev.id;
    const interested = localStorage.getItem(intKey) === '1';
    const statusConfig = {
      upcoming: { bg:'#d4f4e8', color:'#0a6640', dot:'#12a05c', label:'Upcoming' },
      ongoing:  { bg:'#fff3cd', color:'#7a5200', dot:'#e6a817', label:'Ongoing' },
      past:     { bg:'#f0ede8', color:'#6b6460', dot:'#b0aaa4', label:'Past' }
    };
    const st = statusConfig[status];
    return `<div onclick="openEventDetail('${ev.id}')" style="background:#fff;border:1px solid #e8e4dc;border-radius:16px;margin-bottom:1rem;overflow:hidden;display:flex;cursor:pointer;transition:box-shadow .2s ease,transform .2s ease" onmouseover="this.style.boxShadow='0 8px 32px rgba(0,0,0,.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='none';this.style.transform='none'">
      <div style="width:160px;min-height:140px;flex-shrink:0;background:#1a1a18;position:relative;overflow:hidden">
        <img src="${ev.img}" onclick="event.stopPropagation();openImgLightbox('${ev.img}')" style="width:100%;height:100%;object-fit:cover;opacity:.85;display:block;position:absolute;inset:0;cursor:zoom-in" alt="${ev.title}">
        <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.35) 0%,transparent 60%)"></div>
      </div>
      <div style="flex:1;padding:1.1rem 1.3rem;display:flex;flex-direction:column;justify-content:space-between;min-width:0">
        <div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;flex-wrap:wrap">
            <span style="display:inline-flex;align-items:center;gap:.3rem;font-size:.72rem;font-weight:600;padding:.22rem .7rem;border-radius:20px;background:${st.bg};color:${st.color};letter-spacing:.04em">
              <span style="width:6px;height:6px;border-radius:50%;background:${st.dot};flex-shrink:0"></span>${st.label}
            </span>
            <span style="font-size:.75rem;color:#8a8278;display:flex;align-items:center;gap:.3rem">
              ${ICONS.calendar}
              ${dateStr}
            </span>
            ${ev.time ? `<span style="font-size:.75rem;color:#8a8278;display:flex;align-items:center;gap:.3rem">${ICONS.clock}${ev.time}</span>` : ''}
          </div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:1.45rem;line-height:1.15;color:#0c0b09;margin-bottom:.35rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${ev.title}</div>
          <div style="font-size:.82rem;color:#8a8278;display:flex;align-items:center;gap:.3rem;margin-bottom:.3rem">
            ${ICONS.mapPin}
            ${ev.location}
          </div>
          ${ev.desc ? `<div style="font-size:.82rem;color:#6b6460;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${ev.desc}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.8rem;padding-top:.7rem;border-top:1px solid #f0ede8" onclick="event.stopPropagation()">
          <span style="font-size:.8rem;color:#c8a96e;font-weight:600;cursor:pointer;letter-spacing:.02em" onclick="openEventDetail('${ev.id}')">View details</span>
          <button onclick="toggleInterestedFromCard('${ev.id}',this);event.stopPropagation()" style="display:inline-flex;align-items:center;gap:.35rem;background:${interested?'#c8a96e':'transparent'};color:${interested?'#0c0b09':'#8a8278'};border:1.5px solid ${interested?'#c8a96e':'#d4cfc8'};padding:.3rem .85rem;font-family:'Inter',sans-serif;font-size:.78rem;font-weight:600;border-radius:20px;cursor:pointer;transition:all .18s">
            ${ICONS.star}
            Interested
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function deleteEvent(evId) {
  if (!confirm('Delete this event?')) return;
  events = events.filter(e => e.id !== evId);
  persistEvents();
  toast('Event deleted');
  renderMerchEventsPanel();
}

function renderMerchEventsPanel() {
  if (!currentMerchant) return;
  const el = document.getElementById('merch-events-list');
  if (!el) return;
  const myEvents = events.filter(e => e.brandId === currentMerchant.id);
  if (!myEvents.length) {
    el.innerHTML = '<div style="color:var(--g4);font-size:.875rem;padding:1rem">No events posted yet.</div>';
    return;
  }
  el.innerHTML = myEvents.map(ev => {
    const status = getEventStatus(ev);
    const dateStr = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    return `<div style="background:var(--g1);border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap">
      <div>
        <div style="font-family:'Bebas Neue';font-size:1.2rem">${ev.title}</div>
        <div style="font-size:.82rem;color:var(--g4);margin-top:.25rem">${ICONS.calendar} ${dateStr} ${ev.time ? '· '+ICONS.clock+' ' + ev.time : ''}</div>
        <div style="font-size:.82rem;color:var(--g4)">${ICONS.mapPin} ${ev.location}</div>
        <div style="margin-top:.4rem"><span style="font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:20px;background:${status==='upcoming'?'#d4edda':status==='ongoing'?'#fff3cd':'var(--g2)'};color:${status==='upcoming'?'#155724':status==='ongoing'?'#856404':'var(--g4)'};text-transform:uppercase;letter-spacing:.05em">${status}</span></div>
      </div>
      <button class="tbl-action danger" onclick="deleteEvent('${ev.id}')">Delete</button>
    </div>`;
  }).join('');
}
let currentEventDetailId = null;

function openEventDetail(evId) {
  const ev = events.find(e => e.id === evId);
  if (!ev) return;
  currentEventDetailId = evId;
  const brand = getBrand(ev.brandId);
  const status = getEventStatus(ev);
  const dateStr = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const statusColors = { upcoming: 'background:#d4edda;color:#155724', ongoing: 'background:#fff3cd;color:#856404', past: 'background:var(--g2);color:var(--g4)' };
  const intKey = 'ev_int_' + evId;
  const interested = localStorage.getItem(intKey) === '1';
  const img = document.getElementById('edm-img');
  const placeholder = document.getElementById('edm-placeholder');
  if (ev.img) { img.src = ev.img; img.style.display = 'block'; placeholder.style.display = 'none'; }
  else { img.style.display = 'none'; placeholder.style.display = 'flex'; }
  const badge = document.getElementById('edm-status-badge');
  badge.textContent = status;
  badge.style.cssText = 'position:absolute;top:1rem;left:1rem;font-size:.72rem;font-weight:700;padding:.3rem .85rem;border-radius:20px;text-transform:uppercase;letter-spacing:.08em;' + statusColors[status];
  document.getElementById('edm-brand-pill').innerHTML = ICONS.store+' ' + brand.name;
  document.getElementById('edm-title').textContent = ev.title;
  document.getElementById('edm-meta').innerHTML = `
    <span style="font-size:.78rem;font-weight:600;padding:.3rem .85rem;border-radius:20px;background:#fff3cd;color:#856404">${ICONS.calendar} ${dateStr}</span>
    ${ev.time ? `<span style="font-size:.78rem;font-weight:600;padding:.3rem .85rem;border-radius:20px;background:#d1ecf1;color:#0c5460">${ICONS.clock} ${ev.time}</span>` : ''}
    <span style="font-size:.78rem;font-weight:600;padding:.3rem .85rem;border-radius:20px;background:var(--g1);color:var(--g5);border:1px solid var(--g2)">${ICONS.mapPin} ${ev.location}</span>
  `;
  const descEl = document.getElementById('edm-desc');
  descEl.textContent = ev.desc || '';
  descEl.style.display = ev.desc ? 'block' : 'none';
  const btn = document.getElementById('edm-interest-btn');
  btn.innerHTML = interested ? ICONS.star+' Interested' : 'Mark as Interested';
  btn.style.background = interested ? 'var(--black)' : 'var(--accent)';
  btn.style.color = interested ? '#fff' : 'var(--black)';
  document.getElementById('event-detail-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  openA11yPanel(document.querySelector('#event-detail-modal > div'));
}

function closeEventDetail() {
  document.getElementById('event-detail-modal').style.display = 'none';
  document.body.style.overflow = '';
  currentEventDetailId = null;
  closeA11yPanel();
}

function toggleInterestedModal() {
  if (!currentEventDetailId) return;
  const key = 'ev_int_' + currentEventDetailId;
  const on = localStorage.getItem(key) === '1';
  localStorage.setItem(key, on ? '0' : '1');
  const btn = document.getElementById('edm-interest-btn');
  btn.innerHTML = !on ? ICONS.star+' Interested' : 'Mark as Interested';
  btn.style.background = !on ? 'var(--black)' : 'var(--accent)';
  btn.style.color = !on ? '#fff' : 'var(--black)';
  toast(!on ? 'Marked as interested!' : 'Removed interest', !on ? 'success' : '');
  renderEventsPage();
}

function toggleInterestedFromCard(evId, btn) {
  const key = 'ev_int_' + evId;
  const on = localStorage.getItem(key) === '1';
  localStorage.setItem(key, on ? '0' : '1');
  btn.innerHTML = !on ? ICONS.star+' Interested' : ICONS.star+' Interested';
  btn.style.background = !on ? 'var(--accent)' : 'none';
  btn.style.color = !on ? 'var(--black)' : 'var(--g4)';
  btn.style.borderColor = !on ? 'var(--accent)' : 'var(--g2)';
  toast(!on ? 'Marked as interested!' : 'Removed interest', !on ? 'success' : '');
}

function openImgLightbox(src) {
  if (!src) return;
  const lb = document.createElement('div');
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:2rem;backdrop-filter:blur(6px)';
  lb.innerHTML = `<img src="${src}" style="max-width:90vw;max-height:88vh;border-radius:12px;object-fit:contain;box-shadow:0 24px 80px rgba(0,0,0,.5)" onclick="event.stopPropagation()"><button onclick="this.closest('div').remove()" aria-label="Close image" style="position:absolute;top:1.2rem;right:1.2rem;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.3);color:#fff;width:42px;height:42px;border-radius:50%;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">✕</button>`;
  lb.onclick = () => lb.remove();
  document.body.appendChild(lb);
}

function editBrandDesc(brandId){
  document.getElementById('brand-desc-display').style.display='none';
  document.getElementById('brand-desc-edit').style.display='block';
  document.getElementById('brand-desc-ta').focus();
}
function saveBrandDesc(brandId){
  const txt=document.getElementById('brand-desc-ta').value.trim();
  const b=BRANDS.find(x=>x.id===brandId);
  if(b){b.desc=txt;if(currentMerchant&&currentMerchant.id===brandId)currentMerchant.desc=txt;}
  persist();
  toast('Description updated!','success');
  showBrand(brandId);
}


document.addEventListener('DOMContentLoaded',init);
function handleEvImgUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const data = e.target.result;
    document.getElementById('ev-img').value = data;
    const preview = document.getElementById('ev-preview');
    const area = document.getElementById('ev-upload-area');
    preview.src = data;
    preview.style.display = 'block';
    area.classList.add('has-image');
    toast('Image loaded!', 'success');
  };
  reader.readAsDataURL(file);
}

function openFeedback(){document.getElementById('feedback-modal').style.display='flex';openA11yPanel(document.querySelector('#feedback-modal > div'));}
function closeFeedback(){document.getElementById('feedback-modal').style.display='none';document.getElementById('fb-name').value='';document.getElementById('fb-msg').value='';document.getElementById('fb-type').value='suggestion';closeA11yPanel();}
function submitFeedback(){
  const name=document.getElementById('fb-name').value.trim();
  const msg=document.getElementById('fb-msg').value.trim();
  const type=document.getElementById('fb-type').value;
  if(!name){toast('Please enter your name','error');document.getElementById('fb-name').focus();return;}
  if(!msg){toast('Please write a message','error');document.getElementById('fb-msg').focus();return;}
  const feedbacks=JSON.parse(localStorage.getItem('lf_feedbacks')||'[]');
  feedbacks.unshift({name,type,msg,time:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})+' '+nowTime()});
  localStorage.setItem('lf_feedbacks',JSON.stringify(feedbacks));
  toast('Feedback sent! Thank you '+name,'success');
  closeFeedback();
}


function submitTestimonialRequest(){
  const name=document.getElementById('tr-name').value.trim();
  const loc=document.getElementById('tr-loc').value.trim();
  const rating=parseInt(document.getElementById('tr-rating').value);
  const text=document.getElementById('tr-text').value.trim();
  if(!name||!loc||!text){toast('Fill all required fields','error');return;}
  TESTIMONIAL_REQUESTS.unshift({id:'treq'+Date.now(),brandId:currentMerchant.id,brandName:currentMerchant.name,name,location:loc,rating,text,avatar:name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(),status:'pending',submittedAt:new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})});
  persist();
  toast('Testimonial request submitted! Waiting for admin approval.','success');
  ['tr-name','tr-loc','tr-text'].forEach(id=>document.getElementById(id).value='');
  renderMerchTestimRequestsList();
}

function renderMerchTestimRequestsList(){
  const el=document.getElementById('merch-testim-requests-list');
  if(!el)return;
  const myReqs=TESTIMONIAL_REQUESTS.filter(r=>r.brandId===currentMerchant?.id);
  if(!myReqs.length){el.innerHTML='<div style="color:var(--g4);font-size:.875rem;padding:1rem">No requests submitted yet.</div>';return;}
  el.innerHTML=myReqs.map(r=>`
    <div style="background:var(--g1);border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem">
        <div style="font-size:.9rem;font-weight:700">${r.name} · ${r.location}</div>
        <span style="font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:20px;background:${r.status==='approved'?'#dcf5eb':r.status==='rejected'?'#fee2e2':'#fef3c7'};color:${r.status==='approved'?'#076a35':r.status==='rejected'?'#991b1b':'#92400e'};text-transform:uppercase">${r.status}</span>
      </div>
      <div style="color:var(--accent-ink);font-size:.85rem;margin-bottom:.35rem">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      <div style="font-size:.875rem;color:var(--g5);line-height:1.6;font-style:italic">"${r.text}"</div>
      <div style="font-size:.75rem;color:var(--g4);margin-top:.4rem">Submitted: ${r.submittedAt}</div>
    </div>
  `).join('');
}

function adminAddTestimonial(){
  const name=document.getElementById('at-name').value.trim();
  const loc=document.getElementById('at-loc').value.trim();
  const rating=parseInt(document.getElementById('at-rating').value);
  const text=document.getElementById('at-text').value.trim();
  if(!name||!loc||!text){toast('Fill all required fields','error');return;}
  TESTIMONIALS.push({id:'t'+Date.now(),name,location:loc,rating,text,avatar:name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(),approved:true});
  persist();
  toast('Testimonial added to homepage!','success');
  ['at-name','at-loc','at-text'].forEach(id=>document.getElementById(id).value='');
  renderFeedbackPanel();
  renderHome();
}

function approveTestimonialRequest(reqId){
  const req=TESTIMONIAL_REQUESTS.find(r=>r.id===reqId);
  if(!req)return;
  req.status='approved';
  TESTIMONIALS.push({id:'t'+Date.now(),name:req.name,location:req.location,rating:req.rating,text:req.text,avatar:req.avatar,approved:true});
  persist();
  toast('Testimonial approved and added to homepage!','success');
  renderFeedbackPanel();
  renderHome();
}

function rejectTestimonialRequest(reqId){
  const req=TESTIMONIAL_REQUESTS.find(r=>r.id===reqId);
  if(!req)return;
  req.status='rejected';
  persist();
  toast('Request rejected','error');
  renderFeedbackPanel();
}

function deleteTestimonial(id){
  if(!confirm('Remove this testimonial from the homepage?'))return;
  TESTIMONIALS=TESTIMONIALS.filter(t=>t.id!==id);
  persist();
  toast('Testimonial removed');
  renderFeedbackPanel();
  renderHome();
}

function renderFeedbackPanel(){
  const isAdmin=currentMerchant?.id==='lostandfound';

  // Admin testimonial requests
  const adminReqEl=document.getElementById('admin-testim-requests-list');
  if(adminReqEl&&isAdmin){
    const pending=TESTIMONIAL_REQUESTS.filter(r=>r.status==='pending');
    if(!pending.length){adminReqEl.innerHTML='<div style="color:var(--g4);font-size:.875rem;padding:.5rem 0 1rem">No pending requests.</div>';}
    else{adminReqEl.innerHTML=pending.map(r=>`
      <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.2rem;margin-bottom:.9rem;box-shadow:var(--shadow)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem">
          <div>
            <div style="font-size:.9rem;font-weight:700">${r.name} · ${r.location}</div>
            <div style="font-size:.78rem;color:var(--g4)">From: ${r.brandName} · ${r.submittedAt}</div>
          </div>
          <div style="display:flex;gap:.5rem">
            <button class="tbl-action" onclick="approveTestimonialRequest('${r.id}')">Approve</button>
            <button class="tbl-action danger" onclick="rejectTestimonialRequest('${r.id}')">Reject</button>
          </div>
        </div>
        <div style="color:var(--accent-ink);font-size:.85rem;margin-bottom:.35rem">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        <div style="font-size:.875rem;color:var(--g5);line-height:1.6;font-style:italic">"${r.text}"</div>
      </div>
    `).join('');}
  }

  // Current testimonials list (admin only)
  const adminTestimEl=document.getElementById('admin-testimonials-list');
  if(adminTestimEl&&isAdmin){
    adminTestimEl.innerHTML=TESTIMONIALS.filter(t=>t.approved).map(t=>`
      <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;box-shadow:var(--shadow)">
        <div style="flex:1">
          <div style="font-size:.9rem;font-weight:700;margin-bottom:.2rem">${t.name} · ${t.location}</div>
          <div style="color:var(--accent-ink);font-size:.82rem;margin-bottom:.3rem">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div>
          <div style="font-size:.875rem;color:var(--g5);font-style:italic">"${t.text}"</div>
        </div>
        <button class="tbl-action danger" onclick="deleteTestimonial('${t.id}')">Delete</button>
      </div>
    `).join('')||'<div style="color:var(--g4);font-size:.875rem;padding:.5rem 0">No testimonials yet.</div>';
  }

  // Customer feedback
  const el=document.getElementById('feedback-list');
  if(!el)return;
  const feedbacks=JSON.parse(localStorage.getItem('lf_feedbacks')||'[]');
  if(!feedbacks.length){el.innerHTML='<div style="color:var(--g4);font-size:.875rem;padding:1rem">No feedback yet.</div>';return;}
  el.innerHTML=feedbacks.map((f,i)=>`
    <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.2rem;margin-bottom:.9rem;box-shadow:var(--shadow)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;flex-wrap:wrap;gap:.4rem">
        <div style="font-size:.95rem;font-weight:700">${f.name}</div>
        <div style="font-size:.75rem;color:var(--g4)">${f.time}</div>
      </div>
      <div style="margin-bottom:.5rem"><span style="font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:20px;background:${f.type==='complaint'?'#fee2e2':f.type==='compliment'?'#dcf5eb':f.type==='suggestion'?'#fef3c7':'var(--g2)'};color:${f.type==='complaint'?'#991b1b':f.type==='compliment'?'#076a35':f.type==='suggestion'?'#92400e':'var(--g5)'};text-transform:uppercase;letter-spacing:.06em">${f.type}</span></div>
      <div style="font-size:.875rem;color:var(--g5);line-height:1.6">${f.msg}</div>
    </div>
  `).join('');
}


function previewEvImgFromUrl(url) {
  const preview = document.getElementById('ev-preview');
  const area = document.getElementById('ev-upload-area');
  if (url && (url.startsWith('http') || url.startsWith('data:'))) {
    preview.src = url;
    preview.style.display = 'block';
    area.classList.add('has-image');
    preview.onerror = () => { preview.style.display = 'none'; area.classList.remove('has-image'); };
  } else {
    preview.src = '';
    preview.style.display = 'none';
    area.classList.remove('has-image');
  }
}

function adminUploadHero(input) {
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(currentMerchant?.id==='lostandfound'){const bg=document.querySelector('.home-hero-bg');if(bg)bg.style.backgroundImage=`url('${e.target.result}')`;localStorage.setItem('lf_admin_hero_bg',e.target.result);toast('Hero background updated!','success');}
    else submitForApproval('hero',e.target.result,null,'Hero Background');
  };
  reader.readAsDataURL(file);
}

function adminUploadMascot(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const m = document.getElementById('hero-mascot');
    if (m) { m.src = e.target.result; m.style.display = 'block'; }
    localStorage.setItem('lf_admin_mascot', e.target.result);
    toast('Mascot updated!', 'success');
  };
  reader.readAsDataURL(file);
}

function adminUploadLogo(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const logo = document.querySelector('.topbar-brand img');
    if (logo) { logo.src = e.target.result; logo.style.display = 'block'; }
    localStorage.setItem('lf_admin_logo', e.target.result);
    toast('Logo updated!', 'success');
  };
  reader.readAsDataURL(file);
}

function adminUploadCarousel(input,slideIdx) {
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(currentMerchant?.id==='lostandfound'){const slides=document.querySelectorAll('.carousel-slide .cs-bg');if(slides[slideIdx])slides[slideIdx].style.backgroundImage=`url('${e.target.result}')`;const saved=JSON.parse(localStorage.getItem('lf_admin_carousel')||'[]');saved[slideIdx]=e.target.result;localStorage.setItem('lf_admin_carousel',JSON.stringify(saved));toast('Carousel slide '+(slideIdx+1)+' updated!','success');}
    else submitForApproval('carousel',e.target.result,slideIdx,'Carousel Slide '+(slideIdx+1));
  };
  reader.readAsDataURL(file);
}

function adminUploadArrivalsBanner(input) {
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(currentMerchant?.id==='lostandfound'){const bg=document.querySelector('.arrivals-banner-bg');if(bg)bg.style.backgroundImage=`url('${e.target.result}')`;localStorage.setItem('lf_admin_arrivals_bg',e.target.result);toast('Arrivals banner updated!','success');}
    else submitForApproval('arrivals',e.target.result,null,'Arrivals Banner');
  };
  reader.readAsDataURL(file);
}

function adminUploadEventsBanner(input) {
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(currentMerchant?.id==='lostandfound'){const bg=document.querySelector('.events-banner-bg');if(bg)bg.style.backgroundImage=`url('${e.target.result}')`;localStorage.setItem('lf_admin_events_bg',e.target.result);toast('Events banner updated!','success');}
    else submitForApproval('events',e.target.result,null,'Events Banner');
  };
  reader.readAsDataURL(file);
}

function adminResetAllImages() {
  if (!confirm('Reset ALL custom images back to defaults?')) return;
  ['lf_admin_hero_bg','lf_admin_mascot','lf_admin_logo','lf_admin_carousel','lf_admin_arrivals_bg','lf_admin_events_bg'].forEach(k => localStorage.removeItem(k));
  toast('All images reset to defaults. Reload the page.', 'success');
  setTimeout(() => location.reload(), 1500);
}

function adminAddBrand(){
  const id=document.getElementById('nb-id').value.trim().toLowerCase().replace(/\s+/g,'');
  const name=document.getElementById('nb-name').value.trim();
  const tag=document.getElementById('nb-tag').value;
  const loc=document.getElementById('nb-loc').value.trim();
  const year=document.getElementById('nb-year').value.trim();
  const ig=document.getElementById('nb-ig').value.trim();
  const desc=document.getElementById('nb-desc').value.trim();
  const pass=document.getElementById('nb-pass').value;
  if(!id||!name){toast('Brand ID and Name are required','error');return;}
  if(BRANDS.find(b=>b.id===id)){toast('Brand ID already exists! Use a different ID.','error');return;}
  BRANDS.push({id,name,tag,desc,img:'',color:'#111',location:loc,year,schedule:'',instagram:ig,follows:0});
  MERCHANT_ACCOUNTS[id]=pass;
  persist();
  toast('Brand "'+name+'" added! They can now log in with password: '+pass,'success');
  ['nb-id','nb-name','nb-loc','nb-year','nb-ig','nb-desc'].forEach(x=>document.getElementById(x).value='');
  document.getElementById('nb-pass').value='';
  renderAdminBrandsList();
}

function adminDeleteBrand(brandId){
  const b=getBrand(brandId);
  if(!confirm('Delete brand "'+b.name+'"? This will also remove all their products!'))return;
  BRANDS=BRANDS.filter(x=>x.id!==brandId);
  PRODUCTS=PRODUCTS.filter(p=>p.brand!==brandId);
  delete MERCHANT_ACCOUNTS[brandId];
  persist();
  toast('Brand deleted','success');
  renderAdminBrandsList();
}

function renderAdminBrandsList(){
  const el=document.getElementById('admin-brands-list');
  if(!el)return;
  const list=BRANDS.filter(b=>b.id!=='admin');
  el.innerHTML=list.map(b=>{
    const count=PRODUCTS.filter(p=>p.brand===b.id).length;
    return `<div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;box-shadow:var(--shadow)">
      <div style="width:46px;height:46px;border-radius:10px;overflow:hidden;background:var(--g2);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--g4)">${b.img?`<img src="${b.img}" style="width:100%;height:100%;object-fit:cover">`:ICONS.tag}</div>
      <div style="flex:1;min-width:120px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:1.15rem">${b.name}</div>
        <div style="font-size:.78rem;color:var(--g4)">${b.id} · ${b.tag} · ${count} products · ${ICONS.mapPin} ${b.location||'Batangas'}</div>
      </div>
      <span style="font-size:.72rem;font-weight:700;padding:.22rem .75rem;border-radius:20px;background:var(--g1);border:1px solid var(--g2);color:var(--g5);text-transform:uppercase">${b.tag}</span>
      <button class="tbl-action danger" onclick="adminDeleteBrand('${b.id}')">Delete</button>
    </div>`;
  }).join('');
}

function applyAdminImages() {
  const hero = localStorage.getItem('lf_admin_hero_bg');
  if (hero) { const bg = document.querySelector('.home-hero-bg'); if (bg) bg.style.backgroundImage = `url('${hero}')`; }

  const mascot = localStorage.getItem('lf_admin_mascot');
  if (mascot) { const m = document.getElementById('hero-mascot'); if (m) { m.src = mascot; m.style.display = 'block'; } }

  const logo = localStorage.getItem('lf_admin_logo');
  if (logo) { const l = document.querySelector('.topbar-brand img'); if (l) { l.src = logo; l.style.display = 'block'; } }

  const carousel = JSON.parse(localStorage.getItem('lf_admin_carousel') || '[]');
  const slides = document.querySelectorAll('.carousel-slide .cs-bg');
  carousel.forEach((src, i) => { if (src && slides[i]) slides[i].style.backgroundImage = `url('${src}')`; });

  const arrivals = localStorage.getItem('lf_admin_arrivals_bg');
  if (arrivals) { const bg = document.querySelector('.arrivals-banner-bg'); if (bg) bg.style.backgroundImage = `url('${arrivals}')`; }

  const eventsBg = localStorage.getItem('lf_admin_events_bg');
  if (eventsBg) { const bg = document.querySelector('.events-banner-bg'); if (bg) bg.style.backgroundImage = `url('${eventsBg}')`; }
}
````

### 11.7 `Schema.sql`  (256 lines)

````sql
-- ============================================================
-- Lost & Found — Flea Market Batangas
-- Database schema + seed data
-- Import this in phpMyAdmin (XAMPP) BEFORE anything else.
--
-- If you already imported an earlier version of this schema,
-- just run this one line instead of re-importing everything:
--   ALTER TABLE products ADD COLUMN original_price VARCHAR(50) NULL AFTER price;
-- ============================================================

CREATE DATABASE IF NOT EXISTS lostfound CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lostfound;

-- ---------- BRANDS ----------
CREATE TABLE brands (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  tag VARCHAR(50),
  description TEXT,
  img TEXT,
  color VARCHAR(20),
  location VARCHAR(150),
  year VARCHAR(10),
  schedule VARCHAR(150),
  instagram VARCHAR(100),
  follows INT DEFAULT 0,
  password VARCHAR(255) NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- PRODUCTS ----------
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand_id VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  tag VARCHAR(100),
  price VARCHAR(50) NOT NULL,
  original_price VARCHAR(50) NULL,
  size VARCHAR(100),
  img TEXT,
  imgs JSON,
  is_new TINYINT(1) DEFAULT 0,
  stock INT DEFAULT 0,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- ORDERS ----------
CREATE TABLE orders (
  id VARCHAR(30) PRIMARY KEY,
  customer_name VARCHAR(150),
  email VARCHAR(150),
  phone VARCHAR(50),
  address TEXT,
  pay_method VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  tracking_number VARCHAR(50),
  subtotal DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  date_placed VARCHAR(50),
  timeline JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(30) NOT NULL,
  product_id INT,
  brand_id VARCHAR(50),
  name VARCHAR(200),
  price VARCHAR(50),
  qty INT DEFAULT 1,
  size VARCHAR(100),
  img TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE order_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(30) NOT NULL,
  role ENUM('merchant','customer') NOT NULL,
  text TEXT,
  time VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- REVIEWS ----------
CREATE TABLE reviews (
  id VARCHAR(30) PRIMARY KEY,
  product_id INT NOT NULL,
  author VARCHAR(150),
  rating INT,
  text TEXT,
  img TEXT,
  date VARCHAR(50),
  merchant_reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- TESTIMONIALS ----------
CREATE TABLE testimonials (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(150),
  location VARCHAR(150),
  rating INT,
  text TEXT,
  avatar VARCHAR(10),
  approved TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE testimonial_requests (
  id VARCHAR(30) PRIMARY KEY,
  brand_id VARCHAR(50),
  brand_name VARCHAR(150),
  name VARCHAR(150),
  location VARCHAR(150),
  rating INT,
  text TEXT,
  avatar VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending',
  submitted_at VARCHAR(50)
) ENGINE=InnoDB;

-- ---------- NOTIFICATIONS ----------
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  audience ENUM('customer','merchant') NOT NULL,
  merchant_id VARCHAR(50) NULL,
  icon TEXT,
  text TEXT,
  target VARCHAR(50) NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- PENDING IMAGE APPROVALS ----------
CREATE TABLE pending_images (
  id VARCHAR(30) PRIMARY KEY,
  merchant_id VARCHAR(50),
  merchant_name VARCHAR(150),
  type VARCHAR(30),
  image_data LONGTEXT,
  target_index INT NULL,
  label VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  submitted_at VARCHAR(50)
) ENGINE=InnoDB;

-- ---------- EVENTS ----------
CREATE TABLE events (
  id VARCHAR(30) PRIMARY KEY,
  brand_id VARCHAR(50),
  title VARCHAR(200),
  event_date DATE,
  event_time VARCHAR(50),
  location VARCHAR(200),
  description TEXT,
  img TEXT,
  posted_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE event_interests (
  event_id VARCHAR(30) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  PRIMARY KEY (event_id, session_id)
) ENGINE=InnoDB;

-- ---------- FEEDBACK ----------
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  type VARCHAR(30),
  msg TEXT,
  time VARCHAR(50)
) ENGINE=InnoDB;

-- ---------- SITE SETTINGS (hero/mascot/logo/carousel/banners + admin login) ----------
CREATE TABLE site_settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value LONGTEXT
) ENGINE=InnoDB;

-- No admin account is seeded. Run backend/setup.php once to create
-- your own admin username and password (stored as a bcrypt hash).


-- ============================================================
-- SEED DATA — matches the DEFAULT_BRANDS / DEFAULT_PRODUCTS
-- currently hard-coded in lostandfound.js, so the live site
-- looks identical on day one. Merchant passwords are NOT seeded:
-- backend/setup.php gives each merchant a random temporary password
-- that must be changed on first login.
-- ============================================================

INSERT INTO brands (id,name,tag,description,img,color,location,year,schedule,instagram,follows,password) VALUES
('lostandfound','Lost & Found','admin','Lost & Found system administrator. Full access to all merchants, products, orders, and settings.','brand pics/logolostandfound.jpg','#0c0b09','Batangas','','', '', 0,NULL),
('geckoman','Geckoman','hat','Quality caps and headwear for every style. Hats only — snapbacks, buckets, truckers & more.','brand pics/gecko.jpg','#1a0a00','Batangas','2021','Every Saturday, 8AM–5PM','@geckoman_ph',142,NULL),
('hooksnloops','Hooks n Loops','crochet','Crochet items and so much more! Bags, accessories, stuffed toys & handmade creations by Batangas locals.','brand pics/Hooks  Loops.jpg','#0a1a0a','Batangas','2022','Weekends','@hooksnloops',98,NULL),
('outhrift','Outhrift','thrift','Curated vintage tees, hoodies, and streetwear at affordable prices. Hand-picked thrift finds — tshirts, hoodies, jackets & more.','brand pics/outhrift.jpg','#001a0a','Batangas','2020','Every Weekend, 9AM–6PM','@outhrift',318,NULL),
('10thrift','10 Thrift','thrift','Affordable thrift finds, hand-picked weekly from local bazaars and ukay-ukay. Tops, bottoms, outerwear & more.','brand pics/10thrift.jpg','#0a0a1a','Batangas','2020','Every Saturday','@10thrift',187,NULL),
('chasingscents','Chasing Scents','perfume','Premium perfumes and niche fragrances. Wide selection of EDP, EDT, and body mists at great prices.','brand pics/chasingscents.jpg','#1a001a','Batangas','2022','Weekends, 10AM–5PM','@chasingscentsph',256,NULL),
('beadsunstoppable','Beads Unstoppable','thrift','Beads Unstoppable — quality thrift pieces at unbeatable prices. Tops, bottoms, outerwear & more.','brand pics/greatdilemma.jpg','#1a1a00','Batangas','2022','Sundays, 8AM–4PM','@beadsunstoppable',98,NULL),
('zero4thrift','Zero4Thrift','thrift','Fresh thrift drops every week. Tops, bottoms, outerwear & more at zero-budget prices.','brand pics/zero4thrift.jpg','#0a0010','Batangas','2021','Weekends','@zero4thrift',134,NULL),
('kriztianothrift','Kriztiano Thrift','thrift','Kriztiano Thrift — your go-to for affordable pre-loved fashion finds in Batangas.','brand pics/kriztianothrift.jpg','#1a0800','Batangas','2023','Every Weekend','@kriztianothrift',77,NULL),
('perfumesbatangas','Arranged by Annita','aniknik','Arranged by Annita — beautiful handcrafted bouquets and floral arrangements for every occasion.','brand pics/Perfumes Batangas by Arashi.jpg','#1a000a','Batangas','2022','Weekends','@arrangedbyannita',201,NULL),
('selahessentials','Selah Essentials','perfume','Carefully curated essential perfumes and scents. Calm your senses with Selah.','brand pics/Selah Essentials.jpg','#001010','Batangas','2023','Weekends','@selahessentials',88,NULL),
('thriftthread','Thrift Thread','thrift','Thrift Thread — curated pre-loved fashion finds for the budget-conscious fashionista in Batangas.','brand pics/Fivis Thrift.jpg','#0a1000','Batangas','2021','Every Weekend','@thriftthread',145,NULL),
('soltheminishop','Sol The Mini Shop','aniknik','Your neighborhood anik-anik shop! Collectibles, cute finds, accessories, novelty items & lifestyle products.','brand pics/soltheminishop.jpg','#10001a','Batangas','2023','Weekends','@soltheminishop',109,NULL),
('daveskybiker','Daveskybiker 3D Printing','3dprint','3D printing services for students, schools, creators & local businesses. Powered by Bambu Lab P2S, A1 & Elegoo Centauri Carbon.','brand pics/Daveskybiker 3D Printing.jpg','#001020','Batangas','2022','Order anytime, pickup on market days','@daveskybiker',77,NULL);

INSERT INTO products (id,brand_id,name,tag,price,original_price,size,img,imgs,is_new,stock,views) VALUES
(1,'geckoman','Bass Pro','Hat','699',NULL,'56-58cm','products for gecko/BASS PRO.jfif',JSON_ARRAY('products for gecko/BASS PRO.jfif'),1,15,142),
(2,'geckoman','Dont Trip','Hat','645',NULL,'57-59cm','products for gecko/DONT PIRT.jfif',JSON_ARRAY('products for gecko/DONT PIRT.jfif'),1,8,98),
(3,'geckoman','Supreme','Hat','795',NULL,'Adjustable','products for gecko/SUPREME.jfif',JSON_ARRAY('products for gecko/SUPREME.jfif'),0,14,76),
(4,'geckoman','Wake N Bake','Hat','695',NULL,'Adjustable','products for gecko/WAKE  N BAKE.jfif',JSON_ARRAY('products for gecko/WAKE  N BAKE.jfif'),1,6,55),
(5,'hooksnloops','Mera Mera no Mi','KeyChain','480',NULL,'12cm','products for hooks/in-love-with-a-boy-so-i-crocheted-him-a-mera-mera-no-mi-v0-ags6ibjlvgug1-removebg-preview.png',JSON_ARRAY('products for hooks/in-love-with-a-boy-so-i-crocheted-him-a-mera-mera-no-mi-v0-ags6ibjlvgug1-removebg-preview.png'),1,7,88),
(6,'hooksnloops','Baby Totoro','KeyChain','320',NULL,'Adjustable','products for hooks/Baby_Totoro_Keychains-removebg-preview.png',JSON_ARRAY('products for hooks/Baby_Totoro_Keychains-removebg-preview.png'),1,5,72),
(7,'hooksnloops','Mr Bean Teddy','Toy','250',NULL,'10cm','products for hooks/Mr._Bean_Teddy_handmade_crochet_keychain-removebg-preview.png',JSON_ARRAY('products for hooks/Mr._Bean_Teddy_handmade_crochet_keychain-removebg-preview.png'),0,12,44),
(8,'outhrift','Vintage Tee — Washed','Top','350','450','L','https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=500'),1,5,203),
(9,'outhrift','Oversized Hoodie','Top','650',NULL,'XL','https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=500'),0,12,87),
(10,'outhrift','Graphic Band Tee','Top','280',NULL,'M','https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=500'),1,2,158),
(11,'10thrift','Denim Jacket Raw','Outerwear','780',NULL,'M','products for 10thrift/acme.jpg',JSON_ARRAY('products for 10thrift/acme.jpg'),0,6,134),
(12,'10thrift','Y2K Cargo Pants','Bottoms','520',NULL,'32','products for 10thrift/loewe.jpg',JSON_ARRAY('products for 10thrift/loewe.jpg'),1,9,175),
(13,'10thrift','Windbreaker Jacket','Outerwear','920',NULL,'L','products for 10thrift/harley.jpg',JSON_ARRAY('products for 10thrift/harley.jpg'),1,3,143),
(14,'chasingscents','Midnight Bloom EDP','Perfume','850',NULL,'30ml','https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500'),1,20,310),
(15,'chasingscents','Cedar & Oud','Perfume','1200',NULL,'50ml','https://images.unsplash.com/photo-1588776814546-1ffbb74cc0b7?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1588776814546-1ffbb74cc0b7?q=80&w=500'),0,7,188),
(17,'beadsunstoppable','necklace','Top','480',NULL,'M','products for beads unstoppable/6390f4de-243e-4c03-b7ab-74af4318c9b0.jfif',JSON_ARRAY('products for beads unstoppable/6390f4de-243e-4c03-b7ab-74af4318c9b0.jfif'),0,11,92),
(34,'beadsunstoppable','bracelet','Bottoms','580',NULL,'30','products for beads unstoppable/necklace.jfif',JSON_ARRAY('products for beads unstoppable/necklace.jfif'),1,5,112),
(18,'zero4thrift','Washed Polo Shirt','Top','220',NULL,'L','products for zero4thrift/cahmps.jpg',JSON_ARRAY('products for zero4thrift/cahmps.jpg'),1,8,66),
(19,'zero4thrift','Vintage Crewneck','Top','350',NULL,'M','products for zero4thrift/vntg.jpg',JSON_ARRAY('products for zero4thrift/vntg.jpg'),0,4,54),
(20,'kriztianothrift','Balenciaga Polo','Top','380',NULL,'M/L','products for kriztiano/balen.jfif',JSON_ARRAY('products for kriztiano/balen.jfif'),1,6,89),
(21,'kriztianothrift','Vintage Graphic Hoodie','Top','490',NULL,'L','products for kriztiano/vntg wres.jfif',JSON_ARRAY('products for kriztiano/vntg wres.jfif'),0,4,67),
(22,'perfumesbatangas','Classic Rose Bouquet','Bouquet','750',NULL,'Medium','https://images.unsplash.com/photo-1487530811015-780780d13b82?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1487530811015-780780d13b82?q=80&w=500'),1,15,231),
(23,'perfumesbatangas','Sunflower Arrangement','Bouquet','450',NULL,'Small','https://images.unsplash.com/photo-1490750967868-88df5691cc4a?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1490750967868-88df5691cc4a?q=80&w=500'),0,18,144),
(24,'selahessentials','Selah Rose & Musk','Perfume','580',NULL,'50ml','https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=500'),1,12,88),
(25,'selahessentials','Selah Amber Collection','Perfume','650',NULL,'30ml','https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500'),0,9,71),
(26,'thriftthread','Vintage Oversized Jacket','Outerwear','620',NULL,'L','products for thrift thread/ae104824-0b70-468c-a40a-2e3b7d60e493.jfif',JSON_ARRAY('products for thrift thread/ae104824-0b70-468c-a40a-2e3b7d60e493.jfif'),1,4,101),
(27,'thriftthread','Thrift Graphic Tee','Top','260',NULL,'M','products for thrift thread/stuss.jfif',JSON_ARRAY('products for thrift thread/stuss.jfif'),0,8,74),
(28,'soltheminishop','Enamel Pin Collection','Anik-anik','120',NULL,'One size','https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600'),1,30,177),
(29,'soltheminishop','Mini Keychain Set','Anik-anik','95',NULL,'One size','https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600'),0,25,88),
(30,'soltheminishop','Novelty Sticker Pack','Anik-anik','75',NULL,'One size','https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600'),1,40,112),
(31,'daveskybiker','Custom 3D Print (Small)','3D Print','150',NULL,'Custom','https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600'),1,99,143),
(32,'daveskybiker','Engineering Part Prototype','3D Print','350',NULL,'Custom','https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600'),0,99,88),
(33,'daveskybiker','Custom 3D Print (Large)','3D Print','650','850','Custom','https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600'),1,99,65);

-- keep future auto-inserted products from colliding with the seeded IDs above
ALTER TABLE products AUTO_INCREMENT = 100;

INSERT INTO testimonials (id,name,location,rating,text,avatar,approved) VALUES
('t1','Mika Santos','Lipa, Batangas',5,'Got a gorgeous vintage tee from Outhrift — came super fast and quality was amazing! Will definitely order again.','MS',1),
('t2','Jake Reyes','Batangas City',5,'The snapback from Geckoman fits perfectly. Best cap I''ve bought! Great quality and fast shipping.','JR',1),
('t3','Camille Cruz','Tanauan',4,'Chasing Scents has the best selections. Midnight Bloom is now my everyday scent!','CC',1),
('t4','Renz Villanueva','Nasugbu',5,'Sol The Mini Shop has the cutest anik-anik finds! Got a whole set of enamel pins. Supporting local Batangas brands has never been this easy!','RV',1);
````

### 11.8 `Schema_update.sql`  (51 lines)

````sql
-- ============================================================
-- Schema_update.sql — upgrades an EXISTING `lostfound` database.
-- Safe to run more than once. Deletes NO brands, products or orders.
--
-- HOW: phpMyAdmin → click the `lostfound` database on the left →
--      Import → choose this file → Go.
--
-- Written for XAMPP's MariaDB (ADD COLUMN IF NOT EXISTS).
-- On a host running MySQL 8 where this syntax errors, skip this
-- file: backend/setup.php performs exactly the same upgrade.
-- ============================================================

-- 1) Login throttling (5 failed attempts → 10-minute lockout)
CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  login_key VARCHAR(160) NOT NULL,
  ip VARCHAR(45) NULL,
  attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_key_time (login_key, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Merchant passwords: no default value any more + forced change flag
ALTER TABLE brands MODIFY password VARCHAR(255) NULL DEFAULT NULL;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) NOT NULL DEFAULT 0 AFTER password;

-- 3) Anonymous visitor id so customers only see THEIR orders,
--    notifications and reviews (no customer accounts in this app)
ALTER TABLE orders        ADD COLUMN IF NOT EXISTS session_id VARCHAR(100) NULL AFTER id;
ALTER TABLE reviews       ADD COLUMN IF NOT EXISTS session_id VARCHAR(100) NULL AFTER product_id;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS session_id VARCHAR(100) NULL AFTER merchant_id;
CREATE INDEX IF NOT EXISTS idx_orders_session  ON orders (session_id);
CREATE INDEX IF NOT EXISTS idx_reviews_session ON reviews (session_id);
CREATE INDEX IF NOT EXISTS idx_notif_session   ON notifications (audience, session_id);

-- 4) Event approval (existing events stay live as 'approved')
ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'approved' AFTER img;
CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);

-- 5) Disable every plain-text password (e.g. the old demo seeds).
--    Those merchants get a random temporary password from setup.php.
UPDATE brands SET password = NULL, must_change_password = 1
 WHERE password IS NOT NULL AND password NOT LIKE '$2%';

-- 6) The Lost & Found admin brand never logs in as a merchant
UPDATE brands SET password = NULL, must_change_password = 0 WHERE id = 'lostandfound';

-- 7) Remove the old public demo admin hash (from the original Schema.sql
--    and fix-admin-login.sql). Your real admin is created by setup.php.
DELETE FROM site_settings
 WHERE setting_key = 'admin_password'
   AND setting_value = '$2y$10$HOCOrE2WBpvkXQIw5//q2udSuOvIsprd2wPPKruttd4S67Gt0hgji';
````

### 11.9 `Schema_password_log.sql`  (22 lines)

````sql
-- ============================================================
-- Schema_password_log.sql — OPTIONAL.
-- backend/Account.php creates this table automatically the first
-- time someone opens the Security tab or changes a password.
-- Import this only if you want to create it by hand.
-- phpMyAdmin → click `lostfound` → Import → this file → Go.
-- ============================================================
CREATE TABLE IF NOT EXISTS password_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_type ENUM('merchant','admin') NOT NULL,   -- who changed it
  account_id VARCHAR(50) NOT NULL,                  -- brand id, or 'lostandfound' for the admin
  reason VARCHAR(20) NOT NULL DEFAULT 'voluntary',  -- 'first_login' (temporary password) or 'voluntary'
  ip VARCHAR(45) NULL,                              -- IP address of the computer used
  user_agent VARCHAR(255) NULL,                     -- browser used
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pwc_account (account_type, account_id, changed_at)
) ENGINE=InnoDB;

-- Handy queries to see the history in phpMyAdmin (SQL tab):
--   SELECT * FROM password_changes ORDER BY changed_at DESC;
--   SELECT id, name, must_change_password FROM brands;
--   SELECT text, created_at FROM notifications WHERE text LIKE '%password%' ORDER BY id DESC;
````

### 11.10 `backend/.htaccess`  (15 lines)

````apache
# ============================================================
# backend/.htaccess — only Api.php (and setup.php until you
# delete it) may be opened from a browser.
# ============================================================
Options -Indexes

<FilesMatch "^(Config|Security|config\.local|config\.local\.example)\.php$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</FilesMatch>
````

### 11.11 `backend/Config.php`  (221 lines)

````php
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
````

### 11.12 `backend/Security.php`  (246 lines)

````php
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
````

### 11.13 `backend/Api.php`  (994 lines)

````php
<?php
// ============================================================
// Api.php — single-entry REST-style API for Lost & Found.
//   backend/Api.php?resource=...&id=...&action=...
//
// Same resources, actions and JSON shapes that backend/Sync.js
// already expects, but every permission is enforced HERE on the
// server using the PHP session — never what the browser claims.
//
//   Customers  : browse, checkout, reviews, feedback, event interest
//   Merchants  : ONLY their own brand's products/orders/reviews/events
//   Admin      : everything + approvals + site settings
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');
lf_send_cors_headers();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

set_exception_handler(function ($e) {
    error_log('[lostfound] ' . $e->getMessage());
    $out = ['error' => 'Server error. Please try again.'];
    if (lf_config()['show_db_errors']) $out['detail'] = $e->getMessage();
    respond($out, 500);
});

lf_start_session();

try {
    $pdo = lf_db();
} catch (PDOException $e) {
    respond(['error' => 'Cannot connect to the database. Start MySQL in XAMPP and check that the database was imported.'], 503);
}

$resource = (string)($_GET['resource'] ?? '');
$id       = isset($_GET['id']) && $_GET['id'] !== '' ? (string)$_GET['id'] : null;
$action   = isset($_GET['action']) && $_GET['action'] !== '' ? (string)$_GET['action'] : null;
$method   = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// 1) CSRF + origin check for every POST/PUT/DELETE
requireCsrf();

// 2) Accounts with a temporary password may do nothing but change it
if (isLoggedIn() && mustChangePassword() && $method !== 'GET'
    && !($resource === 'auth' && in_array($action, ['change_password', 'logout'], true))) {
    respond(['error' => 'Please change your temporary password first.', 'code' => 'must_change_password'], 403);
}

switch ($resource) {
    case 'auth':                 handleAuth($pdo, $method, $action); break;
    case 'brands':               handleBrands($pdo, $method, $id); break;
    case 'products':             handleProducts($pdo, $method, $id, $action); break;
    case 'orders':               handleOrders($pdo, $method, $id, $action); break;
    case 'reviews':              handleReviews($pdo, $method, $id, $action); break;
    case 'testimonials':         handleTestimonials($pdo, $method, $id); break;
    case 'testimonial_requests': handleTestimonialRequests($pdo, $method, $id, $action); break;
    case 'notifications':        handleNotifications($pdo, $method, $id); break;
    case 'pending_images':       handlePendingImages($pdo, $method, $id, $action); break;
    case 'events':               handleEvents($pdo, $method, $id, $action); break;
    case 'event_interests':      handleEventInterests($pdo, $method); break;
    case 'feedback':             handleFeedback($pdo, $method); break;
    case 'settings':             handleSettings($pdo, $method); break;
    case 'upload':               handleUpload($method); break;
    default: respond(['error' => 'Unknown resource'], 404);
}

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════
function loginSuccess(string $merchantId, bool $isAdmin, bool $mustChange): void {
    session_regenerate_id(true);                 // prevent session fixation
    $_SESSION['merchant_id'] = $merchantId;
    $_SESSION['is_admin']    = $isAdmin;
    $_SESSION['must_change'] = $mustChange;
    $_SESSION['login_at']    = time();
    $token = rotateCsrfToken();
    respond(['ok' => true, 'isAdmin' => $isAdmin, 'merchantId' => $merchantId,
             'mustChangePassword' => $mustChange, 'csrfToken' => $token]);
}

function lockedResponse(int $sec): void {
    $min = max(1, (int)ceil($sec / 60));
    respond(['ok' => false, 'locked' => true,
             'error' => "Too many failed attempts. Try again in $min minute" . ($min > 1 ? 's' : '') . '.'], 429);
}

function handleAuth(PDO $pdo, string $method, ?string $action): void {
    if ($method === 'GET' && $action === 'check') {
        respond([
            'loggedIn'           => isLoggedIn(),
            'isAdmin'            => isLoggedInAsAdmin(),
            'merchantId'         => currentMerchantId(),
            'mustChangePassword' => isLoggedIn() && mustChangePassword(),
            'csrfToken'          => csrfToken(),
            'setupRequired'      => !adminExists($pdo),
        ]);
    }

    if ($method === 'POST' && $action === 'admin_login') {
        $b    = input();
        $user = substr(trim((string)($b['username'] ?? '')), 0, 100);
        $pass = (string)($b['password'] ?? '');
        $key  = 'admin:' . strtolower($user);

        if (!adminExists($pdo)) respond(['ok' => false, 'error' => 'Admin account not set up yet. Open backend/setup.php first.'], 503);
        if ($sec = loginLockRemaining($pdo, $key)) lockedResponse($sec);

        $st = $pdo->prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('admin_username','admin_password')");
        $st->execute();
        $cred = [];
        foreach ($st->fetchAll() as $r) $cred[$r['setting_key']] = $r['setting_value'];

        $ok = $user !== '' && hash_equals((string)($cred['admin_username'] ?? ''), $user)
              && verifyPassword($pass, $cred['admin_password'] ?? null);
        if (!$ok) {
            recordLoginFailure($pdo, $key);
            if ($sec = loginLockRemaining($pdo, $key)) lockedResponse($sec);
            respond(['ok' => false, 'error' => 'Incorrect username or password.'], 401);
        }
        if (isBannedPassword($pass)) {
            respond(['ok' => false, 'error' => 'The old default admin password is disabled. Run backend/setup.php to create your own admin login.'], 403);
        }
        clearLoginFailures($pdo, $key);
        loginSuccess('lostandfound', true, false);
    }

    if ($method === 'POST' && $action === 'merchant_login') {
        $b       = input();
        $brandId = strtolower(substr(trim((string)($b['brandId'] ?? '')), 0, 50));
        $pass    = (string)($b['password'] ?? '');
        $key     = 'merchant:' . $brandId;

        if ($sec = loginLockRemaining($pdo, $key)) lockedResponse($sec);

        $row = false;
        if ($brandId !== '' && $brandId !== 'lostandfound') {        // admin brand can't log in as a merchant
            $st = $pdo->prepare("SELECT password, must_change_password FROM brands WHERE id=?");
            $st->execute([$brandId]);
            $row = $st->fetch();
        }
        if (!$row || !verifyPassword($pass, $row['password'])) {
            recordLoginFailure($pdo, $key);
            if ($sec = loginLockRemaining($pdo, $key)) lockedResponse($sec);
            respond(['ok' => false, 'error' => 'Incorrect brand or password.'], 401);
        }
        if (isBannedPassword($pass)) {
            respond(['ok' => false, 'error' => 'This default password is disabled. Ask the admin for your temporary password.'], 403);
        }
        clearLoginFailures($pdo, $key);
        loginSuccess($brandId, false, (bool)$row['must_change_password']);
    }

    if ($method === 'POST' && $action === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', ['expires' => time() - 42000, 'path' => $p['path'], 'domain' => $p['domain'],
                                           'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Lax']);
        }
        session_destroy();
        respond(['ok' => true]);
    }

    if ($method === 'POST' && $action === 'change_password') {
        requireLogin();
        $b   = input();
        $cur = (string)($b['currentPassword'] ?? '');
        $new = (string)($b['newPassword'] ?? '');
        if ($err = passwordStrengthError($new)) respond(['ok' => false, 'error' => $err], 400);
        if ($cur === $new) respond(['ok' => false, 'error' => 'New password must be different from the current one.'], 400);

        if (isLoggedInAsAdmin()) {
            $st = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key='admin_password'");
            $st->execute();
            if (!verifyPassword($cur, $st->fetchColumn() ?: null)) respond(['ok' => false, 'error' => 'Current password is incorrect.'], 400);
            $pdo->prepare("UPDATE site_settings SET setting_value=? WHERE setting_key='admin_password'")->execute([hashPassword($new)]);
        } else {
            $mid = currentMerchantId();
            $st  = $pdo->prepare("SELECT password FROM brands WHERE id=?");
            $st->execute([$mid]);
            if (!verifyPassword($cur, $st->fetchColumn() ?: null)) respond(['ok' => false, 'error' => 'Current password is incorrect.'], 400);
            $pdo->prepare("UPDATE brands SET password=?, must_change_password=0 WHERE id=?")->execute([hashPassword($new), $mid]);
        }
        session_regenerate_id(true);
        $_SESSION['must_change'] = false;
        respond(['ok' => true, 'csrfToken' => rotateCsrfToken(), 'mustChangePassword' => false]);
    }

    respond(['error' => 'Unknown auth action'], 400);
}

// ════════════════════════════════════════════════════════════
// BRANDS
// ════════════════════════════════════════════════════════════
function mapBrandRow(array $r): array {
    return [
        'id' => $r['id'], 'name' => $r['name'], 'tag' => $r['tag'],
        'desc' => $r['description'], 'img' => $r['img'], 'color' => $r['color'],
        'location' => $r['location'], 'year' => $r['year'], 'schedule' => $r['schedule'],
        'instagram' => $r['instagram'], 'follows' => (int)$r['follows'],
    ];
}

function handleBrands(PDO $pdo, string $method, ?string $id): void {
    if ($method === 'GET') {
        $rows = $pdo->query("SELECT id,name,tag,description,img,color,location,year,schedule,instagram,follows
                             FROM brands ORDER BY FIELD(id,'lostandfound') DESC, name ASC")->fetchAll();
        respond(array_map('mapBrandRow', $rows));
    }

    if ($method === 'POST') {
        requireAdmin();
        $b     = input();
        $newId = cleanBrandId($b['id'] ?? '');
        $name  = requireText($b, 'name', 'Brand name', 150);
        $pass  = (string)($b['password'] ?? '');
        if ($pass === '') respond(['error' => 'Enter a password for this merchant.'], 400);
        if ($err = passwordStrengthError($pass)) respond(['error' => $err], 400);

        $check = $pdo->prepare("SELECT 1 FROM brands WHERE id=?");
        $check->execute([$newId]);
        if ($check->fetch()) respond(['error' => 'Brand ID already exists. Use a different ID.'], 409);

        $pdo->prepare("INSERT INTO brands (id,name,tag,description,img,color,location,year,schedule,instagram,follows,password,must_change_password)
                       VALUES (?,?,?,?,?,?,?,?,?,?,0,?,1)")
            ->execute([
                $newId, $name, cleanText($b['tag'] ?? 'thrift', 50) ?: 'thrift', cleanText($b['desc'] ?? '', 2000, true),
                '', '#111', cleanText($b['location'] ?? '', 150), cleanText($b['year'] ?? '', 10), '',
                cleanText($b['instagram'] ?? '', 100), hashPassword($pass),
            ]);
        respond(['id' => $newId], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);

    if ($method === 'PUT') {
        requireLogin();
        requireOwnerOrAdmin($id);
        $st = $pdo->prepare("SELECT * FROM brands WHERE id=?");
        $st->execute([$id]);
        $cur = $st->fetch();
        if (!$cur) respond(['error' => 'Brand not found'], 404);

        $b = input();
        // empty name/tag/desc/img keep the current value (same behaviour as before)
        $name = array_key_exists('name', $b) ? (cleanText($b['name'], 150) ?: $cur['name']) : $cur['name'];
        $tag  = array_key_exists('tag',  $b) ? (cleanText($b['tag'], 50) ?: $cur['tag']) : $cur['tag'];
        $desc = array_key_exists('desc', $b) ? (cleanText($b['desc'], 2000, true) ?: $cur['description']) : $cur['description'];
        $img  = $cur['img'];
        if (array_key_exists('img', $b) && trim((string)$b['img']) !== '') {
            $img = (trim((string)$b['img']) === (string)$cur['img']) ? $cur['img'] : cleanImageRef($b['img'], 'Brand image');
        }
        $loc   = array_key_exists('location',  $b) ? cleanText($b['location'], 150)  : $cur['location'];
        $year  = array_key_exists('year',      $b) ? cleanText($b['year'], 10)       : $cur['year'];
        $ig    = array_key_exists('instagram', $b) ? cleanText($b['instagram'], 100) : $cur['instagram'];
        $sched = array_key_exists('schedule',  $b) ? cleanText($b['schedule'], 150)  : $cur['schedule'];

        $pdo->prepare("UPDATE brands SET name=?,tag=?,description=?,img=?,location=?,year=?,instagram=?,schedule=? WHERE id=?")
            ->execute([$name, $tag, $desc, $img, $loc, $year, $ig, $sched, $id]);
        respond(['ok' => true]);
    }

    if ($method === 'DELETE') {
        requireAdmin();
        if ($id === 'lostandfound') respond(['error' => 'The Lost & Found admin brand cannot be deleted.'], 400);
        $pdo->prepare("DELETE FROM brands WHERE id=?")->execute([$id]);
        respond(['ok' => true]);
    }

    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════════════════════════
function mapProductRow(array $r): array {
    return [
        'id' => (int)$r['id'], 'brand' => $r['brand_id'], 'name' => $r['name'],
        'tag' => $r['tag'], 'price' => is_numeric($r['price']) ? (float)$r['price'] : $r['price'],
        'size' => $r['size'], 'img' => $r['img'],
        'imgs' => $r['imgs'] ? (json_decode($r['imgs'], true) ?: []) : [],
        'originalPrice' => ($r['original_price'] !== null && $r['original_price'] !== '')
            ? (is_numeric($r['original_price']) ? (float)$r['original_price'] : $r['original_price']) : null,
        'new' => (bool)$r['is_new'], 'stock' => (int)$r['stock'], 'views' => (int)$r['views'],
    ];
}

/** Validates the product fields shared by create and edit. */
function productFields(array $b, ?array $current = null): array {
    $imgs = [];
    $oldImgs = $current && $current['imgs'] ? (json_decode($current['imgs'], true) ?: []) : [];
    foreach (array_slice((array)($b['imgs'] ?? []), 0, 5) as $im) {
        $im = trim((string)$im);
        if ($im === '') continue;
        // images that are already saved on this product are kept as-is
        $imgs[] = in_array($im, $oldImgs, true) ? $im : cleanImageRef($im, 'Product image');
    }
    $img = trim((string)($b['img'] ?? ''));
    if ($img !== '' && !in_array($img, $imgs, true) && !($current && $img === $current['img'])) $img = cleanImageRef($img, 'Product image');
    if ($img === '' && $imgs) $img = $imgs[0];
    if ($img !== '' && !$imgs) $imgs = [$img];

    return [
        'name'  => requireText($b, 'name', 'Product name', 200),
        'tag'   => requireText($b, 'tag', 'Tag', 100),
        'size'  => requireText($b, 'size', 'Size', 100),
        'price' => cleanMoney($b['price'] ?? null, 'Price'),
        'orig'  => cleanMoney($b['originalPrice'] ?? null, 'Original price', false),
        'stock' => cleanInt($b['stock'] ?? 0, 0, 100000, 'Stock'),
        'img'   => $img,
        'imgs'  => json_encode(array_values($imgs), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    ];
}

function handleProducts(PDO $pdo, string $method, ?string $id, ?string $action): void {
    if ($method === 'GET') {
        $rows = $pdo->query("SELECT * FROM products ORDER BY id ASC")->fetchAll();
        respond(array_map('mapProductRow', $rows));
    }

    if ($method === 'POST' && !$id) {
        requireLogin();
        $b     = input();
        $brand = isLoggedInAsAdmin() ? strtolower(trim((string)($b['brand'] ?? 'lostandfound'))) : currentMerchantId();
        requireOwnerOrAdmin($brand);
        $chk = $pdo->prepare("SELECT 1 FROM brands WHERE id=?");
        $chk->execute([$brand]);
        if (!$chk->fetch()) respond(['error' => 'Brand not found'], 404);

        $f = productFields($b);
        $pdo->prepare("INSERT INTO products (brand_id,name,tag,price,size,img,imgs,original_price,is_new,stock,views)
                       VALUES (?,?,?,?,?,?,?,?,?,?,0)")
            ->execute([$brand, $f['name'], $f['tag'], $f['price'], $f['size'], $f['img'], $f['imgs'], $f['orig'],
                       boolField($b['new'] ?? true), $f['stock']]);
        respond(['id' => (int)$pdo->lastInsertId()], 201);
    }

    if (!$id || !ctype_digit($id)) respond(['error' => 'Missing or invalid id'], 400);

    // public: count a product view (once per visitor session)
    if ($method === 'POST' && $action === 'view') {
        if (empty($_SESSION['viewed'][$id])) {
            $_SESSION['viewed'][$id] = 1;
            $pdo->prepare("UPDATE products SET views = views + 1 WHERE id=?")->execute([$id]);
        }
        respond(['ok' => true]);
    }

    $st = $pdo->prepare("SELECT * FROM products WHERE id=?");
    $st->execute([$id]);
    $current = $st->fetch();
    if (!$current) respond(['error' => 'Product not found'], 404);

    requireLogin();
    requireOwnerOrAdmin($current['brand_id']);          // merchants: ONLY their own products

    if ($method === 'PUT' && $action === 'stock') {
        $b = input();
        $pdo->prepare("UPDATE products SET stock=? WHERE id=?")
            ->execute([cleanInt($b['stock'] ?? 0, 0, 100000, 'Stock'), $id]);
        respond(['ok' => true]);
    }

    if ($method === 'PUT') {
        $b = input();
        $f = productFields($b, $current);
        $isNew = array_key_exists('new', $b) ? boolField($b['new']) : (int)$current['is_new'];
        $pdo->prepare("UPDATE products SET name=?,price=?,tag=?,size=?,img=?,imgs=?,original_price=?,stock=?,is_new=? WHERE id=?")
            ->execute([$f['name'], $f['price'], $f['tag'], $f['size'], $f['img'], $f['imgs'], $f['orig'], $f['stock'], $isNew, $id]);
        respond(['ok' => true]);
    }

    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM products WHERE id=?")->execute([$id]);
        respond(['ok' => true]);
    }

    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// ORDERS
//  - customers see only orders placed from their own browser
//    (anonymous visitor id, ?session=...)
//  - merchants see orders that contain their products
//  - admin sees everything
// ════════════════════════════════════════════════════════════
function notify(PDO $pdo, string $audience, ?string $merchantId, ?string $sessionId, string $icon, string $text, ?string $target): void {
    $pdo->prepare("INSERT INTO notifications (audience,merchant_id,session_id,icon,text,target) VALUES (?,?,?,?,?,?)")
        ->execute([$audience, $merchantId, $sessionId, $icon, mb_substr($text, 0, 500), $target]);
}

function orderAccess(PDO $pdo, string $orderId): array {
    $st = $pdo->prepare("SELECT * FROM orders WHERE id=?");
    $st->execute([$orderId]);
    $o = $st->fetch();
    if (!$o) respond(['error' => 'Order not found'], 404);
    requireLogin();
    if (!isLoggedInAsAdmin()) {
        $st = $pdo->prepare("SELECT 1 FROM order_items WHERE order_id=? AND brand_id=? LIMIT 1");
        $st->execute([$orderId, currentMerchantId()]);
        if (!$st->fetch()) respond(['error' => 'This order does not include your products.', 'code' => 'forbidden'], 403);
    }
    return $o;
}

function handleOrders(PDO $pdo, string $method, ?string $id, ?string $action): void {
    if ($method === 'GET') {
        if (isLoggedInAsAdmin()) {
            $orders = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC")->fetchAll();
        } elseif (isLoggedIn()) {
            $st = $pdo->prepare("SELECT DISTINCT o.* FROM orders o JOIN order_items i ON i.order_id=o.id
                                 WHERE i.brand_id=? ORDER BY o.created_at DESC");
            $st->execute([currentMerchantId()]);
            $orders = $st->fetchAll();
        } else {
            $sid = visitorSession();
            if ($sid === '') respond([]);
            $st = $pdo->prepare("SELECT * FROM orders WHERE session_id=? ORDER BY created_at DESC");
            $st->execute([$sid]);
            $orders = $st->fetchAll();
        }
        $itemsStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id=?");
        $msgStmt   = $pdo->prepare("SELECT * FROM order_messages WHERE order_id=? ORDER BY created_at ASC");
        $out = [];
        foreach ($orders as $o) {
            $itemsStmt->execute([$o['id']]);
            $msgStmt->execute([$o['id']]);
            $out[] = [
                'id' => $o['id'], 'customer' => $o['customer_name'], 'email' => $o['email'],
                'phone' => $o['phone'], 'address' => $o['address'], 'payMethod' => $o['pay_method'],
                'status' => $o['status'], 'trackingNumber' => $o['tracking_number'],
                'total' => (float)$o['total'], 'shippingFee' => (float)$o['shipping_fee'],
                'date' => $o['date_placed'], 'timeline' => $o['timeline'] ? json_decode($o['timeline'], true) : [],
                'items' => array_map(function ($i) {
                    return [
                        'product_id' => $i['product_id'], 'brand' => $i['brand_id'], 'name' => $i['name'],
                        'price' => is_numeric($i['price']) ? (float)$i['price'] : $i['price'],
                        'qty' => (int)$i['qty'], 'size' => $i['size'], 'img' => $i['img'],
                    ];
                }, $itemsStmt->fetchAll()),
                'messages' => array_map(function ($m) {
                    return ['role' => $m['role'], 'text' => $m['text'], 'time' => $m['time']];
                }, $msgStmt->fetchAll()),
            ];
        }
        respond($out);
    }

    // ── place order: prices come from the DATABASE, stock checked + decreased in one transaction
    if ($method === 'POST' && !$id) {
        $b     = input();
        $sid   = visitorSession();
        $items = is_array($b['items'] ?? null) ? $b['items'] : [];
        if (!$items)            respond(['error' => 'Your cart is empty.'], 400);
        if (count($items) > 50) respond(['error' => 'Too many items in one order.'], 400);

        $customer = requireText($b, 'customer', 'Name', 150);
        $email    = trim((string)($b['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) respond(['error' => 'Please enter a valid email address.'], 400);
        $phone    = requireText($b, 'phone', 'Phone number', 50);
        $address  = requireText($b, 'address', 'Address', 500, true);
        $pay      = (string)($b['payMethod'] ?? '');
        if (!in_array($pay, ['gcash', 'paymaya'], true)) respond(['error' => 'Please select a payment method.'], 400);
        $allowedFees = [105, 110, 120, 130, 140, 150, 155, 170, 200, 220, 270, 290];   // SHIPPING_RATES in lostandfound.js
        $ship = (float)($b['shippingFee'] ?? 0);
        if (!in_array((int)$ship, $allowedFees, true) || (int)$ship != $ship) respond(['error' => 'Please select a shipping area.'], 400);

        // merge duplicate product lines
        $want = [];
        foreach ($items as $i) {
            $pid = (int)($i['id'] ?? $i['productId'] ?? 0);
            $qty = (int)($i['qty'] ?? 1);
            if ($pid <= 0 || $qty < 1 || $qty > 100) respond(['error' => 'Invalid item in cart.'], 400);
            $want[$pid] = ($want[$pid] ?? 0) + $qty;
        }

        $orderId = 'ORD-' . strtoupper(bin2hex(random_bytes(4)));
        $pdo->beginTransaction();
        try {
            $lock = $pdo->prepare("SELECT id,brand_id,name,price,size,img,stock FROM products WHERE id=? FOR UPDATE");
            $lines = [];
            $subtotal = 0.0;
            foreach ($want as $pid => $qty) {
                $lock->execute([$pid]);
                $p = $lock->fetch();
                if (!$p) { $pdo->rollBack(); respond(['error' => 'A product in your cart no longer exists.'], 409); }
                if ((int)$p['stock'] < $qty) {
                    $pdo->rollBack();
                    respond(['error' => 'Only ' . (int)$p['stock'] . ' left of "' . $p['name'] . '". Please update your cart.'], 409);
                }
                if (!is_numeric($p['price'])) { $pdo->rollBack(); respond(['error' => '"' . $p['name'] . '" has no valid price.'], 409); }
                $subtotal += (float)$p['price'] * $qty;
                $lines[] = [$p, $qty];
            }
            $total = $subtotal + $ship;
            $timeline = json_encode(['placed' => date('M j'), 'confirmed' => null, 'packed' => null, 'shipped' => null, 'delivered' => null]);

            $pdo->prepare("INSERT INTO orders (id,session_id,customer_name,email,phone,address,pay_method,status,subtotal,shipping_fee,total,date_placed,timeline)
                           VALUES (?,?,?,?,?,?,?,'pending',?,?,?,?,?)")
                ->execute([$orderId, $sid ?: null, $customer, $email, $phone, $address, $pay, $subtotal, $ship, $total, date('F j, Y'), $timeline]);

            $itemStmt  = $pdo->prepare("INSERT INTO order_items (order_id,product_id,brand_id,name,price,qty,size,img) VALUES (?,?,?,?,?,?,?,?)");
            $stockStmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id=?");
            $brands = [];
            foreach ($lines as [$p, $qty]) {
                $itemStmt->execute([$orderId, $p['id'], $p['brand_id'], $p['name'], $p['price'], $qty, $p['size'], $p['img']]);
                $stockStmt->execute([$qty, $p['id']]);
                $brands[$p['brand_id']] = true;
            }
            notify($pdo, 'customer', null, $sid ?: null, 'package', "Order $orderId placed — ₱" . number_format($total), 'orders');
            foreach (array_keys($brands) as $bid) {
                notify($pdo, 'merchant', $bid, null, 'bag', "New order $orderId from $customer", 'orders-merch');
            }
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }
        respond(['id' => $orderId, 'total' => $total], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);

    if ($method === 'PUT' && $action === 'status') {
        $o = orderAccess($pdo, $id);
        $b = input();
        $status = (string)($b['status'] ?? '');
        $valid = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
        if (!in_array($status, $valid, true)) respond(['error' => 'Invalid status'], 400);
        $timeline = $o['timeline'] ? (json_decode($o['timeline'], true) ?: []) : [];
        $timeline[$status] = date('M j');
        $pdo->prepare("UPDATE orders SET status=?, timeline=? WHERE id=?")->execute([$status, json_encode($timeline), $id]);
        notify($pdo, 'customer', null, $o['session_id'], 'package', "Your order $id is now: $status", 'orders');
        respond(['ok' => true]);
    }

    if ($method === 'POST' && $action === 'message') {
        $o = orderAccess($pdo, $id);
        $b = input();
        $text     = cleanText($b['text'] ?? '', 1000, true);
        $tracking = cleanText($b['trackingNumber'] ?? '', 50);
        if ($text === '' && $tracking === '') respond(['error' => 'Enter a message or tracking number.'], 400);
        if ($tracking !== '') $pdo->prepare("UPDATE orders SET tracking_number=? WHERE id=?")->execute([$tracking, $id]);
        if ($text !== '') {
            $pdo->prepare("INSERT INTO order_messages (order_id,role,text,time) VALUES (?,?,?,?)")
                ->execute([$id, 'merchant', $text, date('M j, g:i A')]);
        }
        notify($pdo, 'customer', null, $o['session_id'], 'message', "Merchant message for order $id", 'orders');
        respond(['ok' => true]);
    }

    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// REVIEWS  (customers can edit/delete only their own reviews)
// ════════════════════════════════════════════════════════════
function handleReviews(PDO $pdo, string $method, ?string $id, ?string $action): void {
    $sid = visitorSession();

    if ($method === 'GET') {
        $rows = $pdo->query("SELECT * FROM reviews ORDER BY created_at DESC")->fetchAll();
        respond(array_map(function ($r) use ($sid) {
            $mine = $sid !== '' && $r['session_id'] !== null && hash_equals((string)$r['session_id'], $sid);
            $author = $r['author'];
            if (!$mine && ($author === 'You' || $author === '')) $author = 'Verified buyer';
            return [
                'id' => $r['id'], 'product_id' => (int)$r['product_id'], 'author' => $author,
                'rating' => (int)$r['rating'], 'text' => $r['text'], 'img' => $r['img'],
                'date' => $r['date'], 'merchant_reply' => $r['merchant_reply'], 'mine' => $mine,
            ];
        }, $rows));
    }

    if ($method === 'POST' && !$id) {
        if ($sid === '') respond(['error' => 'Missing visitor session. Refresh the page.'], 400);
        rateLimit('review', 10, 3600);
        $b      = input();
        $pid    = (int)($b['productId'] ?? 0);
        $rating = cleanInt($b['rating'] ?? 0, 1, 5, 'Rating');
        $text   = requireText($b, 'text', 'Review', 2000, true);
        $img    = cleanImageRef($b['img'] ?? '', 'Review photo');
        // only customers who received this product (a delivered order from this browser) may review it
        $st = $pdo->prepare("SELECT 1 FROM orders o JOIN order_items i ON i.order_id=o.id
                             WHERE o.session_id=? AND o.status='delivered' AND i.product_id=? LIMIT 1");
        $st->execute([$sid, $pid]);
        if (!$st->fetch()) respond(['error' => 'You can review a product after your order is delivered.'], 403);

        $rid = newId('rv');
        $pdo->prepare("INSERT INTO reviews (id,product_id,session_id,author,rating,text,img,date) VALUES (?,?,?,?,?,?,?,?)")
            ->execute([$rid, $pid, $sid, cleanText($b['author'] ?? 'You', 150) ?: 'You', $rating, $text, $img !== '' ? $img : null, date('M j, Y')]);
        respond(['id' => $rid], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);

    $st = $pdo->prepare("SELECT r.*, p.brand_id FROM reviews r LEFT JOIN products p ON p.id=r.product_id WHERE r.id=?");
    $st->execute([$id]);
    $rev = $st->fetch();
    if (!$rev) respond(['error' => 'Review not found'], 404);

    if ($method === 'PUT' && $action === 'reply') {
        requireLogin();
        requireOwnerOrAdmin((string)$rev['brand_id']);   // only the product's merchant (or admin)
        $b = input();
        $pdo->prepare("UPDATE reviews SET merchant_reply=? WHERE id=?")->execute([cleanText($b['reply'] ?? '', 1000, true), $id]);
        respond(['ok' => true]);
    }

    $isAuthor = $sid !== '' && $rev['session_id'] !== null && hash_equals((string)$rev['session_id'], $sid);
    if (!$isAuthor && !isLoggedInAsAdmin()) respond(['error' => 'You can only change your own review.', 'code' => 'forbidden'], 403);

    if ($method === 'PUT') {
        $b = input();
        $img = trim((string)($b['img'] ?? ''));
        if ($img !== (string)$rev['img']) $img = cleanImageRef($img, 'Review photo');
        $pdo->prepare("UPDATE reviews SET rating=?,text=?,img=? WHERE id=?")
            ->execute([cleanInt($b['rating'] ?? 0, 1, 5, 'Rating'), requireText($b, 'text', 'Review', 2000, true), $img !== '' ? $img : null, $id]);
        respond(['ok' => true]);
    }

    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM reviews WHERE id=?")->execute([$id]);
        respond(['ok' => true]);
    }

    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// TESTIMONIALS
// ════════════════════════════════════════════════════════════
function initials(string $name): string {
    $out = '';
    foreach (preg_split('/\s+/', trim($name)) as $w) if ($w !== '') $out .= mb_substr($w, 0, 1);
    return mb_strtoupper(mb_substr($out, 0, 2));
}

function handleTestimonials(PDO $pdo, string $method, ?string $id): void {
    if ($method === 'GET') {
        $rows = $pdo->query("SELECT * FROM testimonials WHERE approved=1 ORDER BY id DESC")->fetchAll();
        respond(array_map(function ($r) {
            return ['id' => $r['id'], 'name' => $r['name'], 'location' => $r['location'],
                    'rating' => (int)$r['rating'], 'text' => $r['text'], 'avatar' => $r['avatar'], 'approved' => (bool)$r['approved']];
        }, $rows));
    }
    requireAdmin();
    if ($method === 'POST') {
        $b    = input();
        $name = requireText($b, 'name', 'Name', 150);
        $tid  = newId('t');
        $pdo->prepare("INSERT INTO testimonials (id,name,location,rating,text,avatar,approved) VALUES (?,?,?,?,?,?,1)")
            ->execute([$tid, $name, requireText($b, 'location', 'Location', 150), cleanInt($b['rating'] ?? 5, 1, 5, 'Rating'),
                       requireText($b, 'text', 'Testimonial', 2000, true), initials($name)]);
        respond(['id' => $tid], 201);
    }
    if ($method === 'DELETE') {
        if (!$id) respond(['error' => 'Missing id'], 400);
        $pdo->prepare("DELETE FROM testimonials WHERE id=?")->execute([$id]);
        respond(['ok' => true]);
    }
    respond(['error' => 'Method not allowed'], 405);
}

function handleTestimonialRequests(PDO $pdo, string $method, ?string $id, ?string $action): void {
    requireLogin();
    $map = function ($r) {
        return ['id' => $r['id'], 'brandId' => $r['brand_id'], 'brandName' => $r['brand_name'],
                'name' => $r['name'], 'location' => $r['location'], 'rating' => (int)$r['rating'],
                'text' => $r['text'], 'avatar' => $r['avatar'], 'status' => $r['status'], 'submittedAt' => $r['submitted_at']];
    };

    if ($method === 'GET') {
        if (isLoggedInAsAdmin()) {
            $rows = $pdo->query("SELECT * FROM testimonial_requests ORDER BY submitted_at DESC, id DESC")->fetchAll();
        } else {
            $st = $pdo->prepare("SELECT * FROM testimonial_requests WHERE brand_id=? ORDER BY id DESC");
            $st->execute([currentMerchantId()]);
            $rows = $st->fetchAll();
        }
        respond(array_map($map, $rows));
    }

    if ($method === 'POST' && !$id) {
        $b   = input();
        $bid = currentMerchantId();                       // never trust brandId from the browser
        $st  = $pdo->prepare("SELECT name FROM brands WHERE id=?");
        $st->execute([$bid]);
        $bname = (string)$st->fetchColumn();
        $name  = requireText($b, 'name', 'Name', 150);
        $rid   = newId('treq');
        $pdo->prepare("INSERT INTO testimonial_requests (id,brand_id,brand_name,name,location,rating,text,avatar,status,submitted_at)
                       VALUES (?,?,?,?,?,?,?,?,'pending',?)")
            ->execute([$rid, $bid, $bname, $name, requireText($b, 'location', 'Location', 150), cleanInt($b['rating'] ?? 5, 1, 5, 'Rating'),
                       requireText($b, 'text', 'Testimonial', 2000, true), initials($name), date('M j, Y')]);
        notify($pdo, 'merchant', 'lostandfound', null, 'star', "Testimonial request from $bname waiting for approval", null);
        respond(['id' => $rid], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);

    if ($method === 'PUT' && ($action === 'approve' || $action === 'reject')) {
        requireAdmin();
        $st = $pdo->prepare("SELECT * FROM testimonial_requests WHERE id=?");
        $st->execute([$id]);
        $r = $st->fetch();
        if (!$r) respond(['error' => 'Not found'], 404);
        if ($action === 'reject') {
            $pdo->prepare("UPDATE testimonial_requests SET status='rejected' WHERE id=?")->execute([$id]);
            respond(['ok' => true]);
        }
        $pdo->beginTransaction();
        $pdo->prepare("UPDATE testimonial_requests SET status='approved' WHERE id=?")->execute([$id]);
        $pdo->prepare("INSERT INTO testimonials (id,name,location,rating,text,avatar,approved) VALUES (?,?,?,?,?,?,1)")
            ->execute([newId('t'), $r['name'], $r['location'], $r['rating'], $r['text'], $r['avatar']]);
        $pdo->commit();
        respond(['ok' => true]);
    }

    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════════════
function handleNotifications(PDO $pdo, string $method, ?string $id): void {
    $audience = ($_GET['audience'] ?? 'customer') === 'merchant' ? 'merchant' : 'customer';
    $sid = visitorSession();
    $cols = "id,audience,merchant_id,icon,text,target,is_read,created_at";

    // WHERE clause limiting rows to what this requester may see
    if ($audience === 'merchant') {
        requireLogin();
        if (isLoggedInAsAdmin()) { $where = "audience='merchant'"; $args = []; }
        else { $where = "audience='merchant' AND (merchant_id=? OR merchant_id IS NULL)"; $args = [currentMerchantId()]; }
    } else {
        if ($sid === '') { if ($method === 'GET') respond([]); respond(['ok' => true]); }
        $where = "audience='customer' AND session_id=?"; $args = [$sid];
    }

    if ($method === 'GET') {
        $st = $pdo->prepare("SELECT $cols FROM notifications WHERE $where ORDER BY created_at DESC, id DESC LIMIT 20");
        $st->execute($args);
        respond($st->fetchAll());
    }
    if ($method === 'PUT') {
        if (!$id || !ctype_digit($id)) respond(['error' => 'Missing id'], 400);
        // customer notifications may be marked read without specifying audience
        if (!isset($_GET['audience']) && isLoggedIn()) {
            $st = $pdo->prepare("UPDATE notifications SET is_read=1 WHERE id=? AND ((audience='customer' AND session_id=?) OR (audience='merchant' AND (? OR merchant_id=? OR merchant_id IS NULL)))");
            $st->execute([$id, $sid, isLoggedInAsAdmin() ? 1 : 0, currentMerchantId()]);
        } else {
            $st = $pdo->prepare("UPDATE notifications SET is_read=1 WHERE id=? AND $where");
            $st->execute(array_merge([$id], $args));
        }
        respond(['ok' => true]);
    }
    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM notifications WHERE $where")->execute($args);
        respond(['ok' => true]);
    }
    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// PENDING IMAGES (merchant site-image submissions → admin approval)
// ════════════════════════════════════════════════════════════
function handlePendingImages(PDO $pdo, string $method, ?string $id, ?string $action): void {
    if ($method === 'GET') {
        requireAdmin();
        $rows = $pdo->query("SELECT * FROM pending_images WHERE status='pending' ORDER BY submitted_at DESC")->fetchAll();
        respond(array_map(function ($r) {
            return ['id' => $r['id'], 'merchantId' => $r['merchant_id'], 'merchantName' => $r['merchant_name'],
                    'type' => $r['type'], 'imageData' => $r['image_data'],
                    'targetIndex' => $r['target_index'] !== null ? (int)$r['target_index'] : null,
                    'label' => $r['label'], 'status' => $r['status'], 'submittedAt' => $r['submitted_at']];
        }, $rows));
    }

    if ($method === 'POST' && !$id) {
        requireLogin();
        $b    = input();
        $type = (string)($b['type'] ?? '');
        if (!in_array($type, ['hero', 'carousel', 'arrivals', 'events'], true)) respond(['error' => 'Invalid image type'], 400);
        $idx = null;
        if ($type === 'carousel') $idx = cleanInt($b['targetIndex'] ?? 0, 0, 3, 'Slide');
        $img = cleanImageRef($b['imageData'] ?? '', 'Image');
        if (strpos($img, 'uploads/') !== 0) respond(['error' => 'Please upload the image file.'], 400);
        $mid = currentMerchantId();
        $st = $pdo->prepare("SELECT name FROM brands WHERE id=?");
        $st->execute([$mid]);
        $iid = newId('img');
        $pdo->prepare("INSERT INTO pending_images (id,merchant_id,merchant_name,type,image_data,target_index,label,status,submitted_at)
                       VALUES (?,?,?,?,?,?,?,'pending',?)")
            ->execute([$iid, $mid, (string)$st->fetchColumn(), $type, $img, $idx, cleanText($b['label'] ?? $type, 100), date('M j, Y')]);
        notify($pdo, 'merchant', 'lostandfound', null, 'clock', 'New site image waiting for approval', null);
        respond(['id' => $iid], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);
    requireAdmin();
    $st = $pdo->prepare("SELECT * FROM pending_images WHERE id=?");
    $st->execute([$id]);
    $r = $st->fetch();
    if (!$r) respond(['error' => 'Not found'], 404);

    if ($method === 'PUT' && $action === 'reject') {
        $pdo->prepare("UPDATE pending_images SET status='rejected' WHERE id=?")->execute([$id]);
        notify($pdo, 'merchant', $r['merchant_id'], null, 'x', '"' . $r['label'] . '" was not approved', null);
        respond(['ok' => true]);
    }
    if ($method === 'PUT' && $action === 'approve') {
        $key = null;
        if ($r['type'] === 'carousel' && $r['target_index'] !== null) $key = 'carousel_' . (int)$r['target_index'];
        elseif ($r['type'] === 'hero')     $key = 'hero_bg';
        elseif ($r['type'] === 'arrivals') $key = 'arrivals_bg';
        elseif ($r['type'] === 'events')   $key = 'events_bg';
        $pdo->beginTransaction();
        $pdo->prepare("UPDATE pending_images SET status='approved' WHERE id=?")->execute([$id]);
        if ($key) {
            $pdo->prepare("INSERT INTO site_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)")
                ->execute([$key, $r['image_data']]);
        }
        $pdo->commit();
        notify($pdo, 'merchant', $r['merchant_id'], null, 'check', '"' . $r['label'] . '" was approved and is now live', null);
        respond(['ok' => true]);
    }
    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// EVENTS (merchant events need admin approval; admin's go live)
// ════════════════════════════════════════════════════════════
function handleEvents(PDO $pdo, string $method, ?string $id, ?string $action): void {
    if ($method === 'GET') {
        $session = visitorSession();
        if (isLoggedInAsAdmin()) {
            $rows = $pdo->query("SELECT * FROM events ORDER BY event_date ASC")->fetchAll();
        } elseif (isLoggedIn()) {
            $st = $pdo->prepare("SELECT * FROM events WHERE status='approved' OR brand_id=? ORDER BY event_date ASC");
            $st->execute([currentMerchantId()]);
            $rows = $st->fetchAll();
        } else {
            $rows = $pdo->query("SELECT * FROM events WHERE status='approved' ORDER BY event_date ASC")->fetchAll();
        }
        $int = $pdo->prepare("SELECT 1 FROM event_interests WHERE event_id=? AND session_id=?");
        foreach ($rows as &$r) {
            $int->execute([$r['id'], $session]);
            $r['interested'] = (bool)$int->fetchColumn();
        }
        unset($r);
        respond($rows);
    }

    if ($method === 'POST' && !$id) {
        requireLogin();
        $b    = input();
        $date = (string)($b['date'] ?? '');
        $d    = DateTime::createFromFormat('Y-m-d', $date);
        if (!$d || $d->format('Y-m-d') !== $date) respond(['error' => 'Please choose a valid event date.'], 400);
        $brand  = currentMerchantId();
        $status = isLoggedInAsAdmin() ? 'approved' : 'pending';
        $eid = newId('ev');
        $title = requireText($b, 'title', 'Title', 200);
        $pdo->prepare("INSERT INTO events (id,brand_id,title,event_date,event_time,location,description,img,status) VALUES (?,?,?,?,?,?,?,?,?)")
            ->execute([$eid, $brand, $title, $date, cleanText($b['time'] ?? '', 50), requireText($b, 'location', 'Location', 200),
                       cleanText($b['desc'] ?? '', 2000, true), cleanImageRef($b['img'] ?? '', 'Event image'), $status]);
        if ($status === 'pending') notify($pdo, 'merchant', 'lostandfound', null, 'calendar', "Event \"$title\" is waiting for approval", null);
        respond(['id' => $eid, 'status' => $status], 201);
    }

    if (!$id) respond(['error' => 'Missing id'], 400);
    $st = $pdo->prepare("SELECT * FROM events WHERE id=?");
    $st->execute([$id]);
    $ev = $st->fetch();
    if (!$ev) respond(['error' => 'Event not found'], 404);

    if ($method === 'PUT' && ($action === 'approve' || $action === 'reject')) {
        requireAdmin();
        $status = $action === 'approve' ? 'approved' : 'rejected';
        $pdo->prepare("UPDATE events SET status=? WHERE id=?")->execute([$status, $id]);
        notify($pdo, 'merchant', $ev['brand_id'], null, $action === 'approve' ? 'check' : 'x',
               'Your event "' . $ev['title'] . '" was ' . ($action === 'approve' ? 'approved' : 'not approved'), null);
        respond(['ok' => true]);
    }

    if ($method === 'DELETE') {
        requireLogin();
        requireOwnerOrAdmin((string)$ev['brand_id']);
        $pdo->prepare("DELETE FROM event_interests WHERE event_id=?")->execute([$id]);
        $pdo->prepare("DELETE FROM events WHERE id=?")->execute([$id]);
        respond(['ok' => true]);
    }
    respond(['error' => 'Method not allowed'], 405);
}

function handleEventInterests(PDO $pdo, string $method): void {
    if ($method !== 'POST') respond(['error' => 'Method not allowed'], 405);
    $b = input();
    $eventId   = (string)($b['eventId'] ?? '');
    $sessionId = cleanSessionId($b['sessionId'] ?? '');
    if ($sessionId === '') respond(['error' => 'Missing visitor session. Refresh the page.'], 400);
    $st = $pdo->prepare("SELECT 1 FROM events WHERE id=? AND status='approved'");
    $st->execute([$eventId]);
    if (!$st->fetch()) respond(['error' => 'Event not found'], 404);

    $chk = $pdo->prepare("SELECT 1 FROM event_interests WHERE event_id=? AND session_id=?");
    $chk->execute([$eventId, $sessionId]);
    if ($chk->fetch()) {
        $pdo->prepare("DELETE FROM event_interests WHERE event_id=? AND session_id=?")->execute([$eventId, $sessionId]);
        respond(['interested' => false]);
    }
    $pdo->prepare("INSERT INTO event_interests (event_id,session_id) VALUES (?,?)")->execute([$eventId, $sessionId]);
    respond(['interested' => true]);
}

// ════════════════════════════════════════════════════════════
// FEEDBACK (anyone can send; only admin can read)
// ════════════════════════════════════════════════════════════
function handleFeedback(PDO $pdo, string $method): void {
    if ($method === 'GET') {
        requireAdmin();
        respond($pdo->query("SELECT id,name,type,msg,time FROM feedback ORDER BY id DESC")->fetchAll());
    }
    if ($method === 'POST') {
        rateLimit('feedback', 5, 600);
        $b = input();
        $type = (string)($b['type'] ?? 'other');
        if (!in_array($type, ['suggestion', 'complaint', 'compliment', 'bug', 'other'], true)) $type = 'other';
        $pdo->prepare("INSERT INTO feedback (name,type,msg,time) VALUES (?,?,?,?)")
            ->execute([requireText($b, 'name', 'Name', 150), $type, requireText($b, 'msg', 'Message', 2000, true), date('M j, Y g:i A')]);
        notify($pdo, 'merchant', 'lostandfound', null, 'message', 'New customer feedback received', null);
        respond(['ok' => true], 201);
    }
    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// SITE SETTINGS (hero, mascot, logo, carousel, banners)
// ════════════════════════════════════════════════════════════
function handleSettings(PDO $pdo, string $method): void {
    $imageKeys = ['hero_bg', 'mascot_bg', 'logo_bg', 'carousel_0', 'carousel_1', 'carousel_2', 'carousel_3', 'arrivals_bg', 'events_bg'];

    if ($method === 'GET') {
        $in = implode(',', array_fill(0, count($imageKeys), '?'));
        $st = $pdo->prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ($in)");
        $st->execute($imageKeys);
        $out = [];
        foreach ($st->fetchAll() as $r) $out[$r['setting_key']] = $r['setting_value'];
        respond($out ?: new stdClass());   // always a JSON object
    }
    requireAdmin();
    if ($method === 'PUT') {
        $b   = input();
        $key = (string)($b['key'] ?? '');
        if (!in_array($key, $imageKeys, true)) respond(['error' => 'Invalid setting key'], 400);
        $val = cleanImageRef($b['value'] ?? '', 'Image');
        $pdo->prepare("INSERT INTO site_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)")
            ->execute([$key, $val]);
        respond(['ok' => true]);
    }
    if ($method === 'DELETE') {
        $in = implode(',', array_fill(0, count($imageKeys), '?'));
        $pdo->prepare("DELETE FROM site_settings WHERE setting_key IN ($in)")->execute($imageKeys);
        respond(['ok' => true]);
    }
    respond(['error' => 'Method not allowed'], 405);
}

// ════════════════════════════════════════════════════════════
// UPLOAD  (multipart/form-data, field "file")
//   ?resource=upload&category=products|brands|events|site|reviews
// ════════════════════════════════════════════════════════════
function handleUpload(string $method): void {
    if ($method !== 'POST') respond(['error' => 'Method not allowed'], 405);
    $category = (string)($_GET['category'] ?? '');
    $allowed  = ['products', 'brands', 'events', 'site', 'reviews'];
    if (!in_array($category, $allowed, true)) respond(['error' => 'Invalid upload category'], 400);

    if ($category === 'reviews') {
        if (visitorSession() === '') respond(['error' => 'Missing visitor session. Refresh the page.'], 400);
        rateLimit('upload_review', 10, 3600);
    } else {
        requireLogin();
        if ($category !== 'site' || !isLoggedInAsAdmin()) rateLimit('upload', 60, 3600);
    }
    respond(['path' => handleImageUpload($category)], 201);
}
````

### 11.14 `backend/Account.php`  (193 lines)

````php
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
````

### 11.15 `backend/PasswordReset.php`  (184 lines)

````php
<?php
// ============================================================
// PasswordReset.php — "Forgot password?" for merchant accounts.
//
// The site has no e-mail server (XAMPP), so resets go through the
// admin, which is the safe way without e-mail:
//
//   1. Merchant clicks "Forgot password?" → sends a request
//        POST ?action=request            (public, rate-limited)
//   2. Admin sees it in the Security tab and clicks Reset
//        GET  ?action=list               (admin)
//        POST ?action=reset              (admin) → temporary password, shown once
//        POST ?action=reject             (admin)
//   3. Merchant logs in with the temporary password and is forced
//      to choose a new one (same as first login).
//
// Everything is saved in the database:
//   password_reset_requests (new table, created automatically)
//   password_changes        (reason 'admin_reset')
//   brands.password / must_change_password, notifications
//
// The ADMIN password can never be reset from the website.
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
lf_send_cors_headers();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

set_exception_handler(function ($e) {
    error_log('[lostfound reset] ' . $e->getMessage());
    respond(['error' => 'Server error. Please try again.'], 500);
});

lf_start_session();
try {
    $pdo = lf_db();
} catch (PDOException $e) {
    respond(['error' => 'Cannot connect to the database. Start MySQL in XAMPP.'], 503);
}
requireCsrf();

// ── tables (created automatically, same text collation as `brands`) ──
$coll = $pdo->query("SELECT COLLATION_NAME FROM information_schema.COLUMNS
                     WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='brands' AND COLUMN_NAME='id'")->fetchColumn();
$coll = preg_match('/^utf8mb4_[a-z0-9_]+$/', (string)$coll) ? $coll : 'utf8mb4_unicode_ci';
$pdo->exec("CREATE TABLE IF NOT EXISTS password_reset_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id VARCHAR(50) NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    contact_info VARCHAR(150) NOT NULL,
    message TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    ip VARCHAR(45) NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_prr_status (status, requested_at),
    INDEX idx_prr_brand (brand_id, status)
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

$action = (string)($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function notifyReset(PDO $pdo, string $merchantId, string $text): void {
    $pdo->prepare("INSERT INTO notifications (audience, merchant_id, icon, text, target) VALUES ('merchant', ?, 'key', ?, NULL)")
        ->execute([$merchantId, mb_substr($text, 0, 500)]);
}

// ── 1. MERCHANT: send a reset request (no login) ─────────────
if ($method === 'POST' && $action === 'request') {
    rateLimit('pw_reset_request', 3, 3600);                 // max 3 requests per hour per browser
    $b       = input();
    $brandId = strtolower(trim((string)($b['brandId'] ?? '')));
    $name    = requireText($b, 'name', 'Your name', 150);
    $contact = requireText($b, 'contact', 'Phone number or e-mail', 150);
    $message = cleanText($b['message'] ?? '', 1000, true);

    $st = $pdo->prepare("SELECT name FROM brands WHERE id=? AND id<>'lostandfound'");
    $st->execute([$brandId]);
    $brandName = $st->fetchColumn();
    if ($brandName === false) respond(['error' => 'Please choose your brand.'], 400);

    $st = $pdo->prepare("SELECT 1 FROM password_reset_requests WHERE brand_id=? AND status='pending' LIMIT 1");
    $st->execute([$brandId]);
    if ($st->fetch()) {
        respond(['ok' => true, 'alreadyPending' => true,
                 'message' => 'A reset request for this brand is already waiting. The admin will contact you.']);
    }

    $pdo->beginTransaction();
    $pdo->prepare("INSERT INTO password_reset_requests (brand_id, contact_name, contact_info, message, ip) VALUES (?,?,?,?,?)")
        ->execute([$brandId, $name, $contact, $message !== '' ? $message : null, clientIp()]);
    notifyReset($pdo, 'lostandfound', "Password reset request from $brandName");
    $pdo->commit();
    respond(['ok' => true, 'message' => 'Request sent. The admin will contact you with a temporary password.'], 201);
}

// everything below is admin-only
requireAdmin();

// ── 2. ADMIN: list requests ──────────────────────────────────
if ($method === 'GET' && $action === 'list') {
    $rows = $pdo->query("SELECT r.*, b.name AS brand_name FROM password_reset_requests r
                         LEFT JOIN brands b ON b.id = r.brand_id
                         ORDER BY (r.status='pending') DESC, r.requested_at DESC, r.id DESC LIMIT 50")->fetchAll();
    respond(array_map(function ($r) {
        return [
            'id' => (int)$r['id'], 'brandId' => $r['brand_id'], 'brandName' => $r['brand_name'] ?? $r['brand_id'],
            'name' => $r['contact_name'], 'contact' => $r['contact_info'], 'message' => $r['message'],
            'status' => $r['status'], 'requestedAt' => $r['requested_at'], 'resolvedAt' => $r['resolved_at'],
        ];
    }, $rows));
}

// ── 3. ADMIN: reset a merchant password → temporary password ─
if ($method === 'POST' && $action === 'reset') {
    $b         = input();
    $requestId = isset($b['requestId']) ? (int)$b['requestId'] : 0;
    $brandId   = strtolower(trim((string)($b['brandId'] ?? '')));

    if ($requestId > 0) {
        $st = $pdo->prepare("SELECT brand_id, status FROM password_reset_requests WHERE id=?");
        $st->execute([$requestId]);
        $req = $st->fetch();
        if (!$req) respond(['error' => 'Request not found.'], 404);
        if ($req['status'] !== 'pending') respond(['error' => 'This request was already handled.'], 409);
        $brandId = $req['brand_id'];
    }
    if ($brandId === '' || $brandId === 'lostandfound') respond(['error' => 'Choose a merchant brand.'], 400);

    $st = $pdo->prepare("SELECT name FROM brands WHERE id=?");
    $st->execute([$brandId]);
    $brandName = $st->fetchColumn();
    if ($brandName === false) respond(['error' => 'Brand not found.'], 404);

    $temp = randomTempPassword();
    $ua   = substr(cleanText($_SERVER['HTTP_USER_AGENT'] ?? '', 255), 0, 255);

    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE brands SET password=?, must_change_password=1 WHERE id=?")
            ->execute([hashPassword($temp), $brandId]);
        $pdo->prepare("INSERT INTO password_changes (account_type, account_id, reason, ip, user_agent) VALUES ('merchant', ?, 'admin_reset', ?, ?)")
            ->execute([$brandId, clientIp(), $ua]);
        // this resolves every pending request for the brand
        $pdo->prepare("UPDATE password_reset_requests SET status='completed', resolved_at=NOW() WHERE brand_id=? AND status='pending'")
            ->execute([$brandId]);
        // unlock the merchant if they were locked out by wrong guesses
        $pdo->prepare("DELETE FROM login_attempts WHERE login_key=? OR login_key=?")
            ->execute(['merchant:' . $brandId, 'pwchange:merchant:' . $brandId]);
        notifyReset($pdo, $brandId, 'Your password was reset by the admin. Log in with the temporary password and choose a new one.');
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
    respond(['ok' => true, 'brandId' => $brandId, 'brandName' => $brandName, 'tempPassword' => $temp]);
}

// ── 4. ADMIN: reject a request ───────────────────────────────
if ($method === 'POST' && $action === 'reject') {
    $b  = input();
    $id = (int)($b['requestId'] ?? 0);
    $st = $pdo->prepare("UPDATE password_reset_requests SET status='rejected', resolved_at=NOW() WHERE id=? AND status='pending'");
    $st->execute([$id]);
    if ($st->rowCount() === 0) respond(['error' => 'Request not found or already handled.'], 404);
    respond(['ok' => true]);
}

respond(['error' => 'Unknown action'], 400);
````

### 11.16 `backend/EmailLib.php`  (223 lines)

````php
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
````

### 11.17 `backend/Email.php`  (209 lines)

````php
<?php
// ============================================================
// Email.php — verified recovery e-mails + "forgot password" links.
//
//   GET  ?action=verify&token=…        (link in the e-mail → HTML page)
//   GET  ?action=status                (logged in) my recovery e-mail
//   POST ?action=set_email             (logged in) {email,currentPassword}
//   POST ?action=resend                (logged in) resend verification
//   GET  ?action=list                  (admin) every account's e-mail status
//   POST ?action=admin_set_email       (admin) {brandId,email} for a merchant
//   POST ?action=forgot                (public) {accountType:'merchant',brandId}
//                                               {accountType:'admin',username}
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';
require_once __DIR__ . '/EmailLib.php';

$action = (string)($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

lf_start_session();

// ── VERIFY LINK (HTML page) ──────────────────────────────────
if ($method === 'GET' && $action === 'verify') {
    header('Content-Type: text/html; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: no-referrer');
    header('Cache-Control: no-store');
    $page = function (string $title, string $msg, bool $ok) {
        $c = $ok ? '#16a34a' : '#b91c1c';
        echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
           . '<meta name="robots" content="noindex"><title>' . htmlspecialchars($title) . ' — Lost &amp; Found</title></head>'
           . '<body style="font-family:Inter,Arial,sans-serif;background:#f6f4ef;margin:0;padding:48px 16px;color:#0c0b09">'
           . '<div style="max-width:520px;margin:0 auto;background:#fff;border:2px solid ' . $c . ';border-radius:14px;padding:30px">'
           . '<h1 style="margin:0 0 12px;font-size:1.5rem;color:' . $c . '">' . htmlspecialchars($title) . '</h1>'
           . '<p style="line-height:1.6">' . $msg . '</p>'
           . '<p><a href="../lostandfound.html" style="display:inline-block;margin-top:10px;background:#0c0b09;color:#fff;text-decoration:none;padding:11px 24px;border-radius:30px;font-weight:700">Go to Lost &amp; Found</a></p>'
           . '</div></body></html>';
        exit;
    };
    try { $pdo = lf_db(); lf_email_tables($pdo); }
    catch (Throwable $e) { $page('Server error', 'The database is not available. Start MySQL and try the link again.', false); }

    $tok = lf_find_token($pdo, (string)($_GET['token'] ?? ''), 'verify');
    if (!$tok) $page('Link expired or already used', 'This verification link is no longer valid. Log in and click <b>Resend verification</b> in the Security tab to get a new one.', false);

    $pdo->beginTransaction();
    $pdo->prepare("UPDATE email_tokens SET used_at=NOW() WHERE id=?")->execute([$tok['id']]);
    $pdo->prepare("INSERT INTO account_emails (account_type, account_id, email, verified_at, pending_email) VALUES (?,?,?,NOW(),NULL)
                   ON DUPLICATE KEY UPDATE email=VALUES(email), verified_at=NOW(),
                   pending_email=IF(pending_email=VALUES(email), NULL, pending_email)")
        ->execute([$tok['account_type'], $tok['account_id'], $tok['email']]);
    $pdo->prepare("INSERT INTO notifications (audience, merchant_id, icon, text, target) VALUES ('merchant', ?, 'check', ?, NULL)")
        ->execute([$tok['account_type'] === 'admin' ? 'lostandfound' : $tok['account_id'], 'Recovery email verified: ' . lf_mask_email($tok['email'])]);
    $pdo->commit();
    $page('Email verified ✓', 'Your recovery email <b>' . htmlspecialchars($tok['email']) . '</b> is now verified for the '
        . ($tok['account_type'] === 'admin' ? 'admin account' : 'merchant account <b>' . htmlspecialchars(lf_account_name($pdo, $tok['account_type'], $tok['account_id'])) . '</b>')
        . '. If you ever forget your password, a reset link will be sent here.', true);
}

// ── everything else is JSON ──────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
lf_send_cors_headers();
if ($method === 'OPTIONS') { http_response_code(204); exit; }
set_exception_handler(function ($e) {
    error_log('[lostfound email] ' . $e->getMessage());
    respond(['error' => 'Server error. Please try again.'], 500);
});
try { $pdo = lf_db(); } catch (PDOException $e) { respond(['error' => 'Cannot connect to the database. Start MySQL in XAMPP.'], 503); }
requireCsrf();
lf_email_tables($pdo);

function lf_mail_result(array $r): array {
    $out = ['mailMode' => $r['mode']];
    if ($r['mode'] === 'outbox' && lf_is_local_request()) $out['devOutbox'] = true;   // only shown on your own PC
    return $out;
}

// ── FORGOT PASSWORD (public) ─────────────────────────────────
if ($method === 'POST' && $action === 'forgot') {
    rateLimit('forgot_pw', 5, 3600);
    $b    = input();
    $type = ($b['accountType'] ?? '') === 'admin' ? 'admin' : 'merchant';

    if ($type === 'admin') {
        $generic = ['ok' => true, 'sent' => true,
            'message' => 'If that admin username is correct, a password reset link has been sent to the trusted email linked to the admin account. It expires in 30 minutes.'];
        $user = trim((string)($b['username'] ?? ''));
        $st = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key='admin_username'");
        $st->execute();
        $real = (string)$st->fetchColumn();
        if ($user === '' || $real === '' || !hash_equals($real, $user)) respond($generic);   // never reveal wrong usernames
        $row = lf_get_email_row($pdo, 'admin', 'lostandfound');
        if (!$row['email'] || !$row['verified_at']) respond($generic);
        if (lf_count_recent_tokens($pdo, 'admin', 'lostandfound', 'reset', 60) >= 3) respond($generic);
        $r = lf_send_reset($pdo, 'admin', 'lostandfound', $row['email']);
        respond($generic + lf_mail_result($r));
    }

    $brandId = strtolower(trim((string)($b['brandId'] ?? '')));
    $st = $pdo->prepare("SELECT name FROM brands WHERE id=? AND id<>'lostandfound'");
    $st->execute([$brandId]);
    $brandName = $st->fetchColumn();
    if ($brandName === false) respond(['error' => 'Please choose your brand.'], 400);

    $row = lf_get_email_row($pdo, 'merchant', $brandId);
    if (!$row['email'] || !$row['verified_at']) {
        respond(['ok' => true, 'sent' => false, 'noVerifiedEmail' => true,
            'message' => "$brandName has no verified recovery email yet, so a reset link can't be emailed. You can ask the admin to reset your password instead."]);
    }
    if (lf_count_recent_tokens($pdo, 'merchant', $brandId, 'reset', 60) >= 3) {
        respond(['error' => 'A reset link was already sent several times in the last hour. Check your inbox and spam folder, or try again later.'], 429);
    }
    $r = lf_send_reset($pdo, 'merchant', $brandId, $row['email']);
    if (!$r['sent']) respond(['error' => $r['error'] ?? 'The email could not be sent.'], 502);
    respond(['ok' => true, 'sent' => true, 'maskedEmail' => lf_mask_email($row['email']),
        'message' => 'A password reset link has been sent to your trusted email (' . lf_mask_email($row['email']) . ') linked to the merchant account ' . $brandName . '. It expires in 30 minutes.']
        + lf_mail_result($r));
}

// ── logged-in actions ────────────────────────────────────────
requireLogin();
$isAdmin = isLoggedInAsAdmin();
$type    = $isAdmin ? 'admin' : 'merchant';
$id      = $isAdmin ? 'lostandfound' : (string)currentMerchantId();

function lf_status(PDO $pdo, string $type, string $id): array {
    $r = lf_get_email_row($pdo, $type, $id);
    return ['email' => $r['email'], 'verified' => (bool)($r['email'] && $r['verified_at']),
            'verifiedAt' => $r['verified_at'], 'pendingEmail' => $r['pending_email'],
            'smtpConfigured' => lf_smtp_configured()];
}

if ($method === 'GET' && $action === 'status') respond(lf_status($pdo, $type, $id));

if ($method === 'POST' && $action === 'set_email') {
    rateLimit('set_email', 6, 3600);
    $b = input();
    $email = lf_clean_email($b['email'] ?? '');
    if ($email === '') respond(['error' => 'Please enter a valid email address.'], 400);
    // confirm it's really the account owner
    if ($isAdmin) {
        $st = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key='admin_password'");
        $st->execute();
        $hash = $st->fetchColumn();
    } else {
        $st = $pdo->prepare("SELECT password FROM brands WHERE id=?");
        $st->execute([$id]);
        $hash = $st->fetchColumn();
    }
    if (!verifyPassword((string)($b['currentPassword'] ?? ''), $hash ?: null)) respond(['error' => 'Current password is incorrect.'], 400);

    $cur = lf_get_email_row($pdo, $type, $id);
    if ($cur['email'] === $email && $cur['verified_at']) respond(['ok' => true, 'alreadyVerified' => true, 'message' => 'This email is already verified.'] + lf_status($pdo, $type, $id));

    $pdo->prepare("INSERT INTO account_emails (account_type, account_id, pending_email) VALUES (?,?,?)
                   ON DUPLICATE KEY UPDATE pending_email=VALUES(pending_email)")->execute([$type, $id, $email]);
    $r = lf_send_verification($pdo, $type, $id, $email);
    if (!$r['sent']) respond(['error' => $r['error'] ?? 'The email could not be sent.'], 502);
    respond(['ok' => true, 'message' => 'Verification link sent to ' . $email . '. Open it to finish.'] + lf_mail_result($r) + lf_status($pdo, $type, $id));
}

if ($method === 'POST' && $action === 'resend') {
    $cur = lf_get_email_row($pdo, $type, $id);
    if (!$cur['pending_email']) respond(['error' => 'There is no email waiting for verification.'], 400);
    if (lf_count_recent_tokens($pdo, $type, $id, 'verify', 60) >= 5) respond(['error' => 'Too many verification emails in the last hour. Please wait.'], 429);
    $r = lf_send_verification($pdo, $type, $id, $cur['pending_email']);
    if (!$r['sent']) respond(['error' => $r['error'] ?? 'The email could not be sent.'], 502);
    respond(['ok' => true, 'message' => 'Verification link sent again to ' . $cur['pending_email'] . '.'] + lf_mail_result($r));
}

// ── admin-only ───────────────────────────────────────────────
if ($method === 'GET' && $action === 'list') {
    requireAdmin();
    $rows = $pdo->query("SELECT b.id, b.name, e.email, e.verified_at, e.pending_email
                         FROM brands b LEFT JOIN account_emails e ON e.account_type='merchant' AND e.account_id=b.id
                         WHERE b.id<>'lostandfound' ORDER BY b.name")->fetchAll();
    $admin = lf_get_email_row($pdo, 'admin', 'lostandfound');
    respond([
        'admin' => ['email' => $admin['email'], 'verified' => (bool)($admin['email'] && $admin['verified_at']), 'pendingEmail' => $admin['pending_email']],
        'merchants' => array_map(function ($r) {
            return ['brandId' => $r['id'], 'name' => $r['name'], 'email' => $r['email'],
                    'verified' => (bool)($r['email'] && $r['verified_at']), 'pendingEmail' => $r['pending_email']];
        }, $rows),
        'smtpConfigured' => lf_smtp_configured(),
    ]);
}

if ($method === 'POST' && $action === 'admin_set_email') {
    requireAdmin();
    $b = input();
    $brandId = strtolower(trim((string)($b['brandId'] ?? '')));
    $email = lf_clean_email($b['email'] ?? '');
    if ($email === '') respond(['error' => 'Please enter a valid email address.'], 400);
    $st = $pdo->prepare("SELECT 1 FROM brands WHERE id=? AND id<>'lostandfound'");
    $st->execute([$brandId]);
    if (!$st->fetch()) respond(['error' => 'Brand not found.'], 404);
    $pdo->prepare("INSERT INTO account_emails (account_type, account_id, pending_email) VALUES ('merchant',?,?)
                   ON DUPLICATE KEY UPDATE pending_email=VALUES(pending_email)")->execute([$brandId, $email]);
    $r = lf_send_verification($pdo, 'merchant', $brandId, $email);
    if (!$r['sent']) respond(['error' => $r['error'] ?? 'The email could not be sent.'], 502);
    respond(['ok' => true, 'message' => 'Verification link sent to ' . $email . '. The merchant must open it to verify.'] + lf_mail_result($r));
}

respond(['error' => 'Unknown action'], 400);
````

### 11.18 `backend/ResetPassword.php`  (107 lines)

````php
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
````

### 11.19 `backend/Shipping.php`  (127 lines)

````php
<?php
// ============================================================
// Shipping.php — J&T Express rate table + shipping calculator.
// Used by Checkout.php (server) and sent to the browser so the
// checkout can show the same numbers instantly.
//
// ORIGIN: all merchants ship from Batangas → "from Luzon" rates.
// Source: J&T Express Philippines published rate table "Package
// Rates from Luzon" (0–6 kg), as listed by J&T PH and PH rate
// guides (2025–2026). J&T can change rates at any time —
// update the numbers below if they do. Nothing else needs to change.
// ============================================================

if (!defined('LF_APP')) { http_response_code(403); exit; }

// weight brackets (kg, upper limit of each column below)
const LF_JNT_BRACKETS = [0.5, 1, 3, 4, 5, 6];

// ₱ fee per bracket, by destination region (origin: Luzon)
const LF_JNT_RATES = [
    'luzon'    => [85, 155, 180, 270, 360, 455],
    'ncr'      => [95, 165, 190, 280, 370, 465],
    'visayas'  => [100, 180, 200, 300, 400, 500],
    'mindanao' => [105, 195, 220, 330, 440, 550],
    'island'   => [115, 205, 230, 340, 450, 560],
];

// Above 6 kg: each extra kg (or part of a kg) adds the same step as the 5→6 kg bracket.
// (J&T's table stops at 6 kg for Luzon; this keeps heavy parcels reasonable.)

// Shipping areas shown in the checkout dropdown (same keys your site already uses)
const LF_SHIP_ZONES = [
    'lipa'            => ['label' => 'Lipa City, Batangas',           'region' => 'luzon',    'days' => 2],
    'batangas_city'   => ['label' => 'Batangas City',                 'region' => 'luzon',    'days' => 2],
    'santo_tomas'     => ['label' => 'Santo Tomas, Batangas',         'region' => 'luzon',    'days' => 2],
    'tanauan'         => ['label' => 'Tanauan, Batangas',             'region' => 'luzon',    'days' => 2],
    'rosario'         => ['label' => 'Rosario, Batangas',             'region' => 'luzon',    'days' => 2],
    'bauan'           => ['label' => 'Bauan, Batangas',               'region' => 'luzon',    'days' => 2],
    'san_jose'        => ['label' => 'San Jose, Batangas',            'region' => 'luzon',    'days' => 2],
    'nasugbu'         => ['label' => 'Nasugbu, Batangas',             'region' => 'luzon',    'days' => 3],
    'other_batangas'  => ['label' => 'Other Batangas Towns',          'region' => 'luzon',    'days' => 3],
    'lucena'          => ['label' => 'Lucena City, Quezon',           'region' => 'luzon',    'days' => 3],
    'quezon_province' => ['label' => 'Quezon Province (other)',       'region' => 'luzon',    'days' => 3],
    'laguna'          => ['label' => 'Laguna',                        'region' => 'luzon',    'days' => 3],
    'cavite'          => ['label' => 'Cavite',                        'region' => 'luzon',    'days' => 3],
    'rizal'           => ['label' => 'Rizal',                         'region' => 'luzon',    'days' => 3],
    'metro_manila'    => ['label' => 'Metro Manila (NCR)',            'region' => 'ncr',      'days' => 3],
    'luzon_south'     => ['label' => 'Southern Luzon (Bicol, etc.)',  'region' => 'luzon',    'days' => 4],
    'luzon_north'     => ['label' => 'Northern Luzon',                'region' => 'luzon',    'days' => 4],
    'island'          => ['label' => 'Island provinces (Palawan, Mindoro, Masbate, Romblon, Catanduanes…)', 'region' => 'island', 'days' => 6],
    'visayas'         => ['label' => 'Visayas',                       'region' => 'visayas',  'days' => 5],
    'mindanao'        => ['label' => 'Mindanao',                      'region' => 'mindanao', 'days' => 7],
];

// Estimated weight (kg) per item, matched against the product's category/tag and name.
// First matching rule wins. Edit freely.
const LF_ITEM_WEIGHTS = [
    ['match' => 'shoe|sneaker|boot|slipper|sandal|heels',                     'kg' => 1.0],
    ['match' => 'outerwear|jacket|hoodie|sweater|coat|varsity|windbreaker',   'kg' => 0.8],
    ['match' => 'bag|backpack|tote|sling|purse|wallet',                       'kg' => 0.6],
    ['match' => 'bouquet|flower',                                             'kg' => 0.5],
    ['match' => 'bottom|pants|jeans|denim|trouser|shorts|skirt|cargo',        'kg' => 0.5],
    ['match' => 'perfume|edp|edt|fragrance|scent|cologne|parfum',             'kg' => 0.4],
    ['match' => 'toy|figure|plush',                                           'kg' => 0.3],
    ['match' => 'top|tee|t-shirt|shirt|polo|blouse|jersey|dress|tank',        'kg' => 0.3],
    ['match' => 'hat|cap|bucket|beanie|visor',                                'kg' => 0.25],
    ['match' => '3d print|print',                                             'kg' => 0.2],
    ['match' => 'anik|keychain|key chain|bead|bracelet|necklace|ring|earring|jewel|accessor|charm|pin', 'kg' => 0.1],
];
const LF_DEFAULT_ITEM_KG = 0.4;
const LF_PACKAGING_KG    = 0.1;   // pouch / box per parcel

function lf_item_weight(string $tag, string $name): float {
    $hay = strtolower($tag . ' ' . $name);
    foreach (LF_ITEM_WEIGHTS as $rule) {
        if (preg_match('/' . $rule['match'] . '/', $hay)) return (float)$rule['kg'];
    }
    return LF_DEFAULT_ITEM_KG;
}

/** J&T fee for one parcel of $kg to $region. */
function lf_jnt_fee(string $region, float $kg): int {
    $rates = LF_JNT_RATES[$region] ?? LF_JNT_RATES['luzon'];
    foreach (LF_JNT_BRACKETS as $i => $max) {
        if ($kg <= $max + 1e-9) return (int)$rates[$i];
    }
    $last  = count($rates) - 1;
    $step  = $rates[$last] - $rates[$last - 1];
    $extra = (int)ceil($kg - LF_JNT_BRACKETS[$last] - 1e-9);
    return (int)($rates[$last] + $extra * $step);
}

/**
 * $lines = [ ['brand_id','brand_name','name','tag','qty'], ... ]
 * Each brand ships its own parcel (merchants ship from their own stall).
 */
function lf_calc_shipping(string $zone, array $lines): array {
    if (!isset(LF_SHIP_ZONES[$zone])) return ['ok' => false, 'error' => 'Please select a shipping area.'];
    $z = LF_SHIP_ZONES[$zone];
    $parcels = [];
    foreach ($lines as $l) {
        $bid = (string)$l['brand_id'];
        if (!isset($parcels[$bid])) $parcels[$bid] = ['brandId' => $bid, 'brandName' => (string)($l['brand_name'] ?? $bid), 'items' => 0, 'weightKg' => LF_PACKAGING_KG];
        $parcels[$bid]['items']    += (int)$l['qty'];
        $parcels[$bid]['weightKg'] += lf_item_weight((string)$l['tag'], (string)$l['name']) * (int)$l['qty'];
    }
    $total = 0;
    foreach ($parcels as &$p) {
        $p['weightKg'] = round($p['weightKg'], 2);
        $p['fee'] = lf_jnt_fee($z['region'], $p['weightKg']);
        $total += $p['fee'];
    }
    unset($p);
    return ['ok' => true, 'zone' => $zone, 'zoneLabel' => $z['label'], 'region' => $z['region'],
            'days' => $z['days'], 'parcels' => array_values($parcels), 'shippingTotal' => $total];
}

/** Everything the browser needs to calculate the same numbers. */
function lf_shipping_public_config(): array {
    $weights = [];
    foreach (LF_ITEM_WEIGHTS as $r) $weights[] = ['match' => $r['match'], 'kg' => $r['kg']];
    return [
        'courier' => 'J&T Express', 'origin' => 'Batangas (Luzon)',
        'brackets' => LF_JNT_BRACKETS, 'rates' => LF_JNT_RATES, 'zones' => LF_SHIP_ZONES,
        'weights' => $weights, 'defaultItemKg' => LF_DEFAULT_ITEM_KG, 'packagingKg' => LF_PACKAGING_KG,
    ];
}
````

### 11.20 `backend/Checkout.php`  (148 lines)

````php
<?php
// ============================================================
// Checkout.php — orders with J&T shipping calculated ON THE SERVER.
//   GET  ?action=rates   → rate table for the checkout page
//   POST ?action=quote   → {zone, items:[{id,qty}]} → shipping breakdown
//   POST ?action=place   → place the order (same rules as Api.php:
//                          DB prices, stock check + decrease in one
//                          transaction) but shipping = J&T table,
//                          never a number sent by the browser.
// Api.php is not modified.
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';
require_once __DIR__ . '/Shipping.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
lf_send_cors_headers();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

set_exception_handler(function ($e) {
    error_log('[lostfound checkout] ' . $e->getMessage());
    respond(['error' => 'Server error. Please try again.'], 500);
});

$action = (string)($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET' && $action === 'rates') {
    respond(lf_shipping_public_config());
}

lf_start_session();
try {
    $pdo = lf_db();
} catch (PDOException $e) {
    respond(['error' => 'Cannot connect to the database. Start MySQL in XAMPP.'], 503);
}
requireCsrf();

/** Reads [{id,qty}] → merged [productId => qty]. */
function wantedItems(array $b): array {
    $items = is_array($b['items'] ?? null) ? $b['items'] : [];
    if (!$items)            respond(['error' => 'Your cart is empty.'], 400);
    if (count($items) > 50) respond(['error' => 'Too many items in one order.'], 400);
    $want = [];
    foreach ($items as $i) {
        $pid = (int)($i['id'] ?? $i['productId'] ?? 0);
        $qty = (int)($i['qty'] ?? 1);
        if ($pid <= 0 || $qty < 1 || $qty > 100) respond(['error' => 'Invalid item in cart.'], 400);
        $want[$pid] = ($want[$pid] ?? 0) + $qty;
    }
    return $want;
}

// ── QUOTE ────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'quote') {
    $b    = input();
    $want = wantedItems($b);
    $in   = implode(',', array_fill(0, count($want), '?'));
    $st   = $pdo->prepare("SELECT p.id, p.brand_id, p.name, p.tag, p.price, b.name AS brand_name
                           FROM products p LEFT JOIN brands b ON b.id=p.brand_id WHERE p.id IN ($in)");
    $st->execute(array_keys($want));
    $lines = []; $subtotal = 0.0;
    foreach ($st->fetchAll() as $p) {
        $qty = $want[(int)$p['id']];
        $lines[] = ['brand_id' => $p['brand_id'], 'brand_name' => $p['brand_name'], 'name' => $p['name'], 'tag' => $p['tag'], 'qty' => $qty];
        $subtotal += (is_numeric($p['price']) ? (float)$p['price'] : 0) * $qty;
    }
    $ship = lf_calc_shipping((string)($b['zone'] ?? ''), $lines);
    if (!$ship['ok']) respond(['error' => $ship['error']], 400);
    respond($ship + ['subtotal' => $subtotal, 'total' => $subtotal + $ship['shippingTotal']]);
}

// ── PLACE ORDER ──────────────────────────────────────────────
if ($method === 'POST' && $action === 'place') {
    $b    = input();
    $sid  = visitorSession();
    $want = wantedItems($b);
    $zone = (string)($b['zone'] ?? '');
    if (!isset(LF_SHIP_ZONES[$zone])) respond(['error' => 'Please select a shipping area.'], 400);

    $customer = requireText($b, 'customer', 'Name', 150);
    $email    = trim((string)($b['email'] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) respond(['error' => 'Please enter a valid email address.'], 400);
    $phone    = requireText($b, 'phone', 'Phone number', 50);
    $address  = requireText($b, 'address', 'Address', 500, true);
    $pay      = (string)($b['payMethod'] ?? '');
    if (!in_array($pay, ['gcash', 'paymaya'], true)) respond(['error' => 'Please select a payment method.'], 400);

    $orderId = 'ORD-' . strtoupper(bin2hex(random_bytes(4)));
    $pdo->beginTransaction();
    try {
        $lock = $pdo->prepare("SELECT p.id, p.brand_id, p.name, p.tag, p.price, p.size, p.img, p.stock, b.name AS brand_name
                               FROM products p LEFT JOIN brands b ON b.id=p.brand_id WHERE p.id=? FOR UPDATE");
        $lines = []; $subtotal = 0.0; $shipLines = [];
        foreach ($want as $pid => $qty) {
            $lock->execute([$pid]);
            $p = $lock->fetch();
            if (!$p) { $pdo->rollBack(); respond(['error' => 'A product in your cart no longer exists.'], 409); }
            if ((int)$p['stock'] < $qty) {
                $pdo->rollBack();
                respond(['error' => 'Only ' . (int)$p['stock'] . ' left of "' . $p['name'] . '". Please update your cart.'], 409);
            }
            if (!is_numeric($p['price'])) { $pdo->rollBack(); respond(['error' => '"' . $p['name'] . '" has no valid price.'], 409); }
            $subtotal += (float)$p['price'] * $qty;
            $lines[] = [$p, $qty];
            $shipLines[] = ['brand_id' => $p['brand_id'], 'brand_name' => $p['brand_name'], 'name' => $p['name'], 'tag' => $p['tag'], 'qty' => $qty];
        }
        $ship  = lf_calc_shipping($zone, $shipLines);
        $fee   = (float)$ship['shippingTotal'];
        $total = $subtotal + $fee;
        $timeline = json_encode(['placed' => date('M j'), 'confirmed' => null, 'packed' => null, 'shipped' => null, 'delivered' => null]);

        $pdo->prepare("INSERT INTO orders (id,session_id,customer_name,email,phone,address,pay_method,status,subtotal,shipping_fee,total,date_placed,timeline)
                       VALUES (?,?,?,?,?,?,?,'pending',?,?,?,?,?)")
            ->execute([$orderId, $sid ?: null, $customer, $email, $phone, $address, $pay, $subtotal, $fee, $total, date('F j, Y'), $timeline]);

        $itemStmt  = $pdo->prepare("INSERT INTO order_items (order_id,product_id,brand_id,name,price,qty,size,img) VALUES (?,?,?,?,?,?,?,?)");
        $stockStmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id=?");
        foreach ($lines as [$p, $qty]) {
            $itemStmt->execute([$orderId, $p['id'], $p['brand_id'], $p['name'], $p['price'], $qty, $p['size'], $p['img']]);
            $stockStmt->execute([$qty, $p['id']]);
        }

        $notif = $pdo->prepare("INSERT INTO notifications (audience,merchant_id,session_id,icon,text,target) VALUES (?,?,?,?,?,?)");
        $notif->execute(['customer', null, $sid ?: null, 'package', "Order $orderId placed — ₱" . number_format($total), 'orders']);
        foreach ($ship['parcels'] as $parcel) {
            $notif->execute(['merchant', $parcel['brandId'], null, 'bag',
                "New order $orderId from $customer — J&T parcel " . $parcel['weightKg'] . ' kg, shipping ₱' . $parcel['fee'], 'orders-merch']);
        }
        // the shipping breakdown is also saved as the first order message, so merchants see it
        $pdo->prepare("INSERT INTO order_messages (order_id,role,text,time) VALUES (?,?,?,?)")
            ->execute([$orderId, 'merchant', 'J&T shipping to ' . $ship['zoneLabel'] . ': ' . implode(', ', array_map(function ($p) {
                return $p['brandName'] . ' ' . $p['weightKg'] . ' kg = ₱' . $p['fee'];
            }, $ship['parcels'])) . ' · Total shipping ₱' . (int)$fee, date('M j, g:i A')]);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
    respond(['id' => $orderId, 'subtotal' => $subtotal, 'shippingFee' => $fee, 'total' => $total,
             'parcels' => $ship['parcels'], 'zoneLabel' => $ship['zoneLabel'], 'days' => $ship['days']], 201);
}

respond(['error' => 'Unknown action'], 400);
````

### 11.21 `backend/setup.php`  (270 lines)

````php
<?php
// ============================================================
// setup.php — ONE-TIME installer.
//   1. Upgrades the database (same changes as Schema_update.sql,
//      safe to run on an existing database — nothing is deleted).
//   2. Creates YOUR admin login (bcrypt-hashed).
//   3. Gives every merchant a random temporary password (shown
//      once) that must be changed on first login.
//   4. Moves old base64 images out of the database into /uploads.
// After an admin exists, this page LOCKS itself and refuses to run.
// DELETE THIS FILE after you have copied the temporary passwords.
// ============================================================

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Security.php';

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');
lf_start_session();

function h($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

function page(string $title, string $body, string $tone = 'neutral'): void {
    $colors = ['neutral' => '#0c0b09', 'ok' => '#16a34a', 'bad' => '#b91c1c'];
    $c = $colors[$tone] ?? '#0c0b09';
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
       . '<meta name="robots" content="noindex"><title>' . h($title) . ' — Lost &amp; Found setup</title><style>'
       . 'body{font-family:Inter,system-ui,sans-serif;background:#f6f4ef;color:#0c0b09;margin:0;padding:40px 16px}'
       . '.card{max-width:640px;margin:0 auto;background:#fff;border:2px solid ' . $c . ';border-radius:14px;padding:28px}'
       . 'h1{margin:0 0 12px;font-size:1.5rem;color:' . $c . '}label{display:block;font-weight:600;margin:14px 0 6px}'
       . 'input{width:100%;box-sizing:border-box;padding:11px 12px;border:1.5px solid #d6d3cc;border-radius:8px;font-size:1rem}'
       . 'button{margin-top:18px;background:#0c0b09;color:#fff;border:0;border-radius:30px;padding:12px 26px;font-weight:700;cursor:pointer;font-size:.95rem}'
       . 'table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #e3e0d8;padding:8px;text-align:left;font-size:.92rem}'
       . 'code{background:#f1efe9;padding:2px 6px;border-radius:5px;font-size:.95rem}.warn{background:#fef2f2;border:1px solid #b91c1c;color:#991b1b;padding:12px;border-radius:8px;font-weight:600}'
       . '.hint{color:#6b6860;font-size:.88rem}ul{padding-left:20px}</style></head><body><div class="card"><h1>' . h($title) . '</h1>' . $body . '</div></body></html>';
    exit;
}

// ── connect ─────────────────────────────────────────────────
try {
    $pdo = lf_db();
    $pdo->query("SELECT 1 FROM site_settings LIMIT 1");
} catch (Throwable $e) {
    page('Database not ready',
        '<p>Could not open the <code>' . h(lf_config()['db_name']) . '</code> database or its tables.</p>'
      . '<ul><li>Start <b>Apache</b> and <b>MySQL</b> in the XAMPP Control Panel.</li>'
      . '<li>Import <code>Schema.sql</code> in phpMyAdmin (fresh install), or keep your existing database.</li>'
      . '<li>On a web host, put your database details in <code>backend/config.local.php</code>.</li></ul>', 'bad');
}

// ── migration helpers (idempotent, never drops data) ────────
function colExists(PDO $pdo, string $t, string $c): bool {
    $st = $pdo->prepare("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?");
    $st->execute([$t, $c]);
    return (bool)$st->fetchColumn();
}
function indexExists(PDO $pdo, string $t, string $i): bool {
    $st = $pdo->prepare("SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND INDEX_NAME=?");
    $st->execute([$t, $i]);
    return (bool)$st->fetchColumn();
}
function migrate(PDO $pdo): array {
    $done = [];
    $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        login_key VARCHAR(160) NOT NULL,
        ip VARCHAR(45) NULL,
        attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_login_key_time (login_key, attempted_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("ALTER TABLE brands MODIFY password VARCHAR(255) NULL DEFAULT NULL");
    $cols = [
        ['brands', 'must_change_password', "TINYINT(1) NOT NULL DEFAULT 0 AFTER password"],
        ['orders', 'session_id', "VARCHAR(100) NULL AFTER id"],
        ['reviews', 'session_id', "VARCHAR(100) NULL AFTER product_id"],
        ['notifications', 'session_id', "VARCHAR(100) NULL AFTER merchant_id"],
        ['events', 'status', "VARCHAR(20) NOT NULL DEFAULT 'approved' AFTER img"],
    ];
    foreach ($cols as [$t, $c, $ddl]) {
        if (!colExists($pdo, $t, $c)) { $pdo->exec("ALTER TABLE `$t` ADD COLUMN `$c` $ddl"); $done[] = "Added $t.$c"; }
    }
    $idx = [
        ['orders', 'idx_orders_session', 'session_id'],
        ['reviews', 'idx_reviews_session', 'session_id'],
        ['notifications', 'idx_notif_session', 'audience, session_id'],
        ['events', 'idx_events_status', 'status'],
    ];
    foreach ($idx as [$t, $i, $c]) {
        if (!indexExists($pdo, $t, $i)) { $pdo->exec("CREATE INDEX `$i` ON `$t` ($c)"); $done[] = "Added index $i"; }
    }
    // plain-text passwords are never usable again
    $n = $pdo->exec("UPDATE brands SET password=NULL, must_change_password=1 WHERE password IS NOT NULL AND password NOT LIKE '$2%'");
    if ($n) $done[] = "Disabled $n plain-text merchant password(s)";
    $pdo->exec("UPDATE brands SET password=NULL, must_change_password=0 WHERE id='lostandfound'");
    return $done;
}

/** True when the stored admin is a real admin (not the old demo default). */
function realAdminExists(PDO $pdo): bool {
    $st = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key='admin_password'");
    $st->execute();
    $hash = $st->fetchColumn();
    if ($hash === false || !isPasswordHash((string)$hash)) return false;
    foreach (bannedDefaultsForCheck() as $p) if (password_verify($p, (string)$hash)) return false;
    return true;
}
/** Rebuilds the banned demo passwords from their character codes (no plain text in this file). */
function bannedDefaultsForCheck(): array {
    $out = [];
    foreach ([[97,100,109,105,110,49,50,51], [49,50,51]] as $codes) {
        $s = implode('', array_map('chr', $codes));
        if (isBannedPassword($s)) $out[] = $s;       // sanity: must match the SHA-256 list in Config.php
    }
    return $out;
}

// ── LOCK ────────────────────────────────────────────────────
if (realAdminExists($pdo) && empty($_SESSION['setup_result'])) {
    page('Setup is locked',
        '<p>An admin account already exists, so this installer refuses to run again.</p>'
      . '<p class="warn">Delete <code>backend/setup.php</code> from your server now.</p>'
      . '<p><a href="../lostandfound.html">Go to the website →</a></p>', 'bad');
}

// ── show the one-time result page (after POST → redirect) ───
if (!empty($_SESSION['setup_result'])) {
    $r = $_SESSION['setup_result'];
    unset($_SESSION['setup_result']);           // shown ONCE only
    $rows = '';
    foreach ($r['temps'] as $t) {
        $rows .= '<tr><td>' . h($t['name']) . '</td><td><code>' . h($t['id']) . '</code></td><td><code>' . h($t['pass']) . '</code></td></tr>';
    }
    $body = '<p>Admin account <b>' . h($r['admin']) . '</b> was created.</p>';
    if ($rows) {
        $body .= '<p><b>Temporary merchant passwords</b> — copy them now, they will never be shown again. '
               . 'Each merchant must change it on first login.</p>'
               . '<table><tr><th>Brand</th><th>Brand ID</th><th>Temporary password</th></tr>' . $rows . '</table>';
    } else {
        $body .= '<p>All merchants already had secure passwords, so none were changed.</p>';
    }
    if ($r['migrated']) $body .= '<p class="hint">Database changes: ' . h(implode('; ', $r['migrated'])) . '.</p>';
    if ($r['images'])   $body .= '<p class="hint">Moved ' . (int)$r['images'] . ' old base64 image(s) into the uploads folder.</p>';
    $body .= '<p class="warn">Now DELETE <code>backend/setup.php</code>. It is locked, but it should not stay on a live server.</p>'
           . '<p><a href="../lostandfound.html">Go to the website and log in →</a></p>';
    page('Setup complete', $body, 'ok');
}

// ── handle the form ─────────────────────────────────────────
$error = '';
$username = '';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $username = trim((string)($_POST['username'] ?? ''));
    $pass     = (string)($_POST['password'] ?? '');
    $confirm  = (string)($_POST['confirm'] ?? '');
    $token    = (string)($_POST['csrf'] ?? '');

    if (!hash_equals(csrfToken(), $token)) {
        $error = 'Form expired. Please try again.';
    } elseif (!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)) {
        $error = 'Username must be 3–50 characters: letters, numbers, dot, dash or underscore.';
    } elseif ($err = passwordStrengthError($pass)) {
        $error = $err;
    } elseif (isBannedPassword($pass)) {
        $error = 'That password is not allowed.';
    } elseif ($pass !== $confirm) {
        $error = 'The two passwords do not match.';
    } else {
        $migrated = migrate($pdo);                       // DDL runs outside the transaction (MySQL auto-commits DDL)
        $pdo->beginTransaction();
        try {
            if (realAdminExists($pdo)) throw new RuntimeException('locked');   // race protection

            $up = $pdo->prepare("INSERT INTO site_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)");
            $up->execute(['admin_username', $username]);
            $up->execute(['admin_password', hashPassword($pass)]);

            // merchants: random temporary passwords where none (or only a demo default) is set
            $temps  = [];
            $banned = bannedDefaultsForCheck();
            $set    = $pdo->prepare("UPDATE brands SET password=?, must_change_password=1 WHERE id=?");
            foreach ($pdo->query("SELECT id,name,password FROM brands WHERE id<>'lostandfound' ORDER BY name")->fetchAll() as $b) {
                $needs = !isPasswordHash($b['password']);
                if (!$needs) foreach ($banned as $p) if (password_verify($p, (string)$b['password'])) { $needs = true; break; }
                if ($needs) {
                    $tmp = randomTempPassword();
                    $set->execute([hashPassword($tmp), $b['id']]);
                    $temps[] = ['id' => $b['id'], 'name' => $b['name'], 'pass' => $tmp];
                }
            }

            // old base64 images → real files
            $images = 0;
            $conv = function ($v, $folder) use (&$images) {
                if (is_string($v) && strncmp($v, 'data:image/', 11) === 0) {
                    $p = storeDataUri($v, $folder);
                    if ($p) { $images++; return $p; }
                    return '';
                }
                return $v;
            };
            foreach ($pdo->query("SELECT id,img,imgs FROM products WHERE img LIKE 'data:%' OR imgs LIKE '%data:image%'")->fetchAll() as $p) {
                $imgs = array_values(array_filter(array_map(function ($x) use ($conv) { return $conv($x, 'products'); }, json_decode((string)$p['imgs'], true) ?: [])));
                $img  = $conv($p['img'], 'products') ?: ($imgs[0] ?? '');
                $pdo->prepare("UPDATE products SET img=?, imgs=? WHERE id=?")->execute([$img, json_encode($imgs, JSON_UNESCAPED_SLASHES), $p['id']]);
            }
            foreach ([['brands', 'img', 'brands'], ['events', 'img', 'events'], ['reviews', 'img', 'reviews'], ['pending_images', 'image_data', 'site']] as [$t, $c, $folder]) {
                foreach ($pdo->query("SELECT id, `$c` AS v FROM `$t` WHERE `$c` LIKE 'data:%'")->fetchAll() as $r) {
                    $pdo->prepare("UPDATE `$t` SET `$c`=? WHERE id=?")->execute([$conv($r['v'], $folder), $r['id']]);
                }
            }
            foreach ($pdo->query("SELECT setting_key, setting_value FROM site_settings WHERE setting_value LIKE 'data:%'")->fetchAll() as $r) {
                $pdo->prepare("UPDATE site_settings SET setting_value=? WHERE setting_key=?")->execute([$conv($r['setting_value'], 'site'), $r['setting_key']]);
            }

            // clean existing text so nothing already stored can inject HTML
            $textCols = [
                'brands' => ['id', ['name', 'tag', 'description', 'location', 'year', 'schedule', 'instagram']],
                'products' => ['id', ['name', 'tag', 'size']],
                'reviews' => ['id', ['author', 'text', 'merchant_reply']],
                'testimonials' => ['id', ['name', 'location', 'text']],
                'testimonial_requests' => ['id', ['brand_name', 'name', 'location', 'text']],
                'events' => ['id', ['title', 'event_time', 'location', 'description']],
                'feedback' => ['id', ['name', 'msg']],
                'orders' => ['id', ['customer_name', 'phone', 'address', 'tracking_number']],
                'order_messages' => ['id', ['text']],
            ];
            foreach ($textCols as $t => [$pk, $cs]) {
                foreach ($pdo->query("SELECT `$pk`, `" . implode('`,`', $cs) . "` FROM `$t`")->fetchAll() as $row) {
                    $changes = [];
                    foreach ($cs as $c) {
                        if ($row[$c] === null) continue;
                        $multi = in_array($c, ['description', 'text', 'merchant_reply', 'msg', 'address'], true);
                        $clean = cleanText($row[$c], 65000, $multi);
                        if ($clean !== $row[$c]) $changes[$c] = $clean;
                    }
                    if ($changes) {
                        $sets = implode(',', array_map(function ($c) { return "`$c`=?"; }, array_keys($changes)));
                        $pdo->prepare("UPDATE `$t` SET $sets WHERE `$pk`=?")->execute(array_merge(array_values($changes), [$row[$pk]]));
                    }
                }
            }

            $pdo->commit();
            session_regenerate_id(true);
            $_SESSION['setup_result'] = ['admin' => $username, 'temps' => $temps, 'migrated' => $migrated, 'images' => $images];
            header('Location: setup.php', true, 303);
            exit;
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            if ($e->getMessage() === 'locked') page('Setup is locked', '<p>An admin was created in the meantime. Delete this file.</p>', 'bad');
            error_log('[lostfound setup] ' . $e->getMessage());
            $error = 'Setup failed: ' . $e->getMessage();
        }
    }
}

// ── the form ────────────────────────────────────────────────
page('Create your admin account',
    '<p>This runs <b>once</b>. It upgrades your database without deleting brands, products or orders, creates your admin login, '
  . 'and gives every merchant a temporary password.</p>'
  . ($error ? '<p class="warn">' . h($error) . '</p>' : '')
  . '<form method="post" autocomplete="off">'
  . '<input type="hidden" name="csrf" value="' . h(csrfToken()) . '">'
  . '<label for="u">Admin username</label><input id="u" name="username" required minlength="3" maxlength="50" value="' . h($username) . '">'
  . '<label for="p">Admin password</label><input id="p" name="password" type="password" required minlength="10" maxlength="72" autocomplete="new-password">'
  . '<p class="hint">At least 10 characters, with letters and numbers.</p>'
  . '<label for="c">Repeat password</label><input id="c" name="confirm" type="password" required minlength="10" maxlength="72" autocomplete="new-password">'
  . '<button type="submit">Create admin &amp; finish setup</button></form>');
````

### 11.22 `backend/config.local.example.php`  (26 lines)

````php
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
````

### 11.23 `backend/config.local.email-example.php`  (32 lines)

````php
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
    'smtp_user'      => 'yourshop@gmail.com',     // ← the Gmail address
    'smtp_pass'      => 'abcdefghijklmnop',       // ← the 16-letter App Password (not your normal password)
    'mail_from'      => 'yourshop@gmail.com',     // ← same Gmail address
    'mail_from_name' => 'Lost & Found Batangas',

    // Address used inside email links. Leave commented on XAMPP (auto-detected).
    // On real hosting / a public link, set it, e.g.:
    // 'app_url' => 'https://your-site.com',
];
````

### 11.24 `backend/config.local.vercel-example.php`  (30 lines)

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

### 11.25 `backend/Sync.js`  (566 lines)

````javascript
/* ============================================================
   sync.js — bridge between lostandfound.js (unchanged) and the
   PHP/MySQL backend, with REAL LOGIN SESSIONS.

   Load this AFTER lostandfound.js:
   <script src="lostandfound.js"></script>
   <script src="backend/sync.js"></script>

   SECURITY:
   The server tracks who's ACTUALLY logged in via a PHP session
   cookie, and checks that on every write. A merchant can only
   ever touch their own brand's data; only the real admin login
   can do admin-only things. Passwords are hashed in the
   database instead of stored as plain text.
   ============================================================ */

   const API = 'backend/Api.php';

async function api(resource, { method = 'GET', id = null, action = null, body = null, query = null } = {}) {
  let url = `${API}?resource=${resource}`;
  if (id !== null) url += `&id=${encodeURIComponent(id)}`;
  if (action) url += `&action=${action}`;
  if (query) for (const k in query) url += `&${k}=${encodeURIComponent(query[k])}`;
  const opts = { method, credentials: 'include' };
  if (body !== null) { opts.headers = { 'Content-Type': 'application/json' }; opts.body = JSON.stringify(body); }
  const res = await fetch(url, opts);
  if (!res.ok) { const t = await res.text(); console.error('API error', url, t); throw new Error(t); }
  return res.status === 204 ? null : res.json();
}

function sessionId() {
  let sid = localStorage.getItem('lf_session_id');
  if (!sid) { sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now(); localStorage.setItem('lf_session_id', sid); }
  return sid;
}

const NOTIF_ICON = k => ICONS[k] || ICONS.bell;

// ── RESTORE LOGIN STATE FROM THE SERVER (not just localStorage) ──
async function restoreServerSession() {
  try {
    const check = await api('auth', { action: 'check' });
    if (check.loggedIn) {
      currentMerchant = getBrand(check.merchantId);
      saveSession();
      const isAdmin = check.isAdmin;
      document.getElementById('merchant-btn').innerHTML = ICONS[isAdmin ? 'key' : 'store'] + ' ' + (isAdmin ? 'Admin' : currentMerchant.name);
      document.getElementById('merchant-btn').classList.add('logged-in');
      if (isAdmin) document.getElementById('merchant-btn').style.background = 'linear-gradient(135deg,#c8a96e,#f0d9a8)';
      document.getElementById('merch-notif-wrap').classList.add('visible');
    } else {
      currentMerchant = null;
    }
  } catch (e) { /* backend offline — leave whatever localStorage had */ }
}

// ── LOAD EVERYTHING FROM THE DATABASE, THEN RE-RENDER ──
async function loadAllData() {
  await restoreServerSession();
  try {
    BRANDS = await api('brands');
    PRODUCTS = (await api('products')).map(p => ({ ...p, id: Number(p.id) }));
    orders = (await api('orders')).map(o => ({
      ...o,
      items: o.items.map(i => ({ ...i, id: Number(i.product_id), qty: Number(i.qty), price: isNaN(i.price) ? i.price : Number(i.price) }))
    }));
    reviews = (await api('reviews')).map(r => ({ ...r, productId: Number(r.product_id), merchantReply: r.merchant_reply }));
    TESTIMONIALS = await api('testimonials');
    TESTIMONIAL_REQUESTS = currentMerchant ? await api('testimonial_requests', { query: { brand: currentMerchant.id } }) : [];
    const dbEvents = await api('events', { query: { session: sessionId() } });
    events = dbEvents.map(e => ({
      id: e.id, brandId: e.brand_id, title: e.title, date: e.event_date, time: e.event_time,
      location: e.location, desc: e.description, img: e.img, postedAt: e.posted_at
    }));
    dbEvents.forEach(e => localStorage.setItem('ev_int_' + e.id, e.interested ? '1' : '0'));
    PENDING_IMAGES = (currentMerchant && currentMerchant.id === 'lostandfound') ? await api('pending_images') : [];
    customerNotifs = (await api('notifications', { query: { audience: 'customer' } })).map(mapNotif);
    if (currentMerchant) {
      merchantNotifs = (await api('notifications', { query: { audience: 'merchant' } })).map(mapNotif);
    }
    const settings = await api('settings');
    applyDbSiteImages(settings);

    persist();
    renderHome();
    renderOrders();
    updateCartUI();
    renderNotifs();
    if (document.getElementById('page-merchant')?.classList.contains('active') && currentMerchant) renderMerchantDash();
    if (document.getElementById('page-catalog')?.classList.contains('active')) renderBrandGrid();
    if (document.getElementById('page-events')?.classList.contains('active')) renderEventsPage();
  } catch (e) {
    console.error('Could not reach backend (api.php). Falling back to local demo data.', e);
  }
}

function mapNotif(n) {
  return { icon: NOTIF_ICON(n.icon), text: n.text, time: new Date(n.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }), read: !!Number(n.is_read), target: n.target, _id: n.id };
}

function applyDbSiteImages(s) {
  if (s.hero_bg) { const bg = document.querySelector('.home-hero-bg'); if (bg) bg.style.backgroundImage = `url('${s.hero_bg}')`; }
  if (s.mascot_bg) { const m = document.getElementById('hero-mascot'); if (m) { m.src = s.mascot_bg; m.style.display = 'block'; } }
  if (s.logo_bg) { const l = document.querySelector('.topbar-brand img'); if (l) { l.src = s.logo_bg; l.style.display = 'block'; } }
  if (s.arrivals_bg) { const bg = document.querySelector('.arrivals-banner-bg'); if (bg) bg.style.backgroundImage = `url('${s.arrivals_bg}')`; }
  if (s.events_bg) { const bg = document.querySelector('.events-banner-bg'); if (bg) bg.style.backgroundImage = `url('${s.events_bg}')`; }
  const slides = document.querySelectorAll('.carousel-slide .cs-bg');
  for (let i = 0; i < 4; i++) { if (s['carousel_' + i] && slides[i]) slides[i].style.backgroundImage = `url('${s['carousel_' + i]}')`; }
}

document.addEventListener('DOMContentLoaded', () => setTimeout(loadAllData, 50));

// ============================================================
// OVERRIDES — same function names as lostandfound.js, redefined
// here (loads after, so these win) to talk to the API with real
// session auth instead of trusting client-claimed IDs.
// ============================================================

// ---------- PRODUCTS ----------
async function saveProduct() {
  const idVal = document.getElementById('pm-id').value;
  const id = idVal ? parseInt(idVal) : null;
  const name = document.getElementById('pm-name').value.trim();
  const priceRaw = document.getElementById('pm-price').value.trim();
  const originalPriceRaw = document.getElementById('pm-original-price').value.trim();
  const tag = document.getElementById('pm-tag').value.trim();
  const size = document.getElementById('pm-size').value.trim();
  const stock = parseInt(document.getElementById('pm-stock').value) || 0;
  const urlInput = document.getElementById('pm-img').value.trim();
  if (urlInput && !pmImgs.includes(urlInput)) pmImgs.push(urlInput);
  const imgs = pmImgs.length ? pmImgs : [];
  const img = imgs[0] || '';
  if (!name || !priceRaw || !tag || !size) { toast('Fill all required fields (*)', 'error'); return; }
  try {
    if (id) {
      await api('products', { method: 'PUT', id, body: { name, price: priceRaw, originalPrice: originalPriceRaw, tag, size, img, imgs, stock } });
      toast('Product updated!', 'success');
    } else {
      await api('products', { method: 'POST', body: { brand: currentMerchant.id, name, price: priceRaw, originalPrice: originalPriceRaw, tag, size, img, imgs, stock, new: true } });
      toast('Product added!', 'success');
    }
    await loadAllData();
    closeProductModal();
    renderMerchantDash();
  } catch (e) { toast('Could not save product — you may need to log in again', 'error'); }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try { await api('products', { method: 'DELETE', id }); await loadAllData(); renderMerchantDash(); toast('Product deleted'); }
  catch (e) { toast('Could not delete — you may need to log in again', 'error'); }
}

async function adjustStock(id) {
  const p = getProduct(id); if (!p) return;
  const v = prompt(`Stock for "${p.name}" (current: ${p.stock || 0}):`, p.stock || 0);
  if (v === null || isNaN(parseInt(v))) return;
  try {
    await api('products', { method: 'PUT', id, action: 'stock', body: { stock: Math.max(0, parseInt(v)) } });
    await loadAllData(); renderMerchantDash(); toast('Stock updated!', 'success');
  } catch (e) { toast('Could not update stock', 'error'); }
}

// ---------- ORDERS ----------
async function placeOrder() {
  if (!selPayMethod) { toast('Please select a payment method', 'error'); return; }
  const name = document.getElementById('pay-name').value.trim() || 'Customer';
  const email = document.getElementById('pay-email').value.trim() || 'customer@email.com';
  const phone = document.getElementById('pay-phone').value.trim();
  const address = document.getElementById('pay-address').value.trim();
  const sourceItems = buyNowItem ? [buyNowItem] : cart;
  const orderItems = sourceItems.map(i => { const p = getProduct(i.productId); return p ? { ...p, qty: i.qty, id: p.id } : null; }).filter(Boolean);
  const sub = orderItems.reduce((s, i) => s + (isNaN(i.price) ? 0 : i.price) * i.qty, 0);
  const total = sub + shippingFee;
  try {
    const r = await api('orders', { method: 'POST', body: { customer: name, email, phone, address, payMethod: selPayMethod, subtotal: sub, shippingFee, total, items: orderItems } });
    if (!buyNowItem) { cart = []; updateCartUI(); }
    buyNowItem = null;
    await loadAllData();
    closeCheckout();
    document.getElementById('conf-order-id').textContent = r.id;
    document.getElementById('conf-email').textContent = email;
    document.getElementById('conf-items').innerHTML = orderItems.map(i => `<div style="display:flex;justify-content:space-between;padding:.35rem 0"><span>${i.name} ×${i.qty}</span><span>${fmtMoney(i.price * i.qty)}</span></div>`).join('');
    document.getElementById('conf-total').textContent = 'Total: ' + fmtMoney(total);
    document.getElementById('confirm-modal').classList.add('on');
    openA11yPanel(document.querySelector('.confirm-card'));
    toast('Order placed!', 'success');
  } catch (e) { toast('Could not place order — check the backend', 'error'); }
}

async function updateOrderStatus(orderId, status) {
  try { await api('orders', { method: 'PUT', id: orderId, action: 'status', body: { status } }); await loadAllData(); toast('Status updated: ' + status, 'success'); renderMerchantDash(); }
  catch (e) { toast('Could not update order — you may need to log in again', 'error'); }
}

async function sendMerchantMsg(orderId) {
  const ti = document.getElementById('ti-' + orderId);
  const mi = document.getElementById('mi-' + orderId);
  const tn = ti?.value.trim(), msg = mi?.value.trim();
  if (!msg && !tn) { toast('Enter a message or tracking number', 'error'); return; }
  try {
    await api('orders', { method: 'POST', id: orderId, action: 'message', body: { role: 'merchant', text: msg || ('Tracking: ' + tn), trackingNumber: tn || null } });
    if (mi) mi.value = '';
    await loadAllData();
    toast('Message sent!', 'success');
    renderMerchantDash();
  } catch (e) { toast('Could not send message', 'error'); }
}

function reorderItems(orderId) {
  const o = orders.find(x => x.id === orderId); if (!o) return;
  let added = 0;
  o.items.forEach(item => {
    const p = getProduct(item.id || item.productId || item.product_id);
    if (p && p.stock > 0) {
      const ex = cart.find(i => i.productId == p.id);
      const curQty = ex ? ex.qty : 0;
      if (curQty + 1 > p.stock) return;
      if (ex) ex.qty++; else cart.push({ productId: p.id, qty: 1 });
      added++;
    }
  });
  persist(); updateCartUI();
  if (added) { toast(added + ' item(s) added to cart!', 'success'); openCart(); } else toast('All items are out of stock', 'error');
}

// ---------- REVIEWS ----------
async function submitReview() {
  const pid = parseInt(document.getElementById('rm-pid').value);
  const rid = document.getElementById('rm-rid').value;
  const text = document.getElementById('rm-text').value.trim();
  if (!reviewStar) { toast('Please select a star rating', 'error'); return; }
  if (!text) { toast('Please write a review', 'error'); return; }
  try {
    if (rid) {
      await api('reviews', { method: 'PUT', id: rid, body: { rating: reviewStar, text, img: reviewImgData } });
      toast('Review updated!', 'success');
    } else {
      await api('reviews', { method: 'POST', body: { productId: pid, author: 'You', rating: reviewStar, text, img: reviewImgData } });
      toast('Review submitted!', 'success');
    }
    await loadAllData();
    closeReviewModal();
    openProductDetail(pid);
  } catch (e) { toast('Could not save review', 'error'); }
}

async function deleteReview(reviewId, productId) {
  if (!confirm('Delete this review?')) return;
  try { await api('reviews', { method: 'DELETE', id: reviewId }); await loadAllData(); toast('Review deleted'); openProductDetail(productId); }
  catch (e) { toast('Could not delete review', 'error'); }
}

async function submitMerchantReply(reviewId, btn) {
  const area = btn.closest('.review-respond-area');
  const txt = area?.querySelector('textarea')?.value.trim();
  if (!txt) { toast('Enter a reply', 'error'); return; }
  try { await api('reviews', { method: 'PUT', id: reviewId, action: 'reply', body: { reply: txt } }); await loadAllData(); toast('Reply submitted!', 'success'); renderMerchantDash(); }
  catch (e) { toast('Could not save reply — you may need to log in again', 'error'); }
}

// ---------- TESTIMONIALS ----------
async function submitTestimonialRequest() {
  const name = document.getElementById('tr-name').value.trim();
  const loc = document.getElementById('tr-loc').value.trim();
  const rating = parseInt(document.getElementById('tr-rating').value);
  const text = document.getElementById('tr-text').value.trim();
  if (!name || !loc || !text) { toast('Fill all required fields', 'error'); return; }
  try {
    await api('testimonial_requests', { method: 'POST', body: { brandId: currentMerchant.id, brandName: currentMerchant.name, name, location: loc, rating, text } });
    toast('Testimonial request submitted! Waiting for admin approval.', 'success');
    ['tr-name', 'tr-loc', 'tr-text'].forEach(id => document.getElementById(id).value = '');
    await loadAllData();
    renderMerchTestimRequestsList();
  } catch (e) { toast('Could not submit request', 'error'); }
}

async function approveTestimonialRequest(reqId) {
  try { await api('testimonial_requests', { method: 'PUT', id: reqId, action: 'approve' }); await loadAllData(); toast('Testimonial approved and added to homepage!', 'success'); renderFeedbackPanel(); renderHome(); }
  catch (e) { toast('Could not approve — admin login required', 'error'); }
}
async function rejectTestimonialRequest(reqId) {
  try { await api('testimonial_requests', { method: 'PUT', id: reqId, action: 'reject' }); await loadAllData(); toast('Request rejected', 'error'); renderFeedbackPanel(); }
  catch (e) { toast('Could not reject — admin login required', 'error'); }
}
async function adminAddTestimonial() {
  const name = document.getElementById('at-name').value.trim();
  const loc = document.getElementById('at-loc').value.trim();
  const rating = parseInt(document.getElementById('at-rating').value);
  const text = document.getElementById('at-text').value.trim();
  if (!name || !loc || !text) { toast('Fill all required fields', 'error'); return; }
  try {
    await api('testimonials', { method: 'POST', body: { name, location: loc, rating, text } });
    toast('Testimonial added to homepage!', 'success');
    ['at-name', 'at-loc', 'at-text'].forEach(id => document.getElementById(id).value = '');
    await loadAllData(); renderFeedbackPanel(); renderHome();
  } catch (e) { toast('Could not add testimonial — admin login required', 'error'); }
}
async function deleteTestimonial(id) {
  if (!confirm('Remove this testimonial from the homepage?')) return;
  try { await api('testimonials', { method: 'DELETE', id }); await loadAllData(); toast('Testimonial removed'); renderFeedbackPanel(); renderHome(); }
  catch (e) { toast('Could not remove testimonial — admin login required', 'error'); }
}

// ---------- EVENTS ----------
async function saveEvent() {
  if (!currentMerchant) return;
  const title = document.getElementById('ev-title').value.trim();
  const date = document.getElementById('ev-date').value;
  const time = document.getElementById('ev-time').value.trim();
  const location = document.getElementById('ev-location').value.trim();
  const desc = document.getElementById('ev-desc').value.trim();
  const img = document.getElementById('ev-img').value.trim();
  if (!title || !date || !location) { toast('Fill in Title, Date, and Location', 'error'); return; }
  try {
    await api('events', { method: 'POST', body: { brandId: currentMerchant.id, title, date, time, location, desc, img } });
    ['ev-title', 'ev-date', 'ev-time', 'ev-location', 'ev-desc', 'ev-img'].forEach(id => { document.getElementById(id).value = ''; });
    toast('Event posted!', 'success');
    await loadAllData();
    renderMerchEventsPanel();
  } catch (e) { toast('Could not post event', 'error'); }
}
async function deleteEvent(evId) {
  if (!confirm('Delete this event?')) return;
  try { await api('events', { method: 'DELETE', id: evId }); await loadAllData(); toast('Event deleted'); renderMerchEventsPanel(); }
  catch (e) { toast('Could not delete event — you may need to log in again', 'error'); }
}

async function toggleInterestFor(evId) {
  try { const r = await api('event_interests', { method: 'POST', body: { eventId: evId, sessionId: sessionId() } }); return r.interested; }
  catch (e) { toast('Could not save', 'error'); return null; }
}
async function toggleInterested(evId, btn) {
  const on = await toggleInterestFor(evId); if (on === null) return;
  btn.classList.toggle('on', on);
  btn.innerHTML = on ? ICONS.star + ' Interested' : 'Interested';
  toast(on ? 'Marked as interested!' : 'Removed interest', on ? 'success' : '');
}
async function toggleInterestedFromCard(evId, btn) {
  const on = await toggleInterestFor(evId); if (on === null) return;
  btn.innerHTML = ICONS.star + ' Interested';
  btn.style.background = on ? 'var(--accent)' : 'none';
  btn.style.color = on ? 'var(--black)' : 'var(--g4)';
  btn.style.borderColor = on ? 'var(--accent)' : 'var(--g2)';
  toast(on ? 'Marked as interested!' : 'Removed interest', on ? 'success' : '');
}
async function toggleInterestedModal() {
  if (!currentEventDetailId) return;
  const on = await toggleInterestFor(currentEventDetailId); if (on === null) return;
  const btn = document.getElementById('edm-interest-btn');
  btn.innerHTML = on ? ICONS.star + ' Interested' : 'Mark as Interested';
  btn.style.background = on ? 'var(--black)' : 'var(--accent)';
  btn.style.color = on ? '#fff' : 'var(--black)';
  toast(on ? 'Marked as interested!' : 'Removed interest', on ? 'success' : '');
  renderEventsPage();
}

// ---------- PENDING IMAGE APPROVALS ----------
async function submitForApproval(type, imageData, targetIndex, label) {
  if (!currentMerchant) return;
  try {
    await api('pending_images', { method: 'POST', body: { merchantId: currentMerchant.id, merchantName: currentMerchant.name, type, imageData, targetIndex, label } });
    toast('Image submitted — waiting for admin approval', 'success');
    await loadAllData();
  } catch (e) { toast('Could not submit image', 'error'); }
}
async function approveImage(imgId) {
  try { await api('pending_images', { method: 'PUT', id: imgId, action: 'approve' }); await loadAllData(); toast('Image approved and live', 'success'); renderImageApprovals(); }
  catch (e) { toast('Could not approve — admin login required', 'error'); }
}
async function rejectImage(imgId) {
  try { await api('pending_images', { method: 'PUT', id: imgId, action: 'reject' }); await loadAllData(); toast('Image rejected', 'error'); renderImageApprovals(); }
  catch (e) { toast('Could not reject — admin login required', 'error'); }
}

// ---------- SITE IMAGES (admin) ----------
function fileToDataUrl(input) { return new Promise((res, rej) => { const f = input.files[0]; if (!f) return rej(); const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsDataURL(f); }); }

async function adminUploadHero(input) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  if (currentMerchant?.id === 'lostandfound') { await api('settings', { method: 'PUT', body: { key: 'hero_bg', value: data } }); await loadAllData(); toast('Hero background updated!', 'success'); }
  else submitForApproval('hero', data, null, 'Hero Background');
}
async function adminUploadMascot(input) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  try { await api('settings', { method: 'PUT', body: { key: 'mascot_bg', value: data } }); await loadAllData(); toast('Mascot updated!', 'success'); }
  catch (e) { toast('Admin login required', 'error'); }
}
async function adminUploadLogo(input) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  try { await api('settings', { method: 'PUT', body: { key: 'logo_bg', value: data } }); await loadAllData(); toast('Logo updated!', 'success'); }
  catch (e) { toast('Admin login required', 'error'); }
}
async function adminUploadCarousel(input, slideIdx) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  if (currentMerchant?.id === 'lostandfound') { await api('settings', { method: 'PUT', body: { key: 'carousel_' + slideIdx, value: data } }); await loadAllData(); toast('Carousel slide ' + (slideIdx + 1) + ' updated!', 'success'); }
  else submitForApproval('carousel', data, slideIdx, 'Carousel Slide ' + (slideIdx + 1));
}
async function adminUploadArrivalsBanner(input) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  if (currentMerchant?.id === 'lostandfound') { await api('settings', { method: 'PUT', body: { key: 'arrivals_bg', value: data } }); await loadAllData(); toast('Arrivals banner updated!', 'success'); }
  else submitForApproval('arrivals', data, null, 'Arrivals Banner');
}
async function adminUploadEventsBanner(input) {
  const data = await fileToDataUrl(input).catch(() => null); if (!data) return;
  if (currentMerchant?.id === 'lostandfound') { await api('settings', { method: 'PUT', body: { key: 'events_bg', value: data } }); await loadAllData(); toast('Events banner updated!', 'success'); }
  else submitForApproval('events', data, null, 'Events Banner');
}
async function adminResetAllImages() {
  if (!confirm('Reset ALL custom images back to defaults?')) return;
  try { await api('settings', { method: 'DELETE' }); toast('All images reset to defaults. Reloading...', 'success'); setTimeout(() => location.reload(), 1200); }
  catch (e) { toast('Admin login required', 'error'); }
}

// ---------- BRANDS ----------
async function adminAddBrand() {
  const id = document.getElementById('nb-id').value.trim().toLowerCase().replace(/\s+/g, '');
  const name = document.getElementById('nb-name').value.trim();
  const tag = document.getElementById('nb-tag').value;
  const loc = document.getElementById('nb-loc').value.trim();
  const year = document.getElementById('nb-year').value.trim();
  const ig = document.getElementById('nb-ig').value.trim();
  const desc = document.getElementById('nb-desc').value.trim();
  const pass = document.getElementById('nb-pass').value;
  if (!id || !name) { toast('Brand ID and Name are required', 'error'); return; }
  if (BRANDS.find(b => b.id === id)) { toast('Brand ID already exists! Use a different ID.', 'error'); return; }
  try {
    await api('brands', { method: 'POST', body: { id, name, tag, desc, location: loc, year, instagram: ig, password: pass } });
    toast('Brand "' + name + '" added! They can now log in with password: ' + pass, 'success');
    ['nb-id', 'nb-name', 'nb-loc', 'nb-year', 'nb-ig', 'nb-desc'].forEach(x => document.getElementById(x).value = '');
    document.getElementById('nb-pass').value = '';
    await loadAllData();
    renderAdminBrandsList();
  } catch (e) { toast('Could not add brand — admin login required', 'error'); }
}
async function adminDeleteBrand(brandId) {
  const b = getBrand(brandId);
  if (!confirm('Delete brand "' + b.name + '"? This will also remove all their products!')) return;
  try { await api('brands', { method: 'DELETE', id: brandId }); await loadAllData(); toast('Brand deleted', 'success'); renderAdminBrandsList(); }
  catch (e) { toast('Could not delete brand — admin login required', 'error'); }
}
async function saveBrand() {
  const name = document.getElementById('bm-name').value.trim();
  const tag = document.getElementById('bm-tag').value.trim();
  const desc = document.getElementById('bm-desc').value.trim();
  const loc = document.getElementById('bm-loc').value.trim();
  const year = document.getElementById('bm-year').value.trim();
  const ig = document.getElementById('bm-ig').value.trim();
  const img = document.getElementById('bm-img').value.trim();
  try {
    await api('brands', { method: 'PUT', id: currentMerchant.id, body: { name, tag, desc, location: loc, year, instagram: ig, img } });
    await loadAllData();
    currentMerchant = getBrand(currentMerchant.id); saveSession();
    toast('Brand updated!', 'success');
    closeBrandModal();
    renderMerchantDash();
  } catch (e) { toast('Could not update brand', 'error'); }
}
async function saveBrandDesc(brandId) {
  const txt = document.getElementById('brand-desc-ta').value.trim();
  try {
    await api('brands', { method: 'PUT', id: brandId, body: { ...getBrand(brandId), desc: txt } });
    await loadAllData();
    if (currentMerchant && currentMerchant.id === brandId) { currentMerchant.desc = txt; saveSession(); }
    toast('Description updated!', 'success');
    showBrand(brandId);
  } catch (e) { toast('Could not update description', 'error'); }
}

// ---------- AUTH ----------
async function merchantLogin() {
  document.getElementById('mm-error').style.display = 'none';
  if (currentLoginRole === 'admin') {
    const user = document.getElementById('mm-admin-user').value.trim();
    const pass = document.getElementById('mm-admin-pass').value;
    try {
      const r = await api('auth', { method: 'POST', action: 'admin_login', body: { username: user, password: pass } });
      if (!r.ok) throw 0;
    } catch (e) { document.getElementById('mm-error').style.display = 'block'; return; }
    currentMerchant = getBrand('lostandfound');
    saveSession();
    document.getElementById('merchant-btn').innerHTML = ICONS.key + ' Admin';
    document.getElementById('merchant-btn').classList.add('logged-in');
    document.getElementById('merchant-btn').style.background = 'linear-gradient(135deg,#c8a96e,#f0d9a8)';
    document.getElementById('merch-notif-wrap').classList.add('visible');
    closeMerchantModal(); navigateTo('merchant');
    toast('Admin access granted!', 'success');
  } else {
    const brandId = document.getElementById('mm-brand-select').value;
    const pass = document.getElementById('mm-pass').value;
    try {
      const r = await api('auth', { method: 'POST', action: 'merchant_login', body: { brandId, password: pass } });
      if (!r.ok) throw 0;
    } catch (e) { document.getElementById('mm-error').style.display = 'block'; return; }
    currentMerchant = getBrand(brandId);
    saveSession();
    document.getElementById('merchant-btn').innerHTML = ICONS.store + ' ' + currentMerchant.name;
    document.getElementById('merchant-btn').classList.add('logged-in');
    document.getElementById('merchant-btn').style.background = '';
    document.getElementById('merch-notif-wrap').classList.add('visible');
    closeMerchantModal(); navigateTo('merchant');
    toast('Welcome back, ' + currentMerchant.name + '!', 'success');
  }
  await loadAllData();
}

async function merchantLogout() {
  try { await api('auth', { method: 'POST', action: 'logout' }); } catch (e) {}
  currentMerchant = null;
  saveSession();
  document.getElementById('merchant-btn').innerHTML = ICONS.user + ' Merchant';
  document.getElementById('merchant-btn').classList.remove('logged-in');
  document.getElementById('merchant-btn').style.background = '';
  document.getElementById('merch-notif-wrap').classList.remove('visible');
  navigateTo('home');
  toast('Logged out');
}

async function saveMerchantPassword() {
  if (!currentMerchant || currentMerchant.id === 'lostandfound') return;
  const cur = document.getElementById('sec-cur').value;
  const nw = document.getElementById('sec-new').value;
  const conf = document.getElementById('sec-confirm').value;
  const errEl = document.getElementById('sec-error');
  if (nw.length < 4) { errEl.textContent = 'New password must be at least 4 characters.'; errEl.style.display = 'block'; return; }
  if (nw !== conf) { errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; return; }
  try {
    const r = await api('auth', { method: 'POST', action: 'change_password', body: { currentPassword: cur, newPassword: nw } });
    if (!r.ok) { errEl.textContent = r.error || 'Current password is incorrect.'; errEl.style.display = 'block'; return; }
    errEl.style.display = 'none';
    ['sec-cur', 'sec-new', 'sec-confirm'].forEach(id => document.getElementById(id).value = '');
    toast('Password updated successfully!', 'success');
  } catch (e) { errEl.textContent = 'Could not update password.'; errEl.style.display = 'block'; }
}

// ---------- NOTIFICATIONS ----------
async function handleNotifClick(type, idx) {
  const notifs = type === 'customer' ? customerNotifs : merchantNotifs;
  const n = notifs[idx];
  if (!n) return;
  n.read = true;
  try { if (n._id) await api('notifications', { method: 'PUT', id: n._id }); } catch (e) {}
  renderNotifs(); closeAllDropdowns();
  if (n.target === 'orders') navigateTo('orders');
  else if (n.target === 'orders-merch' && currentMerchant) navigateTo('merchant');
  else if (n.target === 'catalog') navigateTo('catalog');
}
async function clearNotifs(type) {
  try { await api('notifications', { method: 'DELETE', query: { audience: type } }); } catch (e) {}
  if (type === 'customer') customerNotifs = []; else merchantNotifs = [];
  renderNotifs(); closeAllDropdowns();
}

// ---------- FEEDBACK ----------
async function submitFeedback() {
  const name = document.getElementById('fb-name').value.trim();
  const msg = document.getElementById('fb-msg').value.trim();
  const type = document.getElementById('fb-type').value;
  if (!name) { toast('Please enter your name', 'error'); document.getElementById('fb-name').focus(); return; }
  if (!msg) { toast('Please write a message', 'error'); document.getElementById('fb-msg').focus(); return; }
  try {
    await api('feedback', { method: 'POST', body: { name, type, msg } });
    toast('Feedback sent! Thank you ' + name, 'success');
    closeFeedback();
  } catch (e) { toast('Could not send feedback', 'error'); }
}
````

### 11.26 `backend/SyncSecure.js`  (603 lines)

````javascript
/* ============================================================
   SyncSecure.js — security + completeness layer for Sync.js.

   LOAD ORDER (in lostandfound.html, right before </body>):
     <script src="lostandfound.js"></script>
     <script src="backend/Sync.js"></script>
     <script src="backend/SyncSecure.js"></script>

   Same approach as Sync.js: nothing in lostandfound.js or Sync.js
   is rewritten. Functions are overridden (same name, loaded
   later) or wrapped (original is called, then extra work).

   What this file adds:
     • CSRF token on every POST/PUT/DELETE, clear server error
       messages in the existing toast()
     • real image uploads (files in /uploads, not base64)
     • localStorage only for cart / recently viewed / visitor id
     • forced password change for temporary passwords
     • strong-password rules for admin-created merchants
     • event approval (admin), feedback list from the database
     • customers can only edit/delete their own reviews
   ============================================================ */

// Where the API lives. If you ever host the frontend on a different
// domain than PHP, set  window.LF_API_URL = 'https://your-php-host/backend/Api.php'
// in a <script> BEFORE this file (and add that origin in config.local.php).
const LF = {
  apiUrl: (typeof window.LF_API_URL === 'string' && window.LF_API_URL) || 'backend/Api.php',
  csrf: null,
  auth: { loggedIn: false, isAdmin: false, merchantId: null },
  mustChange: false,
  lastError: null,
  lastErrorAt: 0,
  errorCount: 0,
  eventStatus: {},
  maxUploadBytes: 5 * 1024 * 1024,
  uploadTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

/* ---------- small helpers ---------- */
function lfEsc(v) {
  return String(v == null ? '' : v).replace(/[&<>"'`]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]));
}
function lfSetError(msg) { LF.lastError = msg; LF.lastErrorAt = Date.now(); LF.errorCount++; }
function lfIsAdmin() { return !!(currentMerchant && currentMerchant.id === 'lostandfound'); }
function lfPasswordProblem(p) {
  if (!p || p.length < 10) return 'Password must be at least 10 characters.';
  if (p.length > 72) return 'Password must be at most 72 characters.';
  if (!/[A-Za-z]/.test(p)) return 'Password must contain at least one letter.';
  if (!/[0-9]/.test(p)) return 'Password must contain at least one number.';
  return null;
}
function lfIsImageRef(url) {
  return !!url && (/^https:\/\//i.test(url) || /^uploads\//.test(url) || /^(brand pics|products for [^/]+)\//.test(url));
}

/* ---------- 1. localStorage: only harmless UI data from now on ---------- */
(function lfCleanupLegacyStorage() {
  const legacy = ['lf_testimonials', 'lf_testim_reqs', 'lf_brands2', 'lf_products2', 'lf_orders2', 'lf_reviews2',
    'lf_cnotifs', 'lf_mnotifs', 'lf_pending_imgs', 'lf_events', 'lf_feedbacks', 'lf_merchant_passwords',
    'lf_admin_hero_bg', 'lf_admin_mascot', 'lf_admin_logo', 'lf_admin_carousel', 'lf_admin_arrivals_bg', 'lf_admin_events_bg'];
  try { legacy.forEach(k => localStorage.removeItem(k)); } catch (e) { /* private mode */ }
})();

// persist(): real data lives in MySQL now — keep only the cart and browsing UI state locally
function persist() {
  try {
    localStorage.setItem('lf_cart', JSON.stringify(cart));
    localStorage.setItem('lf_rv', JSON.stringify(recentlyViewed));
    localStorage.setItem('lf_browse', JSON.stringify(browseHistory));
  } catch (e) { /* storage full / private mode */ }
}
function persistImgs() { /* pending images are stored in the database */ }
function persistEvents() { /* events are stored in the database */ }
function applyAdminImages() { /* site images come from the database (Sync.js → applyDbSiteImages) */ }

// anonymous visitor id — cryptographically random (keeps any id this browser already has)
function sessionId() {
  let sid = null;
  try { sid = localStorage.getItem('lf_session_id'); } catch (e) { }
  if (!sid || !/^[A-Za-z0-9_]{8,100}$/.test(sid)) {
    const a = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(a);
    sid = 'sess_' + Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
    try { localStorage.setItem('lf_session_id', sid); } catch (e) { }
  }
  return sid;
}

/* ---------- 2. API wrapper with CSRF + readable errors ---------- */
function lfAbsorb(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return;
  if (data.csrfToken) LF.csrf = data.csrfToken;
  if ('mustChangePassword' in data) LF.mustChange = !!data.mustChangePassword;
  if ('loggedIn' in data) LF.auth = { loggedIn: !!data.loggedIn, isAdmin: !!data.isAdmin, merchantId: data.merchantId || null };
}

async function lfFetchCsrf() {
  const res = await fetch(`${LF.apiUrl}?resource=auth&action=check&session=${encodeURIComponent(sessionId())}`,
    { credentials: 'include', headers: { 'Accept': 'application/json' } });
  const data = await res.json().catch(() => null);
  lfAbsorb(data);
  return LF.csrf;
}

// Same signature as api() in Sync.js, so every Sync.js function now uses this one.
async function api(resource, { method = 'GET', id = null, action = null, body = null, query = null } = {}, _retried = false) {
  const params = new URLSearchParams({ resource });
  if (id !== null && id !== undefined) params.set('id', id);
  if (action) params.set('action', action);
  if (query) for (const k in query) params.set(k, query[k]);
  if (!params.has('session')) params.set('session', sessionId());

  const opts = { method, credentials: 'include', headers: { 'Accept': 'application/json' } };
  if (method !== 'GET') {
    if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } }
    opts.headers['X-CSRF-Token'] = LF.csrf || '';
  }
  if (body !== null && body !== undefined) {
    if (body instanceof FormData) opts.body = body;
    else { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  }

  let res;
  try { res = await fetch(`${LF.apiUrl}?${params.toString()}`, opts); }
  catch (e) {
    lfSetError('Cannot reach the server. Check that Apache and MySQL are running.');
    throw e;
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

  if (!res.ok) {
    if (res.status === 403 && data && data.code === 'csrf' && !_retried) {
      LF.csrf = null;                                   // token expired → fetch a new one, retry once
      return api(resource, { method, id, action, body, query }, true);
    }
    if (data && data.code === 'must_change_password') { LF.mustChange = true; setTimeout(() => lfOpenPasswordModal(true), 50); }
    if (res.status === 401 && data && data.code === 'not_logged_in' && currentMerchant) lfResetLoggedOutUi();
    const msg = (data && data.error) || (text && !data ? 'Server error — check the PHP error log.' : 'Request failed (' + res.status + ').');
    lfSetError(msg);
    console.error('API error', resource, action || '', res.status, msg);
    const err = new Error(msg); err.status = res.status; err.data = data;
    throw err;
  }

  lfAbsorb(data);
  if (resource === 'auth' && action === 'logout') { LF.csrf = null; LF.mustChange = false; LF.auth = { loggedIn: false, isAdmin: false, merchantId: null }; }
  if (resource === 'events' && method === 'GET' && Array.isArray(data)) {
    LF.eventStatus = {};
    data.forEach(e => { LF.eventStatus[e.id] = e.status || 'approved'; try { localStorage.setItem('ev_int_' + e.id, e.interested ? '1' : '0'); } catch (x) { } });
  }
  return data;
}

// Sync.js shows generic error toasts ("Could not save product…").
// If the server just explained WHY, show that message instead.
const _lfToast = toast;
toast = function (msg, type = '') {
  if (type === 'error' && LF.lastError && Date.now() - LF.lastErrorAt < 1500) { msg = LF.lastError; LF.lastError = null; }
  return _lfToast(msg, type);
};

/* ---------- 3. image uploads → real files ---------- */
async function lfUpload(file, category) {
  if (!file) throw new Error('No file selected');
  if (!LF.uploadTypes.includes(file.type)) { lfSetError('Only JPG, PNG or WEBP images are allowed.'); toast('Only JPG, PNG or WEBP images are allowed.', 'error'); throw new Error('type'); }
  if (file.size > LF.maxUploadBytes) { lfSetError('Image is larger than 5 MB.'); toast('Image is larger than 5 MB.', 'error'); throw new Error('size'); }
  const fd = new FormData();
  fd.append('file', file);
  const r = await api('upload', { method: 'POST', query: { category }, body: fd });
  return r.path;
}

// product images (max 5)
async function handleImgsUpload(input) {
  const files = Array.from(input.files || []).slice(0, Math.max(0, 5 - pmImgs.length));
  if (!files.length) { toast('Maximum of 5 images per product', 'error'); return; }
  toast('Uploading ' + files.length + ' image(s)…');
  for (const f of files) {
    try { pmImgs.push(await lfUpload(f, 'products')); renderPmImgsPreview(); }
    catch (e) { if (e.message !== 'type' && e.message !== 'size') toast('Upload failed', 'error'); }
  }
  input.value = '';
}
function addImgUrl(url) {
  url = (url || '').trim();
  if (!url || pmImgs.length >= 5) return;
  if (!/^https:\/\//i.test(url)) { toast('Image links must start with https://', 'error'); return; }
  pmImgs.push(url); renderPmImgsPreview();
}

// brand banner
async function handleBrandImgUpload(input) {
  const file = input.files && input.files[0]; if (!file) return;
  try {
    const path = await lfUpload(file, 'brands');
    const preview = document.getElementById('bm-preview'), area = document.getElementById('bm-upload-area');
    document.getElementById('bm-img').value = path;
    preview.src = path; preview.style.display = 'block'; area.classList.add('has-image');
    toast('Image uploaded — click Save Brand to apply', 'success');
  } catch (e) { if (e.message !== 'type' && e.message !== 'size') toast('Upload failed', 'error'); }
  input.value = '';
}
function previewBrandImgFromUrl(url) {
  const preview = document.getElementById('bm-preview'), area = document.getElementById('bm-upload-area');
  if (lfIsImageRef(url)) {
    preview.src = url; preview.style.display = 'block'; area.classList.add('has-image');
    preview.onerror = () => { preview.style.display = 'none'; area.classList.remove('has-image'); };
  } else { preview.src = ''; preview.style.display = 'none'; area.classList.remove('has-image'); }
}

// event banner
async function handleEvImgUpload(input) {
  const file = input.files && input.files[0]; if (!file) return;
  try {
    const path = await lfUpload(file, 'events');
    document.getElementById('ev-img').value = path;
    const preview = document.getElementById('ev-preview'), area = document.getElementById('ev-upload-area');
    preview.src = path; preview.style.display = 'block'; area.classList.add('has-image');
    toast('Image uploaded!', 'success');
  } catch (e) { if (e.message !== 'type' && e.message !== 'size') toast('Upload failed', 'error'); }
  input.value = '';
}
function previewEvImgFromUrl(url) {
  const preview = document.getElementById('ev-preview'), area = document.getElementById('ev-upload-area');
  if (lfIsImageRef(url)) {
    preview.src = url; preview.style.display = 'block'; area.classList.add('has-image');
    preview.onerror = () => { preview.style.display = 'none'; area.classList.remove('has-image'); };
  } else { preview.src = ''; preview.style.display = 'none'; area.classList.remove('has-image'); }
}

// review photo (customers)
async function handleReviewImg(input) {
  const file = input.files && input.files[0]; if (!file) return;
  try {
    reviewImgData = await lfUpload(file, 'reviews');
    document.getElementById('rm-img-preview').innerHTML = `<img src="${lfEsc(reviewImgData)}" alt="preview">`;
  } catch (e) { if (e.message !== 'type' && e.message !== 'size') toast('Upload failed', 'error'); }
  input.value = '';
}

// site images (admin saves directly, merchants submit for approval)
async function lfSiteImage(input, key, approvalType, targetIndex, label, adminOnly) {
  const file = input.files && input.files[0]; if (!file) return;
  input.value = '';
  let path;
  try { path = await lfUpload(file, 'site'); } catch (e) { if (e.message !== 'type' && e.message !== 'size') toast('Upload failed', 'error'); return; }
  if (lfIsAdmin()) {
    try { await api('settings', { method: 'PUT', body: { key, value: path } }); await loadAllData(); toast(label + ' updated!', 'success'); }
    catch (e) { toast('Could not save image', 'error'); }
  } else if (adminOnly) {
    toast('Only the admin can change the ' + label.toLowerCase(), 'error');
  } else {
    submitForApproval(approvalType, path, targetIndex, label);
  }
}
function adminUploadHero(input) { return lfSiteImage(input, 'hero_bg', 'hero', null, 'Hero Background', false); }
function adminUploadMascot(input) { return lfSiteImage(input, 'mascot_bg', null, null, 'Mascot', true); }
function adminUploadLogo(input) { return lfSiteImage(input, 'logo_bg', null, null, 'Logo', true); }
function adminUploadCarousel(input, i) { return lfSiteImage(input, 'carousel_' + i, 'carousel', i, 'Carousel Slide ' + (i + 1), false); }
function adminUploadArrivalsBanner(input) { return lfSiteImage(input, 'arrivals_bg', 'arrivals', null, 'Arrivals Banner', false); }
function adminUploadEventsBanner(input) { return lfSiteImage(input, 'events_bg', 'events', null, 'Events Banner', false); }

/* ---------- 4. login / session / passwords ---------- */
function lfResetLoggedOutUi() {
  currentMerchant = null;
  saveSession();
  const btn = document.getElementById('merchant-btn');
  if (btn) { btn.innerHTML = ICONS.user + ' Merchant'; btn.classList.remove('logged-in'); btn.style.background = ''; }
  const nw = document.getElementById('merch-notif-wrap'); if (nw) nw.classList.remove('visible');
  if (document.getElementById('page-merchant')?.classList.contains('active')) navigateTo('home');
}

const _lfLoadAllData = loadAllData;
loadAllData = async function () {
  const errorsBefore = LF.errorCount;
  await _lfLoadAllData();
  // Sync.js restores the login before brands are loaded; retry once for brands it didn't know yet
  if (LF.auth.loggedIn && !currentMerchant && typeof getBrand === 'function' && getBrand(LF.auth.merchantId)) {
    await _lfLoadAllData();
  }
  if (!LF.auth.loggedIn && currentMerchant) lfResetLoggedOutUi();
  if (LF.errorCount > errorsBefore && LF.lastError && /reach the server|database|Server error/i.test(LF.lastError)) toast(LF.lastError, 'error');
  if (LF.auth.loggedIn && LF.mustChange) lfOpenPasswordModal(true);
};

const _lfMerchantLogin = merchantLogin;
merchantLogin = async function () {
  const errEl = document.getElementById('mm-error');
  if (!errEl.dataset.defaultText) errEl.dataset.defaultText = errEl.textContent;
  errEl.textContent = errEl.dataset.defaultText;
  const errorsBefore = LF.errorCount;
  await _lfMerchantLogin();
  if (LF.errorCount > errorsBefore && LF.lastError && errEl.style.display === 'block') {
    errEl.textContent = LF.lastError; LF.lastError = null;
  }
  if (LF.mustChange && currentMerchant) lfOpenPasswordModal(true);
};

const _lfMerchantLogout = merchantLogout;
merchantLogout = async function () {
  await _lfMerchantLogout();
  lfClosePasswordModal();
  await loadAllData();           // reload so merchant-only data disappears from this browser
};

// Password modal — forced (temporary password) or voluntary.
function lfOpenPasswordModal(forced) {
  if (document.getElementById('lf-pw-modal')) return;
  const wrap = document.createElement('div');
  wrap.id = 'lf-pw-modal';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-labelledby', 'lf-pw-title');
  wrap.style.cssText = 'position:fixed;inset:0;background:rgba(12,11,9,.72);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem';
  wrap.innerHTML = `
    <div style="background:#fff;border-radius:var(--r2,14px);padding:1.8rem;max-width:440px;width:100%;box-shadow:var(--shadow,0 10px 40px rgba(0,0,0,.25))">
      <div id="lf-pw-title" style="font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:.02em;margin-bottom:.4rem">${forced ? 'Set your new password' : 'Change password'}</div>
      <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">${forced
        ? 'You logged in with a temporary password. Choose your own password to continue.'
        : 'Use at least 10 characters with letters and numbers.'}</p>
      <label class="pay-label" for="lf-pw-cur">${forced ? 'Temporary password' : 'Current password'} *</label>
      <input id="lf-pw-cur" class="pay-input" type="password" autocomplete="current-password">
      <label class="pay-label" for="lf-pw-new">New password *</label>
      <input id="lf-pw-new" class="pay-input" type="password" autocomplete="new-password" placeholder="Min. 10 characters, letters + numbers">
      <label class="pay-label" for="lf-pw-conf">Repeat new password *</label>
      <input id="lf-pw-conf" class="pay-input" type="password" autocomplete="new-password">
      <div id="lf-pw-err" role="alert" style="display:none;background:#fee2e2;border:1px solid var(--red,#b91c1c);border-radius:var(--r,8px);padding:.65rem 1rem;font-size:.855rem;color:var(--red,#b91c1c);margin-bottom:.9rem"></div>
      <div style="display:flex;gap:.6rem;margin-top:.4rem">
        <button class="edit-cancel-btn" style="flex:1" id="lf-pw-cancel">${forced ? 'Log out' : 'Cancel'}</button>
        <button class="edit-save-btn" style="flex:2" id="lf-pw-save">Save password</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  document.getElementById('lf-pw-cancel').onclick = () => { if (forced) merchantLogout(); else lfClosePasswordModal(); };
  document.getElementById('lf-pw-save').onclick = lfSubmitPasswordModal;
  document.getElementById('lf-pw-conf').onkeydown = e => { if (e.key === 'Enter') lfSubmitPasswordModal(); };
  setTimeout(() => document.getElementById('lf-pw-cur')?.focus(), 50);
}
function lfClosePasswordModal() { document.getElementById('lf-pw-modal')?.remove(); }
async function lfSubmitPasswordModal() {
  const cur = document.getElementById('lf-pw-cur').value;
  const nw = document.getElementById('lf-pw-new').value;
  const conf = document.getElementById('lf-pw-conf').value;
  const err = document.getElementById('lf-pw-err');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  if (!cur) return show('Enter your current password.');
  const problem = lfPasswordProblem(nw); if (problem) return show(problem);
  if (nw !== conf) return show('The new passwords do not match.');
  try {
    await api('auth', { method: 'POST', action: 'change_password', body: { currentPassword: cur, newPassword: nw } });
    LF.mustChange = false;
    lfClosePasswordModal();
    toast('Password updated!', 'success');
    await loadAllData();
  } catch (e) { show(e.message || 'Could not update password.'); LF.lastError = null; }
}
function openChangePassword() { if (currentMerchant) lfOpenPasswordModal(false); }

// Security tab form (merchants AND admin)
async function saveMerchantPassword() {
  if (!currentMerchant) return;
  const cur = document.getElementById('sec-cur').value;
  const nw = document.getElementById('sec-new').value;
  const conf = document.getElementById('sec-confirm').value;
  const errEl = document.getElementById('sec-error');
  const show = m => { errEl.textContent = m; errEl.style.display = 'block'; };
  if (!cur) return show('Enter your current password.');
  const problem = lfPasswordProblem(nw); if (problem) return show(problem);
  if (nw !== conf) return show('Passwords do not match.');
  try {
    await api('auth', { method: 'POST', action: 'change_password', body: { currentPassword: cur, newPassword: nw } });
    errEl.style.display = 'none';
    ['sec-cur', 'sec-new', 'sec-confirm'].forEach(id => document.getElementById(id).value = '');
    toast('Password updated successfully!', 'success');
  } catch (e) { show(e.message || 'Could not update password.'); LF.lastError = null; }
}

// Admin adds a merchant — a strong password is REQUIRED (no default)
async function adminAddBrand() {
  const id = document.getElementById('nb-id').value.trim().toLowerCase().replace(/\s+/g, '');
  const name = document.getElementById('nb-name').value.trim();
  const tag = document.getElementById('nb-tag').value;
  const loc = document.getElementById('nb-loc').value.trim();
  const year = document.getElementById('nb-year').value.trim();
  const ig = document.getElementById('nb-ig').value.trim();
  const desc = document.getElementById('nb-desc').value.trim();
  const pass = document.getElementById('nb-pass').value;
  if (!id || !name) { toast('Brand ID and Name are required', 'error'); return; }
  if (!/^[a-z0-9][a-z0-9_-]{1,49}$/.test(id)) { toast('Brand ID: 2–50 lowercase letters, numbers, - or _', 'error'); return; }
  if (BRANDS.find(b => b.id === id)) { toast('Brand ID already exists! Use a different ID.', 'error'); return; }
  const problem = lfPasswordProblem(pass); if (problem) { toast(problem, 'error'); return; }
  try {
    await api('brands', { method: 'POST', body: { id, name, tag, desc, location: loc, year, instagram: ig, password: pass } });
    toast('Brand "' + name + '" added! Give the merchant their password privately — they must change it on first login.', 'success');
    ['nb-id', 'nb-name', 'nb-loc', 'nb-year', 'nb-ig', 'nb-desc', 'nb-pass'].forEach(x => document.getElementById(x).value = '');
    await loadAllData();
    renderAdminBrandsList();
  } catch (e) { toast('Could not add brand', 'error'); }
}

// Brand edit — same as Sync.js plus the schedule field
async function saveBrand() {
  const v = id => (document.getElementById(id)?.value || '').trim();
  try {
    await api('brands', { method: 'PUT', id: currentMerchant.id, body: {
      name: v('bm-name'), tag: v('bm-tag'), desc: v('bm-desc'), location: v('bm-loc'), year: v('bm-year'),
      instagram: v('bm-ig'), img: v('bm-img'), ...(document.getElementById('bm-sched') ? { schedule: v('bm-sched') } : {}) } });
    await loadAllData();
    currentMerchant = getBrand(currentMerchant.id); saveSession();
    toast('Brand updated!', 'success');
    closeBrandModal();
    renderMerchantDash();
  } catch (e) { toast('Could not update brand', 'error'); }
}

/* ---------- 5. products: "New" flag in the product form ---------- */
function lfEnsureNewFlagField() {
  if (document.getElementById('pm-new')) return;
  const stock = document.getElementById('pm-stock');
  if (!stock) return;
  const row = document.createElement('label');
  row.htmlFor = 'pm-new';
  row.style.cssText = 'display:flex;align-items:center;gap:.5rem;font-size:.855rem;font-weight:600;margin:.6rem 0;cursor:pointer';
  row.innerHTML = '<input type="checkbox" id="pm-new" style="width:auto;margin:0"> Show "New" badge on this product';
  (stock.closest('.edit-row-2') || stock.closest('.edit-row') || stock.parentElement).insertAdjacentElement('afterend', row);
}
const _lfOpenProductModal = openProductModal;
openProductModal = function (id) {
  const r = _lfOpenProductModal.apply(this, arguments);
  lfEnsureNewFlagField();
  const cb = document.getElementById('pm-new');
  if (cb) { const p = id ? getProduct(id) : null; cb.checked = p ? !!p.new : true; }
  return r;
};

async function saveProduct() {
  const idVal = document.getElementById('pm-id').value;
  const id = idVal ? parseInt(idVal) : null;
  const name = document.getElementById('pm-name').value.trim();
  const priceRaw = document.getElementById('pm-price').value.trim();
  const originalPriceRaw = document.getElementById('pm-original-price').value.trim();
  const tag = document.getElementById('pm-tag').value.trim();
  const size = document.getElementById('pm-size').value.trim();
  const stock = parseInt(document.getElementById('pm-stock').value) || 0;
  const isNew = document.getElementById('pm-new') ? document.getElementById('pm-new').checked : true;
  const urlInput = document.getElementById('pm-img').value.trim();
  if (urlInput && !pmImgs.includes(urlInput)) {
    if (!/^https:\/\//i.test(urlInput)) { toast('Image links must start with https://', 'error'); return; }
    pmImgs.push(urlInput);
  }
  const imgs = pmImgs.slice(0, 5);
  const img = imgs[0] || '';
  if (!name || !priceRaw || !tag || !size) { toast('Fill all required fields (*)', 'error'); return; }
  if (isNaN(Number(priceRaw)) || Number(priceRaw) < 0) { toast('Price must be a number', 'error'); return; }
  if (stock < 0) { toast('Stock cannot be negative', 'error'); return; }
  const body = { name, price: priceRaw, originalPrice: originalPriceRaw, tag, size, img, imgs, stock, new: isNew };
  try {
    if (id) { await api('products', { method: 'PUT', id, body }); toast('Product updated!', 'success'); }
    else { await api('products', { method: 'POST', body: { ...body, brand: currentMerchant.id } }); toast('Product added!', 'success'); }
    await loadAllData();
    closeProductModal();
    renderMerchantDash();
  } catch (e) { toast('Could not save product', 'error'); }
}

// count a product view in the database (server counts once per visitor)
const _lfOpenProductDetail = openProductDetail;
openProductDetail = function (id) {
  const r = _lfOpenProductDetail.apply(this, arguments);
  try {
    const seen = JSON.parse(sessionStorage.getItem('lf_viewed') || '[]');
    if (!seen.includes(Number(id))) {
      seen.push(Number(id)); sessionStorage.setItem('lf_viewed', JSON.stringify(seen.slice(-200)));
      api('products', { method: 'POST', id: Number(id), action: 'view' }).catch(() => { LF.lastError = null; });
    }
  } catch (e) { }
  return r;
};

/* ---------- 6. reviews: only the author (or admin) sees Edit/Delete ---------- */
const _lfMakeReviewCard = makeReviewCard;
makeReviewCard = function (rv) {
  const html = _lfMakeReviewCard.apply(this, arguments);
  if (rv && (rv.mine || lfIsAdmin())) return html;
  return html.replace(/<div class="review-actions">[\s\S]*?<\/div>/, '');
};

/* ---------- 7. events: approval workflow ---------- */
function lfEventStatus(ev) { return LF.eventStatus[ev.id] || 'approved'; }
function lfOnlyApprovedEvents(fn) {
  return function () {
    const all = events;
    events = all.filter(e => lfEventStatus(e) === 'approved');
    try { return fn.apply(this, arguments); } finally { events = all; }
  };
}
renderEventsPage = lfOnlyApprovedEvents(renderEventsPage);
renderBrandEvents = lfOnlyApprovedEvents(renderBrandEvents);

const _lfRenderMerchEventsPanel = renderMerchEventsPanel;
renderMerchEventsPanel = function () {
  const r = _lfRenderMerchEventsPanel.apply(this, arguments);
  const el = document.getElementById('merch-events-list');
  if (!el) return r;
  events.forEach(ev => {
    const st = lfEventStatus(ev);
    if (st === 'approved') return;
    const btn = el.querySelector(`button[onclick="deleteEvent('${CSS.escape(ev.id)}')"]`);
    if (!btn) return;
    const badge = document.createElement('span');
    badge.style.cssText = 'font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:20px;text-transform:uppercase;letter-spacing:.05em;margin-right:.5rem;'
      + (st === 'pending' ? 'background:#fef3c7;color:#92400e' : 'background:#fee2e2;color:#991b1b');
    badge.textContent = st === 'pending' ? 'Waiting for admin approval' : 'Not approved';
    btn.parentElement.insertBefore(badge, btn);
  });
  return r;
};

const _lfSaveEvent = saveEvent;
saveEvent = async function () {
  const before = LF.errorCount;
  await _lfSaveEvent();
  if (LF.errorCount === before && currentMerchant && !lfIsAdmin()) {
    toast('Event submitted — it goes live after the admin approves it.', 'success');
  }
};

async function approveEvent(evId) {
  try { await api('events', { method: 'PUT', id: evId, action: 'approve' }); await loadAllData(); toast('Event approved and live', 'success'); renderImageApprovals(); }
  catch (e) { toast('Could not approve event', 'error'); }
}
async function rejectEvent(evId) {
  try { await api('events', { method: 'PUT', id: evId, action: 'reject' }); await loadAllData(); toast('Event rejected', 'error'); renderImageApprovals(); }
  catch (e) { toast('Could not reject event', 'error'); }
}

// the Approvals tab also lists events waiting for approval
const _lfRenderImageApprovals = renderImageApprovals;
renderImageApprovals = function () {
  const r = _lfRenderImageApprovals.apply(this, arguments);
  const el = document.getElementById('admin-img-approvals-list');
  if (!el || !lfIsAdmin()) return r;
  const pending = events.filter(e => lfEventStatus(e) === 'pending');
  const box = document.createElement('div');
  box.innerHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;margin:1.6rem 0 .9rem;letter-spacing:.02em">Events waiting for approval</div>`
    + (pending.length ? pending.map(ev => `
      <div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.1rem;margin-bottom:.9rem;display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap;box-shadow:var(--shadow)">
        ${ev.img ? `<img src="${lfEsc(ev.img)}" alt="" style="width:110px;height:75px;object-fit:cover;border-radius:10px;flex-shrink:0">` : ''}
        <div style="flex:1;min-width:150px">
          <div style="font-weight:700;font-size:.9rem;margin-bottom:.25rem">${lfEsc(ev.title)}</div>
          <div style="font-size:.78rem;color:var(--g4)">From: <strong>${lfEsc(getBrandName(ev.brandId))}</strong> · ${lfEsc(ev.date)} ${ev.time ? '· ' + lfEsc(ev.time) : ''}</div>
          <div style="font-size:.78rem;color:var(--g4);margin-top:.15rem">${lfEsc(ev.location)}</div>
          ${ev.desc ? `<div style="font-size:.82rem;color:var(--g5);margin-top:.4rem;line-height:1.5">${lfEsc(ev.desc)}</div>` : ''}
          <div style="display:flex;gap:.5rem;margin-top:.75rem">
            <button class="tbl-action" style="background:#dcf5eb;border-color:#076a35;color:#076a35" onclick="approveEvent('${lfEsc(ev.id)}')">${ICONS.check} Approve</button>
            <button class="tbl-action danger" onclick="rejectEvent('${lfEsc(ev.id)}')">${ICONS.x} Reject</button>
          </div>
        </div>
      </div>`).join('')
      : '<div style="color:var(--g4);font-size:.875rem;padding:.5rem 0 1rem">No events waiting for approval.</div>');
  el.appendChild(box);
  return r;
};

// keep the "interested" flag the renderers read in sync with the database
const _lfToggleInterestFor = toggleInterestFor;
toggleInterestFor = async function (evId) {
  const on = await _lfToggleInterestFor(evId);
  if (on !== null && on !== undefined) { try { localStorage.setItem('ev_int_' + evId, on ? '1' : '0'); } catch (e) { } }
  return on;
};

/* ---------- 8. feedback list (admin) comes from the database ---------- */
const _lfRenderFeedbackPanel = renderFeedbackPanel;
renderFeedbackPanel = function () {
  const r = _lfRenderFeedbackPanel.apply(this, arguments);
  const el = document.getElementById('feedback-list');
  if (!el) return r;
  if (!lfIsAdmin()) {
    el.innerHTML = '<div style="color:var(--g4);font-size:.875rem;padding:1rem">Customer feedback is visible to the admin only.</div>';
    return r;
  }
  el.innerHTML = '<div style="color:var(--g4);font-size:.875rem;padding:1rem">Loading feedback…</div>';
  api('feedback').then(list => {
    if (!list || !list.length) { el.innerHTML = '<div style="color:var(--g4);font-size:.875rem;padding:1rem">No feedback yet.</div>'; return; }
    const colors = { complaint: ['#fee2e2', '#991b1b'], compliment: ['#dcf5eb', '#076a35'], suggestion: ['#fef3c7', '#92400e'] };
    el.innerHTML = list.map(f => {
      const [bg, fg] = colors[f.type] || ['var(--g2)', 'var(--g5)'];
      return `<div style="background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.2rem;margin-bottom:.9rem;box-shadow:var(--shadow)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;flex-wrap:wrap;gap:.4rem">
          <div style="font-size:.95rem;font-weight:700">${lfEsc(f.name)}</div>
          <div style="font-size:.75rem;color:var(--g4)">${lfEsc(f.time)}</div>
        </div>
        <div style="margin-bottom:.5rem"><span style="font-size:.72rem;font-weight:700;padding:.2rem .65rem;border-radius:20px;background:${bg};color:${fg};text-transform:uppercase;letter-spacing:.06em">${lfEsc(f.type)}</span></div>
        <div style="font-size:.875rem;color:var(--g5);line-height:1.6;white-space:pre-line">${lfEsc(f.msg)}</div>
      </div>`;
    }).join('');
  }).catch(() => { el.innerHTML = '<div style="color:var(--red);font-size:.875rem;padding:1rem">Could not load feedback.</div>'; LF.lastError = null; });
  return r;
};
````

### 11.27 `backend/AccountSecurity.js`  (221 lines)

````javascript
/* ============================================================
   AccountSecurity.js — "Change Password" button + password history.

   LOAD ORDER (last, after SyncSecure.js):
     <script src="lostandfound.js"></script>
     <script src="backend/Sync.js"></script>
     <script src="backend/SyncSecure.js"></script>
     <script src="backend/AccountSecurity.js"></script>

   Adds, without editing any other file:
     • a "Change Password" button next to Logout on the dashboard
     • the Security tab form and the password pop-up now save
       through backend/Account.php, which records every change
       in the database (password_changes table + notifications)
     • a "Password history" list in the Security tab
       (admin also sees every merchant's password changes)
   ============================================================ */

const LF_ACCOUNT_URL = LF.apiUrl.replace(/Api\.php(\?.*)?$/, 'Account.php');

/* ---------- request helper (session cookie + CSRF, retries once) ---------- */
async function lfAccount(action, { method = 'GET', body = null, query = null } = {}, _retried = false) {
  const params = new URLSearchParams({ action });
  if (query) for (const k in query) params.set(k, query[k]);
  const opts = { method, credentials: 'include', headers: { 'Accept': 'application/json' } };
  if (method !== 'GET') {
    if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } }
    opts.headers['X-CSRF-Token'] = LF.csrf || '';
  }
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }

  let res;
  try { res = await fetch(`${LF_ACCOUNT_URL}?${params.toString()}`, opts); }
  catch (e) { throw new Error('Cannot reach the server. Check that Apache and MySQL are running.'); }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { }

  if (!res.ok) {
    if (res.status === 403 && data && data.code === 'csrf' && !_retried) {
      LF.csrf = null;
      return lfAccount(action, { method, body, query }, true);
    }
    const err = new Error((data && data.error) || 'Request failed (' + res.status + ').');
    err.status = res.status;
    throw err;
  }
  if (data && data.csrfToken) LF.csrf = data.csrfToken;
  return data;
}

function lfFormatDate(ts) {
  if (!ts) return '—';
  const d = new Date(String(ts).replace(' ', 'T'));
  if (isNaN(d)) return lfEsc(ts);
  return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function lfBrowserName(ua) {
  ua = ua || '';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua)) return 'Safari';
  return ua ? 'Browser' : '—';
}

/* ---------- one place that changes the password ---------- */
async function lfChangePassword(cur, nw, conf) {
  if (!cur) throw new Error('Enter your current password.');
  const problem = lfPasswordProblem(nw); if (problem) throw new Error(problem);
  if (nw !== conf) throw new Error('The new passwords do not match.');
  if (nw === cur) throw new Error('New password must be different from the current one.');
  const r = await lfAccount('change_password', { method: 'POST', body: { currentPassword: cur, newPassword: nw, confirmPassword: conf } });
  LF.mustChange = false;
  return r;
}
function lfPasswordSuccess(r) {
  toast('Password changed and saved to the database (' + lfFormatDate(r.lastChanged) + ')', 'success');
  lfRenderPasswordHistory();
}

// Pop-up (forced first-login change AND the new header button) — replaces the SyncSecure.js version
async function lfSubmitPasswordModal() {
  const err = document.getElementById('lf-pw-err');
  const btn = document.getElementById('lf-pw-save');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  err.style.display = 'none';
  btn.disabled = true; const label = btn.textContent; btn.textContent = 'Saving…';
  try {
    const r = await lfChangePassword(
      document.getElementById('lf-pw-cur').value,
      document.getElementById('lf-pw-new').value,
      document.getElementById('lf-pw-conf').value);
    lfClosePasswordModal();
    lfPasswordSuccess(r);
    await loadAllData();
  } catch (e) { show(e.message); btn.disabled = false; btn.textContent = label; }
}

// Security tab form — replaces the SyncSecure.js version
async function saveMerchantPassword() {
  if (!currentMerchant) return;
  const errEl = document.getElementById('sec-error');
  const show = m => { errEl.textContent = m; errEl.style.display = 'block'; };
  errEl.style.display = 'none';
  try {
    const r = await lfChangePassword(
      document.getElementById('sec-cur').value,
      document.getElementById('sec-new').value,
      document.getElementById('sec-confirm').value);
    ['sec-cur', 'sec-new', 'sec-confirm'].forEach(id => document.getElementById(id).value = '');
    lfPasswordSuccess(r);
  } catch (e) { show(e.message); }
}

/* ---------- "Change Password" button next to Logout ---------- */
function lfAddChangePasswordButton() {
  if (document.getElementById('lf-change-pw-btn')) return;
  const logout = document.querySelector('#page-merchant .merch-logout-btn');
  if (!logout) return;
  const btn = document.createElement('button');
  btn.id = 'lf-change-pw-btn';
  btn.type = 'button';
  btn.className = 'merch-logout-btn';                 // same look as your Logout button
  btn.style.marginRight = '.5rem';
  btn.innerHTML = (typeof ICONS !== 'undefined' && ICONS.key ? ICONS.key + ' ' : '') + 'Change Password';
  btn.setAttribute('aria-label', 'Change your password');
  btn.onmouseenter = () => { btn.style.borderColor = 'var(--black)'; btn.style.color = 'var(--black)'; };
  btn.onmouseleave = () => { btn.style.borderColor = ''; btn.style.color = ''; };
  btn.onclick = () => { if (currentMerchant) lfOpenPasswordModal(false); };

  // keep Logout on the right, both buttons together
  const group = document.createElement('div');
  group.style.cssText = 'display:flex;align-items:center;gap:.5rem;flex-wrap:wrap';
  logout.parentElement.insertBefore(group, logout);
  group.appendChild(btn);
  group.appendChild(logout);
}

/* ---------- password history in the Security tab ---------- */
function lfEnsureHistoryBox() {
  let box = document.getElementById('lf-pw-history');
  if (box) return box;
  const panel = document.getElementById('merch-panel-security');
  if (!panel) return null;
  box = document.createElement('div');
  box.id = 'lf-pw-history';
  box.style.cssText = 'background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;max-width:720px;box-shadow:var(--shadow);margin-top:1.3rem';
  panel.appendChild(box);
  return box;
}

async function lfRenderPasswordHistory() {
  if (!currentMerchant) return;
  const box = lfEnsureHistoryBox(); if (!box) return;
  const admin = lfIsAdmin();
  box.innerHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">${admin ? 'Password activity — all accounts' : 'Password history'}</div>
    <div style="font-size:.82rem;color:var(--g4)">Loading…</div>`;
  try {
    const [status, rows] = await Promise.all([
      lfAccount('status'),
      lfAccount('history', admin ? { query: { all: 1 } } : {}),
    ]);
    const reasonLabel = r => r === 'first_login'
      ? '<span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:20px;background:#fef3c7;color:#92400e;text-transform:uppercase">First login</span>'
      : '<span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:20px;background:#dcf5eb;color:#076a35;text-transform:uppercase">Changed</span>';
    const summary = status.lastChanged
      ? `Your password was last changed on <strong>${lfFormatDate(status.lastChanged)}</strong> · ${status.changeCount} change${status.changeCount === 1 ? '' : 's'} recorded.`
      : 'No password changes recorded yet for your account.';
    const table = rows.length ? `
      <div style="overflow-x:auto;margin-top:1rem">
        <table style="width:100%;border-collapse:collapse;font-size:.84rem">
          <thead><tr style="text-align:left;color:var(--g4);font-size:.72rem;text-transform:uppercase;letter-spacing:.06em">
            <th style="padding:.5rem;border-bottom:1px solid var(--g2)">Date &amp; time</th>
            ${admin ? '<th style="padding:.5rem;border-bottom:1px solid var(--g2)">Account</th>' : ''}
            <th style="padding:.5rem;border-bottom:1px solid var(--g2)">Type</th>
            <th style="padding:.5rem;border-bottom:1px solid var(--g2)">Browser</th>
            <th style="padding:.5rem;border-bottom:1px solid var(--g2)">IP</th>
          </tr></thead>
          <tbody>${rows.map(r => `<tr>
            <td style="padding:.55rem .5rem;border-bottom:1px solid var(--g1)">${lfFormatDate(r.changedAt)}</td>
            ${admin ? `<td style="padding:.55rem .5rem;border-bottom:1px solid var(--g1);font-weight:600">${lfEsc(r.name)}</td>` : ''}
            <td style="padding:.55rem .5rem;border-bottom:1px solid var(--g1)">${reasonLabel(r.reason)}</td>
            <td style="padding:.55rem .5rem;border-bottom:1px solid var(--g1)">${lfEsc(lfBrowserName(r.browser))}</td>
            <td style="padding:.55rem .5rem;border-bottom:1px solid var(--g1);color:var(--g4)">${lfEsc(r.ip || '—')}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>` : '';
    box.innerHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">${admin ? 'Password activity — all accounts' : 'Password history'}</div>
      <div style="font-size:.875rem;color:var(--g5);line-height:1.6">${summary}</div>${table}`;
  } catch (e) {
    box.innerHTML = `<div style="color:var(--red);font-size:.875rem">Could not load password history: ${lfEsc(e.message)}</div>`;
  }
}

// refresh the history whenever the Security tab is opened
const _lfShowMerchTab = showMerchTab;
showMerchTab = function (tab) {
  const r = _lfShowMerchTab.apply(this, arguments);
  if (tab === 'security') lfRenderPasswordHistory();
  return r;
};

// the Security form also works for the admin (SyncSecure.js supports it) — fix the description text
function lfUpdateSecurityText() {
  const p = document.querySelector('#merch-panel-security p');
  if (p && lfIsAdmin()) p.textContent = 'Update your admin login password. Changes take effect immediately and are recorded in the database.';
  else if (p) p.textContent = 'Update your merchant login password. Changes take effect immediately and are recorded in the database.';
}

const _lfRenderMerchantDashAcc = renderMerchantDash;
renderMerchantDash = function () {
  const r = _lfRenderMerchantDashAcc.apply(this, arguments);
  lfAddChangePasswordButton();
  lfUpdateSecurityText();
  return r;
};

document.addEventListener('DOMContentLoaded', lfAddChangePasswordButton);
if (document.readyState !== 'loading') lfAddChangePasswordButton();
````

### 11.28 `backend/PasswordReset.js`  (243 lines)

````javascript
/* ============================================================
   PasswordReset.js — "Forgot password?" button on the login box.

   LOAD ORDER (last):
     <script src="lostandfound.js"></script>
     <script src="backend/Sync.js"></script>
     <script src="backend/SyncSecure.js"></script>
     <script src="backend/AccountSecurity.js"></script>
     <script src="backend/PasswordReset.js"></script>

   Merchant: Forgot password? → request form → saved in the database,
             admin is notified.
   Admin:    Security tab → "Password reset requests" → Reset →
             temporary password shown once → give it to the merchant
             privately → merchant must choose a new one at next login.
   Admin's own password: the website cannot reset it (by design);
             the button shows the safe recovery steps instead.
   ============================================================ */

const LF_RESET_URL = LF.apiUrl.replace(/Api\.php(\?.*)?$/, 'PasswordReset.php');

async function lfResetApi(action, { method = 'GET', body = null } = {}, _retried = false) {
  const opts = { method, credentials: 'include', headers: { 'Accept': 'application/json' } };
  if (method !== 'GET') {
    if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } }
    opts.headers['X-CSRF-Token'] = LF.csrf || '';
  }
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(`${LF_RESET_URL}?action=${encodeURIComponent(action)}`, opts); }
  catch (e) { throw new Error('Cannot reach the server. Check that Apache and MySQL are running.'); }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { }
  if (!res.ok) {
    if (res.status === 403 && data && data.code === 'csrf' && !_retried) { LF.csrf = null; return lfResetApi(action, { method, body }, true); }
    throw new Error((data && data.error) || 'Request failed (' + res.status + ').');
  }
  return data;
}

/* ---------- shared pop-up shell (same look as the password pop-up) ---------- */
function lfResetModal(id, title, innerHtml) {
  document.getElementById(id)?.remove();
  const wrap = document.createElement('div');
  wrap.id = id;
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-labelledby', id + '-title');
  wrap.style.cssText = 'position:fixed;inset:0;background:rgba(12,11,9,.72);z-index:100000;display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto';
  wrap.innerHTML = `
    <div style="background:#fff;border-radius:var(--r2,14px);padding:1.8rem;max-width:460px;width:100%;box-shadow:var(--shadow,0 10px 40px rgba(0,0,0,.25));margin:auto">
      <div id="${id}-title" style="font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:.02em;margin-bottom:.4rem">${title}</div>
      ${innerHtml}
    </div>`;
  wrap.addEventListener('click', e => { if (e.target === wrap) wrap.remove(); });
  wrap.addEventListener('keydown', e => { if (e.key === 'Escape') wrap.remove(); });
  document.body.appendChild(wrap);
  return wrap;
}
const LF_ERR_BOX = 'display:none;background:#fee2e2;border:1px solid var(--red,#b91c1c);border-radius:var(--r,8px);padding:.65rem 1rem;font-size:.855rem;color:var(--red,#b91c1c);margin-bottom:.9rem';
const LF_OK_BOX = 'background:#dcf5eb;border:1px solid #076a35;border-radius:var(--r,8px);padding:.8rem 1rem;font-size:.875rem;color:#076a35;line-height:1.6';

/* ---------- 1. the "Forgot password?" button ---------- */
function lfAddForgotButton() {
  if (document.getElementById('lf-forgot-btn')) return;
  const login = document.querySelector('#merchant-modal .mm-submit');
  if (!login) return;
  const btn = document.createElement('button');
  btn.id = 'lf-forgot-btn';
  btn.type = 'button';
  btn.className = 'mm-cancel';                      // same text-button style as your Cancel
  btn.style.cssText = 'margin-top:.35rem;color:var(--accent-ink,var(--g5));font-weight:600;text-decoration:underline;text-underline-offset:3px';
  btn.textContent = 'Forgot password?';
  btn.onclick = () => (typeof currentLoginRole !== 'undefined' && currentLoginRole === 'admin') ? lfOpenAdminRecoveryInfo() : lfOpenForgotForm();
  login.insertAdjacentElement('afterend', btn);
}

/* ---------- 2. merchant request form ---------- */
function lfOpenForgotForm() {
  const selected = document.getElementById('mm-brand-select')?.value || '';
  const options = BRANDS.filter(b => b.id !== 'lostandfound')
    .map(b => `<option value="${lfEsc(b.id)}"${b.id === selected ? ' selected' : ''}>${lfEsc(b.name)}</option>`).join('');
  lfResetModal('lf-forgot-modal', 'Forgot password?', `
    <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">
      Send a reset request to the Lost &amp; Found admin. They will check that it's really you and give you a
      <strong>temporary password</strong>. You'll choose a new password when you log in with it.</p>
    <div id="lf-forgot-body">
      <label class="pay-label" for="lf-fg-brand">Your brand *</label>
      <select id="lf-fg-brand" class="pay-input">${options}</select>
      <label class="pay-label" for="lf-fg-name">Your name *</label>
      <input id="lf-fg-name" class="pay-input" maxlength="150" autocomplete="name">
      <label class="pay-label" for="lf-fg-contact">Phone number or e-mail *</label>
      <input id="lf-fg-contact" class="pay-input" maxlength="150" placeholder="So the admin can contact you">
      <label class="pay-label" for="lf-fg-msg">Message (optional)</label>
      <textarea id="lf-fg-msg" class="pay-input" maxlength="1000" style="min-height:70px;resize:vertical" placeholder="e.g. I'm the owner of the brand, I forgot my password"></textarea>
      <div id="lf-fg-err" role="alert" style="${LF_ERR_BOX}"></div>
      <div style="display:flex;gap:.6rem;margin-top:.4rem">
        <button type="button" class="edit-cancel-btn" style="flex:1" onclick="document.getElementById('lf-forgot-modal').remove()">Cancel</button>
        <button type="button" class="edit-save-btn" style="flex:2" id="lf-fg-send">Send request</button>
      </div>
    </div>`);
  document.getElementById('lf-fg-send').onclick = lfSendForgotRequest;
  setTimeout(() => document.getElementById('lf-fg-name')?.focus(), 50);
}

async function lfSendForgotRequest() {
  const err = document.getElementById('lf-fg-err');
  const btn = document.getElementById('lf-fg-send');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  const brandId = document.getElementById('lf-fg-brand').value;
  const name = document.getElementById('lf-fg-name').value.trim();
  const contact = document.getElementById('lf-fg-contact').value.trim();
  const message = document.getElementById('lf-fg-msg').value.trim();
  err.style.display = 'none';
  if (!brandId) return show('Please choose your brand.');
  if (!name) return show('Please enter your name.');
  if (!contact) return show('Please enter a phone number or e-mail.');
  btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const r = await lfResetApi('request', { method: 'POST', body: { brandId, name, contact, message } });
    document.getElementById('lf-forgot-body').innerHTML = `
      <div style="${LF_OK_BOX}">${lfEsc(r.message)}</div>
      <button type="button" class="edit-save-btn" style="width:100%;margin-top:1rem" onclick="document.getElementById('lf-forgot-modal').remove()">OK</button>`;
  } catch (e) { show(e.message); btn.disabled = false; btn.textContent = 'Send request'; }
}

/* ---------- 3. admin forgot their own password ---------- */
function lfOpenAdminRecoveryInfo() {
  lfResetModal('lf-forgot-modal', 'Admin password recovery', `
    <p style="font-size:.875rem;color:var(--g5,#3d3b36);line-height:1.65;margin-bottom:.8rem">
      For security, the <strong>admin</strong> password cannot be reset from the website.
      Only the person who manages the server can do it:</p>
    <ol style="font-size:.85rem;color:var(--g5,#3d3b36);line-height:1.7;padding-left:1.2rem;margin-bottom:1rem">
      <li>Open <strong>phpMyAdmin</strong> → database <code>lostfound</code> → <strong>SQL</strong>, run:<br>
        <code style="background:var(--g1,#f1efe9);padding:2px 6px;border-radius:5px;font-size:.8rem;word-break:break-all">DELETE FROM site_settings WHERE setting_key='admin_password';</code></li>
      <li>Put <code>setup.php</code> back into the <code>backend</code> folder and open it in the browser.</li>
      <li>Create a new admin password, then delete <code>setup.php</code> again.</li>
    </ol>
    <p style="font-size:.8rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">Merchant passwords that were already changed are not affected.</p>
    <button type="button" class="edit-save-btn" style="width:100%" onclick="document.getElementById('lf-forgot-modal').remove()">OK</button>`);
}

/* ---------- 4. admin: reset requests panel in the Security tab ---------- */
function lfFormatDate2(ts) {
  if (!ts) return '—';
  const d = new Date(String(ts).replace(' ', 'T'));
  return isNaN(d) ? lfEsc(ts) : d.toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

async function lfRenderResetRequests() {
  const panel = document.getElementById('merch-panel-security');
  let box = document.getElementById('lf-reset-requests');
  if (!lfIsAdmin()) { box?.remove(); return; }
  if (!panel) return;
  if (!box) {
    box = document.createElement('div');
    box.id = 'lf-reset-requests';
    box.style.cssText = 'background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;max-width:720px;box-shadow:var(--shadow);margin-top:1.3rem';
    const history = document.getElementById('lf-pw-history');
    history ? panel.insertBefore(box, history) : panel.appendChild(box);
  }
  const head = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">Password reset requests</div>`;
  box.innerHTML = head + '<div style="font-size:.82rem;color:var(--g4)">Loading…</div>';
  let rows;
  try { rows = await lfResetApi('list'); }
  catch (e) { box.innerHTML = head + `<div style="color:var(--red);font-size:.875rem">${lfEsc(e.message)}</div>`; return; }

  const pending = rows.filter(r => r.status === 'pending');
  const done = rows.filter(r => r.status !== 'pending').slice(0, 10);
  const badge = s => {
    const c = { completed: ['#dcf5eb', '#076a35', 'Reset done'], rejected: ['#fee2e2', '#991b1b', 'Rejected'] }[s] || ['var(--g2)', 'var(--g5)', s];
    return `<span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:20px;background:${c[0]};color:${c[1]};text-transform:uppercase">${lfEsc(c[2])}</span>`;
  };
  const merchantOptions = BRANDS.filter(b => b.id !== 'lostandfound').map(b => `<option value="${lfEsc(b.id)}">${lfEsc(b.name)}</option>`).join('');

  box.innerHTML = head + `
    <p style="font-size:.85rem;color:var(--g4);line-height:1.6;margin-bottom:1rem">Check that the request is really from the merchant (call or message them) before resetting.
      Reset creates a temporary password that is shown <strong>once</strong>. Give it to the merchant privately — they must choose a new one at their next login.</p>
    ${pending.length ? pending.map(r => `
      <div style="border:1px solid var(--g2);border-radius:var(--r2);padding:1rem;margin-bottom:.8rem;background:var(--g1)">
        <div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap;align-items:flex-start">
          <div>
            <div style="font-weight:700;font-size:.92rem">${lfEsc(r.brandName)} <span style="font-weight:400;color:var(--g4)">(${lfEsc(r.brandId)})</span></div>
            <div style="font-size:.8rem;color:var(--g4);margin-top:.15rem">${lfEsc(r.name)} · ${lfEsc(r.contact)} · ${lfFormatDate2(r.requestedAt)}</div>
            ${r.message ? `<div style="font-size:.84rem;color:var(--g5);margin-top:.4rem;white-space:pre-line">${lfEsc(r.message)}</div>` : ''}
          </div>
          <div style="display:flex;gap:.5rem">
            <button class="tbl-action" style="background:#dcf5eb;border-color:#076a35;color:#076a35" onclick="lfAdminReset(${r.id}, null)">Reset password</button>
            <button class="tbl-action danger" onclick="lfAdminReject(${r.id})">Reject</button>
          </div>
        </div>
      </div>`).join('') : '<div style="font-size:.875rem;color:var(--g4);padding:.3rem 0 .8rem">No pending requests.</div>'}
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin-top:.6rem;padding-top:1rem;border-top:1px solid var(--g2)">
      <span style="font-size:.84rem;font-weight:600">Reset any merchant:</span>
      <select id="lf-reset-any" class="pay-input" style="flex:1;min-width:160px;margin:0">${merchantOptions}</select>
      <button class="tbl-action" onclick="lfAdminReset(null, document.getElementById('lf-reset-any').value)">Reset password</button>
    </div>
    ${done.length ? `<div style="margin-top:1.2rem;font-size:.72rem;font-weight:700;color:var(--g4);text-transform:uppercase;letter-spacing:.06em">Recent</div>
      ${done.map(r => `<div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap;font-size:.82rem;padding:.45rem 0;border-bottom:1px solid var(--g1)">
        <span><strong>${lfEsc(r.brandName)}</strong> · ${lfEsc(r.name)} · ${lfFormatDate2(r.requestedAt)}</span>${badge(r.status)}</div>`).join('')}` : ''}`;
}

async function lfAdminReset(requestId, brandId) {
  const name = brandId ? (getBrandName(brandId) || brandId) : 'this merchant';
  if (!confirm('Reset the password for ' + name + '? Their current password will stop working immediately.')) return;
  try {
    const r = await lfResetApi('reset', { method: 'POST', body: requestId ? { requestId } : { brandId } });
    lfResetModal('lf-temp-modal', 'Temporary password', `
      <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:.8rem">
        Give this to <strong>${lfEsc(r.brandName)}</strong> privately (call or message). It is shown <strong>only once</strong>.
        They must choose a new password when they log in with it.</p>
      <div style="display:flex;gap:.5rem;align-items:center;margin-bottom:1rem">
        <code id="lf-temp-pw" style="flex:1;font-size:1.25rem;letter-spacing:.08em;background:var(--g1,#f1efe9);padding:.7rem 1rem;border-radius:var(--r,8px);text-align:center;user-select:all">${lfEsc(r.tempPassword)}</code>
        <button type="button" class="tbl-action" id="lf-temp-copy">Copy</button>
      </div>
      <button type="button" class="edit-save-btn" style="width:100%" onclick="document.getElementById('lf-temp-modal').remove()">Done — I've saved it</button>`);
    document.getElementById('lf-temp-copy').onclick = async () => {
      try { await navigator.clipboard.writeText(r.tempPassword); toast('Copied!', 'success'); }
      catch (e) { toast('Select the password and copy it manually', 'error'); }
    };
    toast('Password reset for ' + r.brandName + ' — saved to the database', 'success');
    lfRenderResetRequests();
    if (typeof lfRenderPasswordHistory === 'function') lfRenderPasswordHistory();
  } catch (e) { toast(e.message, 'error'); }
}

async function lfAdminReject(requestId) {
  if (!confirm('Reject this reset request?')) return;
  try { await lfResetApi('reject', { method: 'POST', body: { requestId } }); toast('Request rejected'); lfRenderResetRequests(); }
  catch (e) { toast(e.message, 'error'); }
}

// show the panel whenever the admin opens the Security tab
const _lfShowMerchTabReset = showMerchTab;
showMerchTab = function (tab) {
  const r = _lfShowMerchTabReset.apply(this, arguments);
  if (tab === 'security') lfRenderResetRequests();
  return r;
};

document.addEventListener('DOMContentLoaded', lfAddForgotButton);
if (document.readyState !== 'loading') lfAddForgotButton();
````

### 11.29 `backend/ShippingJNT.js`  (204 lines)

````javascript
/* ============================================================
   ShippingJNT.js — J&T Express shipping + automatic order total.

   LOAD ORDER (last):
     ... backend/SyncSecure.js, backend/AccountSecurity.js,
         backend/PasswordReset.js, backend/ShippingJNT.js

   • Shipping-area list shows current J&T "from" prices
   • Fee = real J&T rate by weight + destination (from Luzon/Batangas)
   • One J&T parcel per merchant (each stall ships its own items)
   • Subtotal + shipping = total, calculated automatically and shown
     with a breakdown; the GCash/PayMaya amount follows it
   • The order is placed through backend/Checkout.php, which
     recalculates the shipping on the server (can't be tampered with)
   ============================================================ */

const LF_CHECKOUT_URL = LF.apiUrl.replace(/Api\.php(\?.*)?$/, 'Checkout.php');
let LF_SHIP = null;                       // rate table from the server
let LF_LAST_QUOTE = null;                 // last calculated breakdown

/* ---------- load the rate table (same numbers the server uses) ---------- */
async function lfLoadShippingRates() {
  try {
    const r = await fetch(LF_CHECKOUT_URL + '?action=rates', { credentials: 'include', headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error('rates ' + r.status);
    LF_SHIP = await r.json();
    // keep your SHIPPING_RATES object in step (labels, "from" fee, delivery days)
    for (const [key, z] of Object.entries(LF_SHIP.zones)) {
      SHIPPING_RATES[key] = { label: z.label, fee: LF_SHIP.rates[z.region][0], days: z.days };
    }
    lfRefreshZoneOptions();
  } catch (e) {
    console.error('Could not load J&T rates', e);
  }
}

function lfRefreshZoneOptions() {
  const sel = document.getElementById('shipping-zone');
  if (!sel || !LF_SHIP) return;
  // add the island option once (before Visayas)
  if (!sel.querySelector('option[value="island"]')) {
    const opt = document.createElement('option');
    opt.value = 'island';
    const vis = sel.querySelector('option[value="visayas"]');
    vis ? sel.insertBefore(opt, vis) : sel.appendChild(opt);
  }
  sel.querySelectorAll('option').forEach(o => {
    const z = LF_SHIP.zones[o.value];
    if (z) o.textContent = `${z.label} — from ₱${LF_SHIP.rates[z.region][0]}`;
  });
  const lbl = document.querySelector('label[for="shipping-zone"]');
  if (lbl && !lbl.dataset.lfJnt) { lbl.dataset.lfJnt = '1'; lbl.textContent = 'Shipping Area (J&T Express from Batangas)'; }
}

/* ---------- the calculator (mirror of backend/Shipping.php) ---------- */
function lfItemWeight(p) {
  const hay = ((p.tag || '') + ' ' + (p.name || '')).toLowerCase();
  for (const rule of LF_SHIP.weights) if (new RegExp(rule.match).test(hay)) return rule.kg;
  return LF_SHIP.defaultItemKg;
}
function lfJntFee(region, kg) {
  const rates = LF_SHIP.rates[region] || LF_SHIP.rates.luzon;
  const br = LF_SHIP.brackets;
  for (let i = 0; i < br.length; i++) if (kg <= br[i] + 1e-9) return rates[i];
  const last = rates.length - 1, step = rates[last] - rates[last - 1];
  return rates[last] + Math.ceil(kg - br[last] - 1e-9) * step;
}
function lfCalcShipping(zone, sourceItems) {
  if (!LF_SHIP || !LF_SHIP.zones[zone]) return null;
  const z = LF_SHIP.zones[zone];
  const parcels = {};
  let subtotal = 0;
  sourceItems.forEach(i => {
    const p = getProduct(i.productId); if (!p) return;
    subtotal += (isNaN(p.price) ? 0 : Number(p.price)) * i.qty;
    if (!parcels[p.brand]) parcels[p.brand] = { brandId: p.brand, brandName: getBrandName(p.brand) || p.brand, items: 0, weightKg: LF_SHIP.packagingKg };
    parcels[p.brand].items += i.qty;
    parcels[p.brand].weightKg += lfItemWeight(p) * i.qty;
  });
  const list = Object.values(parcels).map(p => ({ ...p, weightKg: Math.round(p.weightKg * 100) / 100 }));
  list.forEach(p => { p.fee = lfJntFee(z.region, p.weightKg); });
  const shippingTotal = list.reduce((s, p) => s + p.fee, 0);
  return { zone, zoneLabel: z.label, region: z.region, days: z.days, parcels: list, subtotal, shippingTotal, total: subtotal + shippingTotal };
}

/* ---------- breakdown box under "Shipping (J&T Express)" ---------- */
function lfBreakdownBox() {
  let box = document.getElementById('lf-ship-breakdown');
  if (box) return box;
  const shipRow = document.getElementById('pay-ship')?.closest('.receipt-total-row');
  if (!shipRow) return null;
  box = document.createElement('div');
  box.id = 'lf-ship-breakdown';
  box.setAttribute('aria-live', 'polite');
  box.style.cssText = 'font-size:.76rem;color:var(--g4);line-height:1.55;margin:-.15rem 0 .45rem;padding-left:.1rem';
  shipRow.insertAdjacentElement('afterend', box);
  return box;
}
function lfRenderBreakdown(q) {
  const box = lfBreakdownBox(); if (!box) return;
  if (!q) { box.innerHTML = ''; return; }
  const regionName = { luzon: 'Luzon', ncr: 'Metro Manila', visayas: 'Visayas', mindanao: 'Mindanao', island: 'Island' }[q.region] || q.region;
  box.innerHTML = q.parcels.map(p =>
    `<div style="display:flex;justify-content:space-between;gap:.5rem"><span>${lfEsc(p.brandName)} · ${p.items} item${p.items > 1 ? 's' : ''} · ~${p.weightKg} kg</span><span>₱${p.fee}</span></div>`).join('')
    + `<div style="margin-top:.2rem">${q.parcels.length > 1 ? q.parcels.length + ' J&T parcels (each shop ships separately) · ' : ''}Batangas → ${lfEsc(regionName)} rate · weight estimated</div>`;
}

/* ---------- automatic total: replaces your updateShippingRate() ---------- */
function updateShippingRate() {
  const zone = document.getElementById('shipping-zone').value;
  const sourceItems = buyNowItem ? [buyNowItem] : cart;
  const sub = sourceItems.reduce((s, i) => { const p = getProduct(i.productId); return s + (p ? p.price * i.qty : 0); }, 0);
  document.getElementById('pay-sub').textContent = fmtMoney(sub);
  if (!zone) {
    shippingFee = 0; LF_LAST_QUOTE = null;
    document.getElementById('pay-ship').textContent = 'Select area first';
    document.getElementById('pay-total').textContent = '—';
    document.getElementById('delivery-est').style.display = 'none';
    lfRenderBreakdown(null);
    return;
  }
  if (!LF_SHIP) {                                  // rates not loaded yet → load, then recalc
    document.getElementById('pay-ship').textContent = 'Calculating…';
    lfLoadShippingRates().then(() => { if (LF_SHIP) updateShippingRate(); else document.getElementById('pay-ship').textContent = 'Unavailable — check the server'; });
    return;
  }
  const q = lfCalcShipping(zone, sourceItems);
  if (!q) return;
  LF_LAST_QUOTE = q;
  shippingFee = q.shippingTotal;                   // your selectPayMethod() / QR amount use this
  document.getElementById('pay-ship').textContent = fmtMoney(q.shippingTotal);
  document.getElementById('pay-total').textContent = fmtMoney(q.total);
  lfRenderBreakdown(q);
  const d = new Date(); d.setDate(d.getDate() + q.days);
  document.getElementById('est-date').textContent = d.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })
    + ' (about ' + q.days + ' day' + (q.days > 1 ? 's' : '') + ')';
  document.getElementById('delivery-est').style.display = 'block';
  const qr = document.getElementById('qr-amount');
  if (qr && selPayMethod) qr.textContent = fmtMoney(q.total);
}

// clear the breakdown each time the checkout opens
const _lfBuildReceipt = buildReceipt;
buildReceipt = function () {
  const r = _lfBuildReceipt.apply(this, arguments);
  shippingFee = 0; LF_LAST_QUOTE = null; lfRenderBreakdown(null);
  lfRefreshZoneOptions();
  return r;
};

/* ---------- place the order through Checkout.php (server recalculates shipping) ---------- */
async function placeOrder() {
  if (!selPayMethod) { toast('Please select a payment method', 'error'); return; }
  const zone = document.getElementById('shipping-zone').value;
  if (!zone) { toast('Please select a shipping area', 'error'); updateCheckoutStep(1); return; }
  const name = document.getElementById('pay-name').value.trim();
  const email = document.getElementById('pay-email').value.trim();
  const phone = document.getElementById('pay-phone').value.trim();
  const address = document.getElementById('pay-address').value.trim();
  const sourceItems = buyNowItem ? [buyNowItem] : cart;
  const items = sourceItems.map(i => ({ id: i.productId, qty: i.qty }));
  const btn = document.querySelector('#pay-modal .pay-place-btn, #pay-modal [onclick="placeOrder()"]');
  if (btn) btn.disabled = true;

  const send = async (retried) => {
    if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } }
    const res = await fetch(`${LF_CHECKOUT_URL}?action=place&session=${encodeURIComponent(sessionId())}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-CSRF-Token': LF.csrf || '' },
      body: JSON.stringify({ customer: name, email, phone, address, payMethod: selPayMethod, zone, items }),
    });
    const data = await res.json().catch(() => null);
    if (res.status === 403 && data && data.code === 'csrf' && !retried) { LF.csrf = null; return send(true); }
    if (!res.ok) throw new Error((data && data.error) || 'Could not place order.');
    return data;
  };

  try {
    const r = await send(false);
    const orderItems = sourceItems.map(i => ({ p: getProduct(i.productId), qty: i.qty })).filter(x => x.p);
    if (!buyNowItem) { cart = []; updateCartUI(); }
    buyNowItem = null;
    await loadAllData();
    closeCheckout();
    document.getElementById('conf-order-id').textContent = r.id;
    document.getElementById('conf-email').textContent = email;
    document.getElementById('conf-items').innerHTML =
      orderItems.map(x => `<div style="display:flex;justify-content:space-between;padding:.35rem 0"><span>${lfEsc(x.p.name)} ×${x.qty}</span><span>${fmtMoney(x.p.price * x.qty)}</span></div>`).join('')
      + `<div style="display:flex;justify-content:space-between;padding:.35rem 0;border-top:1px dashed var(--g2);margin-top:.3rem"><span>Subtotal</span><span>${fmtMoney(r.subtotal)}</span></div>`
      + r.parcels.map(p => `<div style="display:flex;justify-content:space-between;padding:.2rem 0;font-size:.85em;color:var(--g4)"><span>J&amp;T shipping · ${lfEsc(p.brandName)} (~${p.weightKg} kg)</span><span>${fmtMoney(p.fee)}</span></div>`).join('');
    document.getElementById('conf-total').textContent = 'Total: ' + fmtMoney(r.total) + '  (items ' + fmtMoney(r.subtotal) + ' + shipping ' + fmtMoney(r.shippingFee) + ')';
    document.getElementById('confirm-modal').classList.add('on');
    openA11yPanel(document.querySelector('.confirm-card'));
    toast('Order placed!', 'success');
  } catch (e) {
    toast(e.message || 'Could not place order', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

/* ---------- start ---------- */
document.addEventListener('DOMContentLoaded', lfLoadShippingRates);
if (document.readyState !== 'loading') lfLoadShippingRates();
````

### 11.30 `backend/EmailFeature.js`  (342 lines)

````javascript
/* ============================================================
   EmailFeature.js — verified recovery e-mails + reset links.

   LOAD ORDER (last):
     ... backend/PasswordReset.js, backend/ShippingJNT.js,
         backend/EmailFeature.js

   • "Forgot password?" now e-mails a reset link to the account's
     VERIFIED recovery e-mail, then shows:
       "A password reset link has been sent to your trusted email…"
   • Every admin and merchant account must add and verify a
     recovery e-mail (pop-up after login + Security tab box).
   • Admin: e-mail status of every merchant, can set a merchant's
     e-mail (the merchant still has to verify it), and the Add Brand
     form now requires the merchant's e-mail.
   • Merchants without a verified e-mail can still ask the admin
     (the earlier admin-approved reset stays as a fallback).
   ============================================================ */

const LF_EMAIL_URL = LF.apiUrl.replace(/Api\.php(\?.*)?$/, 'Email.php');
let LF_EMAIL_STATUS = null;

async function lfEmailApi(action, { method = 'GET', body = null } = {}, _retried = false) {
  const opts = { method, credentials: 'include', headers: { 'Accept': 'application/json' } };
  if (method !== 'GET') {
    if (!LF.csrf) { try { await lfFetchCsrf(); } catch (e) { } }
    opts.headers['X-CSRF-Token'] = LF.csrf || '';
  }
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(`${LF_EMAIL_URL}?action=${encodeURIComponent(action)}`, opts); }
  catch (e) { throw new Error('Cannot reach the server. Check that Apache and MySQL are running.'); }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { }
  if (!res.ok) {
    if (res.status === 403 && data && data.code === 'csrf' && !_retried) { LF.csrf = null; return lfEmailApi(action, { method, body }, true); }
    const err = new Error((data && data.error) || 'Request failed (' + res.status + ').'); err.status = res.status; throw err;
  }
  return data;
}
const LF_DEV_NOTE = '<div style="margin-top:.8rem;background:#fef3c7;border:1px solid #d97706;border-radius:8px;padding:.6rem .8rem;font-size:.8rem;color:#92400e;line-height:1.5">'
  + '<b>Test mode:</b> email sending isn\'t set up yet, so the email was saved in <code>backend/mail_outbox/</code> on this PC. Open the newest .html file there and click its button. '
  + 'Set up Gmail in <code>backend/config.local.php</code> to send real emails.</div>';

/* ---------- 1. Forgot password → email link ---------- */
const _lfLegacyForgotForm = lfOpenForgotForm;          // admin-approved request (fallback)

lfOpenForgotForm = function () {
  const selected = document.getElementById('mm-brand-select')?.value || '';
  const options = BRANDS.filter(b => b.id !== 'lostandfound')
    .map(b => `<option value="${lfEsc(b.id)}"${b.id === selected ? ' selected' : ''}>${lfEsc(b.name)}</option>`).join('');
  lfResetModal('lf-forgot-modal', 'Forgot password?', `
    <div id="lf-forgot-body">
      <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">
        We'll email a password reset link to the <strong>verified recovery email</strong> linked to your merchant account.</p>
      <label class="pay-label" for="lf-fg-brand">Your brand *</label>
      <select id="lf-fg-brand" class="pay-input">${options}</select>
      <div id="lf-fg-err" role="alert" style="${LF_ERR_BOX}"></div>
      <div style="display:flex;gap:.6rem;margin-top:.4rem">
        <button type="button" class="edit-cancel-btn" style="flex:1" onclick="document.getElementById('lf-forgot-modal').remove()">Cancel</button>
        <button type="button" class="edit-save-btn" style="flex:2" id="lf-fg-send">Send reset link</button>
      </div>
    </div>`);
  document.getElementById('lf-fg-send').onclick = () => lfSendResetLink('merchant');
};

lfOpenAdminRecoveryInfo = function () {
  lfResetModal('lf-forgot-modal', 'Forgot admin password?', `
    <div id="lf-forgot-body">
      <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">
        Enter the admin username. A password reset link will be emailed to the <strong>verified recovery email</strong> linked to the admin account.</p>
      <label class="pay-label" for="lf-fg-user">Admin username *</label>
      <input id="lf-fg-user" class="pay-input" maxlength="100" autocomplete="username" value="${lfEsc(document.getElementById('mm-admin-user')?.value || '')}">
      <div id="lf-fg-err" role="alert" style="${LF_ERR_BOX}"></div>
      <div style="display:flex;gap:.6rem;margin-top:.4rem">
        <button type="button" class="edit-cancel-btn" style="flex:1" onclick="document.getElementById('lf-forgot-modal').remove()">Cancel</button>
        <button type="button" class="edit-save-btn" style="flex:2" id="lf-fg-send">Send reset link</button>
      </div>
      <p style="font-size:.76rem;color:var(--g4,#6b6860);line-height:1.55;margin-top:1rem">No verified email on the admin account? Recovery then needs phpMyAdmin + setup.php (see the project guide).</p>
    </div>`);
  document.getElementById('lf-fg-send').onclick = () => lfSendResetLink('admin');
  setTimeout(() => document.getElementById('lf-fg-user')?.focus(), 50);
};

async function lfSendResetLink(type) {
  const err = document.getElementById('lf-fg-err');
  const btn = document.getElementById('lf-fg-send');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  err.style.display = 'none';
  const body = type === 'admin'
    ? { accountType: 'admin', username: document.getElementById('lf-fg-user').value.trim() }
    : { accountType: 'merchant', brandId: document.getElementById('lf-fg-brand').value };
  if (type === 'admin' && !body.username) return show('Please enter the admin username.');
  if (type === 'merchant' && !body.brandId) return show('Please choose your brand.');
  btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const r = await lfEmailApi('forgot', { method: 'POST', body });
    const box = document.getElementById('lf-forgot-body');
    if (r.sent) {
      box.innerHTML = `
        <div style="text-align:center;font-size:2.4rem;line-height:1;margin:.2rem 0 .6rem" aria-hidden="true">✉️</div>
        <div style="${LF_OK_BOX}"><strong>Reset link sent!</strong><br>${lfEsc(r.message)}</div>
        <p style="font-size:.8rem;color:var(--g4,#6b6860);line-height:1.55;margin-top:.8rem">Open the email and click <b>Reset password</b>. Don't see it? Check your Spam or Promotions folder.</p>
        ${r.devOutbox ? LF_DEV_NOTE : ''}
        <button type="button" class="edit-save-btn" style="width:100%;margin-top:1rem" onclick="document.getElementById('lf-forgot-modal').remove()">OK</button>`;
    } else if (r.noVerifiedEmail) {
      box.innerHTML = `
        <div style="background:#fef3c7;border:1px solid #d97706;border-radius:8px;padding:.8rem 1rem;font-size:.875rem;color:#92400e;line-height:1.6">${lfEsc(r.message)}</div>
        <div style="display:flex;gap:.6rem;margin-top:1rem">
          <button type="button" class="edit-cancel-btn" style="flex:1" onclick="document.getElementById('lf-forgot-modal').remove()">Close</button>
          <button type="button" class="edit-save-btn" style="flex:2" id="lf-fg-ask-admin">Ask the admin instead</button>
        </div>`;
      document.getElementById('lf-fg-ask-admin').onclick = () => {
        const brand = body.brandId;
        document.getElementById('lf-forgot-modal').remove();
        const sel = document.getElementById('mm-brand-select'); if (sel) sel.value = brand;
        _lfLegacyForgotForm();
      };
    }
  } catch (e) { show(e.message); btn.disabled = false; btn.textContent = 'Send reset link'; }
}

/* ---------- 2. Required recovery email after login ---------- */
async function lfLoadEmailStatus() {
  if (!currentMerchant) { LF_EMAIL_STATUS = null; return null; }
  try { LF_EMAIL_STATUS = await lfEmailApi('status'); } catch (e) { LF_EMAIL_STATUS = null; }
  return LF_EMAIL_STATUS;
}

function lfEmailFormHtml(prefix) {
  return `
    <label class="pay-label" for="${prefix}-email">Recovery email *</label>
    <input id="${prefix}-email" class="pay-input" type="email" maxlength="190" autocomplete="email" placeholder="you@gmail.com">
    <label class="pay-label" for="${prefix}-pass">Current password *</label>
    <input id="${prefix}-pass" class="pay-input" type="password" autocomplete="current-password" placeholder="To confirm it's you">
    <div id="${prefix}-err" role="alert" style="${LF_ERR_BOX}"></div>`;
}

async function lfSubmitEmail(prefix, after) {
  const err = document.getElementById(prefix + '-err');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  err.style.display = 'none';
  const email = document.getElementById(prefix + '-email').value.trim();
  const currentPassword = document.getElementById(prefix + '-pass').value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show('Please enter a valid email address.');
  if (!currentPassword) return show('Enter your current password.');
  try {
    const r = await lfEmailApi('set_email', { method: 'POST', body: { email, currentPassword } });
    LF_EMAIL_STATUS = r;
    toast(r.alreadyVerified ? 'This email is already verified.' : 'Verification link sent to ' + email, 'success');
    after && after(r);
  } catch (e) { show(e.message); }
}

function lfOpenEmailRequiredModal() {
  if (!currentMerchant || document.getElementById('lf-email-modal') || document.getElementById('lf-pw-modal')) return;
  const st = LF_EMAIL_STATUS || {};
  const forced = !st.pendingEmail;                       // must at least submit an email
  const who = lfIsAdmin() ? 'admin account' : 'merchant account';
  const wrap = lfResetModal('lf-email-modal', st.pendingEmail ? 'Verify your recovery email' : 'Add a recovery email', `
    <p style="font-size:.875rem;color:var(--g4,#6b6860);line-height:1.6;margin-bottom:1rem">
      Every ${who} needs a <strong>verified email</strong>. If you forget your password, the reset link is sent there.</p>
    <div id="lf-em-body">
      ${st.pendingEmail ? `
        <div style="${LF_OK_BOX}">We sent a verification link to <strong>${lfEsc(st.pendingEmail)}</strong>. Open the email and click <b>Verify email</b>.</div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem">
          <button type="button" class="edit-cancel-btn" style="flex:1" id="lf-em-resend">Resend link</button>
          <button type="button" class="edit-cancel-btn" style="flex:1" id="lf-em-change">Use another email</button>
          <button type="button" class="edit-save-btn" style="flex:1.4" id="lf-em-later">Continue for now</button>
        </div>`
      : `${lfEmailFormHtml('lf-em')}
        <div style="display:flex;gap:.6rem;margin-top:.4rem">
          <button type="button" class="edit-cancel-btn" style="flex:1" id="lf-em-logout">Log out</button>
          <button type="button" class="edit-save-btn" style="flex:2" id="lf-em-send">Send verification link</button>
        </div>`}
    </div>`);
  if (forced) {                                          // can't click outside / Escape to skip
    wrap.replaceWith(wrap.cloneNode(true));
  }
  const m = document.getElementById('lf-email-modal');
  const done = r => { m.remove(); lfRenderEmailBanner(); lfRenderEmailBox(); if (r && r.devOutbox) lfDevOutboxToast(); lfOpenEmailRequiredModal(); };
  document.getElementById('lf-em-send')?.addEventListener('click', () => lfSubmitEmail('lf-em', done));
  document.getElementById('lf-em-logout')?.addEventListener('click', () => { m.remove(); merchantLogout(); });
  document.getElementById('lf-em-later')?.addEventListener('click', () => { sessionStorage.setItem('lf_email_later_' + currentMerchant.id, '1'); m.remove(); lfRenderEmailBanner(); });
  document.getElementById('lf-em-change')?.addEventListener('click', () => {
    document.getElementById('lf-em-body').innerHTML = lfEmailFormHtml('lf-em') + `
      <button type="button" class="edit-save-btn" style="width:100%;margin-top:.4rem" id="lf-em-send2">Send verification link</button>`;
    document.getElementById('lf-em-send2').onclick = () => lfSubmitEmail('lf-em', done);
  });
  document.getElementById('lf-em-resend')?.addEventListener('click', async () => {
    try { const r = await lfEmailApi('resend', { method: 'POST' }); toast(r.message, 'success'); if (r.devOutbox) lfDevOutboxToast(); }
    catch (e) { toast(e.message, 'error'); }
  });
  setTimeout(() => document.getElementById('lf-em-email')?.focus(), 50);
}
function lfDevOutboxToast() { setTimeout(() => toast('Test mode: the email was saved in backend/mail_outbox on this PC', ''), 1800); }

async function lfCheckEmailRequirement() {
  if (!currentMerchant || LF.mustChange) return;
  const st = await lfLoadEmailStatus();
  lfRenderEmailBanner();
  if (!st || st.verified) return;
  if (st.pendingEmail && sessionStorage.getItem('lf_email_later_' + currentMerchant.id)) return;
  lfOpenEmailRequiredModal();
}

// dashboard banner while not verified
function lfRenderEmailBanner() {
  const hd = document.querySelector('#page-merchant .merch-page-hd');
  let b = document.getElementById('lf-email-banner');
  const st = LF_EMAIL_STATUS;
  if (!currentMerchant || !st || st.verified || !hd) { b?.remove(); return; }
  if (!b) { b = document.createElement('div'); b.id = 'lf-email-banner'; hd.insertAdjacentElement('afterend', b); }
  b.setAttribute('role', 'status');
  b.style.cssText = 'background:#fef3c7;border:1px solid #d97706;color:#92400e;border-radius:var(--r2,12px);padding:.75rem 1rem;margin:0 0 1rem;font-size:.86rem;display:flex;gap:.6rem;align-items:center;justify-content:space-between;flex-wrap:wrap';
  b.innerHTML = `<span>${st.pendingEmail ? 'Please verify your recovery email <b>' + lfEsc(st.pendingEmail) + '</b> — check your inbox.' : '<b>Required:</b> add a recovery email so you can reset your password if you forget it.'}</span>
    <button type="button" class="tbl-action" onclick="lfOpenEmailRequiredModal()">${st.pendingEmail ? 'Resend / change' : 'Add email'}</button>`;
}

const _lfLoadAllDataEmail = loadAllData;
loadAllData = async function () {
  const r = await _lfLoadAllDataEmail.apply(this, arguments);
  lfCheckEmailRequirement();
  return r;
};

/* ---------- 3. Security tab: my recovery email (+ admin: all merchants) ---------- */
function lfBox(id) {
  let box = document.getElementById(id);
  const panel = document.getElementById('merch-panel-security');
  if (!panel) return null;
  if (!box) {
    box = document.createElement('div');
    box.id = id;
    box.style.cssText = 'background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;max-width:720px;box-shadow:var(--shadow);margin:0 0 1.3rem';
    panel.insertBefore(box, panel.firstElementChild?.nextElementSibling || null);
  }
  return box;
}
const LF_BADGE = (ok, txt) => `<span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:20px;text-transform:uppercase;${ok ? 'background:#dcf5eb;color:#076a35' : 'background:#fef3c7;color:#92400e'}">${txt}</span>`;

async function lfRenderEmailBox() {
  if (!currentMerchant) return;
  const box = lfBox('lf-email-box'); if (!box) return;
  const st = await lfLoadEmailStatus() || {};
  box.innerHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">Recovery email</div>
    <p style="font-size:.86rem;color:var(--g4);line-height:1.6;margin-bottom:.8rem">Password reset links are sent only to a <b>verified</b> email.</p>
    <div style="font-size:.9rem;margin-bottom:.9rem">
      ${st.verified ? `${LF_BADGE(true, 'Verified')} <b>${lfEsc(st.email)}</b>` : `${LF_BADGE(false, 'Not verified')} ${st.email ? 'Current: <b>' + lfEsc(st.email) + '</b>' : 'No verified email yet'}`}
      ${st.pendingEmail ? `<div style="margin-top:.4rem;color:var(--g5)">Waiting for verification: <b>${lfEsc(st.pendingEmail)}</b> <button class="tbl-action" style="margin-left:.4rem" id="lf-eb-resend">Resend link</button></div>` : ''}
    </div>
    ${lfEmailFormHtml('lf-eb')}
    <button class="edit-save-btn" style="max-width:260px" id="lf-eb-save">${st.verified ? 'Change email' : 'Send verification link'}</button>`;
  document.getElementById('lf-eb-save').onclick = () => lfSubmitEmail('lf-eb', r => { lfRenderEmailBox(); lfRenderEmailBanner(); if (r && r.devOutbox) lfDevOutboxToast(); });
  document.getElementById('lf-eb-resend')?.addEventListener('click', async () => {
    try { const r = await lfEmailApi('resend', { method: 'POST' }); toast(r.message, 'success'); if (r.devOutbox) lfDevOutboxToast(); }
    catch (e) { toast(e.message, 'error'); }
  });
  if (lfIsAdmin()) lfRenderAdminEmails();
  else document.getElementById('lf-admin-emails')?.remove();
}

async function lfRenderAdminEmails() {
  const panel = document.getElementById('merch-panel-security'); if (!panel) return;
  let box = document.getElementById('lf-admin-emails');
  if (!box) {
    box = document.createElement('div');
    box.id = 'lf-admin-emails';
    box.style.cssText = 'background:#fff;border:1px solid var(--g2);border-radius:var(--r2);padding:1.7rem;max-width:720px;box-shadow:var(--shadow);margin:0 0 1.3rem';
    document.getElementById('lf-email-box').insertAdjacentElement('afterend', box);
  }
  let d;
  try { d = await lfEmailApi('list'); } catch (e) { box.innerHTML = `<div style="color:var(--red)">${lfEsc(e.message)}</div>`; return; }
  const verified = d.merchants.filter(m => m.verified).length;
  box.innerHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.02em;margin-bottom:.3rem">Merchant recovery emails</div>
    <p style="font-size:.86rem;color:var(--g4);line-height:1.6;margin-bottom:.4rem">${verified} of ${d.merchants.length} merchants verified. Merchants without a verified email can't receive reset links.</p>
    ${d.smtpConfigured ? '' : `<p style="font-size:.8rem;background:#fef3c7;color:#92400e;border-radius:8px;padding:.5rem .7rem;margin-bottom:.6rem">Email sending is in <b>test mode</b> — emails are saved in <code>backend/mail_outbox/</code>. Add Gmail SMTP to <code>backend/config.local.php</code> to send real emails.</p>`}
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.84rem">
      <thead><tr style="text-align:left;color:var(--g4);font-size:.72rem;text-transform:uppercase;letter-spacing:.06em">
        <th style="padding:.5rem;border-bottom:1px solid var(--g2)">Brand</th><th style="padding:.5rem;border-bottom:1px solid var(--g2)">Email</th>
        <th style="padding:.5rem;border-bottom:1px solid var(--g2)">Status</th><th style="padding:.5rem;border-bottom:1px solid var(--g2)"></th></tr></thead>
      <tbody>${d.merchants.map(m => `<tr>
        <td style="padding:.5rem;border-bottom:1px solid var(--g1);font-weight:600">${lfEsc(m.name)}</td>
        <td style="padding:.5rem;border-bottom:1px solid var(--g1)">${lfEsc(m.email || m.pendingEmail || '—')}</td>
        <td style="padding:.5rem;border-bottom:1px solid var(--g1)">${m.verified ? LF_BADGE(true, 'Verified') : LF_BADGE(false, m.pendingEmail ? 'Pending' : 'None')}</td>
        <td style="padding:.5rem;border-bottom:1px solid var(--g1)"><button class="tbl-action" onclick="lfAdminSetMerchantEmail('${lfEsc(m.brandId)}')">Set email</button></td>
      </tr>`).join('')}</tbody></table></div>`;
}

async function lfAdminSetMerchantEmail(brandId) {
  const email = prompt('Recovery email for ' + (getBrandName(brandId) || brandId) + '\n(the merchant will get a link to verify it):');
  if (!email) return;
  try { const r = await lfEmailApi('admin_set_email', { method: 'POST', body: { brandId, email: email.trim() } }); toast(r.message, 'success'); if (r.devOutbox) lfDevOutboxToast(); lfRenderAdminEmails(); }
  catch (e) { toast(e.message, 'error'); }
}

const _lfShowMerchTabEmail = showMerchTab;
showMerchTab = function (tab) {
  const r = _lfShowMerchTabEmail.apply(this, arguments);
  if (tab === 'security') lfRenderEmailBox();
  return r;
};

/* ---------- 4. Add Brand: merchant email required ---------- */
function lfAddBrandEmailField() {
  if (document.getElementById('nb-email')) return;
  const pass = document.getElementById('nb-pass'); if (!pass) return;
  const label = document.createElement('label');
  label.className = 'pay-label'; label.htmlFor = 'nb-email'; label.textContent = 'Merchant email (for password recovery) *';
  const input = document.createElement('input');
  input.id = 'nb-email'; input.className = 'pay-input'; input.type = 'email'; input.maxLength = 190; input.placeholder = 'merchant@gmail.com';
  pass.insertAdjacentElement('afterend', input);
  pass.insertAdjacentElement('afterend', label);
}
const _lfAdminAddBrandEmail = adminAddBrand;
adminAddBrand = async function () {
  lfAddBrandEmailField();
  const id = document.getElementById('nb-id').value.trim().toLowerCase().replace(/\s+/g, '');
  const email = (document.getElementById('nb-email')?.value || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Enter the merchant\'s email (for password recovery)', 'error'); return; }
  const exists = () => BRANDS.some(b => b.id === id);   // getBrand() returns a placeholder for unknown ids
  const existed = exists();
  await _lfAdminAddBrandEmail.apply(this, arguments);
  if (!existed && exists()) {
    try {
      const r = await lfEmailApi('admin_set_email', { method: 'POST', body: { brandId: id, email } });
      document.getElementById('nb-email').value = '';
      setTimeout(() => toast('Verification email sent to ' + email + ' — the merchant must open it.', 'success'), 1500);
      if (r.devOutbox) lfDevOutboxToast();
    } catch (e) { toast('Brand added, but the email failed: ' + e.message, 'error'); }
  }
};
const _lfRenderMerchantDashEmail = renderMerchantDash;
renderMerchantDash = function () {
  const r = _lfRenderMerchantDashEmail.apply(this, arguments);
  lfAddBrandEmailField();
  lfRenderEmailBanner();
  return r;
};
document.addEventListener('DOMContentLoaded', lfAddBrandEmailField);
if (document.readyState !== 'loading') lfAddBrandEmailField();
````

### 11.31 `backend/AddressPH.js`  (338 lines)

````javascript
/* ============================================================
   AddressPH.js — Philippine address with typing suggestions.   v4

   LOAD ORDER (last):
     ... backend/ShippingJNT.js, backend/EmailFeature.js,
         backend/AddressPH.js

   Checkout step 1 asks for, in this order:
     City / Municipality   (type to search all of them — province fills in by itself)
     Province              (type to search; narrows the city list)
     Barangay              (type to search the barangays of that city)
     House no. / Street / Subdivision / Landmark
   • Suggestions appear while typing, sorted A→Z (numbers in natural
     order), accents optional ("paranaque" finds Parañaque, "santo"
     finds "Sto. Tomas").
   • Arrow keys + Enter or click to choose; Esc closes the list.
   • The J&T shipping area is set automatically from the city.
   • The full address is saved with the order (orders.address).
   Data: official PSA PSGC list as of 30 June 2026 (2Q 2026): 84 provinces
   incl. Metro Manila, 1,655 cities/municipalities (Manila by district),
   42,010 barangays — data/ph-address/, rebuilt with tools/update-address-data.py.
   ============================================================ */

const LF_ADDR_VERSION = '4';
const LF_ADDR_BASE = 'data/ph-address/';
const LF_ADDR = { provinces: null, index: null, cities: {}, sel: { prov: null, city: null, brgy: '' } };
console.info('[Lost & Found] AddressPH.js v' + LF_ADDR_VERSION + ' loaded');

const lfCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const lfSort = (arr, key) => arr.slice().sort((a, b) => lfCollator.compare(key ? key(a) : a, key ? key(b) : b));
function lfNorm(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\bsto\.?(?=\s)/g, 'santo').replace(/\bsta\.?(?=\s)/g, 'santa').replace(/\bgen\.?(?=\s)/g, 'general')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

// spelling-forgiving form used only when nothing matches exactly: w≈u, k≈c, doubled letters
function lfFuzz(s) { return s.replace(/w/g, 'u').replace(/k/g, 'c').replace(/([a-z])\1+/g, '$1'); }

async function lfAddrFetch(path) {
  const url = LF_ADDR_BASE + path + '?v=' + LF_ADDR_VERSION;
  let r;
  try { r = await fetch(url, { headers: { 'Accept': 'application/json' } }); }
  catch (e) { throw new Error('could not open ' + url + ' (is the site opened through http://localhost/ ?)'); }
  if (!r.ok) throw new Error(url + ' → ' + r.status + (r.status === 404 ? ' Not Found (copy the "data" folder into the lostandfound folder)' : ''));
  return r.json();
}

/* ============================================================
   Small accessible combobox (input + suggestion list)
   ============================================================ */
function lfCombo({ input, getItems, label, sub, onPick, emptyText }) {
  const list = document.createElement('ul');
  list.id = input.id + '-list';
  list.setAttribute('role', 'listbox');
  list.style.cssText = 'position:absolute;left:0;right:0;top:100%;z-index:50;max-height:240px;overflow-y:auto;margin:2px 0 0;padding:4px 0;list-style:none;background:#fff;border:1.5px solid var(--g2,#d6d3cc);border-radius:var(--r,8px);box-shadow:0 8px 24px rgba(0,0,0,.12);display:none';
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative';
  input.parentElement.insertBefore(wrap, input);
  wrap.appendChild(input); wrap.appendChild(list);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', list.id);
  input.autocomplete = 'off';

  let items = [], shown = [], active = -1, picked = null;

  function rank(q) {
    if (!q) return items.slice(0, 300);
    const words = q.split(' ');
    const scored = [];
    for (const it of items) {
      const hay = it._norm;
      if (!words.every(w => hay.includes(w))) continue;
      const score = hay.startsWith(q) ? 0 : (' ' + hay).includes(' ' + words[0]) ? 1 : 2;
      scored.push([score, it]);
    }
    if (!scored.length && lfFuzz(q).replace(/ /g, '').length >= 4) {   // nothing? try the spelling-forgiving match
      const fq = lfFuzz(q).split(' ');
      for (const it of items) if (fq.every(w => it._fuzz.includes(w))) scored.push([3, it]);
    }
    scored.sort((a, b) => a[0] - b[0] || lfCollator.compare(label(a[1]), label(b[1])));
    return scored.slice(0, 80).map(s => s[1]);
  }
  function render() {
    const q = lfNorm(input.value);
    shown = rank(picked && input.value === label(picked) ? '' : q);
    active = shown.length ? 0 : -1;
    list.innerHTML = shown.length
      ? shown.map((it, i) => `<li id="${list.id}-${i}" role="option" data-i="${i}" aria-selected="${i === active}"
          style="padding:.5rem .8rem;cursor:pointer;font-size:.88rem;line-height:1.3;${i === active ? 'background:var(--g1,#f1efe9)' : ''}">
          <span style="font-weight:600">${lfEsc(label(it))}</span>${sub && sub(it) ? `<span style="color:var(--g4,#6b6860);font-size:.8rem"> — ${lfEsc(sub(it))}</span>` : ''}</li>`).join('')
      : `<li style="padding:.55rem .8rem;color:var(--g4,#6b6860);font-size:.85rem">${lfEsc(items.length ? 'No match — check the spelling' : (emptyText || 'Nothing to choose yet'))}</li>`;
    open();
    setActive(active);
  }
  function open() { list.style.display = 'block'; input.setAttribute('aria-expanded', 'true'); }
  function close() { list.style.display = 'none'; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
  function setActive(i) {
    [...list.querySelectorAll('[role=option]')].forEach((li, j) => {
      li.style.background = j === i ? 'var(--g1,#f1efe9)' : ''; li.setAttribute('aria-selected', j === i ? 'true' : 'false');
    });
    active = i;
    if (i >= 0) { const li = document.getElementById(`${list.id}-${i}`); input.setAttribute('aria-activedescendant', li.id); if (typeof li.scrollIntoView === 'function') li.scrollIntoView({ block: 'nearest' }); }
  }
  function choose(it) { picked = it; input.value = it ? label(it) : ''; input.style.borderColor = ''; close(); onPick(it); }

  input.addEventListener('input', () => { if (picked) { picked = null; onPick(null, true); } render(); });
  input.addEventListener('focus', () => { if (!input.disabled) render(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.style.display === 'none') render(); else if (shown.length) setActive(Math.min(active + 1, shown.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) setActive(Math.max(active - 1, 0)); }
    else if (e.key === 'Enter') { if (list.style.display !== 'none' && active >= 0) { e.preventDefault(); choose(shown[active]); } }
    else if (e.key === 'Escape') { close(); }
  });
  list.addEventListener('mousedown', e => {           // mousedown so it fires before the input loses focus
    const li = e.target.closest('[role=option]'); if (!li) return;
    e.preventDefault(); choose(shown[+li.dataset.i]);
  });
  input.addEventListener('blur', () => setTimeout(() => {
    close();
    if (!picked && input.value.trim()) {               // typed but didn't choose: accept an exact match, else flag it
      const q = lfNorm(input.value);
      const exact = items.filter(it => lfNorm(label(it)) === q);
      if (exact.length === 1) choose(exact[0]); else input.style.borderColor = 'var(--red,#b91c1c)';
    }
  }, 120));

  return {
    setItems(arr) { items = arr.map(it => { const n = lfNorm(label(it) + ' ' + (sub ? sub(it) || '' : '')); return { ...it, _norm: n, _fuzz: lfFuzz(n) }; }); if (document.activeElement === input) render(); },
    set(it) { picked = it ? (items.find(x => x.c === it.c && x.k === it.k) || it) : null; input.value = it ? label(it) : ''; input.style.borderColor = ''; },
    get: () => picked,
    enable(on) { input.disabled = !on; input.style.opacity = on ? '' : '.55'; },
  };
}

/* ============================================================
   The form
   ============================================================ */
let LF_CB = null;

function lfBuildAddressForm() {
  if (document.getElementById('lf-addr')) return true;
  const zoneSel = document.getElementById('shipping-zone');
  if (!zoneSel) return false;
  const zoneLbl = document.querySelector('label[for="shipping-zone"]');
  const inputCss = 'width:100%;box-sizing:border-box';

  const box = document.createElement('div');
  box.id = 'lf-addr';
  box.innerHTML = `
    <div style="font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--g4);margin:.2rem 0 .5rem">Delivery address</div>
    <div id="lf-addr-error" role="alert" style="display:none;background:#fee2e2;border:1px solid var(--red,#b91c1c);color:var(--red,#b91c1c);border-radius:var(--r,8px);padding:.65rem .9rem;font-size:.82rem;line-height:1.5;margin-bottom:.8rem"></div>
    <label class="pay-label" for="lf-addr-city">City / Municipality *</label>
    <input class="pay-input" id="lf-addr-city" style="${inputCss}" placeholder="Start typing, e.g. Lipa" disabled>
    <label class="pay-label" for="lf-addr-prov">Province *</label>
    <input class="pay-input" id="lf-addr-prov" style="${inputCss}" placeholder="Fills in when you choose a city — or type, e.g. Batangas" disabled>
    <label class="pay-label" for="lf-addr-brgy">Barangay *</label>
    <input class="pay-input" id="lf-addr-brgy" style="${inputCss}" placeholder="Choose a city first" disabled>
    <label class="pay-label" for="lf-addr-street">House no., Street, Subdivision / Village, Landmark *</label>
    <textarea class="pay-input" id="lf-addr-street" maxlength="300" rows="2" autocomplete="street-address"
      style="resize:vertical;min-height:62px;${inputCss}" placeholder="e.g. Blk 5 Lot 12, Mabini St., Villa Rosa Subd., near the chapel"></textarea>
    <div id="lf-addr-preview" aria-live="polite" style="display:none;font-size:.8rem;line-height:1.5;color:var(--g5);background:var(--g1);border-radius:var(--r,8px);padding:.6rem .8rem;margin:-.2rem 0 .8rem"></div>`;
  (zoneLbl || zoneSel).insertAdjacentElement('beforebegin', box);
  zoneSel.style.display = 'none'; zoneSel.setAttribute('aria-hidden', 'true'); zoneSel.tabIndex = -1;
  if (zoneLbl) zoneLbl.style.display = 'none';

  const provName = k => (LF_ADDR.provinces || []).find(p => p.k === k)?.n || '';
  LF_CB = {
    city: lfCombo({ input: document.getElementById('lf-addr-city'), label: c => c.n, sub: c => provName(c.k),
      emptyText: 'Loading cities…', onPick: lfAddrOnCity }),
    prov: lfCombo({ input: document.getElementById('lf-addr-prov'), label: p => p.n, sub: null,
      emptyText: 'Loading provinces…', onPick: lfAddrOnProvince }),
    brgy: lfCombo({ input: document.getElementById('lf-addr-brgy'), label: b => b.n, sub: null,
      emptyText: 'Choose a city first', onPick: b => { LF_ADDR.sel.brgy = b ? b.n : ''; lfAddrCompose(); } }),
  };
  document.getElementById('lf-addr-street').addEventListener('input', lfAddrCompose);
  lfBuildStep2Summary();
  lfAddrLoad();
  return true;
}

function lfBuildStep2Summary() {
  const addr = document.getElementById('pay-address');
  if (!addr || document.getElementById('lf-addr-summary')) return;
  const lbl = document.querySelector('label[for="pay-address"]');
  addr.style.display = 'none'; addr.setAttribute('aria-hidden', 'true'); addr.tabIndex = -1;
  if (lbl) lbl.textContent = 'Delivery Address *';
  const sum = document.createElement('div');
  sum.id = 'lf-addr-summary';
  sum.style.cssText = 'font-size:.86rem;line-height:1.55;background:var(--g1);border:1.5px solid var(--g2);border-radius:var(--r,8px);padding:.7rem .9rem;margin-bottom:1rem;display:flex;justify-content:space-between;gap:.6rem;align-items:flex-start';
  sum.innerHTML = '<span id="lf-addr-summary-text" style="color:var(--g5)">Set your address in step 1.</span>'
    + '<button type="button" class="tbl-action" style="flex-shrink:0" onclick="updateCheckoutStep(1)">Change</button>';
  addr.insertAdjacentElement('afterend', sum);
}

async function lfAddrLoad() {
  try {
    const [pv, ix] = await Promise.all([lfAddrFetch('provinces.json'), lfAddrFetch('cities-index.json')]);
    LF_ADDR.provinces = lfSort(pv.provinces, p => p.n);
    LF_ADDR.index = lfSort(ix, c => c.n);
    LF_CB.prov.setItems(LF_ADDR.provinces);
    LF_CB.city.setItems(LF_ADDR.index);
    LF_CB.city.enable(true); LF_CB.prov.enable(true);
  } catch (e) {
    console.error('[Lost & Found] address list', e);
    const err = document.getElementById('lf-addr-error');
    err.innerHTML = '<b>The address list could not load:</b> ' + lfEsc(e.message)
      + '<br>You can still choose your area below and type your full address in the next step.';
    err.style.display = 'block';
    // keep checkout usable: show the old area list + free-text address again
    const zoneSel = document.getElementById('shipping-zone');
    zoneSel.style.display = ''; zoneSel.removeAttribute('aria-hidden'); zoneSel.tabIndex = 0;
    const zoneLbl = document.querySelector('label[for="shipping-zone"]'); if (zoneLbl) zoneLbl.style.display = '';
    ['lf-addr-city', 'lf-addr-prov', 'lf-addr-brgy', 'lf-addr-street'].forEach(id => {
      const el = document.getElementById(id); el.closest('div[style*="position:relative"]')?.remove(); el.remove();
    });
    document.querySelectorAll('#lf-addr label').forEach(l => l.remove());
    const addr = document.getElementById('pay-address');
    if (addr) { addr.style.display = ''; addr.removeAttribute('aria-hidden'); addr.tabIndex = 0; }
    document.getElementById('lf-addr-summary')?.remove();
    LF_ADDR.failed = true;
  }
}

async function lfAddrProvinceCities(k) {
  if (!LF_ADDR.cities[k]) LF_ADDR.cities[k] = await lfAddrFetch('cities/' + encodeURIComponent(k) + '.json');
  return LF_ADDR.cities[k];
}

/* ---------- picking ---------- */
async function lfAddrOnCity(c, typing) {
  LF_ADDR.sel.city = null; LF_ADDR.sel.brgy = '';
  LF_CB.brgy.set(null); LF_CB.brgy.setItems([]); LF_CB.brgy.enable(false);
  document.getElementById('lf-addr-brgy').placeholder = 'Choose a city first';
  if (!c) { lfAddrSetZone(LF_ADDR.sel.prov ? LF_ADDR.sel.prov.z : ''); lfAddrCompose(); return; }
  // province fills in by itself
  const prov = LF_ADDR.provinces.find(p => p.k === c.k);
  LF_ADDR.sel.prov = prov; LF_CB.prov.set(prov);
  try {
    const full = (await lfAddrProvinceCities(c.k)).find(x => x.c === c.c);
    if (!full || LF_CB.city.get()?.c !== c.c) return;               // changed again meanwhile
    LF_ADDR.sel.city = full;
    LF_CB.brgy.setItems(lfSort(full.b).map(n => ({ c: n, n })));
    LF_CB.brgy.enable(true);
    document.getElementById('lf-addr-brgy').placeholder = `Type your barangay (${full.b.length} in ${full.n})`;
    lfAddrSetZone(full.z);
  } catch (e) { toast('Could not load barangays — ' + e.message, 'error'); }
  lfAddrCompose();
}

function lfAddrOnProvince(p) {
  LF_ADDR.sel.prov = p || null;
  const city = LF_CB.city.get();
  if (!p) {                                                          // province cleared → all cities again
    LF_CB.city.setItems(LF_ADDR.index);
  } else {
    LF_CB.city.setItems(LF_ADDR.index.filter(c => c.k === p.k));      // only this province's cities
    if (city && city.k !== p.k) {                                    // city belongs elsewhere → clear it
      LF_CB.city.set(null); lfAddrOnCity(null);
    }
    document.getElementById('lf-addr-city').placeholder = 'Type a city / municipality in ' + p.n;
  }
  if (!LF_ADDR.sel.city) lfAddrSetZone(p ? p.z : '');
  lfAddrCompose();
}

/* ---------- shipping follows the address ---------- */
function lfAddrSetZone(zone) {
  const zoneSel = document.getElementById('shipping-zone');
  if (!zoneSel) return;
  if (zone && !zoneSel.querySelector(`option[value="${zone}"]`)) {
    const o = document.createElement('option'); o.value = zone; o.textContent = zone; zoneSel.appendChild(o);
  }
  if (zoneSel.value !== (zone || '')) { zoneSel.value = zone || ''; updateShippingRate(); }
}

/* ---------- full address ---------- */
function lfAddrFull() {
  const s = LF_ADDR.sel;
  const street = (document.getElementById('lf-addr-street')?.value || '').trim().replace(/\s+/g, ' ');
  if (!s.prov || !s.city || !s.brgy || !street) return '';
  const brgy = /^(brgy\.?|barangay)\b/i.test(s.brgy) ? s.brgy : 'Brgy. ' + s.brgy;
  const prov = s.prov.k === 'NCR' ? 'Metro Manila' : s.prov.n;
  return `${street}, ${brgy}, ${s.city.n}, ${prov}`;
}
function lfAddrCompose() {
  const full = lfAddrFull();
  const addr = document.getElementById('pay-address');
  if (addr && !LF_ADDR.failed) addr.value = full;
  const prev = document.getElementById('lf-addr-preview');
  if (prev) { prev.style.display = full ? 'block' : 'none'; prev.innerHTML = full ? '<strong>Deliver to:</strong> ' + lfEsc(full) : ''; }
  const sum = document.getElementById('lf-addr-summary-text');
  if (sum) sum.innerHTML = full ? lfEsc(full) : 'Set your address in step 1.';
}

/* ---------- checkout hooks ---------- */
const _lfCheckoutNextAddr = checkoutNext;
checkoutNext = function () {
  if (checkoutStep === 1 && document.getElementById('lf-addr-city') && !LF_ADDR.failed) {
    const s = LF_ADDR.sel;
    const street = (document.getElementById('lf-addr-street').value || '').trim();
    const need = !s.city ? ['lf-addr-city', 'Please choose your city / municipality from the suggestions']
      : !s.prov ? ['lf-addr-prov', 'Please choose your province']
      : !s.brgy ? ['lf-addr-brgy', 'Please choose your barangay from the suggestions']
      : street.length < 5 ? ['lf-addr-street', 'Please enter your house no. and street']
      : null;
    if (need) { toast(need[1], 'error'); document.getElementById(need[0])?.focus(); return; }
    lfAddrCompose();
  }
  return _lfCheckoutNextAddr.apply(this, arguments);
};

const _lfBuildReceiptAddr = buildReceipt;
buildReceipt = function () {
  const r = _lfBuildReceiptAddr.apply(this, arguments);
  if (lfBuildAddressForm() && !LF_ADDR.failed) {
    const s = LF_ADDR.sel;
    const zone = s.city ? s.city.z : (s.prov ? s.prov.z : '');
    if (zone) { document.getElementById('shipping-zone').value = ''; lfAddrSetZone(zone); }
    lfAddrCompose();
  }
  return r;
};

const _lfPlaceOrderAddr = placeOrder;
placeOrder = async function () {
  if (document.getElementById('lf-addr-city') && !LF_ADDR.failed) {
    const full = lfAddrFull();
    if (!full) { toast('Please complete your delivery address', 'error'); updateCheckoutStep(1); return; }
    document.getElementById('pay-address').value = full;
  }
  return _lfPlaceOrderAddr.apply(this, arguments);
};

document.addEventListener('DOMContentLoaded', lfBuildAddressForm);
if (document.readyState !== 'loading') lfBuildAddressForm();
````

### 11.32 `backend/lib/.htaccess`  (8 lines)

````apache
# Never served to browsers.
<IfModule mod_authz_core.c>
  Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
  Order allow,deny
  Deny from all
</IfModule>
````

### 11.33 `backend/mail_outbox/.htaccess`  (8 lines)

````apache
# Never served to browsers.
<IfModule mod_authz_core.c>
  Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
  Order allow,deny
  Deny from all
</IfModule>
````

### 11.34 `tools/update-address-data.py`  (109 lines)

````python
#!/usr/bin/env python3
"""
update-address-data.py — rebuilds data/ph-address/ from the official PSA PSGC list.

Source format: the "ph-psgc" JSON release (github.com/Tenasia/ph-psgc), which mirrors
PSA's quarterly PSGC datafile (https://psa.gov.ph/classification/psgc).

Use (each quarter, after PSA's new release):
  1. Download ph-psgc-<version>.zip from the repo's Releases page and unzip it.
  2. python tools/update-address-data.py  path/to/ph-psgc-<version>/psgc
  3. Copy the new data/ph-address folder to the server. Nothing else changes.
"""
import json, os, re, sys, glob, shutil, collections

SRC = sys.argv[1] if len(sys.argv) > 1 else 'psgc'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'ph-address')

# independent cities → the province they are geographically inside (what buyers expect)
INDEPENDENT_TO_PROVINCE = {
    'Angeles': 'Pampanga', 'Bacolod': 'Negros Occidental', 'Baguio': 'Benguet', 'Butuan': 'Agusan del Norte',
    'Cagayan De Oro': 'Misamis Oriental', 'Cebu': 'Cebu', 'Davao': 'Davao del Sur', 'General Santos': 'South Cotabato',
    'Iligan': 'Lanao del Norte', 'Iloilo': 'Iloilo', 'Lapu-Lapu': 'Cebu', 'Lucena': 'Quezon', 'Mandaue': 'Cebu',
    'Olongapo': 'Zambales', 'Puerto Princesa': 'Palawan', 'Tacloban': 'Leyte', 'Zamboanga': 'Zamboanga del Sur',
    'Isabela': 'Basilan',
}
# J&T shipping areas (keys of LF_SHIP_ZONES in backend/Shipping.php)
ISLAND = {'batanes', 'marinduque', 'occidental mindoro', 'oriental mindoro', 'palawan', 'romblon', 'masbate', 'catanduanes'}
NORTH = {'01', '02', '03', '14'}; VISAYAS = {'06', '07', '08', '18'}; MINDANAO = {'09', '10', '11', '12', '16', '19'}
BATANGAS_TOWNS = {'Sto. Tomas': 'santo_tomas', 'Lipa': 'lipa', 'Batangas': 'batangas_city', 'Tanauan': 'tanauan',
                  'Rosario': 'rosario', 'Bauan': 'bauan', 'San Jose': 'san_jose', 'Nasugbu': 'nasugbu'}

def clean(s): return re.sub(r'\s+', ' ', str(s)).strip()
def titled(n): return re.sub(r'\b(Del|De|Of|And)\b', lambda m: m.group(1).lower(), clean(n))
def city_name(n):
    n = clean(n); m = re.match(r'^City of (.+)$', n, re.I)
    return (m.group(1).strip() + ' City') if m else n
def bare(n): return re.sub(r'^City of ', '', clean(n), flags=re.I)

def province_zone(name, reg):
    n = name.lower()
    if reg == '13': return 'metro_manila'
    if n in ISLAND: return 'island'
    if n == 'batangas': return 'other_batangas'
    if n == 'quezon': return 'quezon_province'
    if n in ('laguna', 'cavite', 'rizal'): return n
    if reg in NORTH: return 'luzon_north'
    if reg in VISAYAS: return 'visayas'
    if reg in MINDANAO: return 'mindanao'
    return 'luzon_south'

index = json.load(open(os.path.join(SRC, 'index.json'), encoding='utf-8'))
region_name = {r['code'][:2]: r['name'] for r in index['regions']}
region_of = {}
for r in index['regions']:
    for p in r['provinces']: region_of[p['code']] = r['code'][:2]
    for i in r['independent']: region_of[i['code']] = r['code'][:2]

areas = [json.load(open(f, encoding='utf-8')) for f in glob.glob(os.path.join(SRC, 'areas', '*.json'))]
prov_by_name = {}
for a in areas:
    if a['kind'] == 'province': prov_by_name[titled(a['name']).lower()] = a

groups = collections.OrderedDict()            # key -> {'name','reg','cities':[...]}
def group_for(a):
    reg = region_of[a['code']]
    if reg == '13': return 'NCR', 'Metro Manila (NCR)', '13'
    if a['kind'] == 'independent_city':
        p = prov_by_name[INDEPENDENT_TO_PROVINCE[bare(a['name'])].lower()]
        return group_for(p)
    name = titled(a['name'])
    if 'special geographic area' in name.lower(): return 'SGA', 'Special Geographic Area (BARMM)', reg
    return a['code'][2:5], name, reg

for a in areas:
    key, pname, reg = group_for(a)
    g = groups.setdefault(key, {'name': pname, 'reg': reg, 'cities': []})
    for c in a['cities']:
        brgys = c['barangays']
        if any(len(b) > 2 for b in brgys):   # Manila: barangays carry their district → one entry per district
            by_d = collections.defaultdict(list)
            for b in brgys: by_d[clean(b[2])].append(clean(b[1]))
            for d, names in by_d.items():
                g['cities'].append({'code': c['code'][:5] + '-' + re.sub(r'[^A-Za-z0-9]', '', d), 'name': 'Manila – ' + d, 'b': names})
        else:
            g['cities'].append({'code': c['code'], 'name': city_name(c['name']), 'b': [clean(b[1]) for b in brgys]})

shutil.rmtree(OUT, ignore_errors=True); os.makedirs(os.path.join(OUT, 'cities'))
provinces, idx, total_b, total_c = [], [], 0, 0
for key, g in groups.items():
    pz = province_zone(g['name'], g['reg'])
    out = []
    for c in g['cities']:
        if not c['b']: continue
        z = pz
        if g['name'] == 'Batangas': z = BATANGAS_TOWNS.get(re.sub(r' City$', '', c['name']), 'other_batangas')
        if g['name'] == 'Quezon' and c['name'] == 'Lucena City': z = 'lucena'
        out.append({'c': c['code'], 'n': c['name'], 'z': z, 'b': sorted(set(c['b']), key=str.lower)})
        total_b += len(set(c['b']))
    out.sort(key=lambda x: x['n'].lower()); total_c += len(out)
    json.dump(out, open(os.path.join(OUT, 'cities', key + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    provinces.append({'k': key, 'n': g['name'], 'r': region_name[g['reg']], 'z': pz})
    idx += [{'c': c['c'], 'n': c['n'], 'k': key, 'z': c['z']} for c in out]
provinces.sort(key=lambda p: p['n'].lower())
idx.sort(key=lambda x: (x['n'].lower(), x['k']))
json.dump({'source': 'PSA Philippine Standard Geographic Code (PSGC), as of ' + index.get('published', '?') + ' — https://psa.gov.ph/classification/psgc',
           'published': index.get('published'), 'provinces': provinces},
          open(os.path.join(OUT, 'provinces.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump(idx, open(os.path.join(OUT, 'cities-index.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f"PSGC as of {index.get('published')}: {len(provinces)} provinces, {total_c} cities/municipalities (Manila by district), {total_b} barangays → {os.path.normpath(OUT)}")
````

### 11.35 `uploads/.htaccess`  (26 lines)

````apache
# ============================================================
# uploads/.htaccess — uploaded files are served as images only.
# Scripts can never run from this folder.
# ============================================================
Options -Indexes -ExecCGI

<FilesMatch "\.(?i:php[0-9]?|phtml|phar|pl|py|cgi|sh|asp|aspx|jsp|htaccess|html?|svg|js)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</FilesMatch>

<IfModule mod_php.c>
  php_flag engine off
</IfModule>
<IfModule mod_php7.c>
  php_flag engine off
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
</IfModule>
````

### 11.36 `uploads/index.html`  (1 lines)

````html
<!-- no directory listing -->
````

