import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Hero from "./Hero";
import BrandSection from "./BrandSection";
import { API_URL } from '../../config';
import {
  Sparkles, TrendingUp, ArrowRight,
  Truck, ShieldCheck, Headphones, Sprout, Star
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { ProductCard, LoadingSkeleton, EmptyState } from "./HomeProductCard";
import CategorySection from "./CategorySection";

const API = `${API_URL}`;

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get("category") || "main";

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

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

  const productsByCategory = useMemo(() => {
    const grouped = {};
    allProducts.forEach((p) => {
      const cat = p.category_name || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });
    return grouped;
  }, [allProducts]);

  const newArrivals = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8);
  }, [allProducts]);

  // Generic Recommendations logic: 
  // Pick some products that are well-stocked and maybe a mix of categories
  const recommendations = useMemo(() => {
    return [...allProducts]
      .filter(p => p.product_quantity > 0)
      .sort(() => 0.5 - Math.random()) // generic random mix
      .slice(0, 4);
  }, [allProducts]);

  const activeCategories = useMemo(() => {
    return categories.filter(
      (cat) => productsByCategory[cat.product_cat_name]?.length > 0
    );
  }, [categories, productsByCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50/30 to-green-50">

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

      {categoryParam === "main" && <BrandSection />}

      {/* ═══════════════ RECOMMENDED FOR YOU ═══════════════ */}
      {!loading && recommendations.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-100/20 border border-emerald-100/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-xl shadow-lg shadow-amber-200">
                <Star size={20} className="text-white fill-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  Recommended for You
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Handpicked quality products for your farm
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {recommendations.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={isWishlisted(product.id)}
                  onViewDetail={() => navigate(`/product/${product.id}`)}
                  badge="TOP"
                  badgeColor="bg-amber-500"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ DYNAMIC CATEGORY SECTIONS ═══════════════ */}
      {!loading &&
        activeCategories.map((cat, idx) => (
          <CategorySection
            key={cat.id}
            cat={cat}
            products={productsByCategory[cat.product_cat_name] || []}
            navigate={navigate}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            isWishlisted={isWishlisted}
            idx={idx}
          />
        ))}

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

      {/* ═══════════════ WHY FARMEASY ═══════════════ */}
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

export default Home;
