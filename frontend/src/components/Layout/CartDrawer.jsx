import { useState, useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import CartContents from "../Cart/CartContents";


const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
  const drawerRef = useRef(null);

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
        ref = {drawerRef}
        onPointerDown={(e) => e.stopPropagation()}
        className={'fixed top-0 right-0 w-3/4 sm:w-1/2 md:w-[30rem] h-full bg-white shadow-lg transform transition-transform duration-300 flex flex-col z-50 ' + (drawerOpen ? 'translate-x-0' : 'translate-x-full')}>
            
        {/* Close button */}
        <div className="flex justify-end p-4">
            <button onClick={toggleCartDrawer} >
                <IoMdClose className="h-6 w-6 text-black hover:text-red-600"/>
            </button>
        </div>
        
        {/* Cart Content */}
        <div className="flex-grow p-4 overflow-y-auto">
            <h2 className="text-xl text-black font-semibold mb-4 hover:underline cursor-pointer">Your Cart</h2>
            <CartContents />
        </div>
        
        {/* Checkout Button */}
        <div className="p-4 border-t sticky border-gray-200">
            <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 hover:underline cursor-pointer">
                Proceed to Checkout
            </button>
            <div className="p-0.5 pl-1 border-t sticky border-gray-200">
            <p className="font-inter text-sm tracking-tighter text-black whitespace-nowrap ">Shipping, taxes, and discount codes calculated at checkout.</p>
        </div>
        </div>
    </div>
    );
};
export default CartDrawer;