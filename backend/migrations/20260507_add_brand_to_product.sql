-- Migration: Add brand column to product table
-- Date: 2026-05-07

ALTER TABLE product ADD COLUMN IF NOT EXISTS brand VARCHAR(255) DEFAULT NULL;
