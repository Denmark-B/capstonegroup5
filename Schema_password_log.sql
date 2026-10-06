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
