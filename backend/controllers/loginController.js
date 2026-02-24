// controllers/loginController.js

const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // ✅ Basic validation
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Identifier (email or phone) and password are required.",
      });
    }

    // ✅ Find user by email or phone
    const user = await User.findByEmailOrPhone(identifier);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email/phone number or password.",
      });
    }

    // ✅ Check if password exists in DB
    if (!user.password_hash) {
      return res.status(500).json({
        message: "User password not set properly.",
      });
    }

    let isMatch = false;

    // 🔥 If password is hashed (bcrypt format starts with $2)
    if (user.password_hash.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      // ⚠️ If password is plain text (temporary support)
      isMatch = password === user.password_hash;
    }

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email/phone number or password.",
      });
    }

    // ✅ Check JWT Secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing in .env");
      return res.status(500).json({
        message: "JWT configuration error.",
      });
    }

    // 🔥 CREATE TOKEN
    const token = jwt.sign(
      {
        id: user.id,        // use id (important)
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Send response
    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        fullname: user.full_name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({
      message: "Server error during login.",
    });
  }
};