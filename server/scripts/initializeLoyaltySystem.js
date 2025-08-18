const mongoose = require('mongoose');
const Badge = require('../models/Badge');
const SpinWheel = require('../models/SpinWheel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const initializeLoyaltySystem = async () => {
  try {
    console.log('🚀 Initializing Loyalty System...');

    // ========================================
    // CREATE DEFAULT BADGES
    // ========================================
    
    const defaultBadges = [
      // Purchase Badges
      {
        id: 'first_purchase',
        name: 'First Purchase',
        description: 'Made your first purchase',
        icon: '🛍️',
        category: 'purchase',
        rarity: 'common',
        trigger: {
          type: 'purchase_count',
          value: 1,
          timeframe: 'once'
        },
        reward: {
          type: 'points',
          value: 100,
          description: '100 bonus points'
        },
        display: {
          color: '#10B981',
          backgroundColor: '#D1FAE5',
          borderColor: '#059669',
          showInProfile: true,
          showInReviews: false,
          priority: 1
        }
      },
      {
        id: 'frequent_shopper',
        name: 'Frequent Shopper',
        description: 'Made 5 purchases',
        icon: '🛒',
        category: 'purchase',
        rarity: 'uncommon',
        trigger: {
          type: 'purchase_count',
          value: 5,
          timeframe: 'lifetime'
        },
        reward: {
          type: 'points',
          value: 250,
          description: '250 bonus points'
        },
        display: {
          color: '#3B82F6',
          backgroundColor: '#DBEAFE',
          borderColor: '#1D4ED8',
          showInProfile: true,
          showInReviews: false,
          priority: 2
        }
      },
      {
        id: 'big_spender',
        name: 'Big Spender',
        description: 'Spent over LKR 10,000',
        icon: '💰',
        category: 'purchase',
        rarity: 'rare',
        trigger: {
          type: 'purchase_value',
          value: 10000,
          timeframe: 'lifetime'
        },
        reward: {
          type: 'points',
          value: 500,
          description: '500 bonus points'
        },
        display: {
          color: '#8B5CF6',
          backgroundColor: '#EDE9FE',
          borderColor: '#5B21B6',
          showInProfile: true,
          showInReviews: false,
          priority: 3
        }
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Made purchases for 3 consecutive days',
        icon: '🔥',
        category: 'streak',
        rarity: 'epic',
        trigger: {
          type: 'purchase_streak',
          value: 3,
          timeframe: 'lifetime'
        },
        reward: {
          type: 'points',
          value: 1000,
          description: '1000 bonus points'
        },
        display: {
          color: '#F59E0B',
          backgroundColor: '#FEF3C7',
          borderColor: '#D97706',
          showInProfile: true,
          showInReviews: false,
          priority: 4
        }
      },
      
      // Loyalty Badges
      {
        id: 'bronze_member',
        name: 'Bronze Member',
        description: 'Reached Bronze tier',
        icon: '🥉',
        category: 'tier',
        rarity: 'common',
        trigger: {
          type: 'tier_upgrade',
          value: 1,
          timeframe: 'once'
        },
        reward: {
          type: 'points',
          value: 200,
          description: '200 bonus points'
        },
        display: {
          color: '#CD7F32',
          backgroundColor: '#FEF3C7',
          borderColor: '#B45309',
          showInProfile: true,
          showInReviews: false,
          priority: 5
        }
      },
      {
        id: 'silver_member',
        name: 'Silver Member',
        description: 'Reached Silver tier',
        icon: '🥈',
        category: 'tier',
        rarity: 'uncommon',
        trigger: {
          type: 'tier_upgrade',
          value: 2,
          timeframe: 'once'
        },
        reward: {
          type: 'points',
          value: 500,
          description: '500 bonus points'
        },
        display: {
          color: '#C0C0C0',
          backgroundColor: '#F3F4F6',
          borderColor: '#6B7280',
          showInProfile: true,
          showInReviews: false,
          priority: 6
        }
      },
      {
        id: 'gold_member',
        name: 'Gold Member',
        description: 'Reached Gold tier',
        icon: '🥇',
        category: 'tier',
        rarity: 'rare',
        trigger: {
          type: 'tier_upgrade',
          value: 3,
          timeframe: 'once'
        },
        reward: {
          type: 'points',
          value: 1000,
          description: '1000 bonus points'
        },
        display: {
          color: '#FFD700',
          backgroundColor: '#FEF3C7',
          borderColor: '#F59E0B',
          showInProfile: true,
          showInReviews: false,
          priority: 7
        }
      },
      {
        id: 'platinum_member',
        name: 'Platinum Member',
        description: 'Reached Platinum tier',
        icon: '💎',
        category: 'tier',
        rarity: 'epic',
        trigger: {
          type: 'tier_upgrade',
          value: 4,
          timeframe: 'once'
        },
        reward: {
          type: 'points',
          value: 2500,
          description: '2500 bonus points'
        },
        display: {
          color: '#E5E4E2',
          backgroundColor: '#F3F4F6',
          borderColor: '#6B7280',
          showInProfile: true,
          showInReviews: false,
          priority: 8
        }
      },
      {
        id: 'diamond_member',
        name: 'Diamond Member',
        description: 'Reached Diamond tier',
        icon: '👑',
        category: 'tier',
        rarity: 'legendary',
        trigger: {
          type: 'tier_upgrade',
          value: 5,
          timeframe: 'once'
        },
        reward: {
          type: 'points',
          value: 5000,
          description: '5000 bonus points'
        },
        display: {
          color: '#B9F2FF',
          backgroundColor: '#DBEAFE',
          borderColor: '#3B82F6',
          showInProfile: true,
          showInReviews: false,
          priority: 9
        }
      },
      
      // Social Badges
      {
        id: 'reviewer',
        name: 'Reviewer',
        description: 'Left 5 product reviews',
        icon: '✍️',
        category: 'social',
        rarity: 'uncommon',
        trigger: {
          type: 'review_count',
          value: 5,
          timeframe: 'lifetime'
        },
        reward: {
          type: 'points',
          value: 300,
          description: '300 bonus points'
        },
        display: {
          color: '#10B981',
          backgroundColor: '#D1FAE5',
          borderColor: '#059669',
          showInProfile: true,
          showInReviews: true,
          priority: 10
        }
      },
      {
        id: 'referral_master',
        name: 'Referral Master',
        description: 'Referred 3 friends',
        icon: '👥',
        category: 'social',
        rarity: 'rare',
        trigger: {
          type: 'referral_count',
          value: 3,
          timeframe: 'lifetime'
        },
        reward: {
          type: 'points',
          value: 750,
          description: '750 bonus points'
        },
        display: {
          color: '#8B5CF6',
          backgroundColor: '#EDE9FE',
          borderColor: '#5B21B6',
          showInProfile: true,
          showInReviews: false,
          priority: 11
        }
      },
      
      // Achievement Badges
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Made a purchase before 10 AM',
        icon: '🌅',
        category: 'achievement',
        rarity: 'common',
        trigger: {
          type: 'custom',
          value: 1,
          timeframe: 'once',
          conditions: [
            {
              field: 'purchaseTime',
              operator: 'less_than',
              value: '10:00'
            }
          ]
        },
        reward: {
          type: 'points',
          value: 150,
          description: '150 bonus points'
        },
        display: {
          color: '#F59E0B',
          backgroundColor: '#FEF3C7',
          borderColor: '#D97706',
          showInProfile: true,
          showInReviews: false,
          priority: 12
        }
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Made a purchase after 10 PM',
        icon: '🦉',
        category: 'achievement',
        rarity: 'uncommon',
        trigger: {
          type: 'custom',
          value: 1,
          timeframe: 'once',
          conditions: [
            {
              field: 'purchaseTime',
              operator: 'greater_than',
              value: '22:00'
            }
          ]
        },
        reward: {
          type: 'points',
          value: 200,
          description: '200 bonus points'
        },
        display: {
          color: '#6366F1',
          backgroundColor: '#E0E7FF',
          borderColor: '#4338CA',
          showInProfile: true,
          showInReviews: false,
          priority: 13
        }
      }
    ];

    console.log('📛 Creating default badges...');
    
    // Create a system admin user ID for badges
    const systemAdminId = new mongoose.Types.ObjectId();
    
    for (const badgeData of defaultBadges) {
      const existingBadge = await Badge.findOne({ id: badgeData.id });
      if (!existingBadge) {
        const badge = new Badge({
          ...badgeData,
          createdBy: systemAdminId
        });
        await badge.save();
        console.log(`✅ Created badge: ${badge.name}`);
      } else {
        console.log(`⏭️  Badge already exists: ${badgeData.name}`);
      }
    }

    // ========================================
    // CREATE DEFAULT SPIN WHEELS
    // ========================================
    
    const defaultSpinWheels = [
      {
        name: 'Daily Rewards Wheel',
        description: 'Spin daily to win amazing rewards!',
        slots: [
          {
            id: 'try_again',
            name: 'Try Again',
            description: 'Better luck next time!',
            icon: '😅',
            color: '#6B7280',
            probability: 40,
            reward: 'try_again',
            rewardValue: null,
            rarity: 'common'
          },
          {
            id: 'small_coupon',
            name: '5% Off Coupon',
            description: '5% discount on your next purchase',
            icon: '🎉',
            color: '#10B981',
            probability: 25,
            reward: 'coupon',
            rewardValue: 5,
            rarity: 'common'
          },
          {
            id: 'medium_coupon',
            name: '10% Off Coupon',
            description: '10% discount on your next purchase',
            icon: '🎊',
            color: '#3B82F6',
            probability: 20,
            reward: 'coupon',
            rewardValue: 10,
            rarity: 'uncommon'
          },
          {
            id: 'free_shipping',
            name: 'Free Shipping',
            description: 'Free shipping on your next order',
            icon: '🚚',
            color: '#8B5CF6',
            probability: 10,
            reward: 'free_shipping',
            rewardValue: null,
            rarity: 'rare'
          },
          {
            id: 'bonus_points',
            name: 'Bonus Points',
            description: '100 bonus loyalty points',
            icon: '⭐',
            color: '#F59E0B',
            probability: 5,
            reward: 'bonus_points',
            rewardValue: 100,
            rarity: 'epic'
          }
        ],
        tierModifiers: {
          bronze: {},
          silver: {
            small_coupon: 2,
            medium_coupon: 3,
            free_shipping: 2,
            bonus_points: 1
          },
          gold: {
            small_coupon: 3,
            medium_coupon: 4,
            free_shipping: 3,
            bonus_points: 2
          },
          platinum: {
            small_coupon: 4,
            medium_coupon: 5,
            free_shipping: 4,
            bonus_points: 3
          },
          diamond: {
            small_coupon: 5,
            medium_coupon: 6,
            free_shipping: 5,
            bonus_points: 4
          }
        },
        usage: {
          maxSpinsPerDay: 1,
          requireAuthentication: true,
          minOrderValue: 0
        },
        settings: {
          animationDuration: 3000,
          soundEnabled: true,
          showProbability: false,
          allowMultipleSpins: false
        },
        createdBy: systemAdminId
      },
      {
        name: 'VIP Rewards Wheel',
        description: 'Exclusive wheel for VIP members with better odds!',
        slots: [
          {
            id: 'try_again',
            name: 'Try Again',
            description: 'Better luck next time!',
            icon: '😅',
            color: '#6B7280',
            probability: 25,
            reward: 'try_again',
            rewardValue: null,
            rarity: 'common'
          },
          {
            id: 'medium_coupon',
            name: '15% Off Coupon',
            description: '15% discount on your next purchase',
            icon: '🎊',
            color: '#3B82F6',
            probability: 30,
            reward: 'coupon',
            rewardValue: 15,
            rarity: 'uncommon'
          },
          {
            id: 'large_coupon',
            name: '25% Off Coupon',
            description: '25% discount on your next purchase',
            icon: '🏆',
            color: '#8B5CF6',
            probability: 20,
            reward: 'coupon',
            rewardValue: 25,
            rarity: 'rare'
          },
          {
            id: 'free_shipping',
            name: 'Free Shipping',
            description: 'Free shipping on your next order',
            icon: '🚚',
            color: '#8B5CF6',
            probability: 15,
            reward: 'free_shipping',
            rewardValue: null,
            rarity: 'rare'
          },
          {
            id: 'bonus_points',
            name: 'Bonus Points',
            description: '250 bonus loyalty points',
            icon: '⭐',
            color: '#F59E0B',
            probability: 10,
            reward: 'bonus_points',
            rewardValue: 250,
            rarity: 'epic'
          }
        ],
        tierModifiers: {
          bronze: {},
          silver: {},
          gold: {
            medium_coupon: 2,
            large_coupon: 2,
            free_shipping: 2,
            bonus_points: 2
          },
          platinum: {
            medium_coupon: 3,
            large_coupon: 3,
            free_shipping: 3,
            bonus_points: 3
          },
          diamond: {
            medium_coupon: 4,
            large_coupon: 4,
            free_shipping: 4,
            bonus_points: 4
          }
        },
        usage: {
          maxSpinsPerDay: 2,
          requireAuthentication: true,
          minOrderValue: 5000
        },
        settings: {
          animationDuration: 4000,
          soundEnabled: true,
          showProbability: false,
          allowMultipleSpins: false
        },
        createdBy: systemAdminId
      }
    ];

    console.log('🎡 Creating default spin wheels...');
    for (const wheelData of defaultSpinWheels) {
      const existingWheel = await SpinWheel.findOne({ name: wheelData.name });
      if (!existingWheel) {
        const wheel = new SpinWheel(wheelData);
        await wheel.save();
        console.log(`✅ Created spin wheel: ${wheel.name}`);
      } else {
        console.log(`⏭️  Spin wheel already exists: ${wheelData.name}`);
      }
    }

    console.log('🎉 Loyalty system initialization completed successfully!');
    console.log(`📛 Created ${defaultBadges.length} badges`);
    console.log(`🎡 Created ${defaultSpinWheels.length} spin wheels`);
    console.log(`🔑 System Admin ID: ${systemAdminId}`);

  } catch (error) {
    console.error('❌ Error initializing loyalty system:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the initialization
initializeLoyaltySystem();
