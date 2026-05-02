import React, { useEffect, useState } from "react";
import axios from "axios";
import { Upload, X, ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from '../../config';

const VendorEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    product_type: "",
    price: "",
    category_id: "",
    product_quantity: "",
  });

  const [images, setImages] = useState([]);
  const [currentImagePath, setCurrentImagePath] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/vendor/products/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const product = res.data || {};
        setFormData({
          product_name: product.product_name ?? "",
          product_description: product.product_description ?? "",
          product_type: product.product_type ?? "",
          price: product.price ?? "",
          category_id: product.category_id ?? "",
          product_quantity: product.product_quantity ?? "",
        });
        setCurrentImagePath(product.product_image || "");
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id, token]);

  const [categories, setCategories] = useState([]);
  
  // Fetch categories
  useEffect(() => {
    axios.get(`${API_URL}/api/categories`)
      .then(res => {
        const data = res.data?.data || res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Categories fetch error:", err));
  }, []);

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
    try {
      setLoading(true);

      const toFormValue = (value) => (value === null || value === undefined ? "" : value);
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, toFormValue(formData[key])));

      if (images.length > 0) {
        data.append("product_image", images[0].file);
      }

      await axios.put(
        `${API_URL}/api/vendor/products/${id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Product updated successfully!");
      navigate("/vendor/products");
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#04110d] p-6 flex justify-center items-center">
         <div className="flex items-center gap-3 text-emerald-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
            <span className="font-semibold text-sm tracking-widest uppercase">Loading Product...</span>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04110d] p-6 bg-[radial-gradient(circle_at_top_left,_rgba(134,239,172,0.14),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.14),_transparent_28%),linear-gradient(145deg,_#03110c_0%,_#072117_45%,_#0b2d20_100%)] font-Lora text-white">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/vendor/products")}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition backdrop-blur-xl"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Product</h1>
          <p className="text-white/65 text-sm mt-0.5">Update product details and inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Info Card */}
            <div className="bg-white/5 rounded-3xl shadow-xl shadow-emerald-950/15 border border-white/10 p-8 backdrop-blur-xl">
              <h2 className="text-base font-bold text-white mb-6 pb-3 border-b border-white/10">
                Basic Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Organic Wheat Seeds"
                    className="w-full border border-white/15 bg-white/5 text-white rounded-xl px-4 py-3 text-sm placeholder:text-white/35 focus:ring-2 focus:ring-emerald-300/35 focus:border-transparent focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">
                    Product Type
                  </label>
                  <input
                    type="text"
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleChange}
                    placeholder="e.g. Seeds, Fertilizer, Equipment"
                    className="w-full border border-white/15 bg-white/5 text-white rounded-xl px-4 py-3 text-sm placeholder:text-white/35 focus:ring-2 focus:ring-emerald-300/35 focus:border-transparent focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="w-full border border-white/15 bg-[#0a2a1d]/40 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-300/35 focus:outline-none transition appearance-none"
                  >
                    <option value="" className="bg-[#0a2a1d]">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-[#0a2a1d]">
                        {cat.name || cat.product_cat_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    name="product_description"
                    value={formData.product_description}
                    onChange={handleChange}
                    placeholder="Describe your product — quality, usage, benefits..."
                    className="w-full border border-white/15 bg-white/5 text-white rounded-xl px-4 py-3 text-sm placeholder:text-white/35 focus:ring-2 focus:ring-emerald-300/35 focus:border-transparent focus:outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Card */}
            <div className="bg-white/5 rounded-3xl shadow-xl shadow-emerald-950/15 border border-white/10 p-8 backdrop-blur-xl">
              <h2 className="text-base font-bold text-white mb-6 pb-3 border-b border-white/10">
                Pricing & Inventory
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-white/40 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                      className="w-full border border-white/15 bg-white/5 text-white rounded-xl pl-8 pr-4 py-3 text-sm placeholder:text-white/35 focus:ring-2 focus:ring-emerald-300/35 focus:border-transparent focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="product_quantity"
                    value={formData.product_quantity}
                    onChange={handleChange}
                    placeholder="Available units"
                    className="w-full border border-white/15 bg-white/5 text-white rounded-xl px-4 py-3 text-sm placeholder:text-white/35 focus:ring-2 focus:ring-emerald-300/35 focus:border-transparent focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Images & Actions */}
          <div className="space-y-6">

            {/* Image Upload Card */}
            <div className="bg-white/5 rounded-3xl shadow-xl shadow-emerald-950/15 border border-white/10 p-8 backdrop-blur-xl">
              <h2 className="text-base font-bold text-white mb-6 pb-3 border-b border-white/10">
                Product Images
              </h2>

              {currentImagePath && images.length === 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                    Current Image
                  </p>
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                    <img
                      src={resolveImageUrl(currentImagePath)}
                      alt="current product"
                      className="object-cover w-full h-36"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                      }}
                    />
                    <div
                      className="hidden h-36 items-center justify-center text-xs text-white/50"
                    >
                      Current image not found on server
                    </div>
                  </div>
                  <p className="text-[11px] text-white/40 mt-2">
                    Keep this image by saving without selecting a new file.
                  </p>
                </div>
              )}

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 bg-white/5 cursor-pointer hover:border-emerald-300/40 hover:bg-emerald-500/5 transition-all group">
                <div className="rounded-2xl bg-emerald-500/10 p-4 group-hover:bg-emerald-500/20 transition mb-3">
                  <Upload className="text-emerald-300/80" size={20} />
                </div>
                <span className="text-sm font-semibold text-white/70">Upload New Images</span>
                <span className="text-[10px] text-white/30 uppercase tracking-widest mt-1">PNG, JPG, WEBP up to 10MB</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative rounded-2xl overflow-hidden border border-white/10 group">
                      <img
                        src={img.preview}
                        alt="preview"
                        className="object-cover w-full h-28"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-rose-500 p-1.5 rounded-xl shadow-xl hover:bg-rose-400 transition"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="bg-white/5 rounded-3xl shadow-xl shadow-emerald-950/15 border border-white/10 p-8 backdrop-blur-xl space-y-4">
              <h2 className="text-base font-bold text-white mb-2">Update Product</h2>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.02] active:scale-95 text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Update Product
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/vendor/products")}
                className="w-full border border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-semibold py-3.5 rounded-2xl transition text-sm"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default VendorEditProduct;