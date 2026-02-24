// controllers/wishlistController.js
// Handles wishlist operations (MySQL + Express)

const db = require("../config/db"); // adjust path if different

/**
 * Toggle wishlist item
 * If product already exists → remove
 * If not → insert
 */
const toggleWishlist = async (req, res) => {
  const userId = req.user.id; // coming from auth middleware
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  try {
    // Check if product already exists
    const [existing] = await db.execute(
      "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (existing.length > 0) {
      // Remove from wishlist
      await db.execute(
        "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
        [userId, productId]
      );

      return res.status(200).json({
        success: true,
        message: "Removed from wishlist",
      });
    }

    // Insert into wishlist
    await db.execute(
      "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [userId, productId]
    );

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
    });

  } catch (error) {
    console.error("Wishlist Toggle Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/**
 * Get logged-in user's wishlist
 * Returns full product details using JOIN
 */
const getWishlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      `
      SELECT p.*
      FROM wishlist w
      INNER JOIN product p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });

  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  toggleWishlist,
  getWishlist,
};