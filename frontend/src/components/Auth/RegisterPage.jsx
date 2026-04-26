import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { Mail, Lock, User, Store, Phone, Sprout, Sparkles, ShieldCheck, ArrowRight, Leaf, CheckCircle, RefreshCcw, X } from "lucide-react";
import GoogleOAuthButton from "./GoogleOAuthButton";

const REGEX = {
  specialChar: /[!@#$%^&*]/,
};

const Register = () => {
  const [role, setRole] = useState("customer");
  const [step, setStep] = useState("form"); // 'form' or 'otp'
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    gst_number: "",
  });
  
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(0);
  
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const navigate = useNavigate();

  // Timer logic for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmitError("");

    if (e.target.name === "password") {
      setPasswordError("");
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (formData.password !== formData.confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone_number)) {
      setSubmitError("Phone number must be 10 digits.");
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(formData.fullname)) {
      setSubmitError("Full name should contain only letters and spaces.");
      return;
    }

    if (!REGEX.specialChar.test(formData.password)) {
      setPasswordError("Password must include a special character (e.g. !@#$%).");
      return;
    }

    // Step 1: Send OTP before registration
    setOtpLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/authentication/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        setTimer(60); // 1 minute resend timer
      } else {
        setSubmitError(data.message || "Failed to send verification code.");
      }
    } catch (err) {
      setSubmitError("Server not reachable. Please try again later.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    if (e) e.preventDefault();
    setOtpError("");
    setOtpLoading(true);

    try {
      // Step 2: Verify OTP
      const verifyRes = await fetch(`${API_URL}/api/authentication/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setOtpError(verifyData.message || "Invalid or expired verification code.");
        setOtpLoading(false);
        return;
      }

      // Step 3: Registration logic after successful OTP verification
      const regResponse = await fetch(`${API_URL}/api/authentication/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          role,
          gst_number: role === "vendor" ? formData.gst_number : null,
        }),
      });

      const regData = await regResponse.json();

      if (regResponse.ok) {
        alert("Registration Successful! Your account has been verified.");
        navigate("/login");
      } else {
        setSubmitError(regData.message || "Registration failed.");
        setStep("form");
      }
    } catch (err) {
      setOtpError("Connection error during verification.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    setOtpLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/authentication/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        setTimer(60);
        setOtpError("");
        alert("A new verification code has been sent to your email.");
      }
    } catch (err) {
      setOtpError("Failed to resend OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setGoogleError("");

    try {
      const response = await fetch(`${API_URL}/api/authentication/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, role }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setGoogleError(data.message || "Google sign-in failed.");
      }
    } catch {
      setGoogleError("Server not reachable.");
    }
  };

  const fieldShell =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-emerald-300/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-200/20";

  const roleButtonClass = (active) =>
    `flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
      active
        ? "border-emerald-300/60 bg-emerald-300/15 text-white shadow-lg shadow-emerald-950/20"
        : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-[#04110d] lg:grid lg:grid-cols-[1.05fr_0.95fr] font-Lora">
      <aside className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(circle_at_top_left,_rgba(134,239,172,0.18),_transparent_32%),radial-gradient(circle_at_80%_18%,_rgba(45,212,191,0.16),_transparent_28%),linear-gradient(135deg,_#02110b_0%,_#041b13_45%,_#0a2a1d_100%)] px-6 py-10 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative flex min-h-[280px] flex-col justify-between lg:min-h-[calc(100vh-6rem)]">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-xl">
            <Sprout className="h-4 w-4 text-emerald-200" />
            FarmEasy
          </div>

          <div className="max-w-xl pt-16 lg:pt-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100/80 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              Create your account
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Join FarmEasy
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
              Create an account for shopping, selling, or managing your marketplace activity in one place.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Leaf,
                  title: "Quick start",
                  text: "Register in minutes with secure sign-up and role selection.",
                },
                {
                  icon: ShieldCheck,
                  title: "Protected access",
                  text: "Use Google OAuth or password login with the same secure session flow.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
                    <Icon className="h-5 w-5 text-emerald-200" />
                    <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-emerald-950/25 backdrop-blur-2xl sm:p-10 relative overflow-hidden">
          
          {/* OTP STEP UI */}
          {step === "otp" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <button 
                onClick={() => setStep("form")} 
                className="absolute right-6 top-6 text-white/40 hover:text-white transition p-2 hover:bg-white/5 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <Mail className="text-emerald-300" size={28} />
                </div>
                <h2 className="text-3xl font-semibold text-white">Verify Email</h2>
                <p className="mt-3 text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                  We've sent a 6-digit verification code to <span className="text-emerald-200 font-semibold">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyAndRegister} className="space-y-8">
                <div>
                  <label className="mb-3 block text-center text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-center text-5xl font-black tracking-[0.5em] text-white placeholder:text-white/5 outline-none transition focus:border-emerald-400"
                    required
                    autoFocus
                  />
                </div>

                {otpError && (
                  <p className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-center text-sm text-rose-100">
                    {otpError}
                  </p>
                )}

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={otpLoading || otp.length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Verify & Create Account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    {timer > 0 ? (
                      <p className="text-xs text-white/40 font-medium">
                        Resend code in <span className="text-emerald-200 font-bold">{timer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={otpLoading}
                        className="text-xs font-bold text-emerald-200 hover:text-emerald-100 transition flex items-center gap-2 mx-auto uppercase tracking-wider"
                      >
                        <RefreshCcw className="h-3 w-3" />
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* FORM STEP UI */}
          {step === "form" && (
            <div className="animate-in fade-in duration-500">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100/70">
                  Start here
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                  Create Your Account
                </h2>
                <p className="mt-2 text-sm text-white/60 sm:text-base">
                  Start your journey with FarmEasy
                </p>
              </div>

              <div className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
                  Register as
                </p>
                <div className="flex gap-3">
                  <label className={roleButtonClass(role === "customer")}>
                    <input
                      type="radio"
                      className="sr-only"
                      checked={role === "customer"}
                      onChange={() => setRole("customer")}
                    />
                    Customer
                  </label>

                  <label className={roleButtonClass(role === "vendor")}>
                    <input
                      type="radio"
                      className="sr-only"
                      checked={role === "vendor"}
                      onChange={() => setRole("vendor")}
                    />
                    Vendor
                  </label>
                </div>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleInitialSubmit} autoComplete="off">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/80">Full Name</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <input
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className={`${fieldShell} pl-11`}
                        required
                        pattern="^[A-Za-z ]+$"
                        title="Full name must contain only letters and spaces"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/80">Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="farmer@email.com"
                        className={`${fieldShell} pl-11`}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/80">Mobile Number</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <input
                      type="tel"
                      name="phone_number"
                      placeholder="Enter your phone number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{10}"
                      title="Enter a 10-digit phone number"
                      className={`${fieldShell} pl-11`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/80">Password</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        className={`${fieldShell} pl-11 ${passwordError ? "border-rose-300/60" : ""}`}
                        required
                      />
                    </div>
                    {passwordError && <p className="mt-2 text-xs text-rose-200">{passwordError}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/80">Confirm Password</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className={`${fieldShell} pl-11`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {role === "vendor" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/80">GST Number</label>
                    <div className="relative">
                      <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <input
                        type="text"
                        name="gst_number"
                        value={formData.gst_number}
                        onChange={handleChange}
                        placeholder="Enter GST Number"
                        className={`${fieldShell} pl-11`}
                      />
                    </div>
                  </div>
                )}

                {submitError && (
                  <p className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {otpLoading ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verify Email & Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/30">
                <span className="h-px flex-1 bg-white/10" />
                <span>or</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              {role === "vendor" ? (
                <p className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-center text-xs text-amber-100">
                  Google sign-up is available for customer accounts only. Vendors can use the manual form.
                </p>
              ) : (
                <GoogleOAuthButton
                  onCredential={handleGoogleCredential}
                  buttonText="signup_with"
                  className="w-full"
                />
              )}

              {googleError && (
                <p className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {googleError}
                </p>
              )}

              <p className="mt-6 text-center text-sm text-white/65">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-emerald-100 transition hover:text-white">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Register;
