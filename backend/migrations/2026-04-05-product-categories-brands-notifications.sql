-- =====================================================
-- Database Schema: Categories, Brands, Reviews, Notifications, Chat
-- =====================================================

-- 1. CATEGORIES TABLE (with parent-child hierarchy)
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `parent_id` int DEFAULT NULL,
  `icon` varchar(255),
  `slug` varchar(255) UNIQUE,
  `image` varchar(255),
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. BRANDS TABLE
CREATE TABLE IF NOT EXISTS `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `logo` varchar(255),
  `slug` varchar(255) UNIQUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. UPDATE PRODUCT TABLE - Add category_id and brand_id
ALTER TABLE `product` 
ADD COLUMN IF NOT EXISTS `category_id` int,
ADD COLUMN IF NOT EXISTS `brand_id` int,
ADD COLUMN IF NOT EXISTS `stock_quantity` int DEFAULT 0,
ADD COLUMN IF NOT EXISTS `avg_rating` DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS `review_count` int DEFAULT 0,
ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
ADD FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
ADD KEY `idx_category_brand` (`category_id`, `brand_id`);

-- 4. REVIEWS AND RATINGS TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  `title` varchar(255),
  `review_text` text,
  `helpful_count` int DEFAULT 0,
  `verified_purchase` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_user_review` (`product_id`, `user_id`),
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  KEY `idx_product_rating` (`product_id`, `rating`),
  KEY `idx_user_reviews` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. VENDOR NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS `vendor_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text,
  `related_order_id` int,
  `related_product_id` int,
  `is_read` boolean DEFAULT false,
  `action_url` varchar(255),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`related_order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`related_product_id`) REFERENCES `product` (`id`) ON DELETE SET NULL,
  KEY `idx_vendor_read` (`vendor_id`, `is_read`),
  KEY `idx_vendor_date` (`vendor_id`, `created_at`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. FARMER-VENDOR MESSAGES TABLE (Chat)
CREATE TABLE IF NOT EXISTS `vendor_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` varchar(255) NOT NULL,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `product_id` int,
  `message_text` text NOT NULL,
  `attachment_url` varchar(255),
  `is_read` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE SET NULL,
  KEY `idx_conversation` (`conversation_id`),
  KEY `idx_receiver_read` (`receiver_id`, `is_read`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. UPDATE ORDERS TABLE - Add status tracking for notifications
ALTER TABLE `orders`
ADD COLUMN IF NOT EXISTS `vendor_notified` boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS `stock_low_notified` boolean DEFAULT false;

-- 8. SAMPLE DATA - Categories
INSERT INTO `categories` (`name`, `description`, `parent_id`, `icon`, `slug`, `sort_order`) VALUES
('Fertilizers', 'All types of fertilizers and soil nutrients', NULL, '🌾', 'fertilizers', 1),
('Urea Based', 'Urea and nitrogen-based fertilizers', 1, '🧪', 'fertilizers-urea', 10),
('NPK Fertilizers', 'Complete NPK formulations', 1, '⚗️', 'fertilizers-npk', 11),
('Organic Fertilizers', 'Natural and organic fertilizers', 1, '♻️', 'fertilizers-organic', 12),
('Seeds', 'Quality agricultural seeds', NULL, '🌱', 'seeds', 2),
('Vegetable Seeds', 'Seeds for vegetables', 5, '🥬', 'seeds-vegetables', 20),
('Crop Seeds', 'Seeds for field crops', 5, '🌾', 'seeds-crops', 21),
('Pesticides & Fungicides', 'Crop protection products', NULL, '🔬', 'pesticides', 3),
('Insecticides', 'Insect control products', 8, '🦟', 'pesticides-insecticides', 30),
('Fungicides', 'Fungal disease control', 8, '🍄', 'pesticides-fungicides', 31),
('Farm Equipment', 'Agricultural tools and equipment', NULL, '🛠️', 'equipment', 4),
('Irrigation', 'Irrigation systems and parts', NULL, '💧', 'irrigation', 5);

-- 9. SAMPLE DATA - Brands
INSERT INTO `brands` (`name`, `description`, `slug`) VALUES
('Syngenta', 'Global agricultural company', 'syngenta'),
('Bayer', 'Leading life sciences company', 'bayer'),
('BASF', 'Chemical and agricultural products', 'basf'),
('Monsanto', 'Agricultural biotechnology', 'monsanto'),
('Corteva', 'Agricultural innovations', 'corteva'),
('FMC', 'Agricultural sciences company', 'fmc'),
('Nufarm', 'Crop protection leader', 'nufarm'),
('Sumitomo', 'Chemical and agricultural solutions', 'sumitomo');
