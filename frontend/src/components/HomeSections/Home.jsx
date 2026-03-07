import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Hero from "./Hero";
import HomeSections from "./HomeSections";
import BrandSection from "./BrandSection";
import { Package, ShoppingCart, Heart, Store } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const API = "http://localhost:5000";

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get("category") || "main";

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  // all products fetched from DB (no more ProductData.js)
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
      console.error("Failed to load products from API:", err);
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

  // filter by category if a category tab is selected on home
  const filteredProducts = useMemo(() => {
    if (categoryParam === "main") return allProducts;

    // match by category name (case insensitive partial match)
    return allProducts.filter(p =>
      p.category_name?.toLowerCase().includes(categoryParam.toLowerCase())
    );
  }, [allProducts, categoryParam]);

  // fertilizer products for the featured section in HomeSections
  const fertilizerProducts = useMemo(() => {
    return allProducts.filter(p =>
      p.category_name?.toLowerCase().includes("fertilizer")
    );
  }, [allProducts]);

  const handleNavigate = (page) => {
    if (page === "fertilizers") {
      navigate("/products");
    } else {
      navigate("/products");
    }
  };

  const handleViewDetails = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Hero - full width, only on main tab */}
      {categoryParam === "main" && <Hero />}

      {/* Page title + View All */}
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">
              {categoryParam === "main" ? "Our Products" : categoryParam.replace("-", " ")}
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              {loading ? "Loading..." : `${filteredProducts.length} products available`}
            </p>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition"
          >
            View All Products →
          </button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-slate-100">
                <div className="h-40 bg-slate-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Package size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No products yet</p>
            <p className="text-slate-400 text-sm mt-1">Products will appear here once vendors add them</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredProducts.slice(0, 10).map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted(product.id)}
                onViewDetail={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Brand Section */}
      {categoryParam === "main" && <BrandSection />}

      {/* Home Sections (featured fertilizers + recommended) */}
      {categoryParam === "main" && (
        <HomeSections
          fertilizerProducts={fertilizerProducts}
          products={allProducts}
          onNavigate={handleNavigate}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};


// compact product card specifically for the home page grid
const HomeProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted, onViewDetail }) => {
  const [added, setAdded] = useState(false);

  const handleAdd = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add to cart");
      return;
    }
    await onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

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
      className="group cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >

      {/* image area */}
      <div className="relative h-40 bg-slate-50 flex items-center justify-center overflow-hidden">

        {/* wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm border border-slate-100 hover:scale-110 transition z-10"
        >
          <Heart
            size={13}
            className={isWishlisted ? "text-red-500 fill-red-500" : "text-slate-400"}
          />
        </button>

        {/* category badge for hover */}
        {product.category_name && (
          <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            {product.category_name}
          </span>
        )}

        {/* product icon placeholder */}
        <div className="group-hover:scale-105 transition-transform duration-500">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
            <Package size={28} className="text-emerald-300" />
          </div>
        </div>

        {/* out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* content */}
      <div className="p-3 flex flex-col flex-grow">

        <h3 className="font-semibold text-slate-800 text-xs leading-snug line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
          {product.product_name}
        </h3>

        {/* seller name - multi-vendor support */}
        <div className="flex items-center gap-1 mb-2">
          <Store size={9} className="text-emerald-500 flex-shrink-0" />
          <span className="text-[10px] text-slate-500 truncate">
            {product.shop_name || product.seller_name || "FarmEasy"}
          </span>
        </div>

        {/* price + add button */}
        <div className="flex items-center justify-between mt-auto">
          <p className="text-sm font-black text-slate-900">
            ₹{Number(product.price).toLocaleString()}
          </p>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition ${added
                ? "bg-green-500 text-white"
                : !inStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
          >
            {added ? "✓" : <><ShoppingCart size={10} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
