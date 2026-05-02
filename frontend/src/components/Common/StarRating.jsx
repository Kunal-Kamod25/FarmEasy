import React from 'react';
import { Star, StarHalf } from 'lucide-react';

/**
 * StarRating Component
 * 
 * Renders a 5-star rating system based on an average value.
 * Supports full stars, half stars, and empty stars.
 * 
 * @param {number} rating - The average rating (0 to 5)
 * @param {number} size - The size of the stars (default: 16)
 * @param {string} className - Additional CSS classes for the container
 */
const StarRating = ({ rating = 0, size = 16, className = "" }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0 && (rating % 1) >= 0.3 && (rating % 1) <= 0.7;
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            // Full Star
            stars.push(
                <Star 
                    key={i} 
                    size={size} 
                    className="text-amber-400 fill-amber-400" 
                />
            );
        } else if (i - 0.5 <= rating) {
            // Half Star
            stars.push(
                <div key={i} className="relative inline-block" style={{ width: size, height: size }}>
                    <Star 
                        size={size} 
                        className="text-slate-200 fill-slate-200 absolute inset-0" 
                    />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                        <Star 
                            size={size} 
                            className="text-amber-400 fill-amber-400" 
                        />
                    </div>
                </div>
            );
        } else {
            // Empty Star
            stars.push(
                <Star 
                    key={i} 
                    size={size} 
                    className="text-slate-200 fill-slate-200" 
                />
            );
        }
    }

    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {stars}
        </div>
    );
};

export default StarRating;
