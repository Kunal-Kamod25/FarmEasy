// controllers/loginController.js

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                message: "Identifier (email or phone) and password are required."
            });
        }

        // Find user
        const user = await User.findByEmailOrPhone(identifier);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email/phone number or password."
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email/phone number or password."
            });
        }

        // 🔥 CREATE JWT TOKEN
        const token = jwt.sign(
            {
                userId: user.id,   // VERY IMPORTANT
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Send token + user data
        res.status(200).json({
            message: "Login successful!",
            token,   // ✅ SEND TOKEN
            user: {
                id: user.id,
                fullname: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            message: "Server error during login."
        });
    }
};