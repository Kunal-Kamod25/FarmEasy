// models/userModel.js

const db = require('../config/db');

const User = {

    // Find user by email
    findByEmail: async (email) => {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    // Find user by phone number
    findByPhone: async (phone) => {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE phone_number = ?',
            [phone]
        );
        return rows[0];
    },

    // 🔥 Best method: Find user by email OR phone (used in login)
    findByEmailOrPhone: async (identifier) => {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ? OR phone_number = ?',
            [identifier, identifier]
        );
        return rows[0];
    },

    // Create new user
    create: async (userData) => {
        const { fullname, email, password, role, phone_number } = userData;

        const sql = `
            INSERT INTO users 
            (full_name, email, password_hash, role, phone_number) 
            VALUES (?, ?, ?, ?, ?)
        `;

        return db.execute(sql, [
            fullname,
            email,
            password,   // This should already be hashed before calling create()
            role,
            phone_number
        ]);
    }
};

module.exports = User;
