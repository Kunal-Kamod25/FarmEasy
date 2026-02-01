import React, { useState } from "react";
import Hero from "../components/Common/Hero";
import HomeSections from "../components/Common/HomeSections/HomeSections";
import { categories, products } from "../components/Products/ProductData";
import ProductCard from "../components/Products/ProductCard";
import BrandSection from "../components/Common/BrandSection";

const Home = () => {
  const [selectedCat, setSelectedCat] = useState(categories[0]);

  const filteredProducts =
    selectedCat.id === "main"
      ? products
      : products.filter((p) => p.category === selectedCat.id);

  const fertilizerProducts = products.filter(
    (p) => p.category === "fertilizers"
  );

  const handleNavigate = (page) => {
    console.log("Navigate to:", page);
  };

  const handleViewDetails = (product) => {
    console.log("View product:", product);
  };

  return (
    <div className="bg-slate-50">
      {/* HERO */}
      <Hero />

      {/* CATEGORY BUTTONS */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded text-white ${selectedCat.id === cat.id
                ? "bg-green-600"
                : "bg-green-500"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* BRAND SECTION */}
        <BrandSection />

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {filteredProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>

      <HomeSections
        fertilizerProducts={fertilizerProducts}
        products={products}
        onNavigate={handleNavigate}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default Home;
