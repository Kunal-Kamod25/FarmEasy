// =====================================================
// EXCHANGE MESSAGE CONTROLLER
// =====================================================
// Handles chat and messaging between farmers
// Send messages, retrieve chat history, list conversations
// All real-time communication for exchange negotiations
// =====================================================

const ExchangeMatch = require("../models/ExchangeMatch");
const ExchangeMessage = require("../models/ExchangeMessage");

// ===== SEND CHAT MESSAGE =====
// POST /api/exchange/messages
// Farmer sends message to negotiate exchange details
exports.sendMessage = async (req, res) => {
  try {
    const { match_id, message } = req.body;
    const sender_id = req.user.id;

    // ===== VALIDATION =====
    if (!match_id || !message) {
      return res.status(400).json({ error: "Match ID and message required" });
    }

    // ===== VERIFY MATCH EXISTS & USER IS PART OF IT =====
    const match = await ExchangeMatch.findById(match_id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.proposer_id !== sender_id && match.receiver_id !== sender_id) {
      return res.status(403).json({
        error: "Not authorized to message this match",
      });
    }

    // ===== SAVE MESSAGE =====
    await ExchangeMessage.create(match_id, sender_id, message);

    res.json({ success: true, message: "Message sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== GET CHAT MESSAGES =====
// GET /api/exchange/messages/:matchId
// Load entire chat history for a match
exports.getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const user_id = req.user.id;

    // ===== VERIFY ACCESS =====
    const match = await ExchangeMatch.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.proposer_id !== user_id && match.receiver_id !== user_id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // ===== GET MESSAGES =====
    const messages = await ExchangeMessage.getByMatchId(matchId);

    // ===== MARK AS READ =====
    await ExchangeMessage.markAsRead(matchId, user_id);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== GET RECENT CHATS =====
// GET /api/exchange/chats
// Show farmer's conversation list (most recent first)
exports.getRecentChats = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { limit = 20 } = req.query;

    const chats = await ExchangeMessage.getRecentChats(user_id, limit);

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
