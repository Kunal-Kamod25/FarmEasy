const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ POST /seller (create seller)
router.post("/", (req, res) => {
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

  db.query(sql, [user_id, aadhaar_no, pan_no, gst_no], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Seller creation failed",
        error: err.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Seller created successfully",
      seller_id: result.insertId,
    });
  });
});

// ✅ GET /seller (fetch all sellers)
router.get("/", (req, res) => {
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

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
