const mongoose = require('mongoose');

const specialOfferSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['flash_sale', 'seasonal', 'clearance', 'bundle', 'spin_event', 'loyalty_reward', 'welcome', 'recovery'],
    required: true
  },
  
  // Discount Details
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'buy_one_get_one', 'free_shipping'],
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
  
  // Targeting
  targetUserGroups: [{
    type: String,
    enum: ['all', 'new', 'returning', 'bronze', 'silver', 'gold', 'vip', 'inactive']
  }],
  targetCategories: [{
    type: String
  }],
  targetProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Timing
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
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  
  // Creative Display
  displayTitle: String,
  displaySubtitle: String,
  displayColor: {
    type: String,
    default: '#FF6B6B'
  },
  displayGradient: {
    type: String,
    default: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)'
  },
  displayIcon: {
    type: String,
    default: '🎉'
  },
  displayImage: String,
  displayBadge: String,
  displayMessage: String,
  
  // Banner Integration
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
  bannerPosition: {
    type: String,
    enum: ['hero', 'top', 'middle', 'bottom'],
    default: 'hero'
  },
  
  // Spin Event Integration
  isSpinEvent: {
    type: Boolean,
    default: false
  },
  spinEventTitle: String,
  spinEventDescription: String,
  spinEventDuration: Number, // in days
  spinEventRewards: [{
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic']
    },
    discount: Number,
    probability: Number, // percentage
    color: String,
    icon: String,
    message: String
  }],
  
  // Automation
  isAutomated: {
    type: Boolean,
    default: false
  },
  automationRules: [{
    trigger: {
      type: String,
      enum: ['low_inventory', 'slow_sales', 'seasonal', 'user_behavior', 'time_based']
    },
    condition: String,
    action: String
  }],
  
  // Performance Tracking
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  
  // A/B Testing
  isABTest: {
    type: Boolean,
    default: false
  },
  abTestVariants: [{
    name: String,
    displayColor: String,
    displayMessage: String,
    performance: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    }
  }],
  
  // Notifications
  sendNotifications: {
    type: Boolean,
    default: false
  },
  notificationChannels: [{
    type: String,
    enum: ['email', 'sms', 'push', 'in_app']
  }],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'ended', 'archived'],
    default: 'draft'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
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

// Indexes
specialOfferSchema.index({ status: 1, startDate: 1, endDate: 1 });
specialOfferSchema.index({ type: 1, targetUserGroups: 1 });
specialOfferSchema.index({ isSpinEvent: 1, status: 1 });
specialOfferSchema.index({ showInBanner: 1, bannerPriority: 1 });

// Pre-save middleware
specialOfferSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
specialOfferSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.startDate && 
         now <= this.endDate;
};

specialOfferSchema.methods.isValidForUser = function(user) {
  if (!this.isActive()) return false;
  
  // Check user group targeting
  if (this.targetUserGroups.length > 0 && !this.targetUserGroups.includes('all')) {
    const userGroup = this.getUserGroup(user);
    if (!this.targetUserGroups.includes(userGroup)) {
      return false;
    }
  }
  
  return true;
};

specialOfferSchema.methods.getUserGroup = function(user) {
  if (user.loyaltyMembership === 'vip') return 'vip';
  if (user.loyaltyMembership === 'gold') return 'gold';
  if (user.loyaltyMembership === 'silver') return 'silver';
  if (user.loyaltyMembership === 'bronze') return 'bronze';
  
  // Check if new or returning user
  const daysSinceRegistration = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24));
  if (daysSinceRegistration <= 30) return 'new';
  
  return 'returning';
};

specialOfferSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minOrderAmount) {
    return 0;
  }
  
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else if (this.discountType === 'fixed') {
    discount = this.discountValue;
  }
  
  return Math.round(discount * 100) / 100;
};

specialOfferSchema.methods.incrementView = function() {
  this.views++;
  return this.save();
};

specialOfferSchema.methods.incrementClick = function() {
  this.clicks++;
  return this.save();
};

specialOfferSchema.methods.incrementConversion = function(amount = 0) {
  this.conversions++;
  this.revenue += amount;
  return this.save();
};

// Static methods
specialOfferSchema.statics.getActiveOffers = function(user = null) {
  const query = {
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  };
  
  return this.find(query).sort({ bannerPriority: -1, startDate: -1 });
};

specialOfferSchema.statics.getSpinEvents = function() {
  return this.find({
    isSpinEvent: true,
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  }).sort({ startDate: -1 });
};

specialOfferSchema.statics.getBannerOffers = function() {
  return this.find({
    showInBanner: true,
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  }).sort({ bannerPriority: -1, startDate: -1 });
};

module.exports = mongoose.model('SpecialOffer', specialOfferSchema);

