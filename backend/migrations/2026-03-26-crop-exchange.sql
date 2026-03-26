-- =====================================================
-- CROP EXCHANGE FEATURE MIGRATION
-- =====================================================
-- This migration adds the complete crop exchange system
-- allowing farmers to trade crops with each other
-- =====================================================

-- Table 1: Main crop exchange listings
-- Stores all crop exchange offers posted by farmers
CREATE TABLE IF NOT EXISTS crop_exchanges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- What the farmer is offering
  offering_crop VARCHAR(100) NOT NULL,
  offering_quantity DECIMAL(10,2) NOT NULL,
  offering_unit VARCHAR(20) DEFAULT 'kg',  -- kg, quintal, ton, bags
  
  -- What the farmer is seeking in return
  seeking_crop VARCHAR(100) NOT NULL,
  seeking_quantity DECIMAL(10,2),
  seeking_unit VARCHAR(20) DEFAULT 'kg',
  
  -- Location details for matching farmers within radius
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_km INT DEFAULT 50,  -- Search radius for nearby farmers
  
  -- Additional info
  description TEXT,
  exchange_images JSON,  -- Array of image URLs uploaded to Cloudinary
  
  -- Status tracking
  status ENUM('open', 'matched', 'completed', 'cancelled') DEFAULT 'open',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Keys for optimization
  KEY idx_user_status (user_id, status),
  KEY idx_status (status),
  KEY idx_location (latitude, longitude),
  
  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table 2: Exchange matches/proposals
-- When farmer B proposes to exchange with farmer A's listing
CREATE TABLE IF NOT EXISTS exchange_matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Reference to the exchange listing
  exchange_listing_id INT NOT NULL,
  
  -- Who is proposing the exchange
  proposer_id INT NOT NULL,
  
  -- Who's listing is being proposed to
  receiver_id INT NOT NULL,
  
  -- Status of the proposal
  status ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
  
  -- Why they think this matches
  match_reason TEXT,
  
  -- Negotiated details
  exchange_date DATE,
  location_agreed TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Keys
  KEY idx_listing (exchange_listing_id),
  KEY idx_proposer (proposer_id),
  KEY idx_receiver (receiver_id),
  KEY idx_status (status),
  
  -- Foreign keys
  FOREIGN KEY (exchange_listing_id) REFERENCES crop_exchanges(id) ON DELETE CASCADE,
  FOREIGN KEY (proposer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table 3: Chat messages between farmers
-- Real-time negotiation between buyers and sellers
CREATE TABLE IF NOT EXISTS exchange_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Which exchange match this message belongs to
  match_id INT NOT NULL,
  
  -- Who sent this message
  sender_id INT NOT NULL,
  
  -- Message content
  message TEXT NOT NULL,
  
  -- Read status for notification purposes
  is_read BOOLEAN DEFAULT 0,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Keys
  KEY idx_match (match_id),
  KEY idx_sender (sender_id),
  KEY idx_created (created_at),
  
  -- Foreign keys
  FOREIGN KEY (match_id) REFERENCES exchange_matches(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table 4: Reviews and ratings
-- After exchange is complete, farmers can review each other
CREATE TABLE IF NOT EXISTS exchange_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Which exchange this review is for
  match_id INT NOT NULL,
  
  -- Who wrote this review
  reviewer_id INT NOT NULL,
  
  -- Rating (1-5 stars)
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  
  -- Review comment
  comment TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Keys
  KEY idx_match (match_id),
  KEY idx_reviewer (reviewer_id),
  
  -- Foreign keys
  FOREIGN KEY (match_id) REFERENCES exchange_matches(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
