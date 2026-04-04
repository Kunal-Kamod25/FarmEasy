import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="relative w-full h-[500px] md:h-[450px] overflow-hidden bg-gray-900">
      <AnimatePresence custom={direction}>
        <MotionDiv
          key={index}
          custom={direction}
          className="absolute inset-0"
          initial={{ x: direction > 0 ? "100%" : "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: direction > 0 ? "-100%" : "100%" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Background with Overlay */}
          <div className="absolute inset-0">
            <img
              src={slides[index].bgImage}
              alt={slides[index].title}
              loading={index === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover transition-transform duration-[10000ms] scale-110 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-black/20" /> {/* Extra subtle darkening for the whole image */}
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center px-6 md:px-16 lg:px-24">
            <div className="max-w-3xl">
              <MotionH1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 text-white leading-tight drop-shadow-2xl"
              >
                {slides[index].title}
              </MotionH1>
              <MotionP
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-xl md:text-2xl mb-4 text-emerald-400 font-semibold tracking-wide uppercase drop-shadow-md"
              >
                {slides[index].subtitle}
              </MotionP>
              <MotionP
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg md:text-xl mb-10 text-gray-200 max-w-xl leading-relaxed opacity-90 drop-shadow-sm"
              >
                {slides[index].description}
              </MotionP>
              <MotionDiv
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <button className="group relative bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 overflow-hidden">
                  <span className="relative z-10">{slides[index].button}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <svg className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </MotionDiv>
            </div>
          </div>
        </MotionDiv>
      </AnimatePresence>

      {/* NAVIGATION CONTROLS */}
      <div className="absolute inset-0 flex items-center justify-between px-4 z-20">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={prevSlide}
          className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Next slide"
          onClick={nextSlide}
          className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* DOTS INDICATOR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className="group py-2 px-1 focus:outline-none"
          >
            <div className={`h-1 transition-all duration-500 rounded-full ${i === index ? "w-8 bg-emerald-500" : "w-4 bg-white/30 hover:bg-white/60"}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
