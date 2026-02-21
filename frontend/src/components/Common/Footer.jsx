import { Link } from "react-router-dom";
import logo from "../../assets/Logo.png";
import { FiMail, FiPhoneCall } from "react-icons/fi";

const Footer = () => {
    const subject = "Order Inquiry";
    const body =
        "Hello FarmEasy,\r\n\r\n" +
        "I want to place an order.\r\n" +
        "Please contact me.\r\n\r\n" +
        "Thanks";

    const mailtoLink = `mailto:farmeasy003@gmail.com?subject=${encodeURIComponent(
        subject
    )}&body=${encodeURIComponent(body)}`;

    return (
        <div className="bg-gray-950">
            <footer className="border-t border-gray-800 py-10">

                {/* Logo */}
                <div className="container mx-auto px-4 lg:px-10 mb-0.1">
                    <Link to="/">
                        <img
                            src={logo}
                            alt="FarmEasy Logo"
                            className="h-16 w-16 object-contain"
                        />
                    </Link>
                </div>

                {/* Main Grid */}
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-4 lg:px-10">

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">
                            Newsletter
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                            Browse thousands of products from trusted vendors.
                            Quality equipment, seeds, fertilizers, and irrigation systems.
                        </p>
                        <p className="text-gray-400 text-sm mb-5">
                            Sign up and get free delivery on your first order.
                        </p>

                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Enter Your Email"
                                required
                                className="p-3 w-full text-sm bg-gray-900 text-white border border-gray-700 rounded-l-md 
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                            <button
                                type="submit"
                                className="bg-green-600 text-white font-semibold px-6 py-3 text-sm rounded-r-md 
                hover:bg-green-500 transition-all"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">
                            Shop
                        </h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    Fertilizers
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    Seeds
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    Equipment
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    Irrigation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Services */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">
                            Customer Services
                        </h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    Support
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    Features
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">
                            Contact Us
                        </h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li>
                                <Link
                                    to="#"
                                    className="hover:text-green-400 transition-colors"
                                >
                                    128, Farm Road, Pune, Maharashtra, 411007
                                </Link>
                            </li>

                            <li>
                                <a
                                    href="tel:+917767859953"
                                    className="inline-flex items-center hover:text-green-400 transition-colors"
                                >
                                    <FiPhoneCall className="mr-2" />
                                    +91 7767859953
                                </a>
                            </li>

                            <li>
                                <a
                                    href={mailtoLink}
                                    className="inline-flex items-center hover:text-green-400 transition-colors"
                                >
                                    <FiMail className="mr-2" />
                                    farmeasy003@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="container mx-auto mt-12 px-4 lg:px-10 border-t border-gray-800 pt-6 text-center">

                    {/* Policy Links */}
                    <div className="flex justify-center space-x-6 mb-4 text-gray-400 text-sm">
                        <a href="#" className="hover:text-green-400 transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-green-400 transition-colors">
                            Terms of Service
                        </a>
                        <a href="#" className="hover:text-green-400 transition-colors">
                            Shipping Policy
                        </a>
                    </div>

                    <p className="text-gray-500 text-sm">
                        © 2026 FarmEasy Agro Private Limited. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Footer;