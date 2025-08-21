const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');

// Test script for Campaign APIs
async function testCampaignAPIs() {
  try {
    console.log('🧪 Testing Campaign APIs...\n');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/clothica', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Get all campaigns
    console.log('📋 Test 1: Get all campaigns');
    const campaigns = await Campaign.find({}).limit(5);
    console.log(`Found ${campaigns.length} campaigns`);
    if (campaigns.length > 0) {
      console.log('Sample campaign:', {
        id: campaigns[0]._id,
        name: campaigns[0].name,
        status: campaigns[0].status,
        components: Object.keys(campaigns[0].components || {})
      });
    }
    console.log('');
    
    // Test 2: Test campaign validation
    if (campaigns.length > 0) {
      console.log('🔍 Test 2: Campaign validation');
      const campaign = campaigns[0];
      
      const validation = {
        isValid: false,
        issues: [],
        warnings: [],
        recommendations: []
      };
      
      // Check required components
      if (!campaign.components?.banners || campaign.components.banners.length === 0) {
        validation.issues.push('No banners found - required for visibility');
      } else {
        validation.recommendations.push(`Has ${campaign.components.banners.length} banner(s)`);
      }
      
      if (!campaign.components?.miniCoupons && !campaign.components?.timeBasedOffers) {
        validation.issues.push('No discounts or special offers found - required for engagement');
      } else {
        const discountCount = (campaign.components.miniCoupons?.length || 0) + 
                             (campaign.components.timeBasedOffers?.length || 0);
        validation.recommendations.push(`Has ${discountCount} discount/offer(s)`);
      }
      
      validation.isValid = validation.issues.length === 0;
      
      console.log('Validation result:', validation);
      console.log(`Campaign "${campaign.name}" is ${validation.isValid ? 'VALID' : 'INVALID'}`);
      console.log('');
    }
    
    // Test 3: Test analytics aggregation
    console.log('📊 Test 3: Analytics aggregation');
    const analytics = await Campaign.aggregate([
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          avgPriority: { $avg: '$priority' },
          statusCounts: { $push: '$status' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCampaigns: 1,
          totalBudget: 1,
          avgPriority: { $round: ['$avgPriority', 2] }
        }
      }
    ]);
    
    console.log('Analytics result:', analytics[0] || {});
    console.log('');
    
    // Test 4: Test component analytics
    console.log('🧩 Test 4: Component analytics');
    const componentStats = await Campaign.aggregate([
      {
        $project: {
          bannerCount: { $size: { $ifNull: ['$components.banners', []] } },
          couponCount: { $size: { $ifNull: ['$components.miniCoupons', []] } },
          offerCount: { $size: { $ifNull: ['$components.timeBasedOffers', []] } }
        }
      },
      {
        $group: {
          _id: null,
          totalBanners: { $sum: '$bannerCount' },
          totalCoupons: { $sum: '$couponCount' },
          totalOffers: { $sum: '$offerCount' }
        }
      }
    ]);
    
    console.log('Component stats:', componentStats[0] || {});
    console.log('');
    
    // Test 5: Test campaign types
    console.log('🏷️ Test 5: Campaign types');
    const typeStats = await Campaign.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    console.log('Campaign types:', typeStats);
    console.log('');
    
    console.log('🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing Campaign APIs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the tests
if (require.main === module) {
  testCampaignAPIs();
}

module.exports = testCampaignAPIs;
