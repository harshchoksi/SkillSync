// controllers/chatController.js - Chat message persistence
const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

/**
 * Generate a consistent room ID from two user IDs
 * Ensures same room regardless of who initiates
 */
const getRoomId = (userId1, userId2) => {
  return [userId1.toString(), userId2.toString()].sort().join('_');
};

/**
 * @desc    Get chat history between two users
 * @route   GET /api/chat/:userId
 * @access  Private
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const room = getRoomId(req.user._id, req.params.userId);

  const messages = await Message.find({ room })
    .populate('sender', 'name profileImage')
    .sort('createdAt')
    .limit(100);

  // Mark messages as read
  await Message.updateMany(
    { room, receiver: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, messages, room });
});

/**
 * @desc    Get list of users the current user has chatted with
 * @route   GET /api/chat/conversations
 * @access  Private
 */
const getConversations = asyncHandler(async (req, res) => {
  // Find all rooms this user is part of
  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }],
  })
    .sort('-createdAt')
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage');

  // Group by room, keep latest message per conversation
  const conversationsMap = new Map();
  messages.forEach((msg) => {
    if (!conversationsMap.has(msg.room)) {
      conversationsMap.set(msg.room, msg);
    }
  });

  // Count unread messages per room
  const unreadCounts = await Message.aggregate([
    { $match: { receiver: req.user._id, isRead: false } },
    { $group: { _id: '$room', count: { $sum: 1 } } },
  ]);

  const unreadMap = new Map(unreadCounts.map((u) => [u._id, u.count]));

  const conversations = Array.from(conversationsMap.values()).map((msg) => ({
    room: msg.room,
    lastMessage: msg,
    unreadCount: unreadMap.get(msg.room) || 0,
    otherUser:
      msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender,
  }));

  res.json({ success: true, conversations });
});

/**
 * @desc    Save a message (also called by Socket.io handler)
 * @route   POST /api/chat/message
 * @access  Private
 */
const saveMessage = asyncHandler(async (req, res) => {
  const { receiverId, content, orderId } = req.body;

  if (!receiverId || !content) {
    res.status(400);
    throw new Error('Receiver and content are required');
  }

  const room = getRoomId(req.user._id, receiverId);

  const message = await Message.create({
    room,
    sender: req.user._id,
    receiver: receiverId,
    content,
    order: orderId || null,
  });

  const populated = await Message.findById(message._id).populate('sender', 'name profileImage');

  res.status(201).json({ success: true, message: populated });
});

module.exports = { getChatHistory, getConversations, saveMessage, getRoomId };
