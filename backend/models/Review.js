// models/Review.js - Rating and review schema
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true, // One review per order
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// --- POST-SAVE HOOK: Update service and seller average rating ---
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.service, this.seller);
});

// --- STATIC: Calculate and update average ratings ---
reviewSchema.statics.calculateAverageRating = async function (serviceId, sellerId) {
  const Service = mongoose.model('Service');
  const User = mongoose.model('User');

  // Aggregate reviews for this service
  const serviceStats = await this.aggregate([
    { $match: { service: serviceId } },
    {
      $group: {
        _id: '$service',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (serviceStats.length > 0) {
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: Math.round(serviceStats[0].avgRating * 10) / 10,
      totalReviews: serviceStats[0].count,
    });
  }

  // Aggregate reviews for this seller (all their services)
  const sellerStats = await this.aggregate([
    { $match: { seller: sellerId } },
    {
      $group: {
        _id: '$seller',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (sellerStats.length > 0) {
    await User.findByIdAndUpdate(sellerId, {
      averageRating: Math.round(sellerStats[0].avgRating * 10) / 10,
      totalReviews: sellerStats[0].count,
    });
  }
};

module.exports = mongoose.model('Review', reviewSchema);
