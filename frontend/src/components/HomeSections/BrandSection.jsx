import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// BRAND DATA — real Indian agricultural brands that farmers trust
// Each brand gets a unique gradient so the section looks colorful
// Clicking a brand navigates to /products filtered by that brand name
// ═══════════════════════════════════════════════════════════
const BRANDS = [
  { id: 1, name: "Bayer", short: "BA", gradient: "from-blue-500 to-blue-700", ring: "ring-blue-200" },
  { id: 2, name: "Syngenta", short: "SY", gradient: "from-green-600 to-emerald-700", ring: "ring-green-200" },
  { id: 3, name: "UPL", short: "UPL", gradient: "from-red-500 to-rose-700", ring: "ring-red-200" },
  { id: 4, name: "Tata Rallis", short: "TR", gradient: "from-indigo-500 to-violet-700", ring: "ring-indigo-200" },
  { id: 5, name: "Dhanuka", short: "DH", gradient: "from-yellow-500 to-amber-600", ring: "ring-yellow-200" },
  { id: 6, name: "IFFCO", short: "IF", gradient: "from-teal-500 to-cyan-700", ring: "ring-teal-200" },
  { id: 7, name: "Godrej Agrovet", short: "GA", gradient: "from-purple-500 to-purple-700", ring: "ring-purple-200" },
  { id: 8, name: "PI Industries", short: "PI", gradient: "from-orange-500 to-red-600", ring: "ring-orange-200" },
  { id: 9, name: "Jain Irrigation", short: "JI", gradient: "from-sky-500 to-blue-600", ring: "ring-sky-200" },
  { id: 10, name: "Coromandel", short: "CO", gradient: "from-lime-500 to-green-600", ring: "ring-lime-200" },
  { id: 11, name: "Chambal Fert.", short: "CF", gradient: "from-fuchsia-500 to-pink-600", ring: "ring-fuchsia-200" },
  { id: 12, name: "Kaveri Seeds", short: "KS", gradient: "from-emerald-500 to-teal-600", ring: "ring-emerald-200" },
  { id: 13, name: "Mahyco", short: "MA", gradient: "from-amber-500 to-yellow-700", ring: "ring-amber-200" },
  { id: 14, name: "Netafim", short: "NE", gradient: "from-cyan-500 to-sky-700", ring: "ring-cyan-200" },
  { id: 15, name: "Finolex", short: "FI", gradient: "from-rose-500 to-pink-700", ring: "ring-rose-200" },
  { id: 16, name: "Honda Power", short: "HP", gradient: "from-red-600 to-red-800", ring: "ring-red-300" },
  { id: 17, name: "Stihl", short: "ST", gradient: "from-orange-600 to-amber-700", ring: "ring-orange-200" },
  { id: 18, name: "VST Tillers", short: "VS", gradient: "from-slate-500 to-gray-700", ring: "ring-slate-200" },
];

const BrandSection = () => {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // auto-scroll the brand strip — pauses when user hovers
  useEffect(() => {
    const container = scrollRef.current;
    let animationFrame;

    const autoScroll = () => {
      if (!container) return;
      if (!isHovered) {
        container.scrollLeft += 0.6;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationFrame = requestAnimationFrame(autoScroll);
    };

    animationFrame = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [isHovered]);

  const handleBrandClick = (brandName) => {
    navigate(`/products?search=${encodeURIComponent(brandName)}`);
  };

  // double the array for seamless infinite scroll
  const allBrands = [...BRANDS, ...BRANDS];

  return (
    <section className="py-10 bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <div className="w-full max-w-8xl mx-auto px-9">

        {/* Section header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-xl shadow-lg shadow-amber-200">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                Trusted Brands
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Shop from India's top agricultural brands
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            View All →
          </button>
        </div>

        {/* infinite auto-scroll strip */}
        <div
          className="overflow-hidden rounded-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-hidden py-2 px-1"
          >
            {allBrands.map((brand, index) => (
              <div
                key={index}
                onClick={() => handleBrandClick(brand.name)}
                className={`min-w-[130px] group cursor-pointer flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 shrink-0 ring-2 ring-transparent hover:${brand.ring}`}
              >
                {/* colorful initials circle */}
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${brand.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                >
                  <span className="text-white font-extrabold text-sm tracking-wide">
                    {brand.short}
                  </span>
                </div>
                {/* brand name */}
                <span className="text-[11px] font-bold text-slate-700 text-center leading-tight group-hover:text-emerald-700 transition-colors">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;