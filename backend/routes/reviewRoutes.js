// =====================================================
// Review Routes
// =====================================================
// Product and Vendor Review endpoints
// =====================================================

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const productReviewController = require("../controllers/productReviewController");
const vendorReviewController = require("../controllers/vendorReviewController");

// ===== PRODUCT REVIEW ROUTES =====

// Create a product review (authenticated)
router.post("/product", auth, productReviewController.createProductReview);

// Get reviews for a product (public)
router.get("/product/:product_id", productReviewController.getProductReviews);

// Get single product review (public)
router.get("/product/review/:review_id", productReviewController.getReviewById);

// Update product review (authenticated, owned)
router.patch(
  "/product/review/:review_id",
  auth,
  productReviewController.updateProductReview
);

// Delete product review (authenticated, owned)
router.delete(
  "/product/review/:review_id",
  auth,
  productReviewController.deleteProductReview
);

// Mark review as helpful (authenticated)
router.post(
  "/product/review/:review_id/helpful",
  auth,
  productReviewController.markHelpful
);

// Get product rating summary (public)
router.get(
  "/product/:product_id/summary",
  productReviewController.getProductRatingSummary
);

// Get vendor's product reviews (for vendor dashboard)
router.get(
  "/vendor/:vendor_id/product-reviews",
  auth,
  productReviewController.getVendorProductReviews
);

// ===== VENDOR REVIEW ROUTES =====

// Create a vendor review (authenticated)
router.post("/vendor", auth, vendorReviewController.createVendorReview);

// Get reviews for a vendor (public)
router.get("/vendor/:vendor_id", vendorReviewController.getVendorReviews);

// Get single vendor review (public)
router.get("/vendor/review/:review_id", vendorReviewController.getReviewById);

// Update vendor review (authenticated, owned)
router.patch(
  "/vendor/review/:review_id",
  auth,
  vendorReviewController.updateVendorReview
);

// Delete vendor review (authenticated, owned)
router.delete(
  "/vendor/review/:review_id",
  auth,
  vendorReviewController.deleteVendorReview
);

// Get vendor rating summary (public)
router.get(
  "/vendor/:vendor_id/summary",
  vendorReviewController.getVendorRatingSummary
);

// Get top rated vendors (public)
router.get("/vendors/top-rated", vendorReviewController.getTopRatedVendors);

module.exports = router;
