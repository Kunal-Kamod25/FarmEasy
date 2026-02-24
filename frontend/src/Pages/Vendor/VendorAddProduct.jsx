import React, { useState } from "react";
import axios from "axios";
import { Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VendorAddProduct = () => {
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

  const [images, setImages] = useState([]); // UI only (not sent yet)
  const [loading, setLoading] = useState(false);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= HANDLE IMAGE UPLOAD (UI only for now) =================
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

  // ================= SUBMIT PRODUCT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/vendor/products",
        {
          product_name: formData.product_name,
          product_description: formData.product_description,
          product_type: formData.product_type,
          price: formData.price,
          category_id: formData.category_id,
          product_quantity: formData.product_quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Product added successfully!");

      setFormData({
        product_name: "",
        product_description: "",
        product_type: "",
        price: "",
        category_id: "",
        product_quantity: "",
      });

      setImages([]);

      navigate("/vendor/products");

    } catch (error) {
      console.error("Add product error:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-yellow-700/60 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-green-200">

          <div className="mb-10 border-b border-green-200 pb-5">
            <h2 className="text-3xl font-bold text-green-800">
              Add New Product 🌾
            </h2>
            <p className="text-sm text-green-600 mt-2">
              Fill all required details carefully before publishing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT SECTION */}
            <div className="lg:col-span-2 space-y-8">

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-green-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Product Type
                </label>
                <input
                  type="text"
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleChange}
                  className="w-full border border-green-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-800 mb-2">
                  Description
                </label>
                <textarea
                  rows="5"
                  name="product_description"
                  value={formData.product_description}
                  onChange={handleChange}
                  className="w-full border border-green-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full border border-green-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="product_quantity"
                    value={formData.product_quantity}
                    onChange={handleChange}
                    className="w-full border border-green-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT SECTION - UI IMAGE ONLY */}
            <div className="space-y-6">
              <label className="block text-sm font-semibold text-green-800 mb-2">
                Product Images (Coming Soon)
              </label>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-2xl p-8 cursor-pointer bg-green-50">
                <Upload className="text-green-600 mb-3" size={30} />
                <span className="text-sm text-green-700">
                  Image upload will be enabled soon
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden shadow-md">
                      <img
                        src={img.preview}
                        alt="preview"
                        className="object-cover w-full h-32"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-white p-1 rounded-full shadow"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-3 flex justify-end gap-4 mt-10 border-t border-green-200 pt-6">
              <button
                type="button"
                onClick={() => navigate("/vendor/products")}
                className="px-6 py-2 rounded-xl border border-green-300 text-green-700 hover:bg-green-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 rounded-xl bg-gradient-to-r from-green-600 to-lime-500 text-white shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorAddProduct;