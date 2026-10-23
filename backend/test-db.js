/**
 * FarmEasy Database Connection & Health Verification Script
 * Run with: node backend/test-db.js
 */

const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.warn('\n⚠️  WARNING: backend/.env file not found.');
  console.warn('   Please copy backend/.env.example to backend/.env and provide your Aiven DB password.\n');
}

require('dotenv').config({ path: envPath });
const db = require('./config/db');

async function testDatabase() {
  console.log('====================================================');
  console.log('🌾 FarmEasy - Aiven MySQL Verification');
  console.log('====================================================');
  console.log('Host:    ', process.env.DB_HOST || '(not set)');
  console.log('Database:', process.env.DB_NAME || '(not set)');
  console.log('Port:    ', process.env.DB_PORT || 3306);
  console.log('User:    ', process.env.DB_USER || '(not set)');
  console.log('----------------------------------------------------');

  try {
    // 1. Connectivity test
    const [ping] = await db.query('SELECT 1 + 2 AS three');
    console.log('✅ Connectivity Ping: SUCCESS (result:', ping[0]?.three, ')');

    // 2. Database Name verification
    const [currentDb] = await db.query('SELECT DATABASE() AS db');
    console.log('✅ Active Database:  ', currentDb[0]?.db);

    // 3. Inspect existing tables
    const [tables] = await db.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0] || {})[0];
    const tableNames = tables.map(row => row[tableKey]);

    console.log(`\n📋 Found ${tableNames.length} tables in database:`);

    if (tableNames.length === 0) {
      console.log('❌ No tables found! The database is currently empty.');
      console.log('\n💡 To import the FarmEasy schema into Aiven, run:');
      console.log('   mysql --init-command="SET sql_mode=\'ANSI_QUOTES\';" \\');
      console.log(`     --user ${process.env.DB_USER || 'avnadmin'} \\`);
      console.log(`     --password=<YOUR_PASSWORD> \\`);
      console.log(`     --host ${process.env.DB_HOST || 'farmeasy-mysql-farmeasy-03.f.aivencloud.com'} \\`);
      console.log(`     --port ${process.env.DB_PORT || 15250} \\`);
      console.log(`     ${process.env.DB_NAME || 'defaultdb'} < backend/schema.sql\n`);
      process.exit(0);
    }

    console.log(tableNames.map(t => `   • ${t}`).join('\n'));

    // 4. Sample record counts for primary tables
    console.log('\n📊 Primary Tables Record Count:');
    const primaryTables = ['users', 'seller', 'product', 'categories', 'brands', 'orders', 'cart'];

    for (const tableName of primaryTables) {
      if (tableNames.includes(tableName)) {
        try {
          const [countResult] = await db.query(`SELECT COUNT(*) AS total FROM \`${tableName}\``);
          console.log(`   - ${tableName.padEnd(14)}: ${countResult[0]?.total} rows`);
        } catch (err) {
          console.log(`   - ${tableName.padEnd(14)}: (error querying: ${err.message})`);
        }
      } else {
        console.log(`   - ${tableName.padEnd(14)}: (table not created)`);
      }
    }

    console.log('\n🎉 Verification completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database Verification Failed:');
    console.error('   Message:', error.message);
    console.error('   Code:   ', error.code);
    process.exit(1);
  }
}

testDatabase();
