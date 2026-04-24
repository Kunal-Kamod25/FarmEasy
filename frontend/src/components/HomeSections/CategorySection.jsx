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
    const catName = cat.name || cat.product_cat_name || "Category";
    const catKey = catName.toLowerCase();
    const icon = CATEGORY_ICONS[catKey] || "📦";
    const gradient = CATEGORY_COLORS[catKey] || "from-emerald-500 to-green-600";

    return (
        <section className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className={`h-1 w-8 bg-gradient-to-r ${gradient} rounded-full`} />
                        <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
                            {products.length} Products Available
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`bg-gradient-to-br ${gradient} w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10`}>
                            <span className="text-2xl">{icon}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                            {catName}
                        </h2>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/products?category_id=${cat.id}`)}
                    className="group flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-800 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm hover:shadow-xl active:scale-95"
                >
                    View Collection <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {products.length > 0 ? (
                    products.slice(0, 5).map((product) => (
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
                    <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-md rounded-[3rem] border border-dashed border-white shadow-inner">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-slate-500 font-black text-sm uppercase tracking-widest mb-2">No Harvest Found</p>
                        <p className="text-slate-400 text-xs font-medium">Check back soon! Vendors will be adding products to this category.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CategorySection;
