import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";

const VendorProducts = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
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
      console.error(error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/vendor/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-green-700">
          My Products
        </h2>

        <button
          onClick={() => navigate("/vendor/products/add")}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products added yet.</p>
      ) : (
        <div className="space-y-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition"
            >

              {/* LEFT SIDE */}
              <div className="flex items-center gap-6">

                {/* Product Image */}
                <img
                  src="https://via.placeholder.com/100"
                  alt="product"
                  className="w-24 h-24 object-cover rounded-xl"
                />

                {/* Product Info */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {product.product_name}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    Quantity: {product.product_quantity}
                  </p>

                  <p className="text-gray-400 text-sm mt-1">
                    {product.product_description}
                  </p>

                  {/* Status Badge */}
                  <span className="inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="text-right space-y-3">

                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-wide">
                    Price
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{product.price}
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() =>
                      navigate(`/vendor/products/edit/${product.id}`)
                    }
                    className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <button
                  onClick={() =>
                    navigate(`/vendor/products/view/${product.id}`)
                  }
                  className="text-green-600 font-medium text-sm hover:underline"
                >
                  View Details →
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