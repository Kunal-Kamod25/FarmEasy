import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the pathname or search query changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use "instant" for immediate jump, or "smooth" for animation
    });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
