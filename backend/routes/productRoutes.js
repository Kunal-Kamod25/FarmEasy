const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ✅ GET PRODUCTS BY CATEGORY
router.get("/category/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT p.*, pc.product_cat_name 
      FROM product p
      JOIN product_category pc ON p.category_id = pc.id
      WHERE p.category_id = ?
      `,
      [categoryId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Database error" });
  }
});


// ✅ GET PRODUCTS BY SUBCATEGORY
router.get("/subcategory/:id", async (req, res) => {
  try {
    const subcategoryId = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM product WHERE subcategory_id = ?",
      [subcategoryId]
    );

    res.json(rows);

  } catch (error) {
    console.error("Error fetching subcategory products:", error);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;