const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Define the register route
router.post('/register', register);
router.post('/login', login);
// You can add login later:
// router.post('/login', login);

module.exports = router;