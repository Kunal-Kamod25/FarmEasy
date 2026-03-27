const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET all product categories
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM product_category"
        );
        res.json(rows);

    } catch (error) {
        console.error("❌ Error fetching categories:", error.message, error.code);
        return res.status(500).json({ 
            message: "Database error fetching categories",
            error: error.message,
            code: error.code
        });
    }
});

// GET subcategories based on category id
router.get("/:id/subcategories", async (req, res) => {
    try {
        const categoryId = req.params.id;

        const [rows] = await db.query(
            "SELECT * FROM product_subcategory WHERE category_id = ?",
            [categoryId]
        );

        res.json(rows);

    } catch (error) {
        console.error("❌ Error fetching subcategories:", error.message, error.code);
        return res.status(500).json({ 
            message: "Database error fetching subcategories",
            error: error.message,
            code: error.code
        });
    }
});

module.exports = router;