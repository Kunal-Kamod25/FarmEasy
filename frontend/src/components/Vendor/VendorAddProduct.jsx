import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  Upload, X, Plus, ArrowLeft, Sprout, Sparkles, 
  ShieldCheck, ShoppingBag, Package, 
  Layers, Palette, IndianRupee, FileText, CheckCircle, Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../config';

const VendorAddProduct = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    price: "",
    category_id: "",
    subcategory_id: "",
    color: "",
    product_quantity: "",
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── DATA FETCHING ──
  useEffect(() => {
    axios.get(`${API_URL}/api/categories`)
      .then(res => {
        const data = res.data?.data || res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (formData.category_id) {
      axios.get(`${API_URL}/api/categories/${formData.category_id}/subcategories`)
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

  // ── HANDLERS ──
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
      submitData.append("category_id", formData.category_id);
      submitData.append("subcategory_id", formData.subcategory_id);
      submitData.append("color", formData.color);
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

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate("/vendor/products");
      }, 2000);

    } catch (error) {
      console.error("Add product error:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04110d] p-6 bg-[radial-gradient(circle_at_top_left,_rgba(134,239,172,0.14),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.14),_transparent_28%),linear-gradient(145deg,_#03110c_0%,_#072117_45%,_#0b2d20_100%)] font-Lora text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
           <button
             onClick={() => navigate("/vendor/products")}
             className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition backdrop-blur-xl"
           >
             <ArrowLeft size={20} />
           </button>
           <div>
             <h1 className="text-3xl font-bold text-white">Add New Product</h1>
             <p className="text-white/65 text-sm mt-0.5">List your items in the marketplace</p>
           </div>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-emerald-400/15 text-emerald-100 px-4 py-2 rounded-xl border border-emerald-300/25 text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle size={16} />
            Product listed successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Media & Stats */}
          <div className="space-y-6">
            
            {/* Image Upload Card */}
            <div className="bg-white/5 rounded-3xl shadow-xl shadow-emerald-950/15 border border-white/10 p-6 flex flex-col items-center backdrop-blur-xl">
               <h3 className="text-sm font-bold text-white mb-5 w-full flex items-center gap-2">
                 <Upload size={16} className="text-emerald-100" />
                 Product Media
               </h3>
               
               <div className="w-full">
                  {images.length > 0 ? (
                    <div className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-square mb-4">
                       <img src={images[0].preview} alt="preview" className="h-full w-full object-cover" />
                       <button
                         type="button"
                         onClick={() => removeImage(0)}
                         className="absolute right-3 top-3 rounded-xl bg-rose-500 p-2 text-white shadow-xl hover:bg-rose-400 transition"
                       >
                         <X size={16} />
                       </button>
                    </div>
                  ) : (
                    <label className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 aspect-square cursor-pointer hover:border-emerald-300/40 hover:bg-emerald-500/5 transition-all mb-4">
                       <div className="rounded-2xl bg-emerald-500/10 p-4 group-hover:bg-emerald-500/20 transition">
                         <Upload className="text-emerald-300/80" size={32} />
                       </div>
                       <span className="mt-3 text-sm font-semibold text-white/40 group-hover:text-white/70">Click to upload photo</span>
                       <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">Supports JPG, PNG, WebP</p>
                       <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
               </div>

               <div className="w-full pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Verified listing status</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span>Boosted visibility in search</span>
                  </div>
               </div>
            </div>

            {/* Quick Tips Card */}
            <div className="bg-white/5 rounded-3xl shadow-xl shadow-emerald-950/15 border border-white/10 p-6 backdrop-blur-xl">
               <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                 <Sprout size={16} className="text-emerald-100" />
                 Listing Tips
               </h3>
               <ul className="space-y-3">
                 {[
                   "Use clear, well-lit photos for better sales.",
                   "Provide an accurate description and quantity.",
                   "Select the right category for visibility.",
                   "Double-check your price against market rates."
                 ].map((tip, i) => (
                   <li key={i} className="flex gap-3 text-xs text-white/50 leading-relaxed">
                     <span className="h-1.5 w-1.5 mt-1.5 shrink-0 rounded-full bg-emerald-500" />
                     {tip}
                   </li>
                 ))}
               </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Info Card */}
            <div className="bg-white/5 rounded-3xl shadow-xl shadow-emerald-950/15 border border-white/10 p-8 backdrop-blur-xl">
               <h2 className="text-base font-bold text-white mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
                 <ShoppingBag size={18} className="text-emerald-100" />
                 General Information
               </h2>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80">Product Name *</label>
                    <input
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Premium Organic Wheat"
                      className="w-full border border-white/15 bg-white/5 text-white rounded-xl px-4 py-3 text-sm placeholder:text-white/35 focus:ring-2 focus:ring-emerald-300/35 focus:border-transparent focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80">Description</label>
                    <textarea
                      name="product_description"
                      value={formData.product_description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Describe your product heritage, quality, and usage..."
                      className="w-full border border-white/15 bg-white/5 text-white rounded-xl px-4 py-3 text-sm placeholder:text-white/35 focus:ring-2 focus:ring-emerald-300/35 focus:border-transparent focus:outline-none transition resize-none"
                    />
                  </div>
               </div>
            </div>

            {/* Inventory & Pricing Card */}
            <div className="bg-white/5 rounded-3xl shadow-xl shadow-emerald-950/15 border border-white/10 p-8 backdrop-blur-xl">
               <h2 className="text-base font-bold text-white mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
                 <Package size={18} className="text-emerald-100" />
                 Classification & Inventory
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                      <Layers size={14} className="text-emerald-300/60" />
                      Category *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full border border-white/15 bg-[#0a2a1d]/40 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-300/35 focus:outline-none transition appearance-none"
                    >
                      <option value="" className="bg-[#0a2a1d]">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#0a2a1d]">
                          {cat.name || cat.product_cat_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                      <Plus size={14} className="text-emerald-300/60" />
                      Sub-Category
                    </label>
                    <select
                      name="subcategory_id"
                      value={formData.subcategory_id}
                      onChange={handleChange}
                      disabled={subcategories.length === 0}
                      className="w-full border border-white/15 bg-[#0a2a1d]/40 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-300/35 focus:outline-none transition appearance-none disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-[#0a2a1d]">Select Sub-Category</option>
                      {subcategories.map(sub => (
                        <option key={sub.id} value={sub.id} className="bg-[#0a2a1d]">
                          {sub.name || sub.subcategory_name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      className="w-full border border-white/15 bg-white/5 text-white rounded-xl px-4 py-3 text-sm placeholder:text-white/35 focus:ring-2 focus:ring-emerald-300/35 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                      <Package size={14} className="text-emerald-300/60" />
                      Quantity / Stock
                    </label>
                    <input
                      type="number"
                      name="product_quantity"
                      value={formData.product_quantity}
                      onChange={handleChange}
                      placeholder="Units available"
                      className="w-full border border-white/15 bg-white/5 text-white rounded-xl px-4 py-3 text-sm placeholder:text-white/35 focus:ring-2 focus:ring-emerald-300/35 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                      <Palette size={14} className="text-emerald-300/60" />
                      Color Option
                    </label>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full border border-white/15 bg-[#0a2a1d]/40 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-300/35 focus:outline-none transition appearance-none"
                    >
                      <option value="" className="bg-[#0a2a1d]">Select Color</option>
                      {["Red", "Green", "Blue", "Yellow", "Orange", "Black", "White", "Brown", "Gray"].map(c => (
                        <option key={c} value={c} className="bg-[#0a2a1d]">{c}</option>
                      ))}
                    </select>
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
               <button
                 type="button"
                 onClick={() => navigate("/vendor/products")}
                 className="px-8 py-3 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition font-semibold"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 disabled={loading}
                 className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold px-10 py-3 rounded-2xl shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.02] active:scale-95"
               >
                 {loading ? (
                   <>
                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                     Publishing...
                   </>
                 ) : (
                   <>
                     <Save size={18} />
                     List Product
                   </>
                 )}
               </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VendorAddProduct;