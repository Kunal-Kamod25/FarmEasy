// =====================================================
// DELIVERY NOTIFICATION MODEL
// =====================================================
// Handles SMS, Push, and Email notifications
// - Track notification sending status
// - Queue notifications for delivery updates
// - Log notification delivery success/failure
// - Manage notification preferences
// =====================================================

const db = require("../config/db");

class DeliveryNotification {
  // ========== CREATE NOTIFICATIONS ==========

  /**
   * Create and send notification for delivery status change
   * @param {number} deliveryId - Order delivery ID
   * @param {number} userId - Customer ID
   * @param {string} notificationType - Type of notification
   * @param {string} message - Notification message
   * @param {Object} options - SMS/Push/Email flags
   */
  async createNotification(
    deliveryId,
    userId,
    notificationType,
    message,
    options = {}
  ) {
    const { send_via_sms = true, send_via_push = true, send_via_email = false } =
      options;

    // Insert notification record
    const [result] = await db.query(
      `INSERT INTO delivery_notifications (
        delivery_id, user_id, notification_type, message,
        send_via_sms, send_via_push, send_via_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        deliveryId,
        userId,
        notificationType,
        message,
        send_via_sms,
        send_via_push,
        send_via_email
      ]
    );

    const notificationId = result.insertId;

    // Send notifications asynchronously (don't block API response)
    this._sendNotificationsAsync(notificationId, userId, message, {
      send_via_sms,
      send_via_push,
      send_via_email
    });

    return {
      id: notificationId,
      delivery_id: deliveryId,
      user_id: userId,
      notification_type: notificationType
    };
  }

  /**
   * Create notifications for common delivery events
   */
  async createStatusChangeNotification(deliveryId, userId, oldStatus, newStatus) {
    const messages = {
      assigned: `🚗 Driver assigned to your order! Check tracking to see driver details.`,
      accepted: `✅ Driver accepted your delivery. Heading to pickup location.`,
      picked_up: `📦 Order picked up! Driver is on the way to you.`,
      on_the_way: `🚗 Driver approaching your location. Get ready to receive.`,
      delivered: `✅ Order delivered successfully! Please rate your delivery experience.`,
      failed: `⚠️ Delivery failed. Customer support will contact you soon.`
    };

    const message = messages[newStatus] || `Order delivery status: ${newStatus}`;

    return this.createNotification(
      deliveryId,
      userId,
      "status_update",
      message,
      {
        send_via_sms: true,
        send_via_push: true,
        send_via_email: false
      }
    );
  }

  /**
   * Create "driver arriving soon" notification when within 5km
   */
  async createDriverArrivingNotification(deliveryId, userId, etaMinutes) {
    const message = `🚗 Driver will arrive in approximately ${etaMinutes} minutes`;

    return this.createNotification(
      deliveryId,
      userId,
      "driver_arriving",
      message,
      {
        send_via_sms: true,
        send_via_push: true,
        send_via_email: false
      }
    );
  }

  /**
   * Create delay alert if delivery goes past ETA
   */
  async createDelayAlertNotification(deliveryId, userId, estimatedTime, actualTime) {
    const delayMinutes = Math.round((actualTime - estimatedTime) / (1000 * 60));
    const message = `⏰ Your delivery is running ${delayMinutes} minutes late. We apologize for the delay.`;

    return this.createNotification(
      deliveryId,
      userId,
      "delay_alert",
      message,
      {
        send_via_sms: true,
        send_via_push: true,
        send_via_email: true
      }
    );
  }

  // ========== SEND NOTIFICATIONS (BACKGROUND) ==========

  /**
   * Send notifications via SMS, Push, Email
   * @private - Called internally by createNotification
   */
  async _sendNotificationsAsync(notificationId, userId, message, methods) {
    try {
      // Get user contact details
      const [user] = await db.query(
        "SELECT phone, email, push_token FROM users WHERE id = ?",
        [userId]
      );

      if (user.length === 0) {
        throw new Error("User not found");
      }

      const userPhone = user[0].phone;
      const userEmail = user[0].email;
      const pushToken = user[0].push_token;

      // Send SMS
      if (methods.send_via_sms && userPhone) {
        try {
          await this._sendSMS(userPhone, message, notificationId);
          // SMS sent successfully - update in DB
          await db.query(
            "UPDATE delivery_notifications SET sms_status = 'sent' WHERE id = ?",
            [notificationId]
          );
        } catch (smsError) {
          console.error(`SMS failed for notification ${notificationId}:`, smsError);
          await db.query(
            "UPDATE delivery_notifications SET sms_status = 'failed' WHERE id = ?",
            [notificationId]
          );
        }
      }

      // Send Push Notification
      if (methods.send_via_push && pushToken) {
        try {
          await this._sendPushNotification(pushToken, message, notificationId);
          await db.query(
            "UPDATE delivery_notifications SET push_status = 'sent' WHERE id = ?",
            [notificationId]
          );
        } catch (pushError) {
          console.error(`Push failed for notification ${notificationId}:`, pushError);
          await db.query(
            "UPDATE delivery_notifications SET push_status = 'failed' WHERE id = ?",
            [notificationId]
          );
        }
      }

      // Send Email
      if (methods.send_via_email && userEmail) {
        try {
          await this._sendEmail(userEmail, "Delivery Update", message, notificationId);
        } catch (emailError) {
          console.error(`Email failed for notification ${notificationId}:`, emailError);
        }
      }
    } catch (error) {
      console.error(
        `Error sending notifications for ${notificationId}:`,
        error.message
      );
    }
  }

  /**
   * Send SMS via Twilio
   * @private
   * TODO: Configure Twilio credentials in .env
   */
  async _sendSMS(phoneNumber, message, notificationId) {
    // Twilio integration example (requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env)
    // const twilio = require("twilio");
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });

    // For now, just log
    console.log(`📲 SMS sent to ${phoneNumber}: ${message}`);

    // In production, replace with actual Twilio call above
    return { id: notificationId, status: "sent" };
  }

  /**
   * Send Push Notification via Firebase
   * @private
   * TODO: Configure Firebase credentials in .env
   */
  async _sendPushNotification(pushToken, message, notificationId) {
    // Firebase Cloud Messaging integration
    // const admin = require("firebase-admin");
    // await admin.messaging().send({
    //   token: pushToken,
    //   notification: {
    //     title: "Delivery Update",
    //     body: message
    //   }
    // });

    // For now, just log
    console.log(`🔔 Push sent to token: ${message}`);

    // In production, replace with actual Firebase call above
    return { id: notificationId, status: "sent" };
  }

  /**
   * Send Email notification
   * @private
   * TODO: Configure email service (SendGrid/Nodemailer) in .env
   */
  async _sendEmail(email, subject, message, notificationId) {
    // Email service integration (SendGrid, Nodemailer, etc)
    // Example with Nodemailer:
    // const transporter = require("../config/email");
    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: email,
    //   subject,
    //   html: `<p>${message}</p>`
    // });

    // For now, just log
    console.log(`📧 Email sent to ${email}: ${subject}`);

    return { id: notificationId, status: "sent" };
  }

  // ========== TRACKING & HISTORY ==========

  /**
   * Get all notifications for a delivery
   */
  async getDeliveryNotifications(deliveryId) {
    const [rows] = await db.query(
      `SELECT * FROM delivery_notifications
      WHERE delivery_id = ?
      ORDER BY sent_at DESC`,
      [deliveryId]
    );

    return rows;
  }

  /**
   * Get user's notification history
   */
  async getUserNotifications(userId, limit = 20) {
    const [rows] = await db.query(
      `SELECT 
        dn.*,
        od.order_id,
        od.status as delivery_status
      FROM delivery_notifications dn
      JOIN order_deliveries od ON dn.delivery_id = od.id
      WHERE dn.user_id = ?
      ORDER BY dn.sent_at DESC
      LIMIT ?`,
      [userId, limit]
    );

    return rows;
  }

  /**
   * Get unread/unopened notifications
   */
  async getUnreadNotifications(userId) {
    const [rows] = await db.query(
      `SELECT COUNT(*) as unread_count FROM delivery_notifications
      WHERE user_id = ? AND opened_at IS NULL`,
      [userId]
    );

    return rows[0].unread_count;
  }

  /**
   * Mark notification as read/opened
   */
  async markAsRead(notificationId) {
    const [result] = await db.query(
      "UPDATE delivery_notifications SET opened_at = CURRENT_TIMESTAMP WHERE id = ?",
      [notificationId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    await db.query(
      "UPDATE delivery_notifications SET opened_at = CURRENT_TIMESTAMP WHERE user_id = ? AND opened_at IS NULL",
      [userId]
    );

    return true;
  }

  /**
   * Record customer action on notification (e.g., clicked link)
   */
  async recordAction(notificationId) {
    await db.query(
      "UPDATE delivery_notifications SET acted_on = TRUE WHERE id = ?",
      [notificationId]
    );

    return true;
  }

  // ========== NOTIFICATION STATISTICS ==========

  /**
   * Get notification sending statistics
   */
  async getStats(startDate, endDate) {
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_sent,
        COUNT(CASE WHEN sms_status = 'sent' THEN 1 END) as sms_successful,
        COUNT(CASE WHEN sms_status = 'failed' THEN 1 END) as sms_failed,
        COUNT(CASE WHEN push_status = 'sent' THEN 1 END) as push_successful,
        COUNT(CASE WHEN push_status = 'failed' THEN 1 END) as push_failed,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened,
        COUNT(CASE WHEN acted_on = TRUE THEN 1 END) as acted_on
      FROM delivery_notifications
      WHERE sent_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    return stats[0];
  }

  /**
   * Get notification delivery rate by type
   */
  async getSuccessRateByType() {
    const [stats] = await db.query(
      `SELECT 
        notification_type,
        COUNT(*) as total,
        COUNT(CASE WHEN sms_status = 'sent' THEN 1 END) as sms_sent,
        COUNT(CASE WHEN push_status = 'sent' THEN 1 END) as push_sent,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened
      FROM delivery_notifications
      GROUP BY notification_type`
    );

    return stats;
  }

  /**
   * Get notifications that failed to send (for retry)
   */
  async getFailedNotifications() {
    const [rows] = await db.query(
      `SELECT * FROM delivery_notifications
      WHERE (sms_status = 'failed' OR push_status = 'failed')
        AND sent_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY sent_at ASC`
    );

    return rows;
  }
}

module.exports = new DeliveryNotification();
