const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  isGoogleAccount: {
    type: Boolean,
    default: false
  },
  googleProvided: {
    name: {
      type: Boolean,
      default: false
    },
    email: {
      type: Boolean,
      default: false
    },
    phone: {
      type: Boolean,
      default: false
    }
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  emailVerificationOTP: String,
  emailVerificationOTPExpires: Date,
  phoneVerificationOTP: String,
  phoneVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  addresses: [{
    type: {
      type: String,
      enum: ['shipping', 'billing'],
      required: true
    },
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String,
    isDefault: Boolean
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // Enhanced Loyalty System Integration
  loyaltyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loyalty'
  },
  
  // Legacy loyalty fields for backward compatibility
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  loyaltyMembership: { 
    type: String, 
    enum: ['none', 'bronze', 'silver', 'gold', 'vip'], 
    default: 'none' 
  },
  loyaltyTier: { 
    type: String, 
    enum: ['none', 'bronze', 'silver', 'gold', 'vip'], 
    default: 'none' 
  },
  
  // User Statistics for Badge Triggers
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    purchaseStreak: {
      type: Number,
      default: 0
    },
    lastPurchaseDate: Date,
    reviewCount: {
      type: Number,
      default: 0
    },
    referralCount: {
      type: Number,
      default: 0
    },
    spinCount: {
      type: Number,
      default: 0
    }
  },
  
  // Addiction Mechanics
  loginStreak: {
    type: Number,
    default: 0
  },
  lastLoginDate: Date,
  birthday: Date,
  referralCode: String,
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referrals: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bonusPoints: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  totalEarnings: {
    type: Number,
    default: 0
  },
  
  // Special Offers & Events
  eligibleOffers: [{
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpecialOffer'
    },
    eligibility: {
      type: String,
      enum: ['eligible', 'claimed', 'expired'],
      default: 'eligible'
    },
    claimedAt: Date
  }],
  
  // Legacy field for backward compatibility
  lastLogin: { type: Date, default: Date.now },
  
  // Spin System
  spinChances: { type: Number, default: 0 },
  spinsUsed: { type: Number, default: 0 },
  lastSpinReset: { type: Date, default: Date.now },
  spinHistory: [{
    date: { type: Date, default: Date.now },
    won: Boolean,
    couponCode: String,
    discount: Number,
    description: String
  }],
  
  // Badge System
  currentBadge: { type: String, enum: ['none', 'bronze', 'silver', 'gold', 'vip'], default: 'none' },
  badgeHistory: [{
    badge: String,
    earnedAt: { type: Date, default: Date.now },
    pointsRequired: Number
  }],
  
  // Affiliate System
  affiliateCode: String,
  
  // Shopping Cart
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    selectedSize: String,
    selectedColor: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to ensure loyalty field consistency
userSchema.pre('save', function(next) {
  // Ensure loyaltyTier and loyaltyMembership are in sync
  if (this.loyaltyTier && !this.loyaltyMembership) {
    this.loyaltyMembership = this.loyaltyTier;
  } else if (this.loyaltyMembership && !this.loyaltyTier) {
    this.loyaltyTier = this.loyaltyMembership;
  }
  
  // Ensure lastLogin and lastLoginDate are in sync
  if (this.lastLogin && !this.lastLoginDate) {
    this.lastLoginDate = this.lastLogin;
  } else if (this.lastLoginDate && !this.lastLogin) {
    this.lastLogin = this.lastLoginDate;
  }
  
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

// Method to generate phone verification OTP
userSchema.methods.generatePhoneVerificationOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneVerificationOTP = otp;
  this.phoneVerificationExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return token;
};

// Method to check if OTP is expired
userSchema.methods.isOTPExpired = function() {
  return this.phoneVerificationExpires < Date.now();
};

// Loyalty System Methods
userSchema.methods.addLoyaltyPoints = function(action, points, description) {
  this.loyaltyPoints += points;
  
  // Add to history
  this.loyaltyHistory.push({
    action,
    points,
    description,
    date: new Date()
  });
  
  // Update tier progress
  this.updateTierProgress();
  
  return this.save();
};

// Method to update tier progress
userSchema.methods.updateTierProgress = function() {
  const tiers = {
    bronze: { min: 0, max: 49, next: 'silver', pointsNeeded: 50 },
    silver: { min: 50, max: 199, next: 'gold', pointsNeeded: 200 },
    gold: { min: 200, max: 499, next: 'vip', pointsNeeded: 500 },
    vip: { min: 500, max: Infinity, next: null, pointsNeeded: 0 }
  };
  
  const currentTier = tiers[this.loyaltyMembership];
  const nextTier = currentTier.next ? tiers[currentTier.next] : null;
  
  this.tierProgress = {
    currentPoints: this.loyaltyPoints,
    pointsToNextTier: nextTier ? nextTier.pointsNeeded - this.loyaltyPoints : 0,
    nextTier: nextTier ? nextTier.next : this.loyaltyMembership
  };
  
  // Check if user should be promoted
  if (nextTier && this.loyaltyPoints >= nextTier.pointsNeeded) {
    this.loyaltyMembership = nextTier.next;
    this.tierProgress.nextTier = tiers[nextTier.next]?.next || nextTier.next;
  }
};

userSchema.methods.generateAffiliateCode = function() {
  if (!this.affiliateCode) {
    const baseCode = this.email.split('@')[0].substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.affiliateCode = `${baseCode}${randomNum}`;
  }
  return this.affiliateCode;
};

userSchema.methods.addReferral = function(referredUser, commission) {
  this.referrals.push({
    user: referredUser._id,
    commission,
    status: 'pending',
    date: new Date()
  });
  
  // Add referral bonus points
  this.addLoyaltyPoints('referral', 100, `Referred ${referredUser.email}`);
  
  return this.save();
};

userSchema.methods.getLoyaltyBenefits = function() {
  const benefits = {
    none: {
      discount: 5,
      freeShipping: false,
      prioritySupport: false,
      exclusiveOffers: true,
      redemptionBonus: 10
    },
    bronze: {
      discount: 10,
      freeShipping: true,
      prioritySupport: true,
      exclusiveOffers: true,
      redemptionBonus: 15
    },
    silver: {
      discount: 12,
      freeShipping: true,
      prioritySupport: true,
      exclusiveOffers: true,
      redemptionBonus: 16
    },
    gold: {
      discount: 14,
      freeShipping: true,
      prioritySupport: true,
      exclusiveOffers: true,
      redemptionBonus: 18
    },
    vip: {
      discount: 15,
      freeShipping: true,
      prioritySupport: true,
      exclusiveOffers: true,
      vipEvents: true,
      redemptionBonus: 20
    }
  };
  
  return benefits[this.loyaltyMembership] || benefits.none;
};

// Dialog StarPay Style Loyalty Methods
userSchema.methods.earnPoints = function(amount, action = 'purchase') {
  let pointsEarned = amount;
  
  // Apply membership multiplier
  if (this.loyaltyMembership === 'bronze') {
    pointsEarned = Math.floor(amount * 1.5);
  } else if (this.loyaltyMembership === 'vip') {
    pointsEarned = Math.floor(amount * 2);
  }
  
  // Apply weekend bonus (2x on weekends)
  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  if (isWeekend) {
    pointsEarned = Math.floor(pointsEarned * 2);
  }
  
  // Apply birthday month bonus (3x in birthday month)
  if (this.birthday) {
    const birthMonth = this.birthday.getMonth();
    const currentMonth = today.getMonth();
    if (birthMonth === currentMonth) {
      pointsEarned = Math.floor(pointsEarned * 3);
    }
  }
  
  this.loyaltyPoints += pointsEarned;
  this.totalPointsEarned += pointsEarned;
  
  // Add to history
  this.loyaltyHistory.push({
    action,
    points: pointsEarned,
    description: `Earned ${pointsEarned} points from ${action}`,
    date: new Date()
  });
  
  return this.save();
};

userSchema.methods.redeemPoints = function(pointsToRedeem) {
  if (pointsToRedeem < 100) {
    throw new Error('Minimum redemption is 100 points');
  }
  
  if (pointsToRedeem > this.loyaltyPoints) {
    throw new Error('Insufficient points');
  }
  
  // Calculate redemption value based on membership
  let redemptionValue = pointsToRedeem;
  
  if (this.loyaltyMembership === 'none') {
    redemptionValue = Math.floor(pointsToRedeem * 1.1); // 10% bonus
  } else if (this.loyaltyMembership === 'bronze') {
    redemptionValue = Math.floor(pointsToRedeem * 1.15); // 15% bonus
  } else if (this.loyaltyMembership === 'vip') {
    redemptionValue = Math.floor(pointsToRedeem * 1.2); // 20% bonus
  }
  
  // Deduct points and update totals
  this.loyaltyPoints -= pointsToRedeem;
  this.totalPointsRedeemed += pointsToRedeem;
  this.totalRedemptionValue += redemptionValue;
  
  // Add to history
  this.loyaltyHistory.push({
    action: 'redemption',
    points: -pointsToRedeem,
    description: `Redeemed ${pointsToRedeem} points for LKR ${redemptionValue}`,
    date: new Date()
  });
  
  return this.save();
};

userSchema.methods.updateLoginStreak = function() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (!this.lastLoginDate) {
    this.loginStreak = 1;
  } else {
    const lastLogin = new Date(this.lastLoginDate);
    const timeDiff = today.getTime() - lastLogin.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff === 1) {
      this.loginStreak += 1;
    } else if (daysDiff > 1) {
      this.loginStreak = 1;
    }
  }
  
  this.lastLoginDate = today;
  
  // Give bonus points for login streaks
  if (this.loginStreak >= 7) {
    this.loyaltyPoints += 50; // Weekly streak bonus
    this.loyaltyHistory.push({
      action: 'login_streak',
      points: 50,
      description: `7-day login streak bonus`,
      date: new Date()
    });
  }
  
  if (this.loginStreak >= 30) {
    this.loyaltyPoints += 200; // Monthly streak bonus
    this.loyaltyHistory.push({
      action: 'login_streak',
      points: 200,
      description: `30-day login streak bonus`,
      date: new Date()
    });
  }
  
  return this.save();
};

userSchema.methods.generateReferralCode = function() {
  const baseCode = this.email.split('@')[0].substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${baseCode}${randomNum}`;
};

userSchema.methods.getLoyaltyBenefits = function() {
  const benefits = {
    none: {
      pointMultiplier: 1,
      redemptionBonus: 10,
      freeShipping: false,
      earlyAccess: false,
      weekendBonus: true,
      birthdayBonus: true
    },
    bronze: {
      pointMultiplier: 1.5,
      redemptionBonus: 15,
      freeShipping: true,
      earlyAccess: true,
      weekendBonus: true,
      birthdayBonus: true
    },
    silver: {
      pointMultiplier: 1.8,
      redemptionBonus: 16,
      freeShipping: true,
      earlyAccess: true,
      weekendBonus: true,
      birthdayBonus: true
    },
    gold: {
      pointMultiplier: 1.9,
      redemptionBonus: 18,
      freeShipping: true,
      earlyAccess: true,
      weekendBonus: true,
      birthdayBonus: true
    },
    vip: {
      pointMultiplier: 2,
      redemptionBonus: 20,
      freeShipping: true,
      earlyAccess: true,
      weekendBonus: true,
      birthdayBonus: true,
      exclusiveOffers: true
    }
  };
  
  return benefits[this.loyaltyMembership] || benefits.none;
};

// Pre-save middleware to update tier progress
userSchema.pre('save', async function(next) {
  if (this.isModified('loyaltyPoints')) {
    this.updateTierProgress();
  }
  
  if (this.isModified('email') && !this.affiliateCode) {
    this.generateAffiliateCode();
  }
  
  next();
});

// Method to check if password reset token is expired
userSchema.methods.isPasswordResetExpired = function() {
  return this.passwordResetExpires < Date.now();
};

// Method to check if profile is complete
userSchema.methods.isProfileComplete = function() {
  return this.name && this.email && this.phone && this.addresses && this.addresses.length > 0;
};

// Static method to migrate existing user data
userSchema.statics.migrateUserData = async function() {
  const users = await this.find({});
  
  for (const user of users) {
    let needsUpdate = false;
    
    // Ensure loyalty fields are consistent - prioritize loyaltyTier if it exists
    if (user.loyaltyTier && user.loyaltyTier !== 'none') {
      if (user.loyaltyMembership !== user.loyaltyTier) {
        user.loyaltyMembership = user.loyaltyTier;
        needsUpdate = true;
      }
    } else if (user.loyaltyMembership && user.loyaltyMembership !== 'none') {
      if (user.loyaltyTier !== user.loyaltyMembership) {
        user.loyaltyTier = user.loyaltyMembership;
        needsUpdate = true;
      }
    }
    
    // Ensure login date fields are consistent
    if (user.lastLogin && !user.lastLoginDate) {
      user.lastLoginDate = user.lastLogin;
      needsUpdate = true;
    } else if (user.lastLoginDate && !user.lastLogin) {
      user.lastLogin = user.lastLoginDate;
      needsUpdate = true;
    }
    
    // Ensure required fields have defaults
    if (!user.loyaltyPoints) {
      user.loyaltyPoints = 0;
      needsUpdate = true;
    }
    
    if (!user.currentBadge) {
      user.currentBadge = 'none';
      needsUpdate = true;
    }
    
    if (!user.spinChances) {
      user.spinChances = 0;
      needsUpdate = true;
    }
    
    if (!user.spinsUsed) {
      user.spinsUsed = 0;
      needsUpdate = true;
    }
    
    if (!user.lastSpinReset) {
      user.lastSpinReset = new Date();
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await user.save();
    }
  }
  
  return { message: 'User data migration completed' };
};

// Method to update profile completion status
userSchema.methods.updateProfileCompletion = function() {
  this.profileComplete = this.isProfileComplete();
  return this.save();
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.phoneVerificationOTP;
  delete userObject.phoneVerificationExpires;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

// Badge & Spin Management Methods
userSchema.methods.updateBadgeAndSpins = function() {
  const oldBadge = this.currentBadge;
  
  // Calculate new badge based on points
  if (this.loyaltyPoints >= 1000) {
    this.currentBadge = 'vip';
    this.spinChances = 5;
  } else if (this.loyaltyPoints >= 500) {
    this.currentBadge = 'gold';
    this.spinChances = 3;
  } else if (this.loyaltyPoints >= 200) {
    this.currentBadge = 'silver';
    this.spinChances = 2;
  } else if (this.loyaltyPoints >= 50) {
    this.currentBadge = 'bronze';
    this.spinChances = 1;
  } else {
    this.currentBadge = 'none';
    this.spinChances = 0;
  }
  
  // If badge upgraded, add to history and reset spins
  if (this.currentBadge !== oldBadge && this.currentBadge !== 'none') {
    this.badgeHistory.push({
      badge: this.currentBadge,
      earnedAt: new Date(),
      pointsRequired: this.loyaltyPoints
    });
    
    // Reset spins for new month
    this.resetMonthlySpins();
  }
  
  return this.save();
};

userSchema.methods.resetMonthlySpins = function() {
  const now = new Date();
  const lastReset = new Date(this.lastSpinReset);
  
  // Check if it's a new month
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.spinChances = this.getSpinChancesForBadge();
    this.spinsUsed = 0;
    this.lastSpinReset = now;
    return this.save();
  }
  
  return Promise.resolve(this);
};

userSchema.methods.getSpinChancesForBadge = function() {
  switch (this.currentBadge) {
    case 'vip': return 5;
    case 'gold': return 3;
    case 'silver': return 2;
    case 'bronze': return 1;
    default: return 0;
  }
};

userSchema.methods.canSpin = function() {
  return this.spinChances > this.spinsUsed;
};

userSchema.methods.useSpin = function() {
  if (this.canSpin()) {
    this.spinsUsed++;
    return this.save();
  }
  throw new Error('No spin chances remaining');
};

module.exports = mongoose.model('User', userSchema); 