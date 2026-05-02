// ===========================================================================
// ProductCard.jsx - Reusable Product Card Component
// ===========================================================================
//
// Used on AllProductsPage.jsx to display each product in a grid
//
// WHAT IT SHOWS:
// - Product image (from backend /uploads/ path, or fallback placeholder)
// - Product name, brand/type, description, rating, price
// - Wishlist heart button and "Add to Cart" button
//
// IMAGE LOGIC:
// - First tries product.product_image (uploaded by vendor, stored in DB)
//   Prefixes with API_URL since we store just "/uploads/file.jpg"
// - Falls back to product.img or product.image (for any static/mock data)
// - If all fail, shows a generated placeholder with the product name
// ===========================================================================

import React, { useState } from 'react';
import { BadgeCheck, Heart, ArrowRight } from 'lucide-react';
import StarRating from '../Common/StarRating';
import { useWishlist } from '../../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import LoginModal from '../Common/LoginModal';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const token = localStorage.getItem("token");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  const pid = product.id || product.product_id;
  const wishlisted = isWishlisted(pid);

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  const handleToggleWishlist = async () => {
    if (!token) {
      setLoginMessage("Please login to save products to your wishlist.");
      setShowLoginModal(true);
      return;
    }
    await toggleWishlist(product);
  };

  return (
    <>
    {showLoginModal && <LoginModal message={loginMessage} onClose={() => setShowLoginModal(false)} />}
    <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-all duration-500 border border-slate-100 overflow-hidden w-full flex flex-col h-full">

      {/* Image Container */}
      <div className="relative h-48 w-full bg-slate-50/50 p-2 flex items-center justify-center overflow-hidden">

        {/* ❤️ Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          title={token ? (wishlisted ? "Remove from wishlist" : "Add to wishlist") : "Login to wishlist"}
          className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm border border-slate-100 hover:scale-110 transition-transform z-10"
        >
          <Heart
            size={16}
            className={
              wishlisted
                ? "text-red-500 fill-red-500 transition-colors"
                : "text-slate-400 hover:text-red-500 transition-colors"
            }
          />
        </button>

        <img
          src={
            product.product_image
              ? product.product_image.startsWith('http') 
                ? product.product_image 
                : `${API_URL}${product.product_image}`
              : product.img || product.image || `https://placehold.co/200x200/e8f5e9/16a34a?text=${encodeURIComponent(product.product_name || product.name || 'Product')}`
          }
          alt={product.name || product.product_name}
          onError={(e) => {
            e.target.src = `https://placehold.co/200x200/e8f5e9/16a34a?text=${encodeURIComponent(product.name?.slice(0, 8) || product.product_name?.slice(0, 8) || 'Product')}`;
          }}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {product.inStock || product.product_quantity > 0 ? (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm shadow-sm border border-emerald-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 text-[9px] font-bold uppercase tracking-wider">
              In Stock
            </span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-slate-100/90 backdrop-blur-sm shadow-sm border border-slate-200 px-2.5 py-1 rounded-xl">
            <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-2.5 py-4 flex flex-col flex-grow">

        {/* Brand */}
        <div className="flex items-center gap-1 mb-2">
          <div className="p-1 bg-emerald-50 rounded-md">
            <BadgeCheck className="w-3 h-3 text-emerald-600" />
          </div>
          <p className="text-emerald-700 text-[9px] font-bold uppercase tracking-wider">
            {product.brand || product.product_type || 'Premium Quality'}
          </p>
        </div>

        {/* Title */}
        <h3 className="text-slate-800 font-bold text-base leading-snug mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-700 transition-colors">
          {product.name || product.product_name}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-[11px] leading-relaxed mb-3 line-clamp-2 flex-grow font-medium">
          {product.description || product.product_description || 'Premium quality agricultural product for better yield and crop health.'}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4 bg-slate-50 p-2 rounded-xl w-fit">
          <StarRating rating={product.average_rating || product.rating || 0} size={11} />
          <div className="w-px h-3 bg-slate-200" />
          <span className="text-slate-400 text-[9px] font-semibold">
            ({product.review_count || product.reviewsCount || 0})
          </span>
        </div>

        {/* Price + Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-50">

          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              Price
            </span>
            <span className="text-xl font-bold text-slate-900">
              ₹{Number(product.price).toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleViewDetails}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-white text-[9px] font-bold uppercase tracking-widest py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 bg-emerald-600 hover:bg-emerald-700"
          >
            <ArrowRight size={14} />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProductCard;