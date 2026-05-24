// controllers/serviceController.js - Service/gig CRUD operations
const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');

/**
 * @desc    Get all services with search, filter, pagination
 * @route   GET /api/services
 * @access  Public
 */
const getServices = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  // Build query object
  const query = { isActive: true };

  // Full-text search across title, description, tags
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category && category !== 'All') {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sort options
  let sortOption = '-createdAt'; // Default: newest first
  if (sort === 'price_asc') sortOption = 'price';
  if (sort === 'price_desc') sortOption = '-price';
  if (sort === 'rating') sortOption = '-averageRating';
  if (sort === 'popular') sortOption = '-totalOrders';

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Service.countDocuments(query);

  const services = await Service.find(query)
    .populate('seller', 'name profileImage averageRating college')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    services,
    categories: Service.getCategories(),
  });
});

/**
 * @desc    Get single service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate(
    'seller',
    'name profileImage bio averageRating totalReviews college skills'
  );

  if (!service || !service.isActive) {
    res.status(404);
    throw new Error('Service not found');
  }

  res.json({ success: true, service });
});

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Private (Seller only)
 */
const createService = asyncHandler(async (req, res) => {
  const { title, description, category, price, deliveryTime, tags } = req.body;

  // Validate required fields
  if (!title || !description || !category || !price || !deliveryTime) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const serviceData = {
    seller: req.user._id,
    title,
    description,
    category,
    price: Number(price),
    deliveryTime: Number(deliveryTime),
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
  };

  // Add image URL if uploaded
  if (req.file) {
    serviceData.serviceImage = req.file.path;
  }

  const service = await Service.create(serviceData);

  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    service,
  });
});

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private (Owner or Admin)
 */
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Check ownership (seller or admin can update)
  if (service.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this service');
  }

  const { title, description, category, price, deliveryTime, tags, isActive } = req.body;

  if (title) service.title = title;
  if (description) service.description = description;
  if (category) service.category = category;
  if (price) service.price = Number(price);
  if (deliveryTime) service.deliveryTime = Number(deliveryTime);
  if (tags) service.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  if (isActive !== undefined) service.isActive = isActive;
  if (req.file) service.serviceImage = req.file.path;

  await service.save();

  res.json({ success: true, message: 'Service updated successfully', service });
});

/**
 * @desc    Delete a service (soft delete via isActive)
 * @route   DELETE /api/services/:id
 * @access  Private (Owner or Admin)
 */
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  if (service.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this service');
  }

  // Soft delete - just mark as inactive
  service.isActive = false;
  await service.save();

  res.json({ success: true, message: 'Service deleted successfully' });
});

/**
 * @desc    Get services by logged-in seller
 * @route   GET /api/services/my-services
 * @access  Private (Seller)
 */
const getMyServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ seller: req.user._id }).sort('-createdAt');

  res.json({ success: true, services });
});

/**
 * @desc    Get all categories
 * @route   GET /api/services/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  res.json({ success: true, categories: Service.getCategories() });
});

module.exports = { getServices, getService, createService, updateService, deleteService, getMyServices, getCategories };
