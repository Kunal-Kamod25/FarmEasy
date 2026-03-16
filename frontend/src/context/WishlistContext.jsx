/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from '../config';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);

    const getToken = () => localStorage.getItem("token");

    // ─── PID HELPER ──────────────────────────────────────────────────────────
    // normalize product id across different shapes (e.g. from DB or partial objects)
    const getPid = (product) => {
        if (!product) return null;
        return product.id || product.product_id || product._id;
    };

    const fetchWishlist = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setWishlistItems([]);
            setWishlistCount(0);
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/api/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const items = res.data.data || [];
            setWishlistItems(items);
            setWishlistCount(items.length);
        } catch (err) {
            console.error("Wishlist fetch error:", err);
        }
    }, []);

    useEffect(() => {
        if (getToken()) {
            fetchWishlist();
        }
    }, [fetchWishlist]);

    const toggleWishlist = async (product) => {
        const token = getToken();
        if (!token) return;
        try {
            const pid = getPid(product);
            if (!pid) return console.warn("toggleWishlist: product lacks ID", product);

            await axios.post(
                `${API_URL}/api/wishlist`,
                { productId: pid },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Re-fetch to update count
            await fetchWishlist();
            // Return new state
            return !wishlistItems.some((i) => getPid(i) === pid);
        } catch (err) {
            console.error("Wishlist toggle error:", err);
            return null;
        }
    };

    const isWishlisted = (productId) =>
        wishlistItems.some((i) => getPid(i) === productId);

    return (
        <WishlistContext.Provider
            value={{ wishlistItems, wishlistCount, toggleWishlist, isWishlisted, fetchWishlist }}
        >
            {children}
        </WishlistContext.Provider>
    );
};
