-- Initialize database and users table for AI Insurance
CREATE DATABASE IF NOT EXISTS ai_insurance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_insurance;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) DEFAULT NULL,
  phone VARCHAR(32) NOT NULL,
  password VARCHAR(255) NOT NULL,
  platform VARCHAR(80) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email (email),
  UNIQUE KEY uq_phone (phone)
);
