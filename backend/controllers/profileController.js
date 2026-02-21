const db = require("../config/db");

exports.updateProfile = async (req, res) => {
    try {
        const { userId, fullname, phone, address, city, state, pincode, bio } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
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

exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = rows[0];
        // Don't send password hash
        delete user.password_hash;

        res.status(200).json(user);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Server error fetching profile." });
    }
};
