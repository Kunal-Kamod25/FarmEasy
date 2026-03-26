// =====================================================
// VendorReviews.jsx
// =====================================================
// Display vendor reviews and rating summary
// Shows communication, delivery, and quality ratings
// =====================================================

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, Trash2, Edit2, Loader } from "lucide-react";
import { API_URL } from "../../config";

const VendorReviews = ({ vendorId }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchReviews();
  }, [vendorId, page, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/reviews/vendor/${vendorId}`,
        {
          params: {
            limit: 10,
            page: page,
            sort: sortBy,
          },
        }
      );

      setReviews(response.data.reviews);
      setSummary(response.data.summary);
      setTotalPages(Math.ceil(response.data.pagination.total / 10));
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/reviews/vendor/review/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* RATING SUMMARY */}
      {summary && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Vendor Ratings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* OVERALL RATING */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-600">
                  {summary.average_rating.toFixed(1)}
                </div>
                <div className="flex justify-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(summary.average_rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm">
                  {summary.total_reviews} reviews
                </p>
              </div>
            </div>

            {/* SUBCATEGORY RATINGS */}
            <div className="space-y-4">
              {/* COMMUNICATION */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">Communication</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {summary.average_communication_rating?.toFixed(1) || "N/A"}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <
                        Math.round(
                          summary.average_communication_rating || 0
                        )
                          ? "fill-blue-400 text-blue-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* DELIVERY */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">Delivery</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {summary.average_delivery_rating?.toFixed(1) || "N/A"}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <
                        Math.round(summary.average_delivery_rating || 0)
                          ? "fill-orange-400 text-orange-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* QUALITY */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">Quality</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {summary.average_quality_rating?.toFixed(1) || "N/A"}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <
                        Math.round(summary.average_quality_rating || 0)
                          ? "fill-green-400 text-green-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SORT OPTIONS */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No reviews yet. Be the first to review this vendor!
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-600"
            >
              {/* REVIEW HEADER */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg">
                    {review.customer_name || "Anonymous"}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    {review.verified_buyer && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* OVERALL RATING */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Overall Rating</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* SUBCATEGORY RATINGS */}
              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Communication</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.communication_rating
                            ? "fill-blue-400 text-blue-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Delivery</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.delivery_rating
                            ? "fill-orange-400 text-orange-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Quality</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.quality_rating
                            ? "fill-green-400 text-green-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* COMMENT */}
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* ACTIONS */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button className="text-gray-600 hover:text-emerald-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(Math.max(1, page - 1))}
            className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 border rounded-md ${
                page === i + 1
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorReviews;
