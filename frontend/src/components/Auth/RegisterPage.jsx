import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { Mail, Lock, User, Store, Phone, Sprout, Sparkles, ShieldCheck, ArrowRight, Leaf } from "lucide-react";
import GoogleOAuthButton from "./GoogleOAuthButton";

const REGEX = {
  specialChar: /[!@#$%^&*]/,
};

const Register = () => {
  const [role, setRole] = useState("customer");
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    gst_number: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmitError("");

    if (e.target.name === "password") {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
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

    try {
      const response = await fetch(`${API_URL}/api/authentication/register`, {
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

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful!");
        navigate("/login");
      } else {
        setSubmitError(data.message || "Registration failed.");
      }
    } catch {
      setSubmitError("Server not reachable.");
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
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-emerald-950/25 backdrop-blur-2xl sm:p-10">
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

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} autoComplete="off">
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
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-400"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
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
      </main>
    </div>
  );
};

export default Register;
