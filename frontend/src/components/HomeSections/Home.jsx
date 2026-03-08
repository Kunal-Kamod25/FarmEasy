import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Hero from "./Hero";
import BrandSection from "./BrandSection";
import {
  Package, Heart, Store, Star,
  Sparkles, TrendingUp, ArrowRight, Leaf,
  Truck, ShieldCheck, Headphones, Sprout, Grid3X3
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const API = "http://localhost:5000";

// icons for each category — gives each section a unique feel
const CATEGORY_ICONS = {
  fertilizers: "🧪",
  seeds: "🌱",
  irrigation: "💧",
  "pesticides & medicines": "💊",
  "farm equipment": "🚜",
  "organic products": "🌿",
};

// gradient colors per category so each section looks distinct
const CATEGORY_COLORS = {
  fertilizers: "from-emerald-500 to-green-600",
  seeds: "from-amber-500 to-yellow-600",
  irrigation: "from-blue-500 to-cyan-600",
  "pesticides & medicines": "from-rose-500 to-pink-600",
  "farm equipment": "from-slate-600 to-gray-700",
  "organic products": "from-lime-500 to-emerald-600",
};

// "Shop by Category" card styles — each category gets a unique bg + border
const CATEGORY_CARD_STYLES = {
  fertilizers: { bg: "bg-emerald-50", border: "border-emerald-200", hover: "hover:bg-emerald-100", text: "text-emerald-700" },
  seeds: { bg: "bg-amber-50", border: "border-amber-200", hover: "hover:bg-amber-100", text: "text-amber-700" },
  irrigation: { bg: "bg-blue-50", border: "border-blue-200", hover: "hover:bg-blue-100", text: "text-blue-700" },
  "pesticides & medicines": { bg: "bg-rose-50", border: "border-rose-200", hover: "hover:bg-rose-100", text: "text-rose-700" },
  "farm equipment": { bg: "bg-slate-50", border: "border-slate-200", hover: "hover:bg-slate-100", text: "text-slate-700" },
  "organic products": { bg: "bg-lime-50", border: "border-lime-200", hover: "hover:bg-lime-100", text: "text-lime-700" },
};

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get("category") || "main";

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  // all products fetched from DB — vendors add products, they show up here automatically
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/products/all?sort=newest`);
      setAllProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  // group products by their category name — this powers the dynamic sections
  // if a vendor adds a product under "Seeds", a Seeds section appears automatically
  const productsByCategory = useMemo(() => {
    const grouped = {};
    allProducts.forEach((p) => {
      const cat = p.category_name || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });
    return grouped;
  }, [allProducts]);

  // new arrivals = latest 8 products sorted by created_at
  const newArrivals = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8);
  }, [allProducts]);

  // categories that actually have products — only show sections with real data
  const activeCategories = useMemo(() => {
    return categories.filter(
      (cat) => productsByCategory[cat.product_cat_name]?.length > 0
    );
  }, [categories, productsByCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50/30 to-green-50">

      {/* Hero banner — only on the main home view */}
      {categoryParam === "main" && <Hero />}

      {/* ═══════════════ NEW ARRIVALS SECTION ═══════════════ */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-10 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-200">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                New Arrivals
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Fresh products just added by vendors
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : newArrivals.length === 0 ? (
          <EmptyState message="No products yet. Products will appear once vendors add them." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted(product.id)}
                onViewDetail={() => navigate(`/product/${product.id}`)}
                badge="NEW"
                badgeColor="bg-violet-500"
              />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════ BRAND SECTION — right after new arrivals ═══════════════ */}
      {categoryParam === "main" && <BrandSection />}

      {/* ═══════════════ DYNAMIC CATEGORY SECTIONS ═══════════════ */}
      {/* These sections are automatically generated from database categories.
          If a vendor adds a product under "Seeds", a Seeds section appears here.
          No hardcoding — it's all driven by real data. */}
      {!loading &&
        activeCategories.map((cat, idx) => {
          const catName = cat.product_cat_name;
          const catKey = catName.toLowerCase();
          const products = productsByCategory[catName] || [];
          const icon = CATEGORY_ICONS[catKey] || "📦";
          const gradient = CATEGORY_COLORS[catKey] || "from-emerald-500 to-green-600";

          // alternate subtle background tint so sections stand apart visually
          const sectionBg = idx % 2 === 0 ? "bg-white/60" : "bg-emerald-50/30";

          return (
            <section key={cat.id} className={`${sectionBg} py-8`}>
              <div className="w-full max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`bg-gradient-to-br ${gradient} p-2.5 rounded-xl shadow-lg`}>
                      <span className="text-xl">{icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-800">
                        {catName}
                      </h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {products.length} product{products.length !== 1 ? "s" : ""} available
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/products?category=${cat.id}`)}
                    className="flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
                  >
                    View All <ArrowRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {products.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      isWishlisted={isWishlisted(product.id)}
                      onViewDetail={() => navigate(`/product/${product.id}`)}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        })}

      {/* ═══════════════ ALL PRODUCTS ═══════════════ */}
      {!loading && allProducts.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  All Products
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  {allProducts.length} products from verified vendors
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              Browse All <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {allProducts.slice(0, 12).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted(product.id)}
                onViewDetail={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════ WHY FARMEASY — trust section for farmers ═══════════════ */}
      {categoryParam === "main" && (
        <section className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 py-14 mt-8">
          <div className="w-full max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-extrabold text-white mb-2">
                Why Farmers Trust FarmEasy
              </h2>
              <p className="text-emerald-100 text-sm max-w-xl mx-auto">
                We are built for farmers, by people who understand farming.
                Quality products, honest prices, delivered to your doorstep.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: <Truck size={28} />, title: "Free Delivery", desc: "On orders above ₹3,000 across India", color: "bg-white/20" },
                { icon: <ShieldCheck size={28} />, title: "Genuine Products", desc: "100% authentic from verified vendors", color: "bg-white/20" },
                { icon: <Sprout size={28} />, title: "Farmer First", desc: "Best prices for seeds, fertilizers & tools", color: "bg-white/20" },
                { icon: <Headphones size={28} />, title: "Kisan Support", desc: "Expert help in Hindi, Marathi & English", color: "bg-white/20" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`${item.color} backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/30 transition-colors`}
                >
                  <div className="text-white mb-3 flex justify-center">{item.icon}</div>
                  <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-emerald-100 text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════
// PRODUCT CARD — the main reusable card used everywhere on the home page
// shows: image, category badge, wishlist button, name, description,
//        seller info, star rating, price, and add-to-cart button
// ═══════════════════════════════════════════════════════════
const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onViewDetail,
  badge,
  badgeColor = "bg-emerald-500",
}) => {


  const handleWishlist = (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to save to wishlist");
      return;
    }
    onToggleWishlist(product);
  };

  const inStock = product.product_quantity > 0;

  return (
    <div
      onClick={onViewDetail}
      className="group cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* ── image area ── */}
      <div className="relative h-44 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center overflow-hidden">

        {/* wishlist button — top right */}
        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm border border-slate-100 hover:scale-110 transition z-10"
        >
          <Heart
            size={14}
            className={
              isWishlisted
                ? "text-red-500 fill-red-500"
                : "text-slate-400 hover:text-red-400"
            }
          />
        </button>

        {/* category or custom badge — top left */}
        {(badge || product.category_name) && (
          <span
            className={`absolute top-2.5 left-2.5 ${badge ? badgeColor : "bg-emerald-500"
              } text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10`}
          >
            {badge || product.category_name}
          </span>
        )}

        {/* real product image from backend, or a styled placeholder */}
        <div className="group-hover:scale-105 transition-transform duration-500 w-full h-full flex items-center justify-center p-3">
          {product.product_image ? (
            <img
              src={`${API}${product.product_image}`}
              alt={product.product_name}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Package size={32} className="text-emerald-300" />
            </div>
          )}
        </div>

        {/* out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── card content ── */}
      <div className="p-4 flex flex-col flex-grow">

        {/* product name */}
        <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-emerald-700 transition-colors">
          {product.product_name}
        </h3>

        {/* short description */}
        {product.product_description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
            {product.product_description}
          </p>
        )}

        {/* seller info */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="bg-emerald-50 p-0.5 rounded">
            <Store size={10} className="text-emerald-600" />
          </div>
          <span className="text-[10px] text-slate-500 font-medium truncate">
            {product.shop_name || product.seller_name || "FarmEasy Vendor"}
          </span>
        </div>

        {/* star rating row */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={11}
                className={
                  star <= 4
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-200 fill-slate-200"
                }
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">4.0</span>
        </div>

        {/* price + view details — at the bottom */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Price
            </span>
            <p className="text-base font-black text-slate-900">
              ₹{Number(product.price).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onViewDetail}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 active:scale-95"
          >
            <ArrowRight size={12} /> View Details
          </button>
        </div>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════
// Loading skeleton — shown while products are being fetched
// ═══════════════════════════════════════════════════════════
const LoadingSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl overflow-hidden animate-pulse border border-slate-100"
      >
        <div className="h-44 bg-slate-100" />
        <div className="p-4 space-y-2.5">
          <div className="h-3.5 bg-slate-100 rounded-full w-3/4" />
          <div className="h-2.5 bg-slate-50 rounded-full w-full" />
          <div className="h-2.5 bg-slate-50 rounded-full w-2/3" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-slate-100 rounded w-16" />
            <div className="h-8 bg-slate-100 rounded-xl w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);


// ═══════════════════════════════════════════════════════════
// Empty state — shown when there are no products in a section
// ═══════════════════════════════════════════════════════════
const EmptyState = ({ message }) => (
  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
    <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Leaf size={28} className="text-slate-300" />
    </div>
    <p className="text-slate-500 font-semibold text-sm">{message}</p>
  </div>
);


export default Home;
