const db = require("../config/db");

const mapProfileRow = (row) => {
  const fullName = (row.full_name || "").trim();
  const phone = (row.phone_number || "").trim();
  const address = (row.address || "").trim();
  const city = (row.city || "").trim();
  const state = (row.state || "").trim();
  const pincode = (row.pincode || "").trim();

  const profileVerified = Boolean(fullName && phone && address && city && state && pincode);

  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone_number: row.phone_number,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    bio: row.bio,
    role: row.role,
    created_at: row.created_at,
    total_orders: Number(row.total_orders || 0),
    total_spent: Number(row.total_spent || 0),
    verification: {
      profile_verified: profileVerified,
      email_verified: Boolean(row.email),
      phone_verified: Boolean(phone)
    }
  };
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullname, phone, address, city, state, pincode, bio } = req.body;

    // Simple mandatory database rule for profile completeness.
    if (!fullname || !phone) {
      return res.status(400).json({
        message: "Full name and phone number are required."
      });
    }

    const sql = `
      UPDATE users 
      SET full_name = ?, 
          phone_number = ?, 
          address = ?, 
          city = ?, 
          state = ?, 
          pincode = ?, 
          bio = ? 
      WHERE id = ?
    `;

    const [result] = await db.execute(sql, [
      fullname,
      phone || null,
      address || null,
      city || null,
      state || null,
      pincode || null,
      bio || null,
      userId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Profile updated successfully!" });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error during profile update." });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT 
         u.id,
         u.full_name,
         u.email,
         u.phone_number,
         u.address,
         u.city,
         u.state,
         u.pincode,
         u.bio,
         u.role,
         u.created_at,
         (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS total_orders,
         (SELECT COALESCE(SUM(o.total_price), 0) FROM orders o WHERE o.user_id = u.id) AS total_spent
       FROM users u
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(mapProfileRow(rows[0]));
  } catch (error) {
    console.error("Get My Profile Error:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const requestedUserId = Number.parseInt(req.params.userId, 10);
    const authUserId = req.user.id;

    if (!requestedUserId || requestedUserId !== authUserId) {
      return res.status(403).json({ message: "Access denied." });
    }

    const [rows] = await db.execute(
      `SELECT 
         u.id,
         u.full_name,
         u.email,
         u.phone_number,
         u.address,
         u.city,
         u.state,
         u.pincode,
         u.bio,
         u.role,
         u.created_at,
         (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS total_orders,
         (SELECT COALESCE(SUM(o.total_price), 0) FROM orders o WHERE o.user_id = u.id) AS total_spent
       FROM users u
       WHERE u.id = ?`,
      [requestedUserId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(mapProfileRow(rows[0]));

  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};