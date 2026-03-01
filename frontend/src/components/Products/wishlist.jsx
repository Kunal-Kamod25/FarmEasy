import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchWishlist = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistProducts(res.data.data || []);
    } catch (error) {
      console.error("Wishlist fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Heart className="w-16 h-16 text-red-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Please Login</h2>
        <p className="text-gray-500 mb-6">Login to view and manage your wishlist</p>
        <Link
          to="/login"
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all"
        >
          Login Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-50 p-2.5 rounded-2xl">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Wishlist
            </h1>
            <p className="text-gray-500 text-sm">
              {wishlistProducts.length} item{wishlistProducts.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>

        {/* Empty State */}
        {wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-red-50 rounded-full p-6 mb-4">
              <Heart className="w-12 h-12 text-red-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">
              Browse products and click the ❤️ heart button to save items here.
            </p>
            <Link
              to="/"
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;