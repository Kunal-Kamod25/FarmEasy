// =====================================================
// VendorReviewForm.jsx
// =====================================================
// Form for customers to review vendors/shops
// Includes overall rating + 3 subcategories
// =====================================================

import React, { useState } from "react";
import axios from "axios";
import { Star, Loader } from "lucide-react";
import { API_URL } from "../../config";

const VendorReviewForm = ({ vendorId, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
    communicationRating: 0,
    deliveryRating: 0,
    qualityRating: 0,
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.rating) {
      setError("Please select an overall rating");
      return;
    }

    if (!formData.communicationRating) {
      setError("Please rate communication");
      return;
    }

    if (!formData.deliveryRating) {
      setError("Please rate delivery");
      return;
    }

    if (!formData.qualityRating) {
      setError("Please rate quality");
      return;
    }

    if (!formData.comment.trim() || formData.comment.length < 10) {
      setError("Please write a comment (at least 10 characters)");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to submit a review");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/reviews/vendor`,
        {
          vendor_id: vendorId,
          rating: formData.rating,
          comment: formData.comment,
          communication_rating: formData.communicationRating,
          delivery_rating: formData.deliveryRating,
          quality_rating: formData.qualityRating,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Review submitted successfully!");
      setFormData({
        rating: 0,
        comment: "",
        communicationRating: 0,
        deliveryRating: 0,
        qualityRating: 0,
      });

      if (onReviewSubmitted) {
        onReviewSubmitted(response.data.review);
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (currentRating, hovered, onChange, onHover) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={() => onHover(0)}
          className="focus:outline-none transition"
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hovered || currentRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-6">Rate This Vendor</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OVERALL RATING */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Overall Rating *
          </label>
          {renderStarRating(
            formData.rating,
            hoveredRating,
            (rating) => setFormData({ ...formData, rating }),
            setHoveredRating
          )}
          {formData.rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                formData.rating
              ]}
            </p>
          )}
        </div>

        {/* CATEGORY RATINGS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COMMUNICATION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Communication Rating *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, communicationRating: star })
                  }
                  onMouseEnter={() => setHoveredCategory("communication")}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="focus:outline-none transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= formData.communicationRating
                        ? "fill-blue-400 text-blue-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* DELIVERY */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Delivery Rating *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, deliveryRating: star })
                  }
                  onMouseEnter={() => setHoveredCategory("delivery")}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="focus:outline-none transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= formData.deliveryRating
                        ? "fill-orange-400 text-orange-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* QUALITY */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Quality Rating *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, qualityRating: star })
                  }
                  onMouseEnter={() => setHoveredCategory("quality")}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="focus:outline-none transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= formData.qualityRating
                        ? "fill-green-400 text-green-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COMMENT */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-semibold text-gray-700 mb-3"
          >
            Your Review *
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={(e) =>
              setFormData({ ...formData, comment: e.target.value })
            }
            placeholder="Share your experience with this vendor..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows="5"
            maxLength="1000"
          />
          <p className="text-xs text-gray-500 mt-2">
            {formData.comment.length}/1000 characters
          </p>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  );
};

export default VendorReviewForm;
