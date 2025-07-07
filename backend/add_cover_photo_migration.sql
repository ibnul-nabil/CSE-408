-- Migration script to add cover_photo column to users table
-- Run this script to add support for cover photos

ALTER TABLE users ADD COLUMN cover_photo VARCHAR(255);

-- Optional: Add comment to document the column
COMMENT ON COLUMN users.cover_photo IS 'URL path to user cover photo image'; 