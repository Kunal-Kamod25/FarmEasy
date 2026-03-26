// =====================================================
// RatingBadge.jsx
// =====================================================
// Reusable star rating badge component
// Used throughout site to show product/vendor ratings
// =====================================================

import React from "react";
import { Star } from "lucide-react";

const RatingBadge = ({ rating, count, size = "md", showCount = true }) => {
  // Determine size classes
  const sizeClasses = {
    sm: { star: "w-3 h-3", text: "text-xs", badge: "px-2 py-1" },
    md: { star: "w-4 h-4", text: "text-sm", badge: "px-3 py-2" },
    lg: { star: "w-5 h-5", text: "text-base", badge: "px-4 py-2" },
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  // Handle undefined or null rating
  if (!rating || isNaN(rating)) {
    return (
      <div
        className={`flex items-center gap-1 bg-gray-100 rounded-lg ${sizes.badge}`}
      >
        <span className={`text-gray-600 font-semibold ${sizes.text}`}>
          No ratings
        </span>
      </div>
    );
  }

  const displayRating = Math.round(rating * 10) / 10;

  return (
    <div
      className={`flex items-center gap-1 bg-yellow-50 rounded-lg ${sizes.badge} w-fit`}
    >
      {/* STARS */}
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizes.star} ${
              i < Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>

      {/* RATING TEXT */}
      <span className={`text-yellow-700 font-semibold ${sizes.text}`}>
        {displayRating}
      </span>

      {/* COUNT */}
      {showCount && count && (
        <span className={`text-gray-600 ${sizes.text}`}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default RatingBadge;
