import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, ShoppingCart, Heart } from "lucide-react";

export default function HomeSections({
    fertilizerProducts = [],
    products = [],
    onNavigate = () => { },
    onViewDetails = () => { }
}) {

    const [wishlist, setWishlist] = useState([]);
    const token = localStorage.getItem("token");

    // Fetch wishlist once
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/wishlist", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWishlist(res.data.data);
            } catch (err) {
                console.log(err);
            }
        };

        if (token) fetchWishlist();
    }, [token]);

    const toggleWishlist = async (productId) => {
        try {
            await axios.post(
                "http://localhost:5000/api/wishlist",
                { productId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const exists = wishlist.some(item => item.id === productId);

            if (exists) {
                setWishlist(prev => prev.filter(item => item.id !== productId));
            } else {
                setWishlist(prev => [...prev, { id: productId }]);
            }

        } catch (err) {
            console.log(err);
        }
    };

    const isWishlisted = (id) => {
        return wishlist.some(item => item.id === id);
    };

    return (
        <main className="bg-[#FFFFFF] min-h-screen pb-16">

            {/* ================= BEST SELLERS ================= */}
            <section className="px-4 mt-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Best Sellers in Fertilizers
                    </h2>

                    <button
                        onClick={() => onNavigate("fertilizers")}
                        className="text-green-700 font-semibold hover:underline"
                    >
                        View All →
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {fertilizerProducts.slice(0, 8).map((product) => (
                        <div
                            key={product.id}
                            className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-emerald-200 transition-all duration-200 border border-slate-100 overflow-hidden flex flex-col hover:-translate-y-2"
                        >

                            {/* Image */}
                            <div className="relative bg-gray-50 h-48 flex items-center justify-center">

                                {/* ❤️ Wishlist */}
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm border border-slate-100 hover:scale-110 transition-all duration-200"
                                    >
                                    <Heart
                                        size={16}
                                        className={
                                        isWishlisted(product.id)
                                            ? "text-red-500 fill-red-500"
                                            : "text-slate-400 hover:text-red-500 transition-colors"
                                        }
                                    />
                                    </button>

                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-contain h-full w-full p-4"
                                />

                                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                    IN STOCK
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                                    {product.brand || "FERTILIZER"}
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 mb-2">
                                    {product.name}
                                </h3>

                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-yellow-500 font-semibold">
                                        ★ {product.rating}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({product.reviews} reviews)
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-xl font-bold text-slate-900">
                                        ₹{product.price.toLocaleString()}
                                    </p>

                                    <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                                        <ShoppingCart size={16} />
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= RECOMMENDED ================= */}
            <section className="px-4 mt-14">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">
                        🌾 Recommended For You
                    </h3>

                    <button
                        onClick={() => onNavigate("products")}
                        className="text-green-700 font-semibold hover:underline"
                    >
                        View All →
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.slice(0, 8).map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-2xl p-5 border border-green-100 hover:shadow-xl transition group relative"
                        >

                            {/* ❤️ Wishlist */}
                            <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm border border-slate-100 hover:scale-110 transition-all duration-200"
                                    >
                                    <Heart
                                        size={16}
                                        className={
                                        isWishlisted(product.id)
                                            ? "text-red-500 fill-red-500"
                                            : "text-slate-400 hover:text-red-500 transition-colors"
                                        }
                                    />
                                    </button>
                            <div className="h-32 flex items-center justify-center mb-4">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-contain max-h-full transition group-hover:scale-110"
                                />
                            </div>

                            <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-2 group-hover:text-green-700">
                                {product.name}
                            </p>

                            <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 text-yellow-500 ${i < Math.floor(product.rating)
                                            ? "fill-yellow-500"
                                            : ""
                                            }`}
                                    />
                                ))}
                            </div>

                            <p className="font-bold text-lg text-slate-900 mb-3">
                                ₹{product.price.toLocaleString()}
                            </p>

                            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition">
                                View Product
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}