// =====================================================
// DELIVERY NOTIFICATION CONTROLLER
// =====================================================
// Handles delivery-related notifications
// - User notifications for delivery status changes
// - Mark notifications as read
// - Notification history and analytics
// =====================================================

const DeliveryNotification = require("../models/DeliveryNotification");

class DeliveryNotificationController {
  /**
   * GET /api/delivery/notifications/me
   * Get user's delivery notifications with unread count
   * Query: { limit (default 20) }
   */
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const limit = req.query.limit || 20;

      const notifications = await DeliveryNotification.getUserNotifications(userId, limit);
      const unreadCount = await DeliveryNotification.getUnreadNotifications(userId);

      return res.json({
        unread_count: unreadCount,
        notifications
      });
    } catch (error) {
      console.error("Get notifications error:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * PATCH /api/delivery/notifications/:notificationId/read
   * Mark a single notification as read
   */
  async markNotificationAsRead(req, res) {
    try {
      const notificationId = req.params.notificationId;

      const success = await DeliveryNotification.markAsRead(notificationId);

      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      return res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification as read error:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * PATCH /api/delivery/notifications/read-all
   * Mark all user's notifications as read
   */
  async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user.id;

      await DeliveryNotification.markAllAsRead(userId);

      return res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all as read error:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new DeliveryNotificationController();
