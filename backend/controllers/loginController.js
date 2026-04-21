const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const User = require("../models/userModel");

const toRoleGroup = (role) => {
  const normalized = String(role || "").trim().toLowerCase();

  if (["vendor", "seller"].includes(normalized)) return "vendor";
  if (normalized === "admin") return "admin";
  if (["customer", "user", "buyer", "farmer"].includes(normalized)) return "customer";

  return normalized;
};

const issueToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT configuration error.");
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const sendAuthResponse = (res, user, message) => {
  const token = issueToken(user);

  return res.status(200).json({
    message,
    token,
    user: {
      id: user.id,
      fullname: user.full_name,
      role: toRoleGroup(user.role),
    },
  });
};

const verifyGoogleCredential = async (credential) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    const error = new Error("Google OAuth is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );
  const profile = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(profile.error_description || "Invalid Google credential.");
    error.statusCode = 401;
    throw error;
  }

  if (String(profile.aud) !== String(process.env.GOOGLE_CLIENT_ID)) {
    const error = new Error("Google credential does not match this app.");
    error.statusCode = 401;
    throw error;
  }

  if (String(profile.email_verified) !== "true") {
    const error = new Error("Google account email is not verified.");
    error.statusCode = 401;
    throw error;
  }

  if (!profile.email) {
    const error = new Error("Google account email is missing.");
    error.statusCode = 401;
    throw error;
  }

  return profile;
};

exports.login = async (req, res) => {
  try {
    const { identifier, password, loginAs } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Identifier (email or phone) and password are required.",
      });
    }

    const user = await User.findByEmailOrPhone(identifier);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email/phone number or password.",
      });
    }

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

    if (!user.password_hash) {
      return res.status(500).json({
        message: "User password not set properly.",
      });
    }

    let isMatch = false;
    if (user.password_hash.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      isMatch = password === user.password_hash;
    }

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email/phone number or password.",
      });
    }

    return sendAuthResponse(res, user, "Login successful!");
  } catch (error) {
    console.error("Login Error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || "Server error during login.",
    });
  }
};

exports.google = async (req, res) => {
  let connection;

  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required.",
      });
    }

    const googleProfile = await verifyGoogleCredential(credential);
    const requestedRoleGroup = toRoleGroup(role || "customer");
    let user = await User.findByEmail(googleProfile.email);

    if (user) {
      const actualRoleGroup = toRoleGroup(user.role);

      if (requestedRoleGroup && requestedRoleGroup !== actualRoleGroup) {
        return res.status(403).json({
          message:
            requestedRoleGroup === "vendor"
              ? "This Google account is linked to a customer profile. Please use Customer access."
              : "This Google account is linked to a vendor profile. Please use Vendor access.",
        });
      }

      return sendAuthResponse(res, user, "Google login successful!");
    }

    if (requestedRoleGroup === "vendor") {
      return res.status(400).json({
        message: "Google sign-up is only available for customer accounts. Please use manual vendor registration.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const fallbackName = googleProfile.name || googleProfile.given_name || googleProfile.email.split("@")[0];
    const randomSecret = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(`google:${googleProfile.sub}:${randomSecret}`, 10);

    const [userResult] = await connection.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone_number)
       VALUES (?, ?, ?, ?, ?)`,
      [fallbackName, googleProfile.email, hashedPassword, "customer", null]
    );

    await connection.commit();

    user = {
      id: userResult.insertId,
      full_name: fallbackName,
      email: googleProfile.email,
      role: "customer",
    };

    return sendAuthResponse(res, user, "Google sign-up successful!");
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        // ignore rollback errors
      }
    }

    console.error("Google Auth Error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || "Server error during Google authentication.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

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

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        decoded = jwt.decode(token);
        if (!decoded) {
          return res.status(401).json({ message: "Invalid token format" });
        }
      } else {
        return res.status(401).json({ message: "Invalid token signature" });
      }
    }

    const [user] = await db.execute("SELECT id, role FROM users WHERE id = ?", [decoded.id]);

    if (user.length === 0) {
      return res.status(401).json({ message: "User no longer exists. Please login again." });
    }

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
