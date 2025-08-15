const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  categories: [{
    type: String
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Spin System Integration
  isSpinGenerated: {
    type: Boolean,
    default: false
  },
  spinReward: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic'],
    default: 'common'
  },
  generatedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Event & Campaign Integration
  eventType: {
    type: String,
    enum: ['welcome', 'seasonal', 'flash', 'loyalty', 'spin', 'recovery', 'custom'],
    default: 'custom'
  },
  campaign: {
    type: String,
    default: null
  },
  
  // Creative Display
  displayColor: {
    type: String,
    default: '#6C7A59'
  },
  displayIcon: {
    type: String,
    default: '🎉'
  },
  displayMessage: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
couponSchema.index({ code: 1 });
couponSchema.index({ validUntil: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ eventType: 1 });
couponSchema.index({ isSpinGenerated: 1 });

// Pre-save middleware
couponSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
couponSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validUntil &&
         (this.usageLimit === null || this.usageCount < this.usageLimit);
};

couponSchema.methods.canBeUsedByUser = function(userId) {
  // Check if user has already used this coupon maximum times
  // This would need to be implemented in usage tracking
  return true;
};

couponSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minOrderAmount) {
    return 0;
  }
  
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (orderAmount * this.value) / 100;
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else if (this.type === 'fixed') {
    discount = this.value;
  } else if (this.type === 'free_shipping') {
    discount = 0; // Free shipping is handled separately
  }
  
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

couponSchema.methods.incrementUsage = function() {
  this.usageCount++;
  return this.save();
};

// Static methods
couponSchema.statics.generateSpinCoupon = function(userId, spinResult) {
  const couponData = {
    code: `SPIN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    name: `Lucky Spin Reward - ${spinResult.discount}% Off`,
    description: `Congratulations! You won this coupon from your lucky spin!`,
    type: 'percentage',
    value: spinResult.discount,
    minOrderAmount: 1000, // Minimum Rs. 1000
    maxDiscount: 2000, // Maximum Rs. 2000 discount
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    usageLimit: 1,
    perUserLimit: 1,
    isSpinGenerated: true,
    spinReward: spinResult.rarity,
    generatedFor: userId,
    eventType: 'spin',
    campaign: 'Lucky Spin',
    displayColor: spinResult.color || '#FF6B6B',
    displayIcon: spinResult.icon || '🎰',
    displayMessage: `🎉 You won ${spinResult.discount}% off! Use it wisely!`
  };
  
  return new this(couponData);
};

couponSchema.statics.getAvailableCoupons = function(userId, orderAmount = 0) {
  return this.find({
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
    $or: [
      { usageLimit: null },
      { usageCount: { $lt: '$usageLimit' } }
    ]
  }).sort({ validUntil: 1 });
};

module.exports = mongoose.model('Coupon', couponSchema);
