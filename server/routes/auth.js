const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Google OAuth client
console.log('🔐 [GOOGLE OAUTH] Initializing Google OAuth client...');
console.log('🔐 [GOOGLE OAUTH] Client ID from env:', process.env.GOOGLE_CLIENT_ID);
console.log('🔐 [GOOGLE OAUTH] Client ID length:', process.env.GOOGLE_CLIENT_ID?.length || 0);
console.log('🔐 [GOOGLE OAUTH] Client ID format valid:', process.env.GOOGLE_CLIENT_ID?.includes('.apps.googleusercontent.com') || false);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
console.log('🔐 [GOOGLE OAUTH] Google OAuth client initialized successfully');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').optional().custom((value, { req }) => {
    // For Google accounts, password is not required
    if (req.body.isGoogleAccount) {
      return true; // Skip password validation for Google accounts
    }
    // For regular accounts, password must be at least 6 characters
    if (!value || value.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    return true;
  }),
  body('phone').optional().trim().isLength({ min: 0 }).withMessage('Phone number is invalid'),
  body('isGoogleAccount').optional().isBoolean().withMessage('isGoogleAccount must be a boolean'),
  body('googleId').optional().isString().withMessage('Google ID must be a string'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, isGoogleAccount, googleId, avatar } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // For Google accounts, password is not required
    if (!isGoogleAccount && !password) {
      return res.status(400).json({ message: 'Password is required for regular registration' });
    }

    // Create new user
    user = new User({
      name,
      email,
      phone,
      isGoogleAccount: isGoogleAccount || false,
      googleId: isGoogleAccount ? googleId : undefined,
      avatar: isGoogleAccount ? avatar : undefined,
      cart: [], // Initialize empty cart
      wishlist: [], // Initialize empty wishlist
      googleProvided: {
        name: isGoogleAccount || false,
        email: isGoogleAccount || false,
        phone: false
      }
    });

    // Only set password for non-Google accounts
    if (!isGoogleAccount) {
      user.password = password;
      // Generate OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailVerificationOTP = otp;
      user.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
      // Send OTP email
      console.log('Attempting to send OTP email to:', email);
      console.log('OTP generated:', otp);
      console.log('Email service instance:', !!emailService);
      console.log('Email service methods:', Object.keys(emailService));
      console.log('Email service transporter:', !!emailService.transporter);
      
      try {
        const emailSent = await emailService.sendOTPEmail(email, otp, name);
        console.log('Email service response:', emailSent);
        if (!emailSent) {
          console.error('Failed to send OTP email - emailSent returned false');
          return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        }
        console.log('OTP email sent successfully');
      } catch (emailError) {
        console.error('Email service error:', emailError);
        return res.status(500).json({ message: 'Email service error. Please try again.' });
      }
    } else {
      // Google accounts are pre-verified
      user.isEmailVerified = true;
      user.isGoogleAccount = true;
      await user.save();
      // Try to send welcome email, but don't fail if email service is down
      try {
        await emailService.sendWelcomeEmail(email, name);
        console.log('Welcome email sent successfully to:', email);
      } catch (emailError) {
        console.log('Welcome email failed, but continuing with Google signup:', emailError.message);
      }
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token: isGoogleAccount ? token : null, // No token until OTP verified for regular users
          user: user.getPublicProfile(),
          message: isGoogleAccount 
            ? 'Google account created successfully! Welcome to Clothica!' 
            : 'Registration successful! Please check your email for OTP verification.',
          requiresOTPVerification: !isGoogleAccount
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.' 
      });
    }

    // Check if user has password (Google OAuth users might not)
    if (!user.password) {
      return res.status(400).json({ message: 'This account was created with Google. Please use Google Sign-In.' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    
    // Update last login
    user.lastLoginDate = Date.now();
    await user.save();

    // Generate JWT token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    // Generate access token (7 days)
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        
        // Generate refresh token (30 days)
        jwt.sign(
          payload,
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
          { expiresIn: '30d' },
          (err, refreshToken) => {
            if (err) throw err;

    res.json({
      token,
              refreshToken,
              user: user.getPublicProfile()
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/google/signup
// @desc    Google OAuth signup (only for new users)
// @access  Public
router.post('/google/signup', async (req, res) => {
  try {
    console.log('🔐 [GOOGLE SIGNUP] Request received');
    console.log('🔐 [GOOGLE SIGNUP] Request body:', { 
      hasIdToken: !!req.body.idToken, 
      idTokenLength: req.body.idToken?.length || 0,
      bodyKeys: Object.keys(req.body)
    });

    const { idToken } = req.body;

    if (!idToken) {
      console.log('❌ [GOOGLE SIGNUP] No ID token provided');
      return res.status(400).json({ message: 'Google ID token is required' });
    }

    console.log('🔐 [GOOGLE SIGNUP] Google Client ID from env:', process.env.GOOGLE_CLIENT_ID);
    console.log('🔐 [GOOGLE SIGNUP] Attempting to verify Google ID token...');

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    console.log('✅ [GOOGLE SIGNUP] Google token verified successfully');
    console.log('🔐 [GOOGLE SIGNUP] Ticket payload:', {
      hasPayload: !!ticket.getPayload(),
      payloadKeys: Object.keys(ticket.getPayload() || {})
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    console.log('🔐 [GOOGLE SIGNUP] Extracted user data:', {
      googleId: googleId?.substring(0, 10) + '...',
      email,
      name,
      hasPicture: !!picture
    });

    // Check if user already exists with this Google ID
    console.log('🔐 [GOOGLE SIGNUP] Checking for existing user with Google ID...');
    let existingUser = await User.findOne({ googleId });
    if (existingUser) {
      console.log('❌ [GOOGLE SIGNUP] User already exists with Google ID:', existingUser.email);
      return res.status(400).json({ 
        message: 'Account already exists with this Google account. Please use Google Sign-In instead.' 
      });
    }

    // Check if user exists with this email
    console.log('🔐 [GOOGLE SIGNUP] Checking for existing user with email...');
    existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ [GOOGLE SIGNUP] User already exists with email:', existingUser.email);
      return res.status(400).json({ 
        message: 'Email already registered. Please use regular login or link your Google account.' 
      });
    }

    console.log('✅ [GOOGLE SIGNUP] No existing user found, creating new user...');

    // Create new Google user with normalized structure (same as regular users)
    console.log('🔐 [GOOGLE SIGNUP] Creating new user object...');
    const user = new User({
      name,
      email,
      googleId,
      avatar: picture,
      phone: '', // Default empty phone
      isGoogleAccount: true,
      googleProvided: {
        name: true,
        email: true,
        phone: false
      },
      isEmailVerified: true, // Google accounts are pre-verified
      isPhoneVerified: false,
      profileComplete: true, // Mark as complete by default for Google users
      role: 'user', // Explicit role
      isActive: true, // Explicit active status
      loyaltyTier: 'bronze', // Default loyalty tier (same as regular users)
      loyaltyMembership: 'bronze',
      currentBadge: 'none',
      loginStreak: 0,
      totalEarnings: 0,
      totalPointsEarned: 0,
      totalPointsRedeemed: 0,
      spinChances: 0,
      spinsUsed: 0,
      lastSpinReset: new Date(),
      referralCode: '', // Will be generated after user creation
      // Initialize empty arrays
      addresses: [],
      wishlist: [],
      cart: [],
      referrals: [],
      eligibleOffers: [],
      loyaltyHistory: [],
      spinHistory: [],
      badgeHistory: [],
      // Initialize default objects
      preferences: {},
      stats: {},
      tierProgress: {}
    });

    console.log('🔐 [GOOGLE SIGNUP] Generating referral code...');
    user.referralCode = user.generateReferralCode();
    
    console.log('🔐 [GOOGLE SIGNUP] Saving user to database...');
    await user.save();
    console.log('✅ [GOOGLE SIGNUP] User saved successfully with ID:', user._id);
    console.log('✅ [GOOGLE SIGNUP] Referral code generated:', user.referralCode);

    // Send welcome email
    console.log('🔐 [GOOGLE SIGNUP] Attempting to send welcome email...');
    try {
      await emailService.sendWelcomeEmail(email, name);
      console.log('✅ [GOOGLE SIGNUP] Welcome email sent successfully to:', email);
    } catch (emailError) {
      console.log('⚠️ [GOOGLE SIGNUP] Welcome email failed, but continuing with Google signup:', emailError.message);
    }

    // Generate JWT token
    console.log('🔐 [GOOGLE SIGNUP] Generating JWT token...');
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('❌ [GOOGLE SIGNUP] JWT signing error:', err);
          throw err;
        }
        console.log('✅ [GOOGLE SIGNUP] JWT token generated successfully');
        console.log('✅ [GOOGLE SIGNUP] Sending success response to client');
        res.json({
          token,
          user: user.getPublicProfile(),
          message: 'Google account created successfully! Welcome to Clothica!',
          requiresProfileCompletion: false
        });
      }
    );
  } catch (error) {
    console.error('❌ [GOOGLE SIGNUP] Error occurred:', error.message);
    console.error('❌ [GOOGLE SIGNUP] Error stack:', error.stack);
    console.error('❌ [GOOGLE SIGNUP] Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    
    // Check if it's a Google verification error
    if (error.message?.includes('audience')) {
      console.error('❌ [GOOGLE SIGNUP] This looks like a Google client ID mismatch!');
      console.error('❌ [GOOGLE SIGNUP] Expected audience:', process.env.GOOGLE_CLIENT_ID);
    }
    
    res.status(500).json({ message: 'Server error during Google signup' });
  }
});

// @route   POST /api/auth/google/login
// @desc    Google OAuth login (only for existing users)
// @access  Public
router.post('/google/login', async (req, res) => {
  try {
    console.log('🔐 [GOOGLE LOGIN] Request received');
    console.log('🔐 [GOOGLE LOGIN] Request body:', { 
      hasIdToken: !!req.body.idToken, 
      idTokenLength: req.body.idToken?.length || 0,
      bodyKeys: Object.keys(req.body)
    });

    const { idToken } = req.body;

    if (!idToken) {
      console.log('❌ [GOOGLE LOGIN] No ID token provided');
      return res.status(400).json({ message: 'Google ID token is required' });
    }

    console.log('🔐 [GOOGLE LOGIN] Google Client ID from env:', process.env.GOOGLE_CLIENT_ID);
    console.log('🔐 [GOOGLE LOGIN] Attempting to verify Google ID token...');

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    console.log('✅ [GOOGLE LOGIN] Google token verified successfully');
    console.log('🔐 [GOOGLE LOGIN] Ticket payload:', {
      hasPayload: !!ticket.getPayload(),
      payloadKeys: Object.keys(ticket.getPayload() || {})
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;

    console.log('🔐 [GOOGLE LOGIN] Extracted user data:', {
      googleId: googleId?.substring(0, 10) + '...',
      email
    });

    // Check if user exists with this Google ID
    console.log('🔐 [GOOGLE LOGIN] Checking for existing user with Google ID...');
    const user = await User.findOne({ googleId });
    if (!user) {
      console.log('❌ [GOOGLE LOGIN] User not found with Google ID:', googleId?.substring(0, 10) + '...');
      return res.status(401).json({ 
        message: 'Google account not found. Please sign up with Google first.' 
      });
    }

    console.log('✅ [GOOGLE LOGIN] User found:', user.email);

    // Normalize Google user structure if needed (one-time migration)
    let userUpdated = false;
    if (!user.loyaltyTier) {
      user.loyaltyTier = 'bronze';
      userUpdated = true;
    }
    if (!user.loyaltyMembership) {
      user.loyaltyMembership = 'bronze';
      userUpdated = true;
    }
    if (!user.referralCode) {
      user.referralCode = user.generateReferralCode();
      userUpdated = true;
    }
    if (user.profileComplete === undefined || user.profileComplete === false) {
      user.profileComplete = true; // Mark Google users as complete by default
      userUpdated = true;
    }
    if (userUpdated) {
      console.log('🔄 [GOOGLE LOGIN] Normalizing user structure...');
      await user.save();
    }

    // Check if account is locked
    if (user.isLocked) {
      console.log('❌ [GOOGLE LOGIN] Account is locked for user:', user.email);
      return res.status(423).json({ 
        message: 'Account is temporarily locked. Please try again later.' 
      });
    }

    console.log('✅ [GOOGLE LOGIN] Account is not locked');

    // Update last login
    console.log('🔐 [GOOGLE LOGIN] Updating last login date...');
    user.lastLoginDate = Date.now();
    await user.save();

    // Reset login attempts on successful login
    console.log('🔐 [GOOGLE LOGIN] Resetting login attempts...');
    await user.resetLoginAttempts();

    // Generate JWT token
    console.log('🔐 [GOOGLE LOGIN] Generating JWT token...');
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('❌ [GOOGLE LOGIN] JWT signing error:', err);
          throw err;
        }
        console.log('✅ [GOOGLE LOGIN] JWT token generated successfully');
        console.log('✅ [GOOGLE LOGIN] Sending success response to client');
        res.json({
          token,
          user: user.getPublicProfile(),
          message: 'Google login successful!',
          requiresProfileCompletion: false
        });
      }
    );
  } catch (error) {
    console.error('❌ [GOOGLE LOGIN] Error occurred:', error.message);
    console.error('❌ [GOOGLE LOGIN] Error stack:', error.stack);
    console.error('❌ [GOOGLE LOGIN] Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    
    // Check if it's a Google verification error
    if (error.message?.includes('audience')) {
      console.error('❌ [GOOGLE LOGIN] This looks like a Google client ID mismatch!');
      console.error('❌ [GOOGLE LOGIN] Expected audience:', process.env.GOOGLE_CLIENT_ID);
      return res.status(401).json({ 
        message: 'Google OAuth configuration error. Please check your setup.',
        error: 'INVALID_AUDIENCE'
      });
    }

    // Check if it's a token verification error
    if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
      console.error('❌ [GOOGLE LOGIN] Token verification failed:', error.message);
      return res.status(401).json({ 
        message: 'Invalid or expired Google token. Please try again.',
        error: 'INVALID_TOKEN'
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      message: 'Server error during Google login',
      error: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();

    res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send new verification email
    await emailService.sendEmailVerification(email, verificationToken, user.name);

    res.json({ message: 'Verification email sent successfully!' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error while resending verification' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    await emailService.sendPasswordReset(email, resetToken, user.name);

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error while processing password reset request' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    res.json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP for phone verification
// @access  Private
router.post('/send-otp', auth, [
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = user.generatePhoneVerificationOTP();
    user.phone = phone;
    
    await user.save();

    // Send OTP via email (in production, you'd use SMS service)
    await emailService.sendOTPEmail(user.email, otp, user.name);

    res.json({ message: 'OTP sent successfully to your email!' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for phone verification
// @access  Private
router.post('/verify-otp', auth, [
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { otp } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.phoneVerificationOTP) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (user.isOTPExpired()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.phoneVerificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark phone as verified
    user.isPhoneVerified = true;
    user.phoneVerificationOTP = undefined;
    user.phoneVerificationExpires = undefined;
    
    await user.save();

    res.json({ message: 'Phone verified successfully!' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error while verifying OTP' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.getPublicProfile());
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) {
      user.phone = phone;
      user.isPhoneVerified = false; // Reset phone verification when phone changes
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Cannot change password for Google OAuth accounts' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

// @route   PUT /api/auth/complete-profile
// @desc    Complete user profile (especially for Google users)
// @access  Private
router.put('/complete-profile', auth, [
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('addresses').isArray({ min: 1 }).withMessage('At least one address is required'),
  body('addresses.*.type').isIn(['shipping', 'billing']).withMessage('Address type must be shipping or billing'),
  body('addresses.*.firstName').trim().notEmpty().withMessage('First name is required'),
  body('addresses.*.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('addresses.*.address').trim().notEmpty().withMessage('Address is required'),
  body('addresses.*.city').trim().notEmpty().withMessage('City is required'),
  body('addresses.*.state').trim().notEmpty().withMessage('State is required'),
  body('addresses.*.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('addresses.*.country').trim().notEmpty().withMessage('Country is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, addresses } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update phone (Google users can't change Google-provided fields)
    if (phone && !user.googleProvided.phone) {
      user.phone = phone;
      user.isPhoneVerified = false; // Will need verification
    }

    // Update addresses
    user.addresses = addresses;

    // Update profile completion status
    await user.updateProfileCompletion();

    res.json({
      message: 'Profile completed successfully!',
      user: user.getPublicProfile(),
      requiresPhoneVerification: !user.isPhoneVerified
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Server error while completing profile' });
  }
});

// @route   POST /api/auth/verify-email-otp
// @desc    Verify email OTP during registration
// @access  Public
router.post('/verify-email-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP is valid and not expired
    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.emailVerificationOTPExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, user.name);
      console.log('Welcome email sent successfully to:', email);
    } catch (emailError) {
      console.log('Welcome email failed, but continuing with verification:', emailError.message);
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: user.getPublicProfile(),
          message: 'Email verified successfully! Welcome to Clothica!'
        });
      }
    );
  } catch (error) {
    console.error('Email OTP verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

// @route   POST /api/auth/resend-email-otp
// @desc    Resend email OTP during registration
// @access  Public
router.post('/resend-email-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    try {
      const emailSent = await emailService.sendOTPEmail(email, otp, user.name);
      if (!emailSent) {
        return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      return res.status(500).json({ message: 'Email service error. Please try again.' });
    }

    res.json({ message: 'New OTP sent successfully! Please check your email.' });
  } catch (error) {
    console.error('Resend email OTP error:', error);
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
});

// @route   GET /api/auth/test-email
// @desc    Test email service (for debugging)
// @access  Public
router.get('/test-email', async (req, res) => {
  try {
    console.log('Testing email service...');
    console.log('Email service instance:', !!emailService);
    console.log('Email service methods:', Object.keys(emailService));
    console.log('Email service transporter:', !!emailService.transporter);
    console.log('Environment variables:');
    console.log('- SMTP_HOST:', process.env.SMTP_HOST);
    console.log('- SMTP_PORT:', process.env.SMTP_PORT);
    console.log('- SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
    console.log('- SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
    console.log('- CLIENT_URL:', process.env.CLIENT_URL);
    
    if (!emailService.transporter) {
      return res.status(500).json({ 
        message: 'Email service not initialized',
        error: 'Transporter is null - check environment variables'
      });
    }
    
    res.json({ 
      message: 'Email service test completed',
      hasTransporter: !!emailService.transporter,
      envVars: {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT SET',
        SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
        CLIENT_URL: process.env.CLIENT_URL
      }
    });
  } catch (error) {
    console.error('Email service test error:', error);
    res.status(500).json({ message: 'Email service test failed', error: error.message });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh-token', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }

    // Generate new access token
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: user.getPublicProfile()
        });
      }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    res.status(500).json({ message: 'Server error during token refresh' });
  }
});

module.exports = router; 