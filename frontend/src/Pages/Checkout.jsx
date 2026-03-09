import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        paymentMethod: "COD",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const orderData = {
                shippingDetails: formData,
                items: cartItems,
                totalPrice: cartTotal,
                paymentMethod: formData.paymentMethod,
            };

            const res = await axios.post("http://localhost:5000/api/orders", orderData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                clearCart();
                navigate("/order-success", { state: { orderId: res.data.orderId } });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                <button
                    onClick={() => navigate("/products")}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                >
                    Go Back to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Shipping Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Shipping Information</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                        placeholder="9988776655"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <textarea
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-24"
                                    placeholder="Appartment, Street, Colony..."
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        required
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        required
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                    <input
                                        required
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={formData.paymentMethod === "COD"}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-bold text-gray-900">Cash on Delivery</p>
                                            <p className="text-xs text-gray-500">Pay when your order reaches you.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium mt-4">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98] mt-8 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Processing Order..." : `Place Order • ₹${cartTotal.toLocaleString()}`}
                            </button>
                        </form>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:sticky lg:top-24 h-fit"
                    >
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id || item.product_id} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
                                        <img
                                            src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`) : (item.img || "https://via.placeholder.com/80")}
                                            alt={item.name}
                                            className="w-16 h-20 object-cover rounded-lg border border-gray-100"
                                        />
                                        <div className="flex-grow">
                                            <h3 className="text-sm font-bold text-gray-800 leading-tight">{item.name || item.product_name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                                            <p className="text-sm text-emerald-600 font-bold mt-1">₹{(Number(item.price) * (item.quantity || 1)).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-3 pt-6 border-t border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600 font-medium">FREE</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3">
                                    <span>Total</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
