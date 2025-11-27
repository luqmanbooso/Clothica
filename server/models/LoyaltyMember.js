const mongoose = require('mongoose');

const loyaltyMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastTierUpdate: {
    type: Date,
    default: Date.now
  },
  pointsHistory: [{
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'bonus'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tierHistory: [{
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      required: true
    },
    achievedAt: {
      type: Date,
      default: Date.now
    },
    pointsAtAchievement: Number,
    spentAtAchievement: Number
  }],
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    birthdayMonth: {
      type: Number,
      min: 1,
      max: 12
    },
    birthdayDay: {
      type: Number,
      min: 1,
      max: 31
    }
  },
  spinWheelData: {
    lastSpinDate: Date,
    totalSpins: {
      type: Number,
      default: 0
    },
    availableSpins: {
      type: Number,
      default: 1
    },
    spinHistory: [{
      prize: String,
      value: String,
      date: {
        type: Date,
        default: Date.now
      },
      redeemed: {
        type: Boolean,
        default: false
      }
    }]
  }
}, {
  timestamps: true
});

// Tier thresholds
const TIER_THRESHOLDS = {
  Bronze: { points: 0, spent: 0 },
  Silver: { points: 500, spent: 200 },
  Gold: { points: 1500, spent: 500 },
  Platinum: { points: 3000, spent: 1000 }
};

// Calculate tier based on points and spending
loyaltyMemberSchema.methods.calculateTier = function() {
  const { points, totalSpent } = this;
  
  if (points >= TIER_THRESHOLDS.Platinum.points && totalSpent >= TIER_THRESHOLDS.Platinum.spent) {
    return 'Platinum';
  } else if (points >= TIER_THRESHOLDS.Gold.points && totalSpent >= TIER_THRESHOLDS.Gold.spent) {
    return 'Gold';
  } else if (points >= TIER_THRESHOLDS.Silver.points && totalSpent >= TIER_THRESHOLDS.Silver.spent) {
    return 'Silver';
  }
  return 'Bronze';
};

// Update tier if needed
loyaltyMemberSchema.methods.updateTier = function() {
  const newTier = this.calculateTier();
  
  if (newTier !== this.tier) {
    // Add to tier history
    this.tierHistory.push({
      tier: newTier,
      achievedAt: new Date(),
      pointsAtAchievement: this.points,
      spentAtAchievement: this.totalSpent
    });
    
    this.tier = newTier;
    this.lastTierUpdate = new Date();
    
    return true; // Tier was updated
  }
  
  return false; // No tier change
};

// Add points with history tracking
loyaltyMemberSchema.methods.addPoints = function(amount, type, description, orderId = null, eventId = null) {
  this.points += amount;
  
  this.pointsHistory.push({
    amount,
    type,
    description,
    orderId,
    eventId,
    date: new Date()
  });
  
  // Check for tier update
  return this.updateTier();
};

// Redeem points
loyaltyMemberSchema.methods.redeemPoints = function(amount, description, orderId = null) {
  if (this.points < amount) {
    throw new Error('Insufficient points');
  }
  
  this.points -= amount;
  
  this.pointsHistory.push({
    amount: -amount,
    type: 'redeemed',
    description,
    orderId,
    date: new Date()
  });
  
  return true;
};

// Get tier benefits
loyaltyMemberSchema.methods.getTierBenefits = function() {
  const benefits = {
    Bronze: {
      discount: 5,
      pointsMultiplier: 1,
      freeShippingThreshold: null,
      earlyAccess: false,
      prioritySupport: false,
      birthdayBonus: false,
      spinWheelMultiplier: 1
    },
    Silver: {
      discount: 10,
      pointsMultiplier: 1,
      freeShippingThreshold: null,
      earlyAccess: false,
      prioritySupport: true,
      birthdayBonus: true,
      spinWheelMultiplier: 1
    },
    Gold: {
      discount: 15,
      pointsMultiplier: 1.5,
      freeShippingThreshold: 0,
      earlyAccess: true,
      prioritySupport: true,
      birthdayBonus: true,
      spinWheelMultiplier: 2
    },
    Platinum: {
      discount: 20,
      pointsMultiplier: 2,
      freeShippingThreshold: 0,
      earlyAccess: true,
      prioritySupport: true,
      birthdayBonus: true,
      spinWheelMultiplier: 3,
      vipStyling: true,
      exclusiveEvents: true
    }
  };
  
  return benefits[this.tier] || benefits.Bronze;
};

// Check if eligible for spin wheel
loyaltyMemberSchema.methods.canSpin = function() {
  const today = new Date();
  const lastSpin = this.spinWheelData.lastSpinDate;
  
  // Can spin once per day + available bonus spins
  if (!lastSpin || lastSpin.toDateString() !== today.toDateString()) {
    return true;
  }
  
  return this.spinWheelData.availableSpins > 0;
};

// Use a spin
loyaltyMemberSchema.methods.useSpin = function(prize, value) {
  const today = new Date();
  
  this.spinWheelData.lastSpinDate = today;
  this.spinWheelData.totalSpins += 1;
  
  if (this.spinWheelData.availableSpins > 0) {
    this.spinWheelData.availableSpins -= 1;
  }
  
  this.spinWheelData.spinHistory.push({
    prize,
    value,
    date: today
  });
  
  return true;
};

module.exports = mongoose.model('LoyaltyMember', loyaltyMemberSchema);
