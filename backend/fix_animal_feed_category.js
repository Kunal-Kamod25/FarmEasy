require("dotenv").config();
const db = require("./config/db");

async function fixCategories() {
  try {
    // Find products with animal feed that are in wrong category
    const [wrongProducts] = await db.query(
      `SELECT id, product_name, category_id FROM product 
       WHERE product_name LIKE '%Dog Food%' OR product_name LIKE '%Cattle Feed%'`
    );
    
    console.log("📋 Products with wrong category:");
    wrongProducts.forEach(p => 
      console.log(`  - ${p.product_name} (ID: ${p.id}, Current Category: ${p.category_id})`)
    );
    
    // Get Livestock Feed category ID
    const [livestock] = await db.query(
      `SELECT id FROM categories WHERE name = 'Livestock Feed' AND parent_id IS NULL`
    );
    
    if (livestock.length === 0) {
      console.error("❌ Livestock Feed category not found!");
      process.exit(1);
    }
    
    const livestockId = livestock[0].id;
    console.log(`\n✅ Livestock Feed category ID: ${livestockId}\n`);
    
    // Update products to correct category
    const [result] = await db.query(
      `UPDATE product SET category_id = ? 
       WHERE product_name LIKE '%Dog Food%' OR product_name LIKE '%Cattle Feed%'`,
      [livestockId]
    );
    
    console.log(`✅ Updated ${result.affectedRows} products to Livestock Feed category`);
    console.log("🔄 Refresh the page to see changes!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixCategories();
