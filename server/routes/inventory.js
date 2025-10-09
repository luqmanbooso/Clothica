const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const SmartInventory = require('../models/SmartInventory');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { body, validationResult } = require('express-validator');

// Get all inventory overview
router.get('/', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, stockStatus, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { 'brand': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Stock status filter
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
        case 'critical-stock':
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
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const products = await Product.find(query)
      .select('name sku category brand price inventory images isActive')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Product.countDocuments(query);
    
    // Calculate inventory statistics
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$inventory.totalStock' },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$inventory.totalStock', 0] }, 1, 0]
            }
          },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$inventory.totalStock', 0] },
                    { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          criticalStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$inventory.totalStock', 0] },
                    { $lte: ['$inventory.totalStock', '$inventory.criticalStockThreshold'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalValue: {
            $sum: {
              $multiply: ['$inventory.totalStock', '$price']
            }
          }
        }
      }
    ]);
    
    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: stats[0] || {
        totalProducts: 0,
        totalStock: 0,
        outOfStock: 0,
        lowStock: 0,
        criticalStock: 0,
        totalValue: 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Error fetching inventory data' });
  }
});

// Get single product inventory details
router.get('/product/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('name sku category brand price inventory stockHistory locations')
      .populate('stockHistory.performedBy', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    res.status(500).json({ message: 'Error fetching product inventory' });
  }
});

// Update stock levels
router.patch('/product/:id/stock', [
  auth,
  admin,
  body('action').isIn(['increase', 'decrease', 'set', 'adjustment']).withMessage('Invalid action'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { action, quantity, reason, notes } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const oldStock = product.inventory?.totalStock || 0;
    let newStock = oldStock;
    let actualQuantity = parseInt(quantity);
    
    switch (action) {
      case 'increase':
        newStock = oldStock + Math.abs(actualQuantity);
        break;
      case 'decrease':
        newStock = Math.max(0, oldStock - Math.abs(actualQuantity));
        break;
      case 'set':
        newStock = Math.abs(actualQuantity);
        break;
      case 'adjustment':
        newStock = oldStock + actualQuantity; // Can be positive or negative
        break;
    }
    
    // Ensure stock doesn't go negative
    if (newStock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }
    
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
    
    // Update product using direct MongoDB update
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
        change: newStock - oldStock,
        inventory: updatedProduct.inventory
      }
    });
    
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
});

// Bulk stock update
router.patch('/bulk-update', [
  auth,
  admin,
  body('updates').isArray().withMessage('Updates must be an array'),
  body('updates.*.productId').isMongoId().withMessage('Invalid product ID'),
  body('updates.*.action').isIn(['increase', 'decrease', 'set']).withMessage('Invalid action'),
  body('updates.*.quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { updates, reason, notes } = req.body;
    const results = [];
    const failures = [];
    
    for (const update of updates) {
      try {
        const { productId, action, quantity } = update;
        
        const product = await Product.findById(productId);
        if (!product) {
          failures.push({ productId, error: 'Product not found' });
          continue;
        }
        
        const oldStock = product.inventory?.totalStock || 0;
        let newStock = oldStock;
        
        switch (action) {
          case 'increase':
            newStock = oldStock + parseInt(quantity);
            break;
          case 'decrease':
            newStock = Math.max(0, oldStock - parseInt(quantity));
            break;
          case 'set':
            newStock = parseInt(quantity);
            break;
        }
        
        // Create stock history entry
        const stockHistoryEntry = {
          date: new Date(),
          type: action,
          quantity: action === 'decrease' ? -parseInt(quantity) : parseInt(quantity),
          previousStock: oldStock,
          newStock: newStock,
          reason: reason,
          notes: notes || 'Bulk update',
          performedBy: req.user._id
        };
        
        // Update product
        const updateData = {
          $set: {
            'inventory.totalStock': newStock,
            'inventory.availableStock': newStock - (product.inventory?.reservedStock || 0)
          },
          $push: {
            stockHistory: stockHistoryEntry
          }
        };
        
        await Product.findByIdAndUpdate(productId, updateData);
        
        results.push({
          productId,
          name: product.name,
          sku: product.sku,
          previousStock: oldStock,
          newStock: newStock,
          change: newStock - oldStock
        });
        
      } catch (error) {
        failures.push({ productId: update.productId, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Bulk update completed. ${results.length} successful, ${failures.length} failed.`,
      results,
      failures
    });
    
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ message: 'Error in bulk stock update' });
  }
});

// Get stock history for a product
router.get('/product/:id/history', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const product = await Product.findById(req.params.id)
      .select('stockHistory')
      .populate('stockHistory.performedBy', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Sort stock history by date (newest first)
    const sortedHistory = product.stockHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice((page - 1) * limit, page * limit);
    
    const total = product.stockHistory.length;
    
    res.json({
      history: sortedHistory,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ message: 'Error fetching stock history' });
  }
});

// Get low stock alerts
router.get('/alerts', auth, admin, async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    let query = {};
    
    switch (type) {
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
      default:
        query.$or = [
          { 'inventory.totalStock': 0 },
          {
            $and: [
              { 'inventory.totalStock': { $gt: 0 } },
              { $expr: { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] } }
            ]
          }
        ];
    }
    
    const alerts = await Product.find(query)
      .select('name sku category brand inventory images')
      .sort({ 'inventory.totalStock': 1 });
    
    res.json({
      alerts,
      count: alerts.length,
      summary: {
        outOfStock: alerts.filter(p => p.inventory.totalStock === 0).length,
        lowStock: alerts.filter(p => 
          p.inventory.totalStock > 0 && 
          p.inventory.totalStock <= p.inventory.lowStockThreshold
        ).length,
        critical: alerts.filter(p => 
          p.inventory.totalStock > 0 && 
          p.inventory.totalStock <= p.inventory.criticalStockThreshold
        ).length
      }
    });
    
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    res.status(500).json({ message: 'Error fetching stock alerts' });
  }
});

// Update inventory thresholds
router.patch('/product/:id/thresholds', [
  auth,
  admin,
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be non-negative'),
  body('criticalStockThreshold').optional().isInt({ min: 0 }).withMessage('Critical stock threshold must be non-negative'),
  body('reorderPoint').optional().isInt({ min: 0 }).withMessage('Reorder point must be non-negative'),
  body('reorderQuantity').optional().isInt({ min: 1 }).withMessage('Reorder quantity must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { lowStockThreshold, criticalStockThreshold, reorderPoint, reorderQuantity } = req.body;
    
    const updateData = {};
    if (lowStockThreshold !== undefined) updateData['inventory.lowStockThreshold'] = lowStockThreshold;
    if (criticalStockThreshold !== undefined) updateData['inventory.criticalStockThreshold'] = criticalStockThreshold;
    if (reorderPoint !== undefined) updateData['inventory.reorderPoint'] = reorderPoint;
    if (reorderQuantity !== undefined) updateData['inventory.reorderQuantity'] = reorderQuantity;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('name sku inventory');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({
      success: true,
      message: 'Inventory thresholds updated successfully',
      product
    });
    
  } catch (error) {
    console.error('Error updating thresholds:', error);
    res.status(500).json({ message: 'Error updating inventory thresholds' });
  }
});

// Generate inventory report
router.get('/report', auth, admin, async (req, res) => {
  try {
    const { format = 'json', category, startDate, endDate } = req.query;
    
    let matchQuery = {};
    if (category && category !== 'all') {
      matchQuery.category = category;
    }
    
    const report = await Product.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$inventory.totalStock' },
          totalValue: { $sum: { $multiply: ['$inventory.totalStock', '$price'] } },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$inventory.totalStock', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$inventory.totalStock', 0] },
                    { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageStock: { $avg: '$inventory.totalStock' },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);
    
    const summary = await Product.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$inventory.totalStock' },
          totalValue: { $sum: { $multiply: ['$inventory.totalStock', '$price'] } },
          categories: { $addToSet: '$category' }
        }
      }
    ]);
    
    res.json({
      summary: summary[0] || {},
      categoryBreakdown: report,
      generatedAt: new Date(),
      filters: { category, startDate, endDate }
    });
    
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ message: 'Error generating inventory report' });
  }
});

module.exports = router;
