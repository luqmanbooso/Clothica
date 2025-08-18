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
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'buy_one_get_one', 'free_shipping', 'seasonal_pricing'],
    required: true
  },
  discountValue: {
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
  
  // Smart Targeting
  targetUserGroups: [{
    type: String,
    enum: ['all', 'new', 'returning', 'bronze', 'silver', 'gold', 'vip', 'inactive']
  }],
  targetCategories: [String],
  targetProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
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
  eventPriority: {
    type: Number,
    default: 1
  },
  
  // Timing & Automation
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'seasonal']
  },
  
  // Inventory Integration
  inventoryTrigger: {
    enabled: {
      type: Boolean,
      default: false
    },
    lowStockThreshold: Number,
    criticalStockThreshold: Number,
    autoActivate: {
      type: Boolean,
      default: false
    }
  },
  
  // Seasonal Intelligence
  seasonal: {
    isSeasonal: {
      type: Boolean,
      default: false
    },
    seasons: [{
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'all_year']
    }],
    seasonalMultiplier: {
      type: Number,
      default: 1.0
    }
  },
  
  // Display & Creative
  displaySettings: {
    showInBanner: {
      type: Boolean,
      default: true
    },
    bannerPriority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    },
    displayColor: {
      type: String,
      default: '#FF6B6B'
    },
    displayIcon: {
      type: String,
      default: '🎉'
    },
    displayMessage: String
  },
  
  // Performance Tracking
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 }
  },
  
  // Smart Rules
  smartRules: [{
    trigger: {
      type: String,
      enum: ['low_inventory', 'slow_sales', 'user_behavior', 'time_based', 'competitor_price']
    },
    condition: String,
    action: {
      type: String,
      enum: ['activate', 'deactivate', 'modify_value', 'extend_duration']
    },
    value: mongoose.Schema.Types.Mixed
  }],
  
  // Status & Management
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'ended', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
unifiedDiscountSchema.index({ code: 1 });
unifiedDiscountSchema.index({ status: 1, isActive: 1 });
unifiedDiscountSchema.index({ startDate: 1, endDate: 1 });
unifiedDiscountSchema.index({ eventId: 1 });
unifiedDiscountSchema.index({ 'inventoryTrigger.enabled': 1 });
unifiedDiscountSchema.index({ 'seasonal.isSeasonal': 1 });

// Virtual for discount status
unifiedDiscountSchema.virtual('isCurrentlyActive').get(function() {
  if (!this.isActive || this.status !== 'active') return false;
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Virtual for discount effectiveness
unifiedDiscountSchema.virtual('effectivenessScore').get(function() {
  if (this.analytics.views === 0) return 0;
  const ctr = this.analytics.clicks / this.analytics.views;
  const conversionRate = this.analytics.conversions / this.analytics.clicks;
  const revenuePerView = this.analytics.revenue / this.analytics.views;
  
  return (ctr * 0.3) + (conversionRate * 0.4) + (revenuePerView * 0.3);
});

// Pre-save middleware
unifiedDiscountSchema.pre('save', function(next) {
  // Auto-generate code if not provided
  if (!this.code) {
    this.code = this.generateUniqueCode();
  }
  
  // Validate dates
  if (this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  
  next();
});

// Instance methods
unifiedDiscountSchema.methods.calculateDiscount = function(orderAmount, productPrice = 0) {
  if (!this.isCurrentlyActive) return 0;
  if (orderAmount < this.minOrderAmount) return 0;
  
  let discount = 0;
  
  switch (this.discountType) {
    case 'percentage':
      discount = (orderAmount * this.discountValue) / 100;
      if (this.maxDiscount) {
        discount = Math.min(discount, this.maxDiscount);
      }
      break;
      
    case 'fixed':
      discount = this.discountValue;
      break;
      
    case 'buy_one_get_one':
      discount = productPrice;
      break;
      
    case 'free_shipping':
      discount = 0; // Handle shipping separately
      break;
      
    case 'seasonal_pricing':
      discount = this.calculateSeasonalDiscount(orderAmount);
      break;
  }
  
  return Math.round(discount * 100) / 100;
};

unifiedDiscountSchema.methods.calculateSeasonalDiscount = function(orderAmount) {
  if (!this.seasonal.isSeasonal) return 0;
  
  const currentSeason = this.getCurrentSeason();
  const seasonalMultiplier = this.seasonal.seasonalMultiplier || 1.0;
  
  return (orderAmount * this.discountValue * seasonalMultiplier) / 100;
};

unifiedDiscountSchema.methods.getCurrentSeason = function() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

unifiedDiscountSchema.methods.generateUniqueCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

unifiedDiscountSchema.methods.recordView = function() {
  this.analytics.views++;
  return this.save();
};

unifiedDiscountSchema.methods.recordClick = function() {
  this.analytics.clicks++;
  return this.save();
};

unifiedDiscountSchema.methods.recordUsage = function(discountAmount = 0) {
  this.analytics.usageCount++;
  this.analytics.totalDiscount += discountAmount;
  this.analytics.conversions++;
  return this.save();
};

// Static methods
unifiedDiscountSchema.statics.getActiveDiscounts = function(user = null, context = {}) {
  const query = {
    status: 'active',
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  };
  
  // Add event filtering if context provided
  if (context.eventId) {
    query.eventId = context.eventId;
  }
  
  // Add inventory trigger filtering
  if (context.inventoryTrigger) {
    query['inventoryTrigger.enabled'] = true;
  }
  
  return this.find(query).sort({ 'displaySettings.bannerPriority': -1, startDate: -1 });
};

unifiedDiscountSchema.statics.getInventoryTriggeredDiscounts = function() {
  return this.find({
    'inventoryTrigger.enabled': true,
    status: 'active',
    isActive: true
  });
};

unifiedDiscountSchema.statics.getSeasonalDiscounts = function() {
  return this.find({
    'seasonal.isSeasonal': true,
    status: 'active',
    isActive: true
  });
};

module.exports = mongoose.model('UnifiedDiscount', unifiedDiscountSchema);






