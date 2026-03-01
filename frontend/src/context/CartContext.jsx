import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const getToken = () => localStorage.getItem("token");
    const getUser = () => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    };

    // ─── Fetch cart from backend (if logged in) ───────────────────────────────
    const fetchCart = useCallback(async () => {
        const token = getToken();
        if (!token) {
            // Load from localStorage for guests
            try {
                const saved = JSON.parse(localStorage.getItem("guestCart") || "[]");
                setCartItems(saved);
            } catch {
                setCartItems([]);
            }
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/cart", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCartItems(res.data.data || []);
        } catch (err) {
            console.error("Cart fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // ─── Add to Cart ─────────────────────────────────────────────────────────
    // normalize product id across different shapes
    const getPid = (product) => product.id || product.product_id || product._id;

    const addToCart = async (product, quantity = 1) => {
        const token = getToken();
        const pid = getPid(product);
        if (!pid) return console.warn("addToCart called without valid product id", product);

        if (token) {
            try {
                await axios.post(
                    "http://localhost:5000/api/cart",
                    { productId: pid, quantity },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                await fetchCart();
            } catch (err) {
                console.error("Add to cart error:", err);
            }
        } else {
            // Guest cart stored in localStorage
            setCartItems((prev) => {
                const existing = prev.find((i) => getPid(i) === pid);
                let updated;
                if (existing) {
                    updated = prev.map((i) =>
                        getPid(i) === pid
                            ? { ...i, quantity: (i.quantity || 1) + quantity }
                            : i
                    );
                } else {
                    updated = [...prev, { ...product, id: pid, quantity }];
                }
                localStorage.setItem("guestCart", JSON.stringify(updated));
                return updated;
            });
        }
    };

    // ─── Remove from Cart ─────────────────────────────────────────────────────
    const removeFromCart = async (productId) => {
        const token = getToken();

        if (token) {
            try {
                await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await fetchCart();
            } catch (err) {
                console.error("Remove from cart error:", err);
            }
        } else {
            setCartItems((prev) => {
                const updated = prev.filter((i) => i.id !== productId);
                localStorage.setItem("guestCart", JSON.stringify(updated));
                return updated;
            });
        }
    };

    // ─── Update Quantity ──────────────────────────────────────────────────────
    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) {
            return removeFromCart(productId);
        }

        const token = getToken();

        if (token) {
            try {
                await axios.put(
                    `http://localhost:5000/api/cart/${productId}`,
                    { quantity },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                await fetchCart();
            } catch (err) {
                console.error("Update quantity error:", err);
            }
        } else {
            setCartItems((prev) => {
                const updated = prev.map((i) =>
                    i.id === productId ? { ...i, quantity } : i
                );
                localStorage.setItem("guestCart", JSON.stringify(updated));
                return updated;
            });
        }
    };

    // ─── Clear Cart ───────────────────────────────────────────────────────────
    const clearCart = async () => {
        const token = getToken();
        if (token) {
            try {
                await axios.delete("http://localhost:5000/api/cart", {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (err) {
                console.error("Clear cart error:", err);
            }
        } else {
            localStorage.removeItem("guestCart");
        }
        setCartItems([]);
    };

    // ─── Derived values ───────────────────────────────────────────────────────
    const cartCount = cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const cartTotal = cartItems.reduce(
        (sum, i) => sum + (parseFloat(i.price) || 0) * (i.quantity || 1),
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                cartTotal,
                loading,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                fetchCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
