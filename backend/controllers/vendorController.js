const db = require("../config/db");

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
  } catch (error) {
    console.error(error);
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

  } catch (error) {
    console.error(error);
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

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};