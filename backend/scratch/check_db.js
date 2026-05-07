const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function checkTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'FarmEasy'
    });

    try {
        const [rows] = await connection.query("SHOW TABLES LIKE '%review%'");
        console.log('Tables:', rows);
        
        const [reviewRating] = await connection.query("SELECT COUNT(*) as count FROM review_rating");
        console.log('review_rating count:', reviewRating[0].count);

        const [productReviews] = await connection.query("SHOW TABLES LIKE 'product_reviews'");
        if (productReviews.length > 0) {
            const [prCount] = await connection.query("SELECT COUNT(*) as count FROM product_reviews");
            console.log('product_reviews count:', prCount[0].count);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkTables();
