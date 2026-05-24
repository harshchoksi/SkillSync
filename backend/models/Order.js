// models/Order.js - Order/booking schema between buyer and seller
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Store price at time of order (in case service price changes)
    price: {
      type: Number,
      required: true,
    },
    // Order status lifecycle: pending → accepted → in_progress → completed / cancelled
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    // Buyer's requirements/message when placing order
    requirements: {
      type: String,
      maxlength: [1000, 'Requirements cannot exceed 1000 characters'],
      default: '',
    },
    // Delivery deadline (calculated at order creation)
    deadline: {
      type: Date,
    },
    // Has the buyer reviewed this order?
    isReviewed: {
      type: Boolean,
      default: false,
    },
    // Optional cancellation reason
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
