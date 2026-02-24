import React, { useEffect, useState } from "react";
import axios from "axios";
import { Upload, X } from "lucide-react";
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

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/vendor/products/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setFormData(res.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchProduct();
  }, [id, token]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= HANDLE IMAGE =================
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

  // ================= UPDATE PRODUCT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      images.forEach((img) => {
        data.append("images", img.file);
      });

      await axios.put(
        `http://localhost:5000/api/vendor/products/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">

        <h2 className="text-2xl font-bold mb-6 text-green-700">
          Edit Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            placeholder="Product Name"
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <input
            type="text"
            name="product_type"
            value={formData.product_type}
            onChange={handleChange}
            placeholder="Product Type"
            className="w-full border rounded-lg px-4 py-2"
          />

          <textarea
            name="product_description"
            value={formData.product_description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border rounded-lg px-4 py-2"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price"
              className="border rounded-lg px-4 py-2"
              required
            />

            <input
              type="number"
              name="product_quantity"
              value={formData.product_quantity}
              onChange={handleChange}
              placeholder="Quantity"
              className="border rounded-lg px-4 py-2"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer bg-green-100 p-3 rounded-lg">
              <Upload size={18} />
              Upload New Images
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.preview}
                      alt="preview"
                      className="h-24 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white p-1 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/vendor/products")}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default VendorEditProduct;