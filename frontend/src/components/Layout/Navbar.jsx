import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/Logo.png";
import {
  HiOutlineUser,
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineBell,
} from "react-icons/hi2";
import Searchbar from "../Common/SearchBar";
import CartDrawer from "../Cart/CartDrawer";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { API_URL } from "../../config";
import { useLanguage } from "../../context/language/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import LoginModal from "../Common/LoginModal";

const Navbar = () => {
  const { t } = useLanguage();

  const truncateText = (text = "", maxLength = 10) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchSuggestionsLoading, setSearchSuggestionsLoading] = useState(false);

  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < 2) {
      setSearchSuggestions([]);
      setSearchSuggestionsLoading(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setSearchSuggestionsLoading(true);

        const res = await axios.get(`${API_URL}/api/products/all`, {
          params: {
            search: query,
            sort: "price_asc",
            limit: 5,
            page: 1,
          }
        });

        if (!cancelled) {
          setSearchSuggestions(res.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Search suggestion fetch failed:", error);
          setSearchSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setSearchSuggestionsLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    setSearchSuggestions([]);
    navigate(`/products?search=${encodeURIComponent(query)}&sort=price_asc`);
  };

  const handleSuggestionSelect = (product) => {
    setSearchTerm(product.product_name || "");
    setSearchSuggestions([]);
    navigate(`/product/${product.id}`);
  };

  const handleViewAllMatches = () => {
    const query = searchTerm.trim();
    if (!query) return;

    setSearchSuggestions([]);
    navigate(`/products?search=${encodeURIComponent(query)}&sort=price_asc`);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");

  /* 🔐 AUTH STATE */
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  /* 🛒 CART */
  const { cartCount } = useCart();

  /* ❤️ WISHLIST */
  const { wishlistCount } = useWishlist();

  /* 🔔 NOTIFICATIONS */
  const { unreadCount } = useNotifications();

  // close on outside click
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    const handleAuthRequired = (e) => {
      setAuthModalMessage(e.detail?.message || "Please login to continue.");
      setShowAuthModal(true);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("farmeasy:auth-required", handleAuthRequired);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("farmeasy:auth-required", handleAuthRequired);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const toggleCartDrawer = () => {
    if (!localStorage.getItem("token")) {
      setAuthModalMessage("Please login to view and manage your cart.");
      setShowAuthModal(true);
      return;
    }
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className="bg-black text-white">
      <nav className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:h-20 py-3 md:py-0 gap-4">
          
          {/* LOGO & MOBILE ICONS ROW */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <Link to="/" className="flex-shrink-0 transition-transform active:scale-95">
              <img
                src={logo}
                alt="FarmEasy"
                className="h-10 md:h-14 w-auto object-contain"
              />
            </Link>

            {/* MOBILE ONLY ICONS */}
            <div className="flex items-center gap-4 md:hidden">
              {!user ? (
                <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Login
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/wishlist" className="relative group">
                    <HiOutlineHeart className="h-6 w-6 text-white group-hover:text-red-400 transition-colors" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-3 -right-2 text-white text-[9px] rounded-full bg-red-500 w-4 h-4 flex items-center justify-center font-black">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </Link>
                  <button onClick={toggleCartDrawer} className="relative group">
                    <HiOutlineShoppingCart className="h-6 w-6 text-white group-hover:text-emerald-400 transition-colors" />
                    {cartCount > 0 && (
                      <span className="absolute -top-3 -right-2 text-white text-[9px] rounded-full bg-emerald-500 w-4 h-4 flex items-center justify-center font-black">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SEARCH BAR - Pushed below on mobile, center on desktop */}
          <div className="w-full md:flex-1 md:max-w-2xl md:mx-auto">
            <Searchbar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
              suggestions={searchSuggestions}
              suggestionsLoading={searchSuggestionsLoading}
              onSuggestionSelect={handleSuggestionSelect}
              onViewAllMatches={handleViewAllMatches}
            />
          </div>

          {/* DESKTOP ONLY ICONS */}
          <div className="hidden md:flex items-center gap-6 ml-auto">
          {/* 🔐 AUTH SECTION */}
          {user ? (
            <>
              <div className="flex items-center space-x-4 py-0.5">
                {/* ❤️ Wishlist Icon with count badge */}
                <Link
                  to="/wishlist"
                  title="My Wishlist"
                  className="relative group"
                >
                  <HiOutlineHeart className="h-6 w-6 text-white hover:text-red-400 transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-4 -right-1 text-white text-xs rounded-full bg-red-500 min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* 🔔 Notifications Icon */}
                <Link
                  to="/notifications"
                  title="Notifications"
                  className="relative group"
                >
                  <HiOutlineBell className="h-6 w-6 text-white hover:text-emerald-400 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-4 -right-1 text-white text-xs rounded-full bg-red-500 min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* 🛒 Cart Icon with live badge */}
                <button
                  onClick={toggleCartDrawer}
                  className="relative hover:text-green-500 transition-colors"
                >
                  <HiOutlineShoppingCart className="h-6 w-6 text-white hover:text-green-500" />
                  {cartCount > 0 && (
                    <span className="absolute -top-4 -right-1 text-white text-xs rounded-full bg-[#0C970C] min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="h-6 w-[1px] bg-gray-600"></div>

              {/* User Profile Section - Vertical Layout */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileOpen(!profileOpen);
                  }}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <HiOutlineUser className="h-6 w-6 text-white group-hover:text-green-500 transition-colors" />
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-300 group-hover:text-green-400 transition-colors uppercase tracking-tight leading-tight">
                      {truncateText(user?.fullname || user?.full_name, 12)}
                    </p>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg shadow-lg overflow-hidden z-50">
                    {["vendor", "seller"].includes(String(user?.role || "").toLowerCase()) && (
                      <Link
                        to="/vendor"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 border-b border-slate-100"
                      >
                        {t("nav.vendorDashboard")}
                      </Link>
                    )}
                    <Link
                      to="/my-orders"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {t("nav.myOrders")}
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Messages
                    </Link>
                    <Link
                      to="/vendor/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Notifications
                    </Link>
                    <Link
                      to="/exchange"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 font-semibold text-black border-b border-slate-100"
                    >
                      Crop Exchange
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {t("nav.updateProfile")}
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="text-white font-lora hover:text-green-500 uppercase hover:underline text-sm font-medium px-2"
              >
                {t("nav.signup")}
              </Link>
              <Link
                to="/login"
                className="text-white hover:text-green-500 uppercase hover:underline text-sm font-medium px-2"
              >
                {t("nav.login")}
              </Link>

              <div className="flex items-center space-x-4 py-0.5">
                {/* 🛒 Cart Icon with live badge */}
                <button
                  onClick={toggleCartDrawer}
                  className="relative hover:text-green-500 transition-colors"
                >
                  <HiOutlineShoppingCart className="h-6 w-6 text-white hover:text-green-500" />
                  {cartCount > 0 && (
                    <span className="absolute -top-4 -right-1 text-white text-xs rounded-full bg-[#0C970C] min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      <CartDrawer
        drawerOpen={drawerOpen}
        toggleCartDrawer={toggleCartDrawer}
      />

      {showAuthModal && (
        <LoginModal
          message={authModalMessage}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default Navbar;
