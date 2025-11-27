const express = require('express');
const { body, validationResult } = require('express-validator');
const LoyaltyMember = require('../models/LoyaltyMember');
const User = require('../models/User');
const Order = require('../models/Order');
const SpinWheel = require('../models/SpinWheel');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

// ========================================
// LOYALTY MEMBERSHIP MANAGEMENT
// ========================================

// Get or create user's loyalty membership
router.get('/profile', auth, async (req, res) => {
  try {
    let loyaltyMember = await LoyaltyMember.findOne({ userId: req.user.id })
      .populate('userId', 'name email avatar');
    
    if (!loyaltyMember) {
      // Create loyalty membership if it doesn't exist
      loyaltyMember = new LoyaltyMember({
        userId: req.user.id,
        points: 0,
        tier: 'Bronze',
        totalSpent: 0
      });
      await loyaltyMember.save();
      await loyaltyMember.populate('userId', 'name email avatar');
    }
    
    // Get tier benefits
    const benefits = loyaltyMember.getTierBenefits();
    
    res.json({
      success: true,
      data: {
        ...loyaltyMember.toObject(),
        benefits,
        nextTierRequirements: getNextTierRequirements(loyaltyMember.tier)
      }
    });
  } catch (error) {
    console.error('Error fetching loyalty profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty profile'
    });
  }
});

// Update loyalty preferences
router.put('/preferences', auth, [
  body('emailNotifications').optional().isBoolean(),
  body('smsNotifications').optional().isBoolean(),
  body('birthdayMonth').optional().isInt({ min: 1, max: 12 }),
  body('birthdayDay').optional().isInt({ min: 1, max: 31 })
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

    const loyaltyMember = await LoyaltyMember.findOne({ userId: req.user.id });
    if (!loyaltyMember) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty membership not found'
      });
    }

    // Update preferences
    Object.assign(loyaltyMember.preferences, req.body);
    await loyaltyMember.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: loyaltyMember.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// ========================================
// POINTS SYSTEM
// ========================================

// Get points history
router.get('/points/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const loyaltyMember = await LoyaltyMember.findOne({ userId: req.user.id });
    
    if (!loyaltyMember) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty membership not found'
      });
    }

    let history = loyaltyMember.pointsHistory;
    
    // Filter by type if specified
    if (type) {
      history = history.filter(entry => entry.type === type);
    }

    // Sort by date (newest first)
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedHistory = history.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        currentPoints: loyaltyMember.points,
        totalSpent: loyaltyMember.totalSpent,
        tier: loyaltyMember.tier,
        history: paginatedHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: history.length,
          pages: Math.ceil(history.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching points history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch points history'
    });
  }
});

// Redeem points for discount
router.post('/points/redeem', auth, [
  body('points').isInt({ min: 1 }),
  body('orderId').optional().isMongoId()
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

    const { points, orderId } = req.body;
    const loyaltyMember = await LoyaltyMember.findOne({ userId: req.user.id });
    
    if (!loyaltyMember) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty membership not found'
      });
    }

    // Check if user has enough points
    if (loyaltyMember.points < points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points'
      });
    }

    // Redeem points
    const description = orderId ? `Redeemed for order ${orderId}` : 'Points redeemed for discount';
    loyaltyMember.redeemPoints(points, description, orderId);
    await loyaltyMember.save();

    // Calculate discount amount (1 point = $0.01)
    const discountAmount = points * 0.01;

    res.json({
      success: true,
      message: 'Points redeemed successfully',
      data: {
        pointsRedeemed: points,
        discountAmount,
        remainingPoints: loyaltyMember.points,
        discountCode: `LOYALTY${Date.now()}`
      }
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem points'
    });
  }
});

// ========================================
// TIER SYSTEM
// ========================================

// Get tier information and progress
router.get('/tier', auth, async (req, res) => {
  try {
    const loyaltyMember = await LoyaltyMember.findOne({ userId: req.user.id });
    
    if (!loyaltyMember) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty membership not found'
      });
    }

    const currentTier = loyaltyMember.tier;
    const benefits = loyaltyMember.getTierBenefits();
    const nextTierRequirements = getNextTierRequirements(currentTier);
    
    // Calculate progress to next tier
    let progress = 0;
    if (nextTierRequirements) {
      const pointsProgress = loyaltyMember.points / nextTierRequirements.points;
      const spentProgress = loyaltyMember.totalSpent / nextTierRequirements.spent;
      progress = Math.min(pointsProgress, spentProgress) * 100;
    }

    res.json({
      success: true,
      data: {
        currentTier,
        points: loyaltyMember.points,
        totalSpent: loyaltyMember.totalSpent,
        benefits,
        nextTier: nextTierRequirements?.tier || null,
        nextTierRequirements,
        progress: Math.min(progress, 100),
        tierHistory: loyaltyMember.tierHistory
      }
    });
  } catch (error) {
    console.error('Error fetching tier information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tier information'
    });
  }
});

// ========================================
// SPIN WHEEL SYSTEM
// ========================================

// Check spin wheel eligibility
router.get('/spin-wheel/eligibility', auth, async (req, res) => {
  try {
    const loyaltyMember = await LoyaltyMember.findOne({ userId: req.user.id });
    
    if (!loyaltyMember) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty membership not found'
      });
    }

    const canSpin = loyaltyMember.canSpin();
    const benefits = loyaltyMember.getTierBenefits();
    
    res.json({
      success: true,
      data: {
        canSpin,
        availableSpins: loyaltyMember.spinWheelData.availableSpins,
        totalSpins: loyaltyMember.spinWheelData.totalSpins,
        lastSpinDate: loyaltyMember.spinWheelData.lastSpinDate,
        spinMultiplier: benefits.spinWheelMultiplier,
        tier: loyaltyMember.tier
      }
    });
  } catch (error) {
    console.error('Error checking spin eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check spin eligibility'
    });
  }
});

// Spin the wheel
router.post('/spin-wheel/spin', auth, async (req, res) => {
  try {
    const loyaltyMember = await LoyaltyMember.findOne({ userId: req.user.id });
    
    if (!loyaltyMember) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty membership not found'
      });
    }

    // Check if user can spin
    if (!loyaltyMember.canSpin()) {
      return res.status(400).json({
        success: false,
        message: 'No spins available today'
      });
    }

    // Get active spin wheels
    const activeWheels = await SpinWheel.find({ isActive: true });
    if (activeWheels.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active spin wheels available'
      });
    }

    // Use the first active wheel (you can implement selection logic)
    const spinWheel = activeWheels[0];
    
    // Get random segment based on probabilities
    const segment = spinWheel.getRandomSegment();
    
    // Process the reward based on segment type
    let rewardDetails = null;
    
    switch (segment.type) {
      case 'discount':
        rewardDetails = {
          type: 'discount',
          value: segment.reward,
          code: `SPIN${Date.now()}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };
        break;
        
      case 'free_shipping':
        rewardDetails = {
          type: 'free_shipping',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
        break;
        
      case 'loyalty_points':
        const pointsValue = parseInt(segment.reward);
        loyaltyMember.addPoints(pointsValue, 'bonus', 'Spin wheel reward');
        rewardDetails = {
          type: 'loyalty_points',
          points: pointsValue
        };
        break;
        
      case 'cashback':
        rewardDetails = {
          type: 'cashback',
          value: segment.reward,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
        break;
        
      default:
        rewardDetails = {
          type: 'other',
          description: segment.reward
        };
    }

    // Record the spin
    loyaltyMember.useSpin(segment.name, segment.reward);
    await loyaltyMember.save();

    // Update spin wheel analytics
    await spinWheel.recordSpin(req.user.id);
    await spinWheel.recordReward();

    res.json({
      success: true,
      data: {
        segment: {
          name: segment.name,
          reward: segment.reward,
          type: segment.type,
          color: segment.color,
          icon: segment.icon
        },
        rewardDetails,
        remainingSpins: loyaltyMember.spinWheelData.availableSpins,
        totalSpins: loyaltyMember.spinWheelData.totalSpins
      }
    });
  } catch (error) {
    console.error('Error spinning wheel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to spin wheel'
    });
  }
});

// Get spin history
router.get('/spin-wheel/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const loyaltyMember = await LoyaltyMember.findOne({ userId: req.user.id });
    
    if (!loyaltyMember) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty membership not found'
      });
    }

    const history = loyaltyMember.spinWheelData.spinHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const skip = (page - 1) * limit;
    const paginatedHistory = history.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        history: paginatedHistory,
        totalSpins: loyaltyMember.spinWheelData.totalSpins,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: history.length,
          pages: Math.ceil(history.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching spin history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch spin history'
    });
  }
});

// ========================================
// ORDER INTEGRATION
// ========================================

// Process order for loyalty points (called from order completion)
router.post('/process-order', auth, [
  body('orderId').isMongoId(),
  body('orderTotal').isFloat({ min: 0 })
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

    const { orderId, orderTotal } = req.body;
    
    let loyaltyMember = await LoyaltyMember.findOne({ userId: req.user.id });
    if (!loyaltyMember) {
      loyaltyMember = new LoyaltyMember({
        userId: req.user.id,
        points: 0,
        tier: 'Bronze',
        totalSpent: 0
      });
    }

    // Calculate points (1 point per $1 spent)
    const benefits = loyaltyMember.getTierBenefits();
    const basePoints = Math.floor(orderTotal);
    const pointsToAdd = Math.floor(basePoints * benefits.pointsMultiplier);

    // Add points and update total spent
    const tierUpdated = loyaltyMember.addPoints(
      pointsToAdd, 
      'earned', 
      `Order #${orderId}`, 
      orderId
    );
    
    loyaltyMember.totalSpent += orderTotal;
    
    // Check for tier update again after spending update
    const finalTierUpdate = loyaltyMember.updateTier();
    
    await loyaltyMember.save();

    res.json({
      success: true,
      data: {
        pointsEarned: pointsToAdd,
        totalPoints: loyaltyMember.points,
        tier: loyaltyMember.tier,
        tierUpdated: tierUpdated || finalTierUpdate,
        totalSpent: loyaltyMember.totalSpent
      }
    });
  } catch (error) {
    console.error('Error processing order for loyalty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process order for loyalty'
    });
  }
});

// ========================================
// ADMIN ROUTES
// ========================================

// Get all loyalty members (admin only)
router.get('/admin/members', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, tier, search, sortBy = 'points', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    if (tier) {
      query.tier = tier;
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (page - 1) * limit;
    
    let members = await LoyaltyMember.find(query)
      .populate('userId', 'name email avatar createdAt')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by search if provided
    if (search) {
      members = members.filter(member => 
        member.userId.name.toLowerCase().includes(search.toLowerCase()) ||
        member.userId.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = await LoyaltyMember.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        members,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching loyalty members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty members'
    });
  }
});

// Manually award points (admin only)
router.post('/admin/award-points', auth, admin, [
  body('userId').isMongoId(),
  body('points').isInt({ min: 1 }),
  body('reason').notEmpty()
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

    const { userId, points, reason } = req.body;
    
    let loyaltyMember = await LoyaltyMember.findOne({ userId });
    if (!loyaltyMember) {
      loyaltyMember = new LoyaltyMember({
        userId,
        points: 0,
        tier: 'Bronze',
        totalSpent: 0
      });
    }
    
    const tierUpdated = loyaltyMember.addPoints(points, 'bonus', reason);
    await loyaltyMember.save();
    
    res.json({
      success: true,
      message: `${points} points awarded successfully`,
      data: {
        pointsAwarded: points,
        currentPoints: loyaltyMember.points,
        tier: loyaltyMember.tier,
        tierUpdated
      }
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points'
    });
  }
});

// Get loyalty analytics (admin only)
router.get('/admin/analytics', auth, admin, async (req, res) => {
  try {
    const { timeRange = '30' } = req.query;
    
    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000));
    
    // Get basic stats
    const totalMembers = await LoyaltyMember.countDocuments();
    const newMembers = await LoyaltyMember.countDocuments({
      joinDate: { $gte: startDate }
    });
    
    // Get tier distribution
    const tierDistribution = await LoyaltyMember.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get points statistics
    const pointsStats = await LoyaltyMember.aggregate([
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$points' },
          avgPoints: { $avg: '$points' },
          maxPoints: { $max: '$points' },
          totalSpent: { $sum: '$totalSpent' },
          avgSpent: { $avg: '$totalSpent' }
        }
      }
    ]);
    
    // Get spin wheel statistics
    const spinStats = await LoyaltyMember.aggregate([
      {
        $group: {
          _id: null,
          totalSpins: { $sum: '$spinWheelData.totalSpins' },
          avgSpinsPerUser: { $avg: '$spinWheelData.totalSpins' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalMembers,
          newMembers,
          timeRange: `${timeRange} days`
        },
        tierDistribution,
        pointsStats: pointsStats[0] || {},
        spinStats: spinStats[0] || {},
        timeRange: {
          start: startDate,
          end: now
        }
      }
    });
  } catch (error) {
    console.error('Error fetching loyalty analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// ========================================
// HELPER FUNCTIONS
// ========================================

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
