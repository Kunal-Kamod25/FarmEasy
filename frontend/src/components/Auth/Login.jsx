import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { useLanguage } from "../../context/language/LanguageContext";
import {
  ArrowRight,
  Eye,
  Leaf,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";
import GoogleOAuthButton from "./GoogleOAuthButton";

const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[6-9]\d{9}$/,
  specialChar: /[!@#$%^&*]/,
};

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loginAs, setLoginAs] = useState("customer");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("email");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRoleChange = (role) => {
    setLoginAs(role);
    setEmail("");
    setPhone("");
    setErrors({});
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setEmail("");
    setPhone("");
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    if (loginType === "email") {
      if (!email.trim()) {
        newErrors.email = t("login.validation.emailRequired");
      } else if (!REGEX.email.test(email.trim())) {
        newErrors.email = t("login.validation.emailInvalid");
      }
    } else if (!phone.trim()) {
      newErrors.phone = t("login.validation.phoneRequired");
    } else if (!REGEX.phone.test(phone.trim())) {
      newErrors.phone = t("login.validation.phoneInvalid");
    }

    if (!password) {
      newErrors.password = t("login.validation.passwordRequired");
    } else if (!REGEX.specialChar.test(password)) {
      newErrors.password = t("login.validation.passwordSpecial");
    }

    return newErrors;
  };

  const redirectByRole = (role) => {
    const normalizedRole = String(role || "").toLowerCase();

    if (["vendor", "seller"].includes(normalizedRole)) {
      navigate("/vendor/products");
      return;
    }

    if (normalizedRole === "admin") {
      navigate("/admin");
      return;
    }

    navigate("/");
  };

  const persistSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    redirectByRole(data.user?.role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const identifier = loginType === "email" ? email.trim() : phone.trim();

    if (!identifier || !password) {
      alert(t("login.error.identifierRequired"));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/authentication/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, loginAs }),
      });

      const data = await response.json();

      if (response.ok) {
        persistSession(data);
      } else {
        alert(data.message || t("login.error.failed"));
      }
    } catch {
      alert(t("login.error.server"));
    }
  };

  const handleGoogleCredential = async (credential) => {
    try {
      const response = await fetch(`${API_URL}/api/authentication/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, role: loginAs }),
      });

      const data = await response.json();

      if (response.ok) {
        persistSession(data);
      } else {
        alert(data.message || t("login.error.failed"));
      }
    } catch {
      alert(t("login.error.server"));
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
              Smart marketplace access
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {t("login.joinTitle")}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
              {t("login.marketplaceSubtitle")}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Leaf,
                  title: "Verified supply",
                  text: "Access trusted seeds, fertilizers, and tools.",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure access",
                  text: "Your login stays protected with token sessions.",
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

          <p className="hidden max-w-md text-sm leading-6 text-white/55 lg:block">
            Fast checkout, vendor tools, and role-aware access continue to work exactly as before.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-emerald-950/25 backdrop-blur-2xl sm:p-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100/70">
              Welcome back
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              {t("login.welcome")}
            </h2>
            <p className="mt-2 text-sm text-white/60 sm:text-base">
              {t("login.subtitle")}
            </p>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
              {t("login.loginAs")}
            </p>
            <div className="flex gap-3">
              <label className={roleButtonClass(loginAs === "customer")}>
                <input
                  type="radio"
                  className="sr-only"
                  checked={loginAs === "customer"}
                  onChange={() => handleRoleChange("customer")}
                />
                {t("login.customer")}
              </label>

              <label className={roleButtonClass(loginAs === "vendor")}>
                <input
                  type="radio"
                  className="sr-only"
                  checked={loginAs === "vendor"}
                  onChange={() => handleRoleChange("vendor")}
                />
                {t("login.vendor")}
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                {t("login.loginUsing")}
              </label>
              <select
                value={loginType}
                onChange={(e) => handleLoginTypeChange(e.target.value)}
                className={`${fieldShell} appearance-none text-white`}
              >
                <option value="email">{t("login.email")}</option>
                <option value="phone">{t("login.phone")}</option>
              </select>
            </div>

            {loginType === "email" ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  {t("login.email")}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    type="email"
                    placeholder={loginAs === "customer" ? "customer@gmail.com" : "vendor@gmail.com"}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`${fieldShell} pl-11 ${errors.email ? "border-rose-300/60" : ""}`}
                  />
                </div>
                {errors.email && <p className="mt-2 text-xs text-rose-200">{errors.email}</p>}
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  {t("login.phone")}
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    type="tel"
                    placeholder={t("login.phonePlaceholder")}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                    className={`${fieldShell} pl-11 ${errors.phone ? "border-rose-300/60" : ""}`}
                  />
                </div>
                {errors.phone && <p className="mt-2 text-xs text-rose-200">{errors.phone}</p>}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                {t("login.password")}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  className={`${fieldShell} pl-11 ${errors.password ? "border-rose-300/60" : ""}`}
                />
                <Eye className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
              </div>
              {errors.password && <p className="mt-2 text-xs text-rose-200">{errors.password}</p>}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent text-emerald-500 accent-emerald-500"
                />
                {t("login.rememberMe")}
              </label>

              <Link to="/forgot-password" className="text-sm font-semibold text-emerald-100 transition hover:text-white">
                {t("login.forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-400"
            >
              {t("login.loginButton")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/30">
            <span className="h-px flex-1 bg-white/10" />
            <span>or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <GoogleOAuthButton
            onCredential={handleGoogleCredential}
            buttonText="signin_with"
            className="w-full"
          />

          <p className="mt-6 text-center text-sm text-white/65">
            {t("login.noAccount")} {" "}
            <Link to="/register" className="font-semibold text-emerald-100 transition hover:text-white">
              {t("login.signUp")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
