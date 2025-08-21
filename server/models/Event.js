const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Basic Event Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['seasonal', 'holiday', 'promotional', 'flash_sale', 'loyalty_boost', 'custom'],
    default: 'promotional'
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Event Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  
  // Target Audience
  targetAudience: {
    type: String,
    enum: ['all', 'new_users', 'returning', 'vip', 'specific'],
    default: 'all'
  },
  
  // Campaign Components - All tied to this event
  components: {
    // Banners/Ads for this event
    banners: [{
      bannerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Banner'
      },
      displayMode: {
        type: String,
        enum: ['hero', 'sidebar', 'popup', 'sticky'],
        default: 'hero'
      },
      priority: {
        type: Number,
        default: 1
      }
    }],
    
    // Discounts for this event
    discounts: [{
      discountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UnifiedDiscount'
      },
      autoActivate: {
        type: Boolean,
        default: true
      },
      priority: {
        type: Number,
        default: 1
      }
    }],
    
    // Special Offers for this event
    specialOffers: [{
      offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SpecialOffer'
      },
      autoActivate: {
        type: Boolean,
        default: true
      },
      priority: {
        type: Number,
        default: 1
      }
    }],
    
    // Spin Wheel for this event
    spinWheel: {
      enabled: {
        type: Boolean,
        default: false
      },
      wheelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SpinWheel'
      }
    }
  },
  
  // Performance Tracking - Event-wise metrics
  performance: {
    // Overall Event Metrics
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
    
    // Component-specific metrics
    bannerMetrics: {
      displays: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },
    discountMetrics: {
      issued: { type: Number, default: 0 },
      redeemed: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    },
    offerMetrics: {
      activations: { type: Number, default: 0 },
      redemptions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    },
    spinWheelMetrics: {
      spins: { type: Number, default: 0 },
      rewards: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    }
  },
  
  // Event Rules
  rules: {
    minOrderAmount: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: 0
    },
    userGroups: [String],
    productCategories: [String],
    excludedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },
  
  // Event History
  history: [{
    action: {
      type: String,
      enum: ['created', 'activated', 'paused', 'updated', 'completed', 'component_added']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: String,
    componentId: String
  }],
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
eventSchema.index({ status: 1, startDate: 1, endDate: 1 });
eventSchema.index({ type: 1, status: 1 });
eventSchema.index({ targetAudience: 1, status: 1 });

// Virtual for event duration
eventSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for event status
eventSchema.virtual('isRunning').get(function() {
  if (this.status !== 'active') return false;
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Virtual for total components
eventSchema.virtual('totalComponents').get(function() {
  let total = 0;
  if (this.components.banners) total += this.components.banners.length;
  if (this.components.discounts) total += this.components.discounts.length;
  if (this.components.specialOffers) total += this.components.specialOffers.length;
  if (this.components.spinWheel.enabled) total += 1;
  return total;
});

// Pre-save middleware to validate dates
eventSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  next();
});

// Static method to get active events
eventSchema.statics.getActiveEvents = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ priority: 1, startDate: 1 });
};

// Static method to get events by type
eventSchema.statics.getEventsByType = function(type) {
  return this.find({ type, status: 'active' }).sort({ startDate: 1 });
};

// Instance method to activate event
eventSchema.methods.activateEvent = async function() {
  this.status = 'active';
  
  // Activate associated components
  if (this.components.discounts.length > 0) {
    const UnifiedDiscount = require('./UnifiedDiscount');
    for (const discountConfig of this.components.discounts) {
      if (discountConfig.autoActivate) {
        await UnifiedDiscount.findByIdAndUpdate(discountConfig.discountId, {
          isActive: true,
          eventId: this._id
        });
      }
    }
  }
  
  if (this.components.specialOffers.length > 0) {
    const SpecialOffer = require('./SpecialOffer');
    for (const offerConfig of this.components.specialOffers) {
      if (offerConfig.autoActivate) {
        await SpecialOffer.findByIdAndUpdate(offerConfig.offerId, {
          isActive: true,
          eventId: this._id
        });
      }
    }
  }
  
  if (this.components.banners.length > 0) {
    const Banner = require('./Banner');
    for (const bannerConfig of this.components.banners) {
      await Banner.findByIdAndUpdate(bannerConfig.bannerId, {
        isActive: true,
        eventId: this._id
      });
    }
  }
  
  if (this.components.spinWheel.enabled && this.components.spinWheel.wheelId) {
    const SpinWheel = require('./SpinWheel');
    await SpinWheel.findByIdAndUpdate(this.components.spinWheel.wheelId, {
      isActive: true,
      eventId: this._id
    });
  }
  
  this.history.push({
    action: 'activated',
    timestamp: new Date(),
    details: 'Event activated with all components'
  });
  
  return this.save();
};

// Instance method to deactivate event
eventSchema.methods.deactivateEvent = async function() {
  this.status = 'completed';
  
  // Deactivate associated components
  if (this.components.discounts.length > 0) {
    const UnifiedDiscount = require('./UnifiedDiscount');
    for (const discountConfig of this.components.discounts) {
      await UnifiedDiscount.findByIdAndUpdate(discountConfig.discountId, {
        isActive: false,
        eventId: null
      });
    }
  }
  
  if (this.components.specialOffers.length > 0) {
    const SpecialOffer = require('./SpecialOffer');
    for (const offerConfig of this.components.specialOffers) {
      await SpecialOffer.findByIdAndUpdate(offerConfig.offerId, {
        isActive: false,
        eventId: null
      });
    }
  }
  
  if (this.components.banners.length > 0) {
    const Banner = require('./Banner');
    for (const bannerConfig of this.components.banners) {
      await Banner.findByIdAndUpdate(bannerConfig.bannerId, {
        isActive: false,
        eventId: null
      });
    }
  }
  
  if (this.components.spinWheel.enabled && this.components.spinWheel.wheelId) {
    const SpinWheel = require('./SpinWheel');
    await SpinWheel.findByIdAndUpdate(this.components.spinWheel.wheelId, {
      isActive: false,
      eventId: null
    });
  }
  
  this.history.push({
    action: 'completed',
    timestamp: new Date(),
    details: 'Event completed and components deactivated'
  });
  
  return this.save();
};

// Instance method to update performance metrics
eventSchema.methods.updatePerformance = function(componentType, metricType, value = 1) {
  if (componentType === 'overall') {
    this.performance[metricType] += value;
  } else if (this.performance[`${componentType}Metrics`]) {
    this.performance[`${componentType}Metrics`][metricType] += value;
  }
  
  return this.save();
};

module.exports = mongoose.model('Event', eventSchema);
