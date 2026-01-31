const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM seller");
        rows.forEach(row => console.log(`${row.Field}: ${row.Null} (Default: ${row.Default})`));
        process.exit(0);
    } catch (err) {
        console.error('Error fetching schema:', err);
        process.exit(1);
    }
}

checkSchema();
