// =====================================================
// NOTIFICATIONS CONTROLLER
// Uses orders/order_items tables (which actually exist)
// Generates notifications dynamically from real data
// =====================================================

const db = require("../config/db");

// ===== GET NOTIFICATIONS (derived from real order data) =====
exports.getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { unreadOnly } = req.query;

    // Get the seller row for this user
    const [sellerRows] = await db.query(
      "SELECT id FROM seller WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    if (sellerRows.length === 0) {
      // Not a vendor — return empty
      return res.json({
        success: true,
        data: { notifications: [], unread_count: 0, pagination: { total: 0, page: 1, limit: 20, pages: 0 } },
      });
    }

    const seller_id = sellerRows[0].id;

    // Build notifications from orders that contain this vendor's products
    const [orders] = await db.query(
      `SELECT DISTINCT
        o.id AS order_id,
        o.order_status,
        o.order_date,
        o.total_price,
        u.full_name AS customer_name
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN product p ON oi.product_id = p.id
       LEFT JOIN users u ON o.user_id = u.id
       WHERE p.seller_id = ?
       ORDER BY o.order_date DESC
       LIMIT 50`,
      [seller_id]
    );

    // Convert orders into notification-like objects
    const notifications = orders.map((order) => {
      const isNew = order.order_status === "Pending";
      const type = isNew ? "new_order" : "order_status_change";
      const title = isNew
        ? "New Order Received! 📦"
        : `Order Status: ${order.order_status} 🔄`;
      const message = `Order #${order.order_id} from ${order.customer_name || "Customer"} — ₹${order.total_price}`;

      return {
        id: order.order_id,
        type,
        title,
        message,
        is_read: !isNew, // unread only if Pending
        related_order_id: order.order_id,
        action_url: `/vendor/orders`,
        created_at: order.order_date,
      };
    });

    // Also check low-stock products
    const [lowStockProducts] = await db.query(
      `SELECT id, product_name, product_quantity
       FROM product
       WHERE seller_id = ? AND product_quantity > 0 AND product_quantity <= 5
       ORDER BY product_quantity ASC
       LIMIT 10`,
      [seller_id]
    );

    const stockNotifications = lowStockProducts.map((product) => ({
      id: `stock_${product.id}`,
      type: "low_stock",
      title: "Low Stock Alert! ⚠️",
      message: `"${product.product_name}" has only ${product.product_quantity} unit(s) left`,
      is_read: false,
      related_product_id: product.id,
      action_url: `/vendor/products`,
      created_at: new Date().toISOString(),
    }));

    const allNotifications = [...stockNotifications, ...notifications];
    const filtered = unreadOnly === "true"
      ? allNotifications.filter((n) => !n.is_read)
      : allNotifications;

    const unread_count = allNotifications.filter((n) => !n.is_read).length;

    res.json({
      success: true,
      data: {
        notifications: filtered,
        unread_count,
        pagination: {
          total: filtered.length,
          page: 1,
          limit: 50,
          pages: 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== MARK AS READ (client-side only — no DB table needed) =====
exports.markAsRead = async (req, res) => {
  // Since notifications are derived from orders (no separate table),
  // just return success. Frontend manages read state locally.
  res.json({ success: true, message: "Notification marked as read" });
};

// ===== MARK ALL AS READ =====
exports.markAllAsRead = async (req, res) => {
  res.json({ success: true, message: "All notifications marked as read" });
};

// ===== DELETE NOTIFICATION =====
exports.deleteNotification = async (req, res) => {
  // No table to delete from — just return success
  res.json({ success: true, message: "Notification dismissed" });
};

// ===== TRIGGER ON NEW ORDER (called internally after order is placed) =====
exports.notifyNewOrder = async (order_id, vendor_id) => {
  // No-op since notifications are now derived from orders table dynamically
  console.log(`📦 New order #${order_id} notification for vendor ${vendor_id}`);
};

// ===== TRIGGER ON LOW STOCK =====
exports.notifyLowStock = async (product_id, vendor_id, current_stock) => {
  try {
    const [product] = await db.query(
      "SELECT product_name FROM product WHERE id = ? LIMIT 1",
      [product_id]
    );
    if (product.length > 0) {
      console.log(`⚠️ Low stock: "${product[0].product_name}" (${current_stock} left) for vendor ${vendor_id}`);
    }
  } catch (error) {
    console.error("Error in notifyLowStock:", error);
  }
};

// ===== TRIGGER ON ORDER STATUS CHANGE =====
exports.notifyOrderStatusChange = async (order_id, vendor_id, new_status) => {
  console.log(`🔄 Order #${order_id} status changed to ${new_status} for vendor ${vendor_id}`);
};
