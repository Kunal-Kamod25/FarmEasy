const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool to handle multiple users
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Default XAMPP password is empty
    database: process.env.DB_NAME || 'farmeasy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();