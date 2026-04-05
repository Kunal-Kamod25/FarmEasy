// =====================================================
// NOTIFICATIONS CONTROLLER
// =====================================================
// Manage vendor notifications for orders and products
// =====================================================

const db = require("../config/db");

// ===== GET ALL NOTIFICATIONS FOR VENDOR =====
exports.getNotifications = async (req, res) => {
  try {
    const vendor_id = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let where = "WHERE vendor_id = ?";
    let params = [vendor_id];

    if (unreadOnly === "true") {
      where += " AND is_read = false";
    }

    const [notifications] = await db.query(
      `SELECT 
        id, type, title, message, is_read,
        related_order_id, related_product_id,
        action_url, created_at, read_at
      FROM vendor_notifications
      ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get unread count
    const [unreadCount] = await db.query(
      `SELECT COUNT(*) as unread FROM vendor_notifications 
       WHERE vendor_id = ? AND is_read = false`,
      [vendor_id]
    );

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM vendor_notifications ${where}`,
      params
    );

    res.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount[0].unread,
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== MARK NOTIFICATION AS READ =====
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const vendor_id = req.user.id;

    const [result] = await db.query(
      `UPDATE vendor_notifications 
       SET is_read = true, read_at = NOW()
       WHERE id = ? AND vendor_id = ?`,
      [notificationId, vendor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== MARK ALL NOTIFICATIONS AS READ =====
exports.markAllAsRead = async (req, res) => {
  try {
    const vendor_id = req.user.id;

    await db.query(
      `UPDATE vendor_notifications 
       SET is_read = true, read_at = NOW()
       WHERE vendor_id = ? AND is_read = false`,
      [vendor_id]
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== CREATE NOTIFICATION (Internal Helper) =====
const createNotification = async (vendor_id, type, title, message, options = {}) => {
  try {
    const {
      related_order_id,
      related_product_id,
      action_url,
    } = options;

    await db.query(
      `INSERT INTO vendor_notifications 
       (vendor_id, type, title, message, related_order_id, related_product_id, action_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [vendor_id, type, title, message, related_order_id, related_product_id, action_url]
    );
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// ===== TRIGGER NOTIFICATION ON NEW ORDER =====
exports.notifyNewOrder = async (order_id, vendor_id) => {
  try {
    const [order] = await db.query(
      `SELECT o.id, o.total_amount, u.full_name 
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [order_id]
    );

    if (order.length > 0) {
      await createNotification(
        vendor_id,
        "new_order",
        "New Order Received! 📦",
        `New order #${order_id} of ₹${order[0].total_amount} from ${order[0].full_name}`,
        {
          related_order_id: order_id,
          action_url: `/vendor/orders/${order_id}`,
        }
      );
    }
  } catch (error) {
    console.error("Error notifying new order:", error);
  }
};

// ===== TRIGGER NOTIFICATION ON STOCK LOW =====
exports.notifyLowStock = async (product_id, vendor_id, current_stock) => {
  try {
    const [product] = await db.query(
      `SELECT name FROM product WHERE id = ?`,
      [product_id]
    );

    if (product.length > 0) {
      await createNotification(
        vendor_id,
        "low_stock",
        "Low Stock Alert! ⚠️",
        `Product "${product[0].name}" stock is running low (${current_stock} units remaining)`,
        {
          related_product_id: product_id,
          action_url: `/vendor/products/${product_id}`,
        }
      );
    }
  } catch (error) {
    console.error("Error notifying low stock:", error);
  }
};

// ===== TRIGGER NOTIFICATION ON STATUS CHANGE =====
exports.notifyOrderStatusChange = async (order_id, vendor_id, new_status) => {
  try {
    const statusMessages = {
      pending: "Order is pending",
      confirmed: "Order confirmed",
      shipped: "Order shipped",
      delivered: "Order delivered",
      cancelled: "Order cancelled",
    };

    const message = statusMessages[new_status] || `Order status changed to ${new_status}`;

    await createNotification(
      vendor_id,
      "order_status_change",
      `Order Status Update 🔄`,
      `Order #${order_id}: ${message}`,
      {
        related_order_id: order_id,
        action_url: `/vendor/orders/${order_id}`,
      }
    );
  } catch (error) {
    console.error("Error notifying status change:", error);
  }
};

// ===== DELETE NOTIFICATION =====
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const vendor_id = req.user.id;

    const [result] = await db.query(
      `DELETE FROM vendor_notifications 
       WHERE id = ? AND vendor_id = ?`,
      [notificationId, vendor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
