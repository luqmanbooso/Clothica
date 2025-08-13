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
    enum: ['flash_sale', 'seasonal', 'birthday', 'anniversary', 'milestone', 'referral', 'loyalty', 'custom'],
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping', 'buy_one_get_one', 'bundle'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minSpend: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: 0
  },
  // Targeting
  targetAudience: {
    userGroups: [{
      type: String,
      enum: ['all', 'new', 'returning', 'loyal', 'vip', 'bronze', 'silver', 'gold', 'platinum']
    }],
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    locations: [String],
    ageRange: {
      min: Number,
      max: Number
    }
  },
  // Timing
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
    dayOfMonth: Number,
    month: Number
  },
  // Automation
  autoActivate: {
    type: Boolean,
    default: false
  },
  autoDeactivate: {
    type: Boolean,
    default: false
  },
  triggerConditions: [{
    type: {
      type: String,
      enum: ['purchase_amount', 'purchase_frequency', 'cart_value', 'user_behavior', 'time_based']
    },
    condition: mongoose.Schema.Types.Mixed,
    operator: {
      type: String,
      enum: ['equals', 'greater_than', 'less_than', 'contains', 'not_contains']
    }
  }],
  // Performance Tracking
  usageLimit: {
    type: Number,
    default: 0 // 0 = unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  maxUsagePerUser: {
    type: Number,
    default: 1
  },
  // Visual & UX
  bannerImage: String,
  bannerText: String,
  highlightColor: String,
  urgencyMessage: String,
  countdownTimer: {
    type: Boolean,
    default: false
  },
  // Analytics
  performance: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  },
  // A/B Testing
  abTest: {
    isActive: { type: Boolean, default: false },
    variant: { type: String, default: 'A' },
    conversionRate: { type: Number, default: 0 }
  },
  // Notifications
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  // Advanced Features
  stackable: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 1
  },
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes for performance
specialOfferSchema.index({ type: 1, isActive: 1, startDate: 1, endDate: 1 });
specialOfferSchema.index({ 'targetAudience.userGroups': 1 });
specialOfferSchema.index({ 'targetAudience.categories': 1 });
specialOfferSchema.index({ tags: 1 });

// Virtual for offer status
specialOfferSchema.virtual('status').get(function() {
  const now = new Date();
  if (!this.isActive) return 'inactive';
  if (now < this.startDate) return 'scheduled';
  if (now > this.endDate) return 'expired';
  return 'active';
});

// Virtual for time remaining
specialOfferSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  if (now > this.endDate) return 0;
  return this.endDate - now;
});

// Method to check if offer is valid for a user
specialOfferSchema.methods.isValidForUser = function(user) {
  // Check if offer is active and within date range
  if (!this.isActive || new Date() < this.startDate || new Date() > this.endDate) {
    return { valid: false, reason: 'Offer not active or expired' };
  }
  
  // Check usage limits
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Usage limit reached' };
  }
  
  // Check user group targeting
  if (this.targetAudience.userGroups.length > 0 && 
      !this.targetAudience.userGroups.includes('all')) {
    const userTier = user.loyaltyTier;
    const isEligible = this.targetAudience.userGroups.some(group => {
      if (group === 'loyal') return ['silver', 'gold', 'platinum'].includes(userTier);
      if (group === 'vip') return userTier === 'platinum';
      if (group === userTier) return true;
      if (group === 'new') return user.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (group === 'returning') return user.createdAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return false;
    });
    
    if (!isEligible) {
      return { valid: false, reason: 'User not in target audience' };
    }
  }
  
  return { valid: true };
};

// Method to calculate discount
specialOfferSchema.methods.calculateDiscount = function(subtotal) {
  let discount = 0;
  
  switch (this.discountType) {
    case 'percentage':
      discount = (subtotal * this.discountValue) / 100;
      break;
    case 'fixed':
      discount = this.discountValue;
      break;
    case 'free_shipping':
      discount = 0; // Will be handled separately
      break;
    case 'buy_one_get_one':
      // Complex logic for BOGO
      discount = 0;
      break;
    case 'bundle':
      // Complex logic for bundle discounts
      discount = 0;
      break;
  }
  
  // Apply max discount limit
  if (this.maxDiscount > 0 && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }
  
  return Math.min(discount, subtotal);
};

// Method to increment usage
specialOfferSchema.methods.incrementUsage = function() {
  this.usedCount += 1;
  return this.save();
};

// Pre-save middleware
specialOfferSchema.pre('save', function(next) {
  // Auto-generate end date if not provided
  if (this.startDate && !this.endDate) {
    this.endDate = new Date(this.startDate.getTime() + 24 * 60 * 60 * 1000); // Default 24 hours
  }
  
  // Validate dates
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  
  next();
});

module.exports = mongoose.model('SpecialOffer', specialOfferSchema);

