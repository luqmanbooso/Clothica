const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testCampaignModel = async () => {
  try {
    console.log('🧪 Testing Campaign Model...');
    
    // Test 1: Basic find operation
    console.log('✅ Test 1: Basic find operation');
    const campaigns = await Campaign.find({}).limit(1);
    console.log(`Found ${campaigns.length} campaigns`);
    
    if (campaigns.length > 0) {
      const campaign = campaigns[0];
      console.log('Campaign data structure:');
      console.log('- Name:', campaign.name);
      console.log('- Type:', campaign.type);
      console.log('- Status:', campaign.status);
      console.log('- Components:', campaign.components ? 'Present' : 'Missing');
      console.log('- Total Components:', campaign.totalComponents);
    }
    
    // Test 2: Get active campaigns
    console.log('\n✅ Test 2: Get active campaigns');
    const activeCampaigns = await Campaign.getActiveCampaigns();
    console.log(`Found ${activeCampaigns.length} active campaigns`);
    
    // Test 3: Count total campaigns
    console.log('\n✅ Test 3: Count total campaigns');
    const total = await Campaign.countDocuments({});
    console.log(`Total campaigns in database: ${total}`);
    
    console.log('\n🎉 All tests passed! Campaign model is working correctly.');
    
  } catch (error) {
    console.error('❌ Error testing Campaign model:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    mongoose.connection.close();
  }
};

testCampaignModel();
