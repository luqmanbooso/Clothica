const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'order', 'payment', 'stock', 'promotion'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['order', 'payment', 'inventory', 'promotion', 'system', 'security'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: null
  },
  metadata: {
    orderId: String,
    paymentId: String,
    productId: String,
    amount: Number,
    status: String
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1, isArchived: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
});

// Pre-save middleware to set expiry for certain types
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set expiry based on type
    switch (this.type) {
      case 'promotion':
        this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        break;
      case 'order':
        this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
        break;
      case 'payment':
        this.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        break;
      default:
        this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);






