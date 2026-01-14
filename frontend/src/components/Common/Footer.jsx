const Footer = () => {
    return <footer className="border-t py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-0">
            <div>
                <h3 className="px-4 stext-lg text-gray-800 mb-4">NewsLetter</h3>
                    <p className=" px-4 text-gray-500 mb-4 text-inter text-sm">
                        Browse thousands of products from trusted vendors. 
                        Quality equipment, seeds, fertilizers, and 
                        irrigation systems for modern farming.
                    </p>
                    <p className="text-inter px-4 text-black mb-4 text-inter text-sm">
                        Sign up and get free delivery of your first order.
                    </p>
                    {/* NewsLetter From */}
                    <form className="px-4 flex ">
                    <input 
                    type="email" 
                    placeholder="Enter Your Email"
                    className="p-3 w-full text-sm border-t border-l border-b border-gray-300 rounded-l-md
                    focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all" required/>
                    <button type="submit" className="bg-black text-white px-6 py-3 text-sm rounded-r-md hover:bg-gray-800 transition-all">Subscribe</button>
                    </form>
            </div>

        </div>
        </footer>
};
export default Footer;