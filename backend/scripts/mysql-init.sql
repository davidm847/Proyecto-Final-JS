-- MySQL initialization script for Docker container
-- This script will be run when the MySQL container starts for the first time

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS medical_management;

-- Use the database
USE medical_management;

-- Set proper character set and collation
ALTER DATABASE medical_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if it doesn't exist (MySQL 8.0 syntax)
CREATE USER IF NOT EXISTS 'medical_user'@'%' IDENTIFIED BY 'userpassword123';

-- Grant all privileges on the medical_management database to the user
GRANT ALL PRIVILEGES ON medical_management.* TO 'medical_user'@'%';

-- Flush privileges to ensure they take effect
FLUSH PRIVILEGES;

-- Display success message
SELECT 'Database and user created successfully!' AS message;
