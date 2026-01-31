const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./config/db');

async function fixSchema() {
    try {
        console.log('Modifying seller table...');
        // Make aadhaar_no and pan_no nullable, just in case
        await db.query("ALTER TABLE seller MODIFY COLUMN aadhaar_no VARCHAR(20) NULL");
        await db.query("ALTER TABLE seller MODIFY COLUMN pan_no VARCHAR(20) NULL");
        console.log('Successfully made aadhaar_no and pan_no NULLABLE.');
        process.exit(0);
    } catch (err) {
        console.error('Schema fix failed:', err);
        process.exit(1);
    }
}

fixSchema();
