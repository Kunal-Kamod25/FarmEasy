// ===========================================================================
// ProductDetails.jsx - Single Product Detail Page
// ===========================================================================
//
// ROUTE: /product/:id
//
// FLOW:
// 1. Gets product ID from URL params (useParams)
// 2. Calls GET /api/products/:id which returns:
//    - All product fields (name, desc, price, quantity, product_image, etc.)
//    - Seller info (shop_name, seller_name, city, state)
//    - moreFromSeller array (up to 4 other products from same vendor)
// 3. Displays the product image if uploaded, or a placeholder icon
// 4. Shows price, stock status, quantity picker, add-to-cart button
// 5. Shows seller info card at the bottom
// 6. Shows "More from this seller" grid with thumbnails linking to those products
//
// CART & WISHLIST:
// - Uses CartContext and WishlistContext for add-to-cart and wishlist toggle
// - Both require login (checks token in localStorage)
// ===========================================================================

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_URL, getImageUrl } from '../config';
import {
  ArrowLeft, ShoppingCart, Heart, Store, Package,
  MapPin, Star, CheckCircle, AlertCircle, Truck,
  Shield, Plus, Minus, MessageSquare
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import LoginModal from "../components/Common/LoginModal";
import { useLanguage } from "../context/language/LanguageContext";

// single product detail page - shows everything about one product
// also shows other products from the same seller at the bottom
const ProductDetailPage = () => {
  const { productId: id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { t, td, language } = useLanguage();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("newest");

  const token = localStorage.getItem("token");

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/api/products/${id}`);
      console.log("✅ Product loaded:", res.data);
      setProduct(res.data);

      // Fetch reviews separately with safe fallback
      try {
        const reviewRes = await axios.get(
          `${API_URL}/api/reviews/product/${id}?page=1&limit=${reviewsPerPage}&sortBy=${sortBy}`
        );
        if (reviewRes.data?.data?.reviews) {
          setReviews(reviewRes.data.data.reviews);
          setReviewStats(reviewRes.data.data.statistics);
        }
      } catch (reviewErr) {
        console.warn("Could not load reviews:", reviewErr.message);
        setReviews([]);
        setReviewStats(null);
      }
    } catch (err) {
      console.error("❌ Failed to load product:", err.message, err.response?.status, err.response?.data);
      setError(err.response?.data?.message || t("product.notFoundDesc"));
    } finally {
      setLoading(false);
    }
  }, [id, t, reviewsPerPage, sortBy]);

  useEffect(() => {
    // scroll to top when navigating to a new product
    window.scrollTo(0, 0);
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!token) {
      setLoginMessage(t("common.loginForCart"));
      setShowLoginModal(true);
      return;
    }

    // we pass product and quantity separately
    await addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    if (!token) {
      setLoginMessage(t("common.loginForWishlist"));
      setShowLoginModal(true);
      return;
    }
    toggleWishlist(product);
  };
  
  const handleContactSeller = async () => {
    if (!token) {
      setLoginMessage("Please login to message the seller");
      setShowLoginModal(true);
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/messages/conversation/start`,
        { vendor_id: product.vendor_id, product_id: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        navigate(`/chat/${res.data.data.conversationId}`);
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError("Could not start conversation with seller");
    }
  };

  const incrementQty = () => {
    if (quantity < product.product_quantity) setQuantity(q => q + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  // Review handlers
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      setLoginMessage(t("common.loginForCart"));
      setShowLoginModal(true);
      return;
    }

    if (!userRating || !reviewText.trim()) {
      setError("Please provide rating and review text");
      return;
    }

    try {
      setSubmittingReview(true);
      await axios.post(
        `${API_URL}/api/reviews/product/${id}`,
        {
          rating: userRating,
          title: reviewTitle,
          review_text: reviewText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh reviews
      try {
        const reviewRes = await axios.get(
          `${API_URL}/api/reviews/product/${id}?page=1&limit=${reviewsPerPage}&sortBy=newest`
        );
        if (reviewRes.data?.data?.reviews) {
          setReviews(reviewRes.data.data.reviews);
          setReviewStats(reviewRes.data.data.statistics);
        }
      } catch (err) {
        console.warn("Could not refresh reviews:", err.message);
      }

      // Reset form
      setUserRating(0);
      setReviewTitle("");
      setReviewText("");
      setShowReviewForm(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewSort = async (newSort) => {
    setSortBy(newSort);
    try {
      const res = await axios.get(
        `${API_URL}/api/reviews/product/${id}?page=1&limit=${reviewsPerPage}&sortBy=${newSort}`
      );
      if (res.data?.data?.reviews) {
        setReviews(res.data.data.reviews);
      }
    } catch (err) {
      console.warn("Error fetching reviews:", err);
    }
  };

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            {/* Left Image */}
            <div className="lg:col-span-2 bg-white rounded-xl h-96 border border-slate-200" />
            
            {/* Right Info */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl h-64 border border-slate-200" />
              <div className="bg-white rounded-xl h-32 border border-slate-200" />
              <div className="bg-white rounded-xl h-24 border border-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl p-12 shadow-lg border border-slate-200 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t("product.notFound")}</h2>
          <p className="text-slate-600 text-sm mb-8">{error || t("product.notFoundDesc")}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const inStock = product.product_quantity > 0;
  const wishlisted = isWishlisted(product.id);
  const productName = product[`product_name_${language}`] || td(product.product_name || "");
  const productDescription = product[`product_description_${language}`] || td(product.product_description || "");
  const productType = td(product.product_type || "");
  const categoryName = td(product.category_name || "");
  const sellerName = product.shop_name || product.seller_name || t("product.unknownSeller");

  return (
    <>
    {showLoginModal && <LoginModal message={loginMessage} onClose={() => setShowLoginModal(false)} />}
    <div className="min-h-screen bg-slate-50">

      {/* ── BREADCRUMB NAV ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <button onClick={() => navigate("/")} className="text-emerald-600 hover:text-emerald-700 font-medium transition">FarmEasy</button>
          <span className="text-slate-300">/</span>
          <button onClick={() => navigate("/products")} className="text-slate-600 hover:text-slate-800 transition">{t("product.products")}</button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium truncate">{productName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── MAIN PRODUCT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* LEFT: PRODUCT IMAGE */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              
              {/* Image Container */}
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 aspect-square flex items-center justify-center overflow-hidden">
                
                {/* Wishlist & Category Badges */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <button
                    onClick={handleWishlist}
                    className={`p-3 rounded-full shadow-lg transition transform hover:scale-110 ${wishlisted
                      ? "bg-red-500 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart size={20} className={wishlisted ? "fill-white" : ""} />
                  </button>
                </div>

                {product.category_name && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    {categoryName}
                  </span>
                )}

                {/* Stock Badge */}
                <div className="absolute bottom-4 left-4">
                  {inStock ? (
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg shadow-md border border-emerald-100">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-700 font-bold text-sm">{t("product.inStock")} ({product.product_quantity})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg shadow-md border border-red-100">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-red-600 font-bold text-sm">{t("product.outOfStock")}</span>
                    </div>
                  )}
                </div>

                {/* Main Image */}
                {product.product_image ? (
                  <img
                    src={getImageUrl(product.product_image)}
                    alt={productName}
                    className="w-full h-full object-contain p-12"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="text-center p-8 flex flex-col items-center justify-center w-full h-full" style={{ display: product.product_image ? 'none' : 'flex' }}>
                  <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mb-4">
                    <Package size={48} className="text-emerald-400" />
                  </div>
                  <p className="text-slate-400 text-sm">{t("product.noImage")}</p>
                </div>
              </div>

              {/* Product Meta Info */}
              <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>✓ Verified Seller</span>
                  <span>✓ Original Product</span>
                  <span>✓ Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO & PURCHASE */}
          <div>
            {/* Product Title & Rating */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
              {product.product_type && (
                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg mb-3 border border-emerald-200">
                  {productType}
                </span>
              )}
              
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 leading-tight mb-4">
                {productName}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-slate-600">(0 reviews)</span>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-sm leading-relaxed">
                {productDescription || t("product.noDescription")}
              </p>
            </div>

            {/* PRICING CARD */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6 mb-4">
              <div className="mb-4">
                <p className="text-xs text-slate-600 uppercase font-bold tracking-wide mb-2">Price</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-slate-900">₹{Number(product.price).toLocaleString()}</span>
                  <span className="text-sm text-slate-600">/unit</span>
                </div>
              </div>
              <div className="flex gap-2 text-xs text-emerald-700 pt-4 border-t border-emerald-200">
                <CheckCircle size={14} />
                <span>Free shipping on orders above ₹500</span>
              </div>
            </div>

            {/* QUANTITY SELECTOR */}
            {inStock && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
                <label className="text-sm font-bold text-slate-700 block mb-3">Quantity</label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={decrementQty}
                    disabled={quantity <= 1}
                    className="px-4 py-3 hover:bg-white disabled:opacity-40 transition font-bold text-slate-600"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="flex-1 text-center py-3 font-bold text-lg border-x border-slate-300 bg-white focus:outline-none"
                  />
                  <button
                    onClick={incrementQty}
                    disabled={quantity >= product.product_quantity}
                    className="px-4 py-3 hover:bg-white disabled:opacity-40 transition font-bold text-slate-600"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Available: {product.product_quantity} units</p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`w-full py-4 rounded-xl font-bold text-base transition mb-3 flex items-center justify-center gap-2 ${addedToCart
                ? "bg-green-500 text-white shadow-lg"
                : !inStock
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-teal-700"
                }`}
            >
              {addedToCart ? (
                <>
                  <CheckCircle size={18} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Add to Cart
                </>
              )}
            </button>

            {/* TRUST INDICATORS */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Shield size={16} className="text-blue-600 flex-shrink-0" />
                <span className="text-xs text-blue-700 font-medium">Secure Payment Guaranteed</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <Truck size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium">Free Shipping for bulk orders</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <CheckCircle size={16} className="text-amber-600 flex-shrink-0" />
                <span className="text-xs text-amber-700 font-medium">30-Day Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* SELLER CARD */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Store size={20} className="text-emerald-600" />
            Sold By
          </h2>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <Store size={32} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">
                  {sellerName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="font-semibold">4.5/5</span>
                  <span className="text-slate-400">|</span>
                  <span>1,234 followers</span>
                </div>
                {(product.seller_city || product.seller_state) && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} />
                    {[product.seller_city, product.seller_state].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleContactSeller}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                Chat with Seller
              </button>
              <button className="px-6 py-2 text-emerald-600 font-bold border border-emerald-600 rounded-lg hover:bg-emerald-50 transition">
                View Store
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCT DETAILS TABS */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex gap-8 px-6 overflow-x-auto">
              <button className="py-4 border-b-2 border-emerald-600 text-emerald-600 font-bold text-sm whitespace-nowrap">
                Description
              </button>
              <button className="py-4 text-slate-600 hover:text-slate-900 font-medium text-sm whitespace-nowrap">
                Specifications
              </button>
              <button className="py-4 text-slate-600 hover:text-slate-900 font-medium text-sm whitespace-nowrap">
                Reviews
              </button>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">About this product</h3>
            <div className="space-y-3 text-slate-600">
              <p>• Category: <span className="font-semibold text-slate-900">{categoryName}</span></p>
              <p>• Type: <span className="font-semibold text-slate-900">{productType}</span></p>
              <p>• Price: <span className="font-semibold text-slate-900">₹{Number(product.price).toLocaleString()}</span></p>
              <p>• Availability: <span className={`font-semibold ${inStock ? 'text-green-600' : 'text-red-600'}`}>{inStock ? 'In Stock' : 'Out of Stock'}</span></p>
              <div className="pt-4 border-t border-slate-200 mt-4">
                <p className="text-sm text-slate-600 leading-relaxed">{productDescription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS & RATINGS SECTION */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-8">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Star className="text-amber-400 fill-amber-400" size={24} />
              Reviews & Ratings
            </h2>
            {reviewStats && (
              <div className="flex items-center gap-8 mt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900">{reviewStats.averageRating?.toFixed(1) || "0.0"}</div>
                  <div className="flex justify-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        size={16}
                        className={i <= Math.round(reviewStats.averageRating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-300"}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">{reviewStats.totalReviews || 0} reviews</p>
                </div>
              </div>
            )}
          </div>

          {/* Review Sort & Submit */}
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {token ? (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
                >
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setLoginMessage("Please login to write a review");
                    setShowLoginModal(true);
                  }}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
                >
                  Login to Review
                </button>
              )}
              <select
                value={sortBy}
                onChange={(e) => handleReviewSort(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-emerald-600"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="border border-slate-200 rounded-lg p-6 bg-slate-50 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="focus:outline-none transition"
                      >
                        <Star
                          size={32}
                          className={star <= userRating ? "text-amber-400 fill-amber-400" : "text-slate-300"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Review Title</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product"
                    rows="4"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition disabled:bg-slate-400"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews && reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{review.reviewer_name || "Anonymous"}</h4>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star
                              key={i}
                              size={14}
                              className={i <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    {review.title && <p className="font-semibold text-slate-900 mb-2">{review.title}</p>}
                    <p className="text-slate-600 text-sm">{review.review_text}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-center py-8">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>

        {/* MORE FROM SELLER */}
        {product.moreFromSeller && product.moreFromSeller.length > 0 && (
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                More from {sellerName}
              </h2>
              <p className="text-slate-600 text-sm mt-1">Explore other products available from this seller</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {product.moreFromSeller.map(p => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="bg-slate-50 aspect-square flex items-center justify-center overflow-hidden">
                    {p.product_image ? (
                      <img src={getImageUrl(p.product_image)} alt={p[`product_name_${language}`] || td(p.product_name || "")} className="w-full h-full object-cover group-hover:scale-110 transition" />
                    ) : (
                      <Package size={32} className="text-emerald-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-700 line-clamp-2 group-hover:text-emerald-600">
                      {p[`product_name_${language}`] || td(p.product_name || "")}
                    </p>
                    <p className="text-emerald-600 font-bold text-sm mt-2">
                      ₹{Number(p.price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ProductDetailPage;
