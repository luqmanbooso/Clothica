const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const SpecialOffer = require('../models/SpecialOffer');

// Get user loyalty profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update badge and spins if needed
    await user.updateBadgeAndSpins();
    await user.resetMonthlySpins();

    const loyaltyData = {
      loyaltyPoints: user.loyaltyPoints,
      currentBadge: user.currentBadge,
      loyaltyMembership: user.loyaltyMembership,
      totalPointsEarned: user.totalPointsEarned,
      totalPointsRedeemed: user.totalPointsRedeemed,
      totalRedemptionValue: user.totalRedemptionValue,
      spinChances: user.spinChances,
      spinsUsed: user.spinsUsed,
      availableSpins: user.spinChances - user.spinsUsed,
      lastSpinReset: user.lastSpinReset,
      badgeHistory: user.badgeHistory,
      spinHistory: user.spinHistory,
      loyaltyHistory: user.loyaltyHistory.slice(-10) // Last 10 transactions
    };

    res.json(loyaltyData);
  } catch (error) {
    console.error('Error fetching loyalty profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Spin the wheel
router.post('/spin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update badge and spins
    await user.updateBadgeAndSpins();
    await user.resetMonthlySpins();

    // Check if user can spin
    if (!user.canSpin()) {
      return res.status(400).json({ 
        message: 'No spin chances remaining',
        availableSpins: 0,
        nextReset: user.lastSpinReset
      });
    }

    // Get active spin events
    const spinEvents = await SpecialOffer.getSpinEvents();
    let spinResult = null;

    if (spinEvents.length > 0) {
      // Use event-specific spin logic
      const activeEvent = spinEvents[0]; // Get the most recent active event
      spinResult = await performEventSpin(activeEvent);
    } else {
      // Use default spin logic
      spinResult = await performDefaultSpin();
    }

    // Use the spin
    await user.useSpin();

    // Add to spin history
    user.spinHistory.push({
      date: new Date(),
      won: spinResult.won,
      couponCode: spinResult.couponCode || null,
      discount: spinResult.discount || 0,
      description: spinResult.description
    });

    // If won a coupon, generate it
    if (spinResult.won && spinResult.discount > 0) {
      const coupon = await Coupon.generateSpinCoupon(user._id, {
        discount: spinResult.discount,
        rarity: spinResult.rarity,
        color: spinResult.color,
        icon: spinResult.icon
      });
      await coupon.save();
      spinResult.couponCode = coupon.code;
    }

    await user.save();

    res.json({
      success: true,
      spinResult,
      availableSpins: user.spinChances - user.spinsUsed,
      message: spinResult.won ? 'Congratulations! You won a coupon!' : 'Better luck next time!'
    });

  } catch (error) {
    console.error('Error during spin:', error);
    res.status(500).json({ message: 'Server error during spin' });
  }
});

// Perform event-specific spin
async function performEventSpin(event) {
  const rewards = event.spinEventRewards || [];
  if (rewards.length === 0) {
    return performDefaultSpin();
  }

  // Calculate total probability
  const totalProbability = rewards.reduce((sum, reward) => sum + reward.probability, 0);
  const random = Math.random() * totalProbability;

  let currentSum = 0;
  for (const reward of rewards) {
    currentSum += reward.probability;
    if (random <= currentSum) {
      return {
        won: true,
        discount: reward.discount,
        rarity: reward.rarity,
        color: reward.color,
        icon: reward.icon,
        description: `Won ${reward.discount}% off from ${event.name}!`,
        eventName: event.name
      };
    }
  }

  // No win
  return {
    won: false,
    description: 'No luck this time!',
    eventName: event.name
  };
}

// Perform default spin
async function performDefaultSpin() {
  const random = Math.random() * 100;
  
  // 40% chance: No coupon
  if (random < 40) {
    return {
      won: false,
      description: 'No luck this time! Try again next month!'
    };
  }
  
  // 30% chance: 5% off
  if (random < 70) {
    return {
      won: true,
      discount: 5,
      rarity: 'common',
      color: '#6C7A59',
      icon: '🎉',
      description: 'Won 5% off! A small but sweet discount!'
    };
  }
  
  // 20% chance: 10% off
  if (random < 90) {
    return {
      won: true,
      discount: 10,
      rarity: 'uncommon',
      color: '#FF6B6B',
      icon: '🎊',
      description: 'Won 10% off! Nice discount!'
    };
  }
  
  // 8% chance: 15% off
  if (random < 98) {
    return {
      won: true,
      discount: 15,
      rarity: 'rare',
      color: '#4ECDC4',
      icon: '💎',
      description: 'Won 15% off! Great discount!'
    };
  }
  
  // 2% chance: 20% off
  return {
    won: true,
    discount: 20,
    rarity: 'epic',
    color: '#FFE66D',
    icon: '🏆',
    description: 'Won 20% off! Amazing discount!'
  };
}

// Earn points (admin only)
router.post('/earn', auth, admin, async (req, res) => {
  try {
    const { userId, amount, action } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.earnPoints(amount, action);
    await user.updateBadgeAndSpins();

    res.json({ 
      message: 'Points awarded successfully',
      newPoints: user.loyaltyPoints,
      newBadge: user.currentBadge,
      spinChances: user.spinChances
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Redeem points
router.post('/redeem', auth, async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (points > user.loyaltyPoints) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    if (points < 100) {
      return res.status(400).json({ message: 'Minimum 100 points required for redemption' });
    }

    // Calculate redemption value with bonus
    const baseValue = points;
    const bonus = Math.floor(points * 0.1); // 10% bonus
    const totalValue = baseValue + bonus;

    // Deduct points
    user.loyaltyPoints -= points;
    user.totalPointsRedeemed += points;
    user.totalRedemptionValue += totalValue;

    // Add to history
    user.loyaltyHistory.push({
      action: 'redemption',
      points: -points,
      description: `Redeemed ${points} points for LKR ${totalValue} value`
    });

    await user.save();

    res.json({
      message: 'Points redeemed successfully',
      pointsRedeemed: points,
      redemptionValue: totalValue,
      remainingPoints: user.loyaltyPoints
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update login streak
router.post('/login-streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.updateLoginStreak();
    await user.updateBadgeAndSpins();

    res.json({
      message: 'Login streak updated',
      loginStreak: user.loginStreak,
      currentBadge: user.currentBadge,
      spinChances: user.spinChances
    });
  } catch (error) {
    console.error('Error updating login streak:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upgrade membership
router.post('/upgrade', auth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can upgrade
    if (membershipType === 'premium' && user.loyaltyPoints < 500) {
      return res.status(400).json({ message: 'Need 500+ points for Premium membership' });
    }
    
    if (membershipType === 'vip' && user.loyaltyPoints < 1000) {
      return res.status(400).json({ message: 'Need 1000+ points for VIP membership' });
    }

    user.loyaltyMembership = membershipType;
    user.membershipExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    await user.save();
    await user.updateBadgeAndSpins();

    res.json({
      message: 'Membership upgraded successfully',
      newMembership: user.loyaltyMembership,
      newBadge: user.currentBadge,
      spinChances: user.spinChances
    });
  } catch (error) {
    console.error('Error upgrading membership:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Referral system
router.post('/refer', auth, async (req, res) => {
  try {
    const { referralCode } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.referredBy) {
      return res.status(400).json({ message: 'Already referred by someone' });
    }

    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(400).json({ message: 'Invalid referral code' });
    }

    if (referrer._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: 'Cannot refer yourself' });
    }

    // Apply referral
    user.referredBy = referrer._id;
    await user.addReferral(referrer._id);
    
    // Award points to both users
    await user.earnPoints(50, 'referral_bonus');
    await referrer.earnPoints(100, 'referral_reward');
    
    await user.updateBadgeAndSpins();
    await referrer.updateBadgeAndSpins();

    res.json({
      message: 'Referral applied successfully',
      pointsEarned: 50,
      referrerPointsEarned: 100
    });
  } catch (error) {
    console.error('Error applying referral:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get referral code
router.get('/referral-code', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.referralCode) {
      user.referralCode = user.generateReferralCode();
      await user.save();
    }

    res.json({
      referralCode: user.referralCode,
      referrals: user.referrals.length,
      totalEarned: user.totalPointsEarned
    });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get loyalty stats (admin only)
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const bronzeUsers = await User.countDocuments({ currentBadge: 'bronze' });
    const silverUsers = await User.countDocuments({ currentBadge: 'silver' });
    const goldUsers = await User.countDocuments({ currentBadge: 'gold' });
    const vipUsers = await User.countDocuments({ currentBadge: 'vip' });

    const totalPoints = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$loyaltyPoints' } } }
    ]);

    const totalEarned = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPointsEarned' } } }
    ]);

    const totalRedeemed = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPointsRedeemed' } } }
    ]);

    const totalRedemptionValue = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalRedemptionValue' } } }
    ]);

    // Spin statistics
    const spinStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalSpins: { $sum: '$spinsUsed' },
          totalSpinChances: { $sum: '$spinChances' },
          avgSpinChances: { $avg: '$spinChances' }
        }
      }
    ]);

    res.json({
      userStats: {
        total: totalUsers,
        bronze: bronzeUsers,
        silver: silverUsers,
        gold: goldUsers,
        vip: vipUsers
      },
      pointStats: {
        totalPoints: totalPoints[0]?.total || 0,
        totalEarned: totalEarned[0]?.total || 0,
        totalRedeemed: totalRedeemed[0]?.total || 0,
        totalRedemptionValue: totalRedemptionValue[0]?.total || 0
      },
      spinStats: {
        totalSpins: spinStats[0]?.totalSpins || 0,
        totalSpinChances: spinStats[0]?.totalSpinChances || 0,
        avgSpinChances: Math.round(spinStats[0]?.avgSpinChances || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching loyalty stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
