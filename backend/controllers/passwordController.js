const db = require("../config/db");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// ─── SMTP CONFIGURATION (NEW FORMAT) ─────────────────────────────────────
// Updated to use new SMTP format from emailConfig
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ SMTP Connection Error:", error.message);
    } else {
        console.log("✅ SMTP Server is ready to take our messages");
    }
});

// ─── 1. FORGOT PASSWORD (Sends Link or OTP) ──────────────────────────────────
exports.forgotPassword = async (req, res) => {
    const { email, type } = req.body; // type: 'link' or 'otp'

    try {
        const [user] = await db.execute("SELECT id, full_name FROM users WHERE email = ?", [email]);

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found with this email" });
        }

        let token;
        let expires = Date.now() + 300000; // 5 minutes from now

        if (type === "otp") {
            // Generate 6-digit OTP
            token = Math.floor(100000 + Math.random() * 900000).toString();
        } else {
            // Generate secure reset token (JWT)
            token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: "5m" });
        }

        // Save token and expiry to DB
        await db.execute(
            "UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?",
            [token, expires, user[0].id]
        );

        // Send Email
        const resetUrl = `http://localhost:5173/reset-password/${token}`;
        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'FarmEasy'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: email,
            subject: "FarmEasy - Password Reset Request",
            html: type === "otp"
                ? `<h3>Password Reset OTP</h3><p>Your 6-digit OTP is: <b>${token}</b></p><p>It expires in 5 minutes.</p>`
                : `<h3>Password Reset Link</h3><p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>Expires in 5 minutes.</p>`,
        };

        // Note: If SMTP is not configured, this will fail. We handle it gracefully.
        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ success: true, message: `Reset ${type === 'otp' ? 'OTP' : 'link'} sent to email` });
        } catch (mailError) {
            console.error("❌ Mail Send Error:", mailError.message);
            // For development, we return the token/OTP so the user can still test
            res.status(200).json({
                success: true,
                message: "Email error: " + mailError.message + " (Check terminal). Using Dev Mode.",
                dev_token: token // REMOVE THIS IN PRODUCTION
            });
        }

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─── 2. VERIFY OTP ────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const [user] = await db.execute(
            "SELECT id FROM users WHERE email = ? AND reset_password_token = ? AND reset_password_expires > ?",
            [email, otp, Date.now()]
        );

        if (user.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        res.status(200).json({ success: true, message: "OTP verified. You can now reset your password." });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─── 3. RESET PASSWORD ────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // 1. Find user with valid token/otp
        const [user] = await db.execute(
            "SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > ?",
            [token, Date.now()]
        );

        if (user.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or expired token/OTP" });
        }

        // 2. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 3. Update password and clear reset token
        await db.execute(
            "UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?",
            [hashedPassword, user[0].id]
        );

        res.status(200).json({ success: true, message: "Password reset successful! You can now login." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
