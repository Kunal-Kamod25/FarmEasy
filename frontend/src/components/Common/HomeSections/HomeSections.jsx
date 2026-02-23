import { Star } from "lucide-react";
import { ShoppingCart } from "lucide-react";

export default function HomeSections({
    fertilizerProducts = [],
    products = [],
    onNavigate = () => { },
    onViewDetails = () => { }
}) {
    return (
        <main className="bg-[#FFFFF] min-h-screen pb-16">
            {/* ================= BEST SELLERS IN FERTILIZERS ================= */}
            <section className="px-4 mt-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Best Sellers in Fertilizers
                    </h2>

                    <button
                        onClick={() => onNavigate("fertilizers")}
                        className="text-green-700 font-semibold hover:underline"
                    >
                        View All →
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {fertilizerProducts.slice(0, 4).map((product) => (
                        <div
                            key={product.id}
                            className="group bg-white rounded-3xl shadow-sm 
                            hover:shadow-2xl hover:shadow-emerald-200 
                            transition-all duration-200 border border-slate-100 
                            overflow-hidden w-full flex flex-col h-full
                            hover:-translate-y-2"
                        >
                            {/* Image */}
                            <div className="relative bg-gray-50 h-56 flex items-center justify-center">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-contain h-full w-full p-6"
                                />

                                {/* Stock Badge */}
                                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                    IN STOCK
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-6">

                                {/* Brand */}
                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                                    {product.brand || "FERTILIZER"}
                                </p>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-slate-800 mb-2">
                                    {product.name}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {product.description || "High quality fertilizer for better crop yield."}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-yellow-500 font-semibold">
                                        ★ {product.rating}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({product.reviews} reviews)
                                    </span>
                                </div>

                                {/* Bottom Row */}
                                <div className="flex items-center justify-between">
                                    <p className="text-xl font-bold text-slate-900">
                                        ₹{product.price.toLocaleString()}
                                    </p>

                                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest py-3.5 px-6 rounded-2xl transition-all shadow-xl shadow-emerald-100 hover:shadow-emerald-200 active:scale-95 group/btn">
                                        <ShoppingCart size={16} className="group-hover:rotate-12 transition-transform" />
                                        <span>Add</span>
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= SMART FARMING HERO ================= */}
            <section className="px-4 mt-14">
                <div className="relative rounded-3xl overflow-hidden shadow-xl">

                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1708794666324-85ad91989d20')"
                        }}
                    />

                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

                    <div className="relative z-10 p-12 max-w-2xl">
                        <h3 className="text-4xl font-bold text-slate-800 mb-4">
                            Smart Farming Technology
                        </h3>

                        <p className="text-slate-700 mb-6 text-lg">
                            Monitor soil moisture, crop health and automate irrigation
                            systems using advanced IoT based solutions.
                        </p>

                        <button
                            onClick={() => onNavigate("products")}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition"
                        >
                            Explore Smart Tech
                        </button>
                    </div>
                </div>
            </section>

            {/* ================= RECOMMENDED PRODUCTS ================= */}
            <section className="px-4 mt-14">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">
                        🌾 Recommended For You
                    </h3>

                    <button
                        onClick={() => onNavigate("products")}
                        className="text-green-700 font-semibold hover:underline"
                    >
                        View All →
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.slice(0, 8).map((product) => (
                        <div
                            key={product.id}
                            onClick={() => onViewDetails(product)}
                            className="bg-white rounded-2xl p-5 border border-green-100 hover:shadow-xl transition cursor-pointer group"
                        >
                            <div className="h-32 flex items-center justify-center mb-4">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-contain max-h-full transition group-hover:scale-110"
                                />
                            </div>

                            <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-2 group-hover:text-green-700">
                                {product.name}
                            </p>

                            <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 text-yellow-500 ${i < Math.floor(product.rating)
                                            ? "fill-yellow-500"
                                            : ""
                                            }`}
                                    />
                                ))}
                                <span className="text-xs text-gray-600">
                                    ({product.reviews})
                                </span>
                            </div>

                            <p className="font-bold text-lg text-slate-900 mb-3">
                                ₹{product.price.toLocaleString()}
                            </p>

                            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition">
                                View Product
                            </button>
                        </div>
                    ))}
                </div>
            </section>

        </main>
    );
}