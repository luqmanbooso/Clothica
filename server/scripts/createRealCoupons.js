const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
require('dotenv').config();

const createRealCoupons = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if coupons already exist
    const existingCoupons = await Coupon.countDocuments();
    if (existingCoupons > 0) {
      console.log(`✅ ${existingCoupons} coupons already exist in the database`);
      process.exit(0);
    }

    const realCoupons = [
      {
        code: 'WELCOME20',
        name: 'New Customer Welcome',
        description: '20% off your first order - welcome to Clothica Lanka!',
        type: 'percentage',
        value: 20,
        minOrderAmount: 5000, // Rs. 5,000
        maxDiscountAmount: 2000, // Rs. 2,000
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 1000,
        usedCount: 0,
        isFirstTimeOnly: true,
        applicableCategories: ['all']
      },
      {
        code: 'FREESHIP100',
        name: 'Free Islandwide Delivery',
        description: 'Free standard shipping on orders over Rs. 10,000',
        type: 'fixed',
        value: 500, // Rs. 500 shipping cost
        minOrderAmount: 10000, // Rs. 10,000
        maxDiscountAmount: 500, // Rs. 500
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 5000,
        usedCount: 0,
        isShippingOnly: true,
        applicableCategories: ['all']
      },
      {
        code: 'SUMMER30',
        name: 'Summer Collection Sale',
        description: '30% off all summer collection items',
        type: 'percentage',
        value: 30,
        minOrderAmount: 7500, // Rs. 7,500
        maxDiscountAmount: 3000, // Rs. 3,000
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
        usageLimit: 2000,
        usedCount: 0,
        applicableCategories: ['dresses', 't-shirts', 'shirts', 'sarongs']
      },
      {
        code: 'LOYALTY15',
        name: 'Loyalty Member Discount',
        description: '15% off for registered loyalty members',
        type: 'percentage',
        value: 15,
        minOrderAmount: 15000, // Rs. 15,000
        maxDiscountAmount: 3000, // Rs. 3,000
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 3000,
        usedCount: 0,
        isLoyaltyOnly: true,
        applicableCategories: ['all']
      },
      {
        code: 'FLASH25',
        name: 'Flash Sale',
        description: '25% off everything - limited time only!',
        type: 'percentage',
        value: 25,
        minOrderAmount: 8000, // Rs. 8,000
        maxDiscountAmount: 5000, // Rs. 5,000
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
        usageLimit: 1000,
        usedCount: 0,
        applicableCategories: ['all']
      },
      {
        code: 'BULK20',
        name: 'Bulk Purchase Discount',
        description: '20% off when you buy 3 or more items',
        type: 'percentage',
        value: 20,
        minOrderAmount: 20000, // Rs. 20,000
        maxDiscountAmount: 4000, // Rs. 4,000
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 1500,
        usedCount: 0,
        minItems: 3,
        applicableCategories: ['all']
      },
      {
        code: 'NEWSEASON',
        name: 'New Season Launch',
        description: 'Get Rs. 1,000 off new season arrivals',
        type: 'fixed',
        value: 1000, // Rs. 1,000
        minOrderAmount: 15000, // Rs. 15,000
        maxDiscountAmount: 1000, // Rs. 1,000
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
        usageLimit: 2000,
        usedCount: 0,
        applicableCategories: ['new-arrivals']
      },
      {
        code: 'WEEKEND',
        name: 'Weekend Special',
        description: '15% off all weekend orders',
        type: 'percentage',
        value: 15,
        minOrderAmount: 12000, // Rs. 12,000
        maxDiscountAmount: 3000, // Rs. 3,000
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 4000,
        usedCount: 0,
        applicableCategories: ['all']
      }
    ];

    // Insert real coupons
    await Coupon.insertMany(realCoupons);

    console.log('✅ Sri Lankan coupons created successfully!');
    console.log(`🎫 Created ${realCoupons.length} coupons for LKR pricing`);
    console.log('💡 All coupons feature realistic business logic for Sri Lankan market');
    console.log('🇱🇰 Ready for production e-commerce operations in Sri Lanka');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Sri Lankan coupons:', error);
    process.exit(1);
  }
};

createRealCoupons();

