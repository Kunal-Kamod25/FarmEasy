const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ POST /seller (create seller)
router.post("/", async (req, res) => {
    const { user_id, aadhaar_no, pan_no, gst_no } = req.body;

    if (!user_id || !aadhaar_no || !pan_no || !gst_no) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }

    const sql = `
    INSERT INTO seller (user_id, aadhaar_no, pan_no, gst_no)
    VALUES (?, ?, ?, ?)
  `;

    try {
        const [result] = await db.query(sql, [user_id, aadhaar_no, pan_no, gst_no]);
        res.status(201).json({
            success: true,
            message: "Seller created successfully",
            seller_id: result.insertId,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Seller creation failed",
            error: err.message,
        });
    }
});

// ✅ GET /seller (fetch all sellers)
router.get("/", async (req, res) => {
    const sql = `
    SELECT 
      seller.seller_id,
      users.full_name,
      seller.aadhaar_no,
      seller.pan_no,
      seller.gst_no
    FROM seller
    JOIN users ON seller.user_id = users.id
  `;

    try {
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

// ✅ GET /seller/user/:user_id (Check if user is a seller)
router.get("/user/:user_id", async (req, res) => {
    const { user_id } = req.params;
    const sql = "SELECT * FROM seller WHERE user_id = ?";

    try {
        const [result] = await db.query(sql, [user_id]);

        if (result.length > 0) {
            return res.json({ success: true, isSeller: true, seller: result[0] });
        } else {
            return res.json({ success: true, isSeller: false });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
    }
});

module.exports = router;
