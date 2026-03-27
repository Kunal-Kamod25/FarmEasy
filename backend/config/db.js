const mysql = require('mysql2');
require('dotenv').config();

console.log("\n🔧 Initializing Database Connection...");
console.log("   Host:", process.env.DB_HOST);
console.log("   Database:", process.env.DB_NAME);
console.log("   Port:", process.env.DB_PORT || 3306);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? "***SET***" : "MISSING",
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    },
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("\n❌ DATABASE CONNECTION FAILED:");
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error("   Error: Connection lost");
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error("   Error: Too many connections");
        } else if (err.code === 'ER_AUTHENTICATION_PLUGIN_ERROR') {
            console.error("   Error: Authentication failed - check DB_USER and DB_PASSWORD");
        } else if (err.code === 'ENOTFOUND') {
            console.error("   Error: Host not found - check DB_HOST");
        } else {
            console.error("   Error:", err.message);
            console.error("   Code:", err.code);
        }
    } else {
        console.log("✅ Connected to Aiven MySQL successfully!");
        connection.release();
    }
});

module.exports = pool.promise();