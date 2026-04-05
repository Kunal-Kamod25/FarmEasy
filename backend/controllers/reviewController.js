// =====================================================
// REVIEWS & RATINGS CONTROLLER
// =====================================================
// Handle product reviews and ratings system
// =====================================================

const db = require("../config/db");

// ===== GET ALL REVIEWS FOR A PRODUCT =====
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = "newest" } = req.query;
    const offset = (page - 1) * limit;

    let orderBy = "r.created_at DESC";
    switch (sortBy) {
      case "oldest":
        orderBy = "r.created_at ASC";
        break;
      case "rating-high":
        orderBy = "r.rating DESC";
        break;
      case "rating-low":
        orderBy = "r.rating ASC";
        break;
      case "helpful":
        orderBy = "r.helpful_count DESC";
        break;
    }

    // Get reviews
    const [reviews] = await db.query(
      `SELECT 
        r.id, r.product_id, r.user_id, r.rating, r.title, r.review_text,
        r.helpful_count, r.verified_purchase, r.created_at,
        u.full_name, u.profile_pic
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
      [productId, parseInt(limit), offset]
    );

    // Get review statistics
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews
      WHERE product_id = ?`,
      [productId]
    );

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM reviews WHERE product_id = ?`,
      [productId]
    );

    res.json({
      success: true,
      data: {
        reviews,
        statistics: stats[0] || {},
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== ADD OR UPDATE REVIEW =====
exports.addOrUpdateReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, review_text } = req.body;
    const user_id = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if product exists
    const [product] = await db.query(`SELECT id FROM product WHERE id = ?`, [
      productId,
    ]);

    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user has purchased this product (verified_purchase)
    const [purchase] = await db.query(
      `SELECT oi.id FROM order_items oi
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE oi.product_id = ? AND o.user_id = ?
       LIMIT 1`,
      [productId, user_id]
    );

    const verified_purchase = purchase.length > 0;

    // Check if review already exists
    const [existing] = await db.query(
      `SELECT id FROM reviews WHERE product_id = ? AND user_id = ?`,
      [productId, user_id]
    );

    let reviewId;

    if (existing.length > 0) {
      // Update existing review
      await db.query(
        `UPDATE reviews 
         SET rating = ?, title = ?, review_text = ?, updated_at = NOW()
         WHERE product_id = ? AND user_id = ?`,
        [rating, title, review_text, productId, user_id]
      );
      reviewId = existing[0].id;
    } else {
      // Create new review
      const [result] = await db.query(
        `INSERT INTO reviews (product_id, user_id, rating, title, review_text, verified_purchase, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [productId, user_id, rating, title, review_text, verified_purchase]
      );
      reviewId = result.insertId;
    }

    // Update product's average rating
    const [avgResult] = await db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
       FROM reviews WHERE product_id = ?`,
      [productId]
    );

    await db.query(
      `UPDATE product 
       SET avg_rating = ?, review_count = ?
       WHERE id = ?`,
      [
        avgResult[0].avg_rating || 0,
        avgResult[0].review_count,
        productId,
      ]
    );

    res.json({
      success: true,
      message: existing.length > 0 ? "Review updated" : "Review added",
      data: { reviewId },
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== DELETE REVIEW =====
exports.deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const user_id = req.user.id;

    // Check if review exists and user is owner
    const [review] = await db.query(
      `SELECT id FROM reviews WHERE id = ? AND product_id = ? AND user_id = ?`,
      [reviewId, productId, user_id]
    );

    if (review.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Delete review
    await db.query(
      `DELETE FROM reviews WHERE id = ? AND product_id = ? AND user_id = ?`,
      [reviewId, productId, user_id]
    );

    // Update product rating
    const [avgResult] = await db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
       FROM reviews WHERE product_id = ?`,
      [productId]
    );

    await db.query(
      `UPDATE product 
       SET avg_rating = ?, review_count = ?
       WHERE id = ?`,
      [
        avgResult[0].avg_rating || 0,
        avgResult[0].review_count || 0,
        productId,
      ]
    );

    res.json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== MARK REVIEW AS HELPFUL =====
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const [result] = await db.query(
      `UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?`,
      [reviewId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review marked as helpful",
    });
  } catch (error) {
    console.error("Error marking helpful:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
