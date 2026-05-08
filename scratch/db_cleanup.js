const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

async function cleanupDatabase() {
  console.log("🚀 Starting Database Cleanup...");
  console.log("   Connecting to:", process.env.DB_HOST);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 15250,
    ssl: { rejectUnauthorized: false }
  });

  const tablesToDrop = [
    "farmer",
    "tracking",
    "product_subcategory",
    "product_category",
    "review_rating"
  ];

  for (const table of tablesToDrop) {
    try {
      console.log(`🧹 Dropping table: ${table}...`);
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`✅ Table ${table} dropped successfully.`);
    } catch (error) {
      console.error(`❌ Error dropping ${table}:`, error.message);
    }
  }

  await connection.end();
  console.log("\n✨ Cleanup finished!");
  process.exit(0);
}

cleanupDatabase().catch(err => {
  console.error("💥 CRITICAL ERROR:", err);
  process.exit(1);
});
