import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Upload, X, Plus, ArrowLeft, Sprout, Sparkles, 
  Leaf, ShieldCheck, Tag, ShoppingBag, Package, 
  Layers, Palette, IndianRupee, FileText, AlertCircle, Check
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL, getImageUrl } from '../../config';
import { useToast } from "../../context/ToastContext";

const VendorAddProduct = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    price: "",
    category_id: "",
    subcategory_id: "",
    brand_id: "",
    product_quantity: "",
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states for inline add
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);

  const [addingCategory, setAddingCategory] = useState(false);
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [addingBrand, setAddingBrand] = useState(false);

  const [newCategoryData, setNewCategoryData] = useState({ name: "", description: "" });
  const [newSubcategoryData, setNewSubcategoryData] = useState({ name: "", description: "" });
  const [newBrandData, setNewBrandData] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      const data = res.data?.data || res.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/brands`);
      const data = res.data?.data || res.data || [];
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching brands:", err);
      setBrands([]);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryData.name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    setAddingCategory(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/vendor/categories`,
        newCategoryData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        showToast("Category added successfully!", "success");
        await fetchCategories();
        setFormData(prev => ({ ...prev, category_id: res.data.data.id, subcategory_id: "" }));
        setNewCategoryData({ name: "", description: "" });
        setShowAddCategoryModal(false);
        setSubcategories([]);
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add category", "error");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategoryData.name.trim()) {
      showToast("Subcategory name is required", "error");
      return;
    }
    if (!formData.category_id) {
      showToast("Please select a parent category first", "error");
      return;
    }

    setAddingSubcategory(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/vendor/categories/subcategory`,
        { parentId: formData.category_id, ...newSubcategoryData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        showToast("Subcategory added successfully!", "success");
        const catRes = await axios.get(`${API_URL}/api/categories/${formData.category_id}`);
        const subs = catRes.data?.data?.subcategories || [];
        setSubcategories(Array.isArray(subs) ? subs : []);
        setFormData(prev => ({ ...prev, subcategory_id: res.data.data.id }));
        setNewSubcategoryData({ name: "", description: "" });
        setShowAddSubcategoryModal(false);
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add subcategory", "error");
    } finally {
      setAddingSubcategory(false);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandData.name.trim()) {
      showToast("Brand name is required", "error");
      return;
    }

    setAddingBrand(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/brands`,
        newBrandData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        showToast("Brand added successfully!", "success");
        await fetchBrands();
        setFormData(prev => ({ ...prev, brand_id: res.data.data.id }));
        setNewBrandData({ name: "", description: "" });
        setShowAddBrandModal(false);
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add brand", "error");
    } finally {
      setAddingBrand(false);
    }
  }

  useEffect(() => {
    if (formData.category_id) {
      axios.get(`${API_URL}/api/categories/${formData.category_id}`)
        .then(res => {
          const subs = res.data?.data?.subcategories || [];
          setSubcategories(Array.isArray(subs) ? subs : []);
        })
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
    setFormData(prev => ({ ...prev, subcategory_id: '' }));
  }, [formData.category_id]);

  useEffect(() => {
    if (formData.category_id) {
      axios.get(`${API_URL}/api/products/all?category_id=${formData.category_id}`)
        .then(res => setProductsByCategory(res.data))
        .catch(() => setProductsByCategory([]));
    } else {
      setProductsByCategory([]);
    }
  }, [formData.category_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...imagePreviews]);
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append("product_name", formData.product_name);
      submitData.append("product_description", formData.product_description);
      submitData.append("price", formData.price);
      
      // Send the most specific ID (subcategory if selected, otherwise category)
      const finalCategoryId = formData.subcategory_id || formData.category_id;
      submitData.append("category_id", finalCategoryId);
      submitData.append("brand_id", formData.brand_id);
      submitData.append("product_quantity", formData.product_quantity);

      if (images.length > 0) {
        submitData.append("product_image", images[0].file);
      }

      await axios.post(
        `${API_URL}/api/vendor/products`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast("Product added successfully!", "success");
      setFormData({
        product_name: "",
        product_description: "",
        price: "",
        category_id: "",
        subcategory_id: "",
        brand_id: "",
        product_quantity: "",
      });
      setImages([]);
      navigate("/vendor/products");
    } catch (error) {
      console.error("Add product error:", error.response?.data || error);
      showToast(error.response?.data?.message || "Failed to add product", "error");
    } finally {
      setLoading(false);
    }
  };

  const fieldShell =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-emerald-300/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-200/20";

  return (
    <div className="min-h-screen bg-[#04110d] lg:grid lg:grid-cols-[0.95fr_1.05fr] font-Lora text-white">
      {/* ASIDE: DECORATIVE PANEL */}
      <aside className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(circle_at_top_left,_rgba(134,239,172,0.18),_transparent_32%),radial-gradient(circle_at_80%_18%,_rgba(45,212,191,0.16),_transparent_28%),linear-gradient(135deg,_#02110b_0%,_#041b13_45%,_#0a2a1d_100%)] px-6 py-10 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative flex min-h-[280px] flex-col justify-between lg:min-h-[calc(100vh-6rem)]">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-xl">
            <Sprout className="h-4 w-4 text-emerald-200" />
            Vendor Portal
          </div>

          <div className="max-w-xl pt-16 lg:pt-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100/80 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              Grow your business
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              List Your Produce & Reach Thousands
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
              Showcase your crops, tools, or fertilizers to a massive network of farmers and buyers. Fast, secure, and intuitive.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Package,
                  title: "Direct Sales",
                  text: "Sell your harvest directly to customers with zero effort.",
                },
                {
                  icon: ShieldCheck,
                  title: "Trusted Network",
                  text: "Your listings are seen by verified buyers in our marketplace.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
                    <Icon className="h-5 w-5 text-emerald-200" />
                    <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="hidden max-w-md text-sm leading-6 text-white/55 lg:block">
            Need help? Our vendor support team is here to assist you with inventory management and sales optimization.
          </p>
        </div>
      </aside>

      {/* MAIN: FORM PANEL */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-emerald-950/25 backdrop-blur-2xl sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100/70">Inventory</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Add Product</h2>
            </div>
            <button
              onClick={() => navigate("/vendor/products")}
              className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
            >
              <ArrowLeft size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <ShoppingBag size={14} className="text-emerald-300/60" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Organic Wheat Seeds"
                  className={fieldShell}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <Layers size={14} className="text-emerald-300/60" />
                  Category *
                </label>
                <div className="flex gap-2">
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className={`${fieldShell} appearance-none flex-1`}
                  >
                    <option value="" className="bg-[#0a2a1d]">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-[#0a2a1d]">
                        {cat.name || cat.product_cat_name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    className="rounded-2xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-3 text-emerald-300 hover:bg-emerald-500/20 transition flex items-center justify-center"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <Tag size={14} className="text-emerald-300/60" />
                  Sub-Category
                </label>
                <div className="flex gap-2">
                  <select
                    name="subcategory_id"
                    value={formData.subcategory_id}
                    onChange={handleChange}
                    disabled={subcategories.length === 0}
                    className={`${fieldShell} appearance-none flex-1 ${subcategories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="" className="bg-[#0a2a1d]">Select sub-category</option>
                    {subcategories.map(sub => (
                      <option key={sub.id} value={sub.id} className="bg-[#0a2a1d]">
                        {sub.name || sub.subcategory_name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddSubcategoryModal(true)}
                    disabled={!formData.category_id}
                    className={`rounded-2xl border px-4 py-3 transition flex items-center justify-center ${
                      formData.category_id
                        ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                        : "border-white/10 bg-white/5 text-white/30 cursor-not-allowed"
                    }`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-300/60" />
                  Brand
                </label>
                <div className="flex gap-2">
                  <select
                    name="brand_id"
                    value={formData.brand_id}
                    onChange={handleChange}
                    className={`${fieldShell} appearance-none flex-1`}
                  >
                    <option value="" className="bg-[#0a2a1d]">Select brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id} className="bg-[#0a2a1d]">
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddBrandModal(true)}
                    className="rounded-2xl border border-violet-400/50 bg-violet-500/10 px-4 py-3 text-violet-300 hover:bg-violet-500/20 transition flex items-center justify-center"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <IndianRupee size={14} className="text-emerald-300/60" />
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className={fieldShell}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <Package size={14} className="text-emerald-300/60" />
                  Stock
                </label>
                <input
                  type="number"
                  name="product_quantity"
                  value={formData.product_quantity}
                  onChange={handleChange}
                  placeholder="Units"
                  className={fieldShell}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <FileText size={14} className="text-emerald-300/60" />
                Description
              </label>
              <textarea
                rows="3"
                name="product_description"
                value={formData.product_description}
                onChange={handleChange}
                placeholder="Describe your product details..."
                className={`${fieldShell} resize-none h-24`}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white/80">Product Images</label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 py-8 cursor-pointer hover:border-emerald-300/40 hover:bg-white/8 transition-all">
                  <div className="rounded-full bg-emerald-500/10 p-3 group-hover:bg-emerald-500/20 transition">
                    <Upload className="text-emerald-300/80" size={24} />
                  </div>
                  <span className="mt-2 text-xs font-semibold text-white/60 group-hover:text-white/80">Click to upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                {images.length > 0 && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 group h-32">
                    <img src={images[0].preview} alt="preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(0)}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white/80 hover:bg-black/80 hover:text-white transition opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Plus size={18} />
                  Save Product
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* FOOTER-LIKE INFO: CATEGORY EXPLORE */}
      {formData.category_id && productsByCategory.length > 0 && (
        <div className="lg:col-span-2 px-6 py-12 border-t border-white/5 bg-white/2">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <Sprout className="text-emerald-400" />
              More in this Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productsByCategory.slice(0, 4).map(prod => (
                <div key={prod.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  {prod.product_image && (
                    <img src={getImageUrl(prod.product_image)} alt={prod.product_name} className="h-32 w-full object-cover rounded-xl mb-4" />
                  )}
                  <p className="font-semibold text-white truncate">{prod.product_name}</p>
                  <p className="text-sm text-white/50">₹{prod.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <AddCategoryModal
        open={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSubmit={handleAddCategory}
        loading={addingCategory}
        data={newCategoryData}
        onChange={setNewCategoryData}
      />

      <AddSubcategoryModal
        open={showAddSubcategoryModal}
        onClose={() => setShowAddSubcategoryModal(false)}
        onSubmit={handleAddSubcategory}
        loading={addingSubcategory}
        data={newSubcategoryData}
        onChange={setNewSubcategoryData}
      />

      <AddBrandModal
        open={showAddBrandModal}
        onClose={() => setShowAddBrandModal(false)}
        onSubmit={handleAddBrand}
        loading={addingBrand}
        data={newBrandData}
        onChange={setNewBrandData}
      />
    </div>
  );
};

export default VendorAddProduct;

// Modal for adding category
function AddCategoryModal({ open, onClose, onSubmit, loading, data, onChange }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="rounded-[2rem] border border-white/10 bg-[#04110d] p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Add New Category</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/60">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. Organic Seeds"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-emerald-300/60 focus:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Description</label>
            <textarea
              placeholder="Describe this category..."
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              rows="3"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-emerald-300/60 focus:bg-white/10"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal for adding subcategory
function AddSubcategoryModal({ open, onClose, onSubmit, loading, data, onChange }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="rounded-[2rem] border border-white/10 bg-[#04110d] p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Add New Subcategory</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/60">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Subcategory Name *</label>
            <input
              type="text"
              placeholder="e.g. Hybrid Seeds"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-cyan-300/60 focus:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Description</label>
            <textarea
              placeholder="Describe this subcategory..."
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              rows="3"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-cyan-300/60 focus:bg-white/10"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Subcategory"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal for adding brand
function AddBrandModal({ open, onClose, onSubmit, loading, data, onChange }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="rounded-[2rem] border border-white/10 bg-[#04110d] p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Add New Brand</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/60">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Brand Name *</label>
            <input
              type="text"
              placeholder="e.g. Syngenta"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-violet-300/60 focus:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Description</label>
            <textarea
              placeholder="Describe this brand..."
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              rows="3"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-violet-300/60 focus:bg-white/10"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Brand"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}