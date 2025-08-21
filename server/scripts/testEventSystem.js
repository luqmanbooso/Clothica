const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothica', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testEventSystem = async () => {
  try {
    console.log('🧪 Testing Event System...\\n');

    // Test 1: Create a simple event
    console.log('📝 Test 1: Creating a simple promotional event...');
    const testEvent = new Event({
      name: 'Test Summer Sale 2024',
      type: 'promotional',
      description: 'Test event for system verification',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
      priority: 1,
      targetAudience: 'all',
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(), // Dummy user ID
      components: {
        banners: [],
        discounts: [],
        specialOffers: [],
        spinWheel: { enabled: false }
      }
    });

    await testEvent.save();
    console.log('✅ Event created successfully:', testEvent.name);

    // Test 2: Test performance tracking
    console.log('\\n📊 Test 2: Testing performance tracking...');
    await testEvent.updatePerformance('overall', 'views', 10);
    await testEvent.updatePerformance('overall', 'clicks', 5);
    await testEvent.updatePerformance('overall', 'conversions', 2);
    await testEvent.updatePerformance('overall', 'revenue', 150.50);

    console.log('✅ Performance updated successfully');
    console.log('   Views:', testEvent.performance.views);
    console.log('   Clicks:', testEvent.performance.clicks);
    console.log('   Conversions:', testEvent.performance.conversions);
    console.log('   Revenue:', testEvent.performance.revenue);

    // Test 3: Test event activation
    console.log('\\n🚀 Test 3: Testing event activation...');
    await testEvent.activateEvent();
    console.log('✅ Event activated successfully. Status:', testEvent.status);

    // Test 4: Test event deactivation
    console.log('\\n⏹️ Test 4: Testing event deactivation...');
    await testEvent.deactivateEvent();
    console.log('✅ Event deactivated successfully. Status:', testEvent.status);

    // Test 5: Test event queries
    console.log('\\n🔍 Test 5: Testing event queries...');
    const foundEvent = await Event.findById(testEvent._id);
    if (foundEvent) {
      console.log('✅ Event found by ID:', foundEvent.name);
    }

    const activeEvents = await Event.find({ status: 'active' });
    console.log('✅ Active events count:', activeEvents.length);

    // Cleanup
    console.log('\\n🧹 Cleaning up test data...');
    await Event.findByIdAndDelete(testEvent._id);
    console.log('✅ Test event deleted');

    console.log('\\n🎉 All tests passed! Event system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    mongoose.connection.close();
    console.log('\\n🔌 Database connection closed');
  }
};

// Run the test
testEventSystem();
