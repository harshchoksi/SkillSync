// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const {
  createReview,
  getServiceReviews,
  getSellerReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/service/:serviceId', getServiceReviews);
router.get('/seller/:sellerId', getSellerReviews);

module.exports = router;
