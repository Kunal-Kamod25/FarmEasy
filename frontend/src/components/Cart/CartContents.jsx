import { RiDeleteBin3Line } from "react-icons/ri";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const CartContents = () => {
    const { cartItems, cartTotal, removeFromCart, updateQuantity, loading } = useCart();
    const [expandedIds, setExpandedIds] = useState({});
    const navigate = useNavigate();

    const toggleExpand = (id) => {
        setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start justify-between py-4 border-b animate-pulse">
                        <div className="flex items-start gap-3">
                            <div className="w-20 h-24 bg-gray-200 rounded" />
                            <div className="space-y-2 mt-1">
                                <div className="h-3 bg-gray-200 rounded w-32" />
                                <div className="h-3 bg-gray-200 rounded w-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">🛒</span>
                <p className="text-gray-500 font-medium">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">Add some products to get started!</p>
            </div>
        );
    }

    const truncateText = (text = "", maxLength = 30) => {
        if (!text) return "";
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + "...";
    };

    return (
        <div className="text-sm text-black">
            {cartItems.map((product, index) => {
                const pid = product.id || product.product_id || index;
                const isExpanded = expandedIds[pid];
                return (
                    <div key={product.cart_id || pid} className="border-b last:border-b-0">
                        <div className="flex items-start justify-between py-4">
                            <div
                                className="flex items-start gap-3 cursor-pointer"
                                onClick={() => toggleExpand(pid)}
                            >
                                <img
                                    src={product.image || product.img || `https://picsum.photos/80?random=${pid}`}
                                    alt={product.name}
                                    className="w-20 h-24 object-cover rounded-lg border border-gray-100"
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-800 leading-snug">
                                        {truncateText(product.name, 30)}
                                    </h3>
                                    <p className="text-xs text-emerald-600 font-bold mt-1">
                                        ₹{Number(product.price).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Subtotal: ₹{(Number(product.price) * (product.quantity || 1)).toLocaleString()}
                                    </p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center mt-2 gap-2">
                                        <button
                                            onClick={() => updateQuantity(product.id, (product.quantity || 1) - 1)}
                                            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-lg font-medium text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                                        >
                                            −
                                        </button>
                                        <span className="min-w-[1.5rem] text-center font-semibold text-gray-800">
                                            {product.quantity || 1}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(product.id, (product.quantity || 1) + 1)}
                                            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-lg font-medium text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => removeFromCart(product.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 flex-shrink-0"
                                title="Remove item"
                            >
                                <RiDeleteBin3Line size={18} />
                            </button>
                        </div>
                        {isExpanded && (
                            <div className="px-6 pb-4 text-sm text-gray-600">
                                <p className="font-semibold">Details:</p>
                                <p>{product.description || product.product_description || "No additional information available."}</p>
                                <div className="flex items-center gap-4 mt-1">
                                    <button
                                        onClick={() => toggleExpand(pid)}
                                        className="text-blue-600 text-xs underline"
                                    >
                                        Minimize
                                    </button>
                                    <button
                                        onClick={() => navigate(`/product/${pid}`)}
                                        className="text-green-600 text-xs underline"
                                    >
                                        View full page
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Total */}
            <div className="sticky bottom-0 bg-white pt-4 mt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-500">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                        ₹{cartTotal.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CartContents;
