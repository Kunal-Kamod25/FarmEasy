const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const vendorController = require("../controllers/vendorController");
const upload = require("../middleware/upload"); 

// ================= PRODUCTS =================

router.get("/products", verifyToken, vendorController.getProducts);
router.post("/products", verifyToken, upload.single("product_image"), vendorController.addProduct);
router.delete("/products/:id", verifyToken, vendorController.deleteProduct);

module.exports = router;