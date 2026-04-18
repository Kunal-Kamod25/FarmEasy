// =====================================================
// Exchange Routes
// =====================================================
// All API endpoints for crop exchange feature
// Split into 3 controllers for better organization
// =====================================================

const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const exchangeListingController = require("../controllers/exchangeListingController");
const exchangeMatchController = require("../controllers/exchangeMatchController");
const exchangeMessageController = require("../controllers/exchangeMessageController");

const router = express.Router();

// ===== IMAGE UPLOAD (Protected) =====

/**
 * Upload single exchange listing image to S3
 * POST /api/exchange/upload-image
 * Field name: "exchange_image"
 */
router.post("/upload-image", auth, upload.single("exchange_image"), exchangeListingController.uploadImage);

// ===== PUBLIC ROUTES (No login required) =====

/**
 * Browse all available exchange listings nearby
 * GET /api/exchange/browse?latitude=28.123&longitude=77.456&crop=rice
 */
router.get("/browse", exchangeListingController.browseNearby);

/**
 * Get details of a specific listing
 * GET /api/exchange/:id
 */
router.get("/:id", exchangeListingController.getListing);

/**
 * Get trending crops (what farmers want most)
 * GET /api/exchange/trending
 */
router.get("/trending", async (req, res) => {
  try {
    const CropExchange = require("../models/CropExchange");
    const trending = await CropExchange.getTrendingCrops();
    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== LISTING MANAGEMENT (Protected) =====

/**
 * Create a new exchange listing
 * POST /api/exchange/create
 */
router.post("/create", auth, exchangeListingController.createListing);

/**
 * Update an existing listing
 * PATCH /api/exchange/:id
 */
router.patch("/:id", auth, exchangeListingController.updateListing);

/**
 * Delete a listing
 * DELETE /api/exchange/:id
 */
router.delete("/:id", auth, exchangeListingController.deleteListing);

/**
 * Get user's own listings
 * GET /api/exchange/my/listings
 */
router.get("/my/listings", auth, exchangeListingController.getMyListings);

// ===== MATCH PROPOSALS (Protected) =====

/**
 * Propose a match with another farmer's listing
 * POST /api/exchange/propose
 */
router.post("/propose", auth, exchangeMatchController.proposeMatch);

/**
 * Get all proposals received by this farmer
 * GET /api/exchange/matches/received
 */
router.get("/matches/received", auth, exchangeMatchController.getReceivedMatches);

/**
 * Get all proposals sent by this farmer
 * GET /api/exchange/matches/sent
 */
router.get("/matches/sent", auth, exchangeMatchController.getSentMatches);

/**
 * Accept a proposal (move to chat/negotiation phase)
 * PATCH /api/exchange/match/:matchId/accept
 */
router.patch("/match/:matchId/accept", auth, exchangeMatchController.acceptMatch);

/**
 * Reject a proposal
 * PATCH /api/exchange/match/:matchId/reject
 */
router.patch("/match/:matchId/reject", auth, exchangeMatchController.rejectMatch);

/**
 * Mark exchange as completed
 * PATCH /api/exchange/match/:matchId/complete
 */
router.patch("/match/:matchId/complete", auth, exchangeMatchController.completeExchange);

/**
 * Get user's exchange statistics and dashboard info
 * GET /api/exchange/stats
 */
router.get("/stats", auth, exchangeMatchController.getStats);

// ===== CHAT & MESSAGING (Protected) =====

/**
 * Send a message in a match conversation
 * POST /api/exchange/messages
 */
router.post("/messages", auth, exchangeMessageController.sendMessage);

/**
 * Get all messages for a specific match conversation
 * GET /api/exchange/messages/:matchId
 */
router.get("/messages/:matchId", auth, exchangeMessageController.getMessages);

/**
 * Get recent chats (conversation list)
 * GET /api/exchange/chats
 */
router.get("/chats", auth, exchangeMessageController.getRecentChats);

module.exports = router;
