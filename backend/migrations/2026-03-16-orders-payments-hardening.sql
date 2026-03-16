-- FarmEasy migration: secure mandatory rules for orders and payments
-- Apply this once on existing databases.

START TRANSACTION;

UPDATE orders SET total_price = 0 WHERE total_price IS NULL;
ALTER TABLE orders
  MODIFY COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00;

UPDATE payment SET payment_method = 'COD' WHERE payment_method IS NULL OR payment_method = '';
UPDATE payment SET amount = 0 WHERE amount IS NULL;
UPDATE payment SET status = 'Pending' WHERE status IS NULL OR status = '';

ALTER TABLE payment
  MODIFY COLUMN payment_method VARCHAR(100) NOT NULL DEFAULT 'COD',
  MODIFY COLUMN amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  MODIFY COLUMN status VARCHAR(100) NOT NULL DEFAULT 'Pending';

COMMIT;
