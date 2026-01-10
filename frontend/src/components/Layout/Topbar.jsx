import { IoLogoInstagram } from "react-icons/io5";

const Topbar = () => {
    const subject = "Order Inquiry";
  const body = `
Hello FarmEasy,

I want to place an order.
Please contact me.

Thanks
  `;

  const mailtoLink = `mailto:farmeasy003@gmail.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
    return (
        <div className="sticky top-0 bg-[#0C970C] text-white">
            <div className="container mx-auto flex justify-between items-center py-1 px-4 md:px-0 text-sm">
                <div className="hidden md:flex items-center space-x-4">
                    <a href="https://www.instagram.com/__farmeasy003__/" className="hover:text-gray-300 py-0.5 px-18">
                        <IoLogoInstagram className="h-5 w-5" />
                    </a>
                </div>
                <div className="text-medium text-center flex-grow">
                    <span>FarmEasy-Agricultural Marketplace</span>
                </div>
                <div className="text-sm hidden md:block">
                <a href={mailtoLink} className="hover:text-gray-300 py-4 px-5">
                    Email: farmeasy003@gmail.com
                </a>
                </div>
                <div className="text-sm hidden md:block">
                    <a href="tel:+917767859953" className="hover:text-gray-300 py-4 px-5">
                       Call To Order: +91 7767859953 
                    </a>
                </div>
                {/* <div className="text-sm hidden md:block space-x-4">
                    <a href="mailto:farmeasy25@gmail.com" className="hover:text-gray-300">
                        farmeasy25@gmail.com
                    </a>
                </div> */}
            </div>
        </div>

    );
};
export default Topbar;