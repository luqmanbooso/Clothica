const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothica', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createTestEvent = async () => {
  try {
    console.log('📝 Creating test event for admin API...');

    // Check if test event already exists
    const existingEvent = await Event.findOne({ name: 'Summer Sale 2024' });
    if (existingEvent) {
      console.log('✅ Test event already exists:', existingEvent.name);
      return;
    }

    // Create test event
    const testEvent = new Event({
      name: 'Summer Sale 2024',
      type: 'promotional',
      description: 'Annual summer sale with great discounts on all clothing items',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
      priority: 1,
      targetAudience: 'all',
      status: 'active',
      createdBy: new mongoose.Types.ObjectId(), // Dummy user ID
      components: {
        banners: [],
        discounts: [],
        specialOffers: [],
        spinWheel: { enabled: false }
      },
      performance: {
        views: 1250,
        clicks: 89,
        conversions: 23,
        revenue: 1250.75
      }
    });

    await testEvent.save();
    console.log('✅ Test event created successfully:', testEvent.name);
    console.log('   ID:', testEvent._id);
    console.log('   Status:', testEvent.status);
    console.log('   Performance - Views:', testEvent.performance.views);

  } catch (error) {
    console.error('❌ Error creating test event:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
createTestEvent();
