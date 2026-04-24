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
      // API returns { success: true, data: [...] }
      let data = res.data?.data || res.data || [];
      if (!Array.isArray(data)) data = [];
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  // Group by numeric category_id for reliable matching
  const productsByCategory = useMemo(() => {
    const grouped = {};
    allProducts.forEach((p) => {
      const catId = p.category_id;
      if (catId === null || catId === undefined) return;
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(p);
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
    // Show ALL categories, not just ones with products
    // This way categories appear even if vendors haven't added products yet
    return categories;
  }, [categories]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc]">

      {categoryParam === "main" && <Hero />}

      {/* ═══════════════ NEW ARRIVALS SECTION ═══════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-20 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                <span className="text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px]">
                    Fresh Harvest
                </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                New Arrivals
            </h2>
            <p className="text-slate-500 text-lg max-w-xl font-medium">
                Discover the latest high-yield seeds and premium fertilizers recently added by our verified partners.
            </p>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="group flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-800 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm hover:shadow-xl active:scale-95"
          >
            Explore Catalog <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {loading ? (
          <LoadingSkeleton count={5} />
        ) : newArrivals.length === 0 ? (
          <EmptyState message="No products yet. Products will appear once vendors add them." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-20">
          <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-[3rem] p-12 border border-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 relative z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-amber-500 rounded-full" />
                        <span className="text-amber-600 font-black uppercase tracking-[0.3em] text-[10px]">
                            Curated Selection
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                        Handpicked for You
                    </h2>
                    <p className="text-slate-500 text-lg max-w-xl font-medium">
                        Personalized recommendations based on your farming needs and regional climate.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 relative z-10">
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
            products={productsByCategory[cat.id] || []}
            navigate={navigate}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            isWishlisted={isWishlisted}
            idx={idx}
          />
        ))}

      {/* ═══════════════ WHY FARMEASY ═══════════════ */}
      {categoryParam === "main" && (
        <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center mb-20 space-y-4">
              <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-xs">
                Our Foundation
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Built for the Modern Farmer
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">
                We bridge the gap between traditional farming wisdom and modern marketplace efficiency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Truck size={32} />, title: "Hyper-Local Logistics", desc: "Optimized delivery routes ensuring your products reach the field faster than ever.", color: "from-emerald-500 to-teal-600" },
                { icon: <ShieldCheck size={32} />, title: "Verified Ecosystem", desc: "Every vendor and product is rigorously vetted to ensure zero compromises on quality.", color: "from-blue-500 to-indigo-600" },
                { icon: <Sprout size={32} />, title: "Yield Optimization", desc: "Expert advice and high-performance inputs designed to maximize your seasonal harvest.", color: "from-amber-500 to-orange-600" },
                { icon: <Headphones size={32} />, title: "24/7 Field Support", desc: "Our agri-experts are just a call away to solve your technical and logistics queries.", color: "from-rose-500 to-red-600" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group relative bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-4"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <h3 className="text-white font-black text-xl mb-4">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium group-hover:text-slate-300 transition-colors">{item.desc}</p>
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
