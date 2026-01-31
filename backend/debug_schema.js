const db = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await db.execute('DESCRIBE users');
        console.log('USERS TABLE SCHEMA:');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error('Error fetching schema:', err);
        process.exit(1);
    }
}

checkSchema();
