// 1. Fixed the require path (it needs quotes and 'mysql2')
const mysql = require('mysql2/promise');
require('dotenv').config(); // 2. Make sure dotenv is loaded to read your .env file

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Farm@2503', // 3. Don't leave this empty!
            database: process.env.DB_NAME || 'farmeasy',
            port: process.env.DB_PORT || 3307 // 4. Added a missing comma above this line
        });

        console.log("✅ Connection Successful!");

        // Let's actually query the table you just made
        const [rows] = await connection.execute('SELECT * FROM users');
        console.log("Current Users in DB:", rows);

        await connection.end();
    } catch (err) {
        console.error("❌ Connection Failed:", err.message);
    }
}

testConnection();