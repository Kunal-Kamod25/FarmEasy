-- FarmEasy Database Schema Update
-- Generated for Project Evaluation

SET FOREIGN_KEY_CHECKS = 0;


-- Table structure for brands
CREATE TABLE "brands" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(255) NOT NULL,
  "description" text,
  "logo" varchar(255) DEFAULT NULL,
  "slug" varchar(255) DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "slug" ("slug"),
  KEY "idx_slug" ("slug")
);

-- Table structure for cart
CREATE TABLE "cart" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "product_id" int NOT NULL,
  "quantity" int DEFAULT '1',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "unique_cart_user_product" ("user_id","product_id"),
  KEY "user_id" ("user_id"),
  KEY "product_id" ("product_id"),
  KEY "idx_cart_user_created" ("user_id","created_at"),
  CONSTRAINT "cart_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "cart_ibfk_2" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE
);

-- Table structure for categories
CREATE TABLE "categories" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(255) NOT NULL,
  "description" text,
  "parent_id" int DEFAULT NULL,
  "icon" varchar(255) DEFAULT NULL,
  "slug" varchar(255) DEFAULT NULL,
  "image" varchar(255) DEFAULT NULL,
  "sort_order" int DEFAULT '0',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "slug" ("slug"),
  KEY "idx_parent_id" ("parent_id"),
  KEY "idx_slug" ("slug"),
  CONSTRAINT "categories_ibfk_1" FOREIGN KEY ("parent_id") REFERENCES "categories" ("id") ON DELETE SET NULL
);

-- Table structure for crop_exchanges
CREATE TABLE "crop_exchanges" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "offering_crop" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "offering_quantity" decimal(10,2) NOT NULL,
  "offering_unit" varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'kg',
  "seeking_crop" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "seeking_quantity" decimal(10,2) DEFAULT NULL,
  "seeking_unit" varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'kg',
  "latitude" decimal(10,8) NOT NULL,
  "longitude" decimal(11,8) NOT NULL,
  "radius_km" int DEFAULT '50',
  "description" text COLLATE utf8mb4_unicode_ci,
  "exchange_images" json DEFAULT NULL,
  "status" enum('open','matched','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "idx_user_status" ("user_id","status"),
  KEY "idx_status" ("status"),
  KEY "idx_location" ("latitude","longitude"),
  CONSTRAINT "crop_exchanges_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Table structure for delivery_drivers
CREATE TABLE "delivery_drivers" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int DEFAULT NULL,
  "driver_name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "driver_phone" varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  "driver_email" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "license_number" varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "vehicle_type" varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "vehicle_color" varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "vehicle_registration" varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "license_image" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "vehicle_image" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "status" enum('available','on_delivery','offline') COLLATE utf8mb4_unicode_ci DEFAULT 'offline',
  "current_latitude" decimal(10,8) DEFAULT NULL,
  "current_longitude" decimal(11,8) DEFAULT NULL,
  "total_deliveries" int DEFAULT '0',
  "successful_deliveries" int DEFAULT '0',
  "average_rating" decimal(3,2) DEFAULT '0.00',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "idx_status" ("status"),
  KEY "idx_phone" ("driver_phone"),
  KEY "user_id" ("user_id"),
  CONSTRAINT "delivery_drivers_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL
);

-- Table structure for delivery_notifications
CREATE TABLE "delivery_notifications" (
  "id" int NOT NULL AUTO_INCREMENT,
  "delivery_id" int NOT NULL,
  "user_id" int NOT NULL,
  "notification_type" enum('status_update','driver_arriving','delivery_complete','delay_alert') COLLATE utf8mb4_unicode_ci DEFAULT 'status_update',
  "message" text COLLATE utf8mb4_unicode_ci,
  "send_via_sms" tinyint(1) DEFAULT '1',
  "send_via_push" tinyint(1) DEFAULT '1',
  "send_via_email" tinyint(1) DEFAULT '0',
  "sent_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "sms_status" enum('pending','sent','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  "push_status" enum('pending','sent','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  "opened_at" timestamp NULL DEFAULT NULL,
  "acted_on" tinyint(1) DEFAULT '0',
  PRIMARY KEY ("id"),
  KEY "idx_delivery" ("delivery_id"),
  KEY "idx_user" ("user_id"),
  KEY "idx_sent_at" ("sent_at"),
  CONSTRAINT "delivery_notifications_ibfk_1" FOREIGN KEY ("delivery_id") REFERENCES "order_deliveries" ("id") ON DELETE CASCADE,
  CONSTRAINT "delivery_notifications_ibfk_2" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Table structure for delivery_reviews
CREATE TABLE "delivery_reviews" (
  "id" int NOT NULL AUTO_INCREMENT,
  "delivery_id" int NOT NULL,
  "driver_id" int NOT NULL,
  "user_id" int NOT NULL,
  "rating" int NOT NULL,
  "comment" text COLLATE utf8mb4_unicode_ci,
  "punctuality_rating" int DEFAULT NULL,
  "professionalism_rating" int DEFAULT NULL,
  "product_care_rating" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "idx_delivery" ("delivery_id"),
  KEY "idx_driver" ("driver_id"),
  KEY "idx_user" ("user_id"),
  CONSTRAINT "delivery_reviews_ibfk_1" FOREIGN KEY ("delivery_id") REFERENCES "order_deliveries" ("id") ON DELETE CASCADE,
  CONSTRAINT "delivery_reviews_ibfk_2" FOREIGN KEY ("driver_id") REFERENCES "delivery_drivers" ("id") ON DELETE CASCADE,
  CONSTRAINT "delivery_reviews_ibfk_3" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "delivery_reviews_chk_1" CHECK ((`rating` between 1 and 5))
);

-- Table structure for delivery_status_history
CREATE TABLE "delivery_status_history" (
  "id" int NOT NULL AUTO_INCREMENT,
  "delivery_id" int NOT NULL,
  "previous_status" varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "new_status" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "changed_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "changed_by" int DEFAULT NULL,
  "notes" text COLLATE utf8mb4_unicode_ci,
  "latitude" decimal(10,8) DEFAULT NULL,
  "longitude" decimal(11,8) DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "idx_delivery" ("delivery_id"),
  KEY "idx_status" ("new_status"),
  KEY "idx_changed_at" ("changed_at"),
  KEY "changed_by" ("changed_by"),
  CONSTRAINT "delivery_status_history_ibfk_1" FOREIGN KEY ("delivery_id") REFERENCES "order_deliveries" ("id") ON DELETE CASCADE,
  CONSTRAINT "delivery_status_history_ibfk_2" FOREIGN KEY ("changed_by") REFERENCES "delivery_drivers" ("id") ON DELETE SET NULL
);

-- Table structure for exchange_matches
CREATE TABLE "exchange_matches" (
  "id" int NOT NULL AUTO_INCREMENT,
  "exchange_listing_id" int NOT NULL,
  "proposer_id" int NOT NULL,
  "receiver_id" int NOT NULL,
  "status" enum('pending','accepted','rejected','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  "match_reason" text COLLATE utf8mb4_unicode_ci,
  "exchange_date" date DEFAULT NULL,
  "location_agreed" text COLLATE utf8mb4_unicode_ci,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "idx_listing" ("exchange_listing_id"),
  KEY "idx_proposer" ("proposer_id"),
  KEY "idx_receiver" ("receiver_id"),
  KEY "idx_status" ("status"),
  CONSTRAINT "exchange_matches_ibfk_1" FOREIGN KEY ("exchange_listing_id") REFERENCES "crop_exchanges" ("id") ON DELETE CASCADE,
  CONSTRAINT "exchange_matches_ibfk_2" FOREIGN KEY ("proposer_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "exchange_matches_ibfk_3" FOREIGN KEY ("receiver_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Table structure for exchange_messages
CREATE TABLE "exchange_messages" (
  "id" int NOT NULL AUTO_INCREMENT,
  "match_id" int NOT NULL,
  "sender_id" int NOT NULL,
  "message" text COLLATE utf8mb4_unicode_ci NOT NULL,
  "is_read" tinyint(1) DEFAULT '0',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "idx_match" ("match_id"),
  KEY "idx_sender" ("sender_id"),
  KEY "idx_created" ("created_at"),
  CONSTRAINT "exchange_messages_ibfk_1" FOREIGN KEY ("match_id") REFERENCES "exchange_matches" ("id") ON DELETE CASCADE,
  CONSTRAINT "exchange_messages_ibfk_2" FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Table structure for exchange_reviews
CREATE TABLE "exchange_reviews" (
  "id" int NOT NULL AUTO_INCREMENT,
  "match_id" int NOT NULL,
  "reviewer_id" int NOT NULL,
  "rating" int NOT NULL,
  "comment" text COLLATE utf8mb4_unicode_ci,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "idx_match" ("match_id"),
  KEY "idx_reviewer" ("reviewer_id"),
  CONSTRAINT "exchange_reviews_ibfk_1" FOREIGN KEY ("match_id") REFERENCES "exchange_matches" ("id") ON DELETE CASCADE,
  CONSTRAINT "exchange_reviews_ibfk_2" FOREIGN KEY ("reviewer_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "exchange_reviews_chk_1" CHECK ((`rating` between 1 and 5))
);

-- Table structure for gps_checkpoints
CREATE TABLE "gps_checkpoints" (
  "id" int NOT NULL AUTO_INCREMENT,
  "delivery_id" int NOT NULL,
  "driver_id" int NOT NULL,
  "latitude" decimal(10,8) NOT NULL,
  "longitude" decimal(11,8) NOT NULL,
  "address" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "city" varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "state" varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "timestamp" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "speed_kmph" decimal(5,2) DEFAULT NULL,
  "accuracy_meters" int DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "idx_delivery" ("delivery_id"),
  KEY "idx_driver" ("driver_id"),
  KEY "idx_timestamp" ("timestamp"),
  CONSTRAINT "gps_checkpoints_ibfk_1" FOREIGN KEY ("delivery_id") REFERENCES "order_deliveries" ("id") ON DELETE CASCADE,
  CONSTRAINT "gps_checkpoints_ibfk_2" FOREIGN KEY ("driver_id") REFERENCES "delivery_drivers" ("id") ON DELETE CASCADE
);

-- Table structure for helpful_review_votes
CREATE TABLE "helpful_review_votes" (
  "id" int NOT NULL AUTO_INCREMENT,
  "review_id" int NOT NULL,
  "user_id" int NOT NULL,
  "helpful" tinyint(1) DEFAULT '1',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "unique_user_review_vote" ("user_id","review_id"),
  KEY "idx_review_id" ("review_id"),
  KEY "idx_user_id" ("user_id"),
  CONSTRAINT "helpful_review_votes_ibfk_1" FOREIGN KEY ("review_id") REFERENCES "product_reviews" ("id") ON DELETE CASCADE,
  CONSTRAINT "helpful_review_votes_ibfk_2" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Table structure for newsletter_subscriptions
CREATE TABLE "newsletter_subscriptions" (
  "id" int NOT NULL AUTO_INCREMENT,
  "email" varchar(255) NOT NULL,
  "source" varchar(100) DEFAULT 'website-footer',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "email" ("email")
);

-- Table structure for order_deliveries
CREATE TABLE "order_deliveries" (
  "id" int NOT NULL AUTO_INCREMENT,
  "order_id" int NOT NULL,
  "driver_id" int DEFAULT NULL,
  "pickup_address" text COLLATE utf8mb4_unicode_ci,
  "delivery_address" text COLLATE utf8mb4_unicode_ci,
  "pickup_latitude" decimal(10,8) DEFAULT NULL,
  "pickup_longitude" decimal(11,8) DEFAULT NULL,
  "delivery_latitude" decimal(10,8) DEFAULT NULL,
  "delivery_longitude" decimal(11,8) DEFAULT NULL,
  "status" enum('pending_assignment','assigned','accepted','picked_up','on_the_way','delivered','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending_assignment',
  "estimated_delivery_time" datetime DEFAULT NULL,
  "actual_delivery_time" datetime DEFAULT NULL,
  "estimated_distance_km" decimal(8,2) DEFAULT NULL,
  "estimated_time_minutes" int DEFAULT NULL,
  "actual_distance_km" decimal(8,2) DEFAULT NULL,
  "actual_time_minutes" int DEFAULT NULL,
  "special_instructions" text COLLATE utf8mb4_unicode_ci,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "idx_order" ("order_id"),
  KEY "idx_driver" ("driver_id"),
  KEY "idx_status" ("status"),
  CONSTRAINT "order_deliveries_ibfk_1" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE,
  CONSTRAINT "order_deliveries_ibfk_2" FOREIGN KEY ("driver_id") REFERENCES "delivery_drivers" ("id") ON DELETE SET NULL
);

-- Table structure for order_items
CREATE TABLE "order_items" (
  "id" int NOT NULL AUTO_INCREMENT,
  "order_id" int NOT NULL,
  "product_id" int NOT NULL,
  "quantity" int NOT NULL,
  "price" decimal(10,2) DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "order_id" ("order_id"),
  KEY "product_id" ("product_id"),
  CONSTRAINT "order_items_ibfk_1" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE,
  CONSTRAINT "order_items_ibfk_2" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE
);

-- Table structure for orders
CREATE TABLE "orders" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "order_date" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "order_status" varchar(100) DEFAULT 'Pending',
  "total_price" decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY ("id"),
  KEY "user_id" ("user_id"),
  CONSTRAINT "orders_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Table structure for payment
CREATE TABLE "payment" (
  "id" int NOT NULL AUTO_INCREMENT,
  "order_id" int NOT NULL,
  "payment_method" varchar(100) NOT NULL DEFAULT 'COD',
  "amount" decimal(10,2) NOT NULL DEFAULT '0.00',
  "payment_date" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "status" varchar(100) NOT NULL DEFAULT 'Pending',
  PRIMARY KEY ("id"),
  KEY "order_id" ("order_id"),
  CONSTRAINT "payment_ibfk_1" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE
);

-- Table structure for product
CREATE TABLE "product" (
  "id" int NOT NULL AUTO_INCREMENT,
  "product_name" varchar(255) NOT NULL,
  "product_description" text,
  "product_type" varchar(100) DEFAULT NULL,
  "product_quantity" int DEFAULT '0',
  "price" decimal(10,2) DEFAULT NULL,
  "seller_id" int NOT NULL,
  "category_id" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "product_image" varchar(255) DEFAULT NULL,
  "brand_id" int DEFAULT NULL,
  "brand" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "category_id" ("category_id"),
  KEY "fk_product_seller" ("seller_id"),
  KEY "fk_product_brand" ("brand_id"),
  CONSTRAINT "fk_product_brand" FOREIGN KEY ("brand_id") REFERENCES "brands" ("id") ON DELETE SET NULL,
  CONSTRAINT "fk_product_seller" FOREIGN KEY ("seller_id") REFERENCES "seller" ("id") ON DELETE CASCADE,
  CONSTRAINT "product_ibfk_3" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL
);

-- Table structure for product_queries
CREATE TABLE "product_queries" (
  "id" int NOT NULL AUTO_INCREMENT,
  "product_id" int NOT NULL,
  "user_id" int NOT NULL,
  "query_text" text NOT NULL,
  "answer_text" text,
  "answered_by" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "idx_product_queries_product" ("product_id"),
  KEY "idx_product_queries_user" ("user_id"),
  CONSTRAINT "fk_pq_product" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE,
  CONSTRAINT "fk_pq_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Table structure for product_rating_summary
CREATE TABLE "product_rating_summary" (
  "product_id" int NOT NULL,
  "average_rating" decimal(3,2) DEFAULT '0.00',
  "total_reviews" int DEFAULT '0',
  "five_star" int DEFAULT '0',
  "four_star" int DEFAULT '0',
  "three_star" int DEFAULT '0',
  "two_star" int DEFAULT '0',
  "one_star" int DEFAULT '0',
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("product_id"),
  KEY "idx_product_rating_avg" ("average_rating" DESC),
  CONSTRAINT "product_rating_summary_ibfk_1" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE
);

-- Table structure for product_reviews
CREATE TABLE "product_reviews" (
  "id" int NOT NULL AUTO_INCREMENT,
  "product_id" int NOT NULL,
  "user_id" int NOT NULL,
  "vendor_id" int NOT NULL,
  "rating" int NOT NULL,
  "title" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "comment" text COLLATE utf8mb4_unicode_ci,
  "helpfulness_count" int DEFAULT '0',
  "verified_purchase" tinyint(1) DEFAULT '0',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "unique_user_product_review" ("user_id","product_id"),
  KEY "idx_product_id" ("product_id"),
  KEY "idx_vendor_id" ("vendor_id"),
  KEY "idx_rating" ("rating"),
  KEY "idx_created_at" ("created_at"),
  CONSTRAINT "product_reviews_ibfk_1" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE,
  CONSTRAINT "product_reviews_ibfk_2" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "product_reviews_ibfk_3" FOREIGN KEY ("vendor_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "product_reviews_chk_1" CHECK (((`rating` >= 1) and (`rating` <= 5)))
);

-- Table structure for registration_otps
CREATE TABLE "registration_otps" (
  "id" int NOT NULL AUTO_INCREMENT,
  "email" varchar(255) NOT NULL,
  "otp" varchar(6) NOT NULL,
  "expires_at" bigint NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "idx_email" ("email")
);

-- Table structure for review_images
CREATE TABLE "review_images" (
  "id" int NOT NULL AUTO_INCREMENT,
  "review_id" int NOT NULL,
  "image_url" varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "idx_review_id" ("review_id"),
  CONSTRAINT "review_images_ibfk_1" FOREIGN KEY ("review_id") REFERENCES "product_reviews" ("id") ON DELETE CASCADE
);

-- Table structure for seller
CREATE TABLE "seller" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "shop_name" varchar(255) DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "gst_no" varchar(20) DEFAULT NULL,
  "gst_verified" tinyint(1) DEFAULT '0',
  "gst_legal_name" varchar(255) DEFAULT NULL,
  "gst_trade_name" varchar(255) DEFAULT NULL,
  "gst_status" varchar(50) DEFAULT NULL,
  "gst_verified_at" timestamp NULL DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "user_id" ("user_id"),
  CONSTRAINT "fk_seller_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "seller_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Table structure for users
CREATE TABLE "users" (
  "id" int NOT NULL AUTO_INCREMENT,
  "full_name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "role" varchar(50) DEFAULT 'user',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "phone_number" varchar(20) NOT NULL,
  "address" text,
  "city" varchar(100) DEFAULT NULL,
  "state" varchar(100) DEFAULT NULL,
  "pincode" varchar(10) DEFAULT NULL,
  "bio" text,
  "profile_pic" varchar(255) DEFAULT NULL,
  "reset_password_token" varchar(500) DEFAULT NULL,
  "reset_password_expires" bigint DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "email" ("email")
);

-- Table structure for vendor_rating_summary
CREATE TABLE "vendor_rating_summary" (
  "vendor_id" int NOT NULL,
  "average_rating" decimal(3,2) DEFAULT '0.00',
  "total_reviews" int DEFAULT '0',
  "average_communication" decimal(3,2) DEFAULT '0.00',
  "average_delivery" decimal(3,2) DEFAULT '0.00',
  "average_quality" decimal(3,2) DEFAULT '0.00',
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("vendor_id"),
  KEY "idx_vendor_rating_avg" ("average_rating" DESC),
  CONSTRAINT "vendor_rating_summary_ibfk_1" FOREIGN KEY ("vendor_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Table structure for vendor_reviews
CREATE TABLE "vendor_reviews" (
  "id" int NOT NULL AUTO_INCREMENT,
  "vendor_id" int NOT NULL,
  "customer_id" int NOT NULL,
  "rating" int NOT NULL,
  "comment" text COLLATE utf8mb4_unicode_ci,
  "categories" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "communication_rating" int DEFAULT NULL,
  "delivery_rating" int DEFAULT NULL,
  "quality_rating" int DEFAULT NULL,
  "verified_buyer" tinyint(1) DEFAULT '0',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "unique_customer_vendor_review" ("customer_id","vendor_id"),
  KEY "idx_vendor_id" ("vendor_id"),
  KEY "idx_rating" ("rating"),
  KEY "idx_created_at" ("created_at"),
  CONSTRAINT "vendor_reviews_ibfk_1" FOREIGN KEY ("vendor_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "vendor_reviews_ibfk_2" FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "vendor_reviews_chk_1" CHECK (((`rating` >= 1) and (`rating` <= 5))),
  CONSTRAINT "vendor_reviews_chk_2" CHECK (((`communication_rating` >= 1) and (`communication_rating` <= 5))),
  CONSTRAINT "vendor_reviews_chk_3" CHECK (((`delivery_rating` >= 1) and (`delivery_rating` <= 5))),
  CONSTRAINT "vendor_reviews_chk_4" CHECK (((`quality_rating` >= 1) and (`quality_rating` <= 5)))
);

-- Table structure for wishlist
CREATE TABLE "wishlist" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "product_id" int NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "unique_wishlist" ("user_id","product_id"),
  KEY "product_id" ("product_id"),
  CONSTRAINT "wishlist_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "wishlist_ibfk_2" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;