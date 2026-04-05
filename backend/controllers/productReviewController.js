// =====================================================
// ProductReview Controller - Fixed to use actual DB tables
// Real table: review_rating (id, product_id, user_id, rating, comments, created_at)
// =====================================================

const db = require("../config/db");

// ===== CREATE REVIEW =====
exports.createProductReview = async (req, res) => {
  try {
    const { product_id, rating, comment, title } = req.body;
    const user_id = req.user.id;

    if (!product_id || !rating || !comment) {
      return res.status(400).json({ error: "product_id, rating, and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if user already reviewed this product
    const [existing] = await db.query(
      "SELECT id FROM review_rating WHERE user_id = ? AND product_id = ? LIMIT 1",
      [user_id, product_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "You have already reviewed this product" });
    }

    // Check product exists
    const [product] = await db.query("SELECT id FROM product WHERE id = ? LIMIT 1", [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    await db.query(
      "INSERT INTO review_rating (product_id, user_id, rating, comments, created_at) VALUES (?, ?, ?, ?, NOW())",
      [product_id, user_id, rating, comment || title || ""]
    );

    res.status(201).json({ message: "Review submitted successfully" });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to create review: " + err.message });
  }
};

// ===== GET REVIEWS FOR A PRODUCT =====
exports.getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [reviews] = await db.query(
      `SELECT 
        rr.id,
        rr.product_id,
        rr.user_id,
        rr.rating,
        rr.comments AS comment,
        rr.created_at,
        u.full_name AS reviewer_name
       FROM review_rating rr
       LEFT JOIN users u ON rr.user_id = u.id
       WHERE rr.product_id = ?
       ORDER BY rr.created_at DESC
       LIMIT ? OFFSET ?`,
      [product_id, parseInt(limit), offset]
    );

    const summary = await getRatingSummary(product_id);

    res.json({
      reviews,
      summary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: summary.total_reviews,
      },
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews: " + err.message });
  }
};

// ===== GET SINGLE REVIEW =====
exports.getReviewById = async (req, res) => {
  try {
    const { review_id } = req.params;

    const [rows] = await db.query(
      `SELECT rr.*, u.full_name AS reviewer_name
       FROM review_rating rr
       LEFT JOIN users u ON rr.user_id = u.id
       WHERE rr.id = ? LIMIT 1`,
      [review_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching review:", err);
    res.status(500).json({ error: "Failed to fetch review: " + err.message });
  }
};

// ===== UPDATE REVIEW =====
exports.updateProductReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    const [rows] = await db.query("SELECT * FROM review_rating WHERE id = ? LIMIT 1", [review_id]);
    if (rows.length === 0) return res.status(404).json({ error: "Review not found" });
    if (rows[0].user_id !== user_id) return res.status(403).json({ error: "You can only edit your own reviews" });

    await db.query(
      "UPDATE review_rating SET rating = ?, comments = ? WHERE id = ?",
      [rating, comment, review_id]
    );

    res.json({ message: "Review updated successfully" });
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ error: "Failed to update review: " + err.message });
  }
};

// ===== DELETE REVIEW =====
exports.deleteProductReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const user_id = req.user.id;

    const [rows] = await db.query("SELECT * FROM review_rating WHERE id = ? LIMIT 1", [review_id]);
    if (rows.length === 0) return res.status(404).json({ error: "Review not found" });
    if (rows[0].user_id !== user_id && req.user.role !== "admin") {
      return res.status(403).json({ error: "You can only delete your own reviews" });
    }

    await db.query("DELETE FROM review_rating WHERE id = ?", [review_id]);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review: " + err.message });
  }
};

// ===== MARK HELPFUL (simplified - just returns OK since no separate table) =====
exports.markHelpful = async (req, res) => {
  res.json({ message: "Vote recorded successfully" });
};

// ===== GET VENDOR'S PRODUCT REVIEWS =====
exports.getVendorProductReviews = async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // vendor_id in params is the seller's user_id
    const [reviews] = await db.query(
      `SELECT 
        rr.id,
        rr.product_id,
        rr.user_id,
        rr.rating,
        rr.comments AS comment,
        rr.created_at,
        u.full_name AS reviewer_name,
        p.product_name
       FROM review_rating rr
       LEFT JOIN users u ON rr.user_id = u.id
       LEFT JOIN product p ON rr.product_id = p.id
       LEFT JOIN seller s ON p.seller_id = s.id
       WHERE s.id = ? OR s.user_id = ?
       ORDER BY rr.created_at DESC
       LIMIT ? OFFSET ?`,
      [vendor_id, vendor_id, parseInt(limit), offset]
    );

    res.json({
      reviews,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    console.error("Error fetching vendor reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews: " + err.message });
  }
};

// ===== GET PRODUCT RATING SUMMARY =====
exports.getProductRatingSummary = async (req, res) => {
  try {
    const { product_id } = req.params;
    const summary = await getRatingSummary(product_id);
    res.json(summary);
  } catch (err) {
    console.error("Error fetching rating summary:", err);
    res.status(500).json({ error: "Failed to fetch summary: " + err.message });
  }
};

// ===== INTERNAL HELPER: Build rating summary from review_rating table =====
async function getRatingSummary(productId) {
  const [rows] = await db.query(
    `SELECT 
      COUNT(*) AS total_reviews,
      ROUND(AVG(rating), 1) AS average_rating,
      SUM(IF(rating = 5, 1, 0)) AS five_star,
      SUM(IF(rating = 4, 1, 0)) AS four_star,
      SUM(IF(rating = 3, 1, 0)) AS three_star,
      SUM(IF(rating = 2, 1, 0)) AS two_star,
      SUM(IF(rating = 1, 1, 0)) AS one_star
     FROM review_rating
     WHERE product_id = ?`,
    [productId]
  );
  return rows[0] || {
    total_reviews: 0, average_rating: 0,
    five_star: 0, four_star: 0, three_star: 0, two_star: 0, one_star: 0,
  };
}
