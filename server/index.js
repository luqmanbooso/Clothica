const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const loyaltyRoutes = require('./routes/loyalty');
const loyaltyMemberRoutes = require('./routes/loyaltyMember');
const promotionsRoutes = require('./routes/promotions');
const affiliateRoutes = require('./routes/affiliate');
const specialOffersRoutes = require('./routes/specialOffers');
const eventsRoutes = require('./routes/events');
const eventPerformanceRoutes = require('./routes/eventPerformance');
const bannerRoutes = require('./routes/banners');
const unifiedDiscountsRoutes = require('./routes/unifiedDiscounts');
const smartInventoryRoutes = require('./routes/smartInventory');
const inventoryRoutes = require('./routes/inventory');
const paymentRoutes = require('./routes/payments');
const cartRoutes = require('./routes/cart');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const issueRoutes = require('./routes/issues');
const couponRoutes = require('./routes/coupons');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debug middleware for request body (after parsers)
app.use((req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') && req.path.includes('/cart')) {
    console.log('🔍 Cart request debug:', {
      method: req.method,
      path: req.path,
      contentType: req.get('Content-Type'),
      body: req.body,
      bodyKeys: req.body ? Object.keys(req.body) : 'no body'
    });
  }
  next();
});

// Static files
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/loyalty-member', loyaltyMemberRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/special-offers', specialOffersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/event-performance', eventPerformanceRoutes);
app.use('/api/admin/banners', bannerRoutes);
app.use('/api/banners', bannerRoutes); // Public banner routes
app.use('/api/unified-discounts', unifiedDiscountsRoutes);
app.use('/api/smart-inventory', smartInventoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/coupons', couponRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Clothica API is running' });
});

// Email service test route
app.get('/api/email/status', (req, res) => {
  const emailService = require('./services/emailService');
  const status = emailService.getStatus();
  res.json(status);
});

app.post('/api/email/test', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const emailService = require('./services/emailService');
    const result = await emailService.testEmail(email);
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      result 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 