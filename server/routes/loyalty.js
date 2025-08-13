const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Get user's loyalty profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('loyaltyPoints loyaltyMembership membershipExpiry totalPointsEarned totalPointsRedeemed totalRedemptionValue loginStreak birthday referralCode');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const benefits = user.getLoyaltyBenefits();
    
    res.json({
      points: user.loyaltyPoints,
      membership: user.loyaltyMembership,
      membershipExpiry: user.membershipExpiry,
      totalEarned: user.totalPointsEarned,
      totalRedeemed: user.totalPointsRedeemed,
      totalValue: user.totalRedemptionValue,
      loginStreak: user.loginStreak,
      birthday: user.birthday,
      referralCode: user.referralCode,
      benefits
    });
  } catch (error) {
    console.error('Error fetching loyalty profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Earn points (called after purchase)
router.post('/earn', auth, async (req, res) => {
  try {
    const { amount, action = 'purchase' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.earnPoints(amount, action);
    
    res.json({
      message: 'Points earned successfully',
      pointsEarned: user.loyaltyPoints,
      totalPoints: user.totalPointsEarned
    });
  } catch (error) {
    console.error('Error earning points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Redeem points for digital credit
router.post('/redeem', auth, async (req, res) => {
  try {
    const { points } = req.body;
    
    if (!points || points < 100) {
      return res.status(400).json({ message: 'Minimum redemption is 100 points' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (points > user.loyaltyPoints) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    await user.redeemPoints(points);
    
    const benefits = user.getLoyaltyBenefits();
    const redemptionValue = Math.floor(points * (1 + benefits.redemptionBonus / 100));
    
    res.json({
      message: 'Points redeemed successfully',
      pointsRedeemed: points,
      redemptionValue: redemptionValue,
      remainingPoints: user.loyaltyPoints,
      totalRedemptionValue: user.totalRedemptionValue
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(500).json({ message: error.message || 'Server error' });
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
    
    res.json({
      message: 'Login streak updated',
      loginStreak: user.loginStreak,
      points: user.loyaltyPoints
    });
  } catch (error) {
    console.error('Error updating login streak:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upgrade membership
router.post('/upgrade', auth, async (req, res) => {
  try {
    const { membershipType, paymentMethod } = req.body;
    
    if (!['premium', 'vip'].includes(membershipType)) {
      return res.status(400).json({ message: 'Invalid membership type' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set membership expiry (1 year from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    user.loyaltyMembership = membershipType;
    user.membershipExpiry = expiryDate;

    // Give welcome bonus points
    const welcomeBonus = membershipType === 'premium' ? 1000 : 2000;
    user.loyaltyPoints += welcomeBonus;
    
    user.loyaltyHistory.push({
      action: 'membership_upgrade',
      points: welcomeBonus,
      description: `Welcome bonus for ${membershipType} membership`,
      date: new Date()
    });

    await user.save();
    
    res.json({
      message: 'Membership upgraded successfully',
      membership: user.loyaltyMembership,
      expiry: user.membershipExpiry,
      welcomeBonus,
      totalPoints: user.loyaltyPoints
    });
  } catch (error) {
    console.error('Error upgrading membership:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get loyalty history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('loyaltyHistory');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      history: user.loyaltyHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
    });
  } catch (error) {
    console.error('Error fetching loyalty history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available offers based on membership
router.get('/offers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const benefits = user.getLoyaltyBenefits();
    
    const offers = [
      {
        id: 'weekend_bonus',
        name: 'Weekend Bonus',
        description: '2x points on weekends',
        active: true,
        multiplier: 2
      },
      {
        id: 'birthday_bonus',
        name: 'Birthday Month Bonus',
        description: '3x points in your birthday month',
        active: user.birthday && new Date().getMonth() === user.birthday.getMonth(),
        multiplier: 3
      },
      {
        id: 'login_streak',
        name: 'Login Streak',
        description: `Current streak: ${user.loginStreak} days`,
        active: true,
        currentStreak: user.loginStreak
      },
      {
        id: 'referral_bonus',
        name: 'Referral Bonus',
        description: '500 points per referral',
        active: true,
        bonus: 500
      }
    ];

    res.json({ offers, benefits });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refer a friend
router.post('/refer', auth, async (req, res) => {
  try {
    const { referralCode } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is required' });
    }

    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(400).json({ message: 'Invalid referral code' });
    }

    if (referrer._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot refer yourself' });
    }

    const user = await User.findById(req.user.id);
    if (user.referredBy) {
      return res.status(400).json({ message: 'Already referred by someone' });
    }

    user.referredBy = referrer._id;
    await user.save();

    await referrer.addReferral(user);
    
    res.json({
      message: 'Referral successful',
      referrer: referrer.email,
      bonusPoints: 500
    });
  } catch (error) {
    console.error('Error processing referral:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get loyalty statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await User.aggregate([
      {
        $group: {
          _id: '$loyaltyMembership',
          count: { $sum: 1 },
          totalPoints: { $sum: '$loyaltyPoints' },
          totalEarned: { $sum: '$totalPointsEarned' },
          totalRedeemed: { $sum: '$totalPointsRedeemed' },
          totalValue: { $sum: '$totalRedemptionValue' }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const totalPoints = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$loyaltyPoints' } } }
    ]);

    res.json({
      membershipStats: stats,
      totalUsers,
      totalPoints: totalPoints[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching loyalty stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
