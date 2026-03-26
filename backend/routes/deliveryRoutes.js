// =====================================================
// DELIVERY ROUTES
// =====================================================
// API endpoints for GPS delivery tracking system
// Routes for drivers, customers, and admin operations
// Split into 3 controllers for better organization
// =====================================================

const express = require("express");
const router = express.Router();
const deliveryDriverController = require("../controllers/deliveryDriverController");
const deliveryManagementController = require("../controllers/deliveryManagementController");
const deliveryNotificationController = require("../controllers/deliveryNotificationController");
const auth = require("../middleware/auth");

// ========== PUBLIC/DRIVER ROUTES ==========

/**
 * POST /api/delivery/driver/register
 * Register a new delivery driver
 * No auth required (anyone can apply to be driver)
 */
router.post("/driver/register", deliveryDriverController.registerDriver);

// ========== AUTHENTICATED DRIVER ROUTES ==========

/**
 * GET /api/delivery/driver/:driverId
 * Get driver profile details
 */
router.get("/driver/:driverId", auth, deliveryDriverController.getDriverProfile);

/**
 * PATCH /api/delivery/driver/status
 * Update driver's online/offline status
 * Body: { status: "available" | "on_delivery" | "offline" }
 */
router.patch(
  "/driver/:driverId/status",
  auth,
  deliveryDriverController.updateDriverStatus
);

/**
 * POST /api/delivery/location/update
 * Update driver's GPS location (called by driver app)
 * Body: { latitude, longitude, address? }
 * Called frequently as driver navigates
 */
router.post(
  "/location/update/:driverId",
  auth,
  deliveryDriverController.updateDriverLocation
);

/**
 * GET /api/delivery/driver/:driverId/assignments
 * Get deliveries assigned to this driver
 * Shows current and past assignments
 */
router.get(
  "/driver/:driverId/assignments",
  auth,
  async (req, res) => {
    try {
      const DeliveryDriver = require("../models/DeliveryDriver");
      const driverId = req.params.driverId;

      const deliveries = await DeliveryDriver.getAssignedDeliveries(driverId);

      return res.json({
        count: deliveries.length,
        deliveries
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * PATCH /api/delivery/:deliveryId/status
 * Update delivery status during transport
 * Body: { status: "accepted" | "picked_up" | "on_the_way" | "delivered", notes? }
 * Auth required: Driver who's assigned to delivery
 */
router.patch(
  "/:deliveryId/status/:driverId",
  auth,
  deliveryManagementController.updateDeliveryStatus
);

// ========== CUSTOMER TRACKING ROUTES ==========

/**
 * GET /api/delivery/available-drivers
 * Find available drivers near pickup/delivery location
 * Query: { latitude, longitude, radius? }
 * Returns: List of nearby drivers with distance
 */
router.get("/available-drivers", deliveryDriverController.getAvailableDrivers);

/**
 * POST /api/delivery/create/:orderId
 * Create delivery from order
 * Body: { pickup_address, delivery_address, delivery_latitude, delivery_longitude, driver_id? }
 * Optionally assign driver if ID provided
 */
router.post(
  "/create/:orderId",
  auth,
  deliveryManagementController.createDelivery
);

/**
 * PATCH /api/delivery/:deliveryId/assign
 * Assign driver to delivery (if created without driver)
 * Body: { driver_id }
 */
router.patch(
  "/:deliveryId/assign",
  auth,
  deliveryManagementController.assignDriver
);

/**
 * GET /api/delivery/track/:orderId
 * Get full tracking information for order
 * Shows: driver info, current location, route, ETA, status
 * Auth required: Customer who placed order (verified in controller)
 */
router.get(
  "/track/:orderId",
  auth,
  deliveryManagementController.trackDelivery
);

/**
 * GET /api/delivery/:deliveryId/status-history
 * Get timeline of status changes for delivery
 * Shows when each status was reached and driver location
 */
router.get(
  "/:deliveryId/status-history",
  auth,
  deliveryManagementController.getStatusHistory
);

// ========== NOTIFICATION ROUTES ==========

/**
 * GET /api/delivery/notifications/me
 * Get user's delivery notifications
 * Shows all SMS/Push alerts for their orders
 */
router.get(
  "/notifications/me",
  auth,
  deliveryNotificationController.getUserNotifications
);

/**
 * PATCH /api/delivery/notifications/:notificationId/read
 * Mark single notification as read/opened
 */
router.patch(
  "/notifications/:notificationId/read",
  auth,
  deliveryNotificationController.markNotificationAsRead
);

/**
 * PATCH /api/delivery/notifications/read-all
 * Mark all user notifications as read
 */
router.patch(
  "/notifications/read-all",
  auth,
  deliveryNotificationController.markAllNotificationsAsRead
);

// ========== ADMIN ROUTES ==========

/**
 * GET /api/delivery/pending-assignments
 * Get deliveries awaiting driver assignment
 * Admin endpoint - shows which deliveries still need drivers
 */
router.get(
  "/pending-assignments",
  auth,
  (req, res) => {
    // Verify admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    return deliveryManagementController.getPendingAssignments(req, res);
  }
);

/**
 * GET /api/delivery/delayed
 * Get deliveries running late
 * Admin endpoint - alerts for deliveries past ETA
 */
router.get(
  "/delayed",
  auth,
  (req, res) => {
    // Verify admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    return deliveryManagementController.getDelayedDeliveries(req, res);
  }
);

/**
 * GET /api/delivery/analytics
 * Get delivery analytics and statistics
 * Admin endpoint - KPIs for delivery performance
 */
router.get(
  "/analytics",
  auth,
  async (req, res) => {
    try {
      // Verify admin role
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res
          .status(400)
          .json({ message: "start_date and end_date required" });
      }

      const OrderDelivery = require("../models/OrderDelivery");
      const DeliveryNotification = require("../models/DeliveryNotification");

      const deliveryStats = await OrderDelivery.getAnalytics(start_date, end_date);
      const notificationStats = await DeliveryNotification.getStats(start_date, end_date);

      return res.json({
        period: {
          start_date,
          end_date
        },
        delivery_metrics: deliveryStats,
        notification_metrics: notificationStats
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
