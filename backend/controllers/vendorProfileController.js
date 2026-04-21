const db = require("../config/db");
const s3 = require("../config/s3");

// ===========================================================================
// GET VENDOR PROFILE
// ===========================================================================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(`
      SELECT 
        u.id,
        u.full_name as vendor_name,
        u.email,
        u.phone_number as phone,
        u.address,
        u.city,
        u.state,
        u.pincode,
        u.created_at,
        u.bio,
        u.profile_pic as profile_image,
        s.shop_name as store_name,
        s.gst_no as gst_number,
        s.id as seller_id
      FROM users u
      LEFT JOIN seller s ON s.user_id = u.id
      WHERE u.id = ?
    `, [userId]);

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = rows[0];

    const [[orderStats]] = await db.query(
      `SELECT 
         COUNT(*) as total_orders,
         COALESCE(SUM(total_price), 0) as total_spent
       FROM orders
       WHERE user_id = ?`,
      [userId]
    );

    const profileVerified = Boolean(
      profile.vendor_name &&
      profile.phone &&
      profile.address &&
      profile.city &&
      profile.state &&
      profile.pincode &&
      profile.store_name
    );

    res.json({
      ...profile,
      total_orders: Number(orderStats.total_orders || 0),
      total_spent: Number(orderStats.total_spent || 0),
      account_status: {
        profile_verified: profileVerified,
        email_verified: Boolean(profile.email),
        gst_submitted: Boolean(profile.gst_number)
      }
    });

  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Server error fetching vendor profile" });
  }
};

// ===========================================================================
// GET ALL VENDORS (List for messaging discovery)
// ===========================================================================
exports.getVendorList = async (req, res) => {
  try {
    const [vendors] = await db.query(`
      SELECT 
        u.id,
        u.full_name as vendor_name,
        u.profile_pic as profile_image,
        s.shop_name as store_name,
        u.city,
        u.state
      FROM users u
      JOIN seller s ON s.user_id = u.id
      WHERE u.role = 'vendor'
      ORDER BY s.shop_name ASC
    `);

    res.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    console.error("getVendorList error:", error);
    res.status(500).json({ success: false, message: "Server error fetching vendor list" });
  }
};

// ===========================================================================
// UPDATE VENDOR PROFILE
// ===========================================================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      vendor_name, email, phone, address, city, state, pincode,
      bio, store_name, gst_number
    } = req.body;

    // S3Storage middleware uploads to S3 and req.file.path is the full S3 URL
    const profilePic = req.file ? req.file.path : null;

    // If uploading new profile pic, delete old one from S3
    if (profilePic) {
      try {
        const [userRows] = await db.query(
          "SELECT profile_pic FROM users WHERE id = ?",
          [userId]
        );
        
        if (userRows.length > 0 && userRows[0].profile_pic) {
          const oldImageUrl = userRows[0].profile_pic;
          const s3Key = extractS3KeyFromUrl(oldImageUrl);
          
          s3.deleteObject(
            {
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: s3Key
            },
            (error) => {
              if (error) {
                console.error("S3 Delete Error for old profile pic:", error);
              }
            }
          );
        }
      } catch (error) {
        console.error("Error getting old profile pic:", error);
        // Continue with update even if delete fails
      }
    }

    // Update users table with personal info
    if (profilePic) {
      await db.query(`
        UPDATE users 
        SET full_name = ?, phone_number = ?, address = ?, city = ?, state = ?, pincode = ?, bio = ?, profile_pic = ?
        WHERE id = ?
      `, [
        vendor_name || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        bio || null,
        profilePic,
        userId
      ]);
    } else {
      await db.query(`
        UPDATE users 
        SET full_name = ?, phone_number = ?, address = ?, city = ?, state = ?, pincode = ?, bio = ?
        WHERE id = ?
      `, [
        vendor_name || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        bio || null,
        userId
      ]);
    }

    // Check if seller record exists
    const [seller] = await db.query("SELECT id FROM seller WHERE user_id = ?", [userId]);

    if (seller.length) {
      // Update existing seller record
      await db.query(`
        UPDATE seller 
        SET shop_name = ?, gst_no = ?
        WHERE user_id = ?
      `, [store_name || null, gst_number || null, userId]);
    } else {
      // Create seller record if it doesn't exist
      await db.query(`
        INSERT INTO seller (user_id, shop_name, gst_no) VALUES (?, ?, ?)
      `, [userId, store_name || null, gst_number || null]);
    }

    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

// ===========================================================================
// HELPER FUNCTION: Extract S3 key from full S3 URL
// ===========================================================================
function extractS3KeyFromUrl(url) {
  try {
    const parts = url.split('.amazonaws.com/');
    if (parts.length > 1) {
      return parts[1]; // Returns: farmeasy/filename.jpg
    }
    return url;
  } catch (error) {
    console.error("Error extracting S3 key:", error);
    return url;
  }
}
