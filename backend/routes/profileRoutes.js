const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const verifyToken = require("../middleware/auth");

router.get("/me", verifyToken, profileController.getMyProfile);
router.put("/update", verifyToken, profileController.updateProfile);

// Backward-compatible route: still protected and only allows self access.
router.get("/:userId", verifyToken, profileController.getProfile);

module.exports = router;