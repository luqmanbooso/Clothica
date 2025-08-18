const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

// Get all products with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      search,
      featured
    } = req.query;

    const query = { isActive: true };

    // Apply filters
    if (category) {
      // Validate category before applying filter
      const validCategories = ['men', 'women', 'accessories', 'shoes', 'bags'];
      if (validCategories.includes(category)) {
        query.category = category;
      }
      // If invalid category, don't apply filter (show all products)
    }
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Transform products to include proper image structure
    const transformedProducts = products.map(product => {
      const productObj = product.toObject();
      
      // Transform images array to simple string array for frontend compatibility
      if (productObj.images && Array.isArray(productObj.images)) {
        productObj.images = productObj.images
          .filter(img => img && img.url)
          .sort((a, b) => (b.isPrimary ? 1 : -1)) // Primary images first
          .map(img => img.url);
      } else {
        productObj.images = [];
      }
      
      // Add a simple image field for backward compatibility
      productObj.image = productObj.images[0] || null;
      
      return productObj;
    });

    const total = await Product.countDocuments(query);

    res.json({
      products: transformedProducts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category counts
router.get('/categories', async (req, res) => {
  try {
    // Get all unique categories from the Product model enum
    const categories = ['men', 'women', 'kids', 'accessories', 'shoes', 'bags'];
    const categoryCounts = {};
    
    for (const category of categories) {
      const count = await Product.countDocuments({ 
        category, 
        isActive: true 
      });
      categoryCounts[category] = count;
    }
    
    // Add 'all' category count (total products)
    const totalCount = await Product.countDocuments({ isActive: true });
    categoryCounts['all'] = totalCount;
    
    res.json(categoryCounts);
  } catch (error) {
    console.error('Error fetching category counts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    }).limit(8);
    
    // Transform products to include proper image structure
    const transformedProducts = featuredProducts.map(product => {
      const productObj = product.toObject();
      
      // Transform images array to simple string array for frontend compatibility
      if (productObj.images && Array.isArray(productObj.images)) {
        productObj.images = productObj.images
          .filter(img => img && img.url)
          .sort((a, b) => (b.isPrimary ? 1 : -1)) // Primary images first
          .map(img => img.url);
      } else {
        productObj.images = [];
      }
      
      // Add a simple image field for backward compatibility
      productObj.image = productObj.images[0] || null;
      
      return productObj;
    });
    
    res.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active banners for public display
router.get('/banners', async (req, res) => {
  try {
    const banners = await Banner.find({ 
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: null }
      ]
    }).sort({ priority: 1, createdAt: -1 });

    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Placeholder image route - returns a simple data URL
router.get('/placeholder-image', (req, res) => {
  try {
    // Return a simple data URL for a placeholder image
    const dataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
    
    res.json({
      success: true,
      data: {
        placeholderUrl: dataUrl,
        message: 'Placeholder image data URL'
      }
    });
  } catch (error) {
    console.error('Error serving placeholder image:', error);
    res.status(500).json({ message: 'Error serving placeholder image' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Transform product to include proper image structure
    const productObj = product.toObject();
    
    // Transform images array to simple string array for frontend compatibility
    if (productObj.images && Array.isArray(productObj.images)) {
      productObj.images = productObj.images
        .filter(img => img && img.url)
        .sort((a, b) => (b.isPrimary ? 1 : -1)) // Primary images first
        .map(img => img.url);
    } else {
      productObj.images = [];
    }
    
    // Add a simple image field for backward compatibility
    productObj.image = productObj.images[0] || null;

    res.json(productObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', [auth, admin], [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['men', 'women', 'kids', 'accessories', 'shoes', 'bags']).withMessage('Invalid category'),
  body('subcategory').notEmpty().withMessage('Subcategory is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product(req.body);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review to product
router.post('/:id/reviews', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10 }).withMessage('Comment must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    };

    product.reviews.push(review);

    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;
    product.numReviews = product.reviews.length;

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product stock information
router.get('/:id/stock', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const stockInfo = {
      productId: product._id,
      productName: product.name,
      totalStock: product.inventory?.totalStock || 0,
      availableStock: product.inventory?.availableStock || 0,
      reservedStock: product.inventory?.reservedStock || 0,
      sizes: product.sizes || [],
      lowStockThreshold: product.inventory?.lowStockThreshold || 10,
      criticalStockThreshold: product.inventory?.criticalStockThreshold || 5,
      needsReorder: (product.inventory?.totalStock || 0) <= (product.inventory?.reorderPoint || 20),
      stockStatus: (product.inventory?.totalStock || 0) > (product.inventory?.criticalStockThreshold || 5) ? 'healthy' : 'critical'
    };

    res.json(stockInfo);
  } catch (error) {
    console.error('Error fetching product stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product stock
router.put('/:id/stock', auth, admin, async (req, res) => {
  try {
    const { quantity, type, reason, size } = req.body;
    
    if (!quantity || !type) {
      return res.status(400).json({ message: 'Quantity and type are required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle different stock adjustment types
    switch (type) {
      case 'add':
        if (size && product.sizes) {
          const sizeObj = product.sizes.find(s => s.name === size);
          if (sizeObj) {
            sizeObj.stock = Math.max(0, (sizeObj.stock || 0) + quantity);
          }
        } else {
          if (!product.inventory) product.inventory = {};
          product.inventory.totalStock = (product.inventory.totalStock || 0) + quantity;
          product.inventory.availableStock = (product.inventory.availableStock || 0) + quantity;
        }
        break;
        
      case 'subtract':
        if (size && product.sizes) {
          const sizeObj = product.sizes.find(s => s.name === size);
          if (sizeObj) {
            sizeObj.stock = Math.max(0, (sizeObj.stock || 0) - quantity);
          }
        } else {
          if (!product.inventory) product.inventory = {};
          product.inventory.totalStock = Math.max(0, (product.inventory.totalStock || 0) - quantity);
          product.inventory.availableStock = Math.max(0, (product.inventory.availableStock || 0) - quantity);
        }
        break;
        
      case 'set':
        if (size && product.sizes) {
          const sizeObj = product.sizes.find(s => s.name === size);
          if (sizeObj) {
            sizeObj.stock = Math.max(0, quantity);
          }
        } else {
          if (!product.inventory) product.inventory = {};
          product.inventory.totalStock = Math.max(0, quantity);
          product.inventory.availableStock = Math.max(0, quantity);
        }
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid stock adjustment type' });
    }

    // Add to stock history
    if (!product.stockHistory) product.stockHistory = [];
    product.stockHistory.push({
      date: new Date(),
      type: 'adjustment',
      quantity: type === 'subtract' ? -quantity : quantity,
      previousStock: product.inventory?.totalStock || 0,
      newStock: product.inventory?.totalStock || 0,
      reason: reason || 'Manual adjustment',
      performedBy: req.user.id,
      notes: `${type} ${quantity} units`
    });

    await product.save();

    res.json({
      message: 'Stock updated successfully',
      productId: product._id,
      newStock: product.inventory?.totalStock || 0,
      availableStock: product.inventory?.availableStock || 0
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock products
router.get('/stock/low', auth, admin, async (req, res) => {
  try {
    const products = await Product.find({
      'inventory.totalStock': { $lte: '$inventory.lowStockThreshold' },
      isActive: true
    }).select('name sku inventory sizes category');

    const lowStockProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      totalStock: product.inventory?.totalStock || 0,
      lowStockThreshold: product.inventory?.lowStockThreshold || 10,
      needsReorder: (product.inventory?.totalStock || 0) <= (product.inventory?.reorderPoint || 20)
    }));

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 