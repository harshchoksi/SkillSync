// controllers/userController.js - User profile and admin operations
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Service = require('../models/Service');
const Review = require('../models/Review');

/**
 * @desc    Get user public profile
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Fetch user's active services
  const services = await Service.find({ seller: user._id, isActive: true })
    .sort('-createdAt')
    .limit(10);

  // Fetch user's received reviews
  const reviews = await Review.find({ seller: user._id })
    .populate('reviewer', 'name profileImage')
    .populate('service', 'title')
    .sort('-createdAt')
    .limit(5);

  res.json({
    success: true,
    user,
    services,
    reviews,
  });
});

/**
 * @desc    Update own profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, skills, college, github, linkedin, portfolio, role } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update fields if provided
  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
  if (college !== undefined) user.college = college;
  if (github !== undefined) user.github = github;
  if (linkedin !== undefined) user.linkedin = linkedin;
  if (portfolio !== undefined) user.portfolio = portfolio;

  // Allow switching between buyer and seller roles
  if (role && ['buyer', 'seller'].includes(role)) user.role = role;

  // If profile image was uploaded via Cloudinary
  if (req.file) {
    user.profileImage = req.file.path;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/users/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

// ============ ADMIN CONTROLLERS ============

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find().select('-password').sort('-createdAt').skip(skip).limit(limit);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    users,
  });
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  await user.deleteOne();

  res.json({ success: true, message: 'User deleted successfully' });
});

module.exports = { getUserProfile, updateProfile, changePassword, getAllUsers, deleteUser };
