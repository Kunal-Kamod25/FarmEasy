const db = require("../config/db");

// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================

const getRangeKeys = (startStr, endStr, useMonthly) => {
  const keys = [];
  const current = new Date(startStr);
  const end = new Date(endStr);
  
  while (current.getTime() <= end.getTime()) {
    if (useMonthly) {
      const gKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const gLabel = current.toLocaleString("en-IN", { month: "short", year: "numeric" });
      if (!keys.some(k => k.groupKey === gKey)) {
        keys.push({ groupKey: gKey, groupLabel: gLabel });
      }
      current.setMonth(current.getMonth() + 1);
    } else {
      const gKey = current.toISOString().split('T')[0];
      const gLabel = current.toLocaleString("en-IN", { day: "2-digit", month: "short" });
      keys.push({ groupKey: gKey, groupLabel: gLabel });
      current.setDate(current.getDate() + 1);
    }
  }
  return keys;
};

const toNullableInt = (value) => {
  if (value === undefined || value === null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const lower = trimmed.toLowerCase();
    if (lower === "null" || lower === "undefined") return null;

    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const getRecentMonthKeys = () => {
  const keys = [];
  const now = new Date();
  
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().split('T')[0].substring(0, 7);
    const monthLabel = date.toLocaleString("en-IN", { month: "short" });
    keys.push({ monthKey, monthLabel });
  }
  
  return keys;
};

// ===========================================================================
// VENDOR DASHBOARD STATS
// ===========================================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query; 

    const now = new Date();
    const end = endDate ? new Date(endDate) : now;
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

    const endDateStr = end.toISOString().split('T')[0] + ' 23:59:59';
    const startDateStr = start.toISOString().split('T')[0] + ' 00:00:00';

    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
    const useMonthly = daysDiff > 90;
    
    const groupByFormat = useMonthly ? '%Y-%m' : '%Y-%m-%d';
    const labelFormat = useMonthly ? '%b %Y' : '%d %b';

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.json({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeOffers: 0,
        categoryBreakdown: [],
        monthlyBreakdown: [],
        feedbackStats: []
      });
    }

    const sellerId = seller[0].id;

    const [[{ totalProducts }]] = await db.query(
      "SELECT COUNT(*) as totalProducts FROM product WHERE seller_id = ?",
      [sellerId]
    );

    const [[{ totalOrders }]] = await db.query(`
      SELECT COUNT(DISTINCT oi.order_id) as totalOrders
      FROM order_items oi
      JOIN product p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.seller_id = ? AND o.order_date >= ? AND o.order_date <= ?
    `, [sellerId, startDateStr, endDateStr]);

    const [[{ totalRevenue }]] = await db.query(`
      SELECT COALESCE(SUM(oi.price * oi.quantity), 0) as totalRevenue
      FROM order_items oi
      JOIN product p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.seller_id = ? AND o.order_date >= ? AND o.order_date <= ?
    `, [sellerId, startDateStr, endDateStr]);

    const [[{ activeOffers }]] = await db.query(
      "SELECT COUNT(*) as activeOffers FROM product WHERE seller_id = ? AND product_quantity > 0",
      [sellerId]
    );

    const [categoryBreakdown] = await db.query(`
      SELECT 
        COALESCE(pc.product_cat_name, 'Uncategorized') as name,
        COUNT(p.id) as count
      FROM product p
      LEFT JOIN product_category pc ON p.category_id = pc.id
      WHERE p.seller_id = ?
      GROUP BY pc.product_cat_name
      ORDER BY count DESC
    `, [sellerId]);

    const [chartRows] = await db.query(`
      SELECT
        DATE_FORMAT(o.order_date, ?) as group_key,
        DATE_FORMAT(o.order_date, ?) as group_label,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue,
        COUNT(DISTINCT oi.order_id) as orders
      FROM order_items oi
      JOIN product p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.seller_id = ?
        AND o.order_date >= ?
        AND o.order_date <= ?
      GROUP BY group_key, group_label
      ORDER BY group_key ASC
    `, [groupByFormat, labelFormat, sellerId, startDateStr, endDateStr]);

    const chartMap = new Map(chartRows.map(r => [r.group_key, r]));
    const timeKeys = getRangeKeys(start.toISOString(), end.toISOString(), useMonthly);

    const monthlyBreakdown = timeKeys.map(({ groupKey, groupLabel }) => {
      const row = chartMap.get(groupKey);
      return {
        month: groupLabel,
        revenue: row ? Number(row.revenue) : 0,
        orders: row ? Number(row.orders) : 0
      };
    });

    const [feedbackRows] = await db.query(`
      SELECT
        DATE_FORMAT(vr.created_at, ?) as group_key,
        DATE_FORMAT(vr.created_at, ?) as group_label,
        AVG(vr.rating) as avg_rating,
        COUNT(*) as review_count
      FROM vendor_reviews vr
      WHERE vr.vendor_id = ?
        AND vr.created_at >= ?
        AND vr.created_at <= ?
      GROUP BY group_key, group_label
      ORDER BY group_key ASC
    `, [groupByFormat, labelFormat, userId, startDateStr, endDateStr]);

    const feedbackMap = new Map(feedbackRows.map(r => [r.group_key, r]));
    const feedbackStats = timeKeys.map(({ groupKey, groupLabel }) => {
      const row = feedbackMap.get(groupKey);
      return {
        month: groupLabel,
        rating: row ? parseFloat(parseFloat(row.avg_rating).toFixed(1)) : 0,
        reviews: row ? Number(row.review_count) : 0
      };
    });

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      activeOffers,
      categoryBreakdown,
      monthlyBreakdown,
      feedbackStats
    });

  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
};

// ===========================================================================
// VENDOR SALES SUMMARY
// ===========================================================================
exports.getSalesSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.json({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        monthlySales: [],
        transactions: []
      });
    }

    const sellerId = seller[0].id;

    const [monthlyRows] = await db.query(`
      SELECT
        DATE_FORMAT(o.order_date, '%Y-%m') as month_key,
        DATE_FORMAT(o.order_date, '%b') as month_label,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue,
        COUNT(DISTINCT oi.order_id) as orders
      FROM order_items oi
      JOIN product p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.seller_id = ?
        AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY month_key, month_label
      ORDER BY month_key ASC
    `, [sellerId]);

    const monthMap = new Map(
      monthlyRows.map((row) => [
        row.month_key,
        {
          month: row.month_label,
          revenue: Number(row.revenue || 0),
          orders: Number(row.orders || 0)
        }
      ])
    );

    const monthlySales = getRecentMonthKeys().map(({ monthKey, monthLabel }) => {
      return monthMap.get(monthKey) || { month: monthLabel, revenue: 0, orders: 0 };
    });

    const totalRevenue = monthlySales.reduce((sum, m) => sum + m.revenue, 0);
    const totalOrders = monthlySales.reduce((sum, m) => sum + m.orders, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const [transactions] = await db.query(`
      SELECT
        o.id as order_id,
        u.full_name as customer_name,
        COALESCE(SUM(oi.price * oi.quantity), 0) as amount,
        o.order_status as status,
        o.order_date as date
      FROM order_items oi
      JOIN product p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE p.seller_id = ?
      GROUP BY o.id, u.full_name, o.order_status, o.order_date
      ORDER BY o.order_date DESC
      LIMIT 10
    `, [sellerId]);

    res.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      monthlySales,
      transactions: transactions.map((t) => ({
        id: `#${t.order_id}`,
        customer: t.customer_name,
        amount: Number(t.amount || 0),
        status: t.status,
        date: t.date
      }))
    });
  } catch (error) {
    console.error("getSalesSummary error:", error);
    res.status(500).json({ message: "Server error fetching sales summary" });
  }
};
