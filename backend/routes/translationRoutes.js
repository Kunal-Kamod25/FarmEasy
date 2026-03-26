const express = require("express");
const translationController = require("../controllers/translationController");

const router = express.Router();

// GET /api/translations/:languageCode - Get translated strings for a language
router.get("/:languageCode", translationController.getTranslations);

// GET /api/translations/list - Get all supported languages
router.get("/languages/list", translationController.getSupportedLanguages);

module.exports = router;
