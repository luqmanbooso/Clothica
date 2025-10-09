const mongoose = require('mongoose');

const spinWheelSchema = new mongoose.Schema({
  // Basic Information
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
  description: String,
  
  // Event Integration
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Wheel Configuration
  segments: [{
    name: {
      type: String,
      required: true
    },
    reward: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['discount', 'free_shipping', 'cashback', 'product', 'loyalty_points'],
      required: false
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    color: String,
    icon: String
  }],
  
  // Spin Rules
  maxSpinsPerUser: {
    type: Number,
    default: 1
  },
  cooldownHours: {
    type: Number,
    default: 24
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
    totalSpins: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    rewardsGiven: { type: Number, default: 0 },
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
spinWheelSchema.index({ eventId: 1 });
spinWheelSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Virtual for validity
spinWheelSchema.virtual('isValid').get(function() {
  if (!this.isActive) return false;
  const now = new Date();
  if (this.startDate && this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  return true;
});

// Method to record spin
spinWheelSchema.methods.recordSpin = function(userId) {
  this.analytics.totalSpins += 1;
  
  // Check if this is a new user
  if (!this.analytics.uniqueUsers.includes(userId)) {
    this.analytics.uniqueUsers.push(userId);
  }
  
  return this.save();
};

// Method to record reward
spinWheelSchema.methods.recordReward = function() {
  this.analytics.rewardsGiven += 1;
  return this.save();
};

// Method to record conversion
spinWheelSchema.methods.recordConversion = function() {
  this.analytics.conversions += 1;
  return this.save();
};

// Method to get random segment based on probability
spinWheelSchema.methods.getRandomSegment = function() {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const segment of this.segments) {
    cumulative += segment.probability;
    if (random <= cumulative) {
      return segment;
    }
  }
  
  // Fallback to first segment if something goes wrong
  return this.segments[0];
};

// Static method to get active spin wheels for an event
spinWheelSchema.statics.getActiveEventWheels = function(eventId) {
  const now = new Date();
  return this.find({
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
  });
};

module.exports = mongoose.model('SpinWheel', spinWheelSchema);
