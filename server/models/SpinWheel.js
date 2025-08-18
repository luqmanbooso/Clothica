const mongoose = require('mongoose');

const spinWheelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: String,
  
  // Wheel Configuration
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Reward Slots Configuration
  slots: [{
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
    color: {
      type: String,
      default: '#6C7A59'
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    reward: {
      type: String,
      enum: ['coupon', 'free_shipping', 'double_points', 'try_again', 'bonus_points', 'product_discount', 'cashback'],
      required: true
    },
    rewardValue: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Tier-based Probability Modifiers
  tierModifiers: {
    bronze: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    silver: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    gold: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    platinum: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    diamond: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // Campaign Integration
  campaign: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    name: String,
    startDate: Date,
    endDate: Date
  },
  
  // Usage Limits
  usage: {
    maxSpinsPerDay: {
      type: Number,
      default: 3
    },
    maxSpinsPerUser: {
      type: Number,
      default: null
    },
    requireAuthentication: {
      type: Boolean,
      default: true
    },
    minOrderValue: {
      type: Number,
      default: 0
    }
  },
  
  // Statistics
  stats: {
    totalSpins: {
      type: Number,
      default: 0
    },
    totalRewards: {
      type: Number,
      default: 0
    },
    rewardDistribution: {
      type: Map,
      of: Number,
      default: new Map()
    },
    averageSpinsPerUser: {
      type: Number,
      default: 0
    }
  },
  
  // Settings
  settings: {
    animationDuration: {
      type: Number,
      default: 3000
    },
    soundEnabled: {
      type: Boolean,
      default: true
    },
    showProbability: {
      type: Boolean,
      default: false
    },
    allowMultipleSpins: {
      type: Boolean,
      default: false
    }
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
spinWheelSchema.index({ isActive: 1 });
spinWheelSchema.index({ 'campaign.id': 1 });
spinWheelSchema.index({ createdBy: 1 });

// Virtual for total probability validation
spinWheelSchema.virtual('totalProbability').get(function() {
  return this.slots
    .filter(slot => slot.isActive)
    .reduce((sum, slot) => sum + slot.probability, 0);
});

// Virtual for active slots count
spinWheelSchema.virtual('activeSlotsCount').get(function() {
  return this.slots.filter(slot => slot.isActive).length;
});

// Methods
spinWheelSchema.methods.spin = function(userTier = 'bronze') {
  // Validate total probability equals 100
  if (this.totalProbability !== 100) {
    throw new Error('Total probability must equal 100%');
  }
  
  // Get active slots
  const activeSlots = this.slots.filter(slot => slot.isActive);
  
  // Apply tier modifiers if they exist
  let modifiedSlots = [...activeSlots];
  if (this.tierModifiers[userTier]) {
    modifiedSlots = activeSlots.map(slot => {
      const modifier = this.tierModifiers[userTier][slot.id];
      if (modifier) {
        return {
          ...slot.toObject(),
          probability: Math.max(0, Math.min(100, slot.probability + modifier))
        };
      }
      return slot;
    });
    
    // Recalculate probabilities to ensure they sum to 100
    const totalModified = modifiedSlots.reduce((sum, slot) => sum + slot.probability, 0);
    if (totalModified !== 100) {
      const factor = 100 / totalModified;
      modifiedSlots = modifiedSlots.map(slot => ({
        ...slot,
        probability: Math.round(slot.probability * factor)
      }));
    }
  }
  
  // Generate random number
  const random = Math.random() * 100;
  
  // Find winning slot
  let cumulativeProbability = 0;
  for (const slot of modifiedSlots) {
    cumulativeProbability += slot.probability;
    if (random <= cumulativeProbability) {
      return slot;
    }
  }
  
  // Fallback to last slot (shouldn't happen with proper probabilities)
  return modifiedSlots[modifiedSlots.length - 1];
};

spinWheelSchema.methods.updateStats = function(spinResult) {
  this.stats.totalSpins++;
  
  if (spinResult.reward !== 'try_again') {
    this.stats.totalRewards++;
  }
  
  // Update reward distribution
  const currentCount = this.stats.rewardDistribution.get(spinResult.reward) || 0;
  this.stats.rewardDistribution.set(spinResult.reward, currentCount + 1);
  
  return this.save();
};

spinWheelSchema.methods.validateConfiguration = function() {
  const errors = [];
  
  // Check if slots exist
  if (!this.slots || this.slots.length === 0) {
    errors.push('At least one slot must be configured');
  }
  
  // Check probability sum
  if (this.totalProbability !== 100) {
    errors.push(`Total probability must equal 100% (current: ${this.totalProbability}%)`);
  }
  
  // Check slot configuration
  this.slots.forEach((slot, index) => {
    if (!slot.name || !slot.reward) {
      errors.push(`Slot ${index + 1} is missing required fields`);
    }
    
    if (slot.probability < 0 || slot.probability > 100) {
      errors.push(`Slot ${index + 1} has invalid probability: ${slot.probability}%`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Static methods
spinWheelSchema.statics.getActiveWheels = function() {
  return this.find({ isActive: true }).populate('campaign', 'name startDate endDate');
};

spinWheelSchema.statics.getWheelByName = function(name) {
  return this.findOne({ name, isActive: true });
};

spinWheelSchema.statics.getWheelsByCampaign = function(campaignId) {
  return this.find({ 'campaign.id': campaignId, isActive: true });
};

// Pre-save middleware
spinWheelSchema.pre('save', function(next) {
  // Validate configuration before saving
  const validation = this.validateConfiguration();
  if (!validation.isValid) {
    return next(new Error(`Invalid wheel configuration: ${validation.errors.join(', ')}`));
  }
  
  // Update version
  this.version += 1;
  
  next();
});

// Pre-remove middleware
spinWheelSchema.pre('remove', function(next) {
  // Clean up related data if needed
  next();
});

module.exports = mongoose.model('SpinWheel', spinWheelSchema);
