const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Banner = require('../models/Banner');
const Event = require('../models/Event');
const User = require('../models/User');

const createSampleBanners = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating banners without createdBy...');
    }

    // Get sample events
    const events = await Event.find().limit(3);
    console.log(`Found ${events.length} events`);

    // Create sample banners with both image and text-only types
    const sampleBanners = [
      // Image-based banner
      {
        name: 'Summer Sale Banner',
        title: 'Summer Sale',
        subtitle: 'Up to 50% Off',
        description: 'Get ready for summer with amazing deals',
        bannerType: 'image',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        position: 'hero',
        priority: 1,
        cta: {
          text: 'Shop Now',
          link: '/shop',
          action: 'navigate',
          target: '_self'
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        displayRules: {
          showOnPages: ['home', 'shop'],
          targetAudience: ['all']
        },
        eventId: null, // Will be linked when events are created
        createdBy: adminUser?._id || '000000000000000000000000'
      },
      
      // Text-only banner
      {
        name: 'Flash Sale Alert',
        title: 'Flash Sale Alert',
        subtitle: 'Limited Time Only',
        description: 'Quick text-based announcement banner',
        bannerType: 'text',
        textContent: {
          mainText: '🔥 FLASH SALE! 🔥',
          subText: '24 Hours Only - Don\'t Miss Out!',
          backgroundColor: '#ff6b6b',
          textColor: '#ffffff',
          fontSize: '3xl',
          fontWeight: 'bold',
          textAlign: 'center'
        },
        position: 'top',
        priority: 2,
        cta: {
          text: 'Shop Now',
          link: '/flash-sale',
          action: 'navigate',
          target: '_self'
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        isActive: true,
        displayRules: {
          showOnPages: ['all'],
          targetAudience: ['all']
        },
        eventId: null, // Will be linked when events are created
        createdBy: adminUser?._id || '000000000000000000000000'
      },
      
      // Another text-only banner
      {
        name: 'New Collection Announcement',
        title: 'New Collection',
        subtitle: 'Spring 2024',
        description: 'Announcing our latest collection',
        bannerType: 'text',
        textContent: {
          mainText: 'New Collection Arriving Soon!',
          subText: 'Spring 2024 - Be the first to know',
          backgroundColor: '#4ecdc4',
          textColor: '#ffffff',
          fontSize: '2xl',
          fontWeight: 'semibold',
          textAlign: 'center'
        },
        position: 'middle',
        priority: 3,
        cta: {
          text: 'Get Notified',
          link: '/notify-me',
          action: 'modal',
          target: '_self'
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
        displayRules: {
          showOnPages: ['home', 'shop'],
          targetAudience: ['all']
        },
        eventId: null, // Will be linked when events are created
        createdBy: adminUser?._id || '000000000000000000000000'
      }
    ];

    // Clear existing banners
    await Banner.deleteMany({});
    console.log('Cleared existing banners');

    // Create new banners
    const createdBanners = [];
    for (const bannerData of sampleBanners) {
      const banner = new Banner({
        ...bannerData,
        createdBy: adminUser?._id || '000000000000000000000000' // Fallback ObjectId
      });
      
      const savedBanner = await banner.save();
      createdBanners.push(savedBanner);
      console.log(`Created banner: ${savedBanner.name}`);
    }

    console.log(`\n✅ Successfully created ${createdBanners.length} sample banners:`);
    createdBanners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.name} (${banner.position})`);
    });

    // Create some banner templates
    const templateBanners = [
      {
        name: 'Product Showcase Template',
        title: 'Product Showcase',
        subtitle: 'Template for showcasing products',
        description: 'A reusable template for product showcase banners',
        type: 'template',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
        position: 'hero',
        priority: 1,
        order: 0,
        eventId: null,
        isActive: true,
        startDate: new Date(),
        endDate: null,
        cta: {
          text: 'Learn More',
          link: '#',
          action: 'navigate',
          target: '_self',
          buttonStyle: {
            backgroundColor: '#6C7A59',
            textColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '12px 24px'
          }
        },
        displayRules: {
          showOnPages: ['all'],
          targetAudience: ['all'],
          userBehavior: {
            showAfterScroll: false,
            showOnExit: false,
            showOnReturn: false
          },
          timeBased: {
            enabled: false,
            startHour: 9,
            endHour: 21,
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
          },
          deviceSpecific: {
            mobile: true,
            tablet: true,
            desktop: true
          }
        },
        analytics: {
          displays: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          impressions: 0,
          uniqueViews: 0
        }
      }
    ];

    for (const templateData of templateBanners) {
      const template = new Banner({
        ...templateData,
        createdBy: adminUser?._id || '000000000000000000000000'
      });
      
      const savedTemplate = await template.save();
      console.log(`Created template: ${savedTemplate.name}`);
    }

    console.log('\n🎉 Sample banner data creation completed!');
    console.log('\nYou can now:');
    console.log('1. View banners in the admin panel');
    console.log('2. Test banner display on different pages');
    console.log('3. Track banner performance');
    console.log('4. Create new banners from templates');

  } catch (error) {
    console.error('Error creating sample banners:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  createSampleBanners();
}

module.exports = createSampleBanners;
