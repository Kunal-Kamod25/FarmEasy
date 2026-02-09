// controllers/registerController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { fullname, email, password, role, phone_number, gst_number } = req.body;

        // check if email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." });
        }

        // encrypt password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // insert user in users table
        const [userResult] = await User.create({
            fullname,
            email,
            password: hashedPassword,
            role: role || 'customer',
            phone_number: phone_number || null
        });

        const newUserId = userResult.insertId;

        // if vendor then save gst in seller table
        if (role === 'vendor') {
            const db = require('../config/db');
            const sellerSql = `INSERT INTO seller (user_id, gst_no) VALUES (?, ?)`;
            await db.query(sellerSql, [newUserId, gst_number || null]);
        }

        res.status(201).json({ message: "Account created successfully!" });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
};
