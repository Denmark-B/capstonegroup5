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
