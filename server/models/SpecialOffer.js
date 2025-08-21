const mongoose = require('mongoose');

const specialOfferSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Offer Type
  type: {
    type: String,
    enum: ['flash_sale', 'bundle_deal', 'limited_edition', 'early_access', 'exclusive'],
    required: true
  },
  
  // Offer Details
  offerValue: {
    type: String,
    required: true // e.g., "50% OFF", "Buy 2 Get 1 Free", "Free Shipping"
  },
  
  // Validity
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Event Integration
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Target Products
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String,
    enum: ['men', 'women', 'kids', 'accessories', 'shoes', 'bags']
  }],
  
  // Display Settings
  displayImage: String,
  displayColor: {
    type: String,
    default: '#FF6B6B'
  },
  displayIcon: {
    type: String,
    default: '🎁'
  },
  
  // Performance Tracking
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    activations: { type: Number, default: 0 },
    redemptions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
specialOfferSchema.index({ eventId: 1 });
specialOfferSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
specialOfferSchema.index({ type: 1 });

// Virtual for validity
specialOfferSchema.virtual('isValid').get(function() {
  if (!this.isActive) return false;
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Virtual for conversion rate
specialOfferSchema.virtual('conversionRate').get(function() {
  if (this.analytics.views === 0) return 0;
  return (this.analytics.clicks / this.analytics.views) * 100;
});

// Pre-save middleware to validate dates
specialOfferSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  next();
});

// Method to record view
specialOfferSchema.methods.recordView = function() {
  this.analytics.views += 1;
  return this.save();
};

// Method to record click
specialOfferSchema.methods.recordClick = function() {
  this.analytics.clicks += 1;
  return this.save();
};

// Method to record activation
specialOfferSchema.methods.recordActivation = function() {
  this.analytics.activations += 1;
  return this.save();
};

// Method to record redemption
specialOfferSchema.methods.recordRedemption = function(amount = 0) {
  this.analytics.redemptions += 1;
  this.analytics.revenue += amount;
  return this.save();
};

// Static method to get active offers for an event
specialOfferSchema.statics.getActiveEventOffers = function(eventId) {
  const now = new Date();
  return this.find({
    eventId,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ startDate: -1 });
};

module.exports = mongoose.model('SpecialOffer', specialOfferSchema);

