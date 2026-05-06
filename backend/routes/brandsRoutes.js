const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

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

// ===== CREATE NEW BRAND =====
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Brand name is required",
      });
    }

    // Check if brand already exists
    const [existing] = await db.query(
      `SELECT id FROM brands WHERE name = ?`,
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Brand with this name already exists",
      });
    }

    // Create slug from name
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [result] = await db.query(
      `INSERT INTO brands (name, description, slug) VALUES (?, ?, ?)`,
      [name.trim(), description?.trim() || null, slug]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name: name.trim(),
        description: description?.trim() || null,
        slug,
      },
      message: "Brand created successfully",
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create brand",
    });
  }
});

module.exports = router;
