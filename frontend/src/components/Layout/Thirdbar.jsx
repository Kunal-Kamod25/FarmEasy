import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RiArrowDownSLine, RiMenuLine, RiCloseLine, RiArrowRightSLine } from "react-icons/ri";
import axios from "axios";
import { API_URL } from "../../config";

const API = `${API_URL}`;

// ─────────────────────────────────────────────
// Fallback image for products without images
// ─────────────────────────────────────────────
const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23e8f5e9'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%234caf50'%3E🌿%3C/text%3E%3C/svg%3E";

// ─────────────────────────────────────────────
// MEGA MENU — 3-level panel
// Categories → Subcategories → Products
// ─────────────────────────────────────────────
const MegaMenu = ({ category, onClose }) => {
  const navigate = useNavigate();
  const [hoveredSub, setHoveredSub] = useState(null);

  // Default: show first subcategory's products on open
  const defaultSub =
    category.subcategories && category.subcategories.length > 0
      ? category.subcategories[0]
      : null;

  const activeSub = hoveredSub !== null ? hoveredSub : defaultSub;

  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      className="absolute left-0 top-full flex shadow-2xl rounded-b-xl border border-slate-100 overflow-hidden z-50"
      style={{ minWidth: 600 }}
      onMouseLeave={onClose}
    >
      {/* ── COLUMN 1: Subcategories ── */}
      <div className="bg-white w-56 flex-shrink-0 border-r border-slate-100 py-2">
        {/* View All link */}
        <button
          onClick={() => goTo(`/category/${category.id}`)}
          className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-emerald-600 hover:bg-emerald-50 border-b border-slate-100 transition-colors"
        >
          View All {category.name} →
        </button>

        {/* Direct products (no subcategory) shown as a section if present */}
        {category.subcategories && category.subcategories.length === 0 && (
          <p className="px-4 py-2 text-xs text-slate-400 italic">No subcategories</p>
        )}

        {/* Subcategory list */}
        {category.subcategories &&
          category.subcategories.map((sub) => (
            <button
              key={sub.id}
              onMouseEnter={() => setHoveredSub(sub)}
              onClick={() => goTo(`/category/${sub.id}`)}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between group transition-colors ${
                activeSub?.id === sub.id
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <span className="text-sm">{sub.name}</span>
              {sub.products && sub.products.length > 0 && (
                <RiArrowRightSLine
                  size={16}
                  className={`transition-colors ${
                    activeSub?.id === sub.id ? "text-emerald-600" : "text-slate-300 group-hover:text-emerald-400"
                  }`}
                />
              )}
            </button>
          ))}
      </div>

      {/* ── COLUMN 2: Products of active subcategory ── */}
      <div className="bg-slate-50 flex-1 p-4">
        {activeSub ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {activeSub.name}
              </h3>
              <button
                onClick={() => goTo(`/category/${activeSub.id}`)}
                className="text-xs text-emerald-600 hover:underline font-semibold"
              >
                View All →
              </button>
            </div>

            {activeSub.products && activeSub.products.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {activeSub.products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => goTo(`/product/${product.id}`)}
                    className="bg-white rounded-lg border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all text-left overflow-hidden group"
                  >
                    <div className="relative w-full h-20 bg-slate-50 overflow-hidden">
                      <img
                        src={product.product_image || FALLBACK_IMG}
                        alt={product.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => { e.target.src = FALLBACK_IMG; }}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">
                        {product.product_name}
                      </p>
                      <p className="text-xs text-emerald-600 font-bold mt-1">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : category.directProducts && category.directProducts.length > 0 ? (
              /* Fallback: show parent category products if subcategory has none */
              <div>
                <p className="text-xs text-slate-400 mb-2 italic">Showing all {category.name} products</p>
                <div className="grid grid-cols-3 gap-3">
                  {category.directProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => goTo(`/product/${product.id}`)}
                      className="bg-white rounded-lg border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all text-left overflow-hidden group"
                    >
                      <div className="relative w-full h-20 bg-slate-50 overflow-hidden">
                        <img
                          src={product.product_image || FALLBACK_IMG}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => { e.target.src = FALLBACK_IMG; }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">
                          {product.product_name}
                        </p>
                        <p className="text-xs text-emerald-600 font-bold mt-1">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-28 text-slate-400">
                <span className="text-3xl mb-2">🌱</span>
                <p className="text-xs">No products yet in {activeSub.name}</p>
              </div>
            )}
          </>
        ) : (
          /* No subcategories — show direct category products */
          <>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              {category.name} Products
            </h3>
            {category.directProducts && category.directProducts.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {category.directProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => goTo(`/product/${product.id}`)}
                    className="bg-white rounded-lg border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all text-left overflow-hidden group"
                  >
                    <div className="relative w-full h-20 bg-slate-50 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.product_image || FALLBACK_IMG}
                        alt={product.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMG;
                        }}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">
                        {product.product_name}
                      </p>
                      <p className="text-xs text-emerald-600 font-bold mt-1">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-28 text-slate-400">
                <span className="text-3xl mb-2">🌱</span>
                <p className="text-xs">No products available yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MOBILE ACCORDION — category → subcategory → product list
// ─────────────────────────────────────────────
const MobileNavItem = ({ category, onClose }) => {
  const navigate = useNavigate();
  const [catOpen, setCatOpen] = useState(false);
  const [openSubId, setOpenSubId] = useState(null);

  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="border-b border-emerald-500/30 last:border-b-0">
      {/* Category row */}
      <div
        className="flex items-center justify-between py-2.5 cursor-pointer"
        onClick={() => setCatOpen((p) => !p)}
      >
        <span
          className="text-[14px] font-semibold uppercase tracking-[0.03em] text-white hover:text-emerald-200"
          onClick={(e) => {
            e.stopPropagation();
            goTo(`/category/${category.id}`);
          }}
        >
          {category.name}
        </span>
        <RiArrowDownSLine
          size={20}
          className={`text-white transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Subcategory accordion */}
      {catOpen && (
        <div className="ml-3 mb-2 bg-white/10 rounded-lg overflow-hidden">
          {/* View all */}
          <button
            onClick={() => goTo(`/category/${category.id}`)}
            className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-200 uppercase border-b border-white/10"
          >
            View All {category.name} →
          </button>

          {category.subcategories &&
            category.subcategories.map((sub) => (
              <div key={sub.id} className="border-b border-white/10 last:border-b-0">
                <div
                  className="flex items-center justify-between px-3 py-2 cursor-pointer"
                  onClick={() => setOpenSubId((p) => (p === sub.id ? null : sub.id))}
                >
                  <span
                    className="text-sm text-white/90 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      goTo(`/category/${sub.id}`);
                    }}
                  >
                    {sub.name}
                  </span>
                  {sub.products && sub.products.length > 0 && (
                    <RiArrowDownSLine
                      size={16}
                      className={`text-white/60 transition-transform duration-200 ${
                        openSubId === sub.id ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>

                {/* Products under this subcategory */}
                {openSubId === sub.id &&
                  sub.products &&
                  sub.products.length > 0 && (
                    <div className="ml-3 mb-2">
                      {sub.products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => goTo(`/product/${product.id}`)}
                          className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-white/10 transition-colors"
                        >
                          <img
                            src={product.product_image || FALLBACK_IMG}
                            alt={product.product_name}
                            className="w-8 h-8 object-cover rounded"
                            onError={(e) => {
                              e.target.src = FALLBACK_IMG;
                            }}
                          />
                          <div>
                            <p className="text-xs text-white/90 font-medium leading-tight line-clamp-1">
                              {product.product_name}
                            </p>
                            <p className="text-xs text-emerald-300 font-bold">
                              ₹{Number(product.price).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={() => goTo(`/category/${sub.id}`)}
                        className="text-xs text-emerald-300 hover:underline px-2 pb-1"
                      >
                        View All →
                      </button>
                    </div>
                  )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// SIMPLE NAV ITEM — mobile version (needs its own hook scope)
// ─────────────────────────────────────────────
const SimpleMobileNavItem = ({ title, items, onClick, onItemSelect }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-emerald-500/30 last:border-b-0">
      <div
        className="flex items-center justify-between py-2.5 cursor-pointer"
        onClick={() => {
          if (items && items.length > 0) setOpen((p) => !p);
          else {
            onClick && onClick();
            onItemSelect && onItemSelect();
          }
        }}
      >
        <span className="text-[14px] font-semibold uppercase tracking-[0.03em] text-white hover:text-emerald-200">
          {title}
        </span>
        {items && items.length > 0 && (
          <RiArrowDownSLine
            size={20}
            className={`text-white transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </div>
      {open && items && items.length > 0 && (
        <div className="ml-3 mb-2 bg-white/10 rounded-lg overflow-hidden">
          {onClick && (
            <button
              onClick={() => { onClick(); onItemSelect && onItemSelect(); }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-200 uppercase border-b border-white/10"
            >
              View All {title} →
            </button>
          )}
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => { navigate(item.path); onItemSelect && onItemSelect(); }}
              className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10 border-b border-white/10 last:border-b-0 transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// SIMPLE NAV ITEM — desktop version
// (for "All Products" and "Brands" which don't need mega-menu)
// ─────────────────────────────────────────────
const SimpleNavItem = ({
  title,
  items,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onToggle,
  onItemSelect,
  isActive,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div
        className={`flex items-center gap-1 py-3 md:py-0.5 cursor-pointer transition-all ${
          isActive ? "text-emerald-400" : "text-white hover:text-emerald-200"
        }`}
        onClick={() => {
          if (items && items.length > 0) onToggle && onToggle();
          else {
            onClick && onClick();
            onItemSelect && onItemSelect();
          }
        }}
      >
        <span className="text-[13px] font-semibold uppercase tracking-wide text-nowrap">
          {title}
        </span>
        {items && items.length > 0 && (
          <RiArrowDownSLine
            size={18}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {isOpen && items && items.length > 0 && (
        <div className="absolute left-0 top-full w-56 bg-white text-slate-800 rounded-b-xl shadow-2xl z-50 max-h-80 overflow-y-auto border border-slate-100">
          {onClick && (
            <button
              onClick={() => { onClick(); onItemSelect && onItemSelect(); }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-emerald-600 hover:bg-emerald-50 border-b border-slate-100 transition-colors"
            >
              View All {title} →
            </button>
          )}
          <ul className="py-1">
            {items.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => { navigate(item.path); onItemSelect && onItemSelect(); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors"
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


// ─────────────────────────────────────────────
// DESKTOP CATEGORY NAV ITEM with MegaMenu
// ─────────────────────────────────────────────
const DesktopCategoryItem = ({ category, isOpen, onMouseEnter, onClose, onCancelClose, isActive }) => {
  const navigate = useNavigate();

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onClose}
    >
      <div
        className={`flex items-center gap-1.5 cursor-pointer py-4 transition-all relative group/item ${
          isActive ? "text-emerald-400" : "text-white hover:text-emerald-200"
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onClose}
        onClick={() => navigate(`/category/${category.id}`)}
      >
        <span className="text-[13px] font-semibold uppercase tracking-wide text-nowrap">
          {category.name}
        </span>
        <RiArrowDownSLine
          size={18}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        // cancelClose when mouse enters the mega-menu panel itself
        <div onMouseEnter={onCancelClose} onMouseLeave={onClose}>
          <MegaMenu category={category} onClose={onClose} />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// THIRDBAR — main nav component
// ─────────────────────────────────────────────
const Thirdbar = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [navData, setNavData] = useState([]); // full data: categories + subs + products
  const [brands, setBrands] = useState([]);
  const [openKey, setOpenKey] = useState(null); // key of open desktop dropdown
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const closeTimer = useRef(null);

  const closeMenu = () => {
    setNavOpen(false);
    setOpenKey(null);
  };

  // Delayed close so mouse can move from item to mega-menu without flicker
  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenKey(null), 120);
  }, []);

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimer.current);
  }, []);

  // Outside click
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) closeMenu();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  // Fetch mega-menu nav data (categories → subcategories → products)
  useEffect(() => {
    const fetchNavData = async () => {
      try {
        const res = await axios.get(`${API}/api/categories/nav-data`);
        const data = res.data?.data || [];
        setNavData(data);
      } catch (err) {
        console.error("❌ Failed to fetch nav data:", err);
        // Fallback: try the plain categories endpoint
        try {
          const res2 = await axios.get(`${API}/api/categories`);
          const cats = res2.data?.data || res2.data || [];
          setNavData(
            cats.map((c) => ({
              ...c,
              directProducts: [],
              subcategories: (c.subcategories || []).map((s) => ({
                ...s,
                products: [],
              })),
            }))
          );
        } catch {
          setNavData([]);
        }
      }
    };
    fetchNavData();
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${API}/api/brands`);
        const data = res.data?.data || res.data || [];
        setBrands(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching brands:", err);
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  const brandItems = brands.map((b) => ({
    name: b.name,
    path: `/products?search=${encodeURIComponent(b.name)}`,
  }));

  return (
    <div className="bg-gradient-to-r from-[#0a5e43] via-[#0b6e4f] to-[#0a5e43] text-white shadow-md">
      {/* Mobile overlay */}
      {navOpen && (
        <button
          type="button"
          aria-label="Close mobile menu"
          onClick={closeMenu}
          className="md:hidden fixed inset-0 bg-black/35 z-40"
        />
      )}

      <nav
        ref={navRef}
        className="relative container mx-auto flex items-center justify-between py-2 px-4 md:px-6"
      >
        {/* Mobile hamburger */}
        <div
          className="md:hidden flex items-center cursor-pointer"
          onClick={() => setNavOpen(!navOpen)}
        >
          {navOpen ? <RiCloseLine size={28} /> : <RiMenuLine size={28} />}
          <span className="ml-2 font-bold uppercase text-sm">Menu</span>
        </div>

        {/* ── DESKTOP MENU ── */}
        <div
          className="hidden md:flex items-center space-x-5"
          onMouseLeave={scheduleClose}
          onMouseEnter={cancelClose}
        >
          {/* All Products */}
          <SimpleNavItem
            title="All Products"
            onClick={() => navigate("/products")}
            onItemSelect={closeMenu}
            isActive={location.pathname === "/products"}
          />

          {/* Brands dropdown */}
          <SimpleNavItem
            title="Brands"
            items={brandItems}
            isOpen={openKey === "brands"}
            onMouseEnter={() => { cancelClose(); setOpenKey("brands"); }}
            onMouseLeave={scheduleClose}
            onToggle={() => setOpenKey((p) => (p === "brands" ? null : "brands"))}
            onItemSelect={closeMenu}
            isActive={location.search.includes("brand")}
          />

          {/* Dynamic category mega-menus */}
          {navData.map((category) => (
            <DesktopCategoryItem
              key={category.id}
              category={category}
              isOpen={openKey === category.id}
              onMouseEnter={() => { cancelClose(); setOpenKey(category.id); }}
              onClose={scheduleClose}
              onCancelClose={cancelClose}
              isActive={
                location.pathname === `/category/${category.id}` ||
                location.search.includes(`category_id=${category.id}`)
              }
            />
          ))}
        </div>

        {/* ── MOBILE MENU ── */}
        <div
          className={`
            absolute md:hidden top-full left-0 w-full
            bg-[#0b6e4f]
            rounded-b-2xl border-t border-emerald-400/30
            flex-col px-4 py-2
            max-h-[75vh] overflow-y-auto
            ${navOpen ? "flex z-50 shadow-xl" : "hidden"}
          `}
        >
          {/* All Products */}
          <div className="border-b border-emerald-500/30">
            <button
              onClick={() => { navigate("/products"); closeMenu(); }}
              className="w-full text-left py-2.5 text-[14px] font-semibold uppercase tracking-[0.03em] text-white hover:text-emerald-200"
            >
              All Products
            </button>
          </div>

          {/* Brands */}
          <SimpleMobileNavItem
            title="Brands"
            items={brandItems}
            onItemSelect={closeMenu}
          />

          {/* Categories */}
          {navData.map((category) => (
            <MobileNavItem
              key={category.id}
              category={category}
              onClose={closeMenu}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Thirdbar;
