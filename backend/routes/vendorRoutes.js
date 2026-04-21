// ===========================================================================
// Vendor Routes - /api/vendor/*
// ===========================================================================
//
// All routes here require a valid JWT token (verifyToken middleware).
// The token is sent in the "Authorization: Bearer <token>" header.
// After verifyToken runs, req.user.id = the logged-in user's ID.
//
// FLOW:
// 1. Vendor logs in -> gets a JWT token
// 2. Frontend stores token in localStorage
// 3. Every vendor API call includes the token in headers
// 4. verifyToken decodes it and attaches user info to req.user
// 5. Controller uses req.user.id to find the seller record and do the work
//
// IMAGE UPLOAD:
// - upload.single("field_name") uses multer to save the file to /uploads/
// - the file info is available in req.file (filename, path, etc.)
// - we store the path like "/uploads/1234567890.jpg" in the database
// ===========================================================================

const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const vendorController = require("../controllers/vendorController");
const upload = require("../middleware/upload");
const messageController = require("../controllers/messageController");

// ========== PRODUCTS ==========
router.get("/products", verifyToken, vendorController.getProducts);
router.get("/products/:id", verifyToken, vendorController.getProduct);
router.get("/orders", verifyToken, vendorController.getVendorOrders);
router.post("/products", verifyToken, upload.single("product_image"), vendorController.addProduct);
router.delete("/products/:id", verifyToken, vendorController.deleteProduct);
router.put("/products/:id", verifyToken, upload.single("product_image"), vendorController.updateProduct);

// ========== DASHBOARD ==========
// returns real stats: total products, orders, revenue, category breakdown
router.get("/dashboard", verifyToken, vendorController.getDashboardStats);
router.get("/sales-summary", verifyToken, vendorController.getSalesSummary);

// ========== PROFILE ==========
// vendor profile reads from users + seller table joined
router.get("/profile", verifyToken, vendorController.getProfile);
// vendor list for messaging discovery
router.get("/list", verifyToken, vendorController.getVendorList);
// profile update supports optional profile_image file upload via multer
router.put("/profile", verifyToken, upload.single("profile_image"), vendorController.updateProfile);

// ========== VENDOR AS BUYER (My Purchases) ==========
// vendor is also a user who can buy from others - this fetches those orders
router.get("/my-purchases", verifyToken, vendorController.getMyPurchases);

// ========== VENDOR MESSAGING ==========
// Vendor can see conversations with customers and send/receive messages
router.get("/messages/conversations", verifyToken, messageController.getConversations);
router.get("/messages/conversation/:conversationId", verifyToken, messageController.getMessages);
router.post("/messages/send", verifyToken, messageController.sendMessage);
router.put("/messages/:messageId/read", verifyToken, messageController.markAsRead);

module.exports = router;