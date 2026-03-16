import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../../config";

const ResetPassword = () => {
    const { token: urlToken } = useParams(); // For link-based reset
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState(location.state?.email || "");
    const [token, setToken] = useState(urlToken || "");
    const [isVerified, setIsVerified] = useState(!!urlToken); // Auto-verify if we have a URL token
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/password/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: token }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsVerified(true);
                setMessage("OTP Verified! Please set your new password.");
            } else {
                setError(data.message || "Invalid or expired OTP");
            }
        } catch {
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/password/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Password reset successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setError(data.message || "Failed to reset password");
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
                    <div className="text-6xl mb-5">🛡️</div>
                    <h2 className="text-4xl font-bold mb-4">Reset Password</h2>
                    <p className="text-green-100 text-base">
                        Your security is our priority. Choose a strong, new password to secure your FarmEasy account.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center justify-center p-6 bg-slate-50">
                <div className="w-full max-w-[400px] bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                    <h2 className="text-center text-2xl font-bold text-slate-800 mb-1">
                        {!isVerified ? "Verify Identity" : "Set New Password"}
                    </h2>
                    <p className="text-center text-slate-500 text-sm mb-6">
                        {!isVerified ? "Enter the 6-digit OTP sent to your email." : "Define your new access credentials."}
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

                    {!isVerified ? (
                        /* STEP 1: VERIFY OTP */
                        <form onSubmit={handleVerifyOTP} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">6-Digit OTP</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="Enter 6-digit code"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    required
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-sm tracking-widest text-center font-bold"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-green-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-800 hover:shadow-green-300 transition-all active:scale-[0.98] ${loading ? "opacity-70 cursor-not-allowed" : ""
                                    }`}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </form>
                    ) : (
                        /* STEP 2: SET PASSWORD */
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    placeholder="Min 8 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength="8"
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Re-type new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-green-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-800 hover:shadow-green-300 transition-all active:scale-[0.98] ${loading ? "opacity-70 cursor-not-allowed" : ""
                                    }`}
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
