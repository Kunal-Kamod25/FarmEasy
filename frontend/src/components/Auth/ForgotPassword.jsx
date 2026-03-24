import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [type, setType] = useState("link"); // 'link' or 'otp'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [devToken, setDevToken] = useState("");
    const [devType, setDevType] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/password/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);

                if (data.dev_token) {
                    setDevToken(data.dev_token);
                    setDevType(type);
                    console.log("DEV DEBUG:", data.dev_token);
                }

                // Always redirect for OTP to help user flow, even if real email sent
                if (type === 'otp') {
                    setMessage("OTP sent successfully! Redirecting to verification...");
                    setTimeout(() => navigate("/reset-password", { state: { email } }), 1000);
                } else {
                    setMessage("Reset link sent! Please check your email inbox.");
                }
            } else {
                setError(data.message || "Something went wrong");
            }
        } catch {
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-Lora">
            {/* LEFT SIDE */}
            <div className="hidden md:flex bg-gradient-to-br from-green-700 to-green-900 text-white items-center justify-center">
                <div className="max-w-sm text-center p-6">
                    <div className="text-6xl mb-5">🔐</div>
                    <h2 className="text-4xl font-bold mb-4">Secure Access</h2>
                    <p className="text-green-100 text-base">
                        Forgot your password? No worries. We'll help you get back into your account safely.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center justify-center p-6 bg-slate-50">
                <div className="w-full max-w-[400px] bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                    <h2 className="text-center text-2xl font-bold text-slate-800 mb-1">Forgot Password</h2>
                    <p className="text-center text-slate-500 text-sm mb-6">
                        Enter your email to receive a reset code or link.
                    </p>

                    {message && (
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm mb-6 border border-emerald-100">
                            ✅ {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm mb-6 border border-rose-100">
                            ⚠ {error}
                        </div>
                    )}

                    {devToken && (
                        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm mb-6 border border-blue-100">
                            <p className="font-bold mb-2 underline">🛠️ Developer Mode (Real Email Disabled)</p>
                            {devType === 'otp' ? (
                                <div>
                                    <p className="mb-2 italic opacity-90">In a real app, this OTP would be sent to your Gmail.</p>
                                    <p>Your Test OTP: <span className="font-mono bg-white px-2 py-1 rounded border border-blue-200 font-bold text-lg">{devToken}</span></p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-2 italic opacity-90">In a real app, this link would be in your inbox.</p>
                                    <Link
                                        to={`/reset-password/${devToken}`}
                                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Go to Reset Page →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Reset Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setType("link")}
                                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${type === "link"
                                        ? "bg-green-600 text-white border-green-600"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-green-600"
                                        }`}
                                >
                                    Email Link
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("otp")}
                                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${type === "otp"
                                        ? "bg-green-600 text-white border-green-600"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-green-600"
                                        }`}
                                >
                                    6-Digit OTP
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-green-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-800 hover:shadow-green-300 transition-all active:scale-[0.98] ${loading ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? "Sending..." : "Send Reset Instruction"}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <Link
                            to="/login"
                            className="text-slate-500 text-sm font-medium hover:text-green-700 transition"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
