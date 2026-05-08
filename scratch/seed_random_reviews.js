const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function seedReviews() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🚀 Starting Random Review Seeding...');

        // 1. Get all products and all users
        const [products] = await connection.query('SELECT id, seller_id FROM product');
        const [users] = await connection.query("SELECT id FROM users WHERE role != 'admin'");

        if (products.length === 0 || users.length === 0) {
            console.log('❌ No products or users found.');
            return;
        }

        const reviewTemplates = [
            "Excellent quality seeds, saw great yields!",
            "Very fast delivery and well packaged.",
            "Good value for money, highly recommended.",
            "The product was as described, very satisfied.",
            "Amazing results in just a few weeks.",
            "Customer service was helpful when I had questions.",
            "Decent product, does the job well.",
            "The best organic fertilizers I have used so far.",
            "Prompt shipping and professional behavior from the seller.",
            "Very effective and easy to use.",
            "Quality is okay, but delivery was a bit late.",
            "Fantastic experience, will definitely order again!",
            "Helpful for my small home garden.",
            "Solid performance and durable build quality.",
            "A bit expensive but worth it for the quality."
        ];

        let totalReviewsCreated = 0;


        for (const product of products) {
            // Give each product 4 or 5 reviews with unique ratings
            const numReviews = Math.floor(Math.random() * 2) + 4; // 4 or 5 reviews
            // Shuffle ratings 1-5 and pick numReviews unique ratings
            const ratingsPool = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, numReviews);
            const usedUserIds = new Set();

            // Get the vendor_id (user_id of the seller)
            const [seller] = await connection.query('SELECT user_id FROM seller WHERE id = ?', [product.seller_id]);
            const vendor_id = seller.length > 0 ? seller[0].user_id : null;

            for (let i = 0; i < numReviews; i++) {
                // Pick a unique user for each review
                let randomUser;
                let attempts = 0;
                do {
                    randomUser = users[Math.floor(Math.random() * users.length)];
                    attempts++;
                } while (usedUserIds.has(randomUser.id) && attempts < 10);
                usedUserIds.add(randomUser.id);

                const randomRating = ratingsPool[i];
                const randomComment = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];

                await connection.query(
                    'INSERT IGNORE INTO product_reviews (product_id, user_id, vendor_id, rating, title, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                    [product.id, randomUser.id, vendor_id, randomRating, "Verified Purchase", randomComment]
                );
                totalReviewsCreated++;
            }
            console.log(`✅ Added ${numReviews} reviews for Product ID: ${product.id}`);
        }

        console.log(`\n✨ Successfully created ${totalReviewsCreated} random reviews!`);

        // 2. Sync summaries to reflect new reviews
        console.log('🔄 Syncing Rating Summaries...');
        
        // Sync Product Summaries
        await connection.query(`
            INSERT INTO product_rating_summary (product_id, average_rating, total_reviews, five_star, four_star, three_star, two_star, one_star)
            SELECT product_id, ROUND(AVG(rating), 1), COUNT(*), 
            SUM(IF(rating = 5, 1, 0)), SUM(IF(rating = 4, 1, 0)), SUM(IF(rating = 3, 1, 0)), SUM(IF(rating = 2, 1, 0)), SUM(IF(rating = 1, 1, 0))
            FROM product_reviews GROUP BY product_id
            ON DUPLICATE KEY UPDATE average_rating = VALUES(average_rating), total_reviews = VALUES(total_reviews), five_star = VALUES(five_star), four_star = VALUES(four_star), three_star = VALUES(three_star), two_star = VALUES(two_star), one_star = VALUES(one_star), updated_at = NOW()
        `);

        // Sync Vendor Summaries
        await connection.query(`
            INSERT INTO vendor_rating_summary (vendor_id, average_rating, total_reviews)
            SELECT vendor_id, ROUND(AVG(rating), 1), COUNT(*)
            FROM product_reviews GROUP BY vendor_id
            ON DUPLICATE KEY UPDATE average_rating = VALUES(average_rating), total_reviews = VALUES(total_reviews), updated_at = NOW()
        `);

        console.log('✅ Summaries synchronized!');

    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
    } finally {
        await connection.end();
        process.exit();
    }
}

seedReviews();
