const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./config/db');

async function fixMissingSeller() {
    try {
        const email = 'varadgavali10@gmail.com';
        console.log(`Checking for user: ${email}...`);

        // 1. Find User ID
        const [users] = await db.query("SELECT id, full_name, role FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            console.log("User not found!");
            process.exit(1);
        }

        const user = users[0];
        console.log(`Found User: ID=${user.id}, Name=${user.full_name}, Role=${user.role}`);

        if (user.role !== 'vendor') {
            console.log("User is not a vendor. No action needed.");
            process.exit(0);
        }

        // 2. Check if Seller record exists
        const [sellers] = await db.query("SELECT * FROM seller WHERE user_id = ?", [user.id]);

        if (sellers.length > 0) {
            console.log("Seller record already exists!");
        } else {
            console.log("Seller record missing. Inserting now...");
            await db.query("INSERT INTO seller (user_id, gst_no) VALUES (?, ?)", [user.id, 'PENDING_FIX']);
            console.log("Successfully inserted missing seller record.");
        }

        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err);
        process.exit(1);
    }
}

fixMissingSeller();
