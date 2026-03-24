const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

const ensureAdmin = (req, res, next) => {
  const role = String(req.user?.role || "").toLowerCase();

  if (role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  return next();
};

router.get("/dashboard-summary", verifyToken, ensureAdmin, async (req, res) => {
  try {
    const [[usersRow]] = await db.query("SELECT COUNT(*) as totalUsers FROM users");
    const [[productsRow]] = await db.query("SELECT COUNT(*) as totalProducts FROM product");
    const [[ordersRow]] = await db.query("SELECT COUNT(*) as totalOrders FROM orders");
    const [[revenueRow]] = await db.query("SELECT COALESCE(SUM(total_price), 0) as totalRevenue FROM orders");

    const [recentOrders] = await db.query(
      `SELECT
         o.id,
         o.order_date,
         o.order_status,
         o.total_price,
         u.full_name as customer_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.order_date DESC
       LIMIT 8`
    );

    res.json({
      totalUsers: Number(usersRow.totalUsers || 0),
      totalProducts: Number(productsRow.totalProducts || 0),
      totalOrders: Number(ordersRow.totalOrders || 0),
      totalRevenue: Number(revenueRow.totalRevenue || 0),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        customer_name: order.customer_name,
        total_price: Number(order.total_price || 0),
        order_status: order.order_status,
        order_date: order.order_date
      }))
    });
  } catch (error) {
    console.error("Admin dashboard summary error:", error);
    res.status(500).json({ message: "Failed to fetch admin dashboard summary" });
  }
});

module.exports = router;
