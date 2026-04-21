// Test script to verify product data in database
const db = require('./config/db');

async function testProductQuery() {
  try {
    console.log('🧪 Testing product query...\n');
    
    // Test with product ID 204 (from the URL)
    const productId = 204;
    
    console.log(`📝 Query 1: Get single product (ID ${productId})`);
    const [rows] = await db.query(`
      SELECT 
        p.*,
        pc.product_cat_name AS category_name,
        s.shop_name,
        s.id AS seller_table_id,
        u.full_name AS seller_name,
        u.city AS seller_city,
        u.state AS seller_state
      FROM product p
      LEFT JOIN product_category pc ON p.category_id = pc.id
      LEFT JOIN seller s ON p.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE p.id = ?
    `, [productId]);

    if (rows.length === 0) {
      console.log(`❌ No product found with ID ${productId}`);
      console.log('\n📝 Query 2: Get all products');
      const [allProducts] = await db.query('SELECT id, product_name, price FROM product LIMIT 10');
      console.log(`✅ Found ${allProducts.length} products total:`);
      allProducts.forEach(p => console.log(`   - ID ${p.id}: ${p.product_name} (₹${p.price})`));
      process.exit(0);
    }

    console.log('✅ Product found:');
    console.log(JSON.stringify(rows[0], null, 2));

    console.log(`\n📝 Query 3: Get more from seller (seller_id: ${rows[0].seller_id})`);
    const [moreFromSeller] = await db.query(`
      SELECT id, product_name, price, product_quantity, product_type, product_image
      FROM product
      WHERE seller_id = ? AND id != ?
      LIMIT 4
    `, [rows[0].seller_id, productId]);

    console.log(`✅ Found ${moreFromSeller.length} more products from seller`);
    
    console.log('\n✅ Database queries working correctly!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testProductQuery();
