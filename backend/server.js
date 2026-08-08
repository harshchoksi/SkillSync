// server.js - Main entry point for SkillSync backend
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const Message = require('./models/Message');
const { getRoomId } = require('./controllers/chatController');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });
// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app); // HTTP server for Socket.io

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://skill-sync-xi-opal.vercel.app',
  'https://skillsync-niym.onrender.com',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SkillSync API is running 🚀' });
});

// ─── SERVE FRONTEND (Production) ──────────────────────────────────────────────
const path = require('path');
const fs = require('fs');

const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendBuildPath)) {
  // Serve static files from React build (only if build exists)
  app.use(express.static(frontendBuildPath));

  // All non-API routes → React app (client-side routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // No frontend build present (frontend hosted separately on Vercel) or dev mode
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });
}

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── SOCKET.IO SETUP ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Track online users: userId → socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User registers their socket with their userId
  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log(`👤 User online: ${userId}`);
  });

  // Join a specific chat room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`🚪 Socket ${socket.id} joined room: ${room}`);
  });

  // Handle sending a message
  socket.on('send_message', async (data) => {
    const { senderId, receiverId, content, orderId } = data;

    try {
      // Persist message to MongoDB
      const room = getRoomId(senderId, receiverId);
      const message = await Message.create({
        room,
        sender: senderId,
        receiver: receiverId,
        content,
        order: orderId || null,
      });

      const populated = await Message.findById(message._id).populate(
        'sender',
        'name profileImage'
      );

      // Emit to everyone in the room (including sender for confirmation)
      io.to(room).emit('receive_message', populated);

      // If receiver is not in room, send notification via their socket
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message_notification', {
          from: senderId,
          room,
          content,
        });
      }
    } catch (err) {
      console.error('❌ Socket message error:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicators
  socket.on('typing', ({ room, userId }) => {
    socket.to(room).emit('user_typing', { userId });
  });

  socket.on('stop_typing', ({ room, userId }) => {
    socket.to(room).emit('user_stop_typing', { userId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove user from online map
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`👤 User offline: ${userId}`);
        break;
      }
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 SkillSync server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});
