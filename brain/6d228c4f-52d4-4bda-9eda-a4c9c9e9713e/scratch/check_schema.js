const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), 'backend', '.env') });
const db = require(path.join(process.cwd(), 'backend', 'config', 'db'));

async function checkSchema() {
    try {
        const [rows] = await db.query('SHOW TABLES');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
