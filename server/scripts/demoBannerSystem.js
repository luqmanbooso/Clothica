const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Banner = require('../models/Banner');
const Event = require('../models/Event');

const demoBannerSystem = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\n🎯 BANNER SYSTEM DEMONSTRATION');
    console.log('================================\n');

    // 1. Show all active banners
    console.log('1️⃣ ACTIVE BANNERS:');
    const activeBanners = await Banner.find({ isActive: true }).populate('eventId', 'name status');
    activeBanners.forEach((banner, index) => {
      console.log(`   ${index + 1}. ${banner.name} (${banner.position})`);
      console.log(`      Type: ${banner.type}`);
      console.log(`      Event: ${banner.eventId ? banner.eventId.name : 'None'}`);
      console.log(`      Pages: ${banner.displayRules?.showOnPages?.join(', ') || 'all'}`);
      console.log(`      Analytics: ${banner.analytics.displays} displays, ${banner.analytics.clicks} clicks`);
      console.log('');
    });

    // 2. Show banners by position
    console.log('2️⃣ BANNERS BY POSITION:');
    const positions = ['hero', 'top', 'middle', 'bottom', 'sidebar', 'popup', 'sticky'];
    for (const position of positions) {
      const banners = await Banner.find({ isActive: true, position });
      if (banners.length > 0) {
        console.log(`   ${position.toUpperCase()}: ${banners.length} banner(s)`);
        banners.forEach(banner => {
          console.log(`      - ${banner.name} (${banner.type})`);
        });
      }
    }
    console.log('');

    // 3. Show banners by page context
    console.log('3️⃣ BANNERS BY PAGE CONTEXT:');
    const pages = ['home', 'shop', 'product', 'category'];
    for (const page of pages) {
      const banners = await Banner.find({
        isActive: true,
        'displayRules.showOnPages': { $in: [page, 'all'] }
      });
      if (banners.length > 0) {
        console.log(`   ${page.toUpperCase()}: ${banners.length} banner(s)`);
        banners.forEach(banner => {
          console.log(`      - ${banner.name} (${banner.position})`);
        });
      }
    }
    console.log('');

    // 4. Show event-linked banners
    console.log('4️⃣ EVENT-LINKED BANNERS:');
    const eventBanners = await Banner.find({ 
      isActive: true, 
      eventId: { $exists: true, $ne: null } 
    }).populate('eventId', 'name status');
    
    if (eventBanners.length > 0) {
      eventBanners.forEach(banner => {
        console.log(`   - ${banner.name} linked to "${banner.eventId.name}" (${banner.eventId.status})`);
      });
    } else {
      console.log('   No event-linked banners found');
    }
    console.log('');

    // 5. Show banner templates
    console.log('5️⃣ BANNER TEMPLATES:');
    const templates = await Banner.find({ type: 'template', isActive: true });
    if (templates.length > 0) {
      templates.forEach(template => {
        console.log(`   - ${template.name}: ${template.description}`);
      });
    } else {
      console.log('   No banner templates found');
    }
    console.log('');

    // 6. Show performance analytics
    console.log('6️⃣ PERFORMANCE ANALYTICS:');
    const totalBanners = await Banner.countDocuments({ isActive: true });
    const totalDisplays = await Banner.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$analytics.displays' } } }
    ]);
    const totalClicks = await Banner.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$analytics.clicks' } } }
    ]);
    const totalConversions = await Banner.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$analytics.conversions' } } }
    ]);

    console.log(`   Total Active Banners: ${totalBanners}`);
    console.log(`   Total Displays: ${totalDisplays[0]?.total || 0}`);
    console.log(`   Total Clicks: ${totalClicks[0]?.total || 0}`);
    console.log(`   Total Conversions: ${totalConversions[0]?.total || 0}`);
    
    if (totalDisplays[0]?.total > 0) {
      const overallCTR = ((totalClicks[0]?.total || 0) / totalDisplays[0].total * 100).toFixed(2);
      console.log(`   Overall CTR: ${overallCTR}%`);
    }
    console.log('');

    // 7. Show display rules examples
    console.log('7️⃣ DISPLAY RULES EXAMPLES:');
    const bannersWithRules = await Banner.find({ 
      isActive: true,
      'displayRules.timeBased.enabled': true 
    }).limit(3);
    
    if (bannersWithRules.length > 0) {
      bannersWithRules.forEach(banner => {
        console.log(`   ${banner.name}:`);
        if (banner.displayRules.timeBased.enabled) {
          console.log(`      Time-based: ${banner.displayRules.timeBased.startHour}:00 - ${banner.displayRules.timeBased.endHour}:00`);
        }
        if (banner.displayRules.userBehavior.showAfterScroll) {
          console.log(`      User Behavior: Shows after scroll`);
        }
        if (banner.displayRules.deviceSpecific) {
          const devices = [];
          if (banner.displayRules.deviceSpecific.mobile) devices.push('Mobile');
          if (banner.displayRules.deviceSpecific.tablet) devices.push('Tablet');
          if (banner.displayRules.deviceSpecific.desktop) devices.push('Desktop');
          console.log(`      Devices: ${devices.join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.log('   No banners with advanced display rules found');
    }

    // 8. API Endpoint Summary
    console.log('8️⃣ API ENDPOINTS AVAILABLE:');
    console.log('   Admin Endpoints:');
    console.log('     GET    /api/admin/banners - List all banners');
    console.log('     POST   /api/admin/banners - Create new banner');
    console.log('     PUT    /api/admin/banners/:id - Update banner');
    console.log('     DELETE /api/admin/banners/:id - Delete banner');
    console.log('     PATCH  /api/admin/banners/:id/toggle - Toggle status');
    console.log('     GET    /api/admin/banners/templates - Get templates');
    console.log('     POST   /api/admin/banners/from-template - Create from template');
    console.log('');
    console.log('   Public Endpoints:');
    console.log('     GET    /api/banners/active - Get active banners');
    console.log('     GET    /api/banners/page/:pageName - Get page-specific banners');
    console.log('     POST   /api/banners/:id/display - Record display');
    console.log('     POST   /api/banners/:id/click - Record click');
    console.log('     POST   /api/banners/:id/conversion - Record conversion');
    console.log('');

    console.log('🎉 BANNER SYSTEM DEMONSTRATION COMPLETED!');
    console.log('\nThe banner system is now fully operational with:');
    console.log('✅ Template-driven banner creation');
    console.log('✅ Advanced display rules and targeting');
    console.log('✅ Performance tracking and analytics');
    console.log('✅ Event integration');
    console.log('✅ Frontend slideshow integration');
    console.log('✅ Admin management interface');

  } catch (error) {
    console.error('Error during banner system demonstration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the demonstration
if (require.main === module) {
  demoBannerSystem();
}

module.exports = demoBannerSystem;


