// =====================================================
// NOTIFICATION ROUTES
// =====================================================

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

// ===== GET ALL NOTIFICATIONS (Protected) =====
router.get("/", auth, notificationController.getNotifications);

// ===== MARK NOTIFICATION AS READ (Protected) =====
router.patch("/:notificationId/read", auth, notificationController.markAsRead);

// ===== MARK ALL AS READ (Protected) =====
router.patch("/read-all", auth, notificationController.markAllAsRead);

// ===== DELETE NOTIFICATION (Protected) =====
router.delete("/:notificationId", auth, notificationController.deleteNotification);

module.exports = router;
