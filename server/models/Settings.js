const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Store Information
  storeName: {
    type: String,
    required: true,
    default: 'Clothica'
  },
  storeDescription: {
    type: String,
    default: 'Premium Fashion & Lifestyle Store'
  },
  storeLogo: String,
  storeFavicon: String,
  
  // Contact Information
  contactEmail: {
    type: String,
    required: true,
    default: 'admin@clothica.com'
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Business Settings
  currency: {
    type: String,
    default: 'USD'
  },
  taxRate: {
    type: Number,
    default: 8.5,
    min: 0,
    max: 100
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Shipping & Payment
  shippingMethods: [{
    name: String,
    price: Number,
    isActive: Boolean
  }],
  paymentMethods: [{
    name: String,
    isActive: Boolean,
    config: mongoose.Schema.Types.Mixed
  }],
  
  // Social Media
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    linkedin: String
  },
  
  // SEO Settings
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    googleAnalytics: String
  },
  
  // Notification Settings
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: true }
  },
  
  // Security Settings
  security: {
    requireEmailVerification: { type: Boolean, default: true },
    requirePhoneVerification: { type: Boolean, default: false },
    maxLoginAttempts: { type: Number, default: 5 },
    sessionTimeout: { type: Number, default: 24 } // hours
  },
  
  // Created and updated by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      createdBy: '000000000000000000000000' // Default admin ID
    });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
