const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ===== GET ALL BRANDS =====
router.get("/", async (req, res) => {
  try {
    const [brands] = await db.query(
      `SELECT id, name, description, logo, slug FROM brands ORDER BY name ASC`
    );

    res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch brands",
    });
  }
});

// ===== GET BRAND BY ID =====
router.get("/:brandId", async (req, res) => {
  try {
    const { brandId } = req.params;

    const [brand] = await db.query(
      `SELECT * FROM brands WHERE id = ?`,
      [brandId]
    );

    if (brand.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Brand not found",
      });
    }

    res.json({
      success: true,
      data: brand[0],
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch brand",
    });
  }
});

module.exports = router;
