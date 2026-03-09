const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

// Request reset (Link or OTP)
router.post("/forgot-password", passwordController.forgotPassword);

// Verify OTP (Check if code matches and is not expired)
router.post("/verify-otp", passwordController.verifyOTP);

// Reset password (Accepts token or OTP as 'token')
router.post("/reset-password", passwordController.resetPassword);

module.exports = router;
