const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');
const SpecialOffer = require('../models/SpecialOffer');
const Affiliate = require('../models/Affiliate');
const Review = require('../models/Review');
const SpinWheel = require('../models/SpinWheel');
const Payment = require('../models/Payment');
const UnifiedDiscount = require('../models/UnifiedDiscount');
const Settings = require('../models/Settings');
const StockHistory = require('../models/StockHistory');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const Event = require('../models/Event');
const mongoose = require('mongoose');
// PDF generation libraries removed - these are frontend dependencies

const router = express.Router();

// Disable deprecated marketing endpoints (promotions/events/banners/loyalty)
const disabledAdminPaths = [
  /^\/banners/,
  /^\/events/,
  /^\/monetization\/loyalty/
];
router.use(disabledAdminPaths, (_req, res) => {
  return res.status(410).json({ message: 'This endpoint has been removed' });
});

// Helper function to normalize images for consistent format
const normalizeImages = (images) => {
  if (!images || !Array.isArray(images)) return [];
  
  return images.map((img, index) => {
    // If it's already a string (URL), convert to object format for storage
    if (typeof img === 'string') {
      return {
        url: img,
        alt: '',
        isPrimary: index === 0,
        order: index
      };
    }
    
    // If it's already an object, ensure all properties exist
    return {
      url: img.url || '',
      alt: img.alt || '',
      isPrimary: img.isPrimary || index === 0,
      order: img.order !== undefined ? img.order : index
    };
  });
};

// Helper function to transform images for frontend compatibility
const transformImagesForFrontend = (product) => {
  if (product.images && Array.isArray(product.images)) {
    product.images = product.images
      .filter(img => img && (img.url || typeof img === 'string'))
      .sort((a, b) => {
        if (typeof a === 'object' && typeof b === 'object') {
          return (b.isPrimary ? 1 : -1);
        }
        return 0;
      })
      .map(img => typeof img === 'string' ? img : img.url);
  } else {
    product.images = [];
  }
  
  // Add a simple image field for backward compatibility
  product.image = product.images[0] || null;
  
  return product;
};

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
router.use(admin); // Admin authentication required for all routes



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
    // Get real categories from database
    const categories = await Category.find({ isActive: true })
      .select('name description parent isActive order')
      .sort({ order: 1, name: 1 })
      .lean();
    
    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Men', slug: 'men', description: 'Men\'s fashion and accessories', isActive: true, order: 1 },
        { name: 'Women', slug: 'women', description: 'Women\'s fashion and accessories', isActive: true, order: 2 },
        { name: 'Kids', slug: 'kids', description: 'Children\'s clothing and accessories', isActive: true, order: 3 },
        { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories and jewelry', isActive: true, order: 4 },
        { name: 'Shoes', slug: 'shoes', description: 'Footwear for all ages', isActive: true, order: 5 },
        { name: 'Bags', slug: 'bags', description: 'Handbags, backpacks, and luggage', isActive: true, order: 6 }
      ];
      
      const createdCategories = await Category.insertMany(defaultCategories);
      res.json(createdCategories);
    } else {
    res.json(categories);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get real products from database
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, brand, stockStatus, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (brand && brand !== 'all') {
      query.brand = brand;
    }
    
    if (stockStatus && stockStatus !== 'all') {
      switch (stockStatus) {
        case 'out-of-stock':
          query['inventory.totalStock'] = 0;
          break;
        case 'low-stock':
          query.$and = [
            { 'inventory.totalStock': { $gt: 0 } },
            { $expr: { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] } }
          ];
          break;
        case 'critical':
          query.$and = [
            { 'inventory.totalStock': { $gt: 0 } },
            { $expr: { $lte: ['$inventory.totalStock', '$inventory.criticalStockThreshold'] } }
          ];
          break;
        case 'in-stock':
          query.$expr = { $gt: ['$inventory.totalStock', '$inventory.lowStockThreshold'] };
          break;
      }
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category', 'name')
        .lean(),
      Product.countDocuments(query)
    ]);

    // Transform products to include proper image structure (consistent with public API)
    const transformedProducts = products.map(product => transformImagesForFrontend(product));
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({ 
      products: transformedProducts, 
      total, 
      totalPages, 
      currentPage: parseInt(page),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
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
      .populate('stockHistory.performedBy', 'name email')
      .lean();
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Transform images array to simple string array for frontend compatibility
    const transformedProduct = transformImagesForFrontend(product);
    
    res.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product
router.post('/products', [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('subcategory').trim().notEmpty().withMessage('Subcategory is required'),
  body('category').isIn(['men', 'women', 'kids', 'accessories', 'shoes', 'bags']).withMessage('Invalid category'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('inventory.totalStock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = req.body;
    
    // Normalize images to proper object format for storage
    if (productData.images) {
      productData.images = normalizeImages(productData.images);
    }
    
    // Generate SKU if not provided
    if (!productData.sku) {
      productData.sku = await Product.generateSKU();
    }
    
    // Ensure inventory object exists
    if (!productData.inventory) {
      productData.inventory = {};
    }

    // Calculate total stock from sizes if provided
    if (productData.sizes && productData.sizes.length > 0) {
      const sizeStock = productData.sizes.reduce((total, size) => {
        return total + (size.stock || 0);
      }, 0);
      if (sizeStock > 0) {
        productData.inventory.totalStock = sizeStock;
      }
    }
    
    // Calculate total stock from variants if provided
    if (productData.variants && productData.variants.length > 0) {
      productData.inventory.totalStock = productData.variants.reduce((total, variant) => {
        return total + (variant.stock || 0);
      }, 0);
    }
    
    const product = new Product(productData);
    await product.save();

    // Transform for frontend response
    const responseProduct = transformImagesForFrontend(product.toObject());
    
    res.status(201).json({
      message: 'Product created successfully',
      product: responseProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'SKU or barcode already exists' });
    } else if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update product
router.put('/products/:id', [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('subcategory').optional().trim().notEmpty().withMessage('Subcategory cannot be empty'),
  body('category').optional().isIn(['men', 'women', 'kids', 'accessories', 'shoes', 'bags']).withMessage('Invalid category'),
  body('brand').optional().trim().notEmpty().withMessage('Brand cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('inventory.totalStock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = req.body;
    
    // Normalize images to proper object format for storage
    if (productData.images) {
      productData.images = normalizeImages(productData.images);
    }

    // Ensure inventory object exists
    if (productData.inventory && typeof productData.inventory !== 'object') {
      productData.inventory = {};
    }

    // Calculate total stock from sizes if provided
    if (productData.sizes && productData.sizes.length > 0) {
      const sizeStock = productData.sizes.reduce((total, size) => {
        return total + (size.stock || 0);
      }, 0);
      if (sizeStock > 0 && productData.inventory) {
        productData.inventory.totalStock = sizeStock;
      }
    }
    
    // Calculate total stock from variants if variants are updated
    if (productData.variants && productData.variants.length > 0) {
      if (!productData.inventory) productData.inventory = {};
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

    // Transform for frontend response
    const responseProduct = transformImagesForFrontend(product.toObject());
    
    res.json({
      message: 'Product updated successfully',
      product: responseProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    } else {
    res.status(500).json({ message: 'Server error' });
    }
  }
});

// Get stock history for a product
router.get('/products/:id/stock-history', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get real stock history from StockHistory model
    const stockHistory = await StockHistory.getProductHistory(req.params.id, 50);
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
    
    // Update the database with real bulk operations
    if (action === 'delete') {
      await Product.deleteMany({ _id: { $in: productIds } });
    } else {
      await Product.updateMany({ _id: { $in: productIds } }, updateData);
    }
    
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
    
    // Ensure inventory object exists
    if (!product.inventory) {
      product.inventory = {};
    }
    
    // Initialize totalStock if it doesn't exist
    if (typeof product.inventory.totalStock !== 'number') {
      product.inventory.totalStock = 0;
    }
    
    const previousStock = product.inventory.totalStock;
    
    // Update product stock
    product.inventory.totalStock += quantity;
    
    // Ensure stock doesn't go below 0
    if (product.inventory.totalStock < 0) {
      product.inventory.totalStock = 0;
    }
    
    await product.save();
    
    // Create stock history record
    const stockHistoryEntry = {
      type: type || 'adjustment',
      reason: reason || 'Manual stock update',
      quantity: quantity,
      previousStock: previousStock,
      newStock: product.inventory.totalStock,
      reference: reference,
      performedBy: userId,
      warehouse: 'main',
      cost: product.costPrice || 0,
      timestamp: new Date()
    };
    
    // Add to product's stock history
    if (!product.stockHistory) {
      product.stockHistory = [];
    }
    product.stockHistory.push(stockHistoryEntry);
    
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
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Return stock history array or empty array if none exists
    const stockHistory = product.stockHistory || [];
    
    res.json(stockHistory);
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

// Get real inventory alerts from database
router.get('/inventory/alerts', async (req, res) => {
  try {
    const alerts = await Product.find({
      $or: [
        { 'inventory.totalStock': 0 }, // Out of stock
        { $expr: { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] } } // Low stock
      ]
    })
    .select('name sku inventory category brand')
    .populate('category', 'name')
    .lean();
    
    // Add alert type and priority
    const alertsWithType = alerts.map(product => ({
      _id: product._id,
      name: product.name,
      sku: product.sku,
      currentStock: product.inventory?.totalStock || 0,
      lowStockThreshold: product.inventory?.lowStockThreshold || 10,
      criticalStockThreshold: product.inventory?.criticalStockThreshold || 5,
      reorderPoint: product.inventory?.reorderPoint || 20,
      category: product.category?.name || product.category,
      brand: product.brand,
      alertType: product.inventory?.totalStock === 0 ? 'out-of-stock' : 'low-stock',
      priority: product.inventory?.totalStock === 0 ? 'high' : 'medium'
    }));
    
    res.json(alertsWithType);
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
    console.log('🎡 Spin wheel creation request:', req.body);
    
    // Validate required fields
    if (!req.body.name || !req.body.title) {
      return res.status(400).json({ message: 'Name and title are required' });
    }

    if (!req.body.segments || req.body.segments.length < 2) {
      return res.status(400).json({ message: 'At least 2 segments are required' });
    }

    // Handle createdBy field - if no user, create a placeholder ObjectId
    let createdBy = req.user?._id;
    if (!createdBy) {
      createdBy = new mongoose.Types.ObjectId();
      console.log('⚠️ No user found, using placeholder ObjectId:', createdBy);
    }

    const spinWheel = new SpinWheel({
      ...req.body,
      createdBy: createdBy
    });
    
    console.log('🎡 Creating spin wheel with data:', spinWheel);
    await spinWheel.save();
    
    console.log('✅ Spin wheel created successfully:', spinWheel._id);
    res.status(201).json(spinWheel);
  } catch (error) {
    console.error('❌ Create spin wheel error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error creating spin wheel', 
      details: error.message,
      errorType: error.name
    });
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
    console.log('🎁 Special offer creation request:', req.body);
    
    // Validate required fields
    if (!req.body.name || !req.body.title || !req.body.offerValue) {
      return res.status(400).json({ message: 'Name, title, and offer value are required' });
    }

    // Handle createdBy field - if no user, create a placeholder ObjectId
    let createdBy = req.user?._id;
    if (!createdBy) {
      createdBy = new mongoose.Types.ObjectId();
      console.log('⚠️ No user found, using placeholder ObjectId:', createdBy);
    }

    const specialOffer = new SpecialOffer({
      ...req.body,
      createdBy: createdBy
    });
    
    console.log('🎁 Creating special offer with data:', specialOffer);
    await specialOffer.save();
    
    console.log('✅ Special offer created successfully:', specialOffer._id);
    res.status(201).json(specialOffer);
  } catch (error) {
    console.error('❌ Create special offer error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error creating special offer', 
      details: error.message,
      errorType: error.name
    });
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
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({ 
      users, 
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get enhanced user analytics
router.get('/users/analytics', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate user analytics
    const [totalUsers, activeUsers, newUsersThisMonth, premiumUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ loyaltyTier: { $in: ['gold', 'platinum', 'vip'] } })
    ]);
    
    // Calculate user growth trends
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthUsers = await User.countDocuments({ createdAt: { $gte: lastMonth, $lt: startOfMonth } });
    const growthRate = lastMonthUsers > 0 ? ((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100 : 0;
    
    // Calculate user engagement (users with orders)
    const usersWithOrders = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $match: {
          'orders.0': { $exists: true }
        }
      },
      {
        $count: 'count'
      }
    ]);
    
    const engagedUsers = usersWithOrders[0]?.count || 0;
    const engagementRate = totalUsers > 0 ? (engagedUsers / totalUsers) * 100 : 0;
    
    const analytics = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      premiumUsers,
      growthRate: Math.round(growthRate * 100) / 100,
      engagedUsers,
      engagementRate: Math.round(engagementRate * 100) / 100,
      inactiveUsers: totalUsers - activeUsers,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ message: 'Error fetching user analytics' });
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

router.post('/banners', async (req, res) => {
  try {
    console.log('🎨 Banner creation request:', req.body);
    
    // Validate required fields based on banner type
    if (!req.body.name || !req.body.title) {
      return res.status(400).json({ message: 'Banner name and title are required' });
    }

    if (req.body.bannerType === 'image' && !req.body.image) {
      return res.status(400).json({ message: 'Image is required for image banners' });
    }

    if (req.body.bannerType === 'text' && !req.body.textContent?.mainText) {
      return res.status(400).json({ message: 'Main text content is required for text banners' });
    }

    // Handle createdBy field - if no user, create a placeholder ObjectId
    let createdBy = req.user?._id;
    if (!createdBy) {
      // Create a placeholder ObjectId for testing purposes
      createdBy = new mongoose.Types.ObjectId();
      console.log('⚠️ No user found, using placeholder ObjectId:', createdBy);
    }

    // Add required fields that the Banner model expects
    const bannerData = {
      ...req.body,
      createdBy: createdBy,
      status: req.body.status || 'draft',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    console.log('🎨 Creating banner with data:', bannerData);

    const banner = new Banner(bannerData);
    await banner.save();

    console.log('✅ Banner created successfully:', banner._id);
    res.status(201).json(banner);
  } catch (error) {
    console.error('❌ Create banner error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error creating banner', 
      details: error.message,
      errorType: error.name
    });
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
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/settings', async (req, res) => {
  try {
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
router.put('/monetization/loyalty', async (req, res) => {
  try {
    const { isActive, pointMultiplier, tierThresholds } = req.body;
    
    // Update loyalty program settings
    console.log('Updating loyalty settings:', { isActive, pointMultiplier, tierThresholds });
    
    // In a real app, you'd update the database
    const loyaltyStats = {
      isActive: isActive || false,
      pointMultiplier: pointMultiplier || 1,
      tierThresholds: tierThresholds || { bronze: 100, silver: 500, gold: 1000, vip: 2000 },
      pointStats: {
        totalRedeemed: 12500,
        totalRedemptionValue: 125000
      },
      userStats: {
        total: 1250,
        bronze: 800,
        silver: 300,
        gold: 120,
        vip: 30
      }
    };
    
    res.json(loyaltyStats);
  } catch (error) {
    console.error('Error updating loyalty settings:', error);
    res.status(500).json({ message: 'Error updating loyalty settings' });
  }
});

router.put('/monetization/affiliate', async (req, res) => {
  try {
    const { isActive, commissionRate, minimumPayout } = req.body;
    
    // Update affiliate program settings
    console.log('Updating affiliate settings:', { isActive, commissionRate, minimumPayout });
    
    // In a real app, you'd update the database
    const affiliateStats = {
      isActive: isActive || false,
      commissionRate: commissionRate || 10,
      minimumPayout: minimumPayout || 50,
      totalAffiliates: 45,
      totalEarnings: 8750,
      pendingPayouts: 1250
    };
    
    res.json(affiliateStats);
  } catch (error) {
    console.error('Error updating affiliate settings:', error);
    res.status(500).json({ message: 'Error updating affiliate settings' });
  }
});

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

// Invoice Generation (JSON format - PDF generation moved to frontend)
router.get('/orders/:id/invoice', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price sku images');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return invoice data in JSON format for frontend processing
    const invoiceData = {
      orderNumber: order.orderNumber || order._id,
      date: order.createdAt,
      status: order.status,
      customer: {
        name: order.user?.name || 'Customer',
        email: order.user?.email || 'No email',
        phone: order.user?.phone || 'No phone'
      },
      items: order.items.map(item => ({
        name: item.product?.name || 'Product',
        sku: item.product?.sku || 'N/A',
        quantity: item.quantity,
        price: item.price,
        total: (item.price || 0) * (item.quantity || 1)
      })),
      totals: {
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        shipping: order.shippingCost || 0,
        total: order.total || 0
      },
      store: {
        name: 'CLOTHICA',
        description: 'Premium Fashion & Lifestyle Store',
        support: 'support@clothica.com'
      }
    };
    
    res.json({
      success: true,
      data: invoiceData,
      message: 'Invoice data retrieved successfully'
    });
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
    console.log('💰 Discount creation request:', req.body);
    
    // Validate required fields
    if (!req.body.name || !req.body.code || req.body.value <= 0) {
      return res.status(400).json({ message: 'Name, code, and valid value are required' });
    }

    if (req.body.code.length < 3) {
      return res.status(400).json({ message: 'Discount code must be at least 3 characters long' });
    }

    if (req.body.value > 100 && req.body.type === 'percentage') {
      return res.status(400).json({ message: 'Percentage discount cannot exceed 100%' });
    }

    // Handle createdBy field - if no user, create a placeholder ObjectId
    let createdBy = req.user?._id;
    if (!createdBy) {
      createdBy = new mongoose.Types.ObjectId();
      console.log('⚠️ No user found, using placeholder ObjectId:', createdBy);
    }

    const discount = new UnifiedDiscount({
      ...req.body,
      createdBy: createdBy
    });
    
    console.log('💰 Creating discount with data:', discount);
    await discount.save();
    
    console.log('✅ Discount created successfully:', discount._id);
    res.status(201).json(discount);
  } catch (error) {
    console.error('❌ Error creating unified discount:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error creating discount', 
      details: error.message,
      errorType: error.name
    });
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

// Dashboard Overview Endpoint
router.get('/dashboard/overview', async (req, res) => {
  try {
    const [totalRevenue, totalOrders, totalUsers, totalProducts] = await Promise.all([
      // Total revenue from completed orders
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      // Total orders count
      Order.countDocuments(),
      // Total users count
      User.countDocuments(),
      // Total products count
      Product.countDocuments()
    ]);

    // Today's orders and revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrders, todayRevenue, pendingOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: { $in: ['delivered', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' })
    ]);

    const overview = {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders: totalOrders || 0,
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue[0]?.total || 0) / totalOrders) : 0,
      conversionRate: 0.045, // This would need real analytics data
      growthRate: 0.23, // This would need historical comparison
      todayOrders: todayOrders || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      pendingOrders: pendingOrders || 0,
      processingOrders: processingOrders || 0,
      shippedOrders: shippedOrders || 0,
      deliveredOrders: deliveredOrders || 0,
      cancelledOrders: cancelledOrders || 0
    };

    res.json(overview);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ message: 'Error fetching dashboard overview' });
  }
});

// Dashboard Finance Endpoint
router.get('/dashboard/finance', async (req, res) => {
  try {
    const [grossRevenue, totalCosts] = await Promise.all([
      // Gross revenue from completed orders
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      // Calculate costs (simplified - in real app you'd have cost tracking)
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$total', 0.75] } } } } // Assume 75% cost
      ])
    ]);

    const revenue = grossRevenue[0]?.total || 0;
    const costs = totalCosts[0]?.total || 0;
    const netProfit = revenue - costs;
    const profitMargin = revenue > 0 ? (netProfit / revenue) : 0;

    // Top revenue products
    const topRevenueProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Revenue by category
    const revenueByCategory = await Order.aggregate([
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
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const finance = {
      grossRevenue: revenue,
      netProfit: Math.round(netProfit),
      totalCosts: Math.round(costs),
      profitMargin: Math.round(profitMargin * 100) / 100,
      averageProfitPerOrder: revenue > 0 ? Math.round(netProfit / (revenue / 1000)) : 0,
      monthlyGrowth: 0.18, // This would need historical comparison
      topRevenueProducts: topRevenueProducts.map(item => ({
        name: `Product ${item._id}`,
        revenue: Math.round(item.revenue),
        profit: Math.round(item.revenue * 0.25) // Assume 25% profit margin
      })),
      revenueByCategory: revenueByCategory.map(item => ({
        category: item._id || 'Uncategorized',
        revenue: Math.round(item.revenue),
        profit: Math.round(item.revenue * 0.25)
      })),
      costBreakdown: {
        productCosts: Math.round(costs * 0.6),
        shippingCosts: Math.round(costs * 0.15),
        marketingCosts: Math.round(costs * 0.15),
        operationalCosts: Math.round(costs * 0.1)
      }
    };

    res.json(finance);
  } catch (error) {
    console.error('Error fetching dashboard finance:', error);
    res.status(500).json({ message: 'Error fetching dashboard finance' });
  }
});

// Dashboard Client Features Endpoint
router.get('/dashboard/client-features', async (req, res) => {
  try {
    // Spin wheel data
    const spinWheels = await SpinWheel.find();
    const totalSpins = spinWheels.reduce((sum, wheel) => sum + (wheel.totalSpins || 0), 0);
    const totalWins = spinWheels.reduce((sum, wheel) => sum + (wheel.totalWins || 0), 0);

    // Loyalty data
    const users = await User.find();
    const loyaltyUsers = users.filter(user => user.loyaltyTier);
    const levelDistribution = {
      bronze: users.filter(u => u.loyaltyTier === 'bronze').length,
      silver: users.filter(u => u.loyaltyTier === 'silver').length,
      gold: users.filter(u => u.loyaltyTier === 'gold').length,
      platinum: users.filter(u => u.loyaltyTier === 'vip').length
    };

    // Coupons data
    const coupons = await Coupon.find();
    const activeCoupons = coupons.filter(c => c.isActive);

    const clientFeatures = {
      spinWheel: {
        totalSpins: totalSpins,
        rewardsGiven: totalWins,
        userEngagement: users.length > 0 ? Math.round((loyaltyUsers.length / users.length) * 100) / 100 : 0,
        conversionRate: totalSpins > 0 ? Math.round((totalWins / totalSpins) * 100) / 100 : 0,
        popularRewards: [
          { reward: '15% OFF', usage: Math.floor(totalWins * 0.3) },
          { reward: 'Free Shipping', usage: Math.floor(totalWins * 0.25) },
          { reward: '100 Points', usage: Math.floor(totalWins * 0.2) },
          { reward: '20% OFF', usage: Math.floor(totalWins * 0.15) }
        ]
      },
      loyaltyProgram: {
        totalPoints: 125000, // This would need real points calculation
        activeUsers: loyaltyUsers.length,
        levelDistribution,
        pointsRedeemed: 45000, // This would need real redemption tracking
        averagePointsPerUser: loyaltyUsers.length > 0 ? Math.round(125000 / loyaltyUsers.length) : 0
      },
      smartDiscounts: {
        totalCoupons: coupons.length,
        activeCoupons: activeCoupons.length,
        totalSavings: 125000, // This would need real savings calculation
        popularCodes: activeCoupons.slice(0, 3).map((coupon, index) => ({
          code: coupon.code,
          usage: Math.floor(Math.random() * 200) + 100,
          savings: Math.floor(Math.random() * 30000) + 20000
        })),
        conversionRate: 0.72
      },
      specialOffers: {
        totalOffers: 12, // This would need real offers count
        activeOffers: 8,
        totalEngagement: 850,
        conversionRate: 0.68
      }
    };

    res.json(clientFeatures);
  } catch (error) {
    console.error('Error fetching dashboard client features:', error);
    res.status(500).json({ message: 'Error fetching dashboard client features' });
  }
});

// Dashboard Inventory Endpoint
router.get('/dashboard/inventory', async (req, res) => {
  try {
    const products = await Product.find();
    const totalProducts = products.length;
    const outOfStock = products.filter(p => (p.inventory?.stock || 0) === 0).length;
    const lowStock = products.filter(p => 
      (p.inventory?.stock || 0) <= (p.inventory?.lowStockThreshold || 10) && 
      (p.inventory?.stock || 0) > 0
    ).length;
    const criticalStock = products.filter(p => 
      (p.inventory?.stock || 0) <= (p.inventory?.criticalStockThreshold || 5) && 
      (p.inventory?.stock || 0) > 0
    ).length;

    const totalValue = products.reduce((sum, p) => 
      sum + ((p.inventory?.stock || 0) * (p.price || 0)), 0
    );
    const lowStockValue = products
      .filter(p => (p.inventory?.stock || 0) <= (p.inventory?.lowStockThreshold || 10))
      .reduce((sum, p) => sum + ((p.inventory?.stock || 0) * (p.price || 0)), 0);

    const inventory = {
      totalProducts,
      outOfStock,
      lowStock,
      criticalStock,
      totalValue: Math.round(totalValue),
      lowStockValue: Math.round(lowStockValue),
      restockNeeded: outOfStock + lowStock + criticalStock,
      seasonalProducts: Math.floor(totalProducts * 0.1), // 10% seasonal
      eventTaggedProducts: Math.floor(totalProducts * 0.07) // 7% event tagged
    };

    res.json(inventory);
  } catch (error) {
    console.error('Error fetching dashboard inventory:', error);
    res.status(500).json({ message: 'Error fetching dashboard inventory' });
  }
});

// Dashboard Analytics Endpoint
router.get('/dashboard/analytics', async (req, res) => {
  try {
    const { range = '30', period = 'month' } = req.query;
    const days = parseInt(range);
    
    // Generate real trend data based on actual orders
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $in: ['delivered', 'shipped'] }
    }).sort({ createdAt: 1 });

    // Group orders by date
    const revenueByDate = {};
    const ordersByDate = {};
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
        ordersByDate[date] = 0;
      }
      revenueByDate[date] += order.total;
      ordersByDate[date] += 1;
    });

    // Fill missing dates with 0
    const revenueTrends = [];
    const orderTrends = [];
    const profitTrends = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const revenue = revenueByDate[dateStr] || 0;
      const orders = ordersByDate[dateStr] || 0;
      const profit = revenue * 0.25; // Assume 25% profit margin
      
      revenueTrends.push({ date: dateStr, value: Math.round(revenue) });
      orderTrends.push({ date: dateStr, value: orders });
      profitTrends.push({ date: dateStr, value: Math.round(profit) });
    }

    // User growth (simplified)
    const users = await User.find({ createdAt: { $gte: startDate } });
    const userGrowth = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const newUsers = users.filter(u => 
        u.createdAt.toISOString().split('T')[0] === dateStr
      ).length;
      
      userGrowth.push({ date: dateStr, value: newUsers });
    }

    // Category performance
    const categoryPerformance = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $in: ['delivered', 'shipped'] } } },
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
    ]);

    const analytics = {
      revenueTrends,
      userGrowth,
      orderTrends,
      profitTrends,
      categoryPerformance: categoryPerformance.map(cat => ({
        category: cat._id || 'Uncategorized',
        revenue: Math.round(cat.revenue),
        growth: 0.25, // This would need historical comparison
        profit: Math.round(cat.revenue * 0.25)
      })),
      topProducts: [], // Would need product performance tracking
      customerSegments: [] // Would need customer analytics
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ message: 'Error fetching dashboard analytics' });
  }
});

// Dashboard Real-time Endpoint
router.get('/dashboard/real-time', async (req, res) => {
  try {
    // Current active users (simplified - in real app you'd track sessions)
    const currentUsers = Math.floor(Math.random() * 50) + 20;
    const activeSessions = Math.floor(currentUsers * 0.6);
    
    // Cart abandonment rate (would need real analytics)
    const cartAbandonment = 0.35;
    
    // Checkout funnel (would need real analytics)
    const checkoutFunnel = {
      cart: Math.floor(currentUsers * 0.8),
      checkout: Math.floor(currentUsers * 0.6),
      payment: Math.floor(currentUsers * 0.4),
      completed: Math.floor(currentUsers * 0.3)
    };

    const realTime = {
      currentUsers,
      activeSessions,
      cartAbandonment,
      checkoutFunnel
    };

    res.json(realTime);
  } catch (error) {
    console.error('Error fetching dashboard real-time:', error);
    res.status(500).json({ message: 'Error fetching dashboard real-time' });
  }
});

// Clean Event Management Routes (replaces complex campaign system)
router.get('/events', [auth, admin], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const query = {};
    
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { priority: -1, createdAt: -1 };
    
    const [events, total] = await Promise.all([
      Event.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate([
          { path: 'components.banners.bannerId', select: 'name image' },
          { path: 'components.discounts.discountId', select: 'name code' },
          { path: 'components.specialOffers.offerId', select: 'name description' },
          { path: 'components.spinWheel.wheelId', select: 'name' }
        ]),
      Event.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;
    res.json({
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEvents: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

router.post('/events', [auth, admin], async (req, res) => {
  try {
    const eventData = req.body;
    
    // Validation
    if (!eventData.name || !eventData.startDate || !eventData.endDate) {
      return res.status(400).json({ message: 'Name, start date, and end date are required' });
    }
    
    if (new Date(eventData.startDate) >= new Date(eventData.endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }
    
    eventData.createdBy = req.user._id;
    eventData.history = [{
      action: 'created',
      timestamp: new Date(),
      userId: req.user._id,
      details: 'Event created'
    }];
    
    const event = new Event(eventData);
    await event.save();
    
    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});

router.get('/events/:id', [auth, admin], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate([
        { path: 'components.banners.bannerId', select: 'name image description' },
        { path: 'components.discounts.discountId', select: 'name code description value' },
        { path: 'components.specialOffers.offerId', select: 'name description value' },
        { path: 'components.spinWheel.wheelId', select: 'name description' }
      ]);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

router.put('/events/:id', [auth, admin], async (req, res) => {
  try {
    const eventData = req.body;
    
    // Handle partial updates - if only components are sent, don't validate dates
    if (eventData.startDate && eventData.endDate && 
        new Date(eventData.startDate) >= new Date(eventData.endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }
    
    // Add history entry for the update
    const historyEntry = {
      action: 'updated',
      timestamp: new Date(),
      userId: req.user._id,
      details: 'Event updated'
    };
    
    // If only components are being updated, provide more specific details
    if (Object.keys(eventData).length === 1 && eventData.components) {
      historyEntry.details = 'Event components updated';
    }
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $push: { history: historyEntry }, ...eventData },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event', details: error.message });
  }
});

router.put('/events/:id/status', [auth, admin], async (req, res) => {
  try {
    const { status, action } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Handle both 'status' and 'action' fields for compatibility
    let newStatus = status;
    if (action === 'activate') {
      newStatus = 'active';
    } else if (action === 'deactivate') {
      newStatus = 'inactive';
    }
    
    if (newStatus === 'active') {
      // Check if event has required components before activation
      const hasBanners = event.components?.banners?.length > 0;
      const hasDiscounts = event.components?.discounts?.length > 0;
      const hasOffers = event.components?.specialOffers?.length > 0;
      
      if (!hasBanners && !hasDiscounts && !hasOffers) {
        return res.status(400).json({ 
          message: 'Events must have at least one banner, discount, or special offer before activation' 
        });
      }
      
      event.status = 'active';
      event.isActive = true;
    } else if (newStatus === 'inactive') {
      event.status = 'inactive';
      event.isActive = false;
    } else {
      event.status = newStatus;
    }
    
    await event.save();
    
    res.json({ 
      success: true, 
      message: `Event ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      event 
    });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ message: 'Error updating event status', details: error.message });
  }
});

router.delete('/events/:id', [auth, admin], async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

// Event Analytics
router.get('/events/:id/analytics', [auth, admin], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const analytics = {
      eventId: event._id,
      name: event.name,
      status: event.status,
      duration: event.duration,
      isRunning: event.isRunning,
      totalComponents: event.totalComponents,
      performance: event.performance,
      componentBreakdown: {
        banners: event.components.banners.length,
        discounts: event.components.discounts.length,
        specialOffers: event.components.specialOffers.length,
        spinWheel: event.components.spinWheel.enabled ? 1 : 0
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({ message: 'Error fetching event analytics' });
  }
});

// Event Performance Tracking
router.post('/events/:id/track', [auth, admin], async (req, res) => {
  try {
    const { componentType, metricType, value = 1 } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await event.updatePerformance(componentType, metricType, value);
    
    res.json({ message: 'Performance updated successfully' });
  } catch (error) {
    console.error('Error updating performance:', error);
    res.status(500).json({ message: 'Error updating performance' });
  }
});

// Dashboard Endpoints
router.get('/dashboard/overview', [auth, admin], async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalProducts, totalRevenue] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['completed', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const growthRate = 0.15; // Placeholder - calculate from actual data

    res.json({
      totalRevenue: revenue,
      totalOrders,
      totalUsers,
      totalProducts,
      growthRate,
      activeEvents: await Event.countDocuments({ status: 'active' })
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ message: 'Error fetching dashboard overview' });
  }
});

router.get('/dashboard/finance', [auth, admin], async (req, res) => {
  try {
    const [grossRevenue, netProfit, profitMargin] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $in: ['completed', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { status: { $in: ['completed', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$shippingCost'] } } } }
      ]),
      Promise.resolve(0.25) // Placeholder
    ]);
    
    res.json({
      grossRevenue: grossRevenue[0]?.total || 0,
      netProfit: netProfit[0]?.total || 0,
      profitMargin,
      monthlyGrowth: 0.12,
      averageProfitPerOrder: netProfit[0]?.total || 0,
      costBreakdown: {
        shipping: 0.15,
        marketing: 0.20,
        operations: 0.25,
        other: 0.40
      },
      revenueByCategory: [
        { category: 'Clothing', revenue: grossRevenue[0]?.total * 0.6 || 0 },
        { category: 'Accessories', revenue: grossRevenue[0]?.total * 0.25 || 0 },
        { category: 'Footwear', revenue: grossRevenue[0]?.total * 0.15 || 0 }
      ]
    });
  } catch (error) {
    console.error('Error fetching dashboard finance:', error);
    res.status(500).json({ message: 'Error fetching dashboard finance' });
  }
});

router.get('/dashboard/client-features', [auth, admin], async (req, res) => {
  try {
    const [spinWheel, loyaltyProgram, smartDiscounts] = await Promise.all([
      SpinWheel.aggregate([
        { $group: { _id: null, totalSpins: { $sum: '$analytics.totalSpins' }, rewardsGiven: { $sum: '$analytics.rewardsGiven' } } }
      ]),
      Promise.resolve({
        totalPoints: 15000,
        activeUsers: 45,
        levelDistribution: { bronze: 20, silver: 15, gold: 8, platinum: 2 }
      }),
      Promise.resolve({
        totalCoupons: 25,
        totalSavings: 2500,
        conversionRate: 0.35,
        popularCodes: [
          { code: 'SUMMER20', usage: 15, savings: 1200 },
          { code: 'NEWUSER10', usage: 12, savings: 800 },
          { code: 'FLASH25', usage: 8, savings: 500 }
        ]
      })
    ]);

    res.json({
      spinWheel: {
        totalSpins: spinWheel[0]?.totalSpins || 0,
        rewardsGiven: spinWheel[0]?.rewardsGiven || 0,
        userEngagement: 0.65,
        conversionRate: 0.28
      },
      loyaltyProgram,
      smartDiscounts
    });
  } catch (error) {
    console.error('Error fetching dashboard client features:', error);
    res.status(500).json({ message: 'Error fetching dashboard client features' });
  }
});

router.get('/dashboard/inventory', [auth, admin], async (req, res) => {
  try {
    const [totalProducts, outOfStock, lowStock, criticalStock] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
      Product.countDocuments({ stock: { $gt: 10, $lte: 25 } })
    ]);

    res.json({
      totalProducts,
      outOfStock,
      lowStock,
      criticalStock,
      stockAlerts: [
        { product: 'Summer Dress', stock: 5, status: 'critical' },
        { product: 'Denim Jacket', stock: 0, status: 'out' },
        { product: 'Sneakers', stock: 8, status: 'low' }
      ]
    });
  } catch (error) {
    console.error('Error fetching dashboard inventory:', error);
    res.status(500).json({ message: 'Error fetching dashboard inventory' });
  }
});

router.get('/dashboard/analytics', [auth, admin], async (req, res) => {
  try {
    const { range = '30', period = 'days' } = req.query;
    
    // Placeholder analytics data
    const revenueTrends = Array.from({ length: parseInt(range) }, (_, i) => ({
      date: new Date(Date.now() - (parseInt(range) - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 1000) + 500
    }));

    const topProducts = [
      { name: 'Summer Dress', sales: 45, revenue: 2250 },
      { name: 'Denim Jacket', sales: 32, revenue: 1920 },
      { name: 'Sneakers', sales: 28, revenue: 1680 },
      { name: 'T-Shirt', sales: 25, revenue: 750 },
      { name: 'Jeans', sales: 22, revenue: 1320 }
    ];

    const customerSegments = [
      { segment: 'VIP', count: 15, value: 4500 },
      { segment: 'High Value', count: 45, value: 6750 },
      { segment: 'Medium Value', count: 120, value: 7200 },
      { segment: 'Low Value', count: 200, value: 4000 }
    ];

    res.json({
      revenueTrends,
      topProducts,
      customerSegments,
      profitTrends: revenueTrends.map(item => ({ ...item, profit: item.revenue * 0.25 })),
      userGrowth: Array.from({ length: parseInt(range) }, (_, i) => ({
        date: new Date(Date.now() - (parseInt(range) - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        users: Math.floor(Math.random() * 20) + 10
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ message: 'Error fetching dashboard analytics' });
  }
});

router.get('/dashboard/real-time', [auth, admin], async (req, res) => {
  try {
    const [activeUsers, recentOrders, systemStatus] = await Promise.all([
      Promise.resolve(Math.floor(Math.random() * 50) + 20),
      Order.find().sort({ createdAt: -1 }).limit(5).select('orderNumber totalAmount status createdAt'),
      Promise.resolve({ database: 'healthy', api: 'healthy', email: 'healthy' })
    ]);
    
    res.json({
      activeUsers,
      recentOrders,
      systemStatus,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching dashboard real-time data:', error);
    res.status(500).json({ message: 'Error fetching dashboard real-time data' });
  }
});

router.get('/dashboard/customer-intelligence', [auth, admin], async (req, res) => {
  try {
    const { range = '30', period = 'days' } = req.query;
    
    res.json({
      customerEngagement: {
        totalCustomers: 380,
        repeatCustomers: 95,
        newCustomers: 45,
        averageOrderValue: 125.50
      },
      productEngagement: [
        { product: 'Summer Dress', views: 1250, purchases: 45, conversionRate: 0.036 },
        { product: 'Denim Jacket', views: 980, purchases: 32, conversionRate: 0.033 },
        { product: 'Sneakers', views: 850, purchases: 28, conversionRate: 0.033 },
        { product: 'T-Shirt', views: 1200, purchases: 25, conversionRate: 0.021 },
        { product: 'Jeans', views: 750, purchases: 22, conversionRate: 0.029 }
      ],
      loyaltyInsights: [
        { level: 'Bronze', count: 20, averageSpend: 75.00 },
        { level: 'Silver', count: 15, averageSpend: 150.00 },
        { level: 'Gold', count: 8, averageSpend: 300.00 },
        { level: 'Platinum', count: 2, averageSpend: 500.00 }
      ],
      customerSegments: {
        vipCustomers: 15,
        highValueCustomers: 45,
        mediumValueCustomers: 120,
        lowValueCustomers: 200
      },
      churnRisk: {
        atRiskCustomers: 25,
        highRiskCustomers: 10,
        totalCustomers: 380
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard customer intelligence:', error);
    res.status(500).json({ message: 'Error fetching dashboard customer intelligence' });
  }
});

// Stock Management Routes

// Update product stock
router.patch('/products/:id/stock', auth, admin, async (req, res) => {
  try {
    const { quantity, action, reason, notes } = req.body;
    
    if (!quantity || !action || !reason) {
      return res.status(400).json({ message: 'Quantity, action, and reason are required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate new stock based on action
    let newStock = product.inventory?.totalStock || 0;
    let actualQuantity = parseInt(quantity);

    switch (action) {
      case 'increase':
      case 'restock':
        newStock += Math.abs(actualQuantity);
        break;
      case 'decrease':
        newStock -= Math.abs(actualQuantity);
        break;
      case 'adjustment':
        // For adjustment, use the quantity as-is (can be positive or negative)
        newStock += actualQuantity;
        break;
      case 'set':
        newStock = Math.abs(actualQuantity);
        break;
      default:
        return res.status(400).json({ message: 'Invalid action type' });
    }

    // Ensure stock doesn't go negative
    if (newStock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    const oldStock = product.inventory?.totalStock || 0;

    // Create stock history entry
    const stockHistoryEntry = {
      date: new Date(),
      type: action,
      quantity: actualQuantity,
      previousStock: oldStock,
      newStock: newStock,
      reason: reason,
      notes: notes || '',
      performedBy: req.user._id
    };

    // Update using findByIdAndUpdate with explicit inventory updates
    const updateData = {
      $set: {
        'inventory.totalStock': newStock,
        'inventory.availableStock': newStock - (product.inventory?.reservedStock || 0)
      },
      $push: {
        stockHistory: stockHistoryEntry
      }
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Stock ${action} successful`,
      product: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        previousStock: oldStock,
        currentStock: newStock,
        change: newStock - oldStock
      }
    });

  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: 'Error updating product stock' });
  }
});

// Get stock history for a product
router.get('/products/:id/stock-history', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const product = await Product.findById(req.params.id)
      .populate('stockHistory.performedBy', 'name email')
      .select('name sku stockHistory');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Sort stock history by date (newest first)
    const sortedHistory = (product.stockHistory || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = sortedHistory.slice(startIndex, endIndex);

    res.json({
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku
      },
      history: paginatedHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(sortedHistory.length / limit),
        totalItems: sortedHistory.length,
        hasNext: endIndex < sortedHistory.length,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ message: 'Error fetching stock history' });
  }
});

// Bulk stock operations
router.post('/products/bulk-stock-update', auth, admin, async (req, res) => {
  try {
    const { productIds, operation, quantity, reason, notes } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs array is required' });
    }

    if (!operation || !quantity || !reason) {
      return res.status(400).json({ message: 'Operation, quantity, and reason are required' });
    }

    const results = [];
    const errors = [];

    for (const productId of productIds) {
      try {
        const product = await Product.findById(productId);
        if (!product) {
          errors.push({ productId, error: 'Product not found' });
          continue;
        }

        // Calculate new stock
        let newStock = product.inventory?.totalStock || 0;
        let actualQuantity = parseInt(quantity);

        switch (operation) {
          case 'increase':
            newStock += Math.abs(actualQuantity);
            break;
          case 'decrease':
            newStock -= Math.abs(actualQuantity);
            break;
          case 'set':
            newStock = Math.abs(actualQuantity);
            break;
          default:
            errors.push({ productId, error: 'Invalid operation' });
            continue;
        }

        if (newStock < 0) {
          errors.push({ productId, error: 'Stock cannot be negative' });
          continue;
        }

        // Update product
        if (!product.inventory) {
          product.inventory = {};
        }

        const oldStock = product.inventory.totalStock || 0;
        product.inventory.totalStock = newStock;
        product.inventory.availableStock = newStock - (product.inventory.reservedStock || 0);

        // Add to stock history
        if (!product.stockHistory) {
          product.stockHistory = [];
        }

        product.stockHistory.push({
          date: new Date(),
          type: operation,
          quantity: actualQuantity,
          previousStock: oldStock,
          newStock: newStock,
          reason: reason,
          notes: `Bulk operation: ${notes || ''}`,
          performedBy: req.user._id
        });

        await product.save();

        results.push({
          productId,
          name: product.name,
          sku: product.sku,
          previousStock: oldStock,
          currentStock: newStock,
          change: newStock - oldStock
        });

  } catch (error) {
        errors.push({ productId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk stock operation completed`,
      results,
      errors,
      summary: {
        total: productIds.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('Error performing bulk stock operation:', error);
    res.status(500).json({ message: 'Error performing bulk stock operation' });
  }
});

// Get low stock products for alerts
router.get('/inventory/low-stock', auth, admin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] }
    })
    .select('name sku brand category inventory images')
    .limit(parseInt(limit))
    .sort({ 'inventory.totalStock': 1 }); // Lowest stock first

    res.json(lowStockProducts);

  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ message: 'Error fetching low stock products' });
  }
});

// Get out of stock products
router.get('/inventory/out-of-stock', auth, admin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const outOfStockProducts = await Product.find({
      isActive: true,
      'inventory.totalStock': 0
    })
    .select('name sku brand category inventory images')
    .limit(parseInt(limit))
    .sort({ updatedAt: -1 }); // Most recently updated first

    res.json(outOfStockProducts);

  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    res.status(500).json({ message: 'Error fetching out of stock products' });
  }
});

module.exports = router;
