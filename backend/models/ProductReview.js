// =====================================================
// ProductReview Model
// =====================================================
// Handle product reviews and ratings
// =====================================================

const db = require("../config/db");

class ProductReview {
  // CREATE A REVIEW
  static async create(reviewData) {
    const {
      product_id,
      user_id,
      vendor_id,
      rating,
      title,
      comment,
      verified_purchase,
    } = reviewData;

    try {
      const query = `
        INSERT INTO product_reviews 
        (product_id, user_id, vendor_id, rating, title, comment, verified_purchase)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await db.promise().query(query, [
        product_id,
        user_id,
        vendor_id,
        rating,
        title,
        comment,
        verified_purchase || false,
      ]);

      return result[0].insertId;
    } catch (err) {
      throw new Error(`Failed to create review: ${err.message}`);
    }
  }

  // GET REVIEWS FOR A PRODUCT
  static async getByProduct(productId, limit = 10, offset = 0) {
    try {
      const query = `
        SELECT pr.*, 
               u.fullname as reviewer_name,
               COUNT(hrv.id) as helpfulness_count
        FROM product_reviews pr
        LEFT JOIN users u ON pr.user_id = u.id
        LEFT JOIN helpful_review_votes hrv ON pr.id = hrv.review_id AND hrv.helpful = true
        WHERE pr.product_id = ?
        GROUP BY pr.id
        ORDER BY pr.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [reviews] = await db.promise().query(query, [productId, limit, offset]);

      // Get images for each review
      for (let review of reviews) {
        const [images] = await db
          .promise()
          .query("SELECT image_url FROM review_images WHERE review_id = ?", [
            review.id,
          ]);
        review.images = images.map((img) => img.image_url);
      }

      return reviews;
    } catch (err) {
      throw new Error(`Failed to get product reviews: ${err.message}`);
    }
  }

  // GET SINGLE REVIEW
  static async getById(reviewId) {
    try {
      const query = `
        SELECT pr.*, 
               u.fullname as reviewer_name,
               COUNT(hrv.id) as helpfulness_count
        FROM product_reviews pr
        LEFT JOIN users u ON pr.user_id = u.id
        LEFT JOIN helpful_review_votes hrv ON pr.id = hrv.review_id AND hrv.helpful = true
        WHERE pr.id = ?
        GROUP BY pr.id
      `;

      const [review] = await db.promise().query(query, [reviewId]);

      if (review.length === 0) {
        return null;
      }

      // Get images
      const [images] = await db
        .promise()
        .query("SELECT image_url FROM review_images WHERE review_id = ?", [
          reviewId,
        ]);

      review[0].images = images.map((img) => img.image_url);
      return review[0];
    } catch (err) {
      throw new Error(`Failed to get review: ${err.message}`);
    }
  }

  // GET REVIEWS FOR A VENDOR
  static async getByVendor(vendorId, limit = 10, offset = 0) {
    try {
      const query = `
        SELECT pr.*, p.name as product_name,
               u.fullname as reviewer_name
        FROM product_reviews pr
        JOIN products p ON pr.product_id = p.id
        LEFT JOIN users u ON pr.user_id = u.id
        WHERE pr.vendor_id = ?
        ORDER BY pr.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [reviews] = await db.promise().query(query, [vendorId, limit, offset]);
      return reviews;
    } catch (err) {
      throw new Error(`Failed to get vendor reviews: ${err.message}`);
    }
  }

  // UPDATE REVIEW
  static async update(reviewId, reviewData) {
    const { rating, title, comment } = reviewData;

    try {
      const query = `
        UPDATE product_reviews
        SET rating = ?, title = ?, comment = ?
        WHERE id = ?
      `;

      await db.promise().query(query, [rating, title, comment, reviewId]);
      return true;
    } catch (err) {
      throw new Error(`Failed to update review: ${err.message}`);
    }
  }

  // DELETE REVIEW
  static async delete(reviewId) {
    try {
      const query = "DELETE FROM product_reviews WHERE id = ?";
      await db.promise().query(query, [reviewId]);
      return true;
    } catch (err) {
      throw new Error(`Failed to delete review: ${err.message}`);
    }
  }

  // ADD HELPFUL VOTE
  static async addHelpfulVote(reviewId, userId, helpful = true) {
    try {
      const query = `
        INSERT INTO helpful_review_votes (review_id, user_id, helpful)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE helpful = ?, updated_at = CURRENT_TIMESTAMP
      `;

      await db.promise().query(query, [reviewId, userId, helpful, helpful]);

      // Update helpfulness count
      await this.updateHelpfulnessCount(reviewId);

      return true;
    } catch (err) {
      throw new Error(`Failed to add helpful vote: ${err.message}`);
    }
  }

  // UPDATE HELPFULNESS COUNT
  static async updateHelpfulnessCount(reviewId) {
    try {
      const query = `
        UPDATE product_reviews
        SET helpfulness_count = (
          SELECT COUNT(*) FROM helpful_review_votes 
          WHERE review_id = ? AND helpful = true
        )
        WHERE id = ?
      `;

      await db.promise().query(query, [reviewId, reviewId]);
    } catch (err) {
      throw new Error(`Failed to update helpfulness: ${err.message}`);
    }
  }

  // GET RATING SUMMARY FOR PRODUCT
  static async getRatingSummary(productId) {
    try {
      const query = `
        SELECT 
          product_id,
          average_rating,
          total_reviews,
          five_star,
          four_star,
          three_star,
          two_star,
          one_star
        FROM product_rating_summary
        WHERE product_id = ?
      `;

      const [summary] = await db.promise().query(query, [productId]);

      if (summary.length === 0) {
        return {
          product_id: productId,
          average_rating: 0,
          total_reviews: 0,
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0,
        };
      }

      return summary[0];
    } catch (err) {
      throw new Error(`Failed to get rating summary: ${err.message}`);
    }
  }

  // RECALCULATE RATING SUMMARY
  static async recalculateRatingSummary(productId) {
    try {
      const query = `
        INSERT INTO product_rating_summary 
        (product_id, average_rating, total_reviews, five_star, four_star, three_star, two_star, one_star)
        SELECT
          product_id,
          ROUND(AVG(rating), 2),
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
          updated_at = CURRENT_TIMESTAMP
      `;

      await db.promise().query(query, [productId]);
      return true;
    } catch (err) {
      throw new Error(`Failed to recalculate summary: ${err.message}`);
    }
  }

  // CHECK IF USER CAN REVIEW (has purchased product)
  static async canUserReview(userId, productId) {
    try {
      const query = `
        SELECT 1 FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'completed'
        LIMIT 1
      `;

      const [result] = await db.promise().query(query, [userId, productId]);
      return result.length > 0;
    } catch (err) {
      throw new Error(`Failed to check review eligibility: ${err.message}`);
    }
  }

  // CHECK IF USER ALREADY REVIEWED
  static async hasUserReviewed(userId, productId) {
    try {
      const query = `
        SELECT 1 FROM product_reviews
        WHERE user_id = ? AND product_id = ?
        LIMIT 1
      `;

      const [result] = await db.promise().query(query, [userId, productId]);
      return result.length > 0;
    } catch (err) {
      throw new Error(`Failed to check review status: ${err.message}`);
    }
  }
}

module.exports = ProductReview;
