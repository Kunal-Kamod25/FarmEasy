// =====================================================
// Vendor Review Controller
// =====================================================
// Handle vendor/shop review operations
// =====================================================

const VendorReview = require("../models/VendorReview");

// CREATE A VENDOR REVIEW
exports.createVendorReview = async (req, res) => {
  try {
    const {
      vendor_id,
      rating,
      comment,
      categories,
      communication_rating,
      delivery_rating,
      quality_rating,
    } = req.body;
    const customer_id = req.user.id;

    // Validate input
    if (!vendor_id || !rating) {
      return res.status(400).json({ error: "vendor_id and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if user can review vendor
    const canReview = await VendorReview.canUserReview(customer_id, vendor_id);
    if (!canReview) {
      return res
        .status(403)
        .json({
          error: "You can only review vendors you have purchased from",
        });
    }

    // Check if user already reviewed
    const hasReviewed = await VendorReview.hasUserReviewed(customer_id, vendor_id);
    if (hasReviewed) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this vendor" });
    }

    const reviewId = await VendorReview.create({
      vendor_id,
      customer_id,
      rating,
      comment,
      categories: categories || "",
      communication_rating: communication_rating || rating,
      delivery_rating: delivery_rating || rating,
      quality_rating: quality_rating || rating,
      verified_buyer: true,
    });

    res.status(201).json({
      message: "Vendor review created successfully",
      review_id: reviewId,
    });
  } catch (err) {
    console.error("Error creating vendor review:", err);
    res
      .status(500)
      .json({
        error: "Failed to create vendor review: " + err.message,
      });
  }
};

// GET VENDOR REVIEWS
exports.getVendorReviews = async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await VendorReview.getByVendor(
      vendor_id,
      parseInt(limit),
      offset
    );

    // Get rating summary
    const summary = await VendorReview.getRatingSummary(vendor_id);

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
    console.error("Error fetching vendor reviews:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch reviews: " + err.message });
  }
};

// GET SINGLE VENDOR REVIEW
exports.getReviewById = async (req, res) => {
  try {
    const { review_id } = req.params;

    const review = await VendorReview.getById(review_id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(review);
  } catch (err) {
    console.error("Error fetching review:", err);
    res.status(500).json({ error: "Failed to fetch review: " + err.message });
  }
};

// UPDATE VENDOR REVIEW
exports.updateVendorReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const {
      rating,
      comment,
      categories,
      communication_rating,
      delivery_rating,
      quality_rating,
    } = req.body;
    const user_id = req.user.id;

    // Get review to verify ownership
    const review = await VendorReview.getById(review_id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.customer_id !== user_id) {
      return res
        .status(403)
        .json({ error: "You can only edit your own reviews" });
    }

    await VendorReview.update(review_id, {
      rating,
      comment,
      categories,
      communication_rating: communication_rating || rating,
      delivery_rating: delivery_rating || rating,
      quality_rating: quality_rating || rating,
    });

    res.json({ message: "Review updated successfully" });
  } catch (err) {
    console.error("Error updating review:", err);
    res
      .status(500)
      .json({ error: "Failed to update review: " + err.message });
  }
};

// DELETE VENDOR REVIEW
exports.deleteVendorReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const user_id = req.user.id;

    // Get review to verify ownership
    const review = await VendorReview.getById(review_id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.customer_id !== user_id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "You can only delete your own reviews" });
    }

    await VendorReview.delete(review_id);

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res
      .status(500)
      .json({ error: "Failed to delete review: " + err.message });
  }
};

// GET VENDOR RATING SUMMARY
exports.getVendorRatingSummary = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    const summary = await VendorReview.getRatingSummary(vendor_id);

    res.json(summary);
  } catch (err) {
    console.error("Error fetching rating summary:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch summary: " + err.message });
  }
};

// GET TOP RATED VENDORS
exports.getTopRatedVendors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const vendors = await VendorReview.getTopRated(parseInt(limit));

    res.json({ vendors });
  } catch (err) {
    console.error("Error fetching top vendors:", err);
    res
      .status(500)
      .json({
        error: "Failed to fetch top vendors: " + err.message,
      });
  }
};
