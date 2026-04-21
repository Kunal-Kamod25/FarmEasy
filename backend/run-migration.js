// Migration runner to add product_image column
const db = require('./config/db');

async function runMigration() {
  try {
    console.log('🔄 Running migration: Adding product_image column to product table...');
    
    // First check if column exists
    const [columns] = await db.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'product' AND COLUMN_NAME = 'product_image' AND TABLE_SCHEMA = 'farmeasy'`
    );
    
    if (columns.length > 0) {
      console.log('ℹ️  Column product_image already exists, skipping...');
      process.exit(0);
    }
    
    // Add the product_image column
    const query = `
      ALTER TABLE \`product\` 
      ADD COLUMN \`product_image\` VARCHAR(500) DEFAULT NULL AFTER \`product_type\`
    `;
    
    const [result] = await db.execute(query);
    console.log('✅ Migration completed successfully!');
    console.log('   - Added product_image column to product table');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
