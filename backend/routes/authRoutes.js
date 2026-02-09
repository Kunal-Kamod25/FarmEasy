// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const registerController = require('../controllers/registerController'); // 🆕 ADDED
const loginController = require('../controllers/loginController');       // 🆕 ADDED

router.post('/register', registerController.register);
router.post('/login', loginController.login);

module.exports = router;
