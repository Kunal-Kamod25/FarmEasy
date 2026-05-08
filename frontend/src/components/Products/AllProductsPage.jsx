import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import ProfessionalSelect from "../Common/ProfessionalSelect";

const DEFAULT_FILTERS = {
    search: "",
    category_id: "",
    brand_id: "",
    color: "",
    min_price: "",
    max_price: "",
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
        brand_id: getParam("brand_id", "brand"),
        color: getParam("color"),
        min_price: getParam("min_price"),
        max_price: getParam("max_price"),
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
    const [brands, setBrands] = useState([]);
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
                const [catRes, brandRes, sellerRes] = await Promise.all([
                    axios.get(`${API_URL}/api/categories`),
                    axios.get(`${API_URL}/api/products/meta/brands`),
                    axios.get(`${API_URL}/api/products/meta/sellers`)
                ]);
                
                // Fix: Extract data correctly from the response object
                const catData = catRes.data?.data || catRes.data || [];
                setCategories(Array.isArray(catData) ? catData : []);

                const brandData = brandRes.data?.data || brandRes.data || [];
                setBrands(Array.isArray(brandData) ? brandData : []);

                const sellerData = sellerRes.data?.data || sellerRes.data || [];
                setSellers(Array.isArray(sellerData) ? sellerData : []);
                
            } catch (err) {
                console.error("Failed to load filter data:", err);
                // Fallback to empty arrays on error
                setCategories([]);
                setBrands([]);
                setSellers([]);
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

    const groupedProducts = useMemo(() => {
        const groups = new Map();

        products.forEach((product) => {
            const groupKey = product.category_id ?? product.category_name ?? "uncategorized";
            const groupLabel = td(product.category_name || product.category || "Uncategorized");

            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    key: groupKey,
                    label: groupLabel,
                    items: []
                });
            }

            groups.get(groupKey).items.push(product);
        });

        return Array.from(groups.values());
    }, [products, td]);

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
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* search box */}
                    <div className="relative flex-1 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={t("products.searchPlaceholder")}
                            value={filters.search}
                            onChange={e => handleFilterChange("search", e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 focus:outline-none transition-all shadow-sm hover:shadow-md"
                        />
                    </div>

                    {/* sort dropdown */}
                    <div className="relative group min-w-[200px]">
                        <ArrowUpDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors pointer-events-none z-10" />
                        <select
                            value={filters.sort}
                            onChange={e => handleFilterChange("sort", e.target.value)}
                            className="w-full pl-12 pr-10 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 focus:outline-none appearance-none cursor-pointer transition-all shadow-sm hover:shadow-md"
                        >
                            <option value="newest">{t("products.sort.newest")}</option>
                            <option value="oldest">{t("products.sort.oldest")}</option>
                            <option value="price_asc">{t("products.sort.priceAsc")}</option>
                            <option value="price_desc">{t("products.sort.priceDesc")}</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>          </div>

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
                        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-2xl shadow-emerald-500/5 p-7 space-y-9 sticky top-6">
                            <div className="flex items-center justify-between border-b border-emerald-100 pb-5">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-[0.15em] text-xs">
                                    <Filter size={18} className="text-emerald-600" />
                                    {t("products.filters")}
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-[10px] bg-red-50 text-red-500 px-4 py-2 rounded-2xl hover:bg-red-100 font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <RotateCcw size={12} /> {t("products.clearAll")}
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <ProfessionalSelect 
                                label={t("products.category")}
                                options={[
                                    { id: "", name: t("products.allCategories") },
                                    ...categories.map(cat => ({ id: cat.id, name: td(cat.name || cat.product_cat_name) }))
                                ]}
                                value={filters.category_id}
                                onChange={val => handleFilterChange("category_id", val)}
                                icon={Sprout}
                            />

                            {/* Brand Filter */}
                            <ProfessionalSelect 
                                label={t("products.brand")}
                                options={[
                                    { id: "", name: t("products.allBrands") },
                                    ...brands.map(brand => ({ id: brand.id, name: brand.name }))
                                ]}
                                value={filters.brand_id}
                                onChange={val => handleFilterChange("brand_id", val)}
                                icon={Package}
                            />

                            {/* Price Range */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                    {t("products.priceRange")}
                                </label>
                                <div className="flex flex-col gap-3">
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold group-focus-within:text-emerald-500 transition-colors">₹</span>
                                        <input
                                            type="number"
                                            placeholder={t("products.min")}
                                            value={filters.min_price}
                                            onChange={e => handleFilterChange("min_price", e.target.value)}
                                            className="w-full bg-white border border-slate-100 rounded-2xl pl-10 pr-4 py-4 text-xs font-black uppercase tracking-widest text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold group-focus-within:text-emerald-500 transition-colors">₹</span>
                                        <input
                                            type="number"
                                            placeholder={t("products.max")}
                                            value={filters.max_price}
                                            onChange={e => handleFilterChange("max_price", e.target.value)}
                                            className="w-full bg-white border border-slate-100 rounded-2xl pl-10 pr-4 py-4 text-xs font-black uppercase tracking-widest text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seller Filter */}
                            {sellers.length > 0 && (
                                <ProfessionalSelect 
                                    label={t("products.seller")}
                                    options={[
                                        { id: "", name: t("products.allSellers") },
                                        ...sellers.map(seller => ({ id: seller.id, name: seller.name }))
                                    ]}
                                    value={filters.seller_id}
                                    onChange={val => handleFilterChange("seller_id", val)}
                                    icon={Filter}
                                />
                            )}                            )}
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
                            <div className="space-y-10">
                                {groupedProducts.map((group) => (
                                    <section key={group.key} className="space-y-6 pb-12">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-sm font-black text-emerald-700 uppercase tracking-[0.2em]">
                                                {group.label}
                                            </h2>
                                            <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent" />
                                            <span className="text-[10px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                                {group.items.length} ITEMS
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                            {group.items.map((product) => (
                                                <AllProductsProductCard
                                                    key={product.id}
                                                    product={product}
                                                    onToggleWishlist={toggleWishlist}
                                                    isWishlisted={isWishlisted(product.id)}
                                                    onViewDetail={() => navigate(`/product/${product.id}`)}
                                                />
                                            ))}
                                        </div>
                                    </section>
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
