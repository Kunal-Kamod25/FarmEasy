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
  Shield, Plus, Minus
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import LoginModal from "../components/Common/LoginModal";
import { useLanguage } from "../context/language/LanguageContext";

// single product detail page - shows everything about one product
// also shows other products from the same seller at the bottom
const ProductDetailPage = () => {
  const { id } = useParams();
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

  const token = localStorage.getItem("token");

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error("Failed to load product:", err);
      setError(t("product.notFoundDesc"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

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

  const incrementQty = () => {
    if (quantity < product.product_quantity) setQuantity(q => q + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/20 to-green-50 p-6">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-8 w-32 bg-slate-200 rounded-xl mb-6" />
          <div className="bg-white rounded-2xl p-8 flex gap-8">
            <div className="w-72 h-72 bg-slate-100 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-10 bg-slate-100 rounded w-32 mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/20 to-green-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-slate-100">
          <AlertCircle size={48} className="text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">{t("product.notFound")}</h2>
          <p className="text-slate-500 text-sm mb-6">{error || t("product.notFoundDesc")}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition"
          >
            {t("product.goBack")}
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/20 to-green-50">

      {/* ── BREADCRUMB / BACK NAV ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => navigate("/")} className="hover:text-emerald-600 transition">{t("product.home")}</button>
          <span>/</span>
          <button onClick={() => navigate("/products")} className="hover:text-emerald-600 transition">{t("product.products")}</button>
          <span>/</span>
          <span className="text-slate-800 font-medium line-clamp-1">{productName}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── MAIN PRODUCT SECTION ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">

            {/* product image placeholder - left side */}
            <div className="md:w-80 h-72 md:h-auto bg-slate-50 flex items-center justify-center flex-shrink-0 relative">
              {/* wishlist button */}
              <button
                onClick={handleWishlist}
                className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md border transition z-10 ${wishlisted
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-slate-200 hover:border-red-300"
                  }`}
              >
                <Heart
                  size={18}
                  className={wishlisted ? "text-red-500 fill-red-500" : "text-slate-400"}
                />
              </button>

              {/* category badge */}
              {product.category_name && (
                <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {categoryName}
                </span>
              )}

              {/* show real product image if it exists, otherwise show a styled placeholder */}
              {product.product_image ? (
                <img
                  src={getImageUrl(product.product_image)}
                  alt={productName}
                  className="max-w-full max-h-full object-contain p-4"
                  onError={(e) => {
                    // fallback if the saved image file is missing
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="text-center p-8" style={{ display: product.product_image ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="w-32 h-32 mx-auto bg-emerald-50 rounded-3xl flex items-center justify-center mb-4">
                  <Package size={56} className="text-emerald-300" />
                </div>
                <p className="text-slate-400 text-xs">{t("product.noImage")}</p>
              </div>
            </div>

            {/* product info - right side */}
            <div className="flex-1 p-6 md:p-8">

              {/* product type badge */}
              {product.product_type && (
                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg mb-3">
                  {productType}
                </span>
              )}

              <h1 className="text-2xl font-bold text-slate-900 leading-snug mb-3">
                {productName}
              </h1>

              {/* rating placeholder (can add real reviews later) */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-amber-700 font-bold text-sm">4.5</span>
                </div>
                <span className="text-slate-400 text-sm">{t("product.noReviews")}</span>
              </div>

              {/* description */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl">
                {productDescription || t("product.noDescription")}
              </p>

              {/* price */}
              <div className="mb-6">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">{t("product.price")}</p>
                <p className="text-3xl font-black text-slate-900">
                  ₹{Number(product.price).toLocaleString()}
                  <span className="text-sm font-normal text-slate-500 ml-2">{t("product.perUnit")}</span>
                </p>
              </div>

              {/* stock status */}
              <div className="flex items-center gap-2 mb-6">
                {inStock ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-700 font-semibold text-sm">
                      {t("product.inStock", { count: product.product_quantity })}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-red-600 font-semibold text-sm">{t("product.outOfStock")}</span>
                  </>
                )}
              </div>

              {/* quantity picker - only show if in stock */}
              {inStock && (
                <div className="flex items-center gap-3 mb-6">
                  <p className="text-sm font-semibold text-slate-600">{t("product.quantity")}</p>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={decrementQty}
                      disabled={quantity <= 1}
                      className="px-3 py-2 hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 py-2 font-bold text-slate-800 text-sm border-x border-slate-200">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQty}
                      disabled={quantity >= product.product_quantity}
                      className="px-3 py-2 hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">{t("product.max", { count: product.product_quantity })}</span>
                </div>
              )}

              {/* action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${addedToCart
                    ? "bg-green-500 text-white"
                    : !inStock
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg"
                    }`}
                >
                  {addedToCart ? (
                    <>
                      <CheckCircle size={16} />
                      {t("product.addedToCart")}
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      {t("product.addToCart")}
                    </>
                  )}
                </button>
              </div>

              {/* trust badges */}
              <div className="flex items-center gap-4 mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Truck size={13} className="text-emerald-500" />
                  {t("product.fastDelivery")}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Shield size={13} className="text-emerald-500" />
                  {t("product.securePayment")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SELLER INFO CARD ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Store size={16} className="text-emerald-600" />
            {t("product.aboutSeller")}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store size={22} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800">
                {sellerName}
              </p>
              {product.seller_name && product.shop_name && (
                <p className="text-sm text-slate-500">{t("product.bySeller", { name: product.seller_name })}</p>
              )}
              {(product.seller_city || product.seller_state) && (
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <MapPin size={11} />
                  {[product.seller_city, product.seller_state].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── MORE FROM THIS SELLER ── */}
        {product.moreFromSeller && product.moreFromSeller.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-4">
              {t("product.moreFrom", { name: sellerName })}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.moreFromSeller.map(p => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="bg-slate-50 hover:bg-emerald-50 rounded-xl p-4 transition group border border-transparent hover:border-emerald-200"
                >
                  {/* show product thumbnail if uploaded, else placeholder icon */}
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm overflow-hidden">
                    {p.product_image ? (
                      <img src={getImageUrl(p.product_image)} alt={p[`product_name_${language}`] || td(p.product_name || "")} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 text-center line-clamp-2 group-hover:text-emerald-700">
                    {p[`product_name_${language}`] || td(p.product_name || "")}
                  </p>
                  <p className="text-emerald-700 font-bold text-sm text-center mt-2">
                    ₹{Number(p.price).toLocaleString()}
                  </p>
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
