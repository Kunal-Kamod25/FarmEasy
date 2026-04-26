const db = require("../config/db");

exports.deleteMessage = async (req, res) => {
  try {
    const messageId = Number.parseInt(req.params.messageId, 10);

    if (!messageId) {
      return res.status(400).json({ message: "Invalid message id" });
    }

    const [rows] = await db.query(
      "SELECT id, sender_id FROM vendor_messages WHERE id = ?",
      [messageId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (Number(rows[0].sender_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.query("DELETE FROM vendor_messages WHERE id = ?", [messageId]);

    return res.json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Vendor message delete error:", error);
    return res.status(500).json({ message: "Failed to delete message" });
  }
};