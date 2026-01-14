// src/components/Products/ProductCard.jsx
import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
      {/* Wishlist Heart Icon */}
      <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Product Image */}
      <div className="h-40 w-full flex items-center justify-center bg-gray-50 rounded-lg mb-4">
        <img src={product.image} alt={product.name} className="max-h-full object-contain" />
      </div>

      {/* Details */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 h-8">
          {product.name}
        </h3>
        <p className="text-[10px] text-gray-500 italic">{product.brand}</p>
        
        <div className="flex items-center pt-2">
          <span className="text-sm font-bold">₹ {product.price}</span>
        </div>

        {/* Rating and Button */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-yellow-500 text-xs">
            ★ <span className="text-gray-400 ml-1">{product.rating}</span>
          </div>
          <button className="bg-[#4ade80] hover:bg-green-500 text-white text-[10px] font-bold py-1 px-3 rounded-full transition-colors">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;