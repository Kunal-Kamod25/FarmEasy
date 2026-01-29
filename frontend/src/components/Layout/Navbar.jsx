import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { HiOutlineUser, HiBars3BottomRight, HiOutlineShoppingCart, } from "react-icons/hi2";
import Searchbar from "../Common/Searchbar";
import LanguageSwitcher from "../Common/LanguageSwitcher";
import AiSpeechOrder from "../Common/AiSpeechOrder";
import CartDrawer from "./CartDrawer";

const Navbar = () => {
  const truncateText = (text, maxLength = 10) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };
  const [SearchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", SearchTerm);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* 🔐 AUTH STATE */
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

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
    setUser(null);
    navigate("/login");
  };

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className="sticky top-0 z-50 bg-black text-white gap-4">
      <nav className="container mx-auto flex items-center py-1 px-6 gap-4">
        {/* Left Side */}
        <div className="flex items-center flex-1 gap-4 min-w-0">
          <div className="pl-1 flex items-center px-8 h-15">
            <Link to="/">
              <img
                src={logo}
                alt="logo"
                className="h-16 md:h-25 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex-1 min-w-0">
            <Searchbar
              SearchTerm={SearchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <AiSpeechOrder className="hidden md:block mr-6 items-right" />
          <LanguageSwitcher className="hidden md:block mr-6 items-right" />

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
                Hi, {truncateText(user.fullname, 10)}
              </button>

              {profileOpen && (
                <div className="absolute right-0.6 mt-2 w-44 bg-white text-black rounded-lg shadow-lg overflow-hidden z-50">
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
                <Link to="/admin" className="block px-2 rounded text-sm">Admin</Link>
                <Link to="/profile">
                  <HiOutlineUser className="h-6 w-6 text-white hover:text-green-500" />
                </Link>
              </>
            )}

            <button
              onClick={toggleCartDrawer}
              className="relative hover:text-black"
            >
              <HiOutlineShoppingCart className="h-6 w-6 text-white hover:text-green-500" />
              <span className="absolute -top-4 text-white text-xs rounded-full bg-[#0C970C] px-2 py-0.5">
                3
              </span>
            </button>

            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <HiBars3BottomRight className="h-6 w-6 hover:text-green-500" />
            </button>
          </div>
        </div>
      </nav >

      <CartDrawer
        drawerOpen={drawerOpen}
        toggleCartDrawer={toggleCartDrawer}
      />

      {/* Mobile Menu */}
      {
        isMobileMenuOpen && (
          <div className="md:hidden bg-[#181818] text-white px-6 py-4 space-y-4 border-t border-green-700">
            <Link className="block uppercase hover:text-green-500 hover:underline">
              Brands
            </Link>
            <Link className="block uppercase hover:text-green-500 hover:underline">
              Fertilizers
            </Link>
            <Link className="block uppercase hover:text-green-500 hover:underline">
              Equipment
            </Link>
            <Link className="block uppercase hover:text-green-500 hover:underline">
              Seeds
            </Link>
            <Link className="block uppercase hover:text-green-500 hover:underline">
              Irrigation
            </Link>

            <div className="border-t border-green-700"></div>

            <AiSpeechOrder className="w-full" />
            <LanguageSwitcher className="w-full" />
          </div>
        )
      }
    </div >
  );
};

export default Navbar;
