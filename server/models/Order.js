const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    selectedSize: {
      type: String,
      required: false
    },
    selectedColor: {
      type: String,
      required: false
    },
    price: {
      type: Number,
      required: true
    },
    image: String,
    total: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  estimatedDelivery: {
    type: Date
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  },
  
  // Coupon Integration
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  discount: {
    type: Number,
    default: 0
  },
  
  // Loyalty Integration
  loyaltyPoints: {
    earned: {
      type: Number,
      default: 0
    },
    multiplier: {
      type: Number,
      default: 1
    },
    applied: {
      type: Number,
      default: 0
    }
  },
  
  // Spin Token Integration
  spinTokenEligible: {
    type: Boolean,
    default: false
  },
  
  // Badge Triggers
  badgeTriggers: [{
    type: String,
    description: String,
    triggeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Enhanced Order Management Fields
  shippedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  
  // Refund Management
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refunds: [{
    type: {
      type: String,
      enum: ['full', 'partial'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    items: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      refundAmount: {
        type: Number,
        required: true
      }
    }],
    processedAt: {
      type: Date,
      default: Date.now
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    }
  }],
  
  // Audit Trail
  auditLog: [{
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.tax = this.subtotal * 0.1; // 10% tax
  this.shippingCost = this.subtotal > 100 ? 0 : 10; // Free shipping over $100
  this.total = this.subtotal + this.tax + this.shippingCost;
  next();
});

module.exports = mongoose.model('Order', orderSchema); 