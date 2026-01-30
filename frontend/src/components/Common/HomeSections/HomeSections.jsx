import { Star } from "lucide-react";

export default function HomeSections({
    fertilizerProducts = [],
    products = [],
    onNavigate = () => { },
    onViewDetails = () => { }
}) {
    return (
        <main className="bg-background-light bg-[#FFFFF0]">

            {/* Best Sellers in Fertilizers */}
            <div className="px-4 mt-8">
                <div className="bg-white bg-[#FDFBD4] p-5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Best Sellers in Fertilizers
                        </h2>
                        <button
                            onClick={() => onNavigate("fertilizers")}
                            className="text-sm font-medium text-green-700 hover:underline"
                        >
                            See more
                        </button>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {fertilizerProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => onViewDetails(product)}
                                className="min-w-[160px] max-w-[160px] md:min-w-[200px] md:max-w-[200px] snap-start cursor-pointer"
                            >
                                <div className="bg-gray-100 bg-[#FDFBD4] rounded-lg aspect-square p-2 flex items-center justify-center">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="object-contain h-full w-full"
                                    />
                                </div>

                                <div className="px-1">
                                    <p className="text-sm line-clamp-2 mt-1 text-slate-900 dark:text-white">
                                        {product.name}
                                    </p>

                                    <div className="flex items-center gap-1 my-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 text-yellow-500 ${i < Math.floor(product.rating)
                                                    ? "fill-yellow-500"
                                                    : ""
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-xs text-blue-600">
                                            {product.reviews}
                                        </span>
                                    </div>

                                    <p className="font-bold text-lg">
                                        ₹{product.price.toLocaleString()}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Get it by <span className="font-bold">Tuesday</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Smart Farming + Recommended */}
            <div className="px-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Smart Farming */}
                    <div className="relative h-[300px] rounded-md overflow-hidden group">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{
                                backgroundImage:
                                    "url('https://images.unsplash.com/photo-1708794666324-85ad91989d20')"
                            }}
                        />
                        <div className="absolute inset-0 bg-black/60" />

                        <div className="relative z-10 p-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">
                                Smart Farming Solutions
                            </h3>
                            <p className="text-gray-200 mb-4">
                                Monitor soil moisture, temperature, and crop health with IoT
                                sensors.
                            </p>
                            <button
                                onClick={() => onNavigate("products")}
                                className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded"
                            >
                                Discover Tech
                            </button>
                        </div>
                    </div>

                    {/* Recommended Products */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-md border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4">
                            Recommended for your farm
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {products.slice(0, 4).map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => onViewDetails(product)}
                                    className="cursor-pointer"
                                >
                                    <div className="bg-gray-100 dark:bg-gray-800 h-24 sm:h-32 flex items-center justify-center rounded-md p-2">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="object-contain max-h-full"
                                        />
                                    </div>
                                    <p className="text-xs mt-2 line-clamp-2">
                                        {product.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Free Shipping Banner */}
            <div className="mt-10 bg-gradient-to-r from-green-600 to-green-700 text-white py-6 text-center">
                <h3 className="text-xl sm:text-2xl">
                    🚚 Free Shipping on Orders Over ₹80,000
                </h3>
                <p className="text-green-100 mt-1">
                    Get your products delivered to your doorstep at no extra cost!
                </p>
            </div>

        </main>
    );
}
