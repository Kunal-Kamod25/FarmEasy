// src/App.jsx (or src/Pages/Home.jsx)
import React, { useState } from 'react';
import Hero from './components/Common/Hero';
import { categories, products } from './components/Products/productData';

const Home = () => {
  const [selectedCat, setSelectedCat] = useState(categories[0]); // Default to 'Main'

  // Logic to filter products based on the button clicked
  const filteredProducts = selectedCat.id === 'main' 
    ? products 
    : products.filter(p => p.category === selectedCat.id);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Hero activeCategory={selectedCat} />

      {/* Category Navigation (The "8 Pages" Buttons) */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h2 className="text-center text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat)}
              className={`flex flex-col items-center group transition-all ${selectedCat.id === cat.id ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 mb-2 shadow-md ${selectedCat.id === cat.id ? 'border-green-500 bg-white' : 'border-gray-200 bg-white'}`}>
                <span className="text-xs font-bold text-gray-600">{cat.name.substring(0, 3)}</span>
              </div>
              <span className={`text-sm font-semibold ${selectedCat.id === cat.id ? 'text-green-600' : 'text-gray-600'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* Product Listing Grid */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-bold">Best prices available today</h3>
          </div>
          <button className="text-green-600 font-bold hover:underline">View All</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition">
              <div className="relative h-40 bg-gray-50 rounded-lg mb-4 overflow-hidden">
                <img src={item.img} alt={item.name} className="w-full h-full object-contain p-4" />
                <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 transition">
                  ❤️
                </button>
              </div>
              <h4 className="text-sm font-medium text-gray-800 h-10 line-clamp-2">{item.name}</h4>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold">₹ {item.price}</span>
                  <div className="flex items-center text-xs text-yellow-500">
                    ⭐ <span className="text-gray-400 ml-1">({item.rating})</span>
                  </div>
                </div>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition">
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;