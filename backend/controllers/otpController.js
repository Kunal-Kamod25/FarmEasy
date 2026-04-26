// controllers/otpController.js
// Handles email OTP sending and verification during registration

const db = require('../config/db');
const nodemailer = require('nodemailer');

// Reuse the same SMTP config from passwordController
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// POST /api/authentication/send-otp
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }

        // Check if email is already registered
        const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Email is already registered." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Delete any previous OTPs for this email
        await db.execute("DELETE FROM registration_otps WHERE email = ?", [email]);

        // Store OTP in DB
        await db.execute(
            "INSERT INTO registration_otps (email, otp, expires_at) VALUES (?, ?, ?)",
            [email, otp, expiresAt]
        );

        // Send OTP email
        const mailOptions = {
            from: `"FarmEasy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "FarmEasy - Email Verification OTP",
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f0fdf4; border-radius: 16px;">
                    <h2 style="color: #065f46; margin-bottom: 8px;">🌿 FarmEasy Email Verification</h2>
                    <p style="color: #374151; font-size: 15px;">Use the OTP below to verify your email and complete registration:</p>
                    <div style="background: #065f46; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px 24px; border-radius: 12px; margin: 24px 0;">
                        ${otp}
                    </div>
                    <p style="color: #6b7280; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
                    <hr style="border: none; border-top: 1px solid #d1fae5; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ success: true, message: "OTP sent to your email." });
        } catch (mailError) {
            console.error("❌ OTP Mail Error:", mailError.message);
            // Dev fallback — return OTP so testing still works without SMTP
            res.status(200).json({
                success: true,
                message: "Email service error. Using dev mode.",
                dev_otp: otp // REMOVE IN PRODUCTION
            });
        }

    } catch (error) {
        console.error("Send OTP Error:", error);
        res.status(500).json({ success: false, message: "Server error sending OTP." });
    }
};

// POST /api/authentication/verify-otp
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required." });
        }

        const [rows] = await db.execute(
            "SELECT * FROM registration_otps WHERE email = ? AND otp = ? AND expires_at > ?",
            [email, otp, Date.now()]
        );

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }

        // OTP verified — clean up
        await db.execute("DELETE FROM registration_otps WHERE email = ?", [email]);

        res.status(200).json({ success: true, message: "Email verified successfully!" });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ success: false, message: "Server error verifying OTP." });
    }
};
