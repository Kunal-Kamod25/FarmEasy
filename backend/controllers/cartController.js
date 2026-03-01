// controllers/cartController.js
const db = require("../config/db");

// ─── GET CART (with full product info) ───────────────────────────────────────
const getCart = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute(
            `SELECT
         c.id         AS cart_id,
         c.quantity,
         p.id,
         p.product_name  AS name,
         p.price,
         p.product_description AS description,
         p.product_type  AS brand,
         p.product_quantity AS stock
       FROM cart c
       INNER JOIN product p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
            [userId]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─── ADD TO CART ──────────────────────────────────────────────────────────────
const addToCart = async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
        return res.status(400).json({ success: false, message: "Product ID required" });
    }

    try {
        const [existing] = await db.execute(
            "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
            [userId, productId]
        );

        if (existing.length > 0) {
            const newQty = existing[0].quantity + parseInt(quantity);
            await db.execute(
                "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
                [newQty, userId, productId]
            );
            return res.status(200).json({ success: true, message: "Cart updated", quantity: newQty });
        }

        await db.execute(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
            [userId, productId, quantity]
        );
        return res.status(201).json({ success: true, message: "Added to cart" });

    } catch (error) {
        console.error("Add to Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─── UPDATE QUANTITY ──────────────────────────────────────────────────────────
const updateCartItem = async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: "Valid quantity required" });
    }

    try {
        await db.execute(
            "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
            [quantity, userId, productId]
        );
        return res.status(200).json({ success: true, message: "Quantity updated" });
    } catch (error) {
        console.error("Update Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─── REMOVE FROM CART ─────────────────────────────────────────────────────────
const removeFromCart = async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.productId;

    try {
        await db.execute(
            "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
            [userId, productId]
        );
        return res.status(200).json({ success: true, message: "Item removed from cart" });
    } catch (error) {
        console.error("Remove from Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─── CLEAR CART ───────────────────────────────────────────────────────────────
const clearCart = async (req, res) => {
    const userId = req.user.id;
    try {
        await db.execute("DELETE FROM cart WHERE user_id = ?", [userId]);
        return res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (error) {
        console.error("Clear Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
