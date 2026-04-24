import React, { useState } from "react";
import { API_URL, getImageUrl } from '../../config';
import {
    Heart, Package, Store, Star,
    ArrowRight, Leaf
} from "lucide-react";
import LoginModal from "../Common/LoginModal";

const API = `${API_URL}`;

export const ProductCard = ({
    product,
    onToggleWishlist,
    isWishlisted,
    onViewDetail,
    badge,
    badgeColor = "bg-emerald-500",
}) => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginMessage, setLoginMessage] = useState("");

    const handleWishlist = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const token = localStorage.getItem("token");
        if (!token) {
            setLoginMessage("Please login to save products to your wishlist.");
            setShowLoginModal(true);
            return;
        }
        if (typeof onToggleWishlist === "function") {
            onToggleWishlist(product);
        }
    };

    const inStock = product.product_quantity > 0;

    return (
        <>
            {showLoginModal && <LoginModal message={loginMessage} onClose={() => setShowLoginModal(false)} />}
            <div
                onClick={onViewDetail}
                className="group relative cursor-pointer bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full min-h-[380px]"
            >
                {/* ── IMAGE AREA ── */}
                <div className="relative h-48 bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center overflow-hidden">
                    {/* wishlist button */}
                    <button
                        type="button"
                        onClick={handleWishlist}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-xl rounded-2xl p-2.5 shadow-sm border border-white hover:scale-110 active:scale-95 transition-all z-10 group/wishlist"
                    >
                        <Heart
                            size={16}
                            className={`transition-all duration-300 ${
                                isWishlisted
                                    ? "text-red-500 fill-red-500 scale-110"
                                    : "text-slate-400 group-hover/wishlist:text-red-400"
                            }`}
                        />
                    </button>

                    {/* category/badge */}
                    {(badge || product.category_name) && (
                        <div className="absolute top-4 left-4 z-10">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg ${badge ? badgeColor : "bg-emerald-500"} shadow-emerald-500/20`}>
                                {badge || product.category_name}
                            </span>
                        </div>
                    )}

                    {/* image container */}
                    <div className="w-full h-full flex items-center justify-center p-6 group-hover:scale-110 transition-transform duration-700">
                        {product.product_image ? (
                            <img
                                src={getImageUrl(product.product_image)}
                                alt={product.product_name}
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-emerald-50/50 backdrop-blur-sm rounded-[2rem] flex items-center justify-center border border-white/50 shadow-inner">
                                <Package size={40} className="text-emerald-400/50" />
                            </div>
                        )}
                    </div>

                    {/* stock overlay */}
                    {!inStock && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] flex items-center justify-center z-20">
                            <span className="bg-white/90 text-red-500 text-[10px] font-black px-4 py-2 rounded-2xl border border-red-100 shadow-xl uppercase tracking-tighter">
                                Sold Out
                            </span>
                        </div>
                    )}
                </div>

                {/* ── CARD CONTENT ── */}
                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={10}
                                    className={star <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-black tracking-tighter">(4.0)</span>
                    </div>

                    <h3 className="font-black text-slate-800 text-sm leading-snug line-clamp-2 min-h-[40px] mb-2 group-hover:text-emerald-600 transition-colors">
                        {product.product_name}
                    </h3>

                    <div className="flex items-center gap-2 mb-4 bg-emerald-50/50 backdrop-blur-sm border border-emerald-100/50 rounded-xl px-2.5 py-1.5 w-fit">
                        <Store size={12} className="text-emerald-600" />
                        <span className="text-[10px] text-emerald-800 font-bold truncate max-w-[120px]">
                            {product.shop_name || product.seller_name || "FarmEasy Partner"}
                        </span>
                    </div>

                    {/* price + actions */}
                    <div className="mt-auto pt-4 border-t border-slate-100/50 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] block mb-0.5">Price</span>
                            <p className="text-lg font-black text-slate-900 leading-none">
                                ₹{Number(product.price).toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={onViewDetail}
                            className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 transition-all active:scale-90"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export const LoadingSkeleton = ({ count = 5 }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(count)].map((_, i) => (
            <div
                key={i}
                className="bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden animate-pulse border border-white/50 min-h-[380px]"
            >
                <div className="h-48 bg-slate-100/50" />
                <div className="p-5 space-y-4">
                    <div className="h-3 bg-slate-100/50 rounded-full w-1/3" />
                    <div className="h-4 bg-slate-100/50 rounded-full w-3/4" />
                    <div className="h-2.5 bg-slate-100/50 rounded-full w-full" />
                    <div className="h-8 bg-slate-100/50 rounded-xl w-1/4" />
                    <div className="flex justify-between items-center pt-4">
                        <div className="h-6 bg-slate-100/50 rounded w-20" />
                        <div className="h-10 bg-slate-100/50 rounded-2xl w-10" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const EmptyState = ({ message }) => (
    <div className="py-20 text-center bg-white/40 backdrop-blur-md rounded-[3rem] border border-dashed border-white shadow-2xl shadow-emerald-500/5">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/50 rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <Leaf size={40} className="text-emerald-400" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">No Harvest Found</h3>
        <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto leading-relaxed">{message}</p>
    </div>
);
