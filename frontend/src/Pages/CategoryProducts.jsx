import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import {
  Loader,
  Grid3X3,
  List,
  SlidersHorizontal,
  ChevronRight,
  Package,
} from "lucide-react";
import AllProductsProductCard from "../components/Products/AllProductsProductCard";
import { useWishlist } from "../context/WishlistContext";

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subFilter = searchParams.get("sub"); // e.g. ?sub=Pesticides
  const { isWishlisted, toggleWishlist } = useWishlist();

  // ===== STATE =====
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // full list before sub-filter
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // ===== FETCH CATEGORY DETAILS =====
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setLoading(true);

        // Get category info
        const catRes = await axios.get(
          `${API_URL}/api/categories/${categoryId}`,
          {
            params: {
              limit: 50,
              page: 1,
              sortBy: sortBy,
            },
          }
        );

        setCategory(catRes.data?.data?.category);
        const fetchedProducts = catRes.data?.data?.products || [];
        setAllProducts(fetchedProducts);
        // Apply sub-filter from URL param if present
        if (subFilter) {
          const filtered = fetchedProducts.filter(p =>
            (p.product_name || p.name || "").toLowerCase().includes(subFilter.toLowerCase()) ||
            (p.product_description || "").toLowerCase().includes(subFilter.toLowerCase()) ||
            (p.product_type || "").toLowerCase().includes(subFilter.toLowerCase())
          );
          setProducts(filtered);
          setSelectedSubcategory(subFilter);
        } else {
          setProducts(fetchedProducts);
        }

        // Get subcategories
        try {
          const subRes = await axios.get(
            `${API_URL}/api/categories/${categoryId}/subcategories`
          );
          setSubcategories(subRes.data?.data?.subcategories || []);
        } catch {
          console.log("No subcategories found");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryDetails();
    }
  }, [categoryId, sortBy]);

  // ===== HANDLE SUBCATEGORY FILTER (local, no API call needed) =====
  const handleSubcategoryClick = (subName) => {
    setSelectedSubcategory(subName);
    // Filter locally from the full product list by name/description/type match
    const filtered = allProducts.filter(p =>
      (p.product_name || p.name || "").toLowerCase().includes(subName.toLowerCase()) ||
      (p.product_description || "").toLowerCase().includes(subName.toLowerCase()) ||
      (p.product_type || "").toLowerCase().includes(subName.toLowerCase())
    );
    setProducts(filtered);
  };

  const handleResetSubcategory = () => {
    setSelectedSubcategory(null);
    setProducts(allProducts);
  };

  if (loading && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
          <button
            onClick={() => navigate("/products")}
            className="hover:text-emerald-600 transition"
          >
            Products
          </button>
          <ChevronRight size={18} />
          <span className="font-semibold text-gray-900">
            {category?.name || category?.product_cat_name}
          </span>
        </div>

        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {category?.name || category?.product_cat_name}
              </h1>
              <p className="text-gray-600 max-w-2xl">
                {category?.description ||
                  `Browse our collection of ${(category?.name || category?.product_cat_name || "").toLowerCase()}`}
              </p>
            </div>
            {category?.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
          </div>

          <div className="text-sm text-gray-500">
            📦 {products.length} product{products.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* SUBCATEGORIES FILTER */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Filter by Type
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleResetSubcategory}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  !selectedSubcategory
                    ? "bg-emerald-600 text-white"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-600"
                }`}
              >
                All {category?.name || category?.product_cat_name}
              </button>

              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSubcategoryClick(sub.name || sub.subcategory_name)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    selectedSubcategory === (sub.name || sub.subcategory_name)
                      ? "bg-emerald-600 text-white"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-600"
                  }`}
                >
                  {sub.name || sub.subcategory_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONTROLS */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* SORT */}
            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* VIEW MODE */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition ${
                  viewMode === "grid"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition ${
                  viewMode === "list"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : products.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {products.map((product) => (
              <AllProductsProductCard
                key={product.id}
                product={product}
                isWishlisted={isWishlisted(product.id)}
                onWishlistToggle={() => toggleWishlist(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              No products found
            </h2>
            <p className="text-gray-500">
              Try selecting a different category or checking back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
