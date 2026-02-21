import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Hero from "../components/Common/Hero";
import HomeSections from "../components/Common/HomeSections/HomeSections";
import { products } from "../components/Products/ProductData";
import ProductCard from "../components/Products/ProductCard";
import BrandSection from "../components/Common/BrandSection";

const Home = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "main";

  const filteredProducts = useMemo(() => {
    return categoryParam === "main"
      ? products
      : products.filter((p) => p.category === categoryParam);
  }, [categoryParam]);

  const fertilizerProducts = useMemo(() => {
    return products.filter((p) => p.category === "fertilizers");
  }, []);

  const handleNavigate = (page) => {
    console.log("Navigate to:", page);
  };

  const handleViewDetails = (product) => {
    console.log("View product:", product);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. Hero Section (Only show on main home or optionally always) */}
      {categoryParam === "main" && <Hero />}

      <div className="max-w-7xl mx-auto py-12 px-4">

        {/* 2. Page Title / Breadcrumbs (Dynamic based on category) */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
            {categoryParam === "main" ? "Our Best Products" : `${categoryParam.replace("-", " ")}`}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Discover high-quality supplies for your farming needs.
          </p>
        </div>

        {/* 3. Brand Section (Optional: maybe only show on main home) */}
        {categoryParam === "main" && (
          <div className="mb-16">
            <BrandSection />
          </div>
        )}

        {/* 4. Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">No products found for this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Home Sections (Only on main page) */}
      {categoryParam === "main" && (
        <HomeSections
          fertilizerProducts={fertilizerProducts}
          products={products}
          onNavigate={handleNavigate}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};


export default Home;
