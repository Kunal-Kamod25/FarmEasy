// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const registerController = require('../controllers/registerController');
const loginController = require('../controllers/loginController');
const otpController = require('../controllers/otpController');

router.post('/register', registerController.register);
router.post('/login', loginController.login);
router.post('/google', loginController.google);
router.post('/refresh', loginController.refresh);

// OTP verification for registration
router.post('/send-otp', otpController.sendOTP);
router.post('/verify-otp', otpController.verifyOTP);

module.exports = router;
