// models/userModel.js
const db = require('../config/db');

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    create: async (userData) => {
        const { fullname, email, password, role, phone_number } = userData;
        // We use full_name and password_hash to match your MySQL table
        const sql = `INSERT INTO users (full_name, email, password_hash, role, phone_number) VALUES (?, ?, ?, ?, ?)`;
        return db.execute(sql, [fullname, email, password, role, phone_number]);
    }
};

module.exports = User;