import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { FiPhoneCall} from "react-icons/fi";

const Footer = () => {
    return <footer className="border-t py-5">
        <div className="px-4">
            <div className="bg-black w-30 h-18 border border-gray-300 rounded flex items-center justify-center">
                <Link to="/">
                <img
                    src={logo}
                    alt="logo"
                    className="pl-1 h-25 w-50 object-contain"
                />
                </Link>
            </div>
        </div>
        
        
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-0">
            <div>
                <h3 className="px-5 stext-lg text-bold text-gray-800 mb-4">NewsLetter</h3>
                    <p className=" px-5 text-gray-500 mb-4 text-inter text-sm">
                        Browse thousands of products from trusted vendors. 
                        Quality equipment, seeds, fertilizers, and 
                        irrigation systems for modern farming.
                    </p>
                    <p className="text-inter px-5 text-black mb-4 text-inter text-sm">
                        Sign up and get free delivery of your first order.
                    </p>
                    {/* NewsLetter From */}
                    <form className="px-5 flex ">
                    <input 
                    type="email" 
                    placeholder="Enter Your Email"
                    className="p-3 w-full text-sm border-t border-l border-b border-gray-300 rounded-l-md
                    focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all" required/>
                    <button type="submit" className="bg-black text-white px-6 py-3 text-sm rounded-r-md hover:bg-gray-800 transition-all">Subscribe</button>
                    </form>
            </div>

            {/* Shop links */}
            <div>
                <h3 className="text-lg text-black mb-4">Shop</h3>
                <ul className="space-y-2 text-gray-800">
                    <li>
                        <Link to="#" className="hover:text-gray-600 hover:underline cursor-pointer transition-colors">Fertilizers</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-600 hover:underline cursor-pointer transition-colors">Seeds</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-600 hover:underline cursor-pointer transition-colors">Equipments</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-600 hover:underline cursor-pointer transition-colors">Irrigation</Link>
                    </li>

                </ul>
            </div>

            {/* Customer Services */}
            <div>
                <h3 className="text-lg text-black mb-4">Customer Services</h3>
                <ul className="space-y-2 text-gray-800">
                    <li>
                        <Link to="#" className="hover:text-gray-600 hover:underline cursor-pointer transition-colors">Support</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-600 hover:underline cursor-pointer transition-colors">Contact Us</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-600 hover:underline cursor-pointer transition-colors">About Us</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-600 hover:underline cursor-pointer transition-colors">Features</Link>
                    </li>

                </ul>
            </div>

             {/* Contact us */}
            <div>
                <h3 className="text-lg text-black mb-4">Contact Us</h3>
                <ul className="space-y-6 text-gray-800">
                    <li>
                        <Link to="#" className="hover:text-gray-600 hover:underline cursor-pointer transition-colors">128, Farm Road, pune,maharashtra, 411007</Link>
                    </li>
                    
                    <div>
                        <p className="test-gray-500">Call Us</p>
                        <p>
                            <FiPhoneCall className="inline-block mr-2"/>
                            +91 7767859953
                        </p>
                    </div>
                    <li>
                        <Link to="#" className="hover:text-gray-600 hover:underline cursor-pointer transition-colors">farmeasy003@gmail.com</Link>
                    </li>
                </ul>
            </div>
            
        </div>
        {/* footer bottom */}
        <div className="container mx-auto mt-12 px-4 lg:px-0 border-t border-gray-200 pt-6">
            <p className="text-gray-500 text-sm tracking-tighter text-center ">
                Copyright © 2026 FarmEasy Agro Private Limited
            </p>
        </div>
    </footer>
};
export default Footer;