const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { fullname, email, password, role, gst_number } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." });
        }

        // 2. Hash the password (security)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save to MySQL
        await User.create({
            fullname,
            email,
            password: hashedPassword,
            role,
            gst_number
        });

        res.status(201).json({ message: "Account created successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during registration." });
    }
};

//Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Success (You can add JWT tokens here later)
        res.status(200).json({
            message: "Login successful!",
            user: {
                id: user.id,
                fullname: user.fullname,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};