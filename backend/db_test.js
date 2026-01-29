
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'farmeasy',
            port: process.env.DB_PORT || 3307,
        });

        console.log("✅ Connection Successful!");


        const [rows] = await connection.execute('SELECT * FROM users');
        console.log("Current Users in DB:", rows);

        await connection.end();
    } catch (err) {
        console.error("❌ Connection Failed:", err.message);
    }
}

testConnection();