// =====================================================
// Product Review Controller
// =====================================================
// Handle product review CRUD operations
// =====================================================

const ProductReview = require("../models/ProductReview");

// CREATE A PRODUCT REVIEW
exports.createProductReview = async (req, res) => {
  try {
    const { product_id, rating, title, comment } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!product_id || !rating || !comment) {
      return res.status(400).json({
        error: "product_id, rating, and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if user can review (purchased product)
    const canReview = await ProductReview.canUserReview(user_id, product_id);
    if (!canReview) {
      return res
        .status(403)
        .json({
          error: "You can only review products you have purchased",
        });
    }

    // Check if user already reviewed
    const hasReviewed = await ProductReview.hasUserReviewed(user_id, product_id);
    if (hasReviewed) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });
    }

    // Get product to find vendor
    const [product] = await req.app
      .get("db")
      .promise()
      .query("SELECT vendor_id FROM products WHERE id = ?", [product_id]);

    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const reviewId = await ProductReview.create({
      product_id,
      user_id,
      vendor_id: product[0].vendor_id,
      rating,
      title: title || "",
      comment,
      verified_purchase: true,
    });

    // Recalculate product rating summary
    await ProductReview.recalculateRatingSummary(product_id);

    res.status(201).json({
      message: "Review created successfully",
      review_id: reviewId,
    });
  } catch (err) {
    console.error("Error creating review:", err);
    res
      .status(500)
      .json({ error: "Failed to create review: " + err.message });
  }
};

// GET PRODUCT REVIEWS
exports.getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await ProductReview.getByProduct(
      product_id,
      parseInt(limit),
      offset
    );

    // Get rating summary
    const summary = await ProductReview.getRatingSummary(product_id);

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

// GET SINGLE REVIEW
exports.getReviewById = async (req, res) => {
  try {
    const { review_id } = req.params;

    const review = await ProductReview.getById(review_id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(review);
  } catch (err) {
    console.error("Error fetching review:", err);
    res.status(500).json({ error: "Failed to fetch review: " + err.message });
  }
};

// UPDATE REVIEW
exports.updateProductReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { rating, title, comment } = req.body;
    const user_id = req.user.id;

    // Get review to verify ownership
    const review = await ProductReview.getById(review_id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "You can only edit your own reviews" });
    }

    await ProductReview.update(review_id, { rating, title, comment });

    // Recalculate rating
    await ProductReview.recalculateRatingSummary(review.product_id);

    res.json({ message: "Review updated successfully" });
  } catch (err) {
    console.error("Error updating review:", err);
    res
      .status(500)
      .json({ error: "Failed to update review: " + err.message });
  }
};

// DELETE REVIEW
exports.deleteProductReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const user_id = req.user.id;

    // Get review to verify ownership
    const review = await ProductReview.getById(review_id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.user_id !== user_id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "You can only delete your own reviews" });
    }

    await ProductReview.delete(review_id);

    // Recalculate rating
    await ProductReview.recalculateRatingSummary(review.product_id);

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res
      .status(500)
      .json({ error: "Failed to delete review: " + err.message });
  }
};

// MARK REVIEW AS HELPFUL
exports.markHelpful = async (req, res) => {
  try {
    const { review_id } = req.params;
    const user_id = req.user.id;
    const { helpful = true } = req.body;

    await ProductReview.addHelpfulVote(review_id, user_id, helpful);

    res.json({ message: "Vote recorded successfully" });
  } catch (err) {
    console.error("Error marking helpful:", err);
    res
      .status(500)
      .json({ error: "Failed to record vote: " + err.message });
  }
};

// GET VENDOR REVIEWS
exports.getVendorProductReviews = async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await ProductReview.getByVendor(
      vendor_id,
      parseInt(limit),
      offset
    );

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Error fetching vendor reviews:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch reviews: " + err.message });
  }
};

// GET PRODUCT RATING SUMMARY
exports.getProductRatingSummary = async (req, res) => {
  try {
    const { product_id } = req.params;

    const summary = await ProductReview.getRatingSummary(product_id);

    res.json(summary);
  } catch (err) {
    console.error("Error fetching rating summary:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch summary: " + err.message });
  }
};
