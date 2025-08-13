const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const Order = require('../models/Order');
const { body, validationResult } = require('express-validator');

// @route   POST /api/affiliate/register
// @desc    Register as an affiliate partner
// @access  Private
router.post('/register', auth, [
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('description').optional().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('socialMedia.facebook').optional().isURL().withMessage('Invalid Facebook URL'),
  body('socialMedia.instagram').optional().isURL().withMessage('Invalid Instagram URL'),
  body('socialMedia.twitter').optional().isURL().withMessage('Invalid Twitter URL'),
  body('socialMedia.linkedin').optional().isURL().withMessage('Invalid LinkedIn URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already an affiliate
    const existingAffiliate = await Affiliate.findOne({ user: req.user._id });
    if (existingAffiliate) {
      return res.status(400).json({ message: 'User is already registered as an affiliate' });
    }

    // Generate affiliate code
    const affiliateCode = user.generateAffiliateCode();

    // Create affiliate profile
    const affiliate = new Affiliate({
      user: req.user._id,
      affiliateCode,
      marketingMaterials: {
        website: req.body.website,
        description: req.body.description,
        socialMedia: req.body.socialMedia || {}
      }
    });

    await affiliate.save();

    // Update user with affiliate code
    user.affiliateCode = affiliateCode;
    await user.save();

    res.json({
      message: 'Affiliate registration successful',
      affiliateCode,
      status: 'pending',
      nextSteps: [
        'Complete your profile information',
        'Add payment details for commission payouts',
        'Start sharing your affiliate links'
      ]
    });
  } catch (error) {
    console.error('Affiliate registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/affiliate/profile
// @desc    Get affiliate profile and performance
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const affiliate = await Affiliate.findOne({ user: req.user._id })
      .populate('user', 'username email')
      .populate('referrals.referredUser', 'username email')
      .populate('referrals.order', 'total status createdAt');

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate profile not found' });
    }

    // Calculate current month earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyEarnings = affiliate.calculateEarnings(startOfMonth, endOfMonth);

    res.json({
      profile: {
        affiliateCode: affiliate.affiliateCode,
        status: affiliate.status,
        tier: affiliate.tier,
        commissionRates: affiliate.commissionRates,
        paymentInfo: affiliate.paymentInfo
      },
      performance: {
        ...affiliate.performance,
        monthlyEarnings
      },
      recentReferrals: affiliate.referrals.slice(-5),
      pendingCommission: affiliate.pendingCommission,
      availableForPayout: affiliate.availableForPayout
    });
  } catch (error) {
    console.error('Get affiliate profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/affiliate/profile
// @desc    Update affiliate profile
// @access  Private
router.put('/profile', auth, [
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('description').optional().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('socialMedia.facebook').optional().isURL().withMessage('Invalid Facebook URL'),
  body('socialMedia.instagram').optional().isURL().withMessage('Invalid Instagram URL'),
  body('socialMedia.twitter').optional().isURL().withMessage('Invalid Twitter URL'),
  body('socialMedia.linkedin').optional().isURL().withMessage('Invalid LinkedIn URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const affiliate = await Affiliate.findOne({ user: req.user._id });
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate profile not found' });
    }

    // Update marketing materials
    if (req.body.website !== undefined) affiliate.marketingMaterials.website = req.body.website;
    if (req.body.description !== undefined) affiliate.marketingMaterials.description = req.body.description;
    if (req.body.socialMedia) {
      affiliate.marketingMaterials.socialMedia = {
        ...affiliate.marketingMaterials.socialMedia,
        ...req.body.socialMedia
      };
    }

    await affiliate.save();

    res.json({
      message: 'Profile updated successfully',
      marketingMaterials: affiliate.marketingMaterials
    });
  } catch (error) {
    console.error('Update affiliate profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/affiliate/payment-info
// @desc    Update payment information
// @access  Private
router.put('/payment-info', auth, [
  body('method').isIn(['bank_transfer', 'paypal', 'stripe', 'check']).withMessage('Invalid payment method'),
  body('minimumPayout').optional().isFloat({ min: 10 }).withMessage('Minimum payout must be at least $10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { method, accountDetails, minimumPayout } = req.body;
    const affiliate = await Affiliate.findOne({ user: req.user._id });

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate profile not found' });
    }

    affiliate.paymentInfo.method = method;
    if (accountDetails) {
      affiliate.paymentInfo.accountDetails = {
        ...affiliate.paymentInfo.accountDetails,
        ...accountDetails
      };
    }
    if (minimumPayout) {
      affiliate.paymentInfo.minimumPayout = minimumPayout;
    }

    await affiliate.save();

    res.json({
      message: 'Payment information updated successfully',
      paymentInfo: affiliate.paymentInfo
    });
  } catch (error) {
    console.error('Update payment info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/affiliate/referrals
// @desc    Get affiliate referrals with pagination
// @access  Private
router.get('/referrals', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const affiliate = await Affiliate.findOne({ user: req.user._id })
      .populate('referrals.referredUser', 'username email')
      .populate('referrals.order', 'total status createdAt');

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate profile not found' });
    }

    let referrals = affiliate.referrals;
    
    // Filter by status if provided
    if (status) {
      referrals = referrals.filter(ref => ref.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReferrals = referrals.slice(startIndex, endIndex);

    res.json({
      referrals: paginatedReferrals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(referrals.length / limit),
        totalItems: referrals.length,
        hasNext: endIndex < referrals.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/affiliate/analytics
// @desc    Get affiliate analytics and performance metrics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const affiliate = await Affiliate.findOne({ user: req.user._id });

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate profile not found' });
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (parseInt(period) * 24 * 60 * 60 * 1000));

    const periodEarnings = affiliate.calculateEarnings(startDate, endDate);

    // Calculate conversion rate
    const conversionRate = affiliate.performance.totalReferrals > 0 
      ? (affiliate.performance.totalOrders / affiliate.performance.totalReferrals) * 100 
      : 0;

    res.json({
      period: `${period} days`,
      earnings: periodEarnings,
      overall: {
        totalReferrals: affiliate.performance.totalReferrals,
        totalOrders: affiliate.performance.totalOrders,
        totalRevenue: affiliate.performance.totalRevenue,
        totalCommission: affiliate.performance.totalCommission,
        averageOrderValue: affiliate.performance.averageOrderValue,
        conversionRate
      },
      recentActivity: affiliate.referrals.slice(-10)
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/affiliate/request-payout
// @desc    Request commission payout
// @access  Private
router.post('/request-payout', auth, [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('method').isIn(['bank_transfer', 'paypal', 'stripe', 'check']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, method, notes } = req.body;
    const affiliate = await Affiliate.findOne({ user: req.user._id });

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate profile not found' });
    }

    // Process payout
    await affiliate.processPayout(amount, method, `Payout request - ${new Date().toISOString()}`);

    res.json({
      message: 'Payout request submitted successfully',
      amount,
      method,
      status: 'processing',
      estimatedProcessingTime: '3-5 business days'
    });
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/affiliate/payouts
// @desc    Get payout history
// @access  Private
router.get('/payouts', auth, async (req, res) => {
  try {
    const affiliate = await Affiliate.findOne({ user: req.user._id });
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate profile not found' });
    }

    res.json({
      payouts: affiliate.payouts,
      totalPaid: affiliate.payouts
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/affiliate/links
// @desc    Get affiliate marketing links
// @access  Private
router.get('/links', auth, async (req, res) => {
  try {
    const affiliate = await Affiliate.findOne({ user: req.user._id });
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate profile not found' });
    }

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const affiliateCode = affiliate.affiliateCode;

    const links = {
      main: `${baseUrl}/?ref=${affiliateCode}`,
      shop: `${baseUrl}/shop?ref=${affiliateCode}`,
      categories: `${baseUrl}/categories?ref=${affiliateCode}`,
      products: `${baseUrl}/products?ref=${affiliateCode}`,
      custom: `${baseUrl}/?ref=${affiliateCode}&utm_source=affiliate&utm_medium=referral&utm_campaign=${affiliateCode}`
    };

    res.json({
      affiliateCode,
      links,
      trackingParams: {
        ref: affiliateCode,
        utm_source: 'affiliate',
        utm_medium: 'referral',
        utm_campaign: affiliateCode
      }
    });
  } catch (error) {
    console.error('Get affiliate links error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/affiliate/track-click
// @desc    Track affiliate link click
// @access  Public
router.post('/track-click', async (req, res) => {
  try {
    const { affiliateCode, link, userAgent, ip } = req.body;

    if (!affiliateCode || !link) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const affiliate = await Affiliate.findOne({ affiliateCode });
    if (!affiliate) {
      return res.status(404).json({ message: 'Invalid affiliate code' });
    }

    // Update analytics
    affiliate.analytics.clicks += 1;
    affiliate.analytics.lastActivity = new Date();

    // Update top performing links
    const existingLink = affiliate.analytics.topPerformingLinks.find(
      l => l.link === link
    );

    if (existingLink) {
      existingLink.clicks += 1;
    } else {
      affiliate.analytics.topPerformingLinks.push({
        link,
        clicks: 1,
        conversions: 0
      });
    }

    // Keep only top 10 performing links
    affiliate.analytics.topPerformingLinks.sort((a, b) => b.clicks - a.clicks);
    affiliate.analytics.topPerformingLinks = affiliate.analytics.topPerformingLinks.slice(0, 10);

    await affiliate.save();

    res.json({ message: 'Click tracked successfully' });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/affiliate/admin/stats
// @desc    Get affiliate system statistics (admin only)
// @access  Private/Admin
router.get('/admin/stats', [auth, admin], async (req, res) => {
  try {
    const totalAffiliates = await Affiliate.countDocuments();
    const activeAffiliates = await Affiliate.countDocuments({ status: 'active' });
    
    const totalCommissions = await Affiliate.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$performance.totalCommission' },
          pending: { $sum: { $sum: '$referrals.commission' } }
        }
      }
    ]);

    const topPerformers = await Affiliate.find()
      .populate('user', 'username email')
      .sort({ 'performance.totalCommission': -1 })
      .limit(10)
      .select('user performance.totalCommission performance.totalReferrals');

    res.json({
      totalAffiliates,
      activeAffiliates,
      totalCommissions: totalCommissions[0]?.total || 0,
      pendingCommissions: totalCommissions[0]?.pending || 0,
      topPerformers
    });
  } catch (error) {
    console.error('Admin affiliate stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
