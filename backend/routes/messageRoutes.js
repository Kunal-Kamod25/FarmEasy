// =====================================================
// MESSAGE/CHAT ROUTES
// =====================================================

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const messageController = require("../controllers/messageController");

// ===== GET CONVERSATIONS LIST (Protected) =====
router.get("/conversations", auth, messageController.getConversations);

// ===== START NEW CONVERSATION (Protected) =====
router.post("/conversation/start", auth, messageController.startConversation);

// ===== GET MESSAGES IN CONVERSATION (Protected) =====
router.get("/conversation/:conversationId", auth, messageController.getMessages);

// ===== ATTACHMENT UPLOAD (Protected) =====
router.post("/upload-attachment", auth, upload.single("attachment"), messageController.uploadAttachment);

// ===== SEND MESSAGE (Protected) =====
router.post("/send", auth, messageController.sendMessage);

// ===== DELETE MESSAGE (Protected) =====
router.delete("/:messageId", auth, messageController.deleteMessage);

module.exports = router;
