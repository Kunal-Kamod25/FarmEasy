// =====================================================
// NOTIFICATIONS CONTROLLER
// Uses orders/order_items tables (which actually exist)
// Generates notifications dynamically from real data
// =====================================================

const db = require("../config/db");

// ===== GET NOTIFICATIONS (derived from real order data and messages) =====
exports.getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { unreadOnly } = req.query;

    let allNotifications = [];

    // ============================================
    // 1. VENDOR NOTIFICATIONS
    // ============================================
    const [sellerRows] = await db.query(
      "SELECT id FROM seller WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    if (sellerRows.length > 0) {
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

      const vendorOrders = orders.map((order) => {
        const isNew = order.order_status === "Pending";
        const type = isNew ? "new_order" : "order_status_change";
        const title = isNew
          ? "New Order Received! 📦"
          : `Order Status: ${order.order_status} 🔄`;
        const message = `Order #${order.order_id} from ${order.customer_name || "Customer"} — ₹${order.total_price}`;

        return {
          id: `vendor_ord_${order.order_id}_${order.order_status}`,
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

      allNotifications = [...allNotifications, ...vendorOrders, ...stockNotifications];
    }

    // ============================================
    // 2. FARMER/CUSTOMER NOTIFICATIONS
    // ============================================
    // Login Notification (Always shows a recent login alert for the session)
    const loginNotification = {
      id: `login_alert_${user_id}`,
      type: "login_alert",
      title: "Login Successful 🔐",
      message: "You have successfully logged into your FarmEasy account.",
      is_read: false,
      related_order_id: null,
      action_url: `/profile`,
      created_at: new Date().toISOString()
    };

    // My order updates
    const [myOrderUpdates] = await db.query(
      `SELECT id as order_id, order_status, order_date, total_price 
       FROM orders 
       WHERE user_id = ?
       ORDER BY order_date DESC LIMIT 20`,
      [user_id]
    );

    const customerOrderNotifications = myOrderUpdates.map(o => ({
      id: `cust_ord_${o.order_id}_${o.order_status}`,
      type: "order_update",
      title: `Order ${o.order_status}! 📦`,
      message: `Your order #${o.order_id} for ₹${o.total_price} is now ${o.order_status}.`,
      is_read: false, // For customer dynamic alerts, we don't track read state in DB, consider them unread if recent. Let's just pass false.
      related_order_id: o.order_id,
      action_url: `/track-order/${o.order_id}`,
      created_at: o.order_date
    }));

    allNotifications = [...allNotifications, loginNotification, ...customerOrderNotifications];

    // Sort all combined notifications by newest first
    allNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // ============================================
    // 3. APPLY FILTERS AND RETURN
    // ============================================
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
