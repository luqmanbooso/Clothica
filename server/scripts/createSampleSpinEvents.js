const mongoose = require('mongoose');
const SpecialOffer = require('../models/SpecialOffer');
require('dotenv').config();

const createSampleSpinEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing spin events
    await SpecialOffer.deleteMany({ isSpinEvent: true });
    console.log('Cleared existing spin events');

    // Create Black Friday Spin Event
    const blackFridayEvent = new SpecialOffer({
      name: 'Black Friday Lucky Spin',
      description: 'Unlock amazing discounts with your lucky spins!',
      type: 'spin_event',
      discountType: 'percentage',
      discountValue: 0, // Will be determined by spin
      minOrderAmount: 1000,
      maxDiscount: 5000,
      targetUserGroups: ['all'],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isSpinEvent: true,
      spinEventTitle: 'Black Friday Lucky Spin',
      spinEventDescription: 'Spin to win amazing discounts this Black Friday!',
      spinEventDuration: 30,
      spinEventRewards: [
        {
          rarity: 'common',
          discount: 5,
          probability: 30,
          color: '#6C7A59',
          icon: '🎉',
          message: 'Small but sweet discount!'
        },
        {
          rarity: 'uncommon',
          discount: 10,
          probability: 20,
          color: '#FF6B6B',
          icon: '🎊',
          message: 'Nice discount!'
        },
        {
          rarity: 'rare',
          discount: 15,
          probability: 8,
          color: '#4ECDC4',
          icon: '💎',
          message: 'Great discount!'
        },
        {
          rarity: 'epic',
          discount: 20,
          probability: 2,
          color: '#FFE66D',
          icon: '🏆',
          message: 'Amazing discount!'
        }
      ],
      showInBanner: true,
      bannerPriority: 10,
      bannerPosition: 'hero',
      displayColor: '#FF6B6B',
      displayGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
      displayIcon: '🎰',
      displayMessage: '🎉 Black Friday Lucky Spin - Win up to 20% OFF!',
      status: 'active',
      createdBy: '000000000000000000000001' // Placeholder admin ID
    });

    await blackFridayEvent.save();
    console.log('Created Black Friday spin event');

    // Create Weekend Spin Event
    const weekendEvent = new SpecialOffer({
      name: 'Weekend Lucky Spin',
      description: 'Weekend special spins with enhanced rewards!',
      type: 'spin_event',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 500,
      maxDiscount: 3000,
      targetUserGroups: ['bronze', 'silver', 'gold', 'vip'],
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      isSpinEvent: true,
      spinEventTitle: 'Weekend Lucky Spin',
      spinEventDescription: 'Enhanced rewards for weekend shoppers!',
      spinEventDuration: 90,
      spinEventRewards: [
        {
          rarity: 'common',
          discount: 8,
          probability: 25,
          color: '#6C7A59',
          icon: '🎉',
          message: 'Weekend bonus discount!'
        },
        {
          rarity: 'uncommon',
          discount: 12,
          probability: 25,
          color: '#FF6B6B',
          icon: '🎊',
          message: 'Weekend special!'
        },
        {
          rarity: 'rare',
          discount: 18,
          probability: 10,
          color: '#4ECDC4',
          icon: '💎',
          message: 'Weekend exclusive!'
        },
        {
          rarity: 'epic',
          discount: 25,
          probability: 5,
          color: '#FFE66D',
          icon: '🏆',
          message: 'Weekend jackpot!'
        }
      ],
      showInBanner: true,
      bannerPriority: 8,
      bannerPosition: 'top',
      displayColor: '#4ECDC4',
      displayGradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
      displayIcon: '🎰',
      displayMessage: '🎉 Weekend Lucky Spin - Enhanced Rewards!',
      status: 'active',
      createdBy: '000000000000000000000001'
    });

    await weekendEvent.save();
    console.log('Created Weekend spin event');

    // Create Welcome Spin Event for New Users
    const welcomeEvent = new SpecialOffer({
      name: 'Welcome Lucky Spin',
      description: 'Welcome bonus spin for new customers!',
      type: 'spin_event',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 200,
      maxDiscount: 1000,
      targetUserGroups: ['new'],
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isSpinEvent: true,
      spinEventTitle: 'Welcome Lucky Spin',
      spinEventDescription: 'Welcome to our community! Take your first spin!',
      spinEventDuration: 365,
      spinEventRewards: [
        {
          rarity: 'common',
          discount: 10,
          probability: 40,
          color: '#6C7A59',
          icon: '🎉',
          message: 'Welcome discount!'
        },
        {
          rarity: 'uncommon',
          discount: 15,
          probability: 30,
          color: '#FF6B6B',
          icon: '🎊',
          message: 'Welcome bonus!'
        },
        {
          rarity: 'rare',
          discount: 20,
          probability: 20,
          color: '#4ECDC4',
          icon: '💎',
          message: 'Welcome gift!'
        },
        {
          rarity: 'epic',
          discount: 25,
          probability: 10,
          color: '#FFE66D',
          icon: '🏆',
          message: 'Welcome jackpot!'
        }
      ],
      showInBanner: true,
      bannerPriority: 9,
      bannerPosition: 'hero',
      displayColor: '#FFE66D',
      displayGradient: 'linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%)',
      displayIcon: '🎰',
      displayMessage: '🎉 Welcome Lucky Spin - New Customer Bonus!',
      status: 'active',
      createdBy: '000000000000000000000001'
    });

    await welcomeEvent.save();
    console.log('Created Welcome spin event');

    console.log('✅ Sample spin events created successfully!');
    console.log('📊 Created events:');
    console.log('   - Black Friday Lucky Spin');
    console.log('   - Weekend Lucky Spin');
    console.log('   - Welcome Lucky Spin');

  } catch (error) {
    console.error('Error creating sample spin events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSampleSpinEvents();
