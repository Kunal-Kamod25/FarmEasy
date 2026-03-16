const db = require("../config/db");

const getRecentMonthKeys = (months = 6) => {
  const keys = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = d.toLocaleString("en-IN", { month: "short" });
    keys.push({ monthKey, monthLabel });
  }

  return keys;
};

// Converts nullable form values to integers for MySQL INT columns.
// Handles values coming from multipart FormData where null-like values are sent as strings.
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

// =====================================================
// GET VENDOR'S OWN PRODUCTS
// simple - just find this vendor's seller id, then get their products
// =====================================================
exports.getProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    // first find their seller record
    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.status(400).json({ message: "Seller profile not found. Please complete your seller registration." });
    }

    const sellerId = seller[0].id;

    // grab all products for this seller, also join category name so frontend doesn't have to do extra calls
    const [products] = await db.query(`
      SELECT 
        p.*,
        pc.product_cat_name AS category_name
      FROM product p
      LEFT JOIN product_category pc ON p.category_id = pc.id
      WHERE p.seller_id = ?
      ORDER BY p.created_at DESC
    `, [sellerId]);

    res.json(products);

  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};


// =====================================================
// GET A SINGLE PRODUCT FOR EDITING
// =====================================================
exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    // Verify ownership
    const [seller] = await db.query("SELECT id FROM seller WHERE user_id = ?", [userId]);
    if (!seller.length) return res.status(403).json({ message: "Seller not found" });

    const sellerId = seller[0].id;

    const [product] = await db.query(
      "SELECT * FROM product WHERE id = ? AND seller_id = ?",
      [productId, sellerId]
    );

    if (!product.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product[0]);
  } catch (error) {
    console.error("getProduct error:", error);
    res.status(500).json({ message: "Server error while fetching product" });
  }
};

// =====================================================
// UPDATE A PRODUCT
// =====================================================
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const { product_name, product_description, product_type, price, category_id, product_quantity } = req.body;
    const normalizedCategoryId = toNullableInt(category_id);
    const normalizedQuantity = toNullableInt(product_quantity) ?? 0;

    // Verify ownership
    const [seller] = await db.query("SELECT id FROM seller WHERE user_id = ?", [userId]);
    if (!seller.length) return res.status(403).json({ message: "Seller not found" });

    const sellerId = seller[0].id;

    // Check if the product belongs to this seller
    const [existingProduct] = await db.query("SELECT id FROM product WHERE id = ? AND seller_id = ?", [productId, sellerId]);
    if (!existingProduct.length) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    // req.file.path is the full Cloudinary HTTPS URL when using CloudinaryStorage
    const productImage = req.file ? req.file.path : null;

    if (productImage) {
      await db.query(`
        UPDATE product 
        SET product_name = ?, product_description = ?, product_type = ?, price = ?, category_id = ?, product_quantity = ?, product_image = ?
        WHERE id = ? AND seller_id = ?
      `, [product_name, product_description || null, product_type || null, price, normalizedCategoryId, normalizedQuantity, productImage, productId, sellerId]);
    } else {
      await db.query(`
        UPDATE product 
        SET product_name = ?, product_description = ?, product_type = ?, price = ?, category_id = ?, product_quantity = ?
        WHERE id = ? AND seller_id = ?
      `, [product_name, product_description || null, product_type || null, price, normalizedCategoryId, normalizedQuantity, productId, sellerId]);
    }

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ message: "Server error while updating product" });
  }
};


// =====================================================
// ADD NEW PRODUCT
// vendor adds a product with all details
// =====================================================
exports.addProduct = async (req, res) => {
  try {
    const { product_name, product_description, product_type, price, category_id, product_quantity } = req.body;
    const normalizedCategoryId = toNullableInt(category_id);
    const normalizedQuantity = toNullableInt(product_quantity) ?? 0;

    // basic check
    if (!product_name || !price) {
      return res.status(400).json({ message: "Product name and price are required" });
    }

    const userId = req.user.id;

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.status(400).json({ message: "Seller profile not found" });
    }

    const sellerId = seller[0].id;

    // if vendor uploaded a product image, CloudinaryStorage streams it to Cloudinary and req.file.path is the URL
    const productImage = req.file ? req.file.path : null;

    await db.query(
      `INSERT INTO product 
        (product_name, product_description, product_type, price, category_id, product_quantity, seller_id, product_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_name,
        product_description || null,
        product_type || null,
        price,
        normalizedCategoryId,
        normalizedQuantity,
        sellerId,
        productImage
      ]
    );

    res.json({ message: "Product added successfully" });

  } catch (error) {
    console.error("addProduct error:", error);
    res.status(500).json({ message: "Server error while adding product" });
  }
};


// =====================================================
// DELETE PRODUCT
// only this vendor can delete their own product (we check seller_id match)
// =====================================================
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.status(400).json({ message: "Seller not found" });
    }

    const sellerId = seller[0].id;

    // delete only if the product belongs to this seller - security check
    const [result] = await db.query(
      "DELETE FROM product WHERE id = ? AND seller_id = ?",
      [productId, sellerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found or you don't own this product" });
    }

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ message: "Server error while deleting product" });
  }
};


// =====================================================
// VENDOR DASHBOARD STATS
// counts products, orders, revenue for this specific vendor
// =====================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      // return zeros if no seller profile yet instead of erroring
      return res.json({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeOffers: 0,
        categoryBreakdown: [],
        monthlyBreakdown: []
      });
    }

    const sellerId = seller[0].id;

    // count their products
    const [[{ totalProducts }]] = await db.query(
      "SELECT COUNT(*) as totalProducts FROM product WHERE seller_id = ?",
      [sellerId]
    );

    // count orders that have their products in it
    const [[{ totalOrders }]] = await db.query(`
      SELECT COUNT(DISTINCT oi.order_id) as totalOrders
      FROM order_items oi
      JOIN product p ON oi.product_id = p.id
      WHERE p.seller_id = ?
    `, [sellerId]);

    // sum up revenue from their products
    const [[{ totalRevenue }]] = await db.query(`
      SELECT COALESCE(SUM(oi.price * oi.quantity), 0) as totalRevenue
      FROM order_items oi
      JOIN product p ON oi.product_id = p.id
      WHERE p.seller_id = ?
    `, [sellerId]);

    const [[{ activeOffers }]] = await db.query(
      "SELECT COUNT(*) as activeOffers FROM product WHERE seller_id = ? AND product_quantity > 0",
      [sellerId]
    );

    // real category breakdown from DB (no more hardcoded "Seeds: 12")
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

    const monthlyBreakdown = getRecentMonthKeys().map(({ monthKey, monthLabel }) => {
      return monthMap.get(monthKey) || { month: monthLabel, revenue: 0, orders: 0 };
    });

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      activeOffers,
      categoryBreakdown,
      monthlyBreakdown
    });

  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
};


// =====================================================
// GET VENDOR PROFILE
// reads from both users table and seller table, merges them
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // get user info + seller info in one shot with a join
    const [rows] = await db.query(`
      SELECT 
        u.id,
        u.full_name as vendor_name,
        u.email,
        u.phone_number as phone,
        u.address,
        u.city,
        u.state,
        u.pincode,
        u.created_at,
        u.bio,
        u.profile_pic as profile_image,
        s.shop_name as store_name,
        s.gst_no as gst_number,
        s.id as seller_id
      FROM users u
      LEFT JOIN seller s ON s.user_id = u.id
      WHERE u.id = ?
    `, [userId]);

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = rows[0];

    const [[orderStats]] = await db.query(
      `SELECT 
         COUNT(*) as total_orders,
         COALESCE(SUM(total_price), 0) as total_spent
       FROM orders
       WHERE user_id = ?`,
      [userId]
    );

    const profileVerified = Boolean(
      profile.vendor_name &&
      profile.phone &&
      profile.address &&
      profile.city &&
      profile.state &&
      profile.pincode &&
      profile.store_name
    );

    res.json({
      ...profile,
      total_orders: Number(orderStats.total_orders || 0),
      total_spent: Number(orderStats.total_spent || 0),
      account_status: {
        profile_verified: profileVerified,
        email_verified: Boolean(profile.email),
        gst_submitted: Boolean(profile.gst_number)
      }
    });

  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Server error fetching vendor profile" });
  }
};


// =====================================================
// UPDATE VENDOR PROFILE
// updates both users table and seller table
// =====================================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      vendor_name, email, phone, address, city, state, pincode,
      bio, store_name, gst_number
    } = req.body;

    // if vendor uploaded a new profile pic, CloudinaryStorage streams it to Cloudinary and req.file.path is the URL
    const profilePic = req.file ? req.file.path : null;

    // update users table with personal info (only update profile_pic if a new one was uploaded)
    if (profilePic) {
      await db.query(`
        UPDATE users 
        SET full_name = ?, phone_number = ?, address = ?, city = ?, state = ?, pincode = ?, bio = ?, profile_pic = ?
        WHERE id = ?
      `, [
        vendor_name || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        bio || null,
        profilePic,
        userId
      ]);
    } else {
      await db.query(`
        UPDATE users 
        SET full_name = ?, phone_number = ?, address = ?, city = ?, state = ?, pincode = ?, bio = ?
        WHERE id = ?
      `, [
        vendor_name || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        bio || null,
        userId
      ]);
    }

    // check if seller record exists
    const [seller] = await db.query("SELECT id FROM seller WHERE user_id = ?", [userId]);

    if (seller.length) {
      // update existing seller record with shop/gst info
      await db.query(`
        UPDATE seller 
        SET shop_name = ?, gst_no = ?
        WHERE user_id = ?
      `, [store_name || null, gst_number || null, userId]);
    } else {
      // create seller record if it doesn't exist (shouldn't happen normally but just in case)
      await db.query(`
        INSERT INTO seller (user_id, shop_name, gst_no) VALUES (?, ?, ?)
      `, [userId, store_name || null, gst_number || null]);
    }

    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};


// =====================================================
// GET ORDERS PLACED BY THIS VENDOR (as a buyer)
// because a vendor is also a user who can buy from other vendors
// =====================================================
exports.getMyPurchases = async (req, res) => {
  try {
    const userId = req.user.id;

    // grab all orders this user placed, with items and product details
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

    // group items under their order_id for easier frontend rendering
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


// =====================================================
// GET ORDERS RECEIVED BY VENDOR (sales orders)
// =====================================================
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


// =====================================================
// VENDOR SALES SUMMARY
// real monthly sales + transaction list from DB
// =====================================================
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