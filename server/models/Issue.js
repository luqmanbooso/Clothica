const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderItem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  type: {
    type: String,
    enum: ['refund', 'return', 'exchange', 'damaged', 'wrong_item', 'not_as_described', 'other'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 1000
  },
  description: {
    type: String,
    maxlength: 2000
  },
  images: [{
    url: String,
    alt: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  adminNotes: [{
    note: String,
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    action: {
      type: String,
      enum: ['refund', 'partial_refund', 'exchange', 'replacement', 'store_credit', 'none'],
      default: 'none'
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'lkr'
    },
    exchangeProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    returnLabel: {
      trackingNumber: String,
      labelUrl: String,
      carrier: String
    },
    refundTransactionId: String,
    processedAt: Date,
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
  isUrgent: {
    type: Boolean,
    default: false
  },
  estimatedResolutionTime: {
    type: Number, // in days
    default: 7
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
});

// Update timestamp on save
issueSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Add to timeline if status changed
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      description: `Status updated to ${this.status}`,
      timestamp: new Date()
    });
  }
  
  next();
});

// Index for efficient queries
issueSchema.index({ user: 1, order: 1 });
issueSchema.index({ status: 1, priority: 1 });
issueSchema.index({ createdAt: -1 });

// Virtual for time since creation
issueSchema.virtual('timeSinceCreation').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for time since last update
issueSchema.virtual('timeSinceUpdate').get(function() {
  return Date.now() - this.updatedAt;
});

// Method to add admin note
issueSchema.methods.addAdminNote = function(note, adminId) {
  this.adminNotes.push({
    note,
    admin: adminId,
    createdAt: new Date()
  });
  return this.save();
};

// Method to update status with timeline
issueSchema.methods.updateStatus = function(newStatus, description, updatedBy) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    description: description || `Status updated to ${newStatus}`,
    timestamp: new Date(),
    updatedBy
  });
  
  if (newStatus === 'completed') {
    this.resolvedAt = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('Issue', issueSchema);


