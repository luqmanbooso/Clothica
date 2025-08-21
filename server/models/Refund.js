const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'lkr'
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  refundType: {
    type: String,
    enum: ['full', 'partial', 'exchange', 'store_credit'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'cash_on_delivery', 'store_credit'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentGateway: {
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'manual'],
      required: true
    },
    transactionId: String,
    refundId: String,
    response: Object,
    processedAt: Date
  },
  adminApproval: {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    notes: String
  },
  timeline: [{
    status: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  metadata: {
    originalPaymentIntent: String,
    refundReason: String,
    customerNotes: String,
    adminNotes: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  expiresAt: Date
});

// Update timestamp on save
refundSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Add to timeline if status changed
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      description: `Refund status updated to ${this.status}`,
      timestamp: new Date()
    });
  }
  
  // Set expiry date (30 days from creation)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Index for efficient queries
refundSchema.index({ user: 1, order: 1 });
refundSchema.index({ status: 1, createdAt: -1 });
refundSchema.index({ 'paymentGateway.provider': 1, 'paymentGateway.transactionId': 1 });

// Virtual for time since creation
refundSchema.virtual('timeSinceCreation').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for time since last update
refundSchema.virtual('timeSinceUpdate').get(function() {
  return Date.now() - this.updatedAt;
});

// Virtual for isExpired
refundSchema.virtual('isExpired').get(function() {
  return this.expiresAt && Date.now() > this.expiresAt;
});

// Method to update status with timeline
refundSchema.methods.updateStatus = function(newStatus, description, updatedBy) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    description: description || `Refund status updated to ${newStatus}`,
    timestamp: new Date(),
    updatedBy
  });
  
  if (newStatus === 'completed') {
    this.processedAt = new Date();
  }
  
  return this.save();
};

// Method to process payment gateway refund
refundSchema.methods.processGatewayRefund = function(gatewayResponse) {
  this.paymentGateway.response = gatewayResponse;
  this.paymentGateway.processedAt = new Date();
  
  if (gatewayResponse.success) {
    this.status = 'completed';
    this.processedAt = new Date();
  } else {
    this.status = 'failed';
  }
  
  return this.save();
};

// Static method to get refund statistics
refundSchema.statics.getRefundStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount
    };
    return acc;
  }, {});
};

module.exports = mongoose.model('Refund', refundSchema);


