const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const verifyToken = require('../middleware/auth');

// Public route to get queries for a product
router.get('/:productId', queryController.getProductQueries);

// Protected routes
// Users can ask a question
router.post('/:productId', verifyToken, queryController.askQuery);

// Vendors can answer a question
router.patch('/:queryId/answer', verifyToken, queryController.answerQuery);

// Optional: Users can delete their own query
router.delete('/:queryId', verifyToken, queryController.deleteQuery);

module.exports = router;
