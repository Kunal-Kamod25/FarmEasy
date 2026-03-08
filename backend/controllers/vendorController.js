const db = require("../config/db");

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
// ADD NEW PRODUCT
// vendor adds a product with all details
// =====================================================
exports.addProduct = async (req, res) => {
  try {
    const { product_name, product_description, product_type, price, category_id, product_quantity } = req.body;

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

    // if vendor uploaded a product image, multer saves it to /uploads and gives us the filename
    const productImage = req.file ? `/uploads/${req.file.filename}` : null;

    await db.query(
      `INSERT INTO product 
        (product_name, product_description, product_type, price, category_id, product_quantity, seller_id, product_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_name,
        product_description || null,
        product_type || null,
        price,
        category_id || null,
        product_quantity || 0,
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
        categoryBreakdown: []
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

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      activeOffers: 0, // can add offers table later
      categoryBreakdown
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

    res.json(rows[0]);

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

    // if vendor uploaded a new profile pic, multer saves it and gives us the file info
    const profilePic = req.file ? `/uploads/${req.file.filename}` : null;

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