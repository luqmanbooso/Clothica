const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['seasonal', 'holiday', 'promotional', 'custom']
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
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1, // 1 = highest priority
    min: 1,
    max: 10
  },
  
  // Campaign Configuration
  campaign: {
    banners: [{
      bannerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Banner'
      },
      displayMode: {
        type: String,
        enum: ['slideshow', 'ads', 'hero', 'sidebar'],
        default: 'slideshow'
      },
      priority: {
        type: Number,
        default: 1
      }
    }],
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
    products: {
      categories: [String],
      tags: [String],
      autoHighlight: {
        type: Boolean,
        default: true
      },
      seasonalPricing: {
        type: Boolean,
        default: false
      },
      inventoryOptimization: {
        type: Boolean,
        default: true
      }
    }
  },

  // Inventory Management
  inventory: {
    enableRestockAlerts: {
      type: Boolean,
      default: true
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    criticalStockThreshold: {
      type: Number,
      default: 5
    },
    autoReorder: {
      type: Boolean,
      default: false
    },
    reorderQuantity: {
      type: Number,
      default: 50
    }
  },

  // Analytics & Tracking
  metrics: {
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
    }
  },

  // Advanced Settings
  settings: {
    targetAudience: {
      type: String,
      enum: ['all', 'new', 'returning', 'vip', 'loyal'],
      default: 'all'
    },
    timeBasedDisplay: {
      enabled: {
        type: Boolean,
        default: false
      },
      startHour: {
        type: Number,
        min: 0,
        max: 23,
        default: 9
      },
      endHour: {
        type: Number,
        min: 0,
        max: 23,
        default: 21
      }
    },
    userBehaviorTriggers: {
      enabled: {
        type: Boolean,
        default: false
      },
      triggers: [{
        type: String,
        enum: ['browsing', 'cart_abandonment', 'return_visitor', 'high_value_customer']
      }]
    }
  },

  // Status & History
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  
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
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ type: 1, isActive: 1 });
eventSchema.index({ status: 1, priority: 1 });
eventSchema.index({ 'campaign.products.categories': 1 });

// Virtual for event duration
eventSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for event status
eventSchema.virtual('isRunning').get(function() {
  if (!this.isActive || this.status !== 'active') return false;
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
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
    isActive: true,
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ priority: 1, startDate: 1 });
};

// Static method to get events by type
eventSchema.statics.getEventsByType = function(type) {
  return this.find({ type, isActive: true }).sort({ startDate: 1 });
};

// Instance method to activate campaign
eventSchema.methods.activateCampaign = async function() {
  this.status = 'active';
  this.isActive = true;
  
  // Activate associated discounts
  if (this.campaign.discounts.length > 0) {
    const UnifiedDiscount = require('./UnifiedDiscount');
    for (const discountConfig of this.campaign.discounts) {
      if (discountConfig.autoActivate) {
        await UnifiedDiscount.findByIdAndUpdate(discountConfig.discountId, {
          isActive: true,
          startDate: this.startDate,
          endDate: this.endDate
        });
      }
    }
  }
  
  // Activate associated banners
  if (this.campaign.banners.length > 0) {
    const Banner = require('./Banner');
    for (const bannerConfig of this.campaign.banners) {
      await Banner.findByIdAndUpdate(bannerConfig.bannerId, {
        isActive: true,
        eventId: this._id
      });
    }
  }
  
  return this.save();
};

// Instance method to deactivate campaign
eventSchema.methods.deactivateCampaign = async function() {
  this.status = 'completed';
  this.isActive = false;
  
  // Deactivate associated discounts
  if (this.campaign.discounts.length > 0) {
    const UnifiedDiscount = require('./UnifiedDiscount');
    for (const discountConfig of this.campaign.discounts) {
      await UnifiedDiscount.findByIdAndUpdate(discountConfig.discountId, {
        isActive: false
      });
    }
  }
  
  // Deactivate associated banners
  if (this.campaign.banners.length > 0) {
    const Banner = require('./Banner');
    for (const bannerConfig of this.campaign.banners) {
      await Banner.findByIdAndUpdate(bannerConfig.bannerId, {
        isActive: false,
        eventId: null
      });
    }
  }
  
  return this.save();
};

module.exports = mongoose.model('Event', eventSchema);
