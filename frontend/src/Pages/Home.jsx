import React, { useState } from "react";
import Hero from "../components/Common/Hero";
import { categories, products } from "../components/Products/productData";

const Home = () => {
  const [selectedCat, setSelectedCat] = useState(categories[0]);

  const filteredProducts =
    selectedCat.id === "main"
      ? products
      : products.filter(p => p.category === selectedCat.id);

  return (
    <div className="bg-slate-50">
      {/* DEFAULT HERO */}
      <Hero />

      {/* CATEGORY BUTTONS */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat)}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map(item => (
            <div key={item.id} className="bg-white p-4 rounded shadow">
              <img src={item.img} className="h-40 w-full object-contain" />
              <h3 className="mt-2 font-bold">{item.name}</h3>
              <p>₹ {item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
