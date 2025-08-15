const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  
  // Display Configuration
  displayMode: {
    type: String,
    enum: ['slideshow', 'ads', 'hero', 'sidebar', 'popup'],
    default: 'slideshow'
  },
  
  // Context & Targeting
  context: {
    location: {
      type: String,
      enum: ['homepage', 'shop', 'product', 'cart', 'checkout', 'all'],
      default: 'all'
    },
    userType: {
      type: String,
      enum: ['all', 'guest', 'user', 'returning', 'vip', 'loyal'],
      default: 'all'
    },
    timeOfDay: {
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
    userBehavior: {
      enabled: {
        type: Boolean,
        default: false
      },
      triggers: [{
        type: String,
        enum: ['browsing', 'cart_abandonment', 'return_visitor', 'high_value_customer', 'search_query']
      }]
    }
  },

  // Event Integration
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  eventPriority: {
    type: Number,
    default: 1
  },

  // Action & Conversion
  actionType: {
    type: String,
    enum: ['link', 'coupon', 'product', 'category', 'popup'],
    default: 'link'
  },
  actionUrl: String,
  actionCoupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  actionProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  actionCategory: String,
  
  // Display Rules
  displayRules: {
    frequency: {
      type: String,
      enum: ['always', 'once_per_session', 'once_per_day', 'custom'],
      default: 'always'
    },
    maxDisplays: {
      type: Number,
      default: 0 // 0 = unlimited
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    }
  },

  // Status & Control
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'scheduled', 'archived'],
    default: 'draft'
  },
  
  // Analytics & Performance
  analytics: {
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
    ctr: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    lastDisplayed: Date,
    displayHistory: [{
      date: Date,
      views: Number,
      clicks: Number,
      conversions: Number,
      revenue: Number
    }]
  },

  // A/B Testing
  abTesting: {
    enabled: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      enum: ['A', 'B', 'C'],
      default: 'A'
    },
    originalBanner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Banner'
    },
    testResults: {
      variantA: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        ctr: { type: Number, default: 0 }
      },
      variantB: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        ctr: { type: Number, default: 0 }
      },
      variantC: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        ctr: { type: Number, default: 0 }
      }
    }
  },

  // Metadata
  tags: [String],
  category: String,
  targetAudience: String,
  showOnPages: String,
  
  // Management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
bannerSchema.index({ isActive: 1, status: 1 });
bannerSchema.index({ 'displayRules.startDate': 1, 'displayRules.endDate': 1 });
bannerSchema.index({ 'context.location': 1, 'context.userType': 1 });
bannerSchema.index({ eventId: 1, eventPriority: 1 });
bannerSchema.index({ 'displayRules.priority': 1, order: 1 });

// Virtual for click-through rate
bannerSchema.virtual('ctr').get(function() {
  if (this.analytics.views === 0) return 0;
  return (this.analytics.clicks / this.analytics.views * 100).toFixed(2);
});

// Virtual for banner performance score
bannerSchema.virtual('performanceScore').get(function() {
  const ctr = parseFloat(this.ctr) || 0;
  const conversionRate = this.analytics.views > 0 ? (this.analytics.conversions / this.analytics.views * 100) : 0;
  const revenuePerView = this.analytics.views > 0 ? (this.analytics.revenue / this.analytics.views) : 0;
  
  return (ctr * 0.4 + conversionRate * 0.4 + revenuePerView * 0.2).toFixed(2);
});

// Pre-save middleware to update analytics
bannerSchema.pre('save', function(next) {
  if (this.analytics.views > 0) {
    this.analytics.ctr = parseFloat(this.ctr);
  }
  next();
});

// Static method to get banners for specific context
bannerSchema.statics.getBannersForContext = function(context) {
  const now = new Date();
  const currentHour = now.getHours();
  
  return this.find({
    isActive: true,
    status: 'active',
    $or: [
      { 'displayRules.endDate': { $exists: false } },
      { 'displayRules.endDate': { $gte: now } }
    ],
    $or: [
      { 'context.location': 'all' },
      { 'context.location': context.location }
    ],
    $or: [
      { 'context.userType': 'all' },
      { 'context.userType': context.userType }
    ],
    $or: [
      { 'context.timeOfDay.enabled': false },
      {
        'context.timeOfDay.enabled': true,
        'context.timeOfDay.startHour': { $lte: currentHour },
        'context.timeOfDay.endHour': { $gte: currentHour }
      }
    ]
  }).sort({ 'displayRules.priority': -1, order: 1 });
};

// Static method to get event banners
bannerSchema.statics.getEventBanners = function(eventId) {
  return this.find({
    eventId: eventId,
    isActive: true,
    status: 'active'
  }).sort({ eventPriority: 1, order: 1 });
};

// Instance method to record view
bannerSchema.methods.recordView = function() {
  this.analytics.views += 1;
  this.analytics.lastDisplayed = new Date();
  
  // Update daily history
  const today = new Date().toDateString();
  const todayEntry = this.analytics.displayHistory.find(entry => 
    entry.date.toDateString() === today
  );
  
  if (todayEntry) {
    todayEntry.views += 1;
  } else {
    this.analytics.displayHistory.push({
      date: new Date(),
      views: 1,
      clicks: 0,
      conversions: 0,
      revenue: 0
    });
  }
  
  return this.save();
};

// Instance method to record click
bannerSchema.methods.recordClick = function() {
  this.analytics.clicks += 1;
  
  // Update daily history
  const today = new Date().toDateString();
  const todayEntry = this.analytics.displayHistory.find(entry => 
    entry.date.toDateString() === today
  );
  
  if (todayEntry) {
    todayEntry.clicks += 1;
  }
  
  return this.save();
};

// Instance method to record conversion
bannerSchema.methods.recordConversion = function(revenue = 0) {
  this.analytics.conversions += 1;
  this.analytics.revenue += revenue;
  
  // Update daily history
  const today = new Date().toDateString();
  const todayEntry = this.analytics.displayHistory.find(entry => 
    entry.date.toDateString() === today
  );
  
  if (todayEntry) {
    todayEntry.conversions += 1;
    todayEntry.revenue += revenue;
  }
  
  return this.save();
};

module.exports = mongoose.model('Banner', bannerSchema);
