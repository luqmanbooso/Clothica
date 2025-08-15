const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: String,
  description: String,
  
  // Visual Design
  image: {
    type: String,
    required: true
  },
  mobileImage: String, // Optimized for mobile
  altText: String,
  
  // Creative Display
  displayColor: {
    type: String,
    default: '#6C7A59'
  },
  displayGradient: {
    type: String,
    default: 'linear-gradient(135deg, #6C7A59 0%, #8FBC8F 100%)'
  },
  displayIcon: {
    type: String,
    default: '🎉'
  },
  displayBadge: String,
  displayMessage: String,
  
  // Content & Messaging
  ctaText: {
    type: String,
    default: 'Shop Now'
  },
  ctaColor: {
    type: String,
    default: '#FFFFFF'
  },
  urgencyMessage: String,
  countdownText: String,
  
  // Positioning & Layout
  position: {
    type: String,
    enum: ['hero', 'top', 'middle', 'bottom', 'sidebar'],
    default: 'hero'
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  order: {
    type: Number,
    default: 0
  },
  
  // Targeting & Display Rules - Fixed parallel arrays issue
  targetAudience: {
    type: String,
    enum: ['all', 'new', 'returning', 'bronze', 'silver', 'gold', 'vip', 'guest'],
    default: 'all'
  },
  showOnPages: {
    type: String,
    enum: ['home', 'shop', 'product', 'category', 'cart', 'checkout', 'all'],
    default: 'all'
  },
  hideOnPages: [String],
  
  // Timing & Scheduling
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  
  // Action & Navigation
  actionType: {
    type: String,
    enum: ['link', 'product', 'category', 'coupon', 'modal', 'scroll'],
    default: 'link'
  },
  actionUrl: String,
  actionProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  actionCategory: String,
  actionCoupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  
  // Performance & Analytics
  clicks: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  
  // Status & Management
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata
  tags: [String],
  notes: String,
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
bannerSchema.index({ status: 1, isActive: 1, position: 1, priority: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });
bannerSchema.index({ targetAudience: 1, showOnPages: 1 });
bannerSchema.index({ isSpinEventBanner: 1, status: 1 });

// Pre-save middleware
bannerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for banner status
bannerSchema.virtual('isCurrentlyActive').get(function() {
  if (!this.isActive || this.status !== 'active') return false;
  
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  return true;
});

// Virtual for time remaining
bannerSchema.virtual('timeRemaining').get(function() {
  if (!this.endDate) return null;
  
  const now = new Date();
  const remaining = this.endDate - now;
  
  if (remaining <= 0) return 0;
  
  return remaining;
});

// Methods
bannerSchema.methods.isValidForUser = function(user, currentPage = 'home') {
  if (!this.isCurrentlyActive) return false;
  
  // Check page targeting
  if (this.showOnPages.length > 0 && !this.showOnPages.includes('all')) {
    if (!this.showOnPages.includes(currentPage)) {
      return false;
    }
  }
  
  // Check if page is hidden
  if (this.hideOnPages.includes(currentPage)) {
    return false;
  }
  
  // Check audience targeting
  if (this.targetAudience.length > 0 && !this.targetAudience.includes('all')) {
    if (!user) {
      // Guest user
      if (!this.targetAudience.includes('guest')) {
        return false;
      }
    } else {
      // Registered user
      const userGroup = this.getUserGroup(user);
      if (!this.targetAudience.includes(userGroup)) {
        return false;
      }
    }
  }
  
  return true;
};

bannerSchema.methods.getUserGroup = function(user) {
  if (user.loyaltyMembership === 'vip') return 'vip';
  if (user.loyaltyMembership === 'gold') return 'gold';
  if (user.loyaltyMembership === 'silver') return 'silver';
  if (user.loyaltyMembership === 'bronze') return 'bronze';
  
  // Check if new or returning user
  const daysSinceRegistration = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24));
  if (daysSinceRegistration <= 30) return 'new';
  
  return 'returning';
};

bannerSchema.methods.incrementView = function() {
  this.views++;
  return this.save();
};

bannerSchema.methods.incrementClick = function() {
  this.clicks++;
  return this.save();
};

bannerSchema.methods.incrementConversion = function(amount = 0) {
  this.conversions++;
  this.revenue += amount;
  return this.save();
};

// Static methods
bannerSchema.statics.getActiveBanners = function(user = null, page = 'home') {
  const query = {
    status: 'active',
    isActive: true,
    $or: [
      { startDate: { $lte: new Date() } },
      { startDate: null }
    ]
  };
  
  // Add end date filter if specified
  const endDateQuery = {
    $or: [
      { endDate: { $gte: new Date() } },
      { endDate: null }
    ]
  };
  
  return this.find({ ...query, ...endDateQuery })
    .sort({ priority: -1, order: 1, createdAt: -1 });
};

bannerSchema.statics.getBannersForPage = function(page, user = null) {
  return this.getActiveBanners(user, page)
    .then(banners => {
      return banners.filter(banner => banner.isValidForUser(user, page));
    });
};

bannerSchema.statics.getSpinEventBanners = function() {
  return this.find({
    isSpinEventBanner: true,
    status: 'active',
    isActive: true,
    startDate: { $lte: new Date() },
    $or: [
      { endDate: { $gte: new Date() } },
      { endDate: null }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

module.exports = mongoose.model('Banner', bannerSchema);
