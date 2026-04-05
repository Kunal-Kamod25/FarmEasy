const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// ===== GET ALL CATEGORIES WITH HIERARCHY =====
router.get("/", categoryController.getAllCategories);

// ===== GET CATEGORY WITH PRODUCTS =====
router.get("/:categoryId/products", categoryController.getCategoryWithProducts);

// ===== GET SUBCATEGORIES FOR PARENT =====
router.get("/:parentId/subcategories", categoryController.getSubcategories);

// ===== GET PRODUCTS WITH FILTERS =====
router.get("/filters/search", categoryController.getProductsByFilters);

module.exports = router;