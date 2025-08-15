const express = require('express');
const router = express.Router();
const SmartInventory = require('../models/SmartInventory');
const Product = require('../models/Product');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Get all inventory items (admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, eventId } = req.query;
    const query = {};
    
    if (status && status !== 'all') query.stockStatus = status;
    if (category && category !== 'all') query['productId.category'] = category;
    if (eventId && eventId !== 'all') query['eventIntelligence.eventMultipliers.eventId'] = eventId;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { urgencyScore: -1, createdAt: -1 },
      populate: {
        path: 'productId',
        select: 'name price category images'
      }
    };
    
    const inventory = await SmartInventory.paginate(query, options);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Error fetching inventory' });
  }
});

// Get inventory by product ID
router.get('/product/:productId', async (req, res) => {
  try {
    const inventory = await SmartInventory.findOne({ productId: req.params.productId })
      .populate('productId', 'name price category images');
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Error fetching inventory' });
  }
});

// Create/Update inventory item (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { productId, currentStock, thresholds, restockStrategy } = req.body;
    
    let inventory = await SmartInventory.findOne({ productId });
    
    if (inventory) {
      // Update existing inventory
      Object.assign(inventory, req.body);
    } else {
      // Create new inventory
      inventory = new SmartInventory({
        productId,
        currentStock: currentStock || 0,
        thresholds: thresholds || {},
        restockStrategy: restockStrategy || {},
        ...req.body
      });
    }
    
    await inventory.save();
    await inventory.populate('productId', 'name price category images');
    
    res.json(inventory);
  } catch (error) {
    console.error('Error saving inventory:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error saving inventory' });
  }
});

// Update inventory stock (admin only)
router.patch('/:id/stock', auth, admin, async (req, res) => {
  try {
    const { quantity, action, reason, eventId } = req.body;
    const inventory = await SmartInventory.findById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    await inventory.adjustStock(quantity, action, reason, eventId);
    await inventory.populate('productId', 'name price category images');
    
    res.json(inventory);
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    res.status(500).json({ message: 'Error updating inventory stock' });
  }
});

// Get low stock products (admin only)
router.get('/alerts/low-stock', auth, admin, async (req, res) => {
  try {
    const products = await SmartInventory.getLowStockProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ message: 'Error fetching low stock products' });
  }
});

// Get critical stock products (admin only)
router.get('/alerts/critical-stock', auth, admin, async (req, res) => {
  try {
    const products = await SmartInventory.getCriticalStockProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching critical stock products:', error);
    res.status(500).json({ message: 'Error fetching critical stock products' });
  }
});

// Get products needing restock (admin only)
router.get('/alerts/restock-needed', auth, admin, async (req, res) => {
  try {
    const products = await SmartInventory.getProductsNeedingRestock();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products needing restock:', error);
    res.status(500).json({ message: 'Error fetching products needing restock' });
  }
});

// Get event-impacted products (admin only)
router.get('/events/:eventId/impact', auth, admin, async (req, res) => {
  try {
    const products = await SmartInventory.getEventImpactedProducts(req.params.eventId);
    res.json(products);
  } catch (error) {
    console.error('Error fetching event-impacted products:', error);
    res.status(500).json({ message: 'Error fetching event-impacted products' });
  }
});

// Get inventory analytics (admin only)
router.get('/analytics/overview', auth, admin, async (req, res) => {
  try {
    const analytics = await SmartInventory.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          avgStock: { $avg: '$currentStock' },
          totalStockouts: { $sum: '$performance.stockouts' },
          totalOverstock: { $sum: '$performance.overstock' },
          totalLostSales: { $sum: '$performance.lostSales' },
          avgUrgencyScore: { $avg: '$urgencyScore' }
        }
      }
    ]);
    
    const result = analytics[0] || {
      totalProducts: 0,
      totalStock: 0,
      avgStock: 0,
      totalStockouts: 0,
      totalOverstock: 0,
      totalLostSales: 0,
      avgUrgencyScore: 0
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ message: 'Error fetching inventory analytics' });
  }
});

// Get inventory trends (admin only)
router.get('/analytics/trends', auth, admin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const trends = await SmartInventory.aggregate([
      {
        $match: {
          'stockHistory.date': { $gte: startDate }
        }
      },
      {
        $unwind: '$stockHistory'
      },
      {
        $match: {
          'stockHistory.date': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$stockHistory.date' } },
            action: '$stockHistory.action'
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$stockHistory.quantity' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);
    
    res.json(trends);
  } catch (error) {
    console.error('Error fetching inventory trends:', error);
    res.status(500).json({ message: 'Error fetching inventory trends' });
  }
});

// Bulk inventory operations (admin only)
router.post('/bulk-operations', auth, admin, async (req, res) => {
  try {
    const { inventoryIds, operation, data } = req.body;
    
    if (!inventoryIds || !Array.isArray(inventoryIds) || inventoryIds.length === 0) {
      return res.status(400).json({ message: 'Invalid inventory IDs' });
    }
    
    let message = '';
    
    switch (operation) {
      case 'restock':
        for (const id of inventoryIds) {
          const inventory = await SmartInventory.findById(id);
          if (inventory) {
            await inventory.adjustStock(data.quantity || 50, 'restock', 'Bulk restock operation');
          }
        }
        message = 'Products restocked successfully';
        break;
        
      case 'update-thresholds':
        await SmartInventory.updateMany(
          { _id: { $in: inventoryIds } },
          { $set: { thresholds: data.thresholds } }
        );
        message = 'Thresholds updated successfully';
        break;
        
      case 'update-restock-strategy':
        await SmartInventory.updateMany(
          { _id: { $in: inventoryIds } },
          { $set: { restockStrategy: data.restockStrategy } }
        );
        message = 'Restock strategy updated successfully';
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }
    
    res.json({ message });
  } catch (error) {
    console.error('Error performing bulk inventory operations:', error);
    res.status(500).json({ message: 'Error performing bulk inventory operations' });
  }
});

// Get restock recommendations (admin only)
router.get('/recommendations/restock', auth, admin, async (req, res) => {
  try {
    const recommendations = await SmartInventory.aggregate([
      {
        $match: {
          'restockStrategy.autoReorder': true
        }
      },
      {
        $addFields: {
          shouldReorder: { $cond: { if: '$shouldReorder', then: true, else: false } },
          recommendedQuantity: '$restockStrategy.reorderQuantity'
        }
      },
      {
        $match: {
          shouldReorder: true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productId: 1,
          productName: '$product.name',
          currentStock: 1,
          recommendedQuantity: 1,
          urgencyScore: 1,
          predictedDemand: '$demandForecast.predictedDemand'
        }
      },
      {
        $sort: { urgencyScore: -1 }
      }
    ]);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching restock recommendations:', error);
    res.status(500).json({ message: 'Error fetching restock recommendations' });
  }
});

// Get seasonal demand insights (admin only)
router.get('/insights/seasonal-demand', auth, admin, async (req, res) => {
  try {
    const insights = await SmartInventory.aggregate([
      {
        $group: {
          _id: null,
          springDemand: { $avg: '$eventIntelligence.seasonalDemand.spring' },
          summerDemand: { $avg: '$eventIntelligence.seasonalDemand.summer' },
          fallDemand: { $avg: '$eventIntelligence.seasonalDemand.fall' },
          winterDemand: { $avg: '$eventIntelligence.seasonalDemand.winter' }
        }
      }
    ]);
    
    const result = insights[0] || {
      springDemand: 1.0,
      summerDemand: 1.0,
      fallDemand: 1.0,
      winterDemand: 1.0
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching seasonal demand insights:', error);
    res.status(500).json({ message: 'Error fetching seasonal demand insights' });
  }
});

// Delete inventory item (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const inventory = await SmartInventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    res.json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({ message: 'Error deleting inventory' });
  }
});

module.exports = router;
