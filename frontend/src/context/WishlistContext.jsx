import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);

    const getToken = () => localStorage.getItem("token");

    const fetchWishlist = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setWishlistItems([]);
            setWishlistCount(0);
            return;
        }
        try {
            const res = await axios.get("http://localhost:5000/api/wishlist", {
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
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = async (product) => {
        const token = getToken();
        if (!token) return;
        try {
            await axios.post(
                "http://localhost:5000/api/wishlist",
                { productId: product.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Re-fetch to update count
            await fetchWishlist();
            // Return new state
            return !wishlistItems.some((i) => i.id === product.id);
        } catch (err) {
            console.error("Wishlist toggle error:", err);
            return null;
        }
    };

    const isWishlisted = (productId) =>
        wishlistItems.some((i) => i.id === productId);

    return (
        <WishlistContext.Provider
            value={{ wishlistItems, wishlistCount, toggleWishlist, isWishlisted, fetchWishlist }}
        >
            {children}
        </WishlistContext.Provider>
    );
};
