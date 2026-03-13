import React, { useState } from "react";
import { API_URL } from '../../config';
import {
    Heart, Package, Store, Star,
    ArrowRight, Leaf
} from "lucide-react";
import LoginModal from "../Common/LoginModal";

const API = `${API_URL}`;

export const ProductCard = ({
    product,
    onAddToCart,
    onToggleWishlist,
    isWishlisted,
    onViewDetail,
    badge,
    badgeColor = "bg-emerald-500",
}) => {
    const pid = product.id || product.product_id;
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginMessage, setLoginMessage] = useState("");

    const handleWishlist = (e) => {
        e.stopPropagation();
        const token = localStorage.getItem("token");
        if (!token) {
            setLoginMessage("Please login to save products to your wishlist.");
            setShowLoginModal(true);
            return;
        }
        onToggleWishlist(product);
    };

    const inStock = product.product_quantity > 0;

    return (
        <>
        {showLoginModal && <LoginModal message={loginMessage} onClose={() => setShowLoginModal(false)} />}
        <div
            onClick={onViewDetail}
            className="group cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
        >
            {/* ── image area ── */}
            <div className="relative h-44 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center overflow-hidden">

                {/* wishlist button — top right */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm border border-slate-100 hover:scale-110 transition z-10"
                >
                    <Heart
                        size={14}
                        className={
                            isWishlisted
                                ? "text-red-500 fill-red-500"
                                : "text-slate-400 hover:text-red-400"
                        }
                    />
                </button>

                {/* category or custom badge — top left */}
                {(badge || product.category_name) && (
                    <span
                        className={`absolute top-2.5 left-2.5 ${badge ? badgeColor : "bg-emerald-500"
                            } text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10`}
                    >
                        {badge || product.category_name}
                    </span>
                )}

                {/* real product image from backend, or a styled placeholder */}
                <div className="group-hover:scale-105 transition-transform duration-500 w-full h-full flex items-center justify-center p-3">
                    {product.product_image ? (
                        <img
                            src={`${API}${product.product_image}`}
                            alt={product.product_name}
                            className="w-full h-full object-contain rounded-xl"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center">
                            <Package size={32} className="text-emerald-300" />
                        </div>
                    )}
                </div>

                {/* out of stock overlay */}
                {!inStock && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-20">
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* ── card content ── */}
            <div className="p-4 flex flex-col flex-grow">

                {/* product name */}
                <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-emerald-700 transition-colors">
                    {product.product_name}
                </h3>

                {/* short description */}
                {product.product_description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                        {product.product_description}
                    </p>
                )}

                {/* seller info */}
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="bg-emerald-50 p-0.5 rounded">
                        <Store size={10} className="text-emerald-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium truncate">
                        {product.shop_name || product.seller_name || "FarmEasy Vendor"}
                    </span>
                </div>

                {/* star rating row */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={11}
                                className={
                                    star <= 4
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-slate-200 fill-slate-200"
                                }
                            />
                        ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">4.0</span>
                </div>

                {/* price + view details — at the bottom */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                    <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Price
                        </span>
                        <p className="text-base font-black text-slate-900">
                            ₹{Number(product.price).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onViewDetail}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 active:scale-95"
                    >
                        <ArrowRight size={12} /> View Details
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export const LoadingSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {[...Array(count)].map((_, i) => (
            <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden animate-pulse border border-slate-100"
            >
                <div className="h-44 bg-slate-100" />
                <div className="p-4 space-y-2.5">
                    <div className="h-3.5 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-2.5 bg-slate-50 rounded-full w-full" />
                    <div className="h-2.5 bg-slate-50 rounded-full w-2/3" />
                    <div className="flex justify-between items-center pt-2">
                        <div className="h-5 bg-slate-100 rounded w-16" />
                        <div className="h-8 bg-slate-100 rounded-xl w-16" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const EmptyState = ({ message }) => (
    <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf size={28} className="text-slate-300" />
        </div>
        <p className="text-slate-500 font-semibold text-sm">{message}</p>
    </div>
);
