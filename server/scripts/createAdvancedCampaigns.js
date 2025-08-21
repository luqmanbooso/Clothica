const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAdvancedCampaigns = async () => {
  try {
    console.log('🚀 Creating Advanced Campaigns with Full System Flow...');
    
    // Clear existing campaigns
    await Campaign.deleteMany({});
    console.log('✅ Cleared existing campaigns');

    const advancedCampaigns = [
      {
        name: 'First-Time Buyer Welcome Experience',
        type: 'welcome',
        description: 'Complete welcome campaign with spin wheel, banners, and mini coupons for new users',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        priority: 1,
        budget: 1000,
        targetAudience: 'new_users',
        status: 'active',
        
        // Enhanced Eligibility Rules
        eligibilityRules: {
          userType: ['new'],
          minCartValue: 0,
          maxCartValue: null,
          purchaseHistory: {
            firstTime: true,
            minOrders: 0,
            maxOrders: 1,
            minTotalSpent: 0
          },
          cartAbandonment: {
            enabled: false,
            threshold: '1_hour'
          },
          geographicLocation: ['all'],
          deviceType: ['all'],
          userSegments: []
        },
        
        // Enhanced Activation Triggers
        activationTriggers: {
          pageVisit: {
            enabled: true,
            pages: ['home', 'product'],
            delay: '5_seconds'
          },
          cartAction: {
            enabled: true,
            trigger: 'add_item',
            threshold: 1
          },
          timeBased: {
            enabled: false,
            startHour: 9,
            endHour: 21,
            daysOfWeek: [1, 2, 3, 4, 5],
            timezone: 'UTC'
          },
          userBehavior: {
            scrollDepth: 70,
            timeOnPage: 30,
            productViews: 3,
            pageViews: 2
          }
        },
        
        // Complete Event Components
        components: {
          banners: [
            {
              id: 'welcome_popup',
              type: 'popup',
              position: 'center',
              trigger: 'first_visit',
              content: {
                title: 'Welcome! Get 10% off your first purchase!',
                subtitle: 'Spin the wheel for additional rewards',
                image: 'welcome_banner.jpg',
                cta: {
                  text: 'Claim Offer',
                  action: 'spin_wheel',
                  url: '#'
                },
                animation: 'slide_in'
              },
              rules: {
                userType: ['new'],
                maxDisplays: 1,
                cooldown: '24_hours',
                category: null,
                minCartValue: 0,
                maxCartValue: null
              },
              display: {
                priority: 'high',
                mobileOptimized: true,
                dismissible: true
              }
            },
            {
              id: 'category_banner',
              type: 'inline',
              position: 'top',
              trigger: 'category_view',
              content: {
                title: 'New User Special: 15% off all categories!',
                subtitle: 'Limited time offer for first-time buyers',
                image: 'category_special.jpg',
                cta: {
                  text: 'Shop Now',
                  action: 'navigate',
                  url: '/shop'
                },
                animation: 'fade_in'
              },
              rules: {
                userType: ['new'],
                maxDisplays: 3,
                cooldown: '24_hours',
                category: null,
                minCartValue: 0,
                maxCartValue: null
              },
              display: {
                priority: 'medium',
                mobileOptimized: true,
                dismissible: true
              }
            }
          ],
          
          miniCoupons: [
            {
              id: 'first_purchase_10',
              code: 'FIRST10',
              type: 'percentage',
              value: 10,
              trigger: 'account_creation',
              conditions: {
                userType: ['new'],
                minOrder: 25,
                maxOrder: null,
                maxUses: 1,
                maxUsesPerUser: 1,
                applicableProducts: [],
                excludedProducts: [],
                applicableCategories: [],
                excludedCategories: []
              },
              display: {
                position: 'sticky_top',
                message: 'Use code FIRST10 for 10% off your first purchase!',
                countdown: true,
                expiresIn: '7_days',
                urgency: 'high'
              },
              usage: {
                totalIssued: 0,
                totalRedeemed: 0,
                totalRevenue: 0
              }
            },
            {
              id: 'free_shipping_first',
              code: 'FREESHIP1',
              type: 'free_shipping',
              value: 0,
              trigger: 'cart_action',
              conditions: {
                userType: ['new'],
                minOrder: 50,
                maxOrder: null,
                maxUses: 1,
                maxUsesPerUser: 1,
                applicableProducts: [],
                excludedProducts: [],
                applicableCategories: [],
                excludedCategories: []
              },
              display: {
                position: 'sticky_bottom',
                message: 'Free shipping on orders over $50!',
                countdown: false,
                expiresIn: '30_days',
                urgency: 'medium'
              },
              usage: {
                totalIssued: 0,
                totalRedeemed: 0,
                totalRevenue: 0
              }
            }
          ],
          
          timeBasedOffers: [
            {
              id: 'flash_discount_25',
              type: 'flash_discount',
              value: 25,
              duration: '2_hours',
              trigger: 'time_based',
              conditions: {
                timeSlot: '9-21',
                daysOfWeek: [1, 2, 3, 4, 5],
                maxRedemptions: 100,
                userType: ['new'],
                minCartValue: 0
              },
              display: {
                position: 'floating_widget',
                message: '🔥 Flash Sale: 25% off for new users! Expires in {countdown}',
                animation: 'pulse',
                urgency: 'urgent',
                countdown: true
              }
            }
          ],
          
          spinWheel: {
            enabled: true,
            cost: { type: 'free', amount: 0 },
            rewards: [
              {
                type: 'coupon',
                value: 15,
                probability: 30,
                name: '15% Off Coupon',
                icon: '🎫',
                color: '#3B82F6',
                conditions: {
                  userType: ['new'],
                  minOrder: 30,
                  maxUses: 1
                }
              },
              {
                type: 'free_shipping',
                value: 0,
                probability: 25,
                name: 'Free Shipping',
                icon: '🚚',
                color: '#10B981',
                conditions: {
                  userType: ['new'],
                  minOrder: 25,
                  maxUses: 1
                }
              },
              {
                type: 'points',
                value: 100,
                probability: 20,
                name: '100 Loyalty Points',
                icon: '⭐',
                color: '#F59E0B',
                conditions: {
                  userType: ['new'],
                  minOrder: 0,
                  maxUses: 1
                }
              },
              {
                type: 'product_discount',
                value: 20,
                probability: 15,
                name: '20% Off Next Product',
                icon: '🎁',
                color: '#8B5CF6',
                conditions: {
                  userType: ['new'],
                  minOrder: 20,
                  maxUses: 1
                }
              },
              {
                type: 'free_gift',
                value: 0,
                probability: 10,
                name: 'Free Gift with Purchase',
                icon: '🎁',
                color: '#EC4899',
                conditions: {
                  userType: ['new'],
                  minOrder: 40,
                  maxUses: 1
                }
              }
            ],
            maxSpinsPerUser: 1,
            cooldown: 0,
            display: {
              trigger: 'first_visit',
              position: 'center',
              animation: 'slide_in'
            }
          },
          
          loyaltyEnhancement: {
            enabled: true,
            pointMultiplier: 2.0,
            bonusPoints: 100,
            exclusiveRewards: ['Early Access to Sales', 'VIP Customer Support', 'Exclusive Product Launches'],
            display: {
              message: 'Welcome to our loyalty program! You earn 2x points and get exclusive rewards.',
              position: 'notification',
              showProgress: true
            }
          }
        },
        
        rules: {
          minOrderAmount: 0,
          maxDiscount: 50,
          userGroups: [],
          productCategories: [],
          excludedProducts: [],
          stackingRules: {
            allowMultipleCoupons: false,
            maxDiscountPercentage: 50,
            excludeCategories: []
          }
        },
        
        schedule: {
          timeBasedDisplay: {
            enabled: false,
            startHour: 9,
            endHour: 21,
            daysOfWeek: [1, 2, 3, 4, 5]
          },
          frequency: 'one_time',
          customSchedule: new Map()
        },
        
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          roi: 0,
          componentMetrics: {
            banners: { displays: 0, clicks: 0, conversions: 0 },
            miniCoupons: { issued: 0, redeemed: 0, revenue: 0 },
            timeBasedOffers: { activations: 0, redemptions: 0, revenue: 0 },
            spinWheel: { spins: 0, rewards: 0, conversions: 0 }
          }
        }
      },
      
      {
        name: 'Flash Sale Weekend Extravaganza',
        type: 'flash_sale',
        description: 'Weekend flash sales with time-based offers and spin wheel rewards',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        priority: 2,
        budget: 2000,
        targetAudience: 'all',
        status: 'active',
        
        eligibilityRules: {
          userType: ['all'],
          minCartValue: 0,
          maxCartValue: null,
          purchaseHistory: {
            firstTime: false,
            minOrders: 0,
            maxOrders: null,
            minTotalSpent: 0
          },
          cartAbandonment: {
            enabled: true,
            threshold: '2_hours'
          },
          geographicLocation: ['all'],
          deviceType: ['all'],
          userSegments: []
        },
        
        activationTriggers: {
          pageVisit: {
            enabled: true,
            pages: ['home', 'shop', 'category'],
            delay: 'immediate'
          },
          cartAction: {
            enabled: true,
            trigger: 'add_item',
            threshold: 1
          },
          timeBased: {
            enabled: true,
            startHour: 9,
            endHour: 23,
            daysOfWeek: [0, 6], // Weekend
            timezone: 'UTC'
          },
          userBehavior: {
            scrollDepth: 50,
            timeOnPage: 20,
            productViews: 2,
            pageViews: 1
          }
        },
        
        components: {
          banners: [
            {
              id: 'weekend_flash_banner',
              type: 'sticky_top',
              position: 'top',
              trigger: 'page_visit',
              content: {
                title: '🔥 WEEKEND FLASH SALE! 🔥',
                subtitle: 'Up to 50% off + Spin for Extra Rewards!',
                image: 'weekend_sale.jpg',
                cta: {
                  text: 'Shop Now & Spin!',
                  action: 'navigate',
                  url: '/shop'
                },
                animation: 'pulse'
              },
              rules: {
                userType: ['all'],
                maxDisplays: 5,
                cooldown: '6_hours',
                category: null,
                minCartValue: 0,
                maxCartValue: null
              },
              display: {
                priority: 'urgent',
                mobileOptimized: true,
                dismissible: false
              }
            }
          ],
          
          miniCoupons: [
            {
              id: 'weekend_20_off',
              code: 'WEEKEND20',
              type: 'percentage',
              value: 20,
              trigger: 'time_based',
              conditions: {
                userType: ['all'],
                minOrder: 40,
                maxOrder: null,
                maxUses: 500,
                maxUsesPerUser: 1,
                applicableProducts: [],
                excludedProducts: [],
                applicableCategories: [],
                excludedCategories: []
              },
              display: {
                position: 'popup',
                message: 'Weekend Special: 20% off orders over $40!',
                countdown: true,
                expiresIn: '24_hours',
                urgency: 'high'
              },
              usage: {
                totalIssued: 0,
                totalRedeemed: 0,
                totalRevenue: 0
              }
            }
          ],
          
          timeBasedOffers: [
            {
              id: 'hourly_special',
              type: 'hourly_special',
              value: 30,
              duration: '1_hour',
              trigger: 'time_based',
              conditions: {
                timeSlot: '12-13',
                daysOfWeek: [0, 6],
                maxRedemptions: 50,
                userType: ['all'],
                minCartValue: 30
              },
              display: {
                position: 'floating_widget',
                message: '⚡ Hourly Special: 30% off for the next hour!',
                animation: 'bounce',
                urgency: 'urgent',
                countdown: true
              }
            }
          ],
          
          spinWheel: {
            enabled: true,
            cost: { type: 'free', amount: 0 },
            rewards: [
              {
                type: 'coupon',
                value: 25,
                probability: 40,
                name: '25% Off Coupon',
                icon: '🎫',
                color: '#EF4444',
                conditions: {
                  userType: ['all'],
                  minOrder: 50,
                  maxUses: 1
                }
              },
              {
                type: 'free_shipping',
                value: 0,
                probability: 30,
                name: 'Free Shipping',
                icon: '🚚',
                color: '#10B981',
                conditions: {
                  userType: ['all'],
                  minOrder: 30,
                  maxUses: 1
                }
              },
              {
                type: 'points',
                value: 200,
                probability: 20,
                name: '200 Bonus Points',
                icon: '⭐',
                color: '#F59E0B',
                conditions: {
                  userType: ['all'],
                  minOrder: 0,
                  maxUses: 1
                }
              },
              {
                type: 'product_discount',
                value: 15,
                probability: 10,
                name: '15% Off Next Product',
                icon: '🎁',
                color: '#8B5CF6',
                conditions: {
                  userType: ['all'],
                  minOrder: 25,
                  maxUses: 1
                }
              }
            ],
            maxSpinsPerUser: 2,
            cooldown: 720, // 12 hours
            display: {
              trigger: 'cart_action',
              position: 'right_side',
              animation: 'bounce_in'
            }
          },
          
          loyaltyEnhancement: {
            enabled: true,
            pointMultiplier: 1.5,
            bonusPoints: 50,
            exclusiveRewards: ['Weekend VIP Access', 'Extended Return Window'],
            display: {
              message: 'Weekend bonus: 1.5x points on all purchases!',
              position: 'notification',
              showProgress: true
            }
          }
        },
        
        rules: {
          minOrderAmount: 0,
          maxDiscount: 50,
          userGroups: [],
          productCategories: [],
          excludedProducts: [],
          stackingRules: {
            allowMultipleCoupons: true,
            maxDiscountPercentage: 50,
            excludeCategories: []
          }
        },
        
        schedule: {
          timeBasedDisplay: {
            enabled: true,
            startHour: 9,
            endHour: 23,
            daysOfWeek: [0, 6]
          },
          frequency: 'weekly',
          customSchedule: new Map()
        },
        
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          roi: 0,
          componentMetrics: {
            banners: { displays: 0, clicks: 0, conversions: 0 },
            miniCoupons: { issued: 0, redeemed: 0, revenue: 0 },
            timeBasedOffers: { activations: 0, redemptions: 0, revenue: 0 },
            spinWheel: { spins: 0, rewards: 0, conversions: 0 }
          }
        }
      }
    ];

    const createdCampaigns = await Campaign.insertMany(advancedCampaigns);
    console.log(`✅ Created ${createdCampaigns.length} advanced campaigns`);
    
    // Display summary
    console.log('\n📊 Campaign Summary:');
    createdCampaigns.forEach((campaign, index) => {
      console.log(`\n${index + 1}. ${campaign.name}`);
      console.log(`   Type: ${campaign.type}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Components:`);
      console.log(`     - Banners: ${campaign.components.banners.length}`);
      console.log(`     - Mini Coupons: ${campaign.components.miniCoupons.length}`);
      console.log(`     - Time-Based Offers: ${campaign.components.timeBasedOffers.length}`);
      console.log(`     - Spin Wheel: ${campaign.components.spinWheel.enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`     - Loyalty Enhancement: ${campaign.components.loyaltyEnhancement.enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`   Smart Triggers:`);
      console.log(`     - Page Visit: ${campaign.activationTriggers.pageVisit.enabled ? 'Yes' : 'No'}`);
      console.log(`     - Cart Action: ${campaign.activationTriggers.cartAction.enabled ? 'Yes' : 'No'}`);
      console.log(`     - Time-Based: ${campaign.activationTriggers.timeBased.enabled ? 'Yes' : 'No'}`);
      console.log(`     - User Behavior: ${campaign.activationTriggers.userBehavior ? 'Yes' : 'No'}`);
    });
    
    console.log('\n🎉 Advanced Campaign System Ready!');
    console.log('🚀 Your Event Management System is now fully operational with:');
    console.log('   ✅ Enhanced Eligibility Rules');
    console.log('   ✅ Smart Activation Triggers');
    console.log('   ✅ Complete Event Components');
    console.log('   ✅ Advanced Business Rules');
    console.log('   ✅ A/B Testing Support');
    
  } catch (error) {
    console.error('❌ Error creating advanced campaigns:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdvancedCampaigns();
