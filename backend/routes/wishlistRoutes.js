// routes/wishlistRoutes.js

const express = require("express");
const router = express.Router();

const { toggleWishlist, getWishlist } = require("../controllers/wishlistController");
const protect = require("../middleware/auth"); // your existing JWT middleware

// Add / Remove wishlist
router.post("/", protect, toggleWishlist);

// Get logged in user's wishlist
router.get("/", protect, getWishlist);

module.exports = router;