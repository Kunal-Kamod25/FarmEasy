// =====================================================
// DATABASE SETUP SCRIPT
// =====================================================
// Initializes Aiven database with base schema + migrations
// Usage: node scripts/setup-database.js
// =====================================================

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();

console.log("\n" + "=".repeat(60));
console.log("🚀 FarmEasy Database Setup");
console.log("=".repeat(60));

// Create direct connection (not pool) for setup
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error("\n❌ CONNECTION FAILED:");
    console.error("   Host:", process.env.DB_HOST);
    console.error("   Database:", process.env.DB_NAME);
    console.error("   Error:", err.message);
    process.exit(1);
  }
  console.log("\n✅ Connected to Aiven database");
  runSetup();
});

async function runSetup() {
  try {
    // Step 1: Import base schema
    console.log("\n" + "-".repeat(60));
    console.log("📋 Step 1: Importing base schema...");
    console.log("-".repeat(60));
    
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon but be careful with the dump syntax
    const statements = schema
      .split(';\n')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

    let insertedCount = 0;
    for (const statement of statements) {
      try {
        await queryAsync(statement + ';');
        insertedCount++;
      } catch (e) {
        // Ignore "table already exists" errors
        if (!e.message.includes('already exists')) {
          console.warn(`   ⚠️  Warning: ${e.message.substring(0, 60)}`);
        }
      }
    }
    
    console.log(`✅ Base schema imported (${insertedCount} statements)`);

    // Step 2: Run migrations
    console.log("\n" + "-".repeat(60));
    console.log("📋 Step 2: Running migrations...");
    console.log("-".repeat(60));
    
    const migrationsDir = path.join(__dirname, '../migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      console.log(`Found ${migrationFiles.length} migration files`);

      for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        console.log(`   Running: ${file}`);
        
        try {
          const migration = fs.readFileSync(filePath, 'utf8');
          await queryAsync(migration);
          console.log(`   ✅ ${file}`);
        } catch (e) {
          if (!e.message.includes('already exists')) {
            console.warn(`   ⚠️  ${file}: ${e.message.substring(0, 50)}`);
          } else {
            console.log(`   ✅ ${file} (already applied)`);
          }
        }
      }
    }

    // Step 3: Verify tables
    console.log("\n" + "-".repeat(60));
    console.log("📋 Step 3: Verifying tables...");
    console.log("-".repeat(60));
    
    const [tables] = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
        [process.env.DB_NAME],
        (err, res) => err ? reject(err) : resolve([res])
      );
    });

    console.log(`\n✅ Database has ${tables.length} tables:\n`);
    tables.forEach(t => console.log(`   ✓ ${t.table_name}`));

    console.log("\n" + "=".repeat(60));
    console.log("✅ DATABASE SETUP COMPLETE!");
    console.log("=".repeat(60));
    console.log("\nYou can now:");
    console.log("  1. Deploy backend to Render");
    console.log("  2. Frontend should load data from your Aiven database");
    console.log("=".repeat(60) + "\n");

    connection.end();
    process.exit(0);

  } catch (error) {
    console.error("\n❌ SETUP FAILED:", error.message);
    connection.end();
    process.exit(1);
  }
}

// Helper to promisify queries
function queryAsync(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, results) => {
      error ? reject(error) : resolve(results);
    });
  });
}
