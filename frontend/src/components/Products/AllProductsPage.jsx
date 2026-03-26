import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from '../../config';
import {
    Search, SlidersHorizontal, X, ChevronDown, Package,
    ArrowUpDown, Filter
} from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useLanguage } from "../../context/language/LanguageContext";
import AllProductsProductCard from "./AllProductsProductCard";

const DEFAULT_FILTERS = {
    search: "",
    category_id: "",
    min_price: "",
    max_price: "",
    product_type: "",
    seller_id: "",
    sort: "newest"
};

const VALID_SORTS = new Set(["newest", "oldest", "price_asc", "price_desc"]);

const getInitialFiltersFromQuery = (searchParams) => {
    const getParam = (...keys) => {
        for (const key of keys) {
            const value = searchParams.get(key);
            if (value !== null && value !== "") return value;
        }
        return "";
    };

    const parsed = {
        ...DEFAULT_FILTERS,
        search: getParam("search"),
        // Support both `category_id` and existing legacy `category` links.
        category_id: getParam("category_id", "category"),
        min_price: getParam("min_price"),
        max_price: getParam("max_price"),
        // Support a shorter alias for type-based links.
        product_type: getParam("product_type", "type"),
        seller_id: getParam("seller_id")
    };

    const sort = getParam("sort");
    if (sort && VALID_SORTS.has(sort)) {
        parsed.sort = sort;
    }

    return parsed;
};

// this whole page shows all products from DB with real filters - no static data at all
const AllProductsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { t, td } = useLanguage();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // all filter state in one object - easy to reset
    const [filters, setFilters] = useState(() => getInitialFiltersFromQuery(searchParams));

    useEffect(() => {
        const urlFilters = getInitialFiltersFromQuery(searchParams);

        setFilters((prev) => {
            const isSame = Object.keys(DEFAULT_FILTERS).every(
                (key) => prev[key] === urlFilters[key]
            );
            return isSame ? prev : urlFilters;
        });
    }, [searchParams]);

    // fetch the dropdown data for filters - categories, types, sellers
    useEffect(() => {
        const fetchFilterMeta = async () => {
            try {
                const [catRes, typeRes, sellerRes] = await Promise.all([
                    axios.get(`${API_URL}/api/categories`),
                    axios.get(`${API_URL}/api/products/meta/types`),
                    axios.get(`${API_URL}/api/products/meta/sellers`)
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

            const res = await axios.get(`${API_URL}/api/products/all`, { params });
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
        setFilters(DEFAULT_FILTERS);
    };

    // check if any filter is active so we can show the "clear" button
    const hasActiveFilters = Object.entries(filters).some(
        ([key, val]) => key !== "sort" && val !== ""
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50/20 to-teal-50">

            {/* ── PAGE HEADER ── */}
            <div className="bg-white border-b border-slate-100 px-6 py-5">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800">{t("products.title")}</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {loading ? t("products.loading") : t("products.found", { count: products.length })}
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
                            placeholder={t("products.searchPlaceholder")}
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
                            <option value="newest">{t("products.sort.newest")}</option>
                            <option value="oldest">{t("products.sort.oldest")}</option>
                            <option value="price_asc">{t("products.sort.priceAsc")}</option>
                            <option value="price_desc">{t("products.sort.priceDesc")}</option>
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
                        {t("products.filters")}
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
                                    {t("products.filters")}
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
                                    >
                                        <X size={12} /> {t("products.clearAll")}
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    {t("products.category")}
                                </label>
                                <select
                                    value={filters.category_id}
                                    onChange={e => handleFilterChange("category_id", e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                                >
                                    <option value="">{t("products.allCategories")}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {td(cat.product_cat_name)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    {t("products.priceRange")}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder={t("products.min")}
                                        value={filters.min_price}
                                        onChange={e => handleFilterChange("min_price", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                    <input
                                        type="number"
                                        placeholder={t("products.max")}
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
                                        {t("products.productType")}
                                    </label>
                                    <select
                                        value={filters.product_type}
                                        onChange={e => handleFilterChange("product_type", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                                    >
                                        <option value="">{t("products.allTypes")}</option>
                                        {productTypes.map(type => (
                                            <option key={type} value={type}>{td(type)}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Seller Filter */}
                            {sellers.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        {t("products.seller")}
                                    </label>
                                    <select
                                        value={filters.seller_id}
                                        onChange={e => handleFilterChange("seller_id", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                                    >
                                        <option value="">{t("products.allSellers")}</option>
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
                                <p className="text-slate-600 font-bold text-lg">{t("products.noProducts")}</p>
                                <p className="text-slate-400 text-sm mt-1">{t("products.tryFilters")}</p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
                                    >
                                        {t("products.clearAllFilters")}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {products.map(product => (
                                    <AllProductsProductCard
                                        key={product.id}
                                        product={product}
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

export default AllProductsPage;
