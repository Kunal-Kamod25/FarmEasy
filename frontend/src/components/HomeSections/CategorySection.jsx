import React from "react";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./HomeProductCard";

const CATEGORY_ICONS = {
    fertilizers: "🧪",
    seeds: "🌱",
    irrigation: "💧",
    "cattle feeds": "🐄",
    pulses: "🌾",
    "pesticides & fungicides": "💊",
    "tools & machinery": "⚙️",
    "farm equipment": "🛠️",
    "organic products": "🌿",
};

const CATEGORY_COLORS = {
    fertilizers: "from-emerald-500 to-green-600",
    seeds: "from-amber-500 to-yellow-600",
    irrigation: "from-blue-500 to-cyan-600",
    "cattle feeds": "from-red-500 to-orange-600",
    pulses: "from-yellow-600 to-amber-700",
    "pesticides & fungicides": "from-rose-500 to-pink-600",
    "tools & machinery": "from-slate-600 to-gray-700",
    "farm equipment": "from-indigo-500 to-blue-600",
    "organic products": "from-lime-500 to-emerald-600",
};

const CategorySection = ({
    cat,
    products,
    navigate,
    addToCart,
    toggleWishlist,
    isWishlisted,
    idx
}) => {
    const catName = cat.product_cat_name;
    const catKey = catName.toLowerCase();
    const icon = CATEGORY_ICONS[catKey] || "📦";
    const gradient = CATEGORY_COLORS[catKey] || "from-emerald-500 to-green-600";

    // alternate subtle background tint so sections stand apart visually
    const sectionBg = idx % 2 === 0 ? "bg-white/60" : "bg-emerald-50/30";

    return (
        <section className={`${sectionBg} py-8`}>
            <div className="w-full max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`bg-gradient-to-br ${gradient} p-2.5 rounded-xl shadow-lg`}>
                            <span className="text-xl">{icon}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-800">
                                {catName}
                            </h2>
                            <p className="text-slate-500 text-xs mt-0.5">
                                {products.length} product{products.length !== 1 ? "s" : ""} available
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/products?category=${cat.id}`)}
                        className="flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
                    >
                        View All <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                    {products.length > 0 ? (
                        products.slice(0, 8).map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={addToCart}
                                onToggleWishlist={toggleWishlist}
                                isWishlisted={isWishlisted(product.id)}
                                onViewDetail={() => navigate(`/product/${product.id}`)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-slate-400 text-sm mb-2">📭 No products available yet</p>
                            <p className="text-slate-300 text-xs">Check back soon! Vendors will be adding products to this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
