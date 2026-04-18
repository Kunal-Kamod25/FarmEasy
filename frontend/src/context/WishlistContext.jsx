/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { API_URL } from '../config';
import { isTokenExpired, clearAuthData } from '../utils/tokenUtils';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);

    const getToken = () => {
        const token = localStorage.getItem("token");
        // Check if token has expired
        if (token && isTokenExpired(token)) {
            console.warn("✅ Token expired, clearing auth data");
            clearAuthData();
            return null;
        }
        return token;
    };
    const toPidKey = (id) => (id === undefined || id === null ? null : String(id));
    const notifyAuthRequired = (message) => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("farmeasy:auth-required", { detail: { message } }));
        }
    };

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
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/api/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const items = res.data.data || [];
            setWishlistItems(items);
        } catch (err) {
            console.error("Wishlist fetch error:", err);
        }
    }, []);

    useEffect(() => {
        if (getToken()) {
            fetchWishlist();
        }
    }, [fetchWishlist]);

    const wishlistKeys = useMemo(
        () => new Set(wishlistItems.map((i) => toPidKey(getPid(i))).filter(Boolean)),
        [wishlistItems]
    );

    const toggleWishlist = useCallback(async (product) => {
        const token = getToken();
        if (!token) {
            notifyAuthRequired("Please login to save products to your wishlist.");
            return false;
        }
        try {
            const pid = getPid(product);
            if (!pid) return console.warn("toggleWishlist: product lacks ID", product);
            const pidKey = toPidKey(pid);
            const currentlyWishlisted = wishlistKeys.has(pidKey);

            // Optimistic update for immediate heart toggle feedback.
            setWishlistItems((prev) => {
                if (currentlyWishlisted) {
                    return prev.filter((i) => toPidKey(getPid(i)) !== pidKey);
                }

                return [
                    {
                        id: pid,
                        product_name: product.product_name || product.name,
                        product_image: product.product_image || product.image || product.img,
                        price: product.price,
                    },
                    ...prev,
                ];
            });

            await axios.post(
                `${API_URL}/api/wishlist`,
                { productId: pid },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return !currentlyWishlisted;
        } catch (err) {
            console.error("Wishlist toggle error:", err);
            await fetchWishlist();
            return null;
        }
    }, [fetchWishlist, wishlistKeys]);

    const isWishlisted = useCallback(
        (productId) => wishlistKeys.has(toPidKey(productId)),
        [wishlistKeys]
    );

    const wishlistCount = wishlistItems.length;

    const value = useMemo(
        () => ({ wishlistItems, wishlistCount, toggleWishlist, isWishlisted, fetchWishlist }),
        [wishlistItems, wishlistCount, toggleWishlist, isWishlisted, fetchWishlist]
    );

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
