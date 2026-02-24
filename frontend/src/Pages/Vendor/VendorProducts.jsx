import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";

const VendorProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    const token = localStorage.getItem("token");

    // 🔐 If no token → redirect to login
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/vendor/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(res.data);

    } catch (error) {
      console.error("Fetch products error:", error);

      // If token expired or invalid → logout
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
        alert("Session expired. Please login again.");
        navigate("/login");
      } else {
        alert("Failed to load products");
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // run once

  // ================= DELETE PRODUCT =================
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/vendor/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Product deleted successfully");

      // Remove from UI without reload
      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );

    } catch (error) {
      console.error("Delete error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
        alert("Session expired. Please login again.");
        navigate("/login");
      } else {
        alert("Failed to delete product");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-700">
          My Products
        </h2>

        <button
          onClick={() => navigate("/vendor/products/add")}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <p className="text-gray-600">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">No products added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg mb-2">
                {product.product_name}
              </h3>

              <p className="text-gray-600 text-sm mb-2">
                {product.product_description}
              </p>

              <p className="text-green-600 font-semibold mb-2">
                ₹ {product.price}
              </p>

              <p className="text-gray-500 text-sm mb-4">
                Stock: {product.product_quantity}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/vendor/products/edit/${product.id}`)
                  }
                  className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorProducts;