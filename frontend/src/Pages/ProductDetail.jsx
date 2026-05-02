import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { Star, Heart, Share2, MessageCircle, Loader, AlertCircle, ChevronDown } from "lucide-react";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ===== STATE =====
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitingReview, setSubmittingReview] = useState(false);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("newest");
  const [reviewStats, setReviewStats] = useState(null);

  // Cart
  const [cartQuantity, setCartQuantity] = useState(1);

  // ===== FETCH PRODUCT DETAILS =====
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        // Fetch product
        const prodRes = await axios.get(`${API_URL}/api/products/${productId}`);
        setProduct(prodRes.data);

        // Fetch reviews (separate try-catch so reviews not loading doesn't break product load)
        try {
          const reviewRes = await axios.get(
            `${API_URL}/api/reviews/product/${productId}?page=1&limit=${reviewsPerPage}&sortBy=${sortBy}`
          );
          if (reviewRes.data?.reviews) {
            setReviews(reviewRes.data.reviews);
            setReviewStats(reviewRes.data.summary);
          } else if (reviewRes.data?.data?.reviews) {
            setReviews(reviewRes.data.data.reviews);
            setReviewStats(reviewRes.data.data.statistics);
          }
        } catch (reviewErr) {
          console.warn("Could not load reviews:", reviewErr.message);
          // Don't fail product load if reviews fail
          setReviews([]);
          setReviewStats(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.error || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, reviewsPerPage, sortBy]);

  // ===== FETCH REVIEWS WITH SORTING =====
  const handleReviewSort = async (newSort) => {
    setSortBy(newSort);
    try {
      const res = await axios.get(
        `${API_URL}/api/reviews/product/${productId}?page=1&limit=${reviewsPerPage}&sortBy=${newSort}`
      );
      if (res.data?.reviews) {
        setReviews(res.data.reviews);
        setCurrentPage(1);
      } else if (res.data?.data?.reviews) {
        setReviews(res.data.data.reviews);
        setCurrentPage(1);
      }
    } catch (err) {
      console.warn("Error fetching reviews:", err);
      // Don't fail, just show warning
    }
  };

  // ===== SUBMIT REVIEW =====
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!userRating || !reviewText.trim()) {
      setError("Please provide rating and review text");
      return;
    }

    try {
      setSubmittingReview(true);
      await axios.post(
        `${API_URL}/api/reviews/product`,
        {
          product_id: productId,
          rating: userRating,
          comment: reviewText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh reviews
      try {
        const reviewRes = await axios.get(
          `${API_URL}/api/reviews/product/${productId}?page=1&limit=${reviewsPerPage}&sortBy=newest`
        );
        if (reviewRes.data?.reviews) {
          setReviews(reviewRes.data.reviews);
          setReviewStats(reviewRes.data.summary);
        } else if (reviewRes.data?.data?.reviews) {
          setReviews(reviewRes.data.data.reviews);
          setReviewStats(reviewRes.data.data.statistics);
        }
      } catch (err) {
        console.warn("Could not refresh reviews:", err.message);
      }

      // Reset form
      setUserRating(0);
      setReviewText("");
      setShowReviewForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ===== MARK REVIEW HELPFUL =====
  const handleMarkHelpful = async (reviewId) => {
    try {
      await axios.post(`${API_URL}/api/reviews/${reviewId}/helpful`);
      
      // Update local review helpful count
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r
        )
      );
    } catch (err) {
      console.error("Error marking helpful:", err);
    }
  };

  // ===== ADD TO CART =====
  const handleAddToCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/cart`,
        { product_id: productId, quantity: cartQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart!");
    } catch {
      setError("Failed to add to cart");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <button
            onClick={() => navigate("/products")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const avgRating = (product.avg_rating || 0).toFixed(1);
  const reviewCount = product.review_count || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* PRODUCT INFO SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-white p-8 rounded-lg shadow">
          {/* LEFT: PRODUCT IMAGE */}
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-96 object-contain"
            />
          </div>

          {/* RIGHT: PRODUCT DETAILS */}
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-700">
                {avgRating} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            {product.brand_name && (
              <p className="text-sm text-gray-600 mb-2">
                Brand: <span className="font-semibold">{product.brand_name}</span>
              </p>
            )}

            <div className="text-3xl font-bold text-emerald-600 mb-4">
              ₹{product.price}
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Stock Status:
              </p>
              {product.stock_quantity > 0 ? (
                <p className="text-green-600 font-semibold">
                  ✅ In Stock ({product.stock_quantity} available)
                </p>
              ) : (
                <p className="text-red-600 font-semibold">❌ Out of Stock</p>
              )}
            </div>

            {/* QUANTITY & ADD TO CART */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex border border-gray-300 rounded">
                <button
                  onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  value={cartQuantity}
                  onChange={(e) =>
                    setCartQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 text-center border-l border-r border-gray-300"
                />
                <button
                  onClick={() => setCartQuantity(cartQuantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="col-span-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
              >
                🛒 Add to Cart
              </button>
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition">
                <Heart size={20} />
                <span>Save</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* REVIEWS & RATINGS SECTION */}
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Reviews & Ratings
          </h2>

          {/* RATING SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 pb-8 border-b">
            {/* LEFT: AVERAGE RATING */}
            <div className="flex flex-col items-center justify-center bg-emerald-50 p-6 rounded-lg">
              <div className="text-5xl font-bold text-emerald-600 mb-2">
                {avgRating}
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={
                      i < Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <p className="text-gray-600 font-semibold">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* CENTER & RIGHT: RATING DISTRIBUTION */}
            <div className="md:col-span-2 space-y-3">
              {reviewStats && [5, 4, 3, 2, 1].map((stars) => {
                const count =
                  reviewStats[`${stars}_star`] || 0;
                const percentage =
                  reviewCount > 0
                    ? Math.round((count / reviewCount) * 100)
                    : 0;

                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-12 text-right font-semibold">
                      {stars}⭐
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right text-gray-600 text-sm">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WRITE REVIEW SECTION */}
          {token && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="mb-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded flex items-center gap-2"
            >
              ✍️ Write a Review
            </button>
          )}

          {/* REVIEW FORM */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-12 p-6 bg-gray-50 rounded-lg border-2 border-blue-200"
            >
              <h3 className="text-2xl font-bold mb-4">Share Your Opinion</h3>

              {/* RATING SELECTOR */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Your Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        size={40}
                        className={
                          star <= userRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    You selected {userRating} stars
                  </p>
                )}
              </div>

              {/* REVIEW TEXT */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Your Review * ({reviewText.length}/500)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(e.target.value.slice(0, 500))
                  }
                  placeholder="Share details about your experience with this product..."
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitingReview}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded"
                >
                  {submitingReview ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setUserRating(0);
                    setReviewTitle("");
                    setReviewText("");
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* SORT & FILTER REVIEWS */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              Customer Reviews ({reviewCount})
            </h3>
            <select
              value={sortBy}
              onChange={(e) => handleReviewSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="newest">Newest First</option>
              <option value="rating-high">Highest Rated</option>
              <option value="rating-low">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          {/* REVIEWS LIST */}
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  {/* USER & RATING */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {review.profile_pic ? (
                        <img
                          src={review.profile_pic}
                          alt={review.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                          {review.full_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {review.verified_purchase && (
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                        ✅ Verified Purchase
                      </span>
                    )}
                  </div>

                  {/* RATING STARS */}
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>

                  {/* TEXT */}
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {review.comment || review.review_text}
                  </p>

                  {/* HELPFUL BUTTON */}
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    👍 Helpful ({review.helpful_count})
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-8">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>

          {/* PAGINATION */}
          {reviewCount > reviewsPerPage && (
            <div className="mt-8 flex justify-center gap-2">
              {[...Array(Math.ceil(reviewCount / reviewsPerPage))].map(
                (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded font-semibold ${
                      currentPage === i + 1
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
