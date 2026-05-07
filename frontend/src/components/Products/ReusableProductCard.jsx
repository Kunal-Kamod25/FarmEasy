import React, { useState } from "react";
import { Heart, Store, Package, Eye, Pencil, Trash2 } from "lucide-react";
import { getImageUrl } from "../../config";
import LoginModal from "../Common/LoginModal";
import StarRating from "../Common/StarRating";
import { useLanguage } from "../../context/language/LanguageContext";

const ReusableProductCard = ({
  product,
  mode = "user",
  isWishlisted = false,
  onToggleWishlist,
  onViewDetail,
  onEdit,
  onDelete,
  categoryLabel,
}) => {
  const { t, td, language } = useLanguage();
  const token = localStorage.getItem("token");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const productName =
    product?.[`product_name_${language}`] || td(product?.product_name || product?.name || "");
  const productDescription =
    product?.[`product_description_${language}`] ||
    td(product?.product_description || product?.description || "");
  const productCategory = categoryLabel || td(product?.category_name || "");
  const isInStock = Number(product?.product_quantity || 0) > 0 || Boolean(product?.inStock);

  const imageSrc = product?.product_image
    ? getImageUrl(product.product_image)
    : product?.image || product?.img || "";

  const handleWishlist = async (e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (!onToggleWishlist) return;
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    await onToggleWishlist(product);
  };

  return (
    <>
      {showLoginModal && (
        <LoginModal
          message={t("common.loginForWishlist")}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      <div 
        className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full cursor-pointer relative"
        onClick={onViewDetail}
      >
        {/* Top Image Section */}
        <div className="relative h-56 bg-slate-50/50 flex items-center justify-center overflow-hidden">
          {typeof onToggleWishlist === "function" && mode === "user" && (
            <button
              type="button"
              onClick={handleWishlist}
              className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm border border-slate-100 hover:scale-110 active:scale-95 transition-all z-20 group/heart"
              title={token ? "Toggle wishlist" : "Login to wishlist"}
            >
              <Heart
                size={16}
                className={`transition-colors duration-300 ${isWishlisted ? "text-rose-500 fill-rose-500" : "text-slate-300 group-hover/heart:text-rose-400"}`}
              />
            </button>
          )}

          {!!productCategory && (
            <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest z-20 shadow-lg shadow-emerald-500/20">
              {productCategory}
            </span>
          )}

          <div className="w-full h-full flex items-center justify-center p-6 group-hover:scale-110 transition-transform duration-700 ease-out">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={productName}
                className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl"
                onError={(e) => {
                  e.target.style.display = "none";
                  const next = e.target.nextSibling;
                  if (next) next.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="text-center"
              style={{
                display: imageSrc ? "none" : "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="w-20 h-20 mx-auto bg-emerald-50/50 rounded-[2rem] flex items-center justify-center mb-2">
                <Package size={32} className="text-emerald-400/50" />
              </div>
            </div>
          </div>

          {!isInStock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-4 py-2 rounded-xl border border-rose-100 uppercase tracking-widest">
                {t("product.outOfStock")}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow bg-white">
          <h3
            className="font-black text-slate-800 text-base leading-tight line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors duration-300"
          >
            {productName}
          </h3>

          <p className="text-slate-400 text-xs line-clamp-2 mb-5 flex-grow leading-relaxed font-medium">
            {productDescription || t("common.noDescriptionAvailable")}
          </p>

          <div className="space-y-4">
            {mode === "user" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                  <StarRating rating={product.average_rating || 0} size={10} />
                  <span className="text-[10px] text-slate-500 font-black">
                    {Number(product.average_rating || 0).toFixed(1)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Store size={12} className="text-emerald-500" />
                  <span className="text-[10px] text-slate-500 font-bold truncate max-w-[100px]">
                    {product.shop_name || product.seller_name || t("product.unknownSeller")}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-black text-slate-900">₹</span>
                  <span className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                    {Number(product.price || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {mode === "vendor" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
                    className="p-2.5 rounded-xl border border-slate-100 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-2.5 rounded-xl border border-slate-100 bg-white text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2.5 rounded-xl border border-slate-100 bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 shadow-md shadow-emerald-950/10"
                >
                  Details <Package size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReusableProductCard;
