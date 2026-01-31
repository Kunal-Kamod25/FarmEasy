import React from 'react';
import { ShoppingCart, BadgeCheck } from 'lucide-react';
import { brands } from './ProductData'; // Import brands to lookup logos

const ProductCard = ({ product }) => {
  // Find brand logo
  const brandData = brands.find(b => b.name === product.brand);
  const brandLogo = brandData ? brandData.logo : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden w-full max-w-sm flex flex-col">
      {/* Image Container with Stock Badge */}
      <div className="relative h-48 w-full bg-gray-50">
        <img
          src={product.img || product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.inStock && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            In Stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Brand */}
        <div className="flex items-center gap-1 mb-1">
          <BadgeCheck className="w-3 h-3 text-green-500" />
          <p className="text-green-500 text-xs font-semibold uppercase tracking-wider">
            {product.brand || 'FarmEasy'}
          </p>
        </div>

        {/* Title */}
        <h3 className="text-gray-900 font-bold text-lg leading-tight mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">
          {product.description || 'Premium quality agricultural product for better yield and crop health.'}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center text-yellow-500 text-sm">
            <span>★</span>
            <span className="font-bold ml-1 text-gray-900">{product.rating}</span>
          </div>
          <span className="text-gray-400 text-xs ml-2">({product.reviewsCount || 0} reviews)</span>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price}
          </span>

          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;