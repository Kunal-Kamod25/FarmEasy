import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiArrowDownSLine, RiMenuLine, RiCloseLine } from "react-icons/ri";

const NavItem = ({ title, items, categoryId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (e) => {
    if (categoryId) {
      e.stopPropagation();
      navigate(`/?category=${categoryId}`);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        className="flex items-center justify-between md:justify-start gap-1 cursor-pointer py-3 md:py-0.5 text-white border-b border-[#128a64] md:border-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className="text-sm font-medium uppercase hover:text-emerald-200 transition-colors"
          onClick={handleCategoryClick}
        >
          {title}
        </span>
        <RiArrowDownSLine
          size={20}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown Items */}
      {isOpen && (
        <div className="md:absolute static left-0 top-full w-full md:w-48 bg-white text-gray-800 shadow-xl z-50">
          <ul className="py-2">
            {items.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full text-left block px-6 md:px-4 py-2 hover:bg-gray-100 text-xs font-bold uppercase transition-colors"
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
  const navigate = useNavigate();

  return (
    <div className="bg-[#0b6e4f] text-white">
      <nav className="container mx-auto flex items-center justify-between py-2 px-6">

        {/* 1. Hamburger Icon */}
        <div className="md:hidden flex items-center" onClick={() => setNavOpen(!navOpen)}>
          {navOpen ? <RiCloseLine size={30} /> : <RiMenuLine size={30} />}
          <span className="ml-2 font-bold uppercase text-sm">Menu</span>
        </div>

        {/* 2. Menu Links Container */}
        <div className={`
          absolute md:static top-[45px] left-0 w-full md:w-auto bg-[#0b6e4f] 
          flex flex-col md:flex-row md:space-x-6 px-6 md:px-0 transition-all duration-300 ease-in-out
          ${navOpen ? "opacity-100 visible" : "opacity-0 invisible md:opacity-100 md:visible md:flex"}
          z-40 border-t border-[#128a64] md:border-none
        `}>
          <NavItem title="All Products" categoryId="main" items={[{ name: "Catalog", path: "/?category=main" }]} />
          <NavItem title="Brands"
            items={[{ name: "Bayer", path: "/bayer" },
            { name: "Syngenta", path: "/Syngenta" },
            { name: "Dhanuka", path: "/dhanuka" },
            { name: "UPL", path: "/upl" }
            ]}
          />
          <NavItem
            title="Fertilizers"
            categoryId="fertilizers"
            items={[
              { name: "Urea", path: "/?category=fertilizers" },
              { name: "IFFCO", path: "/?category=fertilizers" },
              { name: "DAP", path: "/?category=fertilizers" },
              { name: "NPK", path: "/?category=fertilizers" },
              { name: "Organic Fertilizers", path: "/?category=fertilizers" },
            ]}
          />
          <NavItem
            title="Equipment"
            categoryId="equipment"
            items={[{ name: "Handpump", path: "/?category=equipment" }]}
          />
          <NavItem
            title="Seeds"
            categoryId="seeds"
            items={[
              { name: "Corn", path: "/?category=seeds" },
              { name: "Paddy", path: "/?category=seeds" },
              { name: "Wheat", path: "/?category=seeds" },
            ]}
          />
          <NavItem
            title="Irrigation"
            categoryId="irrigation"
            items={[
              { name: "Sprinklers", path: "/?category=irrigation" },
              { name: "Drip Irrigation", path: "/?category=irrigation" },
            ]}
          />
          <NavItem
            title="Animal Food"
            categoryId="pets"
            items={[
              { name: "Cattle Feed", path: "/?category=pets" },
              { name: "Poultry Feed", path: "/?category=pets" },
            ]}
          />
          <NavItem
            title="Tools"
            categoryId="tools"
            items={[
              { name: "Hand Tools", path: "/?category=tools" },
            ]}
          />
          <NavItem
            title="Pesticides"
            categoryId="pesticides"
            items={[
              { name: "Crop Protection", path: "/?category=pesticides" },
            ]}
          />
        </div>

        {/* 3. Delivery info */}
        <div className="hidden md:block text-xs font-bold uppercase tracking-wider text-emerald-100">
          Free Delivery on orders over ₹3,000
        </div>
      </nav>
    </div>
  );
};

export default Thirdbar;