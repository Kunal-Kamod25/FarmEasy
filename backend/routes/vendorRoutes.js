// routes/vendorRoutes.js

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const vendorController = require("../controllers/vendorController");

router.post("/login", vendorController.loginVendor);

router.get("/products", verifyToken, vendorController.getProducts);

router.post("/products", verifyToken, vendorController.addProduct);

router.delete("/products/:id", verifyToken, vendorController.deleteProduct);

module.exports = router;