-- =====================================================
-- Populate Categories Table (Hierarchical)
-- Run this directly in your Aiven database
-- =====================================================

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE categories;
TRUNCATE TABLE brands;
SET FOREIGN_KEY_CHECKS = 1;

-- ===== FERTILIZERS =====
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Fertilizers', 'fertilizers', '🌾', 0);
SET @fert_id = LAST_INSERT_ID();
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES 
('Organic Fertilizers', 'organic-fertilizers', @fert_id, 0),
('Chemical Fertilizers', 'chemical-fertilizers', @fert_id, 1),
('Biofertilizers', 'biofertilizers', @fert_id, 2);

-- ===== SEEDS =====
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Seeds', 'seeds', '🌱', 1);
SET @seeds_id = LAST_INSERT_ID();
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES 
('Vegetable Seeds', 'vegetable-seeds', @seeds_id, 0),
('Cereal Seeds', 'cereal-seeds', @seeds_id, 1),
('Pulse Seeds', 'pulse-seeds', @seeds_id, 2);

-- ===== IRRIGATION =====
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Irrigation', 'irrigation', '💧', 2);
SET @irrig_id = LAST_INSERT_ID();
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES 
('Drip Irrigation', 'drip-irrigation', @irrig_id, 0),
('Sprinkler Systems', 'sprinkler-systems', @irrig_id, 1),
('Pipes & Fittings', 'pipes-fittings', @irrig_id, 2);

-- ===== TOOLS & MACHINERY =====
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Tools & Machinery', 'tools-machinery', '⚙️', 3);
SET @tools_id = LAST_INSERT_ID();
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES 
('Hand Tools', 'hand-tools', @tools_id, 0),
('Farm Machinery', 'farm-machinery', @tools_id, 1),
('Tractors & Parts', 'tractors-parts', @tools_id, 2);

-- ===== PESTICIDES =====
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Pesticides', 'pesticides', '🔬', 4);
SET @pest_id = LAST_INSERT_ID();
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES 
('Insecticides', 'insecticides', @pest_id, 0),
('Fungicides', 'fungicides', @pest_id, 1),
('Herbicides', 'herbicides', @pest_id, 2);

-- ===== LIVESTOCK FEED =====
INSERT INTO categories (name, slug, icon, sort_order) VALUES ('Livestock Feed', 'livestock-feed', '🐄', 5);
SET @livestock_id = LAST_INSERT_ID();
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES 
('Cattle Feed', 'cattle-feed', @livestock_id, 0),
('Poultry Feed', 'poultry-feed', @livestock_id, 1),
('Feed Supplements', 'feed-supplements', @livestock_id, 2);

-- ===== BRANDS =====
INSERT INTO brands (name, slug) VALUES 
('Syngenta', 'syngenta'),
('Bayer', 'bayer'),
('BASF', 'basf'),
('IFFCO', 'iffco'),
('Godrej', 'godrej'),
('Tata Rallis', 'tata-rallis'),
('UPL', 'upl'),
('PI Industries', 'pi-industries'),
('Mahyco', 'mahyco'),
('Nuziveedu', 'nuziveedu');

-- Verify insertion
SELECT '=== CATEGORIES ===' as info;
SELECT id, name, slug, parent_id FROM categories ORDER BY sort_order, id;

SELECT '=== BRANDS ===' as info;
SELECT id, name FROM brands;
