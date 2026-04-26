const db = require('./backend/config/db');
async function check() {
    try {
        const [rows] = await db.query('SELECT id, name FROM categories WHERE parent_id IS NULL');
        console.log('Categories:', rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
