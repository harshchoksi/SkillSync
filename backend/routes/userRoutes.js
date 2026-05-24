// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProfile } = require('../config/cloudinary');

// Public
router.get('/:id', getUserProfile);

// Private
router.put('/profile', protect, uploadProfile.single('profileImage'), updateProfile);
router.put('/password', protect, changePassword);

// Admin only
router.get('/', protect, authorize('admin'), getAllUsers);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
