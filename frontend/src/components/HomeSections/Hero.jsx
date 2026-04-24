import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, Star, Headphones } from "lucide-react";
import Farm1 from "../../assets/Farm1.jpeg";
import Farm2 from "../../assets/Farm2.jpeg";
import Fartilizers2 from "../../assets/Fartilizers2.png";
import Farm4 from "../../assets/Farm4.jpeg";
import Irrigation from "../../assets/Irrigation.png";
import Feed from "../../assets/Feed.png";
import Farm5 from "../../assets/Farm5.jpeg";

const slides = [
  {
    title: "Welcome to FarmEasy",
    subtitle: "Your one-stop Agricultural Marketplace",
    description:
      "Buy everything you need for modern farming from trusted vendors.",
    bgImage: Farm1,
    button: "Explore Platform",
  },
  {
    title: "Premium Fertilizers",
    subtitle: "Boost your crop yield",
    description:
      "High-quality organic and chemical fertilizers for every soil type.",
    bgImage: Farm2,
    button: "Shop Fertilizers",
  },
  {
    title: "Modern Farm Equipment",
    subtitle: "Power your productivity",
    description:
      "Tractors, tools, and machines designed for efficiency and durability.",
    bgImage: Fartilizers2,
    button: "View Equipment",
  },
  {
    title: "Seeds & Pulses",
    subtitle: "Strong roots start here",
    description:
      "Certified seeds and pulses for maximum germination and yield.",
    bgImage: Farm4,
    button: "Browse Seeds",
  },
  {
    title: "Irrigation Systems",
    subtitle: "Smart water management",
    description:
      "Drip, sprinkler, and modern irrigation solutions for every farm.",
    bgImage: Farm5,
    button: "Explore Irrigation",
  },
  {
    title: "Animal Feed & Medicines",
    subtitle: "Healthy cows, horses & bulls",
    description:
      "Nutritious animal feed and trusted veterinary medicines.",
    bgImage: Feed,
    button: "Shop Animal Care",
  },
];

const HeroCarousel = () => {
  const MotionDiv = motion.div;
  const MotionH1 = motion.h1;
  const MotionP = motion.p;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev

  // PRELOAD IMAGES
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.bgImage;
    });
  }, []);

  // AUTO SLIDE
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // Slightly slower auto-slide for better readability

    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[520px] md:h-[500px] overflow-hidden bg-slate-950">
      <AnimatePresence custom={direction} mode="wait">
        <MotionDiv
          key={index}
          custom={direction}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Background with Multi-layer Overlay */}
          <div className="absolute inset-0">
            <img
              src={slides[index].bgImage}
              alt={slides[index].title}
              loading={index === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover transition-transform duration-[10000ms] scale-110 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center px-6 md:px-16 lg:px-24">
            <div className="max-w-3xl -mt-12 md:-mt-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="h-px w-8 bg-emerald-500" />
                <span className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px]">
                    {slides[index].subtitle}
                </span>
              </motion.div>
              
              <MotionH1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-white leading-[1.1] drop-shadow-2xl"
              >
                {slides[index].title}
              </MotionH1>
              
              <MotionP
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-base md:text-xl mb-8 text-slate-200/80 max-w-xl leading-relaxed font-medium"
              >
                {slides[index].description}
              </MotionP>

              <MotionDiv
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <button className="group relative bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3.5 rounded-2xl font-black text-base shadow-[0_15px_40px_rgba(16,185,129,0.3)] transition-all duration-500 hover:-translate-y-1.5 flex items-center gap-3 overflow-hidden">
                  <span className="relative z-10">{slides[index].button}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <ArrowRight size={18} className="relative z-10 transition-transform duration-500 group-hover:translate-x-1.5" />
                </button>
              </MotionDiv>
            </div>
          </div>
        </MotionDiv>
      </AnimatePresence>

      {/* QUICK STATS BAR */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-30 hidden lg:block">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-1.5 flex items-center justify-between shadow-2xl">
            {[
                { icon: <Truck size={18} />, label: "Fast Delivery", sub: "3-5 Days" },
                { icon: <ShieldCheck size={18} />, label: "Secured", sub: "100% Safety" },
                { icon: <Star size={18} />, label: "Premium", sub: "Verified Only" },
                { icon: <Headphones size={18} />, label: "24/7 Support", sub: "Kisan Help" }
            ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-white/10 rounded-2xl transition-all cursor-default group">
                    <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                        {stat.icon}
                    </div>
                    <div>
                        <p className="text-white font-black text-xs tracking-tight">{stat.label}</p>
                        <p className="text-white/40 text-[8px] font-bold uppercase tracking-widest leading-none">{stat.sub}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* SIDE NAVIGATION ARROWS */}
      <div className="absolute inset-0 flex items-center justify-between px-6 z-40 pointer-events-none">
          <button
            onClick={prevSlide}
            className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-md text-white rounded-2xl transition-all duration-300 pointer-events-auto border border-white/5 active:scale-90"
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
          </button>
          <button
            onClick={nextSlide}
            className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-md text-white rounded-2xl transition-all duration-300 pointer-events-auto border border-white/5 active:scale-90"
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
          </button>
      </div>

      {/* STEP INDICATORS */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className="group relative h-8 w-1 focus:outline-none"
          >
            <div className={`absolute inset-0 transition-all duration-700 rounded-full ${i === index ? "h-8 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" : "h-4 bg-white/20 hover:bg-white/40"}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
