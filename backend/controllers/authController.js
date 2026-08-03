// controllers/authController.js - Authentication logic
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Only allow buyer or seller roles on registration (not admin)
  const userRole = role === 'seller' ? 'seller' : 'buyer';

  // Create user (password hashing handled in model pre-save hook)
  const user = await User.create({ name, email, password, role: userRole });

  // Generate token and respond
  const token = user.generateToken();

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      bio: user.bio,
      skills: user.skills,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user and include password field (excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = user.generateToken();

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      bio: user.bio,
      skills: user.skills,
    },
  });
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    user,
  });
});

/**
 * @desc    Authenticate with Google OAuth 2.0
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = asyncHandler(async (req, res) => {
  const { credential, role, mode } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Google credential token is required');
  }

  // Only allow buyer or seller roles (not admin) — default to buyer
  const userRole = role === 'seller' ? 'seller' : 'buyer';

  // Verify the Google ID token server-side
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    res.status(401);
    throw new Error('Invalid Google token');
  }

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture, email_verified } = payload;

  // Reject if email is not verified by Google
  if (!email_verified) {
    res.status(401);
    throw new Error('Google email is not verified');
  }

  let user;

  // (a) Existing user with matching googleId → log them in
  user = await User.findOne({ googleId });

  if (!user) {
    // (b) Existing user with matching email but no googleId → link accounts
    user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Link Google to existing local account
      user.googleId = googleId;
      user.avatar = user.avatar || picture || '';
      // Keep existing authProvider if already 'local' — user can still use password
      await user.save();
    } else if (mode === 'login') {
      // Login mode: no account exists → reject, don't auto-create
      res.status(404);
      throw new Error('No account found with this Google email. Please sign up first.');
    } else {
      // (c) Register mode: no match → create new Google user
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
        authProvider: 'google',
        role: userRole,
      });
    }
  }

  // Generate JWT (same as /login)
  const token = user.generateToken();

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
    },
  });
});

module.exports = { register, login, getMe, googleAuth };
