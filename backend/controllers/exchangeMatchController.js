// =====================================================
// EXCHANGE MATCH CONTROLLER
// =====================================================
// Handles proposal matching and farm exchange operations
// Propose, accept, reject proposals, complete exchanges
// Dashboard stats and activity tracking
// =====================================================

const ExchangeMatch = require("../models/ExchangeMatch");
const CropExchange = require("../models/CropExchange");

// ===== PROPOSE AN EXCHANGE =====
// POST /api/exchange/propose
// Farmer B says "I want to exchange with Farmer A's listing"
exports.proposeMatch = async (req, res) => {
  try {
    const { exchange_listing_id, match_reason } = req.body;
    const proposer_id = req.user.id;

    // ===== VALIDATION =====
    if (!exchange_listing_id) {
      return res.status(400).json({ error: "Listing ID required" });
    }

    // ===== GET LISTING & RECEIVER =====
    const listing = await CropExchange.findById(exchange_listing_id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const receiver_id = listing.user_id;

    // ===== PREVENT SELF-PROPOSAL =====
    if (proposer_id === receiver_id) {
      return res.status(400).json({
        error: "Cannot propose to your own listing",
      });
    }

    // ===== PREVENT DUPLICATE PROPOSALS =====
    const alreadyExists = await ExchangeMatch.checkExists(
      exchange_listing_id,
      proposer_id
    );
    if (alreadyExists) {
      return res.status(400).json({
        error: "You already have an active proposal for this listing",
      });
    }

    // ===== CREATE MATCH PROPOSAL =====
    const matchId = await ExchangeMatch.create({
      exchange_listing_id,
      proposer_id,
      receiver_id,
      match_reason,
    });

    res.json({
      success: true,
      message: "Proposal sent! Other farmer will review it.",
      matchId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== ACCEPT A MATCH PROPOSAL =====
// PATCH /api/exchange/match/:matchId/accept
// Farmer A accepts Farmer B's proposal - moves to negotiation phase
exports.acceptMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const user_id = req.user.id;

    // ===== VERIFY OWNERSHIP =====
    const match = await ExchangeMatch.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.receiver_id !== user_id) {
      return res.status(403).json({
        error: "Only listing owner can accept/reject proposals",
      });
    }

    // ===== UPDATE STATUS =====
    await ExchangeMatch.updateStatus(matchId, "accepted");

    // ===== Update listing status to 'matched' =====
    await CropExchange.updateStatus(match.exchange_listing_id, "matched");

    res.json({
      success: true,
      message: "Proposal accepted! Now chat to finalize details.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== REJECT A MATCH PROPOSAL =====
// PATCH /api/exchange/match/:matchId/reject
// Farmer A rejects Farmer B's proposal
exports.rejectMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const user_id = req.user.id;

    // ===== VERIFY OWNERSHIP =====
    const match = await ExchangeMatch.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.receiver_id !== user_id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // ===== UPDATE STATUS =====
    await ExchangeMatch.updateStatus(matchId, "rejected");

    res.json({ success: true, message: "Proposal rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== FINALIZE/COMPLETE EXCHANGE =====
// PATCH /api/exchange/match/:matchId/complete
// Both farmers have exchanged goods, mark as complete
exports.completeExchange = async (req, res) => {
  try {
    const { matchId } = req.params;
    const user_id = req.user.id;

    // ===== VERIFY USER IS PART OF THIS MATCH =====
    const match = await ExchangeMatch.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.proposer_id !== user_id && match.receiver_id !== user_id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // ===== UPDATE STATUS =====
    await ExchangeMatch.updateStatus(matchId, "completed");

    res.json({
      success: true,
      message: "Exchange marked complete! You can now leave a review.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== GET RECEIVED PROPOSALS =====
// GET /api/exchange/matches/received
// Farmer sees all proposals made to their listings
exports.getReceivedMatches = async (req, res) => {
  try {
    const user_id = req.user.id;

    const matches = await ExchangeMatch.getReceivedMatches(user_id);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== GET SENT PROPOSALS =====
// GET /api/exchange/matches/sent
// Farmer sees all proposals they've sent
exports.getSentMatches = async (req, res) => {
  try {
    const user_id = req.user.id;

    const matches = await ExchangeMatch.getSentMatches(user_id);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== GET DASHBOARD STATS =====
// GET /api/exchange/stats
// Show exchange activity stats on farmer's dashboard
exports.getStats = async (req, res) => {
  try {
    const user_id = req.user.id;

    const stats = await ExchangeMatch.getStats(user_id);
    const listings = await CropExchange.getByUserId(user_id);
    const trending = await CropExchange.getTrendingCrops();

    res.json({
      ...stats,
      my_active_listings: listings.filter((l) => l.status === "open").length,
      trending_crops: trending,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
