// controllers/loginController.js

const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const toRoleGroup = (role) => {
  const normalized = String(role || "").trim().toLowerCase();

  if (["vendor", "seller"].includes(normalized)) return "vendor";
  if (["admin"].includes(normalized)) return "admin";
  if (["customer", "user", "buyer", "farmer"].includes(normalized)) return "customer";

  return normalized;
};

exports.login = async (req, res) => {
  try {
    const { identifier, password, loginAs } = req.body;

    // Basic validation
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Identifier (email or phone) and password are required.",
      });
    }

    // Find user by email or phone
    const user = await User.findByEmailOrPhone(identifier);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email/phone number or password.",
      });
    }

    // Optional role lock from login screen: customer tab accepts customer accounts,
    // vendor tab accepts vendor/seller accounts.
    if (loginAs) {
      const requestedRoleGroup = toRoleGroup(loginAs);
      const actualRoleGroup = toRoleGroup(user.role);

      if (requestedRoleGroup !== actualRoleGroup) {
        return res.status(403).json({
          message:
            requestedRoleGroup === "vendor"
              ? "This account is not a vendor/seller account. Please use Customer login."
              : "This account is not a customer account. Please use Vendor login.",
        });
      }
    }

    // Check if password exists in DB
    if (!user.password_hash) {
      return res.status(500).json({
        message: "User password not set properly.",
      });
    }

    let isMatch = false;

    // If password is hashed (bcrypt format starts with $2)
    if (user.password_hash.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      
      // If password is plain text (temporary support)
      isMatch = password === user.password_hash;
    }

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email/phone number or password.",
      });
    }

    // Check JWT Secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing in .env");
      return res.status(500).json({
        message: "JWT configuration error.",
      });
    }

    // CREATE TOKEN
    const token = jwt.sign(
      {
        id: user.id,        // use id (important)
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send response
    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        fullname: user.full_name,
        role: toRoleGroup(user.role),
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server error during login.",
    });
  }
};

// ===== REFRESH TOKEN ENDPOINT =====
// POST /api/auth/refresh
// Frontend sends old token, backend generates new token if user still exists
exports.refresh = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing in .env");
      return res.status(500).json({ message: "JWT configuration error." });
    }

    // Verify old token (ignore expiration temporarily)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Even if expired, we can decode without verify to extract payload
      if (err.name === "TokenExpiredError") {
        decoded = jwt.decode(token);
        if (!decoded) {
          return res.status(401).json({ message: "Invalid token format" });
        }
      } else {
        return res.status(401).json({ message: "Invalid token signature" });
      }
    }

    // Check if user still exists in database
    const db = require("../config/db");
    const [user] = await db.execute("SELECT id, role FROM users WHERE id = ?", [decoded.id]);

    if (user.length === 0) {
      return res.status(401).json({ message: "User no longer exists. Please login again." });
    }

    // Create new token
    const newToken = jwt.sign(
      {
        id: decoded.id,
        role: user[0].role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: newToken,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Token Refresh Error:", error);
    res.status(500).json({ message: "Server error during token refresh" });
  }
};