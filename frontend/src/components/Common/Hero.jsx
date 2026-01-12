import React from "react";
import Navbar from "../Layout/Navbar";


const Hero = () =>{
    return <section>
        <div className="container">
        {/* Brand info */}
        <div>
            <div>
                <h1 className="text-center font-tinos text-2xl text-black text-large font-medium ">Welcome to FarmEasy</h1>
                <br/>
                <h1 className="px-20 font-tinos text-2xl text-black text-sm font-medium">Your one-stop Agricultural Marketplace </h1>
                <br/>
                <h1 className="px-20 font-tinos text-2xl text-black text-sm font-medium">Browse thousands of products from trusted vendors. Quality equipment, seeds, fertilizers, and irrigation systems for modern farming.</h1>
            </div>
        </div>
        {/* Hero images */}
        </div>
    </section>;
    
};

export default Hero;