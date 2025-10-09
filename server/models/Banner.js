const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  // Basic Information
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
  
  // Banner Type & Template
  bannerType: {
    type: String,
    enum: ['image', 'text'],
    default: 'image',
    required: true
  },
  type: {
    type: String,
    enum: ['custom', 'template', 'product_showcase', 'category_promo', 'seasonal', 'event_specific'],
    default: 'custom'
  },
  template: {
    id: String,
    name: String,
    version: String,
    customizations: mongoose.Schema.Types.Mixed
  },
  
  // Visual Content - Conditional based on bannerType
  image: {
    type: String,
    required: false // We'll handle validation in the route
  },
  textContent: {
    type: {
      mainText: {
        type: String,
        required: false // We'll handle validation in the route
      },
      subText: String,
      backgroundColor: {
        type: String,
        default: '#ffffff'
      },
      textColor: {
        type: String,
        default: '#000000'
      },
      fontSize: {
        type: String,
        enum: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'],
        default: '2xl'
      },
      fontWeight: {
        type: String,
        enum: ['normal', 'medium', 'semibold', 'bold', 'extrabold'],
        default: 'bold'
      },
      textAlign: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'center'
      }
    },
    required: false // Only present when bannerType is 'text'
  },
  altText: String,
  backgroundColor: String,
  textColor: String,
  overlayOpacity: {
    type: Number,
    default: 0.3,
    min: 0,
    max: 1
  },
  
  // Call to Action
  cta: {
    text: {
      type: String,
      default: 'Shop Now'
    },
    link: String,
    action: {
      type: String,
      enum: ['navigate', 'modal', 'scroll', 'external', 'product', 'category'],
      default: 'navigate'
    },
    target: {
      type: String,
      enum: ['_self', '_blank', '_parent', '_top'],
      default: '_self'
    },
    buttonStyle: {
      backgroundColor: String,
      textColor: String,
      borderRadius: String,
      padding: String
    }
  },
  
  // Display Settings
  position: {
    type: String,
    enum: ['hero', 'top', 'middle', 'bottom', 'sidebar', 'popup', 'sticky'],
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
  
  // Event Integration
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Display Rules
  displayRules: {
    showOnPages: [{
      type: String,
      enum: ['home', 'shop', 'product', 'category', 'cart', 'checkout', 'all']
    }],
    targetAudience: [{
      type: String,
      enum: ['all', 'new_users', 'returning', 'vip', 'bronze', 'silver', 'gold', 'platinum', 'guest']
    }],
    userBehavior: {
      showAfterScroll: Boolean,
      showOnExit: Boolean,
      showOnReturn: Boolean
    },
    timeBased: {
      enabled: Boolean,
      startHour: Number,
      endHour: Number,
      daysOfWeek: [Number] // 0-6 (Sunday-Saturday)
    },
    deviceSpecific: {
      mobile: Boolean,
      tablet: Boolean,
      desktop: Boolean
    }
  },
  
  // Validity
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  
  // Performance Tracking
  analytics: {
    displays: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 }
  },
  
  // A/B Testing
  abTesting: {
    enabled: Boolean,
    variant: String,
    performance: {
      displays: Number,
      clicks: Number,
      conversions: Number,
      ctr: Number
    }
  },
  
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
bannerSchema.index({ eventId: 1 });
bannerSchema.index({ isActive: 1, position: 1, priority: -1, order: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });
bannerSchema.index({ type: 1, isActive: 1 });
bannerSchema.index({ 'displayRules.showOnPages': 1 });

// Virtual for validity
bannerSchema.virtual('isValid').get(function() {
  if (!this.isActive) return false;
  const now = new Date();
  if (this.startDate && this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  return true;
});

// Virtual for click-through rate
bannerSchema.virtual('ctr').get(function() {
  if (this.analytics.displays === 0) return 0;
  return (this.analytics.clicks / this.analytics.displays) * 100;
});

// Virtual for conversion rate
bannerSchema.virtual('conversionRate').get(function() {
  if (this.analytics.clicks === 0) return 0;
  return (this.analytics.conversions / this.analytics.clicks) * 100;
});

// Virtual for revenue per impression
bannerSchema.virtual('rpi').get(function() {
  if (this.analytics.impressions === 0) return 0;
  return this.analytics.revenue / this.analytics.impressions;
});

// Method to record display
bannerSchema.methods.recordDisplay = function(userId = null) {
  this.analytics.displays += 1;
  this.analytics.impressions += 1;
  
  // Track unique views if userId provided
  if (userId && !this.analytics.uniqueViews) {
    this.analytics.uniqueViews = 1;
  }
  
  return this.save();
};

// Method to record click
bannerSchema.methods.recordClick = function(userId = null) {
  this.analytics.clicks += 1;
  return this.save();
};

// Method to record conversion
bannerSchema.methods.recordConversion = function(revenue = 0, userId = null) {
  this.analytics.conversions += 1;
  this.analytics.revenue += revenue;
  return this.save();
};

// Pre-save validation hook
bannerSchema.pre('save', function(next) {
  // For image banners, ensure textContent is completely removed to avoid validation issues
  if (this.bannerType === 'image') {
    this.textContent = undefined;
  }
  
  // Validate banner type specific requirements
  if (this.bannerType === 'image' && !this.image) {
    return next(new Error('Image is required for image banners'));
  }
  
  if (this.bannerType === 'text') {
    if (!this.textContent || !this.textContent.mainText) {
      return next(new Error('Main text content is required for text banners'));
    }
    
    // Set defaults for textContent fields if they don't exist
    if (!this.textContent.backgroundColor) this.textContent.backgroundColor = '#ffffff';
    if (!this.textContent.textColor) this.textContent.textColor = '#000000';
    if (!this.textContent.fontSize) this.textContent.fontSize = '2xl';
    if (!this.textContent.fontWeight) this.textContent.fontWeight = 'bold';
    if (!this.textContent.textAlign) this.textContent.textAlign = 'center';
  }
  
  next();
});

// Static method to get active banners for an event
bannerSchema.statics.getActiveEventBanners = function(eventId, position = null, page = 'all') {
  const now = new Date();
  const query = {
    eventId,
    isActive: true,
    $or: [
      { startDate: { $lte: now } },
      { startDate: { $exists: false } }
    ],
    $or: [
      { endDate: { $gte: now } },
      { endDate: { $exists: false } }
    ]
  };
  
  if (position) {
    query.position = position;
  }
  
  if (page && page !== 'all') {
    query['displayRules.showOnPages'] = { $in: [page, 'all'] };
  }
  
  return this.find(query)
    .sort({ priority: -1, order: 1, createdAt: -1 })
    .populate('eventId', 'name status');
};

// Static method to get all active banners with context
bannerSchema.statics.getActiveBanners = function(context = {}) {
  const now = new Date();
  const { page = 'all', userType = 'guest', device = 'desktop' } = context;
  
  const query = {
    isActive: true,
    $or: [
      { startDate: { $lte: now } },
      { startDate: { $exists: false } }
    ],
    $or: [
      { endDate: { $gte: now } },
      { endDate: { $exists: false } }
    ]
  };
  
  // Page-specific filtering
  if (page && page !== 'all') {
    query['displayRules.showOnPages'] = { $in: [page, 'all'] };
  }
  
  // User type filtering
  if (userType && userType !== 'guest') {
    query['displayRules.targetAudience'] = { $in: [userType, 'all'] };
  }
  
  // Device filtering
  if (device) {
    query[`displayRules.deviceSpecific.${device}`] = true;
  }
  
  return this.find(query)
    .sort({ priority: -1, order: 1, createdAt: -1 })
    .populate('eventId', 'name status');
};

// Static method to get banner templates
bannerSchema.statics.getTemplates = function() {
  return this.find({ type: 'template', isActive: true })
    .select('name template description')
    .sort({ createdAt: -1 });
};

// Static method to create banner from template
bannerSchema.statics.createFromTemplate = function(templateId, customizations, userId) {
  return this.findById(templateId).then(template => {
    if (!template || template.type !== 'template') {
      throw new Error('Invalid template');
    }
    
    const bannerData = {
      ...template.toObject(),
      _id: undefined,
      type: 'custom',
      template: {
        id: template._id,
        name: template.name,
        version: '1.0',
        customizations
      },
      createdBy: userId,
      isActive: false // Start as draft
    };
    
    return new this(bannerData);
  });
};

// Static method to get banner performance analytics
bannerSchema.statics.getPerformanceAnalytics = function(bannerIds, dateRange = {}) {
  const matchStage = {};
  
  if (bannerIds && bannerIds.length > 0) {
    matchStage._id = { $in: bannerIds };
  }
  
  if (dateRange.start || dateRange.end) {
    matchStage.createdAt = {};
    if (dateRange.start) matchStage.createdAt.$gte = new Date(dateRange.start);
    if (dateRange.end) matchStage.createdAt.$lte = new Date(dateRange.end);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBanners: { $sum: 1 },
        totalDisplays: { $sum: '$analytics.displays' },
        totalClicks: { $sum: '$analytics.clicks' },
        totalConversions: { $sum: '$analytics.conversions' },
        totalRevenue: { $sum: '$analytics.revenue' },
        totalImpressions: { $sum: '$analytics.impressions' },
        avgCTR: { $avg: { $divide: ['$analytics.clicks', { $max: ['$analytics.displays', 1] }] } },
        avgConversionRate: { $avg: { $divide: ['$analytics.conversions', { $max: ['$analytics.clicks', 1] }] } }
      }
    }
  ]);
};

module.exports = mongoose.model('Banner', bannerSchema);
