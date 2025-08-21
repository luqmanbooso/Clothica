const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createCustomerIntelligenceData = async () => {
  try {
    console.log('🚀 Creating Customer Intelligence Test Data...');

    // Get existing users and products
    const users = await User.find({}).limit(50);
    const products = await Product.find({}).limit(20);

    if (users.length === 0 || products.length === 0) {
      console.log('❌ No users or products found. Please create them first.');
      return;
    }

    console.log(`📊 Found ${users.length} users and ${products.length} products`);

    // Create realistic order patterns for customer intelligence
    const orders = [];
    const now = new Date();
    
    // Create orders over the last 90 days with realistic patterns
    for (let day = 90; day >= 0; day--) {
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - day);
      
      // More orders on weekends and evenings
      const dayOfWeek = orderDate.getDay();
      const hour = Math.floor(Math.random() * 24);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isEvening = hour >= 18 || hour <= 9;
      
      // Adjust order frequency based on day/time
      let dailyOrderCount = Math.floor(Math.random() * 8) + 2; // 2-10 orders per day
      if (isWeekend) dailyOrderCount = Math.floor(Math.random() * 15) + 5; // 5-20 on weekends
      if (isEvening) dailyOrderCount = Math.floor(Math.random() * 12) + 3; // 3-15 in evenings
      
      for (let i = 0; i < dailyOrderCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const orderTime = new Date(orderDate);
        orderTime.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
        
        // Create realistic order items
        const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
        const items = [];
        let subtotal = 0;
        
        for (let j = 0; j < itemCount; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
          const price = product.price || Math.floor(Math.random() * 2000) + 500; // 500-2500 price
          const itemTotal = price * quantity;
          
          items.push({
            product: product._id,
            name: product.name,
            price: price,
            quantity: quantity,
            total: itemTotal,
            category: product.category || 'clothing'
          });
          
          subtotal += itemTotal;
        }
        
        // Add shipping and calculate total
        const shipping = subtotal > 1500 ? 0 : 200; // Free shipping over 1500
        const total = subtotal + shipping;
        
        // Determine order status based on date
        let status = 'pending';
        const daysSinceOrder = 90 - day;
        if (daysSinceOrder > 7) status = 'delivered';
        else if (daysSinceOrder > 3) status = 'shipped';
        else if (daysSinceOrder > 1) status = 'processing';
        
        orders.push({
          user: user._id,
          items: items,
          subtotal: subtotal,
          shippingCost: shipping,
          total: total,
          status: status,
          createdAt: orderTime,
          updatedAt: orderTime,
          shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Test Country',
            phone: '+1234567890'
          },
          paymentMethod: 'credit_card',
          paymentStatus: 'paid'
        });
      }
    }

    console.log(`📦 Creating ${orders.length} orders...`);
    
    // Clear existing orders and insert new ones
    await Order.deleteMany({});
    const createdOrders = await Order.insertMany(orders);
    
    console.log(`✅ Created ${createdOrders.length} orders successfully`);

    // Update users with loyalty levels based on their order history
    console.log('👥 Updating user loyalty levels...');
    
    for (const user of users) {
      const userOrders = await Order.find({ user: user._id });
      const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = userOrders.length;
      
      // Determine loyalty level based on spending and order count
      let loyaltyLevel = 'Bronze';
      let points = 0;
      
      if (totalSpent >= 10000 && orderCount >= 5) {
        loyaltyLevel = 'Platinum';
        points = Math.floor(totalSpent / 10) + 500;
      } else if (totalSpent >= 5000 && orderCount >= 3) {
        loyaltyLevel = 'Gold';
        points = Math.floor(totalSpent / 10) + 250;
      } else if (totalSpent >= 2000 && orderCount >= 2) {
        loyaltyLevel = 'Silver';
        points = Math.floor(totalSpent / 10) + 100;
      } else if (totalSpent >= 500) {
        loyaltyLevel = 'Bronze';
        points = Math.floor(totalSpent / 10);
      }
      
      // Update user with loyalty information
      await User.findByIdAndUpdate(user._id, {
        loyaltyLevel: loyaltyLevel,
        loyaltyPoints: points,
        totalSpent: totalSpent,
        orderCount: orderCount,
        lastOrderDate: userOrders.length > 0 ? userOrders[userOrders.length - 1].createdAt : null
      });
    }
    
    console.log('✅ Updated user loyalty levels successfully');

    // Create some products with ratings for engagement analysis
    console.log('⭐ Adding product ratings and engagement data...');
    
    for (const product of products) {
      const productOrders = await Order.find({ 'items.product': product._id });
      const totalSold = productOrders.reduce((sum, order) => {
        const item = order.items.find(item => item.product.toString() === product._id.toString());
        return sum + (item ? item.quantity : 0);
      }, 0);
      
      // Generate realistic rating based on sales
      const baseRating = 4.0;
      const ratingVariation = (Math.random() - 0.5) * 0.8; // ±0.4 variation
      const rating = Math.max(1.0, Math.min(5.0, baseRating + ratingVariation));
      
      // Update product with engagement data
      await Product.findByIdAndUpdate(product._id, {
        rating: parseFloat(rating.toFixed(1)),
        totalSold: totalSold,
        viewCount: totalSold * (Math.floor(Math.random() * 5) + 3), // 3-8x views per sale
        lastUpdated: new Date()
      });
    }
    
    console.log('✅ Added product engagement data successfully');

    // Generate summary statistics
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastOrderDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    
    console.log('\n📊 Customer Intelligence Data Summary:');
    console.log(`   Total Orders: ${totalOrders}`);
    console.log(`   Total Revenue: Rs. ${totalRevenue[0]?.total || 0}`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Active Users (30 days): ${activeUsers}`);
    console.log(`   Average Order Value: Rs. ${totalOrders > 0 ? Math.round((totalRevenue[0]?.total || 0) / totalOrders) : 0}`);
    
    console.log('\n🎯 Customer Intelligence test data created successfully!');
    console.log('   You can now test the /api/admin/dashboard/customer-intelligence endpoint');
    
  } catch (error) {
    console.error('❌ Error creating customer intelligence data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createCustomerIntelligenceData();
