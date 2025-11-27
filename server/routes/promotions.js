const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Banner = require('../models/Banner');
const SpinWheel = require('../models/SpinWheel');
const LoyaltyMember = require('../models/LoyaltyMember');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

// ========================================
// ACTIVE PROMOTIONS & BANNERS
// ========================================

// Get active promotions for homepage
router.get('/active', async (req, res) => {
  try {
    const { page = 'home', userTier = 'Bronze' } = req.query;
    
    // Get active events
    const activeEvents = await Event.getActiveEvents()
      .populate('components.banners.bannerId')
      .populate('components.spinWheel.wheelId');
    
    // Get active banners for the page
    const activeBanners = await Banner.getActiveBanners({
      page,
      userType: userTier.toLowerCase(),
      device: 'desktop'
    });
    
    // Get active spin wheels
    const activeSpinWheels = await SpinWheel.find({
      isActive: true,
      $or: [
        { startDate: { $lte: new Date() } },
        { startDate: { $exists: false } }
      ],
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: { $exists: false } }
      ]
    });

    res.json({
      success: true,
      data: {
        events: activeEvents,
        banners: activeBanners,
        spinWheels: activeSpinWheels,
        hasActivePromotions: activeEvents.length > 0 || activeBanners.length > 0
      }
    });
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active promotions'
    });
  }
});

// Get personalized promotions for authenticated user
router.get('/personalized', auth, async (req, res) => {
  try {
    const { page = 'home' } = req.query;
    
    // Get user's loyalty tier
    const loyaltyMember = await LoyaltyMember.findOne({ userId: req.user.id });
    const userTier = loyaltyMember?.tier || 'Bronze';
    
    // Get tier-specific events
    const tierEvents = await Event.find({
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userTier.toLowerCase() },
        { targetAudience: 'returning' }
      ]
    }).populate('components.banners.bannerId')
      .populate('components.spinWheel.wheelId');
    
    // Get personalized banners
    const personalizedBanners = await Banner.getActiveBanners({
      page,
      userType: userTier.toLowerCase(),
      device: 'desktop'
    });
    
    // Get spin wheel eligibility
    const canSpin = loyaltyMember ? loyaltyMember.canSpin() : false;
    const spinWheels = canSpin ? await SpinWheel.find({ isActive: true }) : [];

    res.json({
      success: true,
      data: {
        userTier,
        events: tierEvents,
        banners: personalizedBanners,
        spinWheels,
        canSpin,
        loyaltyPoints: loyaltyMember?.points || 0,
        recommendations: generateRecommendations(loyaltyMember)
      }
    });
  } catch (error) {
    console.error('Error fetching personalized promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personalized promotions'
    });
  }
});

// ========================================
// EVENT-BASED PROMOTIONS
// ========================================

// Get specific event details
router.get('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId)
      .populate('components.banners.bannerId')
      .populate('components.discounts.discountId')
      .populate('components.specialOffers.offerId')
      .populate('components.spinWheel.wheelId');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is currently active
    const isActive = event.isRunning;
    
    res.json({
      success: true,
      data: {
        event,
        isActive,
        timeRemaining: isActive ? event.endDate - new Date() : 0
      }
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event details'
    });
  }
});

// Track event interaction
router.post('/events/:eventId/track', [
  body('action').isIn(['view', 'click', 'conversion']),
  body('componentType').optional().isIn(['banner', 'discount', 'offer', 'spinWheel']),
  body('componentId').optional().isMongoId(),
  body('revenue').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { eventId } = req.params;
    const { action, componentType, componentId, revenue = 0 } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update event performance metrics
    await event.updatePerformance(componentType || 'overall', action, revenue || 1);
    
    // Update component-specific metrics if applicable
    if (componentType && componentId) {
      switch (componentType) {
        case 'banner':
          const banner = await Banner.findById(componentId);
          if (banner) {
            if (action === 'view') await banner.recordDisplay();
            if (action === 'click') await banner.recordClick();
            if (action === 'conversion') await banner.recordConversion(revenue);
          }
          break;
          
        case 'spinWheel':
          const spinWheel = await SpinWheel.findById(componentId);
          if (spinWheel) {
            if (action === 'view') spinWheel.analytics.totalSpins += 1;
            if (action === 'conversion') await spinWheel.recordConversion();
          }
          break;
      }
    }

    res.json({
      success: true,
      message: 'Event interaction tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking event interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event interaction'
    });
  }
});

// ========================================
// SEASONAL & FLASH SALES
// ========================================

// Get current seasonal promotions
router.get('/seasonal', async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentSeason = getSeason(currentMonth);
    
    const seasonalEvents = await Event.find({
      status: 'active',
      type: { $in: ['seasonal', 'holiday'] },
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).populate('components.banners.bannerId');
    
    // Get season-specific banners
    const seasonalBanners = await Banner.find({
      isActive: true,
      type: 'seasonal',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    res.json({
      success: true,
      data: {
        currentSeason,
        events: seasonalEvents,
        banners: seasonalBanners,
        upcomingEvents: await getUpcomingSeasonalEvents()
      }
    });
  } catch (error) {
    console.error('Error fetching seasonal promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seasonal promotions'
    });
  }
});

// Get flash sales
router.get('/flash-sales', async (req, res) => {
  try {
    const flashSales = await Event.find({
      status: 'active',
      type: 'flash_sale',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).populate('components.banners.bannerId')
      .populate('components.discounts.discountId')
      .sort({ priority: -1, endDate: 1 });

    // Calculate urgency for each flash sale
    const flashSalesWithUrgency = flashSales.map(sale => {
      const timeRemaining = sale.endDate - new Date();
      const urgencyLevel = timeRemaining < 3600000 ? 'high' : 
                          timeRemaining < 86400000 ? 'medium' : 'low';
      
      return {
        ...sale.toObject(),
        timeRemaining,
        urgencyLevel,
        formattedTimeRemaining: formatTimeRemaining(timeRemaining)
      };
    });

    res.json({
      success: true,
      data: {
        flashSales: flashSalesWithUrgency,
        hasUrgentSales: flashSalesWithUrgency.some(sale => sale.urgencyLevel === 'high')
      }
    });
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flash sales'
    });
  }
});

// ========================================
// BANNER MANAGEMENT
// ========================================

// Get banners for specific position
router.get('/banners/:position', async (req, res) => {
  try {
    const { position } = req.params;
    const { page = 'all', userTier = 'guest' } = req.query;
    
    const banners = await Banner.getActiveBanners({
      page,
      userType: userTier.toLowerCase(),
      device: 'desktop'
    }).where('position').equals(position);

    res.json({
      success: true,
      data: {
        banners,
        position,
        count: banners.length
      }
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners'
    });
  }
});

// Track banner interaction
router.post('/banners/:bannerId/track', [
  body('action').isIn(['display', 'click', 'conversion']),
  body('revenue').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { bannerId } = req.params;
    const { action, revenue = 0 } = req.body;
    
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Track the action
    switch (action) {
      case 'display':
        await banner.recordDisplay(req.user?.id);
        break;
      case 'click':
        await banner.recordClick(req.user?.id);
        break;
      case 'conversion':
        await banner.recordConversion(revenue, req.user?.id);
        break;
    }

    res.json({
      success: true,
      message: 'Banner interaction tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking banner interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track banner interaction'
    });
  }
});

// ========================================
// ADMIN ROUTES
// ========================================

// Create new promotional event (admin only)
router.post('/admin/events', auth, admin, [
  body('name').notEmpty().trim(),
  body('type').isIn(['seasonal', 'holiday', 'promotional', 'flash_sale', 'loyalty_boost', 'custom']),
  body('description').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('targetAudience').isIn(['all', 'new_users', 'returning', 'vip', 'specific'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const eventData = {
      ...req.body,
      createdBy: req.user.id,
      status: 'draft'
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// Get promotion analytics (admin only)
router.get('/admin/analytics', auth, admin, async (req, res) => {
  try {
    const { timeRange = '30', eventId } = req.query;
    
    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000));
    
    let query = {
      createdAt: { $gte: startDate }
    };
    
    if (eventId) {
      query._id = eventId;
    }

    // Get event performance
    const eventStats = await Event.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          totalViews: { $sum: '$performance.views' },
          totalClicks: { $sum: '$performance.clicks' },
          totalConversions: { $sum: '$performance.conversions' },
          totalRevenue: { $sum: '$performance.revenue' }
        }
      }
    ]);

    // Get banner performance
    const bannerStats = await Banner.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalBanners: { $sum: 1 },
          totalDisplays: { $sum: '$analytics.displays' },
          totalClicks: { $sum: '$analytics.clicks' },
          totalConversions: { $sum: '$analytics.conversions' },
          totalRevenue: { $sum: '$analytics.revenue' }
        }
      }
    ]);

    // Get spin wheel performance
    const spinWheelStats = await SpinWheel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalWheels: { $sum: 1 },
          totalSpins: { $sum: '$analytics.totalSpins' },
          totalRewards: { $sum: '$analytics.rewardsGiven' },
          totalConversions: { $sum: '$analytics.conversions' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        timeRange: `${timeRange} days`,
        events: eventStats[0] || {},
        banners: bannerStats[0] || {},
        spinWheels: spinWheelStats[0] || {},
        period: {
          start: startDate,
          end: now
        }
      }
    });
  } catch (error) {
    console.error('Error fetching promotion analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotion analytics'
    });
  }
});

// ========================================
// HELPER FUNCTIONS
// ========================================

function getSeason(month) {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}

function formatTimeRemaining(milliseconds) {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

async function getUpcomingSeasonalEvents() {
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  return await Event.find({
    type: { $in: ['seasonal', 'holiday'] },
    startDate: { $gt: new Date(), $lte: nextWeek },
    status: { $in: ['scheduled', 'draft'] }
  }).sort({ startDate: 1 }).limit(5);
}

function generateRecommendations(loyaltyMember) {
  if (!loyaltyMember) {
    return {
      message: "Join our loyalty program to unlock exclusive rewards!",
      action: "signup",
      benefits: ["Earn points on every purchase", "Exclusive member discounts", "Birthday rewards"]
    };
  }

  const recommendations = [];
  
  // Spin wheel recommendation
  if (loyaltyMember.canSpin()) {
    recommendations.push({
      type: "spin_wheel",
      message: "You have a free spin available!",
      action: "spin",
      urgency: "high"
    });
  }

  // Points redemption recommendation
  if (loyaltyMember.points >= 500) {
    recommendations.push({
      type: "redeem_points",
      message: `Redeem your ${loyaltyMember.points} points for discounts!`,
      action: "redeem",
      urgency: "medium"
    });
  }

  // Tier upgrade recommendation
  const nextTier = getNextTierRequirements(loyaltyMember.tier);
  if (nextTier) {
    const pointsNeeded = nextTier.points - loyaltyMember.points;
    const spendNeeded = nextTier.spent - loyaltyMember.totalSpent;
    
    if (pointsNeeded <= 100 || spendNeeded <= 50) {
      recommendations.push({
        type: "tier_upgrade",
        message: `You're close to ${nextTier.tier} tier! ${Math.max(pointsNeeded, 0)} points or $${Math.max(spendNeeded, 0)} more to go.`,
        action: "shop",
        urgency: "medium"
      });
    }
  }

  return recommendations;
}

function getNextTierRequirements(currentTier) {
  const tiers = {
    Bronze: { tier: 'Silver', points: 500, spent: 200 },
    Silver: { tier: 'Gold', points: 1500, spent: 500 },
    Gold: { tier: 'Platinum', points: 3000, spent: 1000 },
    Platinum: null
  };
  
  return tiers[currentTier];
}

module.exports = router;
