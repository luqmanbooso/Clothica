const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  icon: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    enum: ['purchase', 'loyalty', 'social', 'achievement', 'special', 'tier', 'streak'],
    required: true
  },
  
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  // Trigger Configuration
  trigger: {
    type: {
      type: String,
      enum: ['purchase_count', 'purchase_value', 'purchase_streak', 'loyalty_points', 'tier_upgrade', 'spin_count', 'review_count', 'referral_count', 'custom'],
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    timeframe: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly', 'yearly', 'lifetime'],
      default: 'once'
    },
    conditions: [{
      field: String,
      operator: {
        type: String,
        enum: ['equals', 'greater_than', 'less_than', 'contains', 'not_equals']
      },
      value: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Reward Configuration
  reward: {
    type: {
      type: String,
      enum: ['points', 'coupon', 'free_shipping', 'spin_token', 'tier_boost', 'exclusive_access'],
      default: 'points'
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: 0
    },
    description: String
  },
  
  // Display Configuration
  display: {
    color: {
      type: String,
      default: '#6C7A59'
    },
    backgroundColor: {
      type: String,
      default: '#F3F4F6'
    },
    borderColor: {
      type: String,
      default: '#D1D5DB'
    },
    showInProfile: {
      type: Boolean,
      default: true
    },
    showInReviews: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      default: 0
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isHidden: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  stats: {
    totalAwarded: {
      type: Number,
      default: 0
    },
    currentHolders: {
      type: Number,
      default: 0
    },
    lastAwarded: Date
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  tags: [String],
  
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for performance
badgeSchema.index({ id: 1 });
badgeSchema.index({ category: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ 'trigger.type': 1 });
badgeSchema.index({ isActive: 1 });

// Virtual for rarity color
badgeSchema.virtual('rarityColor').get(function() {
  const colors = {
    common: '#6B7280',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B'
  };
  return colors[this.rarity] || colors.common;
});

// Virtual for rarity background
badgeSchema.virtual('rarityBackground').get(function() {
  const backgrounds = {
    common: '#F3F4F6',
    uncommon: '#D1FAE5',
    rare: '#DBEAFE',
    epic: '#EDE9FE',
    legendary: '#FEF3C7'
  };
  return backgrounds[this.rarity] || backgrounds.common;
});

// Methods
badgeSchema.methods.checkEligibility = function(userData) {
  const { trigger } = this;
  
  switch (trigger.type) {
    case 'purchase_count':
      return this.checkPurchaseCount(userData.purchaseCount, trigger.value, trigger.timeframe);
    
    case 'purchase_value':
      return this.checkPurchaseValue(userData.totalSpent, trigger.value, trigger.timeframe);
    
    case 'purchase_streak':
      return this.checkPurchaseStreak(userData.purchaseStreak, trigger.value);
    
    case 'loyalty_points':
      return this.checkLoyaltyPoints(userData.loyaltyPoints, trigger.value);
    
    case 'tier_upgrade':
      return this.checkTierUpgrade(userData.currentTier, trigger.value);
    
    case 'spin_count':
      return this.checkSpinCount(userData.spinCount, trigger.value, trigger.timeframe);
    
    case 'review_count':
      return this.checkReviewCount(userData.reviewCount, trigger.value, trigger.timeframe);
    
    case 'referral_count':
      return this.checkReferralCount(userData.referralCount, trigger.value, trigger.timeframe);
    
    case 'custom':
      return this.checkCustomConditions(userData, trigger.conditions);
    
    default:
      return false;
  }
};

badgeSchema.methods.checkPurchaseCount = function(purchaseCount, required, timeframe) {
  if (timeframe === 'once') {
    return purchaseCount >= required;
  }
  
  // For other timeframes, we'd need to check against time-based data
  // This is a simplified version
  return purchaseCount >= required;
};

badgeSchema.methods.checkPurchaseValue = function(totalSpent, required, timeframe) {
  if (timeframe === 'once') {
    return totalSpent >= required;
  }
  
  return totalSpent >= required;
};

badgeSchema.methods.checkPurchaseStreak = function(streak, required) {
  return streak >= required;
};

badgeSchema.methods.checkLoyaltyPoints = function(points, required) {
  return points >= required;
};

badgeSchema.methods.checkTierUpgrade = function(currentTier, requiredTier) {
  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const currentIndex = tiers.indexOf(currentTier);
  const requiredIndex = requiredTier - 1; // Convert numeric value to 0-based index
  
  return currentIndex >= requiredIndex;
};

badgeSchema.methods.checkSpinCount = function(spinCount, required, timeframe) {
  if (timeframe === 'once') {
    return spinCount >= required;
  }
  
  return spinCount >= required;
};

badgeSchema.methods.checkReviewCount = function(reviewCount, required, timeframe) {
  if (timeframe === 'once') {
    return reviewCount >= required;
  }
  
  return reviewCount >= required;
};

badgeSchema.methods.checkReferralCount = function(referralCount, required, timeframe) {
  if (timeframe === 'once') {
    return referralCount >= required;
  }
  
  return referralCount >= required;
};

badgeSchema.methods.checkCustomConditions = function(userData, conditions) {
  if (!conditions || conditions.length === 0) {
    return true;
  }
  
  return conditions.every(condition => {
    const { field, operator, value } = condition;
    const userValue = userData[field];
    
    switch (operator) {
      case 'equals':
        return userValue === value;
      case 'greater_than':
        return userValue > value;
      case 'less_than':
        return userValue < value;
      case 'contains':
        return Array.isArray(userValue) ? userValue.includes(value) : String(userValue).includes(value);
      case 'not_equals':
        return userValue !== value;
      default:
        return false;
    }
  });
};

badgeSchema.methods.awardToUser = function(userId) {
  this.stats.totalAwarded++;
  this.stats.currentHolders++;
  this.stats.lastAwarded = new Date();
  
  return this.save();
};

badgeSchema.methods.removeFromUser = function(userId) {
  this.stats.currentHolders = Math.max(0, this.stats.currentHolders - 1);
  return this.save();
};

// Static methods
badgeSchema.statics.getActiveBadges = function() {
  return this.find({ isActive: true, isHidden: false }).sort({ 'display.priority': -1, rarity: 1 });
};

badgeSchema.statics.getBadgesByCategory = function(category) {
  return this.find({ category, isActive: true, isHidden: false }).sort({ 'display.priority': -1, rarity: 1 });
};

badgeSchema.statics.getBadgesByRarity = function(rarity) {
  return this.find({ rarity, isActive: true, isHidden: false }).sort({ 'display.priority': -1 });
};

badgeSchema.statics.getBadgeById = function(badgeId) {
  return this.findOne({ id: badgeId, isActive: true });
};

badgeSchema.statics.getEligibleBadges = async function(userData) {
  const badges = await this.find({ isActive: true, isHidden: false }).sort({ 'display.priority': -1, rarity: 1 });
  return badges.filter(badge => badge.checkEligibility(userData));
};

// Pre-save middleware
badgeSchema.pre('save', function(next) {
  // Validate trigger configuration
  if (!this.trigger || !this.trigger.type || !this.trigger.value) {
    return next(new Error('Badge must have valid trigger configuration'));
  }
  
  // Update version
  this.version += 1;
  
  next();
});

module.exports = mongoose.model('Badge', badgeSchema);
