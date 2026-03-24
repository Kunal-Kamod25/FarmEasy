import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FiCheckCircle, FiPackage, FiArrowRight } from "react-icons/fi";
import { API_URL } from "../config";
import { useCart } from "../context/CartContext";

const OrderSuccess = () => {
    const MotionDiv = motion.div;
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { clearCart } = useCart();

    const paymentType = searchParams.get("payment");
    const stripeSessionId = searchParams.get("session_id");

    const [orderId, setOrderId] = useState(location.state?.orderId || null);
    const [finalizing, setFinalizing] = useState(false);
    const [finalizeError, setFinalizeError] = useState("");

    useEffect(() => {
        const finalizeStripeOrder = async () => {
            if (paymentType !== "stripe" || !stripeSessionId) return;

            const token = localStorage.getItem("token");
            if (!token) {
                setFinalizeError("Please login again to confirm your payment.");
                return;
            }

            try {
                setFinalizing(true);
                setFinalizeError("");

                const res = await axios.post(
                    `${API_URL}/api/orders/stripe/finalize`,
                    { sessionId: stripeSessionId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.data?.success) {
                    setOrderId(res.data.orderId);
                    clearCart();
                }
            } catch (error) {
                setFinalizeError(error.response?.data?.message || "Payment was received, but order finalization failed. Please contact support.");
            } finally {
                setFinalizing(false);
            }
        };

        finalizeStripeOrder();
    }, [paymentType, stripeSessionId, clearCart]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
            <MotionDiv
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 text-center"
            >
                <MotionDiv
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <FiCheckCircle size={40} />
                </MotionDiv>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8">
                    Thank you for shopping with FarmEasy. Your order has been placed successfully.
                </p>

                {finalizing && (
                    <p className="text-sm font-semibold text-slate-600 mb-4">
                        Finalizing your secure payment and creating order...
                    </p>
                )}

                {finalizeError && (
                    <p className="text-sm font-semibold text-red-600 mb-4">
                        {finalizeError}
                    </p>
                )}

                {orderId && (
                    <div className="bg-emerald-50 p-4 rounded-xl mb-8 flex items-center justify-center gap-3">
                        <FiPackage className="text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-800">Order ID: #{orderId}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={() => navigate("/")}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group shadow-lg"
                    >
                        Continue Shopping
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate("/profile")}
                        className="w-full bg-white text-gray-700 py-4 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                        View My Orders
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-8">
                    You can track payment and delivery status in My Orders.
                </p>
            </MotionDiv>
        </div>
    );
};

export default OrderSuccess;
