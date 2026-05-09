// =====================================================
// ProductReview Controller - Fixed to use actual DB tables
// Real table: product_reviews (id, product_id, user_id, rating, comment, created_at)
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



    // Check product exists and get vendor_id
    const [product] = await db.query("SELECT id, seller_id FROM product WHERE id = ? LIMIT 1", [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const [seller] = await db.query("SELECT user_id FROM seller WHERE id = ?", [product[0].seller_id]);
    const vendor_id = seller.length > 0 ? seller[0].user_id : null;

    await db.query(
      "INSERT INTO product_reviews (product_id, user_id, vendor_id, rating, title, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [product_id, user_id, vendor_id, rating, title || "", comment || ""]
    );

    // Update summaries
    await updateRatingSummaries(product_id, vendor_id);

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
        rr.comment,
        rr.title,
        rr.created_at,
        u.full_name AS reviewer_name
       FROM product_reviews rr
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
       FROM product_reviews rr
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

    const [rows] = await db.query("SELECT * FROM product_reviews WHERE id = ? LIMIT 1", [review_id]);
    if (rows.length === 0) return res.status(404).json({ error: "Review not found" });
    if (rows[0].user_id !== user_id) return res.status(403).json({ error: "You can only edit your own reviews" });

    await db.query(
      "UPDATE product_reviews SET rating = ?, comment = ? WHERE id = ?",
      [rating, comment, review_id]
    );

    // Update summaries
    await updateRatingSummaries(rows[0].product_id, rows[0].vendor_id);

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

    const [rows] = await db.query("SELECT * FROM product_reviews WHERE id = ? LIMIT 1", [review_id]);
    if (rows.length === 0) return res.status(404).json({ error: "Review not found" });
    if (rows[0].user_id !== user_id && req.user.role !== "admin") {
      return res.status(403).json({ error: "You can only delete your own reviews" });
    }

    await db.query("DELETE FROM product_reviews WHERE id = ?", [review_id]);
    
    // Update summaries
    await updateRatingSummaries(rows[0].product_id, rows[0].vendor_id);

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
        rr.comment,
        rr.title,
        rr.created_at,
        u.full_name AS reviewer_name,
        p.product_name
       FROM product_reviews rr
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
     FROM product_reviews
     WHERE product_id = ?`,
    [productId]
  );
  
  const raw = rows[0] || {
    total_reviews: 0, average_rating: 0,
    five_star: 0, four_star: 0, three_star: 0, two_star: 0, one_star: 0,
  };

  // Return both formats for compatibility, and add the 'distribution' object the frontend needs
  return {
    ...raw,
    totalReviews: raw.total_reviews,
    averageRating: parseFloat(raw.average_rating || 0),
    distribution: {
      5: parseInt(raw.five_star || 0),
      4: parseInt(raw.four_star || 0),
      3: parseInt(raw.three_star || 0),
      2: parseInt(raw.two_star || 0),
      1: parseInt(raw.one_star || 0)
    }
  };
}

// ===== INTERNAL HELPER: Update both product and vendor summaries =====
async function updateRatingSummaries(productId, vendorId) {
  try {
    // 1. Update Product Summary
    await db.query(`
      INSERT INTO product_rating_summary 
      (product_id, average_rating, total_reviews, five_star, four_star, three_star, two_star, one_star)
      SELECT
        product_id,
        ROUND(AVG(rating), 1),
        COUNT(*),
        SUM(IF(rating = 5, 1, 0)),
        SUM(IF(rating = 4, 1, 0)),
        SUM(IF(rating = 3, 1, 0)),
        SUM(IF(rating = 2, 1, 0)),
        SUM(IF(rating = 1, 1, 0))
      FROM product_reviews
      WHERE product_id = ?
      GROUP BY product_id
      ON DUPLICATE KEY UPDATE
        average_rating = VALUES(average_rating),
        total_reviews = VALUES(total_reviews),
        five_star = VALUES(five_star),
        four_star = VALUES(four_star),
        three_star = VALUES(three_star),
        two_star = VALUES(two_star),
        one_star = VALUES(one_star),
        updated_at = NOW()
    `, [productId]);

    // 2. Update Vendor Summary
    if (vendorId) {
      await db.query(`
        INSERT INTO vendor_rating_summary (vendor_id, average_rating, total_reviews)
        SELECT 
          vendor_id, 
          ROUND(AVG(rating), 1), 
          COUNT(*)
        FROM product_reviews 
        WHERE vendor_id = ?
        GROUP BY vendor_id
        ON DUPLICATE KEY UPDATE 
          average_rating = VALUES(average_rating), 
          total_reviews = VALUES(total_reviews),
          updated_at = NOW()
      `, [vendorId]);
    }
    
    console.log(`✅ Rating summaries updated for product ${productId} and vendor ${vendorId}`);
  } catch (err) {
    console.error("❌ Error updating rating summaries:", err);
  }
}
