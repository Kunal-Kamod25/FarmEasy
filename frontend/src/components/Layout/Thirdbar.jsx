import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiArrowDownSLine, RiMenuLine, RiCloseLine } from "react-icons/ri";
import axios from "axios";


// This component is for single nav item with dropdown
const NavItem = ({ title, items, categoryId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // When clicking category title
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
      {/* Main Title */}
      <div
        className="flex items-center gap-1 cursor-pointer py-3 md:py-0.5 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className="text-sm font-medium uppercase hover:text-emerald-200"
          onClick={handleCategoryClick}
        >
          {title}
        </span>
        <RiArrowDownSLine
          size={20}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && items && (
        <div className="absolute left-0 top-full w-48 bg-white text-gray-800 shadow-xl z-50 max-h-60 overflow-y-auto">
          <ul className="py-2">
            {items.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-xs font-bold uppercase"
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
  const [categories, setCategories] = useState([]); // store categories from backend
  const navigate = useNavigate();

  // fetch categories when component loads
  useEffect(() => {

    const fetchData = async () => {
      try {

        // get categories
        const categoryRes = await axios.get("http://localhost:5000/api/categories");
        const categoryData = categoryRes.data;

        // get products for each category
        const updatedCategories = await Promise.all(
          categoryData.map(async (category) => {

            const productRes = await axios.get(
              `http://localhost:5000/api/products/category/${category.id}`
            );

            return {
              ...category,
              products: productRes.data
            };
          })
        );

        setCategories(updatedCategories);

      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();

  }, []);

  return (
    <div className="bg-[#0b6e4f] text-white">
      <nav className="container mx-auto flex items-center justify-between py-2 px-6">

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center" onClick={() => setNavOpen(!navOpen)}>
          {navOpen ? <RiCloseLine size={30} /> : <RiMenuLine size={30} />}
          <span className="ml-2 font-bold uppercase text-sm">Menu</span>
        </div>

        {/* Menu Links */}
        <div className={`
          absolute md:static top-[45px] left-0 w-full md:w-auto bg-[#0b6e4f]
          flex flex-col md:flex-row md:space-x-6 px-6 md:px-0
          ${navOpen ? "block" : "hidden md:flex"}
        `}>

          {/* Static Nav Items */}
          <NavItem
            title="All Products"
            categoryId="main"
            items={[{ name: "View All", path: "/?category=main" }]}
          />

          <NavItem
            title="Brands"
            items={[
              { name: "Bayer", path: "/bayer" },
              { name: "Syngenta", path: "/syngenta" },
            ]}
          />

          {/* Dynamic Categories from Database */}
          {categories.map((category) => (
            <NavItem
              key={category.id}
              title={category.product_cat_name}
              categoryId={category.id}
              items={
                category.products
                  ? category.products.map((product) => ({
                    name: product.product_name,
                    path: `/product/${product.id}`
                  }))
                  : []
              }
            />
          ))}

        </div>

        {/* Delivery Info */}
        <div className="hidden md:block text-xs font-bold uppercase text-emerald-100">
          Free Delivery on orders over ₹3,000
        </div>

      </nav>
    </div>
  );
};

export default Thirdbar;