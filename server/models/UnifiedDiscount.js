const mongoose = require('mongoose');

const unifiedDiscountSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Discount Type & Value
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping', 'buy_one_get_one'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Usage Limits
  maxUses: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  currentUses: {
    type: Number,
    default: 0
  },
  maxUsesPerUser: {
    type: Number,
    default: 1
  },
  
  // Validity
  startDate: {
    type: Date,
    required: false // Auto-assigned from event
  },
  endDate: {
    type: Date,
    required: false // Auto-assigned from event
  },
  
  // Conditions
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: 0
  },
  applicableCategories: [{
    type: String,
    enum: ['men', 'women', 'kids', 'accessories', 'shoes', 'bags']
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Event Integration
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Performance Tracking
  analytics: {
    totalIssued: { type: Number, default: 0 },
    totalRedeemed: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
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
unifiedDiscountSchema.index({ code: 1 });
unifiedDiscountSchema.index({ eventId: 1 });
unifiedDiscountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Virtual for validity
unifiedDiscountSchema.virtual('isValid').get(function() {
  if (!this.isActive) return false;
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && 
         (this.maxUses === -1 || this.currentUses < this.maxUses);
});

// Pre-save middleware to validate dates
unifiedDiscountSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  next();
});

// Method to issue discount
unifiedDiscountSchema.methods.issueDiscount = function() {
  if (!this.isValid) {
    throw new Error('Discount is not valid');
  }
  
  this.analytics.totalIssued += 1;
  return this.save();
};

// Method to redeem discount
unifiedDiscountSchema.methods.redeemDiscount = function(orderAmount, userId) {
  if (!this.isValid) {
    throw new Error('Discount is not valid');
  }
  
  if (orderAmount < this.minOrderAmount) {
    throw new Error(`Minimum order amount of ${this.minOrderAmount} required`);
  }
  
  this.currentUses += 1;
  this.analytics.totalRedeemed += 1;
  
  // Calculate discount amount
  let discountAmount = 0;
  if (this.type === 'percentage') {
    discountAmount = (orderAmount * this.value) / 100;
    if (this.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, this.maxDiscountAmount);
    }
  } else if (this.type === 'fixed') {
    discountAmount = this.value;
  }
  
  this.analytics.totalRevenue += discountAmount;
  this.analytics.conversionRate = this.analytics.totalRedeemed / this.analytics.totalIssued;
  
  return this.save();
};

// Static method to get active discounts for an event
unifiedDiscountSchema.statics.getActiveEventDiscounts = function(eventId) {
  const now = new Date();
  return this.find({
    eventId,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ value: -1 });
};

module.exports = mongoose.model('UnifiedDiscount', unifiedDiscountSchema);






