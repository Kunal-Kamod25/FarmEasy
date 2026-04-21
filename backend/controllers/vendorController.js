// ===========================================================================
// VENDOR CONTROLLER - Main Router
// This file imports all vendor sub-controllers and exports them for routes
// ===========================================================================

const vendorProductController = require("./vendorProductController");
const vendorProfileController = require("./vendorProfileController");
const vendorDashboardController = require("./vendorDashboardController");
const vendorOrderController = require("./vendorOrderController");

// Export all vendor functions
module.exports = {
  // ===== PRODUCT MANAGEMENT =====
  getProducts: vendorProductController.getProducts,
  getProduct: vendorProductController.getProduct,
  addProduct: vendorProductController.addProduct,
  updateProduct: vendorProductController.updateProduct,
  deleteProduct: vendorProductController.deleteProduct,

  // ===== PROFILE MANAGEMENT =====
  getProfile: vendorProfileController.getProfile,
  getVendorList: vendorProfileController.getVendorList,
  updateProfile: vendorProfileController.updateProfile,

  // ===== DASHBOARD & ANALYTICS =====
  getDashboardStats: vendorDashboardController.getDashboardStats,
  getSalesSummary: vendorDashboardController.getSalesSummary,

  // ===== ORDER MANAGEMENT =====
  getVendorOrders: vendorOrderController.getVendorOrders,
  getMyPurchases: vendorOrderController.getMyPurchases
};
