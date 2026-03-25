-- Fix admin password
-- Password: Admin123!
-- This script updates the admin user password to the correct hash

UPDATE users 
SET password_hash = '$2b$10$WmaZUR571ktUuDCRWHzQCe16DyIkJCtiDd9GALL3U.lKvUAvg2DVm'
WHERE email = 'admin@luminaledger.com';

-- Verify the update
SELECT 
    email, 
    username, 
    full_name,
    is_active,
    email_verified,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'Password set ✓'
        ELSE 'No password ✗'
    END as password_status
FROM users 
WHERE email = 'admin@luminaledger.com';
