-- =====================================================
-- DELIVERY TRACKING & GPS SYSTEM MIGRATION
-- =====================================================
-- This migration adds GPS-based home delivery tracking
-- Allows customers to track their order delivery
-- and drivers to update real-time location
-- =====================================================

-- Table 1: Delivery Drivers/Partners
CREATE TABLE IF NOT EXISTS delivery_drivers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,                           -- Can be null if separate from main users
  driver_name VARCHAR(255) NOT NULL,
  driver_phone VARCHAR(20) NOT NULL,
  driver_email VARCHAR(255),
  license_number VARCHAR(50),
  vehicle_type VARCHAR(100),            -- Bike, Scooter, Car, Truck
  vehicle_color VARCHAR(50),
  vehicle_registration VARCHAR(50),
  license_image VARCHAR(255),            -- Cloudinary URL
  vehicle_image VARCHAR(255),            -- Cloudinary URL
  status ENUM('available', 'on_delivery', 'offline') DEFAULT 'offline',
  current_latitude DECIMAL(10, 8),      -- Current GPS location
  current_longitude DECIMAL(11, 8),
  total_deliveries INT DEFAULT 0,
  successful_deliveries INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_status (status),
  KEY idx_phone (driver_phone),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table 2: Order Deliveries (links orders to drivers)
CREATE TABLE IF NOT EXISTS order_deliveries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  driver_id INT,                         -- Assigned driver (null if not assigned yet)
  
  -- Pick-up & delivery locations
  pickup_address TEXT,                   -- Where driver picks up order
  delivery_address TEXT,                 -- Where customer receives order
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  
  -- Status tracking
  status ENUM('pending_assignment', 'assigned', 'accepted', 'picked_up', 'on_the_way', 'delivered', 'failed') DEFAULT 'pending_assignment',
  estimated_delivery_time DATETIME,
  actual_delivery_time DATETIME,
  
  -- Distance & time
  estimated_distance_km DECIMAL(8,2),
  estimated_time_minutes INT,
  actual_distance_km DECIMAL(8,2),
  actual_time_minutes INT,
  
  -- Special instructions
  special_instructions TEXT,            -- "Ring bell 3 times", "Leave at door", etc.
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_order (order_id),
  KEY idx_driver (driver_id),
  KEY idx_status (status),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES delivery_drivers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table 3: GPS Checkpoints (driver location history)
CREATE TABLE IF NOT EXISTS gps_checkpoints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_id INT NOT NULL,
  driver_id INT NOT NULL,
  
  -- GPS coordinates at this checkpoint
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Location address
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  
  -- Timestamp & speed
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  speed_kmph DECIMAL(5,2),              -- Current speed if available from GPS
  accuracy_meters INT,                   -- GPS accuracy in meters
  
  KEY idx_delivery (delivery_id),
  KEY idx_driver (driver_id),
  KEY idx_timestamp (timestamp),
  FOREIGN KEY (delivery_id) REFERENCES order_deliveries(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES delivery_drivers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table 4: Delivery Status History
CREATE TABLE IF NOT EXISTS delivery_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_id INT NOT NULL,
  
  -- Status change
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  
  -- When & who
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by INT,                       -- Driver ID who made the change
  notes TEXT,                           -- "Reached pickup", "Traffic congestion", etc
  
  -- Location at this status change
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  KEY idx_delivery (delivery_id),
  KEY idx_status (new_status),
  KEY idx_changed_at (changed_at),
  FOREIGN KEY (delivery_id) REFERENCES order_deliveries(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES delivery_drivers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table 5: Delivery Notifications (SMS/Push logs)
CREATE TABLE IF NOT EXISTS delivery_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_id INT NOT NULL,
  user_id INT NOT NULL,                 -- Customer receiving notification
  
  -- Notification details
  notification_type ENUM('status_update', 'driver_arriving', 'delivery_complete', 'delay_alert') DEFAULT 'status_update',
  message TEXT,
  
  -- Delivery methods
  send_via_sms BOOLEAN DEFAULT 1,
  send_via_push BOOLEAN DEFAULT 1,
  send_via_email BOOLEAN DEFAULT 0,
  
  -- Status
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sms_status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  push_status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  
  -- Tracking
  opened_at TIMESTAMP NULL,            -- When customer opened notification
  acted_on BOOLEAN DEFAULT 0,           -- Did customer take action
  
  KEY idx_delivery (delivery_id),
  KEY idx_user (user_id),
  KEY idx_sent_at (sent_at),
  FOREIGN KEY (delivery_id) REFERENCES order_deliveries(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table 6: Driver Ratings/Reviews
CREATE TABLE IF NOT EXISTS delivery_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_id INT NOT NULL,
  driver_id INT NOT NULL,
  user_id INT NOT NULL,                 -- Customer who's rating
  
  -- Rating
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  
  -- What aspects
  punctuality_rating INT,               -- 1-5: Was driver on time?
  professionalism_rating INT,           -- 1-5: Professional behavior?
  product_care_rating INT,              -- 1-5: Handled product carefully?
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  KEY idx_delivery (delivery_id),
  KEY idx_driver (driver_id),
  KEY idx_user (user_id),
  FOREIGN KEY (delivery_id) REFERENCES order_deliveries(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES delivery_drivers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
