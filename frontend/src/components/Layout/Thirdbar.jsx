import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RiArrowDownSLine, RiMenuLine, RiCloseLine } from "react-icons/ri";
import axios from "axios";
import { API_URL } from '../../config';

const API = `${API_URL}`;

// ═══════════════════════════════════════════════════════════
// BRANDS LIST — real Indian agricultural brands farmers recognize
// clicking a brand navigates to products page filtered by that brand name
// ═══════════════════════════════════════════════════════════
const BRAND_LIST = [
  "Bayer", "Syngenta", "UPL", "Tata Rallis", "Dhanuka",
  "IFFCO", "Godrej Agrovet", "PI Industries", "Jain Irrigation",
  "Coromandel", "Chambal", "Kaveri Seeds", "Mahyco", "Netafim",
];


// single nav item with hover/click dropdown
const NavItem = ({
  title,
  items,
  onClick,
  isOpen,
  onMouseEnter,
  onToggle,
  onItemSelect,
  isMobileLayout,
  useTapInteraction,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`relative ${isMobileLayout ? "w-full border-b border-emerald-500/35 last:border-b-0" : ""}`}
      onMouseEnter={useTapInteraction ? undefined : onMouseEnter}
    >
      {/* Title — click goes to category page, hover opens dropdown */}
      <div
        className={`cursor-pointer text-white ${
          isMobileLayout
            ? "flex w-full items-center justify-between py-2.5"
            : "flex items-center gap-1 py-3 md:py-0.5"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (useTapInteraction && items && items.length > 0) {
            if (onToggle) onToggle();
            return;
          }
          if (onClick) {
            onClick();
            if (onItemSelect) onItemSelect();
          }
        }}
      >
        <span className={`hover:text-emerald-200 transition-colors text-nowrap ${
          isMobileLayout
            ? "text-[14px] font-semibold uppercase tracking-[0.03em]"
            : "text-[13px] font-semibold uppercase tracking-wide"
        }`}>
          {title}
        </span>
        {items && items.length > 0 && (
          <RiArrowDownSLine
            size={isMobileLayout ? 20 : 18}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {/* Dropdown — shows products under this category */}
      {isOpen && items && items.length > 0 && (
        <div
          className={`${
            isMobileLayout
              ? "mt-1 mb-2 w-full bg-white/95 text-slate-800 rounded-lg shadow-lg max-h-52 overflow-y-auto border border-slate-200"
              : "absolute left-0 top-full w-56 bg-white text-slate-800 rounded-b-xl shadow-2xl z-50 max-h-80 overflow-y-auto border border-slate-100"
          }`}
        >
          {/* first item: "View All" link for this category */}
          {onClick && (
            <button
              onClick={() => {
                onClick();
                if (onItemSelect) onItemSelect();
              }}
              className={`w-full text-left py-2.5 text-xs font-bold uppercase text-emerald-600 hover:bg-emerald-50 border-b border-slate-100 transition-colors ${
                isMobileLayout ? "px-3" : "px-4"
              }`}
            >
              View All {title} →
            </button>
          )}
          <ul className="py-1">
            {items.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    if (onItemSelect) onItemSelect();
                  }}
                  className={`w-full text-left hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors ${
                    isMobileLayout
                      ? "px-3 py-2 text-[13px] leading-snug font-semibold normal-case"
                      : "px-4 py-2.5 text-xs font-bold uppercase"
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


const Thirdbar = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null);

  const closeMenu = () => {
    setNavOpen(false);
    setOpenIndex(null);
  };

  const toggleDropdown = (key) => {
    setOpenIndex((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    const detectTouch = () => {
      if (typeof window === "undefined") return;
      const touch = window.matchMedia && window.matchMedia("(hover: none)").matches;
      setIsTouchDevice(!!touch);
    };

    detectTouch();
    window.addEventListener("resize", detectTouch);
    return () => window.removeEventListener("resize", detectTouch);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  // Fetch parent categories (category_id = null) from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryRes = await axios.get(`${API}/api/categories`);
        
        // categoryRes.data structure: { success: true, data: { categories: [...] } }
        const categoryData = categoryRes.data?.data?.categories || categoryRes.data || [];

        // Filter only parent categories (parent_id is null/undefined)
        const parentCategories = categoryData.filter(cat => !cat.parent_id);

        // For each parent category, fetch its subcategories
        const categoriesWithSubs = await Promise.all(
          parentCategories.map(async (parentCat) => {
            try {
              const subsRes = await axios.get(
                `${API}/api/categories/${parentCat.id}/subcategories`
              );
              return {
                ...parentCat,
                subcategories: subsRes.data?.data?.subcategories || [],
              };
            } catch {
              return { ...parentCat, subcategories: [] };
            }
          })
        );

        setCategories(categoriesWithSubs);
      } catch (_error) {
        console.log("Error fetching categories:", _error);
        // Fallback to empty if API fails
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // build brand dropdown items — each brand searches by name in /products
  const brandItems = useMemo(() => BRAND_LIST.map((name) => ({
    name,
    path: `/products?search=${encodeURIComponent(name)}`,
  })), []);

  return (
    <div className="bg-gradient-to-r from-[#0a5e43] via-[#0b6e4f] to-[#0a5e43] text-white shadow-md">
      {navOpen && (
        <button
          type="button"
          aria-label="Close mobile menu"
          onClick={closeMenu}
          className="md:hidden fixed inset-0 bg-black/35 z-40"
        />
      )}

      <nav ref={navRef} className="relative container mx-auto flex items-center justify-between py-2 px-4 md:px-6">

        {/* Mobile menu button */}
        <div
          className="md:hidden flex items-center cursor-pointer"
          onClick={() => setNavOpen(!navOpen)}
        >
          {navOpen ? <RiCloseLine size={28} /> : <RiMenuLine size={28} />}
          <span className="ml-2 font-bold uppercase text-sm">Menu</span>
        </div>

        {/* Menu Links — dynamic from DB */}
        <div
          onMouseLeave={() => setOpenIndex(null)}
          className={`
            absolute md:static top-full left-0 w-full md:w-auto
            bg-[#0b6e4f] md:bg-transparent
            rounded-b-2xl md:rounded-none border-t border-emerald-400/30 md:border-0
            flex-col md:flex-row md:items-center md:space-x-5 px-4 md:px-0 py-2 md:py-0
            max-h-[62vh] overflow-y-auto md:overflow-visible
            ${navOpen ? "flex z-50 shadow-xl" : "hidden md:flex"}
          `}
        >
          {/* All Products — goes to /products page */}
          <NavItem
            title="All Products"
            onClick={() => navigate("/products")}
            onItemSelect={closeMenu}
            isMobileLayout={navOpen}
            useTapInteraction={navOpen || isTouchDevice}
          />

          {/* Brands — dropdown of real brand names */}
          <NavItem
            title="Brands"
            items={brandItems}
            isOpen={openIndex === "brands"}
            onMouseEnter={() => setOpenIndex("brands")}
            onToggle={() => toggleDropdown("brands")}
            onItemSelect={closeMenu}
            isMobileLayout={navOpen}
            useTapInteraction={navOpen || isTouchDevice}
          />

          {/* Dynamic Categories from Database — subcategories inside each dropdown */}
          {categories.map((category) => (
            <NavItem
              key={category.id}
              title={category.name || category.product_cat_name}
              isOpen={openIndex === category.id}
              onMouseEnter={() => setOpenIndex(category.id)}
              onClick={() => navigate(`/category/${category.id}`)}
              onToggle={() => toggleDropdown(category.id)}
              onItemSelect={closeMenu}
              isMobileLayout={navOpen}
              useTapInteraction={navOpen || isTouchDevice}
              items={
                category.subcategories && category.subcategories.length > 0
                  ? category.subcategories.map((sub) => ({
                    name: sub.name,
                    path: `/category/${sub.id}`,
                  }))
                  : null
              }
            />
          ))}
        </div>

        {/* Delivery info banner */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase text-emerald-200">
          <span>🚚</span> Free Delivery on orders over ₹3,000
        </div>
      </nav>
    </div>
  );
};

export default Thirdbar;
