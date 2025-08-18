const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Points System
  points: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    multiplier: {
      type: Number,
      default: 1,
      min: 1
    },
    expiryDays: {
      type: Number,
      default: 365
    }
  },
  
  // Tier System
  tier: {
    current: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    nextTier: {
      type: String,
      enum: ['silver', 'gold', 'platinum', 'diamond', null],
      default: 'silver'
    },
    threshold: {
      type: Number,
      default: 1000
    }
  },
  
  // Spin Token System
  spinTokens: {
    available: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    lastEarned: Date,
    pointsThreshold: {
      type: Number,
      default: 500
    }
  },
  
  // Badge System
  badges: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    icon: String,
    category: {
      type: String,
      enum: ['purchase', 'loyalty', 'social', 'achievement', 'special'],
      default: 'achievement'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    }
  }],
  
  // Purchase History for Points Calculation
  purchaseHistory: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    pointsEarned: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Points History
  pointsHistory: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'bonus', 'multiplier'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    date: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }],
  
  // Spin History
  spinHistory: [{
    tokenId: String,
    reward: {
      type: String,
      enum: ['coupon', 'free_shipping', 'double_points', 'try_again', 'bonus_points'],
      required: true
    },
    rewardDetails: mongoose.Schema.Types.Mixed,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Settings
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    autoSpin: {
      type: Boolean,
      default: false
    }
  },
  
  // Statistics
  stats: {
    totalSpins: {
      type: Number,
      default: 0
    },
    successfulSpins: {
      type: Number,
      default: 0
    },
    totalRewards: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
loyaltySchema.index({ user: 1 });
loyaltySchema.index({ 'points.current': -1 });
loyaltySchema.index({ 'tier.current': 1 });
loyaltySchema.index({ 'spinTokens.available': -1 });

// Virtual for tier benefits
loyaltySchema.virtual('tierBenefits').get(function() {
  const benefits = {
    bronze: {
      pointsMultiplier: 1,
      spinOdds: { common: 60, uncommon: 30, rare: 9, epic: 1 },
      exclusiveCoupons: false,
      earlyAccess: false
    },
    silver: {
      pointsMultiplier: 1.2,
      spinOdds: { common: 55, uncommon: 32, rare: 10, epic: 3 },
      exclusiveCoupons: true,
      earlyAccess: false
    },
    gold: {
      pointsMultiplier: 1.5,
      spinOdds: { common: 50, uncommon: 35, rare: 12, epic: 3 },
      exclusiveCoupons: true,
      earlyAccess: true
    },
    platinum: {
      pointsMultiplier: 2,
      spinOdds: { common: 45, uncommon: 38, rare: 14, epic: 3 },
      exclusiveCoupons: true,
      earlyAccess: true
    },
    diamond: {
      pointsMultiplier: 3,
      spinOdds: { common: 40, uncommon: 40, rare: 15, epic: 5 },
      exclusiveCoupons: true,
      earlyAccess: true
    }
  };
  
  return benefits[this.tier.current] || benefits.bronze;
});

// Methods
loyaltySchema.methods.addPoints = function(amount, reason, orderId = null) {
  const pointsToAdd = Math.floor(amount * this.points.multiplier);
  
  this.points.current += pointsToAdd;
  this.points.total += pointsToAdd;
  
  // Add to points history
  this.pointsHistory.push({
    type: 'earned',
    amount: pointsToAdd,
    reason,
    orderId,
    expiresAt: new Date(Date.now() + this.points.expiryDays * 24 * 60 * 60 * 1000)
  });
  
  // Check if spin token should be awarded
  if (this.points.current >= this.spinTokens.pointsThreshold) {
    this.awardSpinToken();
  }
  
  // Check tier progression
  this.checkTierProgression();
  
  return pointsToAdd;
};

loyaltySchema.methods.awardSpinToken = function() {
  const tokensToAward = Math.floor(this.points.current / this.spinTokens.pointsThreshold);
  this.spinTokens.available += tokensToAward;
  this.spinTokens.total += tokensToAward;
  this.spinTokens.lastEarned = new Date();
  
  // Reset points
  this.points.current = this.points.current % this.spinTokens.pointsThreshold;
  
  return tokensToAward;
};

loyaltySchema.methods.checkTierProgression = function() {
  const tierThresholds = {
    bronze: 0,
    silver: 1000,
    gold: 5000,
    platinum: 15000,
    diamond: 50000
  };
  
  const currentTier = this.tier.current;
  const currentThreshold = tierThresholds[currentTier];
  const nextTier = this.tier.nextTier;
  const nextThreshold = tierThresholds[nextTier];
  
  if (this.points.total >= nextThreshold) {
    // Upgrade tier
    this.tier.current = nextTier;
    this.tier.progress = 100;
    
    // Set next tier
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = tiers.indexOf(nextTier);
    this.tier.nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
    
    // Award tier upgrade badge
    this.addBadge(`tier_${nextTier}`, `${nextTier.charAt(0).toUpperCase() + nextTier.slice(1)} Member`, 
      `Reached ${nextTier} tier`, '🏆', 'achievement', 'epic');
  } else {
    // Calculate progress
    const progress = ((this.points.total - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    this.tier.progress = Math.min(Math.max(progress, 0), 100);
  }
};

loyaltySchema.methods.addBadge = function(id, name, description, icon, category = 'achievement', rarity = 'common') {
  const existingBadge = this.badges.find(badge => badge.id === id);
  if (!existingBadge) {
    this.badges.push({
      id,
      name,
      description,
      icon,
      category,
      rarity,
      earnedAt: new Date()
    });
    return true;
  }
  return false;
};

loyaltySchema.methods.useSpinToken = function() {
  if (this.spinTokens.available > 0) {
    this.spinTokens.available--;
    this.stats.totalSpins++;
    return true;
  }
  return false;
};

loyaltySchema.methods.recordSpinResult = function(reward, rewardDetails) {
  this.spinHistory.push({
    tokenId: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    reward,
    rewardDetails,
    date: new Date()
  });
  
  if (reward !== 'try_again') {
    this.stats.successfulSpins++;
    this.stats.totalRewards++;
  }
};

// Static methods
loyaltySchema.statics.findByUserId = function(userId) {
  return this.findOne({ user: userId });
};

loyaltySchema.statics.createForUser = function(userId) {
  return this.create({
    user: userId,
    points: { current: 0, total: 0, multiplier: 1, expiryDays: 365 },
    tier: { current: 'bronze', progress: 0, nextTier: 'silver', threshold: 1000 },
    spinTokens: { available: 0, total: 0, pointsThreshold: 500 },
    badges: [],
    purchaseHistory: [],
    pointsHistory: [],
    spinHistory: [],
    settings: { emailNotifications: true, smsNotifications: false, autoSpin: false },
    stats: { totalSpins: 0, successfulSpins: 0, totalRewards: 0, longestStreak: 0, currentStreak: 0 }
  });
};

loyaltySchema.statics.getLeaderboard = function(limit = 10) {
  return this.find()
    .sort({ 'points.total': -1 })
    .limit(limit)
    .populate('user', 'name email avatar')
    .select('user points.total tier.current badges');
};

// Pre-save middleware to update timestamps
loyaltySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Loyalty', loyaltySchema);




