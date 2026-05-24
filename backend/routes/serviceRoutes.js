// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getMyServices,
  getCategories,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { uploadService } = require('../config/cloudinary');

// Public routes
router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/:id', getService);

// Private routes
router.get('/seller/my-services', protect, getMyServices);
router.post('/', protect, authorize('seller', 'admin'), uploadService.single('serviceImage'), createService);
router.put('/:id', protect, uploadService.single('serviceImage'), updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;
