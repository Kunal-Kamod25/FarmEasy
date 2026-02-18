// // controllers/registerController.js

// const User = require('../models/userModel');
// const bcrypt = require('bcryptjs');
// const db = require('../config/db');

// exports.register = async (req, res) => {
//     try {
//         const { fullname, email, password, role, phone_number, gst_number } = req.body;

//         // Basic validation
//         if (!fullname || !email || !password) {
//             return res.status(400).json({ message: "Full name, email and password are required." });
//         }

//         // Check if email already exists
//         const existingEmail = await User.findByEmail(email);
//         if (existingEmail) {
//             return res.status(400).json({ message: "Email already registered." });
//         }

//         // Optional: check phone duplication
//         if (phone_number) {
//             const existingPhone = await User.findByPhone(phone_number);
//             if (existingPhone) {
//                 return res.status(400).json({ message: "Phone number already registered." });
//             }
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Insert into users table
//         const [userResult] = await User.create({
//             fullname,
//             email,
//             password: hashedPassword,
//             role: role || 'customer',
//             phone_number: phone_number || null
//         });

//         const newUserId = userResult.insertId;

//         // If vendor, insert into seller table
//         if (role === 'vendor') {
//             const sellerSql = `INSERT INTO seller (user_id, gst_no) VALUES (?, ?)`;
//             await db.query(sellerSql, [newUserId, gst_number || null]);
//         }

//         res.status(201).json({ message: "Account created successfully!" });

//     } catch (error) {
//         console.error("Registration Error:", error);
//         res.status(500).json({ message: "Server error during registration." });
//     }
// };








// controllers/registerController.js

const bcrypt = require("bcryptjs");
const db = require("../config/db");

exports.register = async (req, res) => {
    const connection = await db.getConnection();

    try {
        // 👇 Accept frontend field names
        const { fullname, email, password, role, phone_number, gst_number } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).json({
                message: "Full name, email and password are required.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.beginTransaction();

        // 👇 Map to DB column names
        const userSql = `
      INSERT INTO users (full_name, email, password_hash, role, phone_number)
      VALUES (?, ?, ?, ?, ?)
    `;

        const [userResult] = await connection.query(userSql, [
            fullname,
            email,
            hashedPassword,
            role || "customer",
            phone_number || null,
        ]);

        const newUserId = userResult.insertId;

        if (!newUserId) {
            throw new Error("User creation failed.");
        }

        if (role === "vendor") {
            const sellerSql = `
        INSERT INTO seller (user_id, gst_no)
        VALUES (?, ?)
      `;

            await connection.query(sellerSql, [
                newUserId,
                gst_number || null,
            ]);
        }

        await connection.commit();
        connection.release();

        res.status(201).json({
            message: "Account created successfully!",
        });

    } catch (error) {
        await connection.rollback();
        connection.release();

        console.error("Registration Error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};
