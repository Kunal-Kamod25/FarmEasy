import { Link } from "react-router-dom";
import { RiArrowDownSLine } from "react-icons/ri";
 
const Thirdbar = () => {
  return (
    <div className="bg-[#0b6e4f] text-white">
      <nav className="container mx-auto flex items-center py-1 px-6 space-x-4"> 
        <div className="flex items-center gap-1 ">
              <span>All Products</span>
              <RiArrowDownSLine size={22} />
            </div>
        {/* Center - Navigation Links */}
        <div className="hidden md:flex space-x-4 flex-grow">
            <Link to="#" className="font-inter text-2xl text-white hover:text-gray-300 text-sm 
            font-medium uppercase hover:underline cursor-pointer ">Brands</Link>
            <Link to="#" className="font-inter text-2xl text-white hover:text-gray-300 text-sm 
            font-medium uppercase hover:underline cursor-pointer ">Fertilizers</Link>
            <Link to="#" className="font-inter text-2xl text-white hover:text-gray-300 text-sm 
            font-medium uppercase hover:underline cursor-pointer ">Equipment</Link>
            <Link to="#" className="font-inter text-2xl text-white hover:text-gray-300 text-sm 
            font-medium uppercase hover:underline cursor-pointer ">seeds</Link>
            <Link to="#" className="font-inter text-2xl text-white hover:text-gray-300 text-sm 
            font-medium uppercase hover:underline cursor-pointer ">irrigation</Link>
        </div>

      </nav>
    </div>
  );
};

export default Thirdbar;
