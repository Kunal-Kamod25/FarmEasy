import React, { useEffect, useState } from "react";
import axios from "axios";
import { Upload, X, ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

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
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/vendor/products/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFormData(res.data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id, token]);

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
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      images.forEach((img) => data.append("images", img.file));

      await axios.put(
        `http://localhost:5000/api/vendor/products/${id}`,
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/vendor/products")}
          className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">Update product details and inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Main Info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">
                Basic Information
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Organic Wheat Seeds"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Product Type
                  </label>
                  <input
                    type="text"
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleChange}
                    placeholder="e.g. Seeds, Fertilizer, Equipment"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    name="product_description"
                    value={formData.product_description}
                    onChange={handleChange}
                    placeholder="Describe your product — quality, usage, benefits..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">
                Pricing & Inventory
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-gray-400 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="product_quantity"
                    value={formData.product_quantity}
                    onChange={handleChange}
                    placeholder="Available units"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Images & Actions */}
          <div className="space-y-5">

            {/* Image Upload Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">
                Product Images
              </h2>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition group">
                <div className="bg-emerald-50 group-hover:bg-emerald-100 p-3 rounded-xl mb-3 transition">
                  <Upload className="text-emerald-600" size={20} />
                </div>
                <span className="text-sm font-semibold text-gray-700">Upload New Images</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
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
                    <div key={index} className="relative rounded-xl overflow-hidden shadow-sm group">
                      <img
                        src={img.preview}
                        alt="preview"
                        className="object-cover w-full h-28"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-red-50 transition"
                      >
                        <X size={12} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
              <h2 className="text-base font-bold text-gray-800 mb-2">Update Product</h2>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
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
                    <Save size={16} />
                    Update Product
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/vendor/products")}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition text-sm"
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