-- Add Microsoft and GitHub authentication fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS microsoft_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS github_id VARCHAR(255) UNIQUE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_microsoft_id ON users(microsoft_id);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
