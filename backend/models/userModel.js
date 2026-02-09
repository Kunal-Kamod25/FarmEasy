// models/userModel.js
const db = require('../config/db');

const User = {
    // find user by email
    findByEmail: async (email) => {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    // 🆕 ADDED: find user by phone number
    findByPhone: async (phone_number) => { // 🆕 ADDED
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE phone_number = ?',
            [phone_number]
        );
        return rows[0];
    },

    // create new user
    create: async (userData) => {
        const { fullname, email, password, role, phone_number } = userData;

        const sql = `
            INSERT INTO users (full_name, email, password_hash, role, phone_number)
            VALUES (?, ?, ?, ?, ?)
        `;

        return db.execute(sql, [fullname, email, password, role, phone_number]);
    }
};

module.exports = User;
