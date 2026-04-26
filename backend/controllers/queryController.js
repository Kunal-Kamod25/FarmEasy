const db = require('../config/db');

exports.getProductQueries = async (req, res) => {
  try {
    const { productId } = req.params;
    const [queries] = await db.query(`
      SELECT q.*, u.full_name as user_name, v.full_name as vendor_name
      FROM product_queries q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN users v ON q.answered_by = v.id
      WHERE q.product_id = ?
      ORDER BY q.created_at DESC
    `, [productId]);
    res.json(queries);
  } catch (error) {
    console.error("Error fetching queries:", error);
    res.status(500).json({ message: "Server error fetching queries" });
  }
};

exports.askQuery = async (req, res) => {
  try {
    const { productId } = req.params;
    const { query_text } = req.body;
    const user_id = req.user.id;

    if (!query_text) return res.status(400).json({ message: "Query text is required" });

    await db.query(
      `INSERT INTO product_queries (product_id, user_id, query_text) VALUES (?, ?, ?)`,
      [productId, user_id, query_text]
    );

    res.status(201).json({ message: "Question submitted successfully" });
  } catch (error) {
    console.error("Error submitting query:", error);
    res.status(500).json({ message: "Server error submitting query" });
  }
};

exports.answerQuery = async (req, res) => {
  try {
    const { queryId } = req.params;
    const { answer_text } = req.body;
    const vendor_id = req.user.id;

    if (!answer_text) return res.status(400).json({ message: "Answer text is required" });

    // Ensure the user answering is actually the seller of this product
    const [queryInfo] = await db.query(
      `SELECT p.seller_id FROM product_queries q JOIN product p ON q.product_id = p.id WHERE q.id = ?`,
      [queryId]
    );

    if (queryInfo.length === 0) return res.status(404).json({ message: "Query not found" });

    // Validate that vendor_id matches the seller's user_id. We need to check if vendor_id is the seller user_id
    // Wait, p.seller_id points to seller table, seller.user_id points to users table.
    const [sellerInfo] = await db.query(`SELECT user_id FROM seller WHERE id = ?`, [queryInfo[0].seller_id]);
    
    if (sellerInfo.length === 0 || sellerInfo[0].user_id !== vendor_id) {
       return res.status(403).json({ message: "Only the product vendor can answer queries" });
    }

    await db.query(
      `UPDATE product_queries SET answer_text = ?, answered_by = ? WHERE id = ?`,
      [answer_text, vendor_id, queryId]
    );

    res.json({ message: "Answer submitted successfully" });
  } catch (error) {
    console.error("Error answering query:", error);
    res.status(500).json({ message: "Server error answering query" });
  }
};

exports.deleteQuery = async (req, res) => {
  try {
    const { queryId } = req.params;
    const user_id = req.user.id;

    // Check ownership
    const [query] = await db.query(`SELECT user_id FROM product_queries WHERE id = ?`, [queryId]);
    if (query.length === 0) return res.status(404).json({ message: "Query not found" });
    if (query[0].user_id !== user_id) return res.status(403).json({ message: "Not authorized" });

    await db.query(`DELETE FROM product_queries WHERE id = ?`, [queryId]);
    res.json({ message: "Query deleted" });
  } catch (error) {
    console.error("Error deleting query:", error);
    res.status(500).json({ message: "Server error deleting query" });
  }
};
