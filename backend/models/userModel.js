const db = require('../config/db');

const User = {
    // Save a new user to the database
    create: async (userData) => {
        const { fullname, email, password, role, gst_number } = userData;
        const sql = `INSERT INTO users (fullname, email, password, role, gst_number) VALUES (?, ?, ?, ?, ?)`;
        return db.execute(sql, [fullname, email, password, role, gst_number || null]);
    },

    // Check if an email already exists
    findByEmail: async (email) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    }
};

module.exports = User;