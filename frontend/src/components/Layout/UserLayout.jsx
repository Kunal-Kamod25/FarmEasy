// import Header from "../Common/Header";
// import Hero from "../Common/Hero";
// import Footer from "../Common/Footer";
// const UserLayout= () =>{
//     return (
//         <>
//         {/* Header */}
//         <Header />
//         {/* Hero */}
//         <Hero />
//         {/* Main content */}
//         {/* Footer */}
//         <Footer className="sticky top-0 z-[100] w-full shadow-lg"/>
//         </>
//     )
// }
// export default UserLayout;


// import Header from "../Common/Header";
// import Topbar from "./Topbar";
// import Navbar from "./Navbar";
// import Thirdbar from "./Thirdbar";
// import Hero from "../Common/Hero";
// import Footer from "../Common/Footer";

// const UserLayout = () => {
//     return (
//         <div className="min-h-screen flex flex-col">
//             {/* STICKY WRAPPER: Grouping all headers here fixes the mismatch */}
//             <header className="sticky top-0 z-[100] w-full shadow-lg">
//                 <Topbar />
//                 <Navbar />
//                 <Thirdbar />
//             </header>

//             {/* Content Area */}
//             <main className="flex-grow">
//                 <Hero />
            
//             {/* Your Product Listing and Categories will go here */}
//             </main>

//             {/* Footer should NOT be sticky at the top */}
//             <Footer />
//         </div>
//     )
// }

// export default UserLayout;


// import Topbar from "./Topbar";
// import Navbar from "./Navbar";
// import Thirdbar from "./Thirdbar";
// import Hero from "../Common/Hero";
// import Footer from "../Common/Footer";

// const UserLayout = () => {
//     return (
//         <div className="min-h-screen flex flex-col">
//             {/* The 'sticky' class must be on this wrapper. 
//                z-[100] ensures it stays above the Hero image.
//             */}
//             <header className="sticky top-0 z-[100] w-full bg-white shadow-md">
//                 <Topbar />
//                 <Navbar />
//                 <Thirdbar />
//             </header>

//             <main className="flex-grow">
//                 {/* Now the Hero will start exactly where the headers end */}
//                 <Hero />
//                 {/* Main product content goes here */}
//             </main>

//             <Footer />
//         </div>
//     );
// };

// export default UserLayout;

import React, { useState } from 'react'; // Added useState for page logic
import Topbar from "./Topbar";
import Navbar from "./Navbar";
import Thirdbar from "./Thirdbar";
import Hero from "../Common/Hero";
import Footer from "../Common/Footer";
import ProductCard from '../Products/ProductCard';
import { products } from '../Products/productData';

const UserLayout = () => {
    // 1. STATE: This tracks which of your 8 categories is currently active
    const [activeCategory, setActiveCategory] = useState("Main");

    // 2. FILTER LOGIC: Shows only products matching the selected category
    const filteredProducts = activeCategory === "Main" 
        ? products 
        : products.filter(p => p.category === activeCategory);

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-[100] w-full bg-white shadow-md">
                <Topbar />
                <Navbar />
                {/* 3. UPDATE: Pass setActiveCategory to Thirdbar so buttons can switch pages */}
                <Thirdbar setCategory={setActiveCategory} />
            </header>

            <main className="flex-grow bg-slate-50">
                {/* 4. UPDATE: Pass the active category to Hero for dynamic text/images */}
                <Hero category={activeCategory} />

                <div className="max-w-7xl mx-auto px-4 py-12">
                    {/* Header for Product Section */}
                    <div className="flex justify-between items-end mb-8 border-b pb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {activeCategory === "Main" ? "Best Selling" : activeCategory}
                            </h2>
                            <p className="text-gray-500">Best prices available today</p>
                        </div>
                        <button className="text-green-600 font-bold hover:underline">View All</button>
                    </div>

                    {/* 5. PRODUCT DISPLAY: The responsive grid layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UserLayout;