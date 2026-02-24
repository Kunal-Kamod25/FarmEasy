// controllers/vendorController.js

const db = require("../config/db");
const jwt = require("jsonwebtoken");

/* ================= LOGIN ================= */
exports.loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND role = 'vendor'",
      [email]
    );

    if (!users.length) {
      return res.status(400).json({ message: "Vendor not found" });
    }

    const user = users[0];

    if (password !== user.password_hash) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        id: user.id,           
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= GET PRODUCTS ================= */
exports.getProducts = async (req, res) => {
  try {
    const userId = req.user.id;   

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.status(400).json({ message: "Seller profile not found" });
    }

    const sellerId = seller[0].id;

    const [products] = await db.query(
      "SELECT * FROM product WHERE seller_id = ?",
      [sellerId]
    );

    res.json(products);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= ADD PRODUCT ================= */
exports.addProduct = async (req, res) => {
  try {
    const { product_name, product_description, price, product_quantity } = req.body;

    const userId = req.user.id;

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    const sellerId = seller[0].id;

    await db.query(
      "INSERT INTO product (product_name, product_description, price, product_quantity, seller_id) VALUES (?, ?, ?, ?, ?)",
      [product_name, product_description, price, product_quantity, sellerId]
    );

    res.json({ message: "Product added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    const sellerId = seller[0].id;

    await db.query(
      "DELETE FROM product WHERE id = ? AND seller_id = ?",
      [productId, sellerId]
    );

    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};