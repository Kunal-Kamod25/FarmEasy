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

    // Get unique conversations with last message using a cleaner join approach
    const [conversations] = await db.query(
      `SELECT 
        m1.conversation_id,
        CASE 
          WHEN m1.sender_id = ? THEN m1.receiver_id
          ELSE m1.sender_id
        END as other_user_id,
        u.full_name as other_user_name,
        u.profile_pic as other_user_pic,
        m1.message_text as last_message,
        m1.created_at as last_message_time,
        (SELECT COUNT(*) FROM vendor_messages 
         WHERE conversation_id = m1.conversation_id 
         AND is_read = false AND receiver_id = ?) as unread_count
      FROM vendor_messages m1
      JOIN (
        SELECT conversation_id, MAX(created_at) as max_created
        FROM vendor_messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY conversation_id
      ) m2 ON m1.conversation_id = m2.conversation_id AND m1.created_at = m2.max_created
      JOIN users u ON u.id = (
        CASE 
          WHEN m1.sender_id = ? THEN m1.receiver_id
          ELSE m1.sender_id
        END
      )
      ORDER BY last_message_time DESC
      LIMIT ? OFFSET ?`,
      [user_id, user_id, user_id, user_id, user_id, parseInt(limit), offset]
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
    } else {
      // Always insert a "Chat started" message if it's new so it shows up in conversation lists
      await db.query(
        `INSERT INTO vendor_messages 
         (conversation_id, sender_id, receiver_id, message_text, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [conversationId, user_id, vendor_id, "Hello! I'd like to chat about your products."]
      );
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
// ===== UPLOAD ATTACHMENT =====
exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      success: true,
      data: {
        url: req.file.path,
        filename: req.file.filename,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
