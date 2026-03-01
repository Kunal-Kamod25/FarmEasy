import { useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import CartContents from "../Cart/CartContents";
import { useCart } from "../../context/CartContext";

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
  const drawerRef = useRef(null);
  const { cartCount } = useCart();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        drawerOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target)
      ) {
        toggleCartDrawer();
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [drawerOpen, toggleCartDrawer]);

  return (
    <div
      ref={drawerRef}
      onPointerDown={(e) => e.stopPropagation()}
      className={
        "fixed top-0 right-0 w-3/4 sm:w-1/2 md:w-[30rem] h-full bg-white shadow-2xl transform transition-transform duration-300 flex flex-col z-50 " +
        (drawerOpen ? "translate-x-0" : "translate-x-full")
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
          {cartCount > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={toggleCartDrawer}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <IoMdClose className="h-5 w-5 text-gray-500 hover:text-red-600" />
        </button>
      </div>

      {/* Cart Content - scrollable */}
      <div className="flex-grow px-5 py-3 overflow-y-auto scrollbar-hide">
        <CartContents />
      </div>

      {/* Footer - Checkout Button */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 font-semibold transition-all active:scale-95 shadow-md hover:shadow-lg">
          Proceed to Checkout
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Shipping, taxes, and discounts calculated at checkout.
        </p>
      </div>
    </div>
  );
};

export default CartDrawer;