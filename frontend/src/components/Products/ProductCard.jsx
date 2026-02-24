// import React from 'react';
// import { ShoppingCart, BadgeCheck, Star } from 'lucide-react';
// import { brands } from './ProductData';

// const ProductCard = ({ product }) => {
//   const brandData = brands.find(b => b.name === product.brand);
//   const brandLogo = brandData ? brandData.logo : null;

//   return (
//     <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-emerald-200 transition-all duration-500 border border-slate-100 overflow-hidden w-full flex flex-col h-full">
//       {/* Image Container with Stock Badge */}
//       <div className="relative h-56 w-full bg-slate-50/50 p-6 flex items-center justify-center overflow-hidden">
//         <img
//           src={product.img || product.image}
//           alt={product.name}
//           className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
//         />
//         {product.inStock ? (
//           <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm shadow-sm border border-emerald-50 px-3 py-1.5 rounded-2xl flex items-center gap-1.5">
//             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//             <span className="text-emerald-700 text-[10px] font-black uppercase tracking-wider">
//               In Stock
//             </span>
//           </div>
//         ) : (
//           <div className="absolute top-4 right-4 bg-slate-100/90 backdrop-blur-sm shadow-sm border border-slate-200 px-3 py-1.5 rounded-2xl">
//             <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider">
//               Out of Stock
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Content */}
//       <div className="p-5 flex flex-col flex-grow">
//         {/* Brand */}
//         <div className="flex items-center gap-1.5 mb-2">
//           <div className="p-1 bg-emerald-50 rounded-lg">
//             <BadgeCheck className="w-3 h-3 text-emerald-600" />
//           </div>
//           <p className="text-emerald-700 text-[10px] font-black uppercase tracking-[0.1em]">
//             {product.brand || 'Premium Quality'}
//           </p>
//         </div>

//         {/* Title */}
//         <h3 className="text-slate-800 font-black text-lg leading-tight mb-2 line-clamp-2 min-h-[3rem] group-hover:text-emerald-700 transition-colors">
//           {product.name}
//         </h3>

//         {/* Description */}
//         <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-grow font-medium">
//           {product.description || 'Premium quality agricultural product for better yield and crop health.'}
//         </p>

//         {/* Rating */}
//         <div className="flex items-center gap-3 mb-6 bg-slate-50 p-2 rounded-2xl w-fit">
//           <div className="flex items-center gap-1 text-amber-500">
//             <Star size={14} fill="currentColor" />
//             <span className="font-black text-slate-800 text-xs">{product.rating || '4.5'}</span>
//           </div>
//           <div className="w-px h-3 bg-slate-200" />
//           <span className="text-slate-400 text-[10px] font-bold">({product.reviewsCount || 0} Reviews)</span>
//         </div>

//         {/* Price and Action Row - Responsive Design */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-50">
//           <div className="flex flex-col">
//             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Price</span>
//             <span className="text-2xl font-black text-slate-900">
//               ₹{product.price.toLocaleString()}
//             </span>
//           </div>

//           <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest py-3.5 px-6 rounded-2xl transition-all shadow-xl shadow-emerald-100 hover:shadow-emerald-200 active:scale-95 group/btn">
//             <ShoppingCart size={16} className="group-hover:rotate-12 transition-transform" />
//             <span>Add</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, BadgeCheck, Star, Heart } from 'lucide-react';
import { brands } from './ProductData';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const token = localStorage.getItem("token");

  const brandData = brands.find(b => b.name === product.brand);

  // Check if product is already wishlisted
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const exists = res.data.data.some(
          item => item.id === product.id
        );

        setIsWishlisted(exists);
      } catch (error) {
        console.log(error);
      }
    };

    if (token) {
      checkWishlist();
    }
  }, [product.id, token]);

  const toggleWishlist = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/wishlist",
        { productId: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsWishlisted(!isWishlisted);

    } catch (error) {
      console.log("Wishlist toggle error:", error);
    }
  };

  return (
    <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-all duration-500 border border-slate-100 overflow-hidden w-full flex flex-col h-full">
      
      {/* Image Container */}
      <div className="relative h-48 w-full bg-slate-50/50 p-4 flex items-center justify-center overflow-hidden">

        {/* ❤️ Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm border border-slate-100 hover:scale-110 transition"
        >
          <Heart
            size={16}
            className={
              isWishlisted
                ? "text-red-500 fill-red-500"
                : "text-slate-400 hover:text-red-500"
            }
          />
        </button>

        <img
          src={product.img || product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {product.inStock ? (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm shadow-sm border border-emerald-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 text-[9px] font-bold uppercase tracking-wider">
              In Stock
            </span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-slate-100/90 backdrop-blur-sm shadow-sm border border-slate-200 px-2.5 py-1 rounded-xl">
            <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">

        {/* Brand */}
        <div className="flex items-center gap-1 mb-2">
          <div className="p-1 bg-emerald-50 rounded-md">
            <BadgeCheck className="w-3 h-3 text-emerald-600" />
          </div>
          <p className="text-emerald-700 text-[9px] font-bold uppercase tracking-wider">
            {product.brand || 'Premium Quality'}
          </p>
        </div>

        {/* Title */}
        <h3 className="text-slate-800 font-bold text-base leading-snug mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-[11px] leading-relaxed mb-3 line-clamp-2 flex-grow font-medium">
          {product.description || 'Premium quality agricultural product for better yield and crop health.'}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4 bg-slate-50 p-2 rounded-xl w-fit">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={13} fill="currentColor" />
            <span className="font-bold text-slate-800 text-[11px]">
              {product.rating || '4.5'}
            </span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <span className="text-slate-400 text-[9px] font-semibold">
            ({product.reviewsCount || 0})
          </span>
        </div>

        {/* Price + Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-50">
          
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              Price
            </span>
            <span className="text-xl font-bold text-slate-900">
              ₹{product.price.toLocaleString()}
            </span>
          </div>

          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-widest py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95">
            <ShoppingCart size={14} />
            <span>Add</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProductCard;