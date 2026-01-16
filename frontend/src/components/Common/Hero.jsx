import React from 'react';

const Hero = ({ title, subtitle, bgImage }) => {
  return (
    <div className="relative w-full h-[450px] flex items-center px-10 overflow-hidden scrollbar-hide">
      {/* Dynamic Background */}
      <img 
        src={bgImage || "https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=1600"} 
        className="absolute inset-0 w-full h-full object-cover brightness-75"
        alt="Farm Banner"
      />
      
      <div className="relative z-10 text-white max-w-2xl">
        <h1 className="text-6xl font-extrabold mb-4 drop-shadow-lg">
          {title || "Welcome to FarmEasy"}
        </h1>
        <p className="text-2xl mb-8 drop-shadow-md opacity-95">
          {subtitle || "Your one-stop Agricultural Marketplace"}
        </p>
        <p className="text-2xl mb-8 drop-shadow-md opacity-95">
          {subtitle || "Browse thousands of products from trusted vendors. Quality equipment, seeds, fertilizers, and irrigation systems for modern farming."}
        </p>
        <button className="bg-[#00c853] hover:bg-green-600 text-white px-10 py-4 rounded-md font-bold text-lg transition-all shadow-lg">
          Browse Products
        </button>
      </div>
    </div>
  );
};

export default Hero;    