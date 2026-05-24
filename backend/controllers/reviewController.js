// controllers/reviewController.js - Rating and review logic
const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');

/**
 * @desc    Create a review for a completed order
 * @route   POST /api/reviews
 * @access  Private (Buyer only)
 */
const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;

  if (!orderId || !rating || !comment) {
    res.status(400);
    throw new Error('Order ID, rating, and comment are required');
  }

  // Find and validate the order
  const order = await Order.findById(orderId).populate('service');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only the buyer of the order can review
  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the buyer can review this order');
  }

  // Order must be completed
  if (order.status !== 'completed') {
    res.status(400);
    throw new Error('Can only review completed orders');
  }

  // Prevent duplicate reviews
  if (order.isReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this order');
  }

  // Create the review
  const review = await Review.create({
    service: order.service._id,
    order: order._id,
    reviewer: req.user._id,
    seller: order.seller,
    rating: Number(rating),
    comment,
  });

  // Mark order as reviewed
  order.isReviewed = true;
  await order.save();

  const populatedReview = await Review.findById(review._id)
    .populate('reviewer', 'name profileImage')
    .populate('service', 'title');

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review: populatedReview,
  });
});

/**
 * @desc    Get all reviews for a service
 * @route   GET /api/reviews/service/:serviceId
 * @access  Public
 */
const getServiceReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Review.countDocuments({ service: req.params.serviceId });

  const reviews = await Review.find({ service: req.params.serviceId })
    .populate('reviewer', 'name profileImage college')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    reviews,
  });
});

/**
 * @desc    Get all reviews for a seller
 * @route   GET /api/reviews/seller/:sellerId
 * @access  Public
 */
const getSellerReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ seller: req.params.sellerId })
    .populate('reviewer', 'name profileImage')
    .populate('service', 'title')
    .sort('-createdAt')
    .limit(10);

  res.json({ success: true, reviews });
});

module.exports = { createReview, getServiceReviews, getSellerReviews };
