// =====================================================
// DELIVERY REVIEW COMPONENT
// =====================================================
// Customers rate drivers and delivery experience
// Appears after delivery is marked complete
// Sends ratings to backend to update driver profile
// =====================================================

import React, { useState } from "react";
import axios from "axios";
import { Star, Truck, Calendar, Wind } from "lucide-react";

const DeliveryReview = ({ deliveryId, driverId, driverName, onClose }) => {
  const [overallRating, setOverallRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [professionalismRating, setProfessionalismRating] = useState(5);
  const [productCareRating, setProductCareRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Submit review
  const submitReview = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/review`,
        {
          delivery_id: deliveryId,
          driver_id: driverId,
          rating: overallRating,
          comment,
          punctuality_rating: punctualityRating,
          professionalism_rating: professionalismRating,
          product_care_rating: productCareRating
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Review submission error:", err);
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // Star rating component
  const StarRating = ({ rating, onRate, onHover, onLeave }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          className="transition transform hover:scale-110"
        >
          <Star
            size={28}
            className={
              star <= (hoveredStar || rating)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-sm w-full p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h2>
          <p className="text-gray-600">Your review helps us improve delivery quality</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Rate Your Delivery with {driverName}
        </h2>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-600 p-3 mb-4 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Overall Rating
            </label>
            <StarRating
              rating={overallRating}
              onRate={setOverallRating}
              onHover={setHoveredStar}
              onLeave={() => setHoveredStar(0)}
            />
            <p className="text-sm text-gray-600 mt-2">
              {overallRating === 5 && "Excellent! Perfect delivery experience"}
              {overallRating === 4 && "Great! Very good delivery"}
              {overallRating === 3 && "Good! Delivery was satisfactory"}
              {overallRating === 2 && "Fair. Some issues with delivery"}
              {overallRating === 1 && "Poor. Multiple issues occurred"}
            </p>
          </div>

          <hr />

          {/* Specific Ratings */}
          <div className="space-y-4">
            {/* Punctuality */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <Calendar size={18} className="text-blue-600" />
                Punctuality - Was the driver on time?
              </label>
              <div className="flex gap-1 ml-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setPunctualityRating(star)}
                    className="transition"
                  >
                    <Star
                      size={20}
                      className={
                        star <= punctualityRating
                          ? "fill-blue-400 text-blue-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Professionalism */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <Truck size={18} className="text-emerald-600" />
                Professionalism - Behavior & communication
              </label>
              <div className="flex gap-1 ml-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setProfessionalismRating(star)}
                    className="transition"
                  >
                    <Star
                      size={20}
                      className={
                        star <= professionalismRating
                          ? "fill-emerald-400 text-emerald-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Care */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <Wind size={18} className="text-amber-600" />
                Product Care - Handled order carefully?
              </label>
              <div className="flex gap-1 ml-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setProductCareRating(star)}
                    className="transition"
                  >
                    <Star
                      size={20}
                      className={
                        star <= productCareRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr />

          {/* Comment */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience... (e.g., 'Great driver!', 'Took a long route')"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              disabled={submitting}
            >
              Skip Review
            </button>
            <button
              onClick={submitReview}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Star size={18} />
                  Submit Review ({overallRating} ★)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryReview;
