const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const SpecialOffer = require('../models/SpecialOffer');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// @route   GET /api/special-offers
// @desc    Get all active special offers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, category, userTier, limit = 20 } = req.query;
    
    let query = {
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };

    if (type) query.type = type;
    if (category) query['targetAudience.categories'] = category;
    if (userTier) {
      query.$or = [
        { 'targetAudience.userGroups': 'all' },
        { 'targetAudience.userGroups': userTier }
      ];
    }

    const offers = await SpecialOffer.find(query)
      .select('name description type discountType discountValue minSpend maxDiscount bannerImage bannerText countdownTimer endDate targetAudience')
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      offers,
      total: offers.length,
      filters: { type, category, userTier }
    });
  } catch (error) {
    console.error('Get special offers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/special-offers/:id
// @desc    Get specific special offer details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    res.json(offer);
  } catch (error) {
    console.error('Get special offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/special-offers
// @desc    Create new special offer (admin only)
// @access  Private/Admin
router.post('/', [auth, admin], [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['flash_sale', 'seasonal', 'birthday', 'anniversary', 'milestone', 'referral', 'loyalty', 'custom']).withMessage('Invalid offer type'),
  body('discountType').isIn(['percentage', 'fixed', 'free_shipping', 'buy_one_get_one', 'bundle']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, description, type, discountType, discountValue,
      minSpend, maxDiscount, targetAudience, startDate, endDate,
      usageLimit, isRecurring, recurringPattern, autoActivate,
      autoDeactivate, triggerConditions, bannerImage, bannerText,
      highlightColor, urgencyMessage, countdownTimer, stackable,
      priority, tags, notes
    } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    const offer = new SpecialOffer({
      name,
      description,
      type,
      discountType,
      discountValue,
      minSpend: minSpend || 0,
      maxDiscount: maxDiscount || 0,
      targetAudience: targetAudience || { userGroups: ['all'] },
      startDate,
      endDate,
      usageLimit: usageLimit || 0,
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || {},
      autoActivate: autoActivate || false,
      autoDeactivate: autoDeactivate || false,
      triggerConditions: triggerConditions || [],
      bannerImage,
      bannerText,
      highlightColor,
      urgencyMessage,
      countdownTimer: countdownTimer || false,
      stackable: stackable || false,
      priority: priority || 1,
      tags: tags || [],
      notes
    });

    await offer.save();

    res.status(201).json({
      message: 'Special offer created successfully',
      offer
    });
  } catch (error) {
    console.error('Create special offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/special-offers/:id
// @desc    Update special offer (admin only)
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        offer[key] = req.body[key];
      }
    });

    // Validate dates if updated
    if (offer.startDate && offer.endDate && offer.startDate >= offer.endDate) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    await offer.save();

    res.json({
      message: 'Special offer updated successfully',
      offer
    });
  } catch (error) {
    console.error('Update special offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/special-offers/:id
// @desc    Delete special offer (admin only)
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    await offer.remove();

    res.json({ message: 'Special offer deleted successfully' });
  } catch (error) {
    console.error('Delete special offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/special-offers/:id/activate
// @desc    Activate special offer (admin only)
// @access  Private/Admin
router.post('/:id/activate', [auth, admin], async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    offer.isActive = true;
    await offer.save();

    res.json({
      message: 'Special offer activated successfully',
      offer: {
        id: offer._id,
        name: offer.name,
        status: offer.status
      }
    });
  } catch (error) {
    console.error('Activate special offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/special-offers/:id/deactivate
// @desc    Deactivate special offer (admin only)
// @access  Private/Admin
router.post('/:id/deactivate', [auth, admin], async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    offer.isActive = false;
    await offer.save();

    res.json({
      message: 'Special offer deactivated successfully',
      offer: {
        id: offer._id,
        name: offer.name,
        status: offer.status
      }
    });
  } catch (error) {
    console.error('Deactivate special offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/special-offers/:id/duplicate
// @desc    Duplicate special offer (admin only)
// @access  Private/Admin
router.post('/:id/duplicate', [auth, admin], async (req, res) => {
  try {
    const originalOffer = await SpecialOffer.findById(req.params.id);
    
    if (!originalOffer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    const duplicatedOffer = new SpecialOffer({
      ...originalOffer.toObject(),
      _id: undefined,
      name: `${originalOffer.name} (Copy)`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      isActive: false,
      usedCount: 0,
      createdAt: undefined,
      updatedAt: undefined
    });

    await duplicatedOffer.save();

    res.json({
      message: 'Special offer duplicated successfully',
      offer: duplicatedOffer
    });
  } catch (error) {
    console.error('Duplicate special offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/special-offers/admin/stats
// @desc    Get special offers statistics (admin only)
// @access  Private/Admin
router.get('/admin/stats', [auth, admin], async (req, res) => {
  try {
    const totalOffers = await SpecialOffer.countDocuments();
    const activeOffers = await SpecialOffer.countDocuments({ isActive: true });
    const scheduledOffers = await SpecialOffer.countDocuments({
      isActive: true,
      startDate: { $gt: new Date() }
    });
    const expiredOffers = await SpecialOffer.countDocuments({
      endDate: { $lt: new Date() }
    });

    const typeStats = await SpecialOffer.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usedCount' },
          avgPerformance: { $avg: '$performance.conversionRate' }
        }
      }
    ]);

    const topPerformingOffers = await SpecialOffer.find()
      .sort({ 'performance.conversionRate': -1 })
      .limit(5)
      .select('name type performance usedCount');

    res.json({
      totalOffers,
      activeOffers,
      scheduledOffers,
      expiredOffers,
      typeStats,
      topPerformingOffers
    });
  } catch (error) {
    console.error('Get special offers stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/special-offers/:id/track-view
// @desc    Track offer view for analytics
// @access  Public
router.post('/:id/track-view', async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    offer.performance.views += 1;
    await offer.save();

    res.json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/special-offers/:id/track-click
// @desc    Track offer click for analytics
// @access  Public
router.post('/:id/track-click', async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    offer.performance.clicks += 1;
    offer.performance.clickThroughRate = (offer.performance.clicks / offer.performance.views) * 100;
    await offer.save();

    res.json({ message: 'Click tracked successfully' });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/special-offers/:id/track-conversion
// @desc    Track offer conversion for analytics
// @access  Public
router.post('/:id/track-conversion', async (req, res) => {
  try {
    const { orderValue } = req.body;
    const offer = await SpecialOffer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    offer.performance.conversions += 1;
    offer.performance.revenue += orderValue || 0;
    offer.performance.averageOrderValue = offer.performance.revenue / offer.performance.conversions;
    offer.performance.conversionRate = (offer.performance.conversions / offer.performance.clicks) * 100;
    
    await offer.save();

    res.json({ message: 'Conversion tracked successfully' });
  } catch (error) {
    console.error('Track conversion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/special-offers/automation/check
// @desc    Check for offers that need automation (admin only)
// @access  Private/Admin
router.get('/admin/automation/check', [auth, admin], async (req, res) => {
  try {
    const now = new Date();
    
    // Check for offers that should be auto-activated
    const offersToActivate = await SpecialOffer.find({
      autoActivate: true,
      isActive: false,
      startDate: { $lte: now }
    });

    // Check for offers that should be auto-deactivated
    const offersToDeactivate = await SpecialOffer.find({
      autoDeactivate: true,
      isActive: true,
      endDate: { $lte: now }
    });

    // Check for recurring offers that need renewal
    const recurringOffers = await SpecialOffer.find({
      isRecurring: true,
      isActive: true,
      endDate: { $lte: now }
    });

    res.json({
      offersToActivate: offersToActivate.length,
      offersToDeactivate: offersToDeactivate.length,
      recurringOffers: recurringOffers.length,
      automationNeeded: offersToActivate.length > 0 || offersToDeactivate.length > 0 || recurringOffers.length > 0
    });
  } catch (error) {
    console.error('Check automation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/special-offers/automation/execute
// @desc    Execute automation for special offers (admin only)
// @access  Private/Admin
router.post('/admin/automation/execute', [auth, admin], async (req, res) => {
  try {
    const now = new Date();
    let results = {
      activated: 0,
      deactivated: 0,
      renewed: 0,
      errors: []
    };

    // Auto-activate offers
    const offersToActivate = await SpecialOffer.find({
      autoActivate: true,
      isActive: false,
      startDate: { $lte: now }
    });

    for (const offer of offersToActivate) {
      try {
        offer.isActive = true;
        await offer.save();
        results.activated++;
      } catch (error) {
        results.errors.push(`Failed to activate ${offer.name}: ${error.message}`);
      }
    }

    // Auto-deactivate offers
    const offersToDeactivate = await SpecialOffer.find({
      autoDeactivate: true,
      isActive: true,
      endDate: { $lte: now }
    });

    for (const offer of offersToDeactivate) {
      try {
        offer.isActive = false;
        await offer.save();
        results.deactivated++;
      } catch (error) {
        results.errors.push(`Failed to deactivate ${offer.name}: ${error.message}`);
      }
    }

    // Handle recurring offers
    const recurringOffers = await SpecialOffer.find({
      isRecurring: true,
      isActive: true,
      endDate: { $lte: now }
    });

    for (const offer of recurringOffers) {
      try {
        // Calculate next occurrence based on recurring pattern
        let nextStartDate = new Date(offer.startDate);
        let nextEndDate = new Date(offer.endDate);
        
        if (offer.recurringPattern.frequency === 'daily') {
          nextStartDate.setDate(nextStartDate.getDate() + 1);
          nextEndDate.setDate(nextEndDate.getDate() + 1);
        } else if (offer.recurringPattern.frequency === 'weekly') {
          nextStartDate.setDate(nextStartDate.getDate() + 7);
          nextEndDate.setDate(nextEndDate.getDate() + 7);
        } else if (offer.recurringPattern.frequency === 'monthly') {
          nextStartDate.setMonth(nextStartDate.getMonth() + 1);
          nextEndDate.setMonth(nextEndDate.getMonth() + 1);
        } else if (offer.recurringPattern.frequency === 'yearly') {
          nextStartDate.setFullYear(nextStartDate.getFullYear() + 1);
          nextEndDate.setFullYear(nextEndDate.getFullYear() + 1);
        }

        offer.startDate = nextStartDate;
        offer.endDate = nextEndDate;
        offer.usedCount = 0; // Reset usage count for new period
        
        await offer.save();
        results.renewed++;
      } catch (error) {
        results.errors.push(`Failed to renew ${offer.name}: ${error.message}`);
      }
    }

    res.json({
      message: 'Automation executed successfully',
      results
    });
  } catch (error) {
    console.error('Execute automation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
