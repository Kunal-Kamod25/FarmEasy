// controllers/loginController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    try {
        const { email, phone_number, password } = req.body;

        let user = null;

        // login using email
        if (email) { // 🔁 CHANGED
            user = await User.findByEmail(email);
        }

        // login using phone number
        if (phone_number) { // 🆕 ADDED
            user = await User.findByPhone(phone_number);
        }

        // if user not found
        if (!user) {
            return res.status(401).json({ message: "Invalid email/phone number or password" });
        }

        // match password with db hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email/phone number or password" });
        }

        res.status(200).json({
            message: "Login successful!",
            user: {
                id: user.id,
                fullname: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};
