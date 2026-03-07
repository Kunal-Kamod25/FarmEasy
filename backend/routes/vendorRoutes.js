const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const vendorController = require("../controllers/vendorController");
const upload = require("../middleware/upload");

// ========== PRODUCTS ==========
router.get("/products", verifyToken, vendorController.getProducts);
router.post("/products", verifyToken, upload.single("product_image"), vendorController.addProduct);
router.delete("/products/:id", verifyToken, vendorController.deleteProduct);

// ========== DASHBOARD ==========
// returns real stats: total products, orders, revenue, category breakdown
router.get("/dashboard", verifyToken, vendorController.getDashboardStats);

// ========== PROFILE ==========
// vendor profile reads from users + seller table joined
router.get("/profile", verifyToken, vendorController.getProfile);
router.put("/profile", verifyToken, vendorController.updateProfile);

// ========== VENDOR AS BUYER (My Purchases) ==========
// vendor is also a user who can buy from others - this fetches those orders
router.get("/my-purchases", verifyToken, vendorController.getMyPurchases);

module.exports = router;