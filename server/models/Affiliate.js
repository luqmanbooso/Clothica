const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  affiliateCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'terminated'],
    default: 'pending'
  },
  // Commission Structure
  commissionRates: {
    firstOrder: {
      type: Number,
      default: 10, // 10% on first order
      min: 0,
      max: 100
    },
    recurringOrders: {
      type: Number,
      default: 5, // 5% on recurring orders
      min: 0,
      max: 100
    },
    lifetime: {
      type: Number,
      default: 2, // 2% lifetime commission
      min: 0,
      max: 100
    }
  },
  // Performance Tracking
  performance: {
    totalReferrals: { type: Number, default: 0 },
    activeReferrals: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  // Referral Tracking
  referrals: [{
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    commission: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'cancelled'],
      default: 'pending'
    },
    orderValue: Number,
    commissionRate: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  // Payment Information
  paymentInfo: {
    method: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe', 'check'],
      default: 'bank_transfer'
    },
    accountDetails: {
      bankName: String,
      accountNumber: String,
      routingNumber: String,
      accountHolder: String,
      paypalEmail: String,
      stripeAccount: String
    },
    minimumPayout: {
      type: Number,
      default: 50 // Minimum $50 for payout
    }
  },
  // Payout History
  payouts: [{
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    method: String,
    reference: String,
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  // Marketing Materials
  marketingMaterials: {
    banners: [String],
    links: [String],
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String
    },
    website: String,
    description: String
  },
  // Settings & Preferences
  settings: {
    autoApprove: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    commissionNotifications: { type: Boolean, default: true },
    payoutNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: true }
  },
  // Analytics & Tracking
  analytics: {
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 },
    lastActivity: Date,
    topPerformingLinks: [{
      link: String,
      clicks: Number,
      conversions: Number
    }]
  },
  // Compliance & Verification
  verification: {
    isVerified: { type: Boolean, default: false },
    verificationDate: Date,
    documents: [{
      type: String,
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      notes: String
    }],
    taxInfo: {
      taxId: String,
      taxForm: String,
      country: String
    }
  },
  // Advanced Features
  tier: {
    type: String,
    enum: ['starter', 'professional', 'enterprise'],
    default: 'starter'
  },
  customCommissionRates: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    rate: Number,
    validFrom: Date,
    validUntil: Date
  }],
  notes: String
}, {
  timestamps: true
});

// Indexes for performance
affiliateSchema.index({ affiliateCode: 1 });
affiliateSchema.index({ status: 1 });
affiliateSchema.index({ 'performance.totalCommission': -1 });
affiliateSchema.index({ createdAt: -1 });

// Virtual for pending commission
affiliateSchema.virtual('pendingCommission').get(function() {
  return this.referrals
    .filter(ref => ref.status === 'pending' || ref.status === 'approved')
    .reduce((sum, ref) => sum + (ref.commission || 0), 0);
});

// Virtual for available for payout
affiliateSchema.virtual('availableForPayout').get(function() {
  return this.pendingCommission;
});

// Method to add referral
affiliateSchema.methods.addReferral = function(referredUser, order, orderValue) {
  const commissionRate = this.referrals.length === 0 ? 
    this.commissionRates.firstOrder : 
    this.commissionRates.recurringOrders;
  
  const commission = (orderValue * commissionRate) / 100;
  
  this.referrals.push({
    referredUser: referredUser._id,
    order: order._id,
    commission,
    orderValue,
    commissionRate,
    status: 'pending'
  });
  
  // Update performance metrics
  this.performance.totalReferrals += 1;
  this.performance.totalOrders += 1;
  this.performance.totalRevenue += orderValue;
  this.performance.totalCommission += commission;
  this.performance.averageOrderValue = this.performance.totalRevenue / this.performance.totalOrders;
  this.performance.conversionRate = (this.performance.totalOrders / this.performance.totalReferrals) * 100;
  
  return this.save();
};

// Method to approve commission
affiliateSchema.methods.approveCommission = function(referralId) {
  const referral = this.referrals.id(referralId);
  if (referral) {
    referral.status = 'approved';
    return this.save();
  }
  throw new Error('Referral not found');
};

// Method to process payout
affiliateSchema.methods.processPayout = function(amount, method, reference) {
  if (amount < this.paymentInfo.minimumPayout) {
    throw new Error(`Minimum payout amount is $${this.paymentInfo.minimumPayout}`);
  }
  
  if (amount > this.pendingCommission) {
    throw new Error('Insufficient pending commission');
  }
  
  this.payouts.push({
    amount,
    method,
    reference,
    status: 'processing'
  });
  
  // Mark commissions as paid
  let remainingAmount = amount;
  for (let referral of this.referrals) {
    if (referral.status === 'approved' && remainingAmount > 0) {
      const commissionToPay = Math.min(referral.commission, remainingAmount);
      referral.status = 'paid';
      remainingAmount -= commissionToPay;
    }
  }
  
  return this.save();
};

// Method to calculate earnings for period
affiliateSchema.methods.calculateEarnings = function(startDate, endDate) {
  const referrals = this.referrals.filter(ref => {
    const refDate = new Date(ref.date);
    return refDate >= startDate && refDate <= endDate;
  });
  
  return {
    totalReferrals: referrals.length,
    totalOrders: referrals.filter(ref => ref.status !== 'cancelled').length,
    totalRevenue: referrals.reduce((sum, ref) => sum + (ref.orderValue || 0), 0),
    totalCommission: referrals.reduce((sum, ref) => sum + (ref.commission || 0), 0),
    pendingCommission: referrals
      .filter(ref => ref.status === 'pending' || ref.status === 'approved')
      .reduce((sum, ref) => sum + (ref.commission || 0), 0)
  };
};

// Pre-save middleware
affiliateSchema.pre('save', function(next) {
  // Auto-generate affiliate code if not provided
  if (!this.affiliateCode) {
    this.affiliateCode = `AFF${this.user.toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  
  next();
});

module.exports = mongoose.model('Affiliate', affiliateSchema);

