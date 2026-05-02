import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from '../config';
import { useLanguage } from "../context/language/LanguageContext";
import ErrorNotification from "../components/Common/ErrorNotification";

const loadRazorpayScript = () => {
    if (window.Razorpay) return Promise.resolve(true);

    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [_searchParams] = useSearchParams();
    const { t, td, language } = useLanguage();
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

    // Fetch user details to pre-fill the form
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get(`${API_URL}/api/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (res.data) {
                    const profile = res.data;
                    setFormData(prev => ({
                        ...prev,
                        fullName: profile.full_name || prev.fullName,
                        email: profile.email || prev.email,
                        phone: profile.phone_number || prev.phone,
                        address: profile.address || prev.address,
                        city: profile.city || prev.city,
                        state: profile.state || prev.state,
                        pincode: profile.pincode || prev.pincode,
                    }));
                }
            } catch (err) {
                console.error("Error pre-filling checkout form:", err);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            setLoading(false);
            return;
        }

        try {
            const orderData = {
                shippingDetails: formData,
            };

            if (formData.paymentMethod === "COD") {
                const res = await axios.post(`${API_URL}/api/orders/cod`, orderData, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data.success) {
                    clearCart();
                    navigate("/order-success", { state: { orderId: res.data.orderId } });
                }
                setLoading(false);
                return;
            }

            const isRazorpayLoaded = await loadRazorpayScript();
            if (!isRazorpayLoaded) {
                throw new Error(t("checkout.errors.razorpayLoad"));
            }

            const razorpayRes = await axios.post(`${API_URL}/api/orders/razorpay/order`, orderData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { keyId, order, prefill } = razorpayRes.data || {};

            if (!keyId || !order?.id) {
                throw new Error(t("checkout.errors.paymentInit"));
            }

            const razorpay = new window.Razorpay({
                key: keyId,
                amount: order.amount,
                currency: order.currency || "INR",
                name: "FarmEasy",
                description: "Order payment",
                order_id: order.id,
                prefill,
                theme: { color: "#059669" },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: t("checkout.payViaUpi"),
                                instruments: [
                                    { method: "upi" }
                                ]
                            },
                            other: {
                                name: t("checkout.otherPaymentMethods"),
                                instruments: [
                                    { method: "card" },
                                    { method: "netbanking" },
                                    { method: "wallet" },
                                    { method: "paylater" }
                                ]
                            }
                        },
                        sequence: ["block.upi", "block.other"],
                        preferences: {
                            show_default_blocks: false
                        }
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setError(t("checkout.paymentCancelled"));
                    }
                },
                handler: async (response) => {
                    try {
                        setLoading(true);
                        const finalizeRes = await axios.post(
                            `${API_URL}/api/orders/razorpay/finalize`,
                            {
                                ...response,
                                shippingDetails: formData,
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (finalizeRes.data?.success) {
                            clearCart();
                            navigate("/order-success", { state: { orderId: finalizeRes.data.orderId } });
                        }
                    } catch (finalizeError) {
                        setError(finalizeError.response?.data?.message || t("checkout.errors.finalizeFailed"));
                    } finally {
                        setLoading(false);
                    }
                },
            });

            razorpay.open();
        } catch (err) {
            setError(err.response?.data?.message || err.message || t("checkout.errors.placeOrder"));
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("cart.empty")}</h2>
                <button
                    onClick={() => navigate("/products")}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                >
                    {t("checkout.backToShop")}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{t("checkout.title")}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Shipping Form */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">{t("checkout.shippingInfo")}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("checkout.fullName")}</label>
                                    <input
                                        required
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                        placeholder={t("checkout.fullNamePlaceholder")}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("checkout.phone")}</label>
                                    <input
                                        required
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                        placeholder={t("checkout.phonePlaceholder")}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("checkout.email")}</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    placeholder={t("checkout.emailPlaceholder")}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("checkout.address")}</label>
                                <textarea
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-24"
                                    placeholder={t("checkout.addressPlaceholder")}
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("checkout.city")}</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("checkout.state")}</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("checkout.pincode")}</label>
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
                                <h2 className="text-xl font-bold text-gray-800 mb-4">{t("checkout.paymentMethod")}</h2>
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
                                            <p className="text-sm font-bold text-gray-900">{t("checkout.cod")}</p>
                                            <p className="text-xs text-gray-500">{t("checkout.codDesc")}</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="RAZORPAY"
                                            checked={formData.paymentMethod === "RAZORPAY"}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-bold text-gray-900">{t("checkout.online")}</p>
                                            <p className="text-xs text-gray-500">{t("checkout.onlineDesc")}</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {error && <ErrorNotification message={error} onClose={() => setError("")} />}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98] mt-8 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading
                                    ? (formData.paymentMethod === "RAZORPAY" ? t("checkout.openingPayment") : t("checkout.processingOrder"))
                                    : `${t("checkout.placeOrder")} • ₹${cartTotal.toLocaleString()}`}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">{t("checkout.orderSummary")}</h2>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id || item.product_id} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
                                        <img
                                            src={item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) : (item.img || "https://via.placeholder.com/80")}
                                            alt={item.name}
                                            className="w-16 h-20 object-cover rounded-lg border border-gray-100"
                                        />
                                        <div className="flex-grow">
                                            <h3 className="text-sm font-bold text-gray-800 leading-tight">{item[`product_name_${language}`] || item.name || td(item.product_name || "")}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{t("checkout.qty")}: {item.quantity}</p>
                                            <p className="text-sm text-emerald-600 font-bold mt-1">₹{(Number(item.price) * (item.quantity || 1)).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-3 pt-6 border-t border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>{t("cart.subtotal")}</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>{t("checkout.shipping")}</span>
                                    <span className="text-emerald-600 font-medium">{t("checkout.free")}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3">
                                    <span>{t("cart.total")}</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
