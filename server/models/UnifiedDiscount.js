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
    conversionRate: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 }
  },
  effectivenessScore: { type: Number, default: 0 },
  
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
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
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
  this.analytics.usageCount += 1;
  
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
  this.analytics.totalDiscount += discountAmount;
  this.effectivenessScore = Number((this.analytics.conversionRate * 100).toFixed(2));
  
  return this.save();
};

// Calculate discount for a given order/product context
unifiedDiscountSchema.methods.calculateDiscount = function(orderAmount = 0, productPrice = 0) {
  if (!this.isValid) {
    return 0;
  }
  if (orderAmount < (this.minOrderAmount || 0)) {
    return 0;
  }

  let baseAmount = this.type === 'buy_one_get_one' ? productPrice : orderAmount;
  let discountAmount = 0;

  if (this.type === 'percentage') {
    discountAmount = (baseAmount * this.value) / 100;
    if (this.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, this.maxDiscountAmount);
    }
  } else if (this.type === 'fixed') {
    discountAmount = Math.min(this.value, baseAmount);
  } else if (this.type === 'free_shipping') {
    discountAmount = 0; // shipping handled at order pricing
  } else if (this.type === 'buy_one_get_one') {
    discountAmount = productPrice; // free second item
  }

  return Math.max(0, Math.round(discountAmount * 100) / 100);
};

// Track impressions and clicks
unifiedDiscountSchema.methods.recordView = function() {
  this.analytics.views += 1;
  return this.save();
};

unifiedDiscountSchema.methods.recordClick = function() {
  this.analytics.clicks += 1;
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

// Static: get active discounts with optional context/user group
unifiedDiscountSchema.statics.getActiveDiscounts = function(userGroup = 'all', context = {}) {
  const now = new Date();
  const query = {
    isActive: true,
    $or: [
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: { $exists: false }, endDate: { $exists: false } }
    ]
  };

  if (context.eventId) query.eventId = context.eventId;
  if (context.inventoryTrigger) query.inventoryTrigger = true;
  if (userGroup && userGroup !== 'all') query.targetUserGroup = userGroup;

  return this.find(query).sort({ value: -1 });
};

// Static: inventory-triggered discounts
unifiedDiscountSchema.statics.getInventoryTriggeredDiscounts = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    inventoryTrigger: true,
    $or: [
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: { $exists: false }, endDate: { $exists: false } }
    ]
  });
};

// Static: seasonal discounts
unifiedDiscountSchema.statics.getSeasonalDiscounts = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ endDate: 1 });
};

// Simple pagination helper used by admin list
unifiedDiscountSchema.statics.paginate = async function(query = {}, options = {}) {
  const page = parseInt(options.page || 1, 10);
  const limit = parseInt(options.limit || 20, 10);
  const sort = options.sort || { createdAt: -1 };

  const [docs, totalDocs] = await Promise.all([
    this.find(query).sort(sort).skip((page - 1) * limit).limit(limit),
    this.countDocuments(query)
  ]);

  return {
    docs,
    totalDocs,
    totalPages: Math.ceil(totalDocs / limit) || 1,
    page,
    limit
  };
};

module.exports = mongoose.model('UnifiedDiscount', unifiedDiscountSchema);





