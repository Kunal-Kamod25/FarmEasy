import React, { useState } from "react";
import { Heart, Store, Package, Eye, Pencil, Trash2 } from "lucide-react";
import { getImageUrl } from "../../config";
import LoginModal from "../Common/LoginModal";
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

  const handleWishlist = async () => {
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

      <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
        <div className="relative h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
          {typeof onToggleWishlist === "function" && mode === "user" && (
            <button
              type="button"
              onClick={handleWishlist}
              className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm border border-slate-100 hover:scale-110 transition z-10"
              title={token ? "Toggle wishlist" : "Login to wishlist"}
            >
              <Heart
                size={15}
                className={isWishlisted ? "text-red-500 fill-red-500" : "text-slate-400"}
              />
            </button>
          )}

          {!!productCategory && (
            <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              {productCategory}
            </span>
          )}

          <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={productName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
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
              <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-2">
                <Package size={32} className="text-emerald-400" />
              </div>
            </div>
          </div>

          {!isInStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
                {t("product.outOfStock")}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3
            onClick={onViewDetail}
            className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-1 cursor-pointer hover:text-emerald-700 transition-colors"
          >
            {productName}
          </h3>

          <p className="text-slate-500 text-xs line-clamp-2 mb-3 flex-grow leading-relaxed">
            {productDescription || t("common.noDescriptionAvailable")}
          </p>

          {mode === "user" && (
            <div className="flex items-center gap-1.5 mb-3 bg-slate-50 rounded-lg px-2.5 py-1.5">
              <Store size={11} className="text-emerald-600 flex-shrink-0" />
              <span className="text-[11px] text-slate-600 truncate font-medium">
                {product.shop_name || product.seller_name || t("product.unknownSeller")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">
                {t("product.price")}
              </p>
              <p className="text-lg font-black text-slate-900">
                ₹{Number(product.price || 0).toLocaleString()}
              </p>
            </div>

            {mode === "vendor" ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onViewDetail}
                  className="p-2 rounded-lg border border-slate-100 bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 shadow-sm"
                  aria-label="Preview product"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  onClick={onEdit}
                  className="p-2 rounded-lg border border-slate-100 bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 shadow-sm"
                  aria-label="Edit product"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="p-2 rounded-lg border border-slate-100 bg-white text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 shadow-sm"
                  aria-label="Delete product"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onViewDetail}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
              >
                {t("common.viewDetails")}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReusableProductCard;
