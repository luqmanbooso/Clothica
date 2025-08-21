const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createSampleCampaigns = async () => {
  try {
    console.log('🚀 Creating Sample Campaigns...');

    // Clear existing campaigns
    await Campaign.deleteMany({});
    console.log('✅ Cleared existing campaigns');

    // Sample campaigns data
    const sampleCampaigns = [
      {
        name: 'Welcome New Users 2024',
        type: 'welcome',
        description: 'Welcome campaign for new users with spin wheel rewards and loyalty boost',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        priority: 1,
        budget: 5000,
        targetAudience: 'new_users',
        status: 'active',
        components: {
          banners: [],
          coupons: [],
          specialOffers: [],
          spinWheel: {
            enabled: true,
            cost: { type: 'free', amount: 0 },
            rewards: [
              { type: 'coupon', value: 20, probability: 30, name: '20% Welcome Discount', icon: '🎫', color: 'bg-green-500' },
              { type: 'points', value: 100, probability: 25, name: '100 Bonus Points', icon: '⭐', color: 'bg-yellow-500' },
              { type: 'free_shipping', value: 0, probability: 20, name: 'Free Shipping', icon: '🚚', color: 'bg-purple-500' },
              { type: 'points', value: 200, probability: 15, name: '200 Bonus Points', icon: '⭐', color: 'bg-orange-500' },
              { type: 'product_discount', value: 25, probability: 10, name: '25% Product Discount', icon: '🎁', color: 'bg-red-500' }
            ],
            maxSpinsPerUser: 1,
            cooldown: 0
          },
          loyaltyEnhancement: {
            enabled: true,
            pointMultiplier: 2.0,
            bonusPoints: 100,
            exclusiveRewards: ['Early Access to Sales', 'VIP Customer Support']
          }
        },
        triggers: {
          newUser: true,
          purchaseMilestone: false,
          loyaltyLevelUp: false,
          timeBased: false,
          manual: false
        }
      },
      {
        name: 'Loyalty Boost Campaign',
        type: 'loyalty_boost',
        description: 'Enhance loyalty program engagement with bonus points and exclusive rewards',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        priority: 2,
        budget: 3000,
        targetAudience: 'returning',
        status: 'active',
        components: {
          banners: [],
          coupons: [],
          specialOffers: [],
          spinWheel: {
            enabled: true,
            cost: { type: 'points', amount: 50 },
            rewards: [
              { type: 'coupon', value: 15, probability: 35, name: '15% Loyalty Discount', icon: '🎫', color: 'bg-blue-500' },
              { type: 'points', value: 150, probability: 30, name: '150 Bonus Points', icon: '⭐', color: 'bg-yellow-500' },
              { type: 'free_shipping', value: 0, probability: 20, name: 'Free Shipping', icon: '🚚', color: 'bg-purple-500' },
              { type: 'product_discount', value: 20, probability: 15, name: '20% Product Discount', icon: '🎁', color: 'bg-red-500' }
            ],
            maxSpinsPerUser: 3,
            cooldown: 1440 // 24 hours
          },
          loyaltyEnhancement: {
            enabled: true,
            pointMultiplier: 1.5,
            bonusPoints: 50,
            exclusiveRewards: ['Double Points Weekend', 'Exclusive Member Sales']
          }
        },
        triggers: {
          newUser: false,
          purchaseMilestone: true,
          loyaltyLevelUp: true,
          timeBased: false,
          manual: true
        }
      },
      {
        name: 'Flash Sale - Summer Collection',
        type: 'flash_sale',
        description: 'Limited time flash sale with spin wheel rewards and special offers',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        priority: 3,
        budget: 2000,
        targetAudience: 'all',
        status: 'active',
        components: {
          banners: [],
          coupons: [],
          specialOffers: [],
          spinWheel: {
            enabled: true,
            cost: { type: 'free', amount: 0 },
            rewards: [
              { type: 'coupon', value: 25, probability: 25, name: '25% Flash Sale Discount', icon: '🎫', color: 'bg-red-500' },
              { type: 'coupon', value: 30, probability: 15, name: '30% Flash Sale Discount', icon: '🎫', color: 'bg-red-600' },
              { type: 'points', value: 300, probability: 30, name: '300 Bonus Points', icon: '⭐', color: 'bg-yellow-500' },
              { type: 'free_shipping', value: 0, probability: 20, name: 'Free Shipping', icon: '🚚', color: 'bg-purple-500' },
              { type: 'product_discount', value: 35, probability: 10, name: '35% Product Discount', icon: '🎁', color: 'bg-red-700' }
            ],
            maxSpinsPerUser: 2,
            cooldown: 720 // 12 hours
          },
          loyaltyEnhancement: {
            enabled: true,
            pointMultiplier: 2.0,
            bonusPoints: 200,
            exclusiveRewards: ['Flash Sale Access', 'Limited Edition Products']
          }
        },
        triggers: {
          newUser: false,
          purchaseMilestone: false,
          loyaltyLevelUp: false,
          timeBased: true,
          manual: true
        }
      },
      {
        name: 'Holiday Season Campaign',
        type: 'seasonal',
        description: 'Holiday season promotions with festive rewards and loyalty enhancements',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Start in 30 days
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // End in 3 months
        priority: 4,
        budget: 8000,
        targetAudience: 'all',
        status: 'draft',
        components: {
          banners: [],
          coupons: [],
          specialOffers: [],
          spinWheel: {
            enabled: true,
            cost: { type: 'points', amount: 100 },
            rewards: [
              { type: 'coupon', value: 20, probability: 30, name: '20% Holiday Discount', icon: '🎄', color: 'bg-green-500' },
              { type: 'points', value: 250, probability: 25, name: '250 Holiday Points', icon: '⭐', color: 'bg-yellow-500' },
              { type: 'free_shipping', value: 0, probability: 20, name: 'Free Holiday Shipping', icon: '🚚', color: 'bg-purple-500' },
              { type: 'product_discount', value: 30, probability: 15, name: '30% Product Discount', icon: '🎁', color: 'bg-red-500' },
              { type: 'points', value: 500, probability: 10, name: '500 Holiday Bonus', icon: '⭐', color: 'bg-orange-500' }
            ],
            maxSpinsPerUser: 5,
            cooldown: 1440 // 24 hours
          },
          loyaltyEnhancement: {
            enabled: true,
            pointMultiplier: 1.8,
            bonusPoints: 300,
            exclusiveRewards: ['Holiday Gift Sets', 'Festive Member Events']
          }
        },
        triggers: {
          newUser: false,
          purchaseMilestone: false,
          loyaltyLevelUp: false,
          timeBased: true,
          manual: true
        }
      },
      {
        name: 'VIP Milestone Rewards',
        type: 'loyalty_milestone',
        description: 'Reward VIP customers for reaching spending milestones',
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        priority: 5,
        budget: 1500,
        targetAudience: 'vip',
        status: 'active',
        components: {
          banners: [],
          coupons: [],
          specialOffers: [],
          spinWheel: {
            enabled: true,
            cost: { type: 'free', amount: 0 },
            rewards: [
              { type: 'coupon', value: 40, probability: 20, name: '40% VIP Discount', icon: '👑', color: 'bg-purple-500' },
              { type: 'points', value: 1000, probability: 25, name: '1000 VIP Points', icon: '⭐', color: 'bg-yellow-500' },
              { type: 'free_shipping', value: 0, probability: 25, name: 'Free VIP Shipping', icon: '🚚', color: 'bg-purple-500' },
              { type: 'product_discount', value: 50, probability: 15, name: '50% Product Discount', icon: '🎁', color: 'bg-red-500' },
              { type: 'points', value: 2000, probability: 15, name: '2000 VIP Bonus', icon: '⭐', color: 'bg-orange-500' }
            ],
            maxSpinsPerUser: 10,
            cooldown: 0
          },
          loyaltyEnhancement: {
            enabled: true,
            pointMultiplier: 3.0,
            bonusPoints: 1000,
            exclusiveRewards: ['VIP Concierge Service', 'Exclusive Product Launches']
          }
        },
        triggers: {
          newUser: false,
          purchaseMilestone: true,
          loyaltyLevelUp: true,
          timeBased: false,
          manual: true
        }
      }
    ];

    // Create campaigns
    const createdCampaigns = await Campaign.insertMany(sampleCampaigns);
    console.log(`✅ Created ${createdCampaigns.length} sample campaigns`);

    // Display campaign summary
    console.log('\n📊 Sample Campaigns Created:');
    createdCampaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name} (${campaign.type}) - ${campaign.status}`);
      console.log(`   Spin Wheel: ${campaign.components.spinWheel.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   Loyalty Enhancement: ${campaign.components.loyaltyEnhancement.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   Duration: ${campaign.duration} days`);
      console.log('');
    });

    console.log('🎯 Sample campaigns created successfully!');
    console.log('   You can now test the Campaign Hub functionality');
    
  } catch (error) {
    console.error('❌ Error creating sample campaigns:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createSampleCampaigns();
