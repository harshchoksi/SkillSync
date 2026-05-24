// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getChatHistory, getConversations, saveMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getChatHistory);
router.post('/message', protect, saveMessage);

module.exports = router;
