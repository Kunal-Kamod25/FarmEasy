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


// single nav item with hover dropdown
const NavItem = ({ title, items, onClick, isOpen, onMouseEnter }) => {
  const navigate = useNavigate();

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
    >
      {/* Title — click goes to category page, hover opens dropdown */}
      <div
        className="flex items-center gap-1 cursor-pointer py-3 md:py-0.5 text-white"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
      >
        <span className="text-[13px] font-semibold uppercase tracking-wide hover:text-emerald-200 transition-colors text-nowrap">
          {title}
        </span>
        {items && items.length > 0 && (
          <RiArrowDownSLine
            size={18}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {/* Dropdown — shows products under this category */}
      {isOpen && items && items.length > 0 && (
        <div
          className="absolute left-0 top-full w-56 bg-white text-slate-800 rounded-b-xl shadow-2xl z-50 max-h-80 overflow-y-auto border border-slate-100"
        >
          {/* first item: "View All" link for this category */}
          {onClick && (
            <button
              onClick={() => { onClick(); }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-emerald-600 hover:bg-emerald-50 border-b border-slate-100 transition-colors"
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
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-xs font-bold uppercase text-slate-700 hover:text-emerald-700 transition-colors"
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
  const navigate = useNavigate();

  // fetch categories + their products from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryRes = await axios.get(`${API}/api/categories`);
        const categoryData = categoryRes.data;

        // for each category, fetch its products to show in the dropdown
        const updatedCategories = await Promise.all(
          categoryData.map(async (category) => {
            const productRes = await axios.get(
              `${API}/api/products/category/${category.id}`
            );
            return { ...category, products: productRes.data };
          })
        );

        setCategories(updatedCategories);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // build brand dropdown items — each brand searches by name in /products
  const brandItems = useMemo(() => BRAND_LIST.map((name) => ({
    name,
    path: `/products?search=${encodeURIComponent(name)}`,
  })), []);

  return (
    <div className="bg-gradient-to-r from-[#0a5e43] via-[#0b6e4f] to-[#0a5e43] text-white shadow-md">
      <nav className="container mx-auto flex items-center justify-between py-2 px-6">

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
            absolute md:static top-[45px] left-0 w-full md:w-auto
            bg-[#0b6e4f] md:bg-transparent
            flex flex-col md:flex-row md:items-center md:space-x-5 px-6 md:px-0
            ${navOpen ? "block z-50 shadow-xl" : "hidden md:flex"}
          `}
        >
          {/* All Products — goes to /products page */}
          <NavItem
            title="All Products"
            isOpen={openIndex === "all"}
            onMouseEnter={() => setOpenIndex("all")}
            onClick={() => navigate("/products")}
          />

          {/* Brands — dropdown of real brand names */}
          <NavItem
            title="Brands"
            items={brandItems}
            isOpen={openIndex === "brands"}
            onMouseEnter={() => setOpenIndex("brands")}
          />

          {/* Dynamic Categories from Database — products inside each dropdown */}
          {categories.map((category) => (
            <NavItem
              key={category.id}
              title={category.product_cat_name}
              isOpen={openIndex === category.id}
              onMouseEnter={() => setOpenIndex(category.id)}
              onClick={() => navigate(`/products?category=${category.id}`)}
              items={
                category.products?.length > 0
                  ? category.products.map((product) => ({
                    name: product.product_name,
                    path: `/product/${product.id}`,
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
