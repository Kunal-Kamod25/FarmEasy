// =====================================================
// ProductReviews.jsx
// =====================================================
// Display product reviews and rating summary
// =====================================================

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, ThumbsUp, Trash2, Edit2, Loader } from "lucide-react";
import { API_URL } from "../../config";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchReviews();
  }, [productId, page, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/reviews/product/${productId}`,
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

  const handleHelpful = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/reviews/product/review/${reviewId}/helpful`,
        { helpful: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchReviews();
    } catch (err) {
      console.error("Error marking helpful:", err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/reviews/product/review/${reviewId}`,
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
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AVERAGE RATING */}
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

              {/* RATING DISTRIBUTION */}
              <div className="flex-1 space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-12">{stars} ⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{
                          width: `${
                            summary.total_reviews > 0
                              ? (
                                  (summary[
                                    `${stars === 5 ? "five" : stars === 4 ? "four" : stars === 3 ? "three" : stars === 2 ? "two" : "one"}_star`
                                  ] / summary.total_reviews) *
                                  100
                                ).toFixed(0)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      {summary[
                        `${stars === 5 ? "five" : stars === 4 ? "four" : stars === 3 ? "three" : stars === 2 ? "two" : "one"}_star`
                      ] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SORT OPTIONS */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Reviews</h3>
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
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No reviews yet. Be the first to review this product!
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
                  <h4 className="font-semibold text-lg">{review.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{review.reviewer_name}</span>
                    <span>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    {review.verified_purchase && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* RATING */}
              <div className="flex gap-1 mb-3">
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

              {/* COMMENT */}
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* IMAGES */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Review"
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}

              {/* HELPFUL & ACTIONS */}
              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpfulness_count || 0})</span>
                </button>

                <div className="flex gap-2">
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

export default ProductReviews;
