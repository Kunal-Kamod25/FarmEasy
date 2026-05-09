-- FarmEasy migration: add tracking table
-- Created: 2026-05-09
-- This table stores high-level order status for customer visibility,
-- separate from the detailed GPS delivery tracking system.

CREATE TABLE IF NOT EXISTS `tracking` (
  `order_id` int NOT NULL,
  `status` varchar(100) DEFAULT 'Order Placed',
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  CONSTRAINT `tracking_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
