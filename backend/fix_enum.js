const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./config/db');

async function migrate() {
    try {
        console.log('Altering users table...');
        // Adding 'vendor' to the enum
        await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'farmer', 'customer', 'vendor') NOT NULL");
        console.log('Successfully added "vendor" to role ENUM!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
