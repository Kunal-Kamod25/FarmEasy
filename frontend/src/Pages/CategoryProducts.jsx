import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { 
  Loader, ChevronDown, ChevronRight, 
  Filter, Package, Sprout, Check, RotateCcw
} from "lucide-react";
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
              limit: 50,
            },
          }
        );

        const fetchedProducts = productsRes.data || [];
        setAllProducts(fetchedProducts);

        // Fetch category details from categories API to get the correct name
        let categoryName = "Products";
        let categoryDesc = "Browse our collection";
        let categoryImage = null;
        let mainCategory = null;

        try {
          const categoriesRes = await axios.get(`${API_URL}/api/categories`);
          const allCategories = categoriesRes.data?.data || [];
          
          // Helper to find category or subcategory in the hierarchy
          const findCategory = (cats, id) => {
            for (const c of cats) {
              if (c.id == id) return c;
              if (c.subcategories) {
                const found = findCategory(c.subcategories, id);
                if (found) return found;
              }
            }
            return null;
          };

          mainCategory = findCategory(allCategories, categoryId);
          if (mainCategory) {
            categoryName = mainCategory.name;
            categoryDesc = mainCategory.description || `Browse our collection of ${categoryName.toLowerCase()}`;
            categoryImage = mainCategory.image;
            setSubcategories(mainCategory.subcategories || []);
          } else if (fetchedProducts.length > 0) {
            // Fallback to first product's category name if not found in hierarchy
            categoryName = fetchedProducts[0].category_name || "Products";
          }
        } catch (err) {
          console.error("Error fetching category info:", err);
        }

        setCategory({
          id: categoryId,
          name: categoryName,
          product_cat_name: categoryName,
          description: categoryDesc,
          image: categoryImage
        });

        // Apply sub-filter from URL param if present (sub is subcategory id or name)
        if (subFilter) {
          const filtered = fetchedProducts.filter(p =>
            p.category_id == subFilter || 
            (p.product_name || p.name || "").toLowerCase().includes(subFilter.toLowerCase())
          );
          setProducts(filtered);
          
          // Find the name for the selected subcategory id if possible
          const subObj = (mainCategory?.subcategories || []).find(s => s.id == subFilter);
          setSelectedSubcategory(subObj ? subObj.name : subFilter);
        } else {
          setProducts(fetchedProducts);
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
  }, [categoryId, subFilter]);

  // ===== HANDLE SUBCATEGORY FILTER (local, no API call needed) =====
  const handleSubcategoryClick = (sub) => {
    setSelectedSubcategory(sub.name || sub.subcategory_name);
    // Filter locally from the full product list by exact category_id match
    const filtered = allProducts.filter(p => p.category_id == sub.id);
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
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
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
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl shadow-emerald-500/5 p-10 mb-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                  <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                  <span className="text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px]">
                      Collection / {category?.name || category?.product_cat_name}
                  </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                {category?.name || category?.product_cat_name}
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl font-medium">
                {category?.description ||
                  `Explore our curated selection of premium ${(category?.name || category?.product_cat_name || "").toLowerCase()} tools and inputs.`}
              </p>
              <div className="flex items-center gap-4 pt-2">
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-4 py-2 rounded-2xl border border-emerald-100 uppercase tracking-widest">
                   {products.length} Items Found
                </span>
              </div>
            </div>
            {category?.image && (
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-48 h-48 object-contain rounded-3xl relative z-10 drop-shadow-2xl hover:scale-110 transition-transform duration-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* SUBCATEGORIES DROPDOWN FILTER */}
        {subcategories.length > 0 && (
          <div className="mb-12 flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-full md:w-96 group">
                <label className="absolute -top-3 left-6 bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] z-10">
                    Filter Results
                </label>
              <button
                onClick={() => setSubDropdownOpen(!subDropdownOpen)}
                className={`w-full flex items-center justify-between p-5 bg-white border-2 rounded-[1.5rem] transition-all duration-300 ${
                  subDropdownOpen 
                  ? "border-emerald-500 shadow-xl shadow-emerald-500/10" 
                  : "border-slate-100 hover:border-emerald-400 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${selectedSubcategory ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                        <Sprout size={18} />
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs">
                    {selectedSubcategory
                        ? selectedSubcategory
                        : `All ${category?.name || category?.product_cat_name}`}
                    </span>
                </div>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    subDropdownOpen ? "rotate-180 text-emerald-500" : "text-slate-400"
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {subDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {/* All Products Option */}
                    <button
                      onClick={() => {
                        handleResetSubcategory();
                        setSubDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                        !selectedSubcategory 
                        ? "bg-emerald-50 text-emerald-600" 
                        : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RotateCcw size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">All {category?.name || category?.product_cat_name}</span>
                      </div>
                      {!selectedSubcategory && <Check size={14} />}
                    </button>

                    <div className="h-px bg-slate-50 my-2 mx-4" />

                    {/* Subcategory Options */}
                    {subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          handleSubcategoryClick(sub);
                          setSubDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                          selectedSubcategory === (sub.name || sub.subcategory_name)
                            ? "bg-emerald-50 text-emerald-600"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                            <Sprout size={14} />
                            <span className="text-[10px] font-black uppercase tracking-wider">
                                {sub.name || sub.subcategory_name}
                            </span>
                        </div>
                        {selectedSubcategory === (sub.name || sub.subcategory_name) && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedSubcategory && (
                <button 
                    onClick={handleResetSubcategory}
                    className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-6 py-3 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-red-100"
                >
                    <RotateCcw size={14} /> Reset Filter
                </button>
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {loading ? (
          <LoadingSkeleton count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
