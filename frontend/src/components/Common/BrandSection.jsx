import React, { useRef } from 'react';
import { brands } from '../Products/ProductData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BrandSection = () => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 600;
            const newScrollLeft = direction === 'left'
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount;

            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-[#e9f5e9] py-8 mb-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center mb-6 relative">
                    {/* Centered Title */}
                    <h2 className="text-2xl font-normal text-gray-800 absolute left-1/2 transform -translate-x-1/2">
                        Brands
                    </h2>

                    {/* Right-aligned 'View All' */}
                    <a href="#" className="text-sm font-medium text-gray-900 underline ml-auto hover:text-green-700">
                        View All
                    </a>
                </div>

                <div className="relative group">
                    {/* Left Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-green-600 hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Scrollable Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth"
                    >
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                className="min-w-[140px] h-[80px] bg-white rounded-lg shadow-sm hover:shadow transition-shadow cursor-pointer flex items-center justify-center p-4 snap-start border border-transparent hover:border-green-200 shrink-0"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                        // Fallback if logo fails
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerText = brand.name;
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Right Button */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-green-600 hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BrandSection;
