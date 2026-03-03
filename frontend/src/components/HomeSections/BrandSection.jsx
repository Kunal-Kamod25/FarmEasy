import React, { useEffect, useRef, useState } from 'react';
import { brands } from '../Products/ProductData';

const BrandSection = () => {
    const scrollRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const container = scrollRef.current;
        let animationFrame;

        const autoScroll = () => {
            if (!container) return;

            if (!isHovered) {
                container.scrollLeft += 0.5;

                // Infinite seamless reset
                if (container.scrollLeft >= container.scrollWidth / 2) {
                    container.scrollLeft = 0;
                }
            }

            animationFrame = requestAnimationFrame(autoScroll);
        };

        animationFrame = requestAnimationFrame(autoScroll);

        return () => cancelAnimationFrame(animationFrame);
    }, [isHovered]);

    return (
        <div className="bg-[#e9f5e9] py-5 mb-8 overflow-hidden">
            <div className="w-full mx-auto px-12">
                
                {/* Header (UNCHANGED) */}
                <div className="flex justify-between items-center mb-6 relative">
                    <h2 className="text-2xl font-normal text-gray-800 absolute left-1/2 transform -translate-x-1/2">
                        Brands
                    </h2>

                    <a
                        href="#"
                        className="text-sm font-medium text-gray-900 underline ml-auto hover:text-green-700"
                    >
                        View All
                    </a>
                </div>

                {/* Auto Infinite Scroll */}
                <div
                    className="overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-hidden"
                    >
                        {[...brands, ...brands].map((brand, index) => (
                            <div
                                key={index}
                                className="min-w-[140px] h-[80px] bg-white rounded-lg shadow-sm hover:shadow transition-shadow cursor-pointer flex items-center justify-center p-4 border border-transparent hover:border-green-200 shrink-0"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerText = brand.name;
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BrandSection;