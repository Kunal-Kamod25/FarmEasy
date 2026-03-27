// =====================================================
// SEED DATA SCRIPT
// =====================================================
// Adds sample products to test the app
// Usage: node scripts/seed-data.js
// =====================================================

const db = require('../config/db');
require('dotenv').config();

const sampleProducts = [
  {
    product_name: 'Organic Wheat',
    product_description: 'High-quality organic wheat from premium farms',
    product_type: 'Seeds',
    product_quantity: 100,
    color: 'Golden',
    price: 450,
    product_image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=500&fit=crop',
    category_id: 1,
    seller_id: 1
  },
  {
    product_name: 'Fresh Tomatoes',
    product_description: 'Farm-fresh red tomatoes, locally grown',
    product_type: 'Vegetables',
    product_quantity: 50,
    color: 'Red',
    price: 35,
    product_image: 'https://images.unsplash.com/photo-1592841494900-055cc1f84af0?w=500&h=500&fit=crop',
    category_id: 2,
    seller_id: 1
  },
  {
    product_name: 'Organic Rice',
    product_description: 'Pure organic basmati rice from Kashmir',
    product_type: 'Grains',
    product_quantity: 200,
    color: 'White',
    price: 150,
    product_image: 'https://images.unsplash.com/photo-1586124226952-834e00aeb2cb?w=500&h=500&fit=crop',
    category_id: 1,
    seller_id: 1
  },
  {
    product_name: 'Corn Seeds',
    product_description: 'Hybrid corn seeds for high yield',
    product_type: 'Seeds',
    product_quantity: 75,
    color: 'Yellow',
    price: 250,
    product_image: 'https://images.unsplash.com/photo-1595080876851-c6dfa99f240f?w=500&h=500&fit=crop',
    category_id: 1,
    seller_id: 1
  },
  {
    product_name: 'Fresh Carrots',
    product_description: 'Sweet and crispy orange carrots',
    product_type: 'Vegetables',
    product_quantity: 120,
    color: 'Orange',
    price: 40,
    product_image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&h=500&fit=crop',
    category_id: 2,
    seller_id: 1
  }
];

async function seedData() {
  try {
    console.log("\n🌱 Starting seed data insertion...\n");

    let successCount = 0;
    for (const product of sampleProducts) {
      try {
        const [result] = await db.query(
          'INSERT INTO product (product_name, product_description, product_type, product_quantity, color, price, product_image, category_id, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            product.product_name,
            product.product_description,
            product.product_type,
            product.product_quantity,
            product.color,
            product.price,
            product.product_image,
            product.category_id,
            product.seller_id
          ]
        );

        console.log(`✅ Added: ${product.product_name} (ID: ${result.insertId})`);
        successCount++;
      } catch (err) {
        console.error(`❌ Failed to add ${product.product_name}:`, err.message);
      }
    }

    console.log(`\n✅ Seeding complete! Added ${successCount}/${sampleProducts.length} products\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed data failed:', error.message);
    process.exit(1);
  }
}

seedData();
