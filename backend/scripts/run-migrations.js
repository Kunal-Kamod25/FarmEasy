// =====================================================
// MIGRATION RUNNER
// =====================================================
// Runs all SQL migration files against Aiven database
// Usage: node scripts/run-migrations.js
// =====================================================

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();

// Create direct connection (not pool) for running migrations
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  multipleStatements: true // Allow multiple SQL statements
});

const migrationsDir = path.join(__dirname, '../migrations');

// Get all SQL files in migrations folder
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Run in alphabetical order (important for dependencies)

console.log('🔄 Starting database migrations...\n');
console.log(`Found ${migrationFiles.length} migration files:`);
migrationFiles.forEach(file => console.log(`  - ${file}`));
console.log('\n');

let migrationCount = 0;

async function runMigrations() {
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    console.log(`⏳ Running: ${file}`);

    try {
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute migration
      await new Promise((resolve, reject) => {
        connection.query(sql, (error, results) => {
          if (error) {
            // Skip duplicate key/index errors - they're already in the database
            if (error.message.includes('Duplicate key name') || 
                error.message.includes('already exists')) {
              migrationCount++;
              console.log(`✅ Completed: ${file} (skipped - already exists)\n`);
              resolve(results);
            } else {
              reject(error);
            }
          } else {
            migrationCount++;
            console.log(`✅ Completed: ${file}\n`);
            resolve(results);
          }
        });
      });
    } catch (error) {
      console.error(`❌ Failed: ${file}`);
      console.error(`   Error: ${error.message}\n`);
      connection.end();
      process.exit(1);
    }
  }

  // Close connection
  connection.end();
  console.log(`\n✨ All ${migrationCount} migrations completed successfully!`);
  console.log('🎉 Database is ready to use.');
}

// Start migrations
connection.connect((err) => {
  if (err) {
    console.error('❌ Failed to connect to Aiven database:');
    console.error(`   ${err.message}`);
    console.error('\n📝 Debug info:');
    console.error(`   HOST: ${process.env.DB_HOST}`);
    console.error(`   USER: ${process.env.DB_USER}`);
    console.error(`   PORT: ${process.env.DB_PORT}`);
    console.error(`   DATABASE: ${process.env.DB_NAME}`);
    process.exit(1);
  }

  console.log('✅ Connected to Aiven MySQL\n');
  runMigrations().catch(error => {
    console.error('Migration error:', error);
    process.exit(1);
  });
});
