const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// ===== GET ALL CATEGORIES WITH HIERARCHY =====
router.get("/", categoryController.getAllCategories);

// ===== GET NAV MEGA-MENU DATA (categories → subcategories → products) =====
// Must be BEFORE /:categoryId/products to avoid route conflicts
router.get("/nav-data", categoryController.getNavData);

// ===== GET PRODUCTS WITH FILTERS =====
router.get("/filters/search", categoryController.getProductsByFilters);

// ===== GET CATEGORY WITH PRODUCTS =====
router.get("/:categoryId/products", categoryController.getCategoryWithProducts);

// ===== GET SUBCATEGORIES FOR PARENT =====
router.get("/:parentId/subcategories", categoryController.getSubcategories);

module.exports = router;