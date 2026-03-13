import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/Logo.png";
import {
  HiOutlineUser,
  HiOutlineShoppingCart,
  HiOutlineHeart,
} from "react-icons/hi2";
import Searchbar from "../Common/SearchBar";
import CartDrawer from "../Cart/CartDrawer";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const Navbar = () => {
  const truncateText = (text = "", maxLength = 10) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const [SearchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", SearchTerm);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);

  /* 🔐 AUTH STATE */
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  /* 🛒 CART */
  const { cartCount } = useCart();

  /* ❤️ WISHLIST */
  const { wishlistCount } = useWishlist();

  // close on outside click
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className="bg-black text-white py-1">
      <nav className="container mx-auto flex flex-col gap-3 px-3 py-2 md:flex-row md:items-center md:px-6 md:py-0 md:gap-4">
        {/* Left Side */}
        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:flex-none md:justify-start md:gap-4">
          <div className="flex items-center h-12 md:h-15 md:pl-1 md:px-8">
            <Link to="/">
              <img
                src={logo}
                alt="logo"
                className="h-12 md:h-25 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            {!user && (
              <>
                <Link
                  to="/register"
                  className="text-[11px] font-semibold uppercase tracking-wide text-white hover:text-green-400"
                >
                  Signup
                </Link>
                <Link
                  to="/login"
                  className="text-[11px] font-semibold uppercase tracking-wide text-white hover:text-green-400"
                >
                  Login
                </Link>
              </>
            )}

            {user && (
              <>
                <Link to="/wishlist" title="My Wishlist" className="relative group">
                  <HiOutlineHeart className="h-5 w-5 text-white hover:text-red-400 transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-3 -right-2 text-white text-[10px] rounded-full bg-red-500 min-w-[16px] h-4 flex items-center justify-center px-1 font-bold">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile">
                  <HiOutlineUser className="h-5 w-5 text-white hover:text-green-500 transition-colors" />
                </Link>
              </>
            )}

            <button
              onClick={toggleCartDrawer}
              className="relative hover:text-green-500 transition-colors"
            >
              <HiOutlineShoppingCart className="h-5 w-5 text-white hover:text-green-500" />
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-2 text-white text-[10px] rounded-full bg-[#0C970C] min-w-[16px] h-4 flex items-center justify-center px-1 font-bold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="w-full md:w-[520px] md:max-w-[52vw] md:min-w-0 md:mr-auto">
          <Searchbar
            SearchTerm={SearchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
          />
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-3">

          {/* 🔐 AUTH SECTION */}
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen(!profileOpen);
                }}
                className="text-white font-normal hover:underline px-2"
              >
                Hi, {truncateText(user?.fullname || user?.full_name, 10)}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg shadow-lg overflow-hidden z-50">
                  {user?.role === "vendor" && (
                    <Link
                      to="/vendor"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 border-b border-slate-100"
                    >
                      Vendor Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Update Profile
                  </Link>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/register"
                className="text-white font-lora hover:text-green-500 uppercase hover:underline text-sm font-medium px-2"
              >
                Signup
              </Link>
              <Link
                to="/login"
                className="text-white hover:text-green-500 uppercase hover:underline text-sm font-medium px-2"
              >
                Login
              </Link>
            </>
          )}

          <div className="flex items-center space-x-4 py-0.5">
            {user && (
              <>
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

                {/* 👤 Profile Icon */}
                <Link to="/profile">
                  <HiOutlineUser className="h-6 w-6 text-white hover:text-green-500 transition-colors" />
                </Link>
              </>
            )}

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
        </div>
      </nav>

      <CartDrawer
        drawerOpen={drawerOpen}
        toggleCartDrawer={toggleCartDrawer}
      />
    </div>
  );
};

export default Navbar;
