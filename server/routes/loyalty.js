const express = require('express');
const { body, validationResult } = require('express-validator');
const Loyalty = require('../models/Loyalty');
const User = require('../models/User');
const Badge = require('../models/Badge');
const SpinWheel = require('../models/SpinWheel');
const Coupon = require('../models/Coupon');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

// ========================================
// LOYALTY PROFILE MANAGEMENT
// ========================================

// Get user's loyalty profile
router.get('/profile', auth, async (req, res) => {
  try {
    let loyaltyProfile = await Loyalty.findByUserId(req.user.id);
    
    if (!loyaltyProfile) {
      // Create loyalty profile if it doesn't exist
      loyaltyProfile = await Loyalty.createForUser(req.user.id);
      
      // Update user with loyalty profile reference
      await User.findByIdAndUpdate(req.user.id, {
        loyaltyProfile: loyaltyProfile._id
      });
    }
    
    // Populate user details
    await loyaltyProfile.populate('user', 'name email avatar');
    
    res.json({
      success: true,
      data: loyaltyProfile
    });
  } catch (error) {
    console.error('Error fetching loyalty profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty profile'
    });
  }
});

// Update loyalty settings
router.put('/settings', auth, [
  body('emailNotifications').optional().isBoolean(),
  body('smsNotifications').optional().isBoolean(),
  body('autoSpin').optional().isBoolean()
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

    const loyaltyProfile = await Loyalty.findByUserId(req.user.id);
    if (!loyaltyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty profile not found'
      });
    }

    // Update settings
    Object.assign(loyaltyProfile.settings, req.body);
    await loyaltyProfile.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: loyaltyProfile.settings
    });
  } catch (error) {
    console.error('Error updating loyalty settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// ========================================
// POINTS SYSTEM
// ========================================

// Get points history
router.get('/points/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const loyaltyProfile = await Loyalty.findByUserId(req.user.id);
    
    if (!loyaltyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty profile not found'
      });
    }

    const skip = (page - 1) * limit;
    const pointsHistory = loyaltyProfile.pointsHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        currentPoints: loyaltyProfile.points.current,
        totalPoints: loyaltyProfile.points.total,
        multiplier: loyaltyProfile.points.multiplier,
        history: pointsHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: loyaltyProfile.pointsHistory.length
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

// ========================================
// TIER SYSTEM
// ========================================

// Get tier information
router.get('/tier', auth, async (req, res) => {
  try {
    const loyaltyProfile = await Loyalty.findByUserId(req.user.id);
    
    if (!loyaltyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty profile not found'
      });
    }

    const tierBenefits = loyaltyProfile.tierBenefits;
    
    res.json({
      success: true,
      data: {
        currentTier: loyaltyProfile.tier.current,
        nextTier: loyaltyProfile.tier.nextTier,
        progress: loyaltyProfile.tier.progress,
        threshold: loyaltyProfile.tier.threshold,
        benefits: tierBenefits
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
// SPIN TOKEN SYSTEM
// ========================================

// Get spin tokens information
router.get('/spin-tokens', auth, async (req, res) => {
  try {
    const loyaltyProfile = await Loyalty.findByUserId(req.user.id);
    
    if (!loyaltyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        available: loyaltyProfile.spinTokens.available,
        total: loyaltyProfile.spinTokens.total,
        lastEarned: loyaltyProfile.spinTokens.lastEarned,
        pointsThreshold: loyaltyProfile.spinTokens.pointsThreshold,
        pointsToNextToken: loyaltyProfile.spinTokens.pointsThreshold - loyaltyProfile.points.current
      }
    });
  } catch (error) {
    console.error('Error fetching spin tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch spin tokens'
    });
  }
});

// ========================================
// BADGE SYSTEM
// ========================================

// Get user's badges
router.get('/badges', auth, async (req, res) => {
  try {
    const loyaltyProfile = await Loyalty.findByUserId(req.user.id);
    
    if (!loyaltyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        badges: loyaltyProfile.badges.sort((a, b) => 
          new Date(b.earnedAt) - new Date(a.earnedAt)
        ),
        totalBadges: loyaltyProfile.badges.length,
        categories: loyaltyProfile.badges.reduce((acc, badge) => {
          acc[badge.category] = (acc[badge.category] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badges'
    });
  }
});

// Get available badges
router.get('/badges/available', auth, async (req, res) => {
  try {
    const loyaltyProfile = await Loyalty.findByUserId(req.user.id);
    const user = await User.findById(req.user.id);
    
    if (!loyaltyProfile || !user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Prepare user data for badge eligibility check
    const userData = {
      purchaseCount: user.stats.totalOrders,
      totalSpent: user.stats.totalSpent,
      purchaseStreak: user.stats.purchaseStreak,
      loyaltyPoints: loyaltyProfile.points.total,
      currentTier: loyaltyProfile.tier.current,
      spinCount: user.stats.spinCount,
      reviewCount: user.stats.reviewCount,
      referralCount: user.stats.referralCount
    };

    // Get all active badges
    const allBadges = await Badge.getActiveBadges();
    
    // Check which badges the user is eligible for but doesn't have
    const eligibleBadges = allBadges.filter(badge => {
      const hasBadge = loyaltyProfile.badges.some(userBadge => userBadge.id === badge.id);
      return !hasBadge && badge.checkEligibility(userData);
    });

    res.json({
      success: true,
      data: {
        eligibleBadges,
        totalEligible: eligibleBadges.length
      }
    });
  } catch (error) {
    console.error('Error fetching available badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available badges'
    });
  }
});

// ========================================
// SPIN WHEEL SYSTEM
// ========================================

// Get available spin wheels
router.get('/spin-wheels', auth, async (req, res) => {
  try {
    const loyaltyProfile = await Loyalty.findByUserId(req.user.id);
    
    if (!loyaltyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty profile not found'
      });
    }

    const spinWheels = await SpinWheel.getActiveWheels();
    
    // Filter wheels based on user eligibility
    let eligibleWheels = spinWheels.filter(wheel => {
      // Check if user has required tokens
      if (wheel.usage.requireAuthentication && loyaltyProfile.spinTokens.available === 0) {
        return false;
      }
      
      return true;
    });

    // Check minimum order value requirement for eligible wheels
    if (eligibleWheels.some(wheel => wheel.usage.minOrderValue > 0)) {
      const user = await User.findById(req.user.id);
      eligibleWheels = eligibleWheels.filter(wheel => {
        if (wheel.usage.minOrderValue > 0) {
          return user.stats.totalSpent >= wheel.usage.minOrderValue;
        }
        return true;
      });
    }

    res.json({
      success: true,
      data: {
        wheels: eligibleWheels,
        userTokens: loyaltyProfile.spinTokens.available,
        canSpin: loyaltyProfile.spinTokens.available > 0
      }
    });
  } catch (error) {
    console.error('Error fetching spin wheels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch spin wheels'
    });
  }
});

// Spin the wheel
router.post('/spin-wheel/:wheelId', auth, async (req, res) => {
  try {
    const { wheelId } = req.params;
    const loyaltyProfile = await Loyalty.findByUserId(req.user.id);
    
    if (!loyaltyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty profile not found'
      });
    }

    // Check if user has tokens
    if (loyaltyProfile.spinTokens.available === 0) {
      return res.status(400).json({
        success: false,
        message: 'No spin tokens available'
      });
    }

    // Get the spin wheel
    const spinWheel = await SpinWheel.findById(wheelId);
    if (!spinWheel || !spinWheel.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Spin wheel not found or inactive'
      });
    }

    // Check daily spin limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySpins = loyaltyProfile.spinHistory.filter(spin => 
      new Date(spin.date) >= today
    ).length;

    if (todaySpins >= spinWheel.usage.maxSpinsPerDay) {
      return res.status(400).json({
        success: false,
        message: 'Daily spin limit reached'
      });
    }

    // Use a token and spin
    if (!loyaltyProfile.useSpinToken()) {
      return res.status(400).json({
        success: false,
        message: 'Failed to use spin token'
      });
    }

    // Perform the spin
    const spinResult = spinWheel.spin(loyaltyProfile.tier.current);
    
    // Record the spin result
    loyaltyProfile.recordSpinResult(spinResult.reward, spinResult.rewardValue);
    
    // Update user stats
    const user = await User.findById(req.user.id);
    user.stats.spinCount += 1;
    
    // Process the reward
    let rewardDetails = null;
    
    switch (spinResult.reward) {
      case 'coupon':
        // Create a coupon for the user
        const coupon = new Coupon({
          code: `SPIN_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: `Spin Reward - ${spinResult.name}`,
          description: `Won from spin wheel: ${spinResult.description}`,
          type: 'percentage',
          value: spinResult.rewardValue,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          usageLimit: 1,
          perUserLimit: 1,
          isActive: true,
          eventType: 'spin',
          isSpinGenerated: true,
          generatedFor: req.user.id
        });
        await coupon.save();
        rewardDetails = { couponId: coupon._id, code: coupon.code };
        break;
        
      case 'free_shipping':
        // Set free shipping flag for next order
        loyaltyProfile.settings.freeShipping = true;
        rewardDetails = { type: 'free_shipping', validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) };
        break;
        
      case 'double_points':
        // Set double points for next purchase
        loyaltyProfile.points.multiplier = 2;
        loyaltyProfile.points.multiplierExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        rewardDetails = { type: 'double_points', expiresAt: loyaltyProfile.points.multiplierExpires };
        break;
        
      case 'bonus_points':
        // Award bonus points
        const bonusPoints = loyaltyProfile.addPoints(spinResult.rewardValue, 'Spin wheel bonus');
        rewardDetails = { type: 'bonus_points', points: bonusPoints };
        break;
        
      case 'try_again':
        // No reward, just consume token
        rewardDetails = { type: 'try_again' };
        break;
    }
    
    // Save all changes
    await Promise.all([
      loyaltyProfile.save(),
      user.save(),
      spinWheel.updateStats(spinResult)
    ]);
    
    res.json({
      success: true,
      data: {
        reward: spinResult.reward,
        rewardName: spinResult.name,
        rewardDescription: spinResult.description,
        rewardDetails,
        remainingTokens: loyaltyProfile.spinTokens.available,
        spinHistory: loyaltyProfile.spinHistory.slice(-5) // Last 5 spins
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
router.get('/spin-history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const loyaltyProfile = await Loyalty.findByUserId(req.user.id);
    
    if (!loyaltyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty profile not found'
      });
    }

    const skip = (page - 1) * limit;
    const spinHistory = loyaltyProfile.spinHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        history: spinHistory,
        stats: loyaltyProfile.stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: loyaltyProfile.spinHistory.length
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
// LEADERBOARD
// ========================================

// Get loyalty leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, category = 'points' } = req.query;
    
    let leaderboard;
    
    switch (category) {
      case 'points':
        leaderboard = await Loyalty.getLeaderboard(parseInt(limit));
        break;
      case 'tier':
        leaderboard = await Loyalty.aggregate([
          { $sort: { 'tier.current': -1, 'points.total': -1 } },
          { $limit: parseInt(limit) },
          { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
          { $unwind: '$user' },
          { $project: { user: 1, tier: 1, points: 1, badges: 1 } }
        ]);
        break;
      case 'badges':
        leaderboard = await Loyalty.aggregate([
          { $addFields: { badgeCount: { $size: '$badges' } } },
          { $sort: { badgeCount: -1, 'points.total': -1 } },
          { $limit: parseInt(limit) },
          { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
          { $unwind: '$user' },
          { $project: { user: 1, badgeCount: 1, points: 1, tier: 1 } }
        ]);
        break;
      default:
        leaderboard = await Loyalty.getLeaderboard(parseInt(limit));
    }
    
    res.json({
      success: true,
      data: {
        leaderboard,
        category,
        totalUsers: await Loyalty.countDocuments()
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// ========================================
// ADMIN ROUTES
// ========================================

// Get all loyalty profiles (admin only)
router.get('/admin/profiles', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, tier, sortBy = 'points.total', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tier) {
      query['tier.current'] = tier;
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (page - 1) * limit;
    
    const profiles = await Loyalty.find(query)
      .populate('user', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Loyalty.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        profiles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching loyalty profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty profiles'
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
    
    let loyaltyProfile = await Loyalty.findByUserId(userId);
    if (!loyaltyProfile) {
      loyaltyProfile = await Loyalty.createForUser(userId);
    }
    
    const pointsAwarded = loyaltyProfile.addPoints(points, reason);
    await loyaltyProfile.save();
    
    res.json({
      success: true,
      message: `${points} points awarded successfully`,
      data: {
        pointsAwarded,
        currentPoints: loyaltyProfile.points.current,
        totalPoints: loyaltyProfile.points.total
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

// Manually award badge (admin only)
router.post('/admin/award-badge', auth, admin, [
  body('userId').isMongoId(),
  body('badgeId').notEmpty()
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

    const { userId, badgeId } = req.body;
    
    const badge = await Badge.getBadgeById(badgeId);
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }
    
    let loyaltyProfile = await Loyalty.findByUserId(userId);
    if (!loyaltyProfile) {
      loyaltyProfile = await Loyalty.createForUser(userId);
    }
    
    const badgeAdded = loyaltyProfile.addBadge(
      badge.id,
      badge.name,
      badge.description,
      badge.icon,
      badge.category,
      badge.rarity
    );
    
    if (badgeAdded) {
      await badge.awardToUser(userId);
      await loyaltyProfile.save();
      
      res.json({
        success: true,
        message: 'Badge awarded successfully',
        data: { badge: badge.name }
      });
    } else {
      res.json({
        success: false,
        message: 'User already has this badge'
      });
    }
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award badge'
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
    const totalUsers = await Loyalty.countDocuments();
    const activeUsers = await Loyalty.countDocuments({
      'pointsHistory.date': { $gte: startDate }
    });
    
    // Get tier distribution
    const tierDistribution = await Loyalty.aggregate([
      { $group: { _id: '$tier.current', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get points distribution
    const pointsStats = await Loyalty.aggregate([
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$points.total' },
          avgPoints: { $avg: '$points.total' },
          maxPoints: { $max: '$points.total' }
        }
      }
    ]);
    
    // Get spin statistics
    const spinStats = await Loyalty.aggregate([
      {
        $group: {
          _id: null,
          totalSpins: { $sum: '$stats.totalSpins' },
          successfulSpins: { $sum: '$stats.successfulSpins' },
          avgSpinsPerUser: { $avg: '$stats.totalSpins' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
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

module.exports = router;
