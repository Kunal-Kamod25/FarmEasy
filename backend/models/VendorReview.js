// =====================================================
// VendorReview Model
// =====================================================
// Handle vendor/shop reviews and ratings
// =====================================================

const db = require("../config/db");

class VendorReview {
  // CREATE A VENDOR REVIEW
  static async create(reviewData) {
    const {
      vendor_id,
      customer_id,
      rating,
      comment,
      categories,
      communication_rating,
      delivery_rating,
      quality_rating,
      verified_buyer,
    } = reviewData;

    try {
      const query = `
        INSERT INTO vendor_reviews 
        (vendor_id, customer_id, rating, comment, categories, 
         communication_rating, delivery_rating, quality_rating, verified_buyer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await db.promise().query(query, [
        vendor_id,
        customer_id,
        rating,
        comment,
        categories,
        communication_rating,
        delivery_rating,
        quality_rating,
        verified_buyer || false,
      ]);

      // Recalculate vendor rating summary
      await this.recalculateRatingSummary(vendor_id);

      return result[0].insertId;
    } catch (err) {
      throw new Error(`Failed to create vendor review: ${err.message}`);
    }
  }

  // GET REVIEWS FOR A VENDOR
  static async getByVendor(vendorId, limit = 10, offset = 0) {
    try {
      const query = `
        SELECT vr.*, 
               u.fullname as reviewer_name
        FROM vendor_reviews vr
        LEFT JOIN users u ON vr.customer_id = u.id
        WHERE vr.vendor_id = ?
        ORDER BY vr.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [reviews] = await db.promise().query(query, [vendorId, limit, offset]);
      return reviews;
    } catch (err) {
      throw new Error(`Failed to get vendor reviews: ${err.message}`);
    }
  }

  // GET SINGLE REVIEW
  static async getById(reviewId) {
    try {
      const query = `
        SELECT vr.*, 
               u.fullname as reviewer_name
        FROM vendor_reviews vr
        LEFT JOIN users u ON vr.customer_id = u.id
        WHERE vr.id = ?
      `;

      const [review] = await db.promise().query(query, [reviewId]);
      return review.length > 0 ? review[0] : null;
    } catch (err) {
      throw new Error(`Failed to get review: ${err.message}`);
    }
  }

  // UPDATE REVIEW
  static async update(reviewId, reviewData) {
    const {
      rating,
      comment,
      categories,
      communication_rating,
      delivery_rating,
      quality_rating,
    } = reviewData;

    try {
      const query = `
        UPDATE vendor_reviews
        SET rating = ?, comment = ?, categories = ?,
            communication_rating = ?, delivery_rating = ?, quality_rating = ?
        WHERE id = ?
      `;

      await db.promise().query(query, [
        rating,
        comment,
        categories,
        communication_rating,
        delivery_rating,
        quality_rating,
        reviewId,
      ]);

      // Get vendor_id to recalculate
      const [review] = await db
        .promise()
        .query("SELECT vendor_id FROM vendor_reviews WHERE id = ?", [reviewId]);

      if (review.length > 0) {
        await this.recalculateRatingSummary(review[0].vendor_id);
      }

      return true;
    } catch (err) {
      throw new Error(`Failed to update review: ${err.message}`);
    }
  }

  // DELETE REVIEW
  static async delete(reviewId) {
    try {
      // Get vendor_id before deletion
      const [review] = await db
        .promise()
        .query("SELECT vendor_id FROM vendor_reviews WHERE id = ?", [reviewId]);

      const query = "DELETE FROM vendor_reviews WHERE id = ?";
      await db.promise().query(query, [reviewId]);

      // Recalculate vendor rating
      if (review.length > 0) {
        await this.recalculateRatingSummary(review[0].vendor_id);
      }

      return true;
    } catch (err) {
      throw new Error(`Failed to delete review: ${err.message}`);
    }
  }

  // GET RATING SUMMARY FOR VENDOR
  static async getRatingSummary(vendorId) {
    try {
      const query = `
        SELECT 
          vendor_id,
          average_rating,
          total_reviews,
          average_communication,
          average_delivery,
          average_quality
        FROM vendor_rating_summary
        WHERE vendor_id = ?
      `;

      const [summary] = await db.promise().query(query, [vendorId]);

      if (summary.length === 0) {
        return {
          vendor_id: vendorId,
          average_rating: 0,
          total_reviews: 0,
          average_communication: 0,
          average_delivery: 0,
          average_quality: 0,
        };
      }

      return summary[0];
    } catch (err) {
      throw new Error(`Failed to get vendor rating summary: ${err.message}`);
    }
  }

  // RECALCULATE VENDOR RATING SUMMARY
  static async recalculateRatingSummary(vendorId) {
    try {
      const query = `
        INSERT INTO vendor_rating_summary 
        (vendor_id, average_rating, total_reviews, average_communication, average_delivery, average_quality)
        SELECT
          vendor_id,
          ROUND(AVG(rating), 2),
          COUNT(*),
          ROUND(AVG(communication_rating), 2),
          ROUND(AVG(delivery_rating), 2),
          ROUND(AVG(quality_rating), 2)
        FROM vendor_reviews
        WHERE vendor_id = ?
        GROUP BY vendor_id
        ON DUPLICATE KEY UPDATE
          average_rating = VALUES(average_rating),
          total_reviews = VALUES(total_reviews),
          average_communication = VALUES(average_communication),
          average_delivery = VALUES(average_delivery),
          average_quality = VALUES(average_quality),
          updated_at = CURRENT_TIMESTAMP
      `;

      await db.promise().query(query, [vendorId]);
      return true;
    } catch (err) {
      throw new Error(`Failed to recalculate vendor summary: ${err.message}`);
    }
  }

  // CHECK IF USER CAN REVIEW VENDOR (has made a purchase)
  static async canUserReview(userId, vendorId) {
    try {
      const query = `
        SELECT 1 FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ? AND p.vendor_id = ? AND o.status = 'completed'
        LIMIT 1
      `;

      const [result] = await db.promise().query(query, [userId, vendorId]);
      return result.length > 0;
    } catch (err) {
      throw new Error(`Failed to check vendor review eligibility: ${err.message}`);
    }
  }

  // CHECK IF USER ALREADY REVIEWED VENDOR
  static async hasUserReviewed(userId, vendorId) {
    try {
      const query = `
        SELECT 1 FROM vendor_reviews
        WHERE customer_id = ? AND vendor_id = ?
        LIMIT 1
      `;

      const [result] = await db.promise().query(query, [userId, vendorId]);
      return result.length > 0;
    } catch (err) {
      throw new Error(`Failed to check vendor review status: ${err.message}`);
    }
  }

  // GET TOP RATED VENDORS
  static async getTopRated(limit = 10) {
    try {
      const query = `
        SELECT v.*, vrs.average_rating, vrs.total_reviews
        FROM vendor_rating_summary vrs
        JOIN users v ON vrs.vendor_id = v.id
        WHERE v.role = 'vendor'
        ORDER BY vrs.average_rating DESC
        LIMIT ?
      `;

      const [vendors] = await db.promise().query(query, [limit]);
      return vendors;
    } catch (err) {
      throw new Error(`Failed to get top rated vendors: ${err.message}`);
    }
  }
}

module.exports = VendorReview;
