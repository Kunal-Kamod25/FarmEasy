-- Disable checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist (order matters)
DROP TABLE IF EXISTS seller;
DROP TABLE IF EXISTS users;

-- Enable checks again
SET FOREIGN_KEY_CHECKS = 1;

-- =============================
-- USERS TABLE
-- =============================

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================
-- SELLER TABLE
-- =============================

CREATE TABLE seller (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  shop_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT seller_ibfk_1
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
