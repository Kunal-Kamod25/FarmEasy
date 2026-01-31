const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Register Controller
exports.register = async (req, res) => {
    try {
        const { fullname, email, password, role, phone_number, gst_number } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." });
        }

        // 2. Hash the password (security)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save to MySQL (users table)
        // Note: We send fullname and role; phone_number is optional
        const [userResult] = await User.create({
            fullname,
            email,
            password: hashedPassword,
            role: role || 'customer',
            phone_number: phone_number || null
        });

        const newUserId = userResult.insertId;

        // 4. If Vendor, create entry in 'seller' table
        if (role === 'vendor') {
            const db = require('../config/db'); // Import db here if not globally available
            const sellerSql = `INSERT INTO seller (user_id, gst_no) VALUES (?, ?)`;
            await db.query(sellerSql, [newUserId, gst_number || null]);
        }

        res.status(201).json({ message: "Account created successfully!" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error during registration.", error: error.message });
    }
};

// Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. Compare passwords
        // user.password_hash matches the column name in our MySQL table
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Success response
        res.status(200).json({
            message: "Login successful!",
            user: {
                id: user.id,
                fullname: user.full_name, // matches DB column full_name
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};