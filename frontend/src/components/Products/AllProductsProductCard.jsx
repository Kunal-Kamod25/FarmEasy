import React from "react";
import { Heart, Store, Package } from "lucide-react";
import { API_URL } from '../../config';

const AllProductsProductCard = ({
    product,
    onToggleWishlist,
    isWishlisted,
    onViewDetail
}) => {
    const token = localStorage.getItem("token");

    const handleWishlist = () => {
        if (!token) {
            alert("Please login to save to wishlist");
            return;
        }
        onToggleWishlist(product);
    };

    return (
        <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
            <div className="relative h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                <button
                    onClick={handleWishlist}
                    className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm border border-slate-100 hover:scale-110 transition z-10"
                >
                    <Heart
                        size={15}
                        className={isWishlisted ? "text-red-500 fill-red-500" : "text-slate-400"}
                    />
                </button>

                {product.category_name && (
                    <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                        {product.category_name}
                    </span>
                )}

                <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    {product.product_image ? (
                        <img
                            src={`${API_URL}${product.product_image}`}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                            }}
                        />
                    ) : null}
                    <div
                        className="text-center"
                        style={{
                            display: product.product_image ? "none" : "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-2">
                            <Package size={32} className="text-emerald-400" />
                        </div>
                    </div>
                </div>

                {product.product_quantity === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3
                    onClick={onViewDetail}
                    className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-1 cursor-pointer hover:text-emerald-700 transition-colors"
                >
                    {product.product_name}
                </h3>

                <p className="text-slate-500 text-xs line-clamp-2 mb-3 flex-grow leading-relaxed">
                    {product.product_description || "No description available"}
                </p>

                <div className="flex items-center gap-1.5 mb-3 bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <Store size={11} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-[11px] text-slate-600 truncate font-medium">
                        {product.shop_name || product.seller_name || "Unknown Seller"}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Price</p>
                        <p className="text-lg font-black text-slate-900">₹{Number(product.price).toLocaleString()}</p>
                    </div>

                    <button
                        onClick={onViewDetail}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllProductsProductCard;
