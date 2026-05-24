// models/Service.js - Freelance service/gig schema
const mongoose = require('mongoose');

const SERVICE_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Data Science',
  'Machine Learning',
  'Content Writing',
  'Video Editing',
  'Photography',
  'Music & Audio',
  'Digital Marketing',
  'Tutoring',
  'Translation',
  'Other',
];

const serviceSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: SERVICE_CATEGORIES,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least 1'],
    },
    deliveryTime: {
      type: Number, // in days
      required: [true, 'Delivery time is required'],
      min: [1, 'Delivery time must be at least 1 day'],
    },
    serviceImage: {
      type: String,
      default: '', // Cloudinary URL
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Aggregated rating from reviews
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Static method to get categories list
serviceSchema.statics.getCategories = function () {
  return SERVICE_CATEGORIES;
};

module.exports = mongoose.model('Service', serviceSchema);
