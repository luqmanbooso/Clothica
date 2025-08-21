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
  
  // Visual Content
  image: {
    type: String,
    required: true
  },
  altText: String,
  
  // Call to Action
  cta: {
    text: {
      type: String,
      default: 'Shop Now'
    },
    link: String,
    action: {
      type: String,
      enum: ['navigate', 'modal', 'scroll', 'external'],
      default: 'navigate'
    }
  },
  
  // Display Settings
  position: {
    type: String,
    enum: ['hero', 'top', 'middle', 'bottom', 'sidebar', 'popup'],
    default: 'hero'
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
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
    conversions: { type: Number, default: 0 }
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

// Indexes
bannerSchema.index({ eventId: 1 });
bannerSchema.index({ isActive: 1, position: 1, priority: -1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

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

// Method to record display
bannerSchema.methods.recordDisplay = function() {
  this.analytics.displays += 1;
  return this.save();
};

// Method to record click
bannerSchema.methods.recordClick = function() {
  this.analytics.clicks += 1;
  return this.save();
};

// Method to record conversion
bannerSchema.methods.recordConversion = function() {
  this.analytics.conversions += 1;
  return this.save();
};

// Static method to get active banners for an event
bannerSchema.statics.getActiveEventBanners = function(eventId, position = null) {
  const now = new Date();
  const query = {
    eventId,
    isActive: true,
    $or: [
      { startDate: { $lte: now } },
      { startDate: { $exists: false } }
    ]
  };
  
  if (position) {
    query.position = position;
  }
  
  return this.find(query).sort({ priority: -1, createdAt: -1 });
};

// Static method to get all active banners
bannerSchema.statics.getActiveBanners = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    $or: [
      { startDate: { $lte: now } },
      { startDate: { $exists: false } }
    ],
    $or: [
      { endDate: { $gte: now } },
      { endDate: { $exists: false } }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

module.exports = mongoose.model('Banner', bannerSchema);
