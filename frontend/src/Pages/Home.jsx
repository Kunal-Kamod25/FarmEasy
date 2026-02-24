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

      {/* Hero - FULL WIDTH */}
      {categoryParam === "main" && <Hero />}

      {/* Main Content Container */}
      <div className="w-full max-w-12xl mx-auto px-10 py-10">

        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800 uppercase tracking-tight">
            {categoryParam === "main"
              ? "Our Best Products"
              : categoryParam.replace("-", " ")}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Discover high-quality supplies for your farming needs.
          </p>
        </div>

      </div>

      {/* Brand Section - DO NOT WRAP AGAIN */}
      {categoryParam === "main" && <BrandSection />}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">
                No products found for this category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Home Sections */}
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