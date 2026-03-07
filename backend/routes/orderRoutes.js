const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

// =====================================================
// GET USER'S OWN ORDERS (order history)
// called from the user's profile > my orders tab
// and also from vendor dashboard's "my orders" tab (vendor as buyer)
// =====================================================
router.get("/user/:userId", verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // make sure user can only see their own orders (security)
        if (req.user.id !== parseInt(userId)) {
            return res.status(403).json({ message: "Access denied" });
        }

        // get all orders with items and product info in one query
        const [rows] = await db.query(`
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
        COALESCE(s.shop_name, u2.full_name) as seller_shop,
        u2.full_name as seller_name
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN product p ON oi.product_id = p.id
      LEFT JOIN seller s ON p.seller_id = s.id
      LEFT JOIN users u2 ON s.user_id = u2.id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
    `, [userId]);

        // group items by order id - makes it much easier to render on frontend
        const ordersMap = {};
        rows.forEach(row => {
            if (!ordersMap[row.order_id]) {
                ordersMap[row.order_id] = {
                    id: row.order_id,
                    order_date: row.order_date,
                    order_status: row.order_status,
                    total_price: row.total_price,
                    items: []
                };
            }
            ordersMap[row.order_id].items.push({
                item_id: row.item_id,
                product_name: row.product_name,
                product_description: row.product_description,
                product_type: row.product_type,
                quantity: row.quantity,
                price: row.item_price,
                seller_shop: row.seller_shop,
                seller_name: row.seller_name
            });
        });

        res.json(Object.values(ordersMap));

    } catch (err) {
        console.error("Error fetching user orders:", err);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

module.exports = router;
