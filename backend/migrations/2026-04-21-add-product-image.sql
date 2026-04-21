-- =====================================================
-- Migration: Add product_image column to product table
-- =====================================================
-- This migration adds the missing product_image column to the product table
-- which is required for wishlist and product display functionality

ALTER TABLE `product` 
ADD COLUMN IF NOT EXISTS `product_image` VARCHAR(500) DEFAULT NULL AFTER `product_type`;

-- Add index for better query performance
ALTER TABLE `product`
ADD KEY IF NOT EXISTS `idx_product_image` (`product_image`);

-- Migration completed
