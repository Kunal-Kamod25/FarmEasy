// =====================================================
// VENDOR MESSAGES CONTROLLER
// =====================================================
// Handle farmer-vendor chat and messaging
// =====================================================

const db = require("../config/db");
const crypto = require("crypto");
const { emitNewMessage } = require("../socketManager");

// ===== GET CONVERSATIONS LIST =====
exports.getConversations = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let where = `WHERE (sender_id = ? OR receiver_id = ?)`;
    let params = [user_id, user_id];

    if (unreadOnly === "true") {
      where += ` AND is_read = false AND receiver_id = ?`;
      params = [user_id, user_id, user_id];
    }

    // Get unique conversations with last message
    const [conversations] = await db.query(
      `SELECT DISTINCT
        vm.conversation_id,
        CASE 
          WHEN vm.sender_id = ? THEN vm.receiver_id
          ELSE vm.sender_id
        END as other_user_id,
        (SELECT full_name FROM users WHERE id = 
          CASE 
            WHEN vm.sender_id = ? THEN vm.receiver_id
            ELSE vm.sender_id
          END) as other_user_name,
        (SELECT profile_pic FROM users WHERE id = 
          CASE 
            WHEN vm.sender_id = ? THEN vm.receiver_id
            ELSE vm.sender_id
          END) as other_user_pic,
        (SELECT message_text FROM vendor_messages 
         WHERE conversation_id = vm.conversation_id
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM vendor_messages 
         WHERE conversation_id = vm.conversation_id
         ORDER BY created_at DESC LIMIT 1) as last_message_time,
        COUNT(CASE WHEN is_read = false AND receiver_id = ? THEN 1 END) as unread_count
      FROM vendor_messages vm
      ${where}
      GROUP BY vm.conversation_id
      ORDER BY last_message_time DESC
      LIMIT ? OFFSET ?`,
      [...params, user_id, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== GET MESSAGES IN A CONVERSATION =====
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user_id = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user is part of this conversation
    const [verify] = await db.query(
      `SELECT id FROM vendor_messages 
       WHERE conversation_id = ? AND (sender_id = ? OR receiver_id = ?)
       LIMIT 1`,
      [conversationId, user_id, user_id]
    );

    if (verify.length === 0) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get messages
    const [messages] = await db.query(
      `SELECT 
        vm.id, vm.sender_id, vm.receiver_id, vm.message_text,
        vm.attachment_url, vm.is_read, vm.created_at,
        u.full_name as sender_name, u.profile_pic
      FROM vendor_messages vm
      LEFT JOIN users u ON vm.sender_id = u.id
      WHERE vm.conversation_id = ?
      ORDER BY vm.created_at DESC
      LIMIT ? OFFSET ?`,
      [conversationId, parseInt(limit), offset]
    );

    // Mark messages as read
    await db.query(
      `UPDATE vendor_messages 
       SET is_read = true
       WHERE conversation_id = ? AND receiver_id = ?`,
      [conversationId, user_id]
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== SEND MESSAGE =====
exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, product_id } = req.body;
    const { message_text, attachment_url } = req.body;
    const sender_id = req.user.id;

    if (!message_text && !attachment_url) {
      return res.status(400).json({ error: "Message or attachment required" });
    }

    // Generate conversation ID
    const conversationId = [sender_id, receiver_id]
      .sort()
      .join("_");

    // Insert message
    const [result] = await db.query(
      `INSERT INTO vendor_messages 
       (conversation_id, sender_id, receiver_id, product_id, message_text, attachment_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [conversationId, sender_id, receiver_id, product_id || null, message_text, attachment_url || null]
    );

    const newMessage = {
      id: result.insertId,
      conversation_id: conversationId,
      sender_id,
      receiver_id,
      product_id: product_id || null,
      message_text,
      attachment_url: attachment_url || null,
      created_at: new Date()
    };

    // Emit via socket
    emitNewMessage(newMessage);

    res.json({
      success: true,
      message: "Message sent",
      data: newMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== START OR GET CONVERSATION WITH VENDOR =====
exports.startConversation = async (req, res) => {
  try {
    const { vendor_id, product_id } = req.body;
    const user_id = req.user.id;

    if (vendor_id === user_id) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    // Generate conversation ID
    const conversationId = [user_id, vendor_id]
      .sort()
      .join("_");

    // Check if conversation exists
    const [existing] = await db.query(
      `SELECT conversation_id FROM vendor_messages 
       WHERE conversation_id = ?
       LIMIT 1`,
      [conversationId]
    );

    if (existing.length > 0) {
      // Conversation exists, just return it
      return res.json({
        success: true,
        data: { conversationId, isNew: false },
      });
    }

    // Create conversation with first message
    if (product_id) {
      const [product] = await db.query(
        `SELECT name FROM product WHERE id = ?`,
        [product_id]
      );

      if (product.length > 0) {
        await db.query(
          `INSERT INTO vendor_messages 
           (conversation_id, sender_id, receiver_id, product_id, message_text, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            conversationId,
            user_id,
            vendor_id,
            product_id,
            `Interested in ${product[0].name}. Can we discuss?`,
          ]
        );
      }
    }

    res.json({
      success: true,
      data: { conversationId, isNew: true },
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== DELETE MESSAGE =====
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const sender_id = req.user.id;

    const [result] = await db.query(
      `DELETE FROM vendor_messages 
       WHERE id = ? AND sender_id = ?`,
      [messageId, sender_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== MARK MESSAGE AS READ =====
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const receiver_id = req.user.id;

    const [result] = await db.query(
      `UPDATE vendor_messages 
       SET is_read = true 
       WHERE id = ? AND receiver_id = ?`,
      [messageId, receiver_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
