-- =====================================================
-- Reviews and Ratings System Migration
-- =====================================================
-- Comprehensive reviews & ratings for products, vendors, and delivery
-- =====================================================

-- PRODUCT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  vendor_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  helpfulness_count INT DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product_review (user_id, product_id),
  INDEX idx_product_id (product_id),
  INDEX idx_vendor_id (vendor_id),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- VENDOR/SHOP REVIEWS TABLE
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL,
  customer_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  categories VARCHAR(255),
  communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  delivery_rating INT CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5),
  verified_buyer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_customer_vendor_review (customer_id, vendor_id),
  INDEX idx_vendor_id (vendor_id),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REVIEW IMAGES TABLE
CREATE TABLE IF NOT EXISTS review_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  review_id INT NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE,
  INDEX idx_review_id (review_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HELPFUL REVIEW VOTES TABLE (Track who found a review helpful)
CREATE TABLE IF NOT EXISTS helpful_review_votes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  review_id INT NOT NULL,
  user_id INT NOT NULL,
  helpful BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_review_vote (user_id, review_id),
  INDEX idx_review_id (review_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REVIEW SUMMARY MATERIALIZED VIEW (For Performance)
CREATE TABLE IF NOT EXISTS product_rating_summary (
  product_id INT PRIMARY KEY,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  five_star INT DEFAULT 0,
  four_star INT DEFAULT 0,
  three_star INT DEFAULT 0,
  two_star INT DEFAULT 0,
  one_star INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- VENDOR RATING SUMMARY
CREATE TABLE IF NOT EXISTS vendor_rating_summary (
  vendor_id INT PRIMARY KEY,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  average_communication DECIMAL(3,2) DEFAULT 0,
  average_delivery DECIMAL(3,2) DEFAULT 0,
  average_quality DECIMAL(3,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CREATE INDEXES FOR COMMON QUERIES
CREATE INDEX idx_product_rating_avg ON product_rating_summary(average_rating DESC);
CREATE INDEX idx_vendor_rating_avg ON vendor_rating_summary(average_rating DESC);
