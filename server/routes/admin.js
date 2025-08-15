const express = require('express');
const { body, validationResult } = require('express-validator');
const { admin } = require('../middleware/admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');
const SpecialOffer = require('../models/SpecialOffer'); // Added for special offers
const Affiliate = require('../models/Affiliate'); // Added for affiliates
const Review = require('../models/Review'); // Added for reviews
const SpinWheel = require('../models/SpinWheel'); // Added for spin wheels
const Payment = require('../models/Payment'); // Added for payments
const UnifiedDiscount = require('../models/UnifiedDiscount'); // Added for unified discounts

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Apply admin middleware to all routes
// router.use(admin); // Temporarily disabled for development

// Dashboard Analytics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      monthlyRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenue,
        monthlyRevenue
      },
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Image Upload
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create the image URL (in production, this would be your CDN or cloud storage URL)
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Test endpoint (remove in production)
router.get('/test', (req, res) => {
  res.json({ message: 'Admin API is working!' });
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { _id: 'men', name: 'Men' },
      { _id: 'women', name: 'Women' },
      { _id: 'kids', name: 'Kids' },
      { _id: 'accessories', name: 'Accessories' },
      { _id: 'shoes', name: 'Shoes' },
      { _id: 'bags', name: 'Bags' }
    ];
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sample products for testing
router.get('/products', async (req, res) => {
  try {
    const sampleProducts = [
      {
        _id: '1',
        name: 'Premium Cotton T-Shirt',
        description: 'High-quality cotton t-shirt with modern fit',
        sku: 'TSH001',
        barcode: '123456789',
        price: 2500,
        originalPrice: 3500,
        costPrice: 1500,
        category: 'men',
        brand: 'Clothica',
        inventory: {
          totalStock: 45,
          lowStockThreshold: 10,
          criticalStockThreshold: 5,
          reorderPoint: 20
        },
        supplier: {
          name: 'Textile Corp',
          contact: 'John Doe',
          email: 'john@textilecorp.com',
          phone: '+1234567890'
        },
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
        isActive: true,
        isFeatured: true,
        rating: 4.5,
        numReviews: 12
      },
      {
        _id: '2',
        name: 'Slim Fit Jeans',
        description: 'Modern slim fit jeans with stretch denim',
        sku: 'JNS001',
        barcode: '123456790',
        price: 7999,
        originalPrice: 9999,
        costPrice: 4000,
        category: 'men',
        brand: 'Clothica',
        inventory: {
          totalStock: 8,
          lowStockThreshold: 10,
          criticalStockThreshold: 5,
          reorderPoint: 20
        },
        supplier: {
          name: 'Denim Ltd',
          contact: 'Jane Smith',
          email: 'jane@denimltd.com',
          phone: '+1234567891'
        },
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
        isActive: true,
        isFeatured: false,
        rating: 4.3,
        numReviews: 8
      },
      {
        _id: '3',
        name: 'Casual Sneakers',
        description: 'Comfortable casual sneakers for everyday wear',
        sku: 'SNK001',
        barcode: '123456791',
        price: 12000,
        originalPrice: 15000,
        costPrice: 7000,
        category: 'shoes',
        brand: 'Clothica',
        inventory: {
          totalStock: 0,
          lowStockThreshold: 10,
          criticalStockThreshold: 5,
          reorderPoint: 20
        },
        supplier: {
          name: 'Footwear Inc',
          contact: 'Mike Johnson',
          email: 'mike@footwearinc.com',
          phone: '+1234567892'
        },
        images: ['https://images.unsplash.com/photo-1549298916-b41d114d2c0d?w=500'],
        isActive: true,
        isFeatured: false,
        rating: 4.7,
        numReviews: 15
      }
    ];
    
    res.json({ products: sampleProducts, total: sampleProducts.length, totalPages: 1, currentPage: 1 });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product with full details
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name contact email')
      .populate('stockHistory.performedBy', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product
router.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    
    // Generate SKU if not provided
    if (!productData.sku) {
      productData.sku = await Product.generateSKU();
    }
    
    // Calculate total stock from variants
    if (productData.variants && productData.variants.length > 0) {
      productData.inventory.totalStock = productData.variants.reduce((total, variant) => {
        return total + (variant.stock || 0);
      }, 0);
    }
    
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'SKU or barcode already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const productData = req.body;
    
    // Calculate total stock from variants if variants are updated
    if (productData.variants && productData.variants.length > 0) {
      productData.inventory.totalStock = productData.variants.reduce((total, variant) => {
        return total + (variant.stock || 0);
      }, 0);
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stock history for a product
router.get('/products/:id/stock-history', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // For now, return sample stock history data
    // In a real implementation, you'd have a separate StockHistory model
    const stockHistory = [
      {
        type: 'restock',
        reason: 'Initial stock',
        quantity: product.inventory?.totalStock || 0,
        timestamp: product.createdAt,
        performedBy: 'System'
      }
    ];
    
    res.json(stockHistory);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk product actions
router.post('/products/bulk-action', async (req, res) => {
  try {
    const { productIds, action, data } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }
    
    let updateData = {};
    
    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        break;
      case 'deactivate':
        updateData = { isActive: false };
        break;
      case 'feature':
        updateData = { isFeatured: true };
        break;
      case 'unfeature':
        updateData = { isFeatured: false };
        break;
      case 'update-category':
        if (data && data.category) {
          updateData = { category: data.category };
        }
        break;
      case 'delete':
        // In a real app, you'd delete from database
        return res.json({ message: 'Bulk delete completed successfully' });
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
    
    // In a real app, you'd update the database
    // await Product.updateMany({ _id: { $in: productIds } }, updateData);
    
    res.json({ message: `Bulk ${action} completed successfully` });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stock management
router.post('/products/:id/stock', async (req, res) => {
  try {
    const { quantity, type, reason, reference } = req.body;
    const userId = req.user.id;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.updateStock(quantity, type, reason, reference, userId);
    
    res.json({
      message: 'Stock updated successfully',
      newStock: product.inventory.totalStock
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stock history
router.get('/products/:id/stock-history', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('stockHistory.performedBy', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product.stockHistory);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Inventory analytics
router.get('/inventory/analytics', async (req, res) => {
  try {
    const [
      totalProducts,
      outOfStock,
      lowStock,
      criticalStock,
      totalValue,
      lowStockValue
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ 'inventory.totalStock': 0 }),
      Product.countDocuments({
        $expr: { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] }
      }),
      Product.countDocuments({
        $expr: { $lte: ['$inventory.totalStock', '$inventory.criticalStockThreshold'] }
      }),
      Product.aggregate([
        { $match: { 'inventory.totalStock': { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$inventory.totalStock'] } } } }
      ]),
      Product.aggregate([
        {
          $match: {
            $expr: { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] }
          }
        },
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$inventory.totalStock'] } } } }
      ])
    ]);
    
    res.json({
      totalProducts,
      outOfStock,
      lowStock,
      criticalStock,
      totalValue: totalValue[0]?.total || 0,
      lowStockValue: lowStockValue[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory alerts
router.get('/inventory/alerts', async (req, res) => {
  try {
    const alerts = [
      {
        _id: '1',
        name: 'Slim Fit Jeans',
        sku: 'JNS001',
        currentStock: 8,
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        reorderPoint: 20,
        category: 'men',
        brand: 'Clothica'
      },
      {
        _id: '2',
        name: 'Casual Sneakers',
        sku: 'SNK001',
        currentStock: 0,
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        reorderPoint: 20,
        category: 'shoes',
        brand: 'Clothica'
      }
    ];
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Warehouse management
router.get('/warehouses', async (req, res) => {
  try {
    const warehouses = await Product.aggregate([
      { $unwind: '$locations' },
      {
        $group: {
          _id: '$locations.warehouse',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$locations.stock' },
          locations: { $addToSet: '$locations.location' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products by warehouse
router.get('/warehouses/:warehouse/products', async (req, res) => {
  try {
    const { warehouse } = req.params;
    
    const products = await Product.find({
      'locations.warehouse': warehouse
    }).select('name sku category brand locations');
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching warehouse products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Supplier management
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await Product.aggregate([
      { $match: { 'supplier.name': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$supplier.name',
          contact: { $first: '$supplier.contact' },
          email: { $first: '$supplier.email' },
          phone: { $first: '$supplier.phone' },
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$inventory.totalStock'] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CSV Import/Export
router.post('/products/import', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }
    
    // Parse CSV and create products
    // This is a simplified version - you'd want to use a proper CSV parser
    const csvContent = req.file.buffer.toString();
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    const products = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const productData = {};
        
        headers.forEach((header, index) => {
          productData[header.trim()] = values[index]?.trim();
        });
        
        products.push(productData);
      }
    }
    
    // Create products (you'd want to add validation here)
    const createdProducts = await Product.insertMany(products);
    
    res.json({
      message: 'Products imported successfully',
      count: createdProducts.length
    });
  } catch (error) {
    console.error('Error importing products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/products/export', async (req, res) => {
  try {
    const products = await Product.find().select('-__v -reviews -stockHistory');
    
    // Convert to CSV format
    const csvHeaders = Object.keys(products[0].toObject()).join(',');
    const csvRows = products.map(product => {
      return Object.values(product.toObject()).join(',');
    });
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Order Management
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { 
        status, 
        notes: notes || '',
        updatedAt: new Date(),
        lastUpdated: new Date()
      }, 
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Fulfill order (add shipping details)
router.post('/orders/:id/fulfill', async (req, res) => {
  try {
    const { trackingNumber, carrier, estimatedDelivery, notes, fulfilledAt } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        fulfillment: {
          trackingNumber,
          carrier,
          estimatedDelivery,
          notes,
          fulfilledAt: fulfilledAt || new Date()
        },
        status: 'shipped',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      message: 'Order fulfilled successfully',
      order
    });
  } catch (error) {
    console.error('Error fulfilling order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Payments Management
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('order', 'orderNumber total')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/payments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('order', 'orderNumber total')
     .populate('user', 'name email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Spin Wheels Management
router.get('/spin-wheels', async (req, res) => {
  try {
    const spinWheels = await SpinWheel.find().sort({ createdAt: -1 });
    res.json(spinWheels);
  } catch (error) {
    console.error('Spin wheels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/spin-wheels', async (req, res) => {
  try {
    const spinWheel = new SpinWheel(req.body);
    await spinWheel.save();
    res.status(201).json(spinWheel);
  } catch (error) {
    console.error('Create spin wheel error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.put('/spin-wheels/:id', async (req, res) => {
  try {
    const spinWheel = await SpinWheel.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!spinWheel) {
      return res.status(404).json({ message: 'Spin wheel not found' });
    }
    res.json(spinWheel);
  } catch (error) {
    console.error('Update spin wheel error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.delete('/spin-wheels/:id', async (req, res) => {
  try {
    const spinWheel = await SpinWheel.findByIdAndDelete(req.params.id);
    if (!spinWheel) {
      return res.status(404).json({ message: 'Spin wheel not found' });
    }
    res.json({ message: 'Spin wheel deleted successfully' });
  } catch (error) {
    console.error('Delete spin wheel error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Reviews Management
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name images')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/reviews/:id/status', async (req, res) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id, 
      { isApproved }, 
      { new: true }
    ).populate('user', 'name email')
     .populate('product', 'name images');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Affiliates Management
router.get('/affiliates', async (req, res) => {
  try {
    const affiliates = await Affiliate.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(affiliates);
  } catch (error) {
    console.error('Affiliates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/affiliates/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const affiliate = await Affiliate.findByIdAndUpdate(
      req.params.id, 
      { isActive }, 
      { new: true }
    ).populate('user', 'name email');
    
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }
    res.json(affiliate);
  } catch (error) {
    console.error('Update affiliate status error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Special Offers Management
router.get('/special-offers', async (req, res) => {
  try {
    const specialOffers = await SpecialOffer.find().sort({ createdAt: -1 });
    res.json(specialOffers);
  } catch (error) {
    console.error('Special offers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/special-offers', async (req, res) => {
  try {
    const specialOffer = new SpecialOffer(req.body);
    await specialOffer.save();
    res.status(201).json(specialOffer);
  } catch (error) {
    console.error('Create special offer error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.put('/special-offers/:id', async (req, res) => {
  try {
    const specialOffer = await SpecialOffer.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!specialOffer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }
    res.json(specialOffer);
  } catch (error) {
    console.error('Update special offer error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.delete('/special-offers/:id', async (req, res) => {
  try {
    const specialOffer = await SpecialOffer.findByIdAndDelete(req.params.id);
    if (!specialOffer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }
    res.json({ message: 'Special offer deleted successfully' });
  } catch (error) {
    console.error('Delete special offer error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Category Management
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isActive }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Bulk User Actions
router.post('/users/bulk-action', async (req, res) => {
  try {
    const { userIds, action } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Invalid user IDs' });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        message = 'Users activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        message = 'Users deactivated successfully';
        break;
      case 'delete':
        await User.deleteMany({ _id: { $in: userIds } });
        return res.json({ success: true, message: 'Users deleted successfully' });
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    res.json({ 
      success: true, 
      message: message,
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Bulk user action error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Coupon Management
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error('Coupons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.put('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Banner Management
router.get('/banners', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error('Banners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/banners', [
  body('title').trim().notEmpty().withMessage('Banner title is required'),
  body('image').trim().notEmpty().withMessage('Banner image is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add required fields that the Banner model expects
    const bannerData = {
      ...req.body,
      createdBy: req.user?._id || 'admin', // Required field
      name: req.body.title, // Map title to name if not provided
      status: req.body.status || 'draft',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    const banner = new Banner(bannerData);
    await banner.save();

    res.status(201).json(banner);
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.put('/banners/:id', async (req, res) => {
  try {
    // Map frontend fields to backend model fields
    const updateData = {
      ...req.body,
      name: req.body.title || req.body.name, // Map title to name if provided
      updatedAt: new Date()
    };

    const banner = await Banner.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json(banner);
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

router.delete('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Analytics endpoints
router.get('/analytics', async (req, res) => {
  try {
    const { range = 30, period = 'month' } = req.query;
    const days = parseInt(range);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get overview stats
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

    // Get revenue data
    const revenueData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } }
    ]);

    // Get order data
    const orderData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get user growth data
    const userData = await User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, users: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, orders: { $sum: 1 } } },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', category: '$product.category', revenue: 1, orders: 1 } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Get category performance
    const categoryPerformance = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: '$product.category', value: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $project: { name: '$_id', value: 1 } },
      { $sort: { value: -1 } }
    ]);

    // Get sales by status
    const salesByStatus = await Order.aggregate([
      { $group: { _id: '$status', revenue: { $sum: '$total' } } },
      { $project: { status: '$_id', revenue: 1 } },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenue,
        averageOrderValue,
        conversionRate: 0.05 // Placeholder
      },
      revenueData: revenueData.map(item => ({ date: item._id, revenue: item.revenue })),
      orderData: orderData.map(item => ({ date: item._id, orders: item.orders })),
      userData: userData.map(item => ({ date: item._id, users: item.users })),
      topProducts,
      categoryPerformance,
      salesByStatus
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Settings Management
router.get('/settings', async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();
    
    // Update settings with request body
    Object.assign(settings, req.body);
    settings.updatedBy = req.user._id;
    
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Monetization Dashboard
router.get('/monetization', async (req, res) => {
  try {
    const [
      totalRevenue,
      monthlyRevenue,
      affiliateEarnings,
      couponUsage,
      topProducts,
      revenueByCategory
    ] = await Promise.all([
      // Total revenue
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      // Monthly revenue for last 12 months
      Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'shipped'] },
            createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
          }
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Affiliate earnings
      User.aggregate([
        { $match: { 'affiliateCode': { $exists: true, $ne: null } } },
        { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
      ]),
      // Coupon usage
      Coupon.aggregate([
        { $group: { _id: null, total: { $sum: '$usedCount' } } }
      ]),
      // Top selling products
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]),
      // Revenue by category
      Order.aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        { $unwind: '$productInfo' },
        {
          $group: {
            _id: '$productInfo.category',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orders: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } }
      ])
    ]);

    const monetizationData = {
      overview: {
        totalRevenue: totalRevenue[0]?.total || 0,
        affiliateEarnings: affiliateEarnings[0]?.total || 0,
        couponUsage: couponUsage[0]?.total || 0
      },
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: item._id,
        revenue: item.revenue,
        orders: item.orders
      })),
      topProducts: topProducts.map(item => ({
        productId: item._id,
        totalSold: item.totalSold,
        revenue: item.revenue
      })),
      revenueByCategory: revenueByCategory.map(item => ({
        category: item._id,
        revenue: item.revenue,
        orders: item.orders
      }))
    };

    res.json(monetizationData);
  } catch (error) {
    console.error('Monetization error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Monetization Settings Endpoints
router.put('/monetization/offers', async (req, res) => {
  try {
    const { specialOffers, spinWheel, loyaltyProgram } = req.body;
    
    // Update special offers settings
    if (specialOffers) {
      // Update special offers configuration
      console.log('Updating special offers settings:', specialOffers);
    }
    
    // Update spin wheel settings
    if (spinWheel) {
      // Update spin wheel configuration
      console.log('Updating spin wheel settings:', spinWheel);
    }
    
    // Update loyalty program settings
    if (loyaltyProgram) {
      // Update loyalty program configuration
      console.log('Updating loyalty program settings:', loyaltyProgram);
    }
    
    res.json({ message: 'Monetization settings updated successfully' });
  } catch (error) {
    console.error('Error updating monetization settings:', error);
    res.status(500).json({ message: 'Error updating monetization settings' });
  }
});

router.post('/monetization/optimize', async (req, res) => {
  try {
    const { strategy, target, budget } = req.body;
    
    // Generate optimization recommendations
    const recommendations = [
      {
        type: 'pricing',
        title: 'Dynamic Pricing Strategy',
        description: 'Implement time-based pricing for better conversion',
        impact: 'High',
        effort: 'Medium'
      },
      {
        type: 'promotion',
        title: 'Bundle Deals',
        description: 'Create product bundles to increase average order value',
        impact: 'Medium',
        effort: 'Low'
      },
      {
        type: 'loyalty',
        title: 'Tiered Rewards',
        description: 'Implement customer tier system for better retention',
        impact: 'High',
        effort: 'High'
      }
    ];
    
    res.json({ 
      message: 'Optimization recommendations generated',
      recommendations,
      strategy,
      target,
      budget
    });
  } catch (error) {
    console.error('Error generating optimization recommendations:', error);
    res.status(500).json({ message: 'Error generating recommendations' });
  }
});

router.put('/monetization/spin-system', async (req, res) => {
  try {
    const { enabled, rewards, probability } = req.body;
    
    // Update spin wheel system settings
    console.log('Updating spin wheel system:', { enabled, rewards, probability });
    
    res.json({ message: 'Spin wheel system updated successfully' });
  } catch (error) {
    console.error('Error updating spin wheel system:', error);
    res.status(500).json({ message: 'Error updating spin wheel system' });
  }
});

// Invoice Generation
router.get('/orders/:id/invoice', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price sku images');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate PDF invoice (you can use libraries like puppeteer or jsPDF)
    // For now, return HTML that can be printed
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - Order #${order.orderNumber || order._id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f8f9fa; }
            .total { text-align: right; font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CLOTHICA</h1>
            <p>Premium Fashion & Lifestyle Store</p>
            <h2>INVOICE</h2>
          </div>
          
          <div class="invoice-details">
            <div>
              <h3>Bill To:</h3>
              <p>${order.user?.name || 'Customer'}</p>
              <p>${order.user?.email || 'No email'}</p>
              <p>${order.user?.phone || 'No phone'}</p>
            </div>
            <div>
              <h3>Invoice Details:</h3>
              <p><strong>Invoice #:</strong> ${order.orderNumber || order._id}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name || 'Product'}</td>
                  <td>${item.sku || 'N/A'}</td>
                  <td>${item.quantity}</td>
                                <td>$${((item.price || 0) || 0).toFixed(2)}</td>
              <td>$${(((item.price || 0) || 0) * ((item.quantity || 1) || 1)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p><strong>Subtotal:</strong> $${((order.subtotal || 0) || 0).toFixed(2)}</p>
            <p><strong>Tax:</strong> $${((order.tax || 0) || 0).toFixed(2)}</p>
            <p><strong>Shipping:</strong> $${((order.shippingCost || 0) || 0).toFixed(2)}</p>
            <p><strong>Total:</strong> $${((order.total || 0) || 0).toFixed(2)}</p>
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #666;">
            <p>Thank you for your purchase!</p>
            <p>For support, contact: support@clothica.com</p>
          </div>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHTML);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unified Discounts management
router.get('/unified-discounts', async (req, res) => {
  try {
    const discounts = await UnifiedDiscount.find().sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching unified discounts:', error);
    res.status(500).json({ message: 'Error fetching discounts' });
  }
});

router.post('/unified-discounts', async (req, res) => {
  try {
    const discount = new UnifiedDiscount({
      ...req.body,
      createdBy: req.user?._id || 'admin'
    });
    await discount.save();
    res.status(201).json(discount);
  } catch (error) {
    console.error('Error creating unified discount:', error);
    res.status(500).json({ message: 'Error creating discount' });
  }
});

router.put('/unified-discounts/:id', async (req, res) => {
  try {
    const discount = await UnifiedDiscount.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: req.user?._id || 'admin' },
      { new: true }
    );
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.json(discount);
  } catch (error) {
    console.error('Error updating unified discount:', error);
    res.status(500).json({ message: 'Error updating discount' });
  }
});

router.delete('/unified-discounts/:id', async (req, res) => {
  try {
    const discount = await UnifiedDiscount.findByIdAndDelete(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Error deleting unified discount:', error);
    res.status(500).json({ message: 'Error deleting discount' });
  }
});

// Smart Inventory Analytics
router.get('/smart-inventory/analytics/overview', async (req, res) => {
  try {
    const products = await Product.find();
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => 
      p.inventory?.stock <= (p.inventory?.lowStockThreshold || 10)
    ).length;
    const outOfStockProducts = products.filter(p => 
      (p.inventory?.stock || 0) === 0
    ).length;
    const totalValue = products.reduce((sum, p) => 
      sum + ((p.inventory?.stock || 0) * (p.price || 0)), 0
    );

    res.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue: totalValue.toFixed(2),
      restockNeeded: lowStockProducts + outOfStockProducts
    });
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ message: 'Error fetching inventory analytics' });
  }
});

module.exports = router;

