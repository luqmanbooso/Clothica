const mongoose = require('mongoose');
const Review = require('./models/Review');
const Issue = require('./models/Issue');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
require('dotenv').config();

async function createSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find some existing users, products, and orders
    const users = await User.find().limit(3);
    const products = await Product.find().limit(5);
    const orders = await Order.find().limit(3);

    if (users.length === 0 || products.length === 0 || orders.length === 0) {
      console.log('❌ Not enough existing data to create samples');
      console.log(`Users: ${users.length}, Products: ${products.length}, Orders: ${orders.length}`);
      return;
    }

    console.log('Creating sample reviews...');
    
    // Create sample reviews
    const sampleReviews = [
      {
        user: users[0]._id,
        order: orders[0]._id,
        product: products[0]._id,
        rating: {
          product: 5,
          delivery: 4,
          customerService: 5
        },
        review: {
          product: 'Excellent quality! The fabric is soft and the fit is perfect.',
          delivery: 'Fast delivery, arrived in 2 days.',
          customerService: 'Great customer service, very helpful.'
        },
        status: 'approved',
        isVerified: true
      },
      {
        user: users[1]._id,
        order: orders[1]._id,
        product: products[1]._id,
        rating: {
          product: 4,
          delivery: 3,
          customerService: 4
        },
        review: {
          product: 'Good product but could be better quality for the price.',
          delivery: 'Delivery was a bit slow.',
          customerService: 'Customer service was responsive.'
        },
        status: 'pending',
        isVerified: false
      },
      {
        user: users[2]._id,
        order: orders[2]._id,
        product: products[2]._id,
        rating: {
          product: 2,
          delivery: 2,
          customerService: 1
        },
        review: {
          product: 'Poor quality, not as described in the images.',
          delivery: 'Delivery was very late.',
          customerService: 'Customer service was unresponsive.'
        },
        status: 'rejected',
        isVerified: true
      }
    ];

    for (const reviewData of sampleReviews) {
      try {
        const existingReview = await Review.findOne({
          user: reviewData.user,
          order: reviewData.order,
          product: reviewData.product
        });
        
        if (!existingReview) {
          await Review.create(reviewData);
          console.log('✅ Created review for product:', products.find(p => p._id.equals(reviewData.product))?.name);
        }
      } catch (error) {
        console.log('⚠️ Review already exists or error:', error.message);
      }
    }

    console.log('Creating sample issues...');
    
    // Create sample issues
    const sampleIssues = [
      {
        user: users[0]._id,
        order: orders[0]._id,
        orderItem: products[0]._id,
        type: 'damaged',
        reason: 'Product arrived damaged',
        description: 'The shirt had a tear in the fabric when it arrived. The packaging seemed fine but the product was damaged.',
        status: 'pending',
        priority: 'high'
      },
      {
        user: users[1]._id,
        order: orders[1]._id,
        orderItem: products[1]._id,
        type: 'wrong_item',
        reason: 'Wrong item received',
        description: 'I ordered a blue shirt but received a red one. The size is also wrong.',
        status: 'under_review',
        priority: 'medium'
      },
      {
        user: users[2]._id,
        order: orders[2]._id,
        orderItem: products[2]._id,
        type: 'refund',
        reason: 'Not satisfied with quality',
        description: 'The product quality is not as expected. I would like to return it for a full refund.',
        status: 'approved',
        priority: 'low'
      }
    ];

    for (const issueData of sampleIssues) {
      try {
        const existingIssue = await Issue.findOne({
          user: issueData.user,
          order: issueData.order,
          orderItem: issueData.orderItem
        });
        
        if (!existingIssue) {
          await Issue.create(issueData);
          console.log('✅ Created issue for order:', orders.find(o => o._id.equals(issueData.order))?.orderNumber);
        }
      } catch (error) {
        console.log('⚠️ Issue already exists or error:', error.message);
      }
    }

    console.log('✅ Sample data creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createSampleData();
