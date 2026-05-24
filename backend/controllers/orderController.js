// controllers/orderController.js - Order/booking management
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Service = require('../models/Service');

/**
 * @desc    Place a new order (hire a service)
 * @route   POST /api/orders
 * @access  Private (Buyer)
 */
const createOrder = asyncHandler(async (req, res) => {
  const { serviceId, requirements } = req.body;

  if (!serviceId) {
    res.status(400);
    throw new Error('Service ID is required');
  }

  // Find the service
  const service = await Service.findById(serviceId).populate('seller');

  if (!service || !service.isActive) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Prevent seller from hiring their own service
  if (service.seller._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot hire your own service');
  }

  // Calculate deadline from delivery time
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + service.deliveryTime);

  const order = await Order.create({
    service: service._id,
    buyer: req.user._id,
    seller: service.seller._id,
    price: service.price,
    requirements: requirements || '',
    deadline,
  });

  // Increment total orders on service
  await Service.findByIdAndUpdate(serviceId, { $inc: { totalOrders: 1 } });

  // Populate the order for response
  const populatedOrder = await Order.findById(order._id)
    .populate('service', 'title serviceImage category')
    .populate('buyer', 'name profileImage')
    .populate('seller', 'name profileImage');

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    order: populatedOrder,
  });
});

/**
 * @desc    Get orders for the logged-in user (as buyer or seller)
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = asyncHandler(async (req, res) => {
  const { role } = req.query; // 'buyer' or 'seller'

  let query = {};
  if (role === 'seller') {
    query.seller = req.user._id;
  } else {
    query.buyer = req.user._id;
  }

  const orders = await Order.find(query)
    .populate('service', 'title serviceImage category deliveryTime')
    .populate('buyer', 'name profileImage email')
    .populate('seller', 'name profileImage email')
    .sort('-createdAt');

  res.json({ success: true, orders });
});

/**
 * @desc    Get single order details
 * @route   GET /api/orders/:id
 * @access  Private (Buyer or Seller of the order)
 */
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('service', 'title serviceImage category deliveryTime description')
    .populate('buyer', 'name profileImage email')
    .populate('seller', 'name profileImage email bio');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if the requesting user is the buyer or seller
  const isBuyer = order.buyer._id.toString() === req.user._id.toString();
  const isSeller = order.seller._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isSeller && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isSeller = order.seller.toString() === req.user._id.toString();

  // Status transition rules
  // Seller: pending → accepted, pending → cancelled, accepted → in_progress, in_progress → completed
  // Buyer: pending → cancelled, completed (mark as reviewed via review route)
  const allowedTransitions = {
    pending: ['accepted', 'cancelled'],       // Seller accepts or cancels
    accepted: ['in_progress', 'cancelled'],   // Seller starts work
    in_progress: ['completed'],              // Seller completes work
    completed: [],
    cancelled: [],
  };

  if (!allowedTransitions[order.status]?.includes(status)) {
    res.status(400);
    throw new Error(`Cannot transition from '${order.status}' to '${status}'`);
  }

  // Seller can accept/start/complete; buyer can cancel pending
  if (['accepted', 'in_progress', 'completed'].includes(status) && !isSeller) {
    res.status(403);
    throw new Error('Only the seller can perform this action');
  }

  if (status === 'cancelled' && !isBuyer && !isSeller) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  order.status = status;
  if (cancellationReason) order.cancellationReason = cancellationReason;
  await order.save();

  res.json({ success: true, message: `Order status updated to '${status}'`, order });
});

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/admin/all
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('service', 'title')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .sort('-createdAt');

  res.json({ success: true, orders });
});

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus, getAllOrders };
