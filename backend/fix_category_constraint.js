require("dotenv").config();
const db = require("./config/db");

async function fixCategoryConstraint() {
  try {
    console.log("🔍 Checking foreign key constraints...\n");
    
    // Drop old foreign key constraint
    try {
      await db.query(
        `ALTER TABLE product DROP FOREIGN KEY product_ibfk_3`
      );
      console.log("✅ Dropped old product_category foreign key constraint");
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log("ℹ️  Foreign key constraint already removed or doesn't exist");
      } else {
        throw error;
      }
    }
    
    // Add new foreign key constraint to categories table
    try {
      await db.query(
        `ALTER TABLE product ADD CONSTRAINT product_ibfk_3 
         FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL`
      );
      console.log("✅ Added new foreign key constraint to categories table");
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log("ℹ️  Foreign key constraint already exists");
      } else {
        throw error;
      }
    }
    
    // Get Livestock Feed category ID
    const [livestock] = await db.query(
      `SELECT id FROM categories WHERE name = 'Livestock Feed' AND parent_id IS NULL`
    );
    
    if (livestock.length === 0) {
      console.error("❌ Livestock Feed category not found!");
      process.exit(1);
    }
    
    const livestockId = livestock[0].id;
    console.log(`\n📝 Livestock Feed category ID: ${livestockId}`);
    
    // Now update the products
    const [result] = await db.query(
      `UPDATE product SET category_id = ? 
       WHERE product_name LIKE '%Dog Food%' OR product_name LIKE '%Cattle Feed%'`,
      [livestockId]
    );
    
    console.log(`\n✅ Updated ${result.affectedRows} products to Livestock Feed category`);
    console.log("🔄 Refresh the page to see changes!\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixCategoryConstraint();
