const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
require('dotenv').config();

const createSampleCoupons = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothica', {
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

    const sampleCoupons = [
      {
        code: 'WELCOME10',
        name: 'Welcome to Clothica!',
        description: '10% off your first order',
        type: 'percentage',
        value: 10,
        minOrderAmount: 1000,
        maxDiscountAmount: 2000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 1000,
        usedCount: 0,
        isFirstTimeOnly: true
      },
      {
        code: 'FREESHIP',
        name: 'Free Islandwide Delivery',
        description: 'Free delivery on orders above Rs. 5,000',
        type: 'fixed',
        value: 500,
        minOrderAmount: 5000,
        maxDiscountAmount: 500,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 5000,
        usedCount: 0,
        isShippingOnly: true
      },
      {
        code: 'BONUS500',
        name: 'Bonus Loyalty Points',
        description: '500 bonus points on signup',
        type: 'points',
        value: 500,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 1000,
        usedCount: 0,
        isSignupOnly: true
      },
      {
        code: 'SUMMER25',
        name: 'Summer Collection Sale',
        description: '25% off summer collection items',
        type: 'percentage',
        value: 25,
        minOrderAmount: 2000,
        maxDiscountAmount: 5000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
        usageLimit: 2000,
        usedCount: 0,
        applicableCategories: ['dresses', 't-shirts', 'sarongs']
      },
      {
        code: 'LOYALTY15',
        name: 'Loyalty Member Discount',
        description: '15% off for loyalty members',
        type: 'percentage',
        value: 15,
        minOrderAmount: 3000,
        maxDiscountAmount: 3000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 3000,
        usedCount: 0,
        isLoyaltyOnly: true
      },
      {
        code: 'NEWCUSTOMER',
        name: 'New Customer Special',
        description: 'Rs. 1000 off for new customers',
        type: 'fixed',
        value: 1000,
        minOrderAmount: 3000,
        maxDiscountAmount: 1000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        usageLimit: 2000,
        usedCount: 0,
        isNewCustomerOnly: true
      }
    ];

    // Insert sample coupons
    await Coupon.insertMany(sampleCoupons);

    console.log('✅ Sample coupons created successfully!');
    console.log(`🎫 Created ${sampleCoupons.length} coupons`);
    console.log('💡 You can now test the dynamic coupon system');
    console.log('🇱🇰 All coupons feature realistic Sri Lanka pricing and conditions');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample coupons:', error);
    process.exit(1);
  }
};

createSampleCoupons();

