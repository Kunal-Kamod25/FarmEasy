/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { API_URL } from '../config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const getToken = () => localStorage.getItem("token");
    const toPidKey = (id) => (id === undefined || id === null ? null : String(id));
    const notifyAuthRequired = (message) => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("farmeasy:auth-required", { detail: { message } }));
        }
    };

    // ─── Fetch cart from backend (if logged in) ───────────────────────────────
    const fetchCart = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setCartItems([]);
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/cart`, {
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
    const getPid = useCallback((product) => product?.id || product?.product_id || product?._id, []);

    const addToCart = useCallback(async (product, quantity = 1) => {
        const token = getToken();
        const pid = getPid(product);
        if (!pid) return console.warn("addToCart called without valid product id", product);
        if (!token) {
            notifyAuthRequired("Please login to add items to your cart.");
            return false;
        }
        const pidKey = toPidKey(pid);
        const qtyToAdd = Math.max(1, Number.parseInt(quantity, 10) || 1);

        // Optimistic update for instant UI response.
        setCartItems((prev) => {
            const existing = prev.find((i) => toPidKey(getPid(i)) === pidKey);

            const normalizedProduct = {
                ...product,
                id: pid,
                name: product.name || product.product_name,
                description: product.description || product.product_description,
                price: product.price,
                image: product.image || product.product_image || product.img
            };

            if (existing) {
                return prev.map((i) =>
                    toPidKey(getPid(i)) === pidKey
                        ? { ...i, quantity: (Number(i.quantity) || 1) + qtyToAdd }
                        : i
                );
            }

            return [...prev, { ...normalizedProduct, quantity: qtyToAdd }];
        });

        try {
            await axios.post(
                `${API_URL}/api/cart`,
                { productId: pid, quantity: qtyToAdd },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Add to cart error:", err);
            await fetchCart();
        }
    }, [fetchCart, getPid]);

    // ─── Remove from Cart ─────────────────────────────────────────────────────
    const removeFromCart = useCallback(async (productId) => {
        const token = getToken();
        if (!token) return;
        const pidKey = toPidKey(productId);

        if (token) {
            setCartItems((prev) => prev.filter((i) => toPidKey(getPid(i)) !== pidKey));
            try {
                await axios.delete(`${API_URL}/api/cart/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (err) {
                console.error("Remove from cart error:", err);
                await fetchCart();
            }
        }
    }, [fetchCart, getPid]);

    // ─── Update Quantity ──────────────────────────────────────────────────────
    const updateQuantity = useCallback(async (productId, quantity) => {
        if (quantity < 1) {
            return removeFromCart(productId);
        }

        const token = getToken();
        if (!token) return;
        const pidKey = toPidKey(productId);

        if (token) {
            setCartItems((prev) =>
                prev.map((i) =>
                    toPidKey(getPid(i)) === pidKey ? { ...i, quantity } : i
                )
            );
            try {
                await axios.put(
                    `${API_URL}/api/cart/${productId}`,
                    { quantity },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Update quantity error:", err);
                await fetchCart();
            }
        }
    }, [fetchCart, getPid, removeFromCart]);

    // ─── Clear Cart ───────────────────────────────────────────────────────────
    const clearCart = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setCartItems([]);
            return;
        }
        setCartItems([]);

        if (token) {
            try {
                await axios.delete(`${API_URL}/api/cart`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (err) {
                console.error("Clear cart error:", err);
                await fetchCart();
            }
        }
    }, [fetchCart]);

    // ─── Derived values ───────────────────────────────────────────────────────
    const cartCount = useMemo(
        () => cartItems.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0),
        [cartItems]
    );
    const cartTotal = useMemo(
        () => cartItems.reduce(
            (sum, i) => sum + (parseFloat(i.price) || 0) * (Number(i.quantity) || 1),
            0
        ),
        [cartItems]
    );

    const value = useMemo(
        () => ({
            cartItems,
            cartCount,
            cartTotal,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            fetchCart,
        }),
        [
            cartItems,
            cartCount,
            cartTotal,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            fetchCart,
        ]
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
