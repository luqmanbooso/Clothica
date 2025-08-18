const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    product: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    delivery: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    customerService: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  review: {
    product: {
      type: String,
      maxlength: 1000
    },
    delivery: {
      type: String,
      maxlength: 500
    },
    customerService: {
      type: String,
      maxlength: 500
    }
  },
  images: [{
    url: String,
    alt: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: Boolean
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure one review per user per order per product
reviewSchema.index({ user: 1, order: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
