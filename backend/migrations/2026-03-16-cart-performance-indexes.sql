-- Improve cart read/update performance for frequent user actions (add/update/remove).
-- 1) Remove duplicate rows so a unique composite key can be enforced safely.
-- 2) Add composite unique index used by `WHERE user_id = ? AND product_id = ?`.
-- 3) Add user+created_at index used by cart list ordering.

DELETE c1
FROM cart c1
JOIN cart c2
  ON c1.user_id = c2.user_id
 AND c1.product_id = c2.product_id
 AND c1.id > c2.id;

ALTER TABLE cart
  ADD UNIQUE KEY unique_cart_user_product (user_id, product_id),
  ADD KEY idx_cart_user_created (user_id, created_at);
