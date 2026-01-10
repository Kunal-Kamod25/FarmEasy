import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { HiOutlineUser , HiBars3BottomRight, HiOutlineShoppingCart } from "react-icons/hi2";
import Searchbar from "./Searchbar";
import LanguageSwitcher from "./LanguageSwitcher";
import AiSpeechOrder from "./AiSpeechOrder";
import CartDrawer from "../Layout/CartDrawer";

const Navbar = () => { 
const [drawerOpen, setDrawerOpen] = useState(true);

    const toggleCartDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const [ isMobileMenuOpen, setIsMobileMenuOpen ] = useState(false);
    return (
        <div className="bg-[#181818] text-white">
        <nav className="container mx-auto flex items-center justify-between py-1 px-6">
    
        {/* Left - Logo */}
        <div className="pl-1 flex items-center px-8 h-15 ">
            <Link to={"/"}><img src={logo} alt='logo' className="h-16  md:h-25 w-auto object-contain" /></Link>
        </div>
        {/* Center - Navigation Links */}
        <div className="hidden md:flex space-x-4 flex-grow">
            <Link to="#" className="font-inter text-2xl text-white hover:text-green-500 text-sm font-medium uppercase ">Brands</Link>
            <Link to="#" className="font-inter text-2xl text-white hover:text-green-500 text-sm font-medium uppercase ">Fertilizers</Link>
            <Link to="#" className="font-inter text-2xl text-white hover:text-green-500 text-sm font-medium uppercase ">Equipment</Link>
            <Link to="#" className="font-inter text-2xl text-white hover:text-green-500 text-sm font-medium uppercase ">seeds</Link>
            <Link to="#" className="font-inter text-2xltext-white hover:text-green-500 text-sm font-medium uppercase ">irrigation</Link>
        </div>

        {/* Right - section */}
        
        {/* Ai-Speech Order */}
        <AiSpeechOrder className="hidden md:block mr-6" />
        
        {/* 🌐 Language Switcher (ADDED) */}
          <LanguageSwitcher className="hidden md:block mr-6" />

          {/* signup / Login */}
          
          <div className="md:flex space-x-4 font-inter text-2xl text-white hover:text-green-500 text-sm font-medium uppercase text-right-2 px-2 py-0.5">
            <Link to="/Register" className="font-inter text-2xl text-white hover:text-green-500 text-sm font-medium uppercase hover:underline cursor-pointer">Signup</Link></div>

          <div className="md:flex space-x-4 font-inter text-2xl text-white hover:text-green-500 text-sm font-medium uppercase text-right-2 px-2 py-0.5">
            <Link to="/login" className="font-inter text-2xl text-white hover:text-green-500 text-sm font-medium uppercase hover:underline cursor-pointer">Login</Link></div>
        
        <div className="flex items-center space-x-4 py-0.5">
             <Link to="/profile" className="text-black hover:text-gray-300 ">
             <HiOutlineUser className="h-6 w-6 text-white inline-block mr-1 hover:text-green-500 " />
             </Link>
             
             <button onClick={toggleCartDrawer} className="relative hover:text-black">
                <HiOutlineShoppingCart className="h-6 w-6 text-white hover:text-green-500" />
                <span className="absolute -top-4     text-white text-xs rounded-full bg-[#0C970C] hover:text-green-500 px-2 py-0.5">
                    3
                </span>
             </button>
             
             {/* Search Bar */}
             <div className="overflow-hidden">
                <Searchbar/>
             </div>
             
             {/* Hamburger (Mobile only) */}
            <button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <HiBars3BottomRight className="h-6 w-6 hover:text-green-500" />
            </button>
        </div>
        </nav>
        
        {/* Cart Drawer */}
        <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

        {/* Android view */}
        {isMobileMenuOpen && (
        <div className="md:hidden bg-[#181818] text-white px-6 py-4 space-y-4 border-t border-green-700 ">

          {/* Mobile Links */}
          <Link className="block uppercase hover:text-green-500 hover:underline cursor-pointer">
            Brands
          </Link>
          <Link className="block uppercase hover:text-green-500 hover:underline cursor-pointer">
            Fertilizers
          </Link>
          <Link className="block uppercase hover:text-green-500 hover:underline cursor-pointer">
            Equipment
          </Link>
          <Link className="block uppercase hover:text-green-500 hover:underline cursor-pointer">
            Seeds
          </Link>
          <Link className="block uppercase hover:text-green-500 hover:underline cursor-pointer">
            Irrigation
          </Link>

          {/* Divider */}
          <div className="border-t border-green-700"></div>

          {/* Mobile AI & Language */}
          <AiSpeechOrder className="w-full" />
          <LanguageSwitcher className="w-full" />

        </div>
      )}
        </div>
    );
}
export default Navbar;