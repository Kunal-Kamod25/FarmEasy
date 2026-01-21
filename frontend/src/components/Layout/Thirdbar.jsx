// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { RiArrowDownSLine } from "react-icons/ri";
 
// const Thirdbar = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const categories = [
//     {name: "Fertilizers", path: "/fertilizers" },
//     {name: "Equipments", path: "/equipments" },
//     {name: "Seeds", path: "/seeds" },
//     {name: "Irrigation", path: "/irrigation"},
//   ];

//   return (
//     <div className="bg-[#0b6e4f] text-white">
//       <nav className="container mx-auto flex items-center py-1 px-6 space-x-4"> 
        
//         {/* Dropdown Start */}
//         <div 
//         className="relative group"
//         onMouseEnter={() => setIsDropdownOpen(true)}
//         onMouseLeave={() => setIsDropdownOpen(false)}
//         >
        
//         <div className="flex items-center gap-1 ">
//               <span>All Products</span>
//               <RiArrowDownSLine size={22} 
//               className={'transition-transform ${isDropdownOpen ? "rotate-180" : ""}'} 
//               />
//             </div>

//             {/* dropdown menu box */}
//             {isDropdownOpen && (
//             <div className="absolute left-0 top-full w-48 bg-white text-gray-800 shadow-xl rounded-b-md z-50 border-t-2 border-[#0b6e4f]">
//               <ul className="py-2">
//                 {categories.map((item, index) => (
//                   <li key={index}>
//                     <Link
//                       to={item.path}
//                       className="block px-4 py-2 hover:bg-gray-100 hover:text-[#0b6e4f] transition-colors text-sm font-medium"
//                     >
//                       {item.name}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Center - Navigation Links */}
//         <div className="hidden md:flex space-x-4 flex-grow">
//             <Link to="#" className="font-inter text-2xl text-white hover:text-gray-300 text-sm 
//             font-medium uppercase hover:underline cursor-pointer ">Brands</Link>
//             <Link to="#" className="font-inter text-2xl text-white hover:text-gray-300 text-sm 
//             font-medium uppercase hover:underline cursor-pointer ">Fertilizers</Link>
//             <Link to="#" className="font-inter text-2xl text-white hover:text-gray-300 text-sm 
//             font-medium uppercase hover:underline cursor-pointer ">Equipment</Link>
//             <Link to="#" className="font-inter text-2xl text-white hover:text-gray-300 text-sm 
//             font-medium uppercase hover:underline cursor-pointer ">seeds</Link>
//             <Link to="#" className="font-inter text-2xl text-white hover:text-gray-300 text-sm 
//             font-medium uppercase hover:underline cursor-pointer ">irrigation</Link>
//         </div>

//       </nav>
//     </div>
//   );
// };

// export default Thirdbar;





import { useState } from "react";
import { Link } from "react-router-dom";
import { RiArrowDownSLine, RiMenuLine, RiCloseLine } from "react-icons/ri";

const NavItem = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

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
        <span className="text-sm font-medium uppercase">{title}</span>
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
                <Link to={item.path} className="block px-6 md:px-4 py-2 hover:bg-gray-100 text-xs font-bold uppercase">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Thirdbar = () => {
  const [navOpen, setNavOpen] = useState(false); // Controls the Hamburger menu

  return (
    <div className="bg-[#0b6e4f] text-white">
      <nav className="container mx-auto flex items-center justify-between py-2 px-6">
        
        {/* 1. Hamburger Icon (Visible only on Mobile) */}
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
          <NavItem title="All Products" items={[{name: "Catalog", path: "/all"}]} />
          <NavItem title="Brands" items={[{name: "Bayer", path: "/bayer"}]} />
          <NavItem title="Fertilizers" items={[{name: "Urea", path: "/urea"}]} />
          <NavItem title="Equipment" items={[{name: "Tractors", path: "/tractors"}]} />
          <NavItem title="Seeds" items={[{name: "Corn", path: "/corn"}]} />
        </div>

        {/* 3. Optional Search or Cart Icon for Desktop */}
        <div className="hidden md:block text-xs italic">
          Free Delivery on orders over 5000 rs
        </div>
      </nav>
    </div>
  );
};

export default Thirdbar;