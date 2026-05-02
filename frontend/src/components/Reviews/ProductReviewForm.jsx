// =====================================================
// ProductReviewForm.jsx
// =====================================================
// Form for customers to submit product reviews
// =====================================================

import React, { useState } from "react";
import axios from "axios";
import { Star, Send } from "lucide-react";
import { API_URL } from "../../config";

const ProductReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter a review comment");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/reviews/product`,
        {
          product_id: productId,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Review submitted successfully!");
      setRating(0);
      setComment("");

      if (onReviewSubmitted) {
        onReviewSubmitted(response.data.review_id);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Leave a Review</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* RATING */}
        <div>
          <label className="block font-medium mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {rating === 5 && "Excellent!"}
              {rating === 4 && "Good"}
              {rating === 3 && "Average"}
              {rating === 2 && "Poor"}
              {rating === 1 && "Very Poor"}
            </p>
          )}
        </div>

        {/* COMMENT */}
        <div>
          <label className="block font-medium mb-2">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="w-full px-4 py-2 border rounded-md h-24 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">{comment.length}/1000</p>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Submitting..." : "Submit Review"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Your review will be visible after approval by our team.
        </p>
      </form>
    </div>
  );
};

export default ProductReviewForm;
