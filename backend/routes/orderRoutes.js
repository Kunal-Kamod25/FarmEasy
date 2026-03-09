const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

// =====================================================
// PLACE A NEW ORDER
// =====================================================
router.post("/", verifyToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.user.id;
        const { shippingDetails, items, totalPrice, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        // 1. Create the order
        const [orderResult] = await connection.query(
            "INSERT INTO orders (user_id, total_price, order_status) VALUES (?, ?, 'Pending')",
            [userId, totalPrice]
        );
        const orderId = orderResult.insertId;

        // 2. Add order items
        const itemValues = items.map(item => [
            orderId,
            item.product_id || item.id,
            item.quantity,
            item.price
        ]);

        await connection.query(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
            [itemValues]
        );

        // 3. Clear user's cart
        await connection.query("DELETE FROM cart WHERE user_id = ?", [userId]);

        // 4. (Optional) Create tracking entry
        await connection.query(
            "INSERT INTO tracking (order_id, status, user_id, user_name, user_address) VALUES (?, 'Order Placed', ?, ?, ?)",
            [orderId, userId, shippingDetails.fullName, `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}`]
        );

        // 5. (Optional) Create payment entry
        await connection.query(
            "INSERT INTO payment (order_id, payment_method, amount, status) VALUES (?, ?, ?, 'Pending')",
            [orderId, paymentMethod || 'COD', totalPrice]
        );

        await connection.commit();
        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: orderId
        });

    } catch (err) {
        await connection.rollback();
        console.error("Place order error:", err);
        res.status(500).json({ message: "Failed to place order" });
    } finally {
        connection.release();
    }
});

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
