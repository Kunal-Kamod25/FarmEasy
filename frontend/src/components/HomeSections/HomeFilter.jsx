import React, { useState, useEffect } from "react";
import { 
    Filter, X, ChevronRight, Sprout, 
    Zap, IndianRupee, RotateCcw, Search,
    Check, ArrowUpDown
} from "lucide-react";

const HomeFilter = ({ categories, onFilterChange, activeFilters, clearFilters }) => {
    const [priceRange, setPriceRange] = useState(activeFilters.price || 10000);
    const [selectedCategory, setSelectedCategory] = useState(activeFilters.category || "all");
    const [selectedSort, setSelectedSort] = useState(activeFilters.sort || "newest");

    useEffect(() => {
        setPriceRange(activeFilters.price || 10000);
        setSelectedCategory(activeFilters.category || "all");
        setSelectedSort(activeFilters.sort || "newest");
    }, [activeFilters]);

    const handleCategoryClick = (catId) => {
        setSelectedCategory(catId);
        onFilterChange({ category: catId });
    };

    const handleSortClick = (sortType) => {
        setSelectedSort(sortType);
        onFilterChange({ sort: sortType });
    };

    const handlePriceChange = (e) => {
        const val = parseInt(e.target.value);
        setPriceRange(val);
        onFilterChange({ price: val });
    };

    return (
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-2xl shadow-emerald-500/10 p-8 space-y-8 sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                        <Filter size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 uppercase tracking-[0.2em] text-[10px]">
                            Smart Filter
                        </h3>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                            Refine your search
                        </p>
                    </div>
                </div>
                {(selectedCategory !== "all" || priceRange < 10000) && (
                    <button 
                        onClick={clearFilters}
                        className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all active:scale-90"
                    >
                        <RotateCcw size={14} />
                    </button>
                )}
            </div>

            {/* Sort Options */}
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Sort Order
                </label>
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: "newest", label: "Newest" },
                        { id: "price_asc", label: "Price: Low to High" },
                        { id: "price_desc", label: "Price: High to Low" }
                    ].map(option => (
                        <button
                            key={option.id}
                            onClick={() => handleSortClick(option.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                selectedSort === option.id 
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    What are you looking for?
                </label>
                <div className="space-y-2">
                    <button
                        onClick={() => handleCategoryClick("all")}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                            selectedCategory === "all" 
                            ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20" 
                            : "bg-white border-slate-100 text-slate-600 hover:border-emerald-500/50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Zap size={16} className={selectedCategory === "all" ? "text-emerald-400" : "text-slate-400"} />
                            <span className="text-xs font-bold uppercase tracking-wide">All Products</span>
                        </div>
                        {selectedCategory === "all" && <Check size={14} />}
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                                selectedCategory === cat.id 
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20" 
                                : "bg-white border-slate-100 text-slate-600 hover:border-emerald-500/50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Sprout size={16} className={selectedCategory === cat.id ? "text-white" : "text-emerald-500"} />
                                <span className="text-xs font-bold uppercase tracking-wide truncate max-w-[120px]">
                                    {cat.name || cat.product_cat_name}
                                </span>
                            </div>
                            {selectedCategory === cat.id && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Max Budget
                    </label>
                    <span className="text-xs font-black text-slate-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        ₹{priceRange.toLocaleString()}
                    </span>
                </div>
                <div className="relative pt-2">
                    <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={priceRange}
                        onChange={handlePriceChange}
                        className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Min</span>
                        <span>₹10,000+</span>
                    </div>
                </div>
            </div>

            {/* Premium Badge */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2 relative z-10">Premium Filter</h4>
                <p className="text-slate-400 text-[10px] font-medium leading-relaxed relative z-10 mb-4">
                    Our AI-driven filtering ensures you find the highest yield inputs for your specific region.
                </p>
                <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] uppercase tracking-[0.2em] relative z-10">
                    Learn More <ChevronRight size={10} />
                </div>
            </div>
        </div>
    );
};

export default HomeFilter;
