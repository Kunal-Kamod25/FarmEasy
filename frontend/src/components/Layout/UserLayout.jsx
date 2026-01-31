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
import { products } from '../Products/ProductData';
import { Outlet } from "react-router-dom";

const UserLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-[100] bg-white shadow-md">
                <Topbar />
                <Navbar />
                <Thirdbar />
            </header>

            <main className="flex-grow bg-slate-50">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default UserLayout;