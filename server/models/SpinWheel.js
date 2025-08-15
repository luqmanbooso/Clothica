const mongoose = require('mongoose');

const spinWheelSegmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['discount', 'points', 'free_shipping', 'cashback', 'product'],
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  color: {
    type: String,
    default: '#6C7A59'
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const userSpinSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  spinDate: {
    type: Date,
    default: Date.now
  },
  segment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpinWheelSegment'
  },
  reward: {
    type: mongoose.Schema.Types.Mixed
  },
  isClaimed: {
    type: Boolean,
    default: false
  }
});

const spinWheelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'special', 'one_time'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  requiredBadge: {
    type: String,
    enum: ['none', 'bronze', 'silver', 'gold', 'platinum'],
    default: 'none'
  },
  requiredPoints: {
    type: Number,
    default: 0
  },
  spinsPerUser: {
    type: Number,
    default: 1
  },
  totalSpinsAllowed: {
    type: Number,
    default: null // null means unlimited
  },
  currentSpinsUsed: {
    type: Number,
    default: 0
  },
  segments: [spinWheelSegmentSchema],
  isSpecialEvent: {
    type: Boolean,
    default: false
  },
  userSpins: [userSpinSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
spinWheelSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
spinWheelSchema.index({ eventType: 1, isActive: 1 });

// Pre-save middleware to update updatedAt
spinWheelSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get active spin wheels
spinWheelSchema.statics.getActiveSpinWheels = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

// Instance method to check if user can spin
spinWheelSchema.methods.canUserSpin = function(user) {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (now < this.startDate || now > this.endDate) return false;
  
  // Check badge requirement
  if (this.requiredBadge !== 'none' && user.loyaltyMembership !== this.requiredBadge) {
    return false;
  }
  
  // Check points requirement
  if (this.requiredPoints > 0 && user.loyaltyPoints < this.requiredPoints) {
    return false;
  }
  
  // Check total spins limit
  if (this.totalSpinsAllowed && this.currentSpinsUsed >= this.totalSpinsAllowed) {
    return false;
  }
  
  // Check user's spins
  const userSpinCount = this.userSpins.filter(spin => 
    spin.user.toString() === user._id.toString()
  ).length;
  
  return userSpinCount < this.spinsPerUser;
};

// Instance method to add user spin
spinWheelSchema.methods.addUserSpin = function(userId, segment, reward) {
  this.userSpins.push({
    user: userId,
    segment: segment._id,
    reward: reward
  });
  this.currentSpinsUsed += 1;
  return this.save();
};

module.exports = mongoose.model('SpinWheel', spinWheelSchema);
