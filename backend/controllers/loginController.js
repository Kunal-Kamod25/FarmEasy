// controllers/loginController.js

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    try {
        // Extract identifier (email or phone) and password from request body
        const { identifier, password } = req.body;

        // Basic validation: both fields are required
        if (!identifier || !password) {
            return res.status(400).json({
                message: "Identifier (email or phone) and password are required."
            });
        }

        // Find user by email OR phone number
        // This allows login using either credential
        const user = await User.findByEmailOrPhone(identifier);

        // If no user found, return unauthorized response
        if (!user) {
            return res.status(401).json({
                message: "Invalid email/phone number or password."
            });
        }

        // Compare entered password with hashed password stored in DB
        const isMatch = await bcrypt.compare(password, user.password_hash);

        // If password doesn't match, deny access
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email/phone number or password."
            });
        }

        // If everything is correct, send success response
        res.status(200).json({
            message: "Login successful!",
            user: {
                id: user.id,
                fullname: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        // Log error for debugging
        console.error("Login Error:", error);

        // Generic server error response
        res.status(500).json({
            message: "Server error during login."
        });
    }
};
