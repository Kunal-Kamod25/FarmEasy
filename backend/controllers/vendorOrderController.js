const db = require("../config/db");

// ===========================================================================
// GET ORDERS PLACED BY THIS VENDOR (as a buyer)
// ===========================================================================
exports.getMyPurchases = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await db.query(`
      SELECT 
        o.id as order_id,
        o.order_date,
        o.order_status,
        o.total_price,
        oi.id as item_id,
        oi.quantity,
        oi.price as item_price,
        p.product_name,
        p.product_description,
        p.product_type,
        u.full_name as seller_name,
        s.shop_name as seller_shop
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN product p ON oi.product_id = p.id
      JOIN seller s ON p.seller_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
    `, [userId]);

    // Group items under their order_id
    const grouped = {};
    orders.forEach(row => {
      if (!grouped[row.order_id]) {
        grouped[row.order_id] = {
          order_id: row.order_id,
          order_date: row.order_date,
          order_status: row.order_status,
          total_price: row.total_price,
          items: []
        };
      }
      grouped[row.order_id].items.push({
        item_id: row.item_id,
        product_name: row.product_name,
        product_description: row.product_description,
        product_type: row.product_type,
        quantity: row.quantity,
        item_price: row.item_price,
        seller_name: row.seller_name,
        seller_shop: row.seller_shop
      });
    });

    res.json(Object.values(grouped));

  } catch (error) {
    console.error("getMyPurchases error:", error);
    res.status(500).json({ message: "Server error fetching your orders" });
  }
};

// ===========================================================================
// GET ORDERS RECEIVED BY VENDOR (sales orders)
// ===========================================================================
exports.getVendorOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.json([]);
    }

    const sellerId = seller[0].id;

    const [rows] = await db.query(`
      SELECT
        o.id,
        o.order_status as status,
        o.order_date as created_at,
        COALESCE(SUM(oi.price * oi.quantity), 0) as total_amount,
        u.full_name as customer_name
      FROM order_items oi
      JOIN product p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE p.seller_id = ?
      GROUP BY o.id, o.order_status, o.order_date, u.full_name
      ORDER BY o.order_date DESC
    `, [sellerId]);

    res.json(rows.map((row) => ({
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      total_amount: Number(row.total_amount || 0),
      customer_name: row.customer_name
    })));
  } catch (error) {
    console.error("getVendorOrders error:", error);
    res.status(500).json({ message: "Server error fetching vendor orders" });
  }
};

// ===========================================================================
// GET SINGLE ORDER DETAIL (vendor can only see orders containing their products)
// ===========================================================================
exports.getOrderDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = Number.parseInt(req.params.orderId, 10);

    if (!orderId) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Verify this vendor has products in this order
    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.status(403).json({ message: "Vendor account not found" });
    }

    const sellerId = seller[0].id;

    // Get order info + items (only items belonging to this vendor)
    const [rows] = await db.query(`
      SELECT
        o.id AS order_id,
        o.order_status,
        o.order_date,
        o.total_price,
        u.full_name AS customer_name,
        u.email AS customer_email,
        u.phone_number AS customer_phone,
        pay.payment_method,
        pay.status AS payment_status,
        oi.id AS item_id,
        oi.quantity,
        oi.price AS item_price,
        p.id AS product_id,
        p.product_name,
        p.product_image
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payment pay ON pay.order_id = o.id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN product p ON oi.product_id = p.id
      WHERE o.id = ? AND p.seller_id = ?
      ORDER BY oi.id ASC
    `, [orderId, sellerId]);

    if (!rows.length) {
      return res.status(404).json({ message: "Order not found or does not contain your products" });
    }

    const first = rows[0];
    const orderDetail = {
      order_id: first.order_id,
      order_status: first.order_status,
      order_date: first.order_date,
      total_price: Number(first.total_price || 0),
      customer_name: first.customer_name,
      customer_email: first.customer_email,
      customer_phone: first.customer_phone,
      payment_method: first.payment_method,
      payment_status: first.payment_status,
      items: rows.map((row) => ({
        item_id: row.item_id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_image: row.product_image,
        quantity: row.quantity,
        item_price: Number(row.item_price || 0)
      }))
    };

    res.json(orderDetail);
  } catch (error) {
    console.error("getOrderDetail error:", error);
    res.status(500).json({ message: "Server error fetching order detail" });
  }
};
