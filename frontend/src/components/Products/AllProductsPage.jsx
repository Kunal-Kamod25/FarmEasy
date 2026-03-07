import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
    Search, SlidersHorizontal, X, ShoppingCart,
    Star, Heart, Store, ChevronDown, Package,
    ArrowUpDown, Filter
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

// this whole page shows all products from DB with real filters - no static data at all
const AllProductsPage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // all filter state in one object - easy to reset
    const [filters, setFilters] = useState({
        search: "",
        category_id: "",
        min_price: "",
        max_price: "",
        product_type: "",
        seller_id: "",
        sort: "newest"
    });

    // fetch the dropdown data for filters - categories, types, sellers
    useEffect(() => {
        const fetchFilterMeta = async () => {
            try {
                const [catRes, typeRes, sellerRes] = await Promise.all([
                    axios.get("http://localhost:5000/api/categories"),
                    axios.get("http://localhost:5000/api/products/meta/types"),
                    axios.get("http://localhost:5000/api/products/meta/sellers")
                ]);
                setCategories(catRes.data);
                setProductTypes(typeRes.data);
                setSellers(sellerRes.data);
            } catch (err) {
                console.error("Failed to load filter data:", err);
            }
        };
        fetchFilterMeta();
    }, []);

    // fetch products whenever filters change
    // using useCallback to avoid re-creating this on every render
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);

            // build the query string only with non-empty values
            const params = {};
            Object.entries(filters).forEach(([key, val]) => {
                if (val !== "") params[key] = val;
            });

            const res = await axios.get("http://localhost:5000/api/products/all", { params });
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to load products:", err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearAllFilters = () => {
        setFilters({
            search: "",
            category_id: "",
            min_price: "",
            max_price: "",
            product_type: "",
            seller_id: "",
            sort: "newest"
        });
    };

    // check if any filter is active so we can show the "clear" button
    const hasActiveFilters = Object.entries(filters).some(
        ([key, val]) => key !== "sort" && val !== ""
    );

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ── PAGE HEADER ── */}
            <div className="bg-white border-b border-slate-100 px-6 py-5">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800">All Products</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {loading ? "Loading..." : `${products.length} products found`}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* ── SEARCH + CONTROLS BAR ── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* search box */}
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={e => handleFilterChange("search", e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                        />
                    </div>

                    {/* sort dropdown */}
                    <div className="relative">
                        <ArrowUpDown size={15} className="absolute left-3 top-3 text-slate-400" />
                        <select
                            value={filters.sort}
                            onChange={e => handleFilterChange("sort", e.target.value)}
                            className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white appearance-none cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* filter toggle button for mobile */}
                    <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${filtersOpen || hasActiveFilters
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
                            }`}
                    >
                        <SlidersHorizontal size={15} />
                        Filters
                        {hasActiveFilters && (
                            <span className="bg-white text-emerald-600 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold ml-1">
                                •
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex gap-6">

                    {/* ── FILTER SIDEBAR ── */}
                    <div className={`${filtersOpen ? "block" : "hidden"} lg:block w-full lg:w-64 flex-shrink-0`}>
                        <div className="bg-gradient-to-br from-emerald-300 to-teal-500 rounded-2xl border border-slate-100 shadow-sm p-5 space-y-6 sticky top-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Filter size={15} />
                                    Filters
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
                                    >
                                        <X size={12} /> Clear All
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Category
                                </label>
                                <select
                                    value={filters.category_id}
                                    onChange={e => handleFilterChange("category_id", e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.product_cat_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Price Range (₹)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.min_price}
                                        onChange={e => handleFilterChange("min_price", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.max_price}
                                        onChange={e => handleFilterChange("max_price", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Product Type Filter */}
                            {productTypes.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Product Type
                                    </label>
                                    <select
                                        value={filters.product_type}
                                        onChange={e => handleFilterChange("product_type", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                                    >
                                        <option value="">All Types</option>
                                        {productTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Seller Filter */}
                            {sellers.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Seller / Vendor
                                    </label>
                                    <select
                                        value={filters.seller_id}
                                        onChange={e => handleFilterChange("seller_id", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                                    >
                                        <option value="">All Sellers</option>
                                        {sellers.map(seller => (
                                            <option key={seller.id} value={seller.id}>
                                                {seller.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── PRODUCTS GRID ── */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            // skeleton loader while fetching
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                                        <div className="h-48 bg-slate-100" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-slate-100 rounded w-3/4" />
                                            <div className="h-3 bg-slate-100 rounded w-full" />
                                            <div className="h-3 bg-slate-100 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                                <Package size={40} className="text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-600 font-bold text-lg">No products found</p>
                                <p className="text-slate-400 text-sm mt-1">Try changing your filters or search term</p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {products.map(product => (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// ── PRODUCT CARD (local to this page, shows vendor name + price) ──
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted, onViewDetail }) => {
    const [added, setAdded] = useState(false);
    const token = localStorage.getItem("token");

    const handleAdd = async () => {
        await onAddToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const handleWishlist = () => {
        if (!token) {
            alert("Please login to save to wishlist");
            return;
        }
        onToggleWishlist(product);
    };

    return (
        <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">

            {/* image area */}
            <div className="relative h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                {/* wishlist heart */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm border border-slate-100 hover:scale-110 transition z-10"
                >
                    <Heart
                        size={15}
                        className={isWishlisted ? "text-red-500 fill-red-500" : "text-slate-400"}
                    />
                </button>

                {/* category badge */}
                {product.category_name && (
                    <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                        {product.category_name}
                    </span>
                )}

                {/* product placeholder image since we don't have real images yet */}
                <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-2">
                            <Package size={32} className="text-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* out of stock overlay */}
                {product.product_quantity === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* content */}
            <div className="p-4 flex flex-col flex-grow">

                {/* product name */}
                <h3
                    onClick={onViewDetail}
                    className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-1 cursor-pointer hover:text-emerald-700 transition-colors"
                >
                    {product.product_name}
                </h3>

                {/* description snippet */}
                <p className="text-slate-500 text-xs line-clamp-2 mb-3 flex-grow leading-relaxed">
                    {product.product_description || "No description available"}
                </p>

                {/* seller info - this is the key part for multi-vendor */}
                <div className="flex items-center gap-1.5 mb-3 bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <Store size={11} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-[11px] text-slate-600 truncate font-medium">
                        {product.shop_name || product.seller_name || "Unknown Seller"}
                    </span>
                </div>

                {/* price + actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Price</p>
                        <p className="text-lg font-black text-slate-900">₹{Number(product.price).toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onViewDetail}
                            className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:border-emerald-400 hover:text-emerald-600 transition"
                        >
                            Details
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={product.product_quantity === 0}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${added
                                ? "bg-green-500 text-white"
                                : product.product_quantity === 0
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                                }`}
                        >
                            {added ? "✓ Added" : "Add"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllProductsPage;
