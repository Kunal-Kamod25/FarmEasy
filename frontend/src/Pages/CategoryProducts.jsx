import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { Loader, ChevronDown } from "lucide-react";
import { ProductCard, LoadingSkeleton, EmptyState } from "../components/HomeSections/HomeProductCard";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

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
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);
  const { addToCart } = useCart();

  // ===== FETCH CATEGORY DETAILS =====
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setLoading(true);

        // Get all products filtered by category_id
        const productsRes = await axios.get(
          `${API_URL}/api/products/all`,
          {
            params: {
              category_id: categoryId,
              sort: sortBy === "price_asc" ? "price_asc" : 
                    sortBy === "price_desc" ? "price_desc" : 
                    sortBy === "oldest" ? "oldest" : "newest",
              limit: 50,
            },
          }
        );

        const fetchedProducts = productsRes.data || [];
        setAllProducts(fetchedProducts);

        // Extract category info from first product or use default
        if (fetchedProducts.length > 0) {
          const categoryName = fetchedProducts[0].category_name || "Products";
          setCategory({
            id: categoryId,
            name: categoryName,
            product_cat_name: categoryName,
            description: `Browse our collection of ${categoryName.toLowerCase()}`,
          });
        } else {
          setCategory({
            id: categoryId,
            name: "Category",
            product_cat_name: "Category",
            description: "Browse our collection",
          });
        }

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

        // Get subcategories from categories API
        try {
          const categoriesRes = await axios.get(`${API_URL}/api/categories`);
          const allCategories = categoriesRes.data?.data || [];
          
          // Find category by id and get its subcategories
          const mainCategory = allCategories.find(c => c.id == categoryId);
          if (mainCategory && mainCategory.subcategories) {
            setSubcategories(mainCategory.subcategories || []);
          }
        } catch {
          // Subcategories not found or not available
        }
      } catch (error) {
        console.error("Error fetching category products:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryDetails();
    }
  }, [categoryId, sortBy, subFilter]);

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

        {/* SUBCATEGORIES DROPDOWN FILTER */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <div className="relative inline-block w-full md:w-80">
              <button
                onClick={() => setSubDropdownOpen(!subDropdownOpen)}
                className="w-full px-4 py-3 bg-white border-2 border-emerald-500 rounded-lg font-semibold text-emerald-700 hover:bg-emerald-50 transition flex items-center justify-between"
              >
                <span>
                  {selectedSubcategory
                    ? `Showing: ${selectedSubcategory}`
                    : `All ${category?.name || category?.product_cat_name}`}
                </span>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    subDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {subDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-emerald-500 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {/* All Products Option */}
                  <button
                    onClick={() => {
                      handleResetSubcategory();
                      setSubDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-gray-200 font-semibold text-emerald-700 transition"
                  >
                    ✓ All {category?.name || category?.product_cat_name}
                  </button>

                  {/* Subcategory Options */}
                  {subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        handleSubcategoryClick(sub.name || sub.subcategory_name);
                        setSubDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-gray-200 transition ${
                        selectedSubcategory === (sub.name || sub.subcategory_name)
                          ? "bg-emerald-100 text-emerald-700 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {selectedSubcategory === (sub.name || sub.subcategory_name)
                        ? "✓ "
                        : ""}
                      {sub.name || sub.subcategory_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {loading ? (
          <LoadingSkeleton count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {products.map((product) => (
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
        ) : (
          <EmptyState message={`No products found in ${selectedSubcategory ? selectedSubcategory : category?.name || "this category"}. Try selecting a different type or check back soon.`} />
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
