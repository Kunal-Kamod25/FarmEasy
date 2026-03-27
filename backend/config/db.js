const mysql = require('mysql2');
require('dotenv').config();

console.log("\n🔧 Initializing Database Connection...");
console.log("   Host:", process.env.DB_HOST);
console.log("   Database:", process.env.DB_NAME);
console.log("   Port:", process.env.DB_PORT || 3306);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    },
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0,
    connectionTimeZone: '+00:00'
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("\n❌ DATABASE CONNECTION FAILED:");
        console.error("   Trying to connect to:", `${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
        
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error("   Error: Access Denied");
            console.error("   Cause: Wrong password OR IP not whitelisted in Aiven");
            console.error("   Detail:", err.message);
        } else if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error("   Error: Connection lost during handshake");
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error("   Error: Too many connections to database");
        } else if (err.code === 'ENOTFOUND') {
            console.error("   Error: Cannot reach host - check DB_HOST value");
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