-- HealPoint Database Migration: Admin Panel, Doctor Verification, and Audit Logging
-- Safe, idempotent alterations that preserve all existing data

USE healpoint_db;

-- 1. Ensure user account status exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_status ENUM('ACTIVE', 'SUSPENDED', 'PENDING') DEFAULT 'ACTIVE' AFTER role;

-- 2. Enhance doctors table with verification, license, and review metadata
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS approval_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING' AFTER consultation_fee,
ADD COLUMN IF NOT EXISTS medical_license_number VARCHAR(100) AFTER approval_status,
ADD COLUMN IF NOT EXISTS specialization VARCHAR(100) AFTER medical_license_number,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT AFTER specialization,
ADD COLUMN IF NOT EXISTS reviewed_by INT AFTER rejection_reason,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL AFTER reviewed_by,
ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 5 AFTER reviewed_at,
ADD COLUMN IF NOT EXISTS qualifications VARCHAR(255) DEFAULT 'MBBS, MD' AFTER experience_years;

-- 3. Enhance patients table with account status
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS account_status ENUM('ACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE' AFTER phone_number;

-- 4. Enhance appointments table with administrative notes and cancellation reasons
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT AFTER status,
ADD COLUMN IF NOT EXISTS admin_modified_by INT AFTER cancellation_reason,
ADD COLUMN IF NOT EXISTS admin_modified_at TIMESTAMP NULL AFTER admin_modified_by;

-- 5. Create Administrative Action Audit Logs Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INT NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6. Seed default system administrator if not already present
-- Password hash for 'Admin@12345' generated via bcrypt (or provisioned via seed script)
INSERT IGNORE INTO users (user_id, email, password_hash, role, account_status, created_at)
VALUES (
    1, 
    'admin@healpoint.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'ADMIN', 
    'ACTIVE', 
    NOW()
);
