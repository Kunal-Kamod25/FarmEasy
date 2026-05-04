import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// BRAND DATA — real Indian agricultural brands that farmers trust
// Each brand gets a unique gradient so the section looks colorful
// Clicking a brand navigates to /products filtered by that brand name
// ═══════════════════════════════════════════════════════════
import axios from "axios";
import { API_URL } from "../../config";

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Fetch brands from database
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandsRes = await axios.get(`${API_URL}/api/brands`);
        const brandsData = brandsRes.data?.data || brandsRes.data || [];
        
        // Map to include a fallback short name if not present
        const processedBrands = brandsData.map(b => ({
          ...b,
          short: b.name.slice(0, 2).toUpperCase(),
          gradient: "from-emerald-500 to-green-700", // Generic gradient
          ring: "ring-emerald-200"
        }));

        setBrands(processedBrands);
      } catch (error) {
        console.error("❌ Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

  // auto-scroll the brand strip — pauses when user hovers
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || brands.length === 0) return;
    
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
  }, [isHovered, brands]);

  const handleBrandClick = (brandName) => {
    navigate(`/products?search=${encodeURIComponent(brandName)}`);
  };

  // double the array for seamless infinite scroll
  const allBrands = [...brands, ...brands];

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