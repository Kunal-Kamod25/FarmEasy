import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    title: "Welcome to FarmEasy",
    subtitle: "Your one-stop Agricultural Marketplace",
    description:
      "Buy everything you need for modern farming from trusted vendors.",
    bgImage:
      "https://images.pexels.com/photos/94039/pexels-photo-94039.jpeg",
    button: "Explore Platform",
  },
  {
    title: "Premium Fertilizers",
    subtitle: "Boost your crop yield",
    description:
      "High-quality organic and chemical fertilizers for every soil type.",
    bgImage:
      "https://images.pexels.com/photos/31673795/pexels-photo-31673795.jpeg",
    button: "Shop Fertilizers",
  },
  {
    title: "Modern Farm Equipment",
    subtitle: "Power your productivity",
    description:
      "Tractors, tools, and machines designed for efficiency and durability.",
    bgImage:
      "https://images.pexels.com/photos/5529580/pexels-photo-5529580.jpeg",
    button: "View Equipment",
  },
  {
    title: "Seeds & Pulses",
    subtitle: "Strong roots start here",
    description:
      "Certified seeds and pulses for maximum germination and yield.",
    bgImage:
      "https://images.pexels.com/photos/6086066/pexels-photo-6086066.jpeg",
    button: "Browse Seeds",
  },
  {
    title: "Irrigation Systems",
    subtitle: "Smart water management",
    description:
      "Drip, sprinkler, and modern irrigation solutions for every farm.",
    bgImage:
      "https://images.pexels.com/photos/31231190/pexels-photo-31231190.jpeg",
    button: "Explore Irrigation",
  },
  {
    title: "Animal Feed & Medicines",
    subtitle: "Healthy cows, horses & bulls",
    description:
      "Nutritious animal feed and trusted veterinary medicines.",
    bgImage:
      "https://images.pexels.com/photos/32461697/pexels-photo-32461697.jpeg",
    button: "Shop Animal Care",
  },
];

const HeroCarousel = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev

  // AUTO SLIDE
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

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
    <div className="relative w-full h-[450px] overflow-hidden">
      <AnimatePresence custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          className="absolute inset-0"
          initial={{ x: direction > 0 ? "100%" : "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: direction > 0 ? "-100%" : "100%" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Background */}
          <img
            src={slides[index].bgImage}
            alt={slides[index].title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center px-10">
            <div className="text-white max-w-2xl">
              <h1 className="text-6xl font-extrabold mb-4 drop-shadow-lg">
                {slides[index].title}
              </h1>
              <p className="text-2xl mb-3 opacity-95">
                {slides[index].subtitle}
              </p>
              <p className="text-lg mb-8 opacity-90">
                {slides[index].description}
              </p>
              <button className="bg-[#00c853] hover:bg-green-600 px-10 py-4 rounded-md font-bold text-lg shadow-lg">
                {slides[index].button}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* PREV */}
      <button
        onClick={prevSlide}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
      >
        ❮
      </button>

      {/* NEXT */}
      <button
        onClick={nextSlide}
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
      >
        ❯
      </button>

      {/* DOTS */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`w-3 h-3 rounded-full ${i === index ? "bg-white" : "bg-white/50"
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
