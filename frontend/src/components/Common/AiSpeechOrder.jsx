import { useState, useRef, useEffect } from "react";
import { HiMicrophone, HiSparkles } from "react-icons/hi2";

const AiSpeechOrder = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-green-500 text-green-500 px-2 py-1.5 rounded-md hover:bg-green-500 hover:text-white transition text-sm"
      >
        <HiSparkles className="text-lg" />
        <span>AI Order</span>
        <HiMicrophone className="text-lg" />
      </button>

      {/* Dropdown / Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-lg shadow-lg z-50 p-4">
          <p className="text-sm font-medium mb-2">
            🎤 Speech to Order
          </p>

          <p className="text-xs text-gray-600 mb-3">
            Speak product name, quantity & category.
          </p>

          <button
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            onClick={() => {
              // 🔥 later integrate AI logic here
              alert("AI Speech Coming Soon 🚀");
            }}
          >
            <HiMicrophone className="text-lg" />
            Start Listening
          </button>
        </div>
      )}
    </div>
  );
};

export default AiSpeechOrder;
