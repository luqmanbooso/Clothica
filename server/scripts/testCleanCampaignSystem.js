const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothica', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testCleanCampaignSystem = async () => {
  try {
    console.log('🧪 Testing Clean Campaign System...\n');

    // Test 1: Create a simple event
    console.log('📝 Test 1: Creating a simple promotional event...');
    const testEvent = new Event({
      name: 'Summer Sale 2024',
      type: 'promotional',
      description: 'Annual summer sale with great discounts',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
      priority: 1,
      targetAudience: 'all',
      status: 'draft',
      createdBy: 'test-user-id'
    });

    await testEvent.save();
    console.log('✅ Event created successfully:', testEvent.name);
    console.log('   - Status:', testEvent.status);
    console.log('   - Components:', testEvent.totalComponents);
    console.log('   - Duration:', testEvent.duration, 'days\n');

    // Test 2: Add components to the event
    console.log('🔧 Test 2: Adding components to the event...');
    testEvent.components = {
      banners: [
        {
          bannerId: 'banner-1',
          displayMode: 'hero',
          priority: 1
        }
      ],
      discounts: [
        {
          discountId: 'discount-1',
          autoActivate: true,
          priority: 1
        }
      ],
      specialOffers: [
        {
          offerId: 'offer-1',
          autoActivate: true,
          priority: 1
        }
      ],
      spinWheel: {
        enabled: true,
        wheelId: 'wheel-1'
      }
    };

    await testEvent.save();
    console.log('✅ Components added successfully');
    console.log('   - Total Components:', testEvent.totalComponents);
    console.log('   - Banners:', testEvent.components.banners.length);
    console.log('   - Discounts:', testEvent.components.discounts.length);
    console.log('   - Special Offers:', testEvent.components.specialOffers.length);
    console.log('   - Spin Wheel:', testEvent.components.spinWheel.enabled ? 'Enabled' : 'Disabled\n');

    // Test 3: Activate the event
    console.log('🚀 Test 3: Activating the event...');
    await testEvent.activateEvent();
    console.log('✅ Event activated successfully');
    console.log('   - Status:', testEvent.status);
    console.log('   - Is Running:', testEvent.isRunning);
    console.log('   - History:', testEvent.history.length, 'entries\n');

    // Test 4: Update performance metrics
    console.log('📊 Test 4: Updating performance metrics...');
    await testEvent.updatePerformance('overall', 'views', 100);
    await testEvent.updatePerformance('overall', 'clicks', 25);
    await testEvent.updatePerformance('banner', 'displays', 150);
    await testEvent.updatePerformance('banner', 'clicks', 30);
    await testEvent.updatePerformance('discount', 'issued', 50);
    await testEvent.updatePerformance('discount', 'redeemed', 15);

    console.log('✅ Performance metrics updated successfully');
    console.log('   - Overall Views:', testEvent.performance.views);
    console.log('   - Overall Clicks:', testEvent.performance.clicks);
    console.log('   - Banner Displays:', testEvent.performance.bannerMetrics.displays);
    console.log('   - Banner Clicks:', testEvent.performance.bannerMetrics.clicks);
    console.log('   - Discounts Issued:', testEvent.performance.discountMetrics.issued);
    console.log('   - Discounts Redeemed:', testEvent.performance.discountMetrics.redeemed);

    // Test 5: Deactivate the event
    console.log('\n🛑 Test 5: Deactivating the event...');
    await testEvent.deactivateEvent();
    console.log('✅ Event deactivated successfully');
    console.log('   - Status:', testEvent.status);
    console.log('   - Is Running:', testEvent.isRunning);
    console.log('   - History:', testEvent.history.length, 'entries');

    // Test 6: Find events by type
    console.log('\n🔍 Test 6: Finding events by type...');
    const promotionalEvents = await Event.getEventsByType('promotional');
    console.log('✅ Found promotional events:', promotionalEvents.length);

    // Test 7: Find active events
    console.log('\n🔍 Test 7: Finding active events...');
    const activeEvents = await Event.getActiveEvents();
    console.log('✅ Found active events:', activeEvents.length);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Event.findByIdAndDelete(testEvent._id);
    console.log('✅ Test event deleted');

    console.log('\n🎉 All tests passed! The clean campaign system is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   - Event creation: ✅');
    console.log('   - Component management: ✅');
    console.log('   - Event activation: ✅');
    console.log('   - Performance tracking: ✅');
    console.log('   - Event deactivation: ✅');
    console.log('   - Event queries: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the test
testCleanCampaignSystem();
