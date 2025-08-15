const express = require('express');
const router = express.Router();
const UnifiedDiscount = require('../models/UnifiedDiscount');
const Event = require('../models/Event');
const SmartInventory = require('../models/SmartInventory');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Get all discounts (admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, eventId } = req.query;
    const query = {};
    
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.discountType = type;
    if (eventId && eventId !== 'all') query.eventId = eventId;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const discounts = await UnifiedDiscount.paginate(query, options);
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ message: 'Error fetching discounts' });
  }
});

// Get active discounts for public use
router.get('/active', async (req, res) => {
  try {
    const { eventId, inventoryTrigger, userGroup } = req.query;
    const context = {};
    
    if (eventId) context.eventId = eventId;
    if (inventoryTrigger === 'true') context.inventoryTrigger = true;
    
    const discounts = await UnifiedDiscount.getActiveDiscounts(userGroup, context);
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching active discounts:', error);
    res.status(500).json({ message: 'Error fetching active discounts' });
  }
});

// Get discount by ID
router.get('/:id', async (req, res) => {
  try {
    const discount = await UnifiedDiscount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.json(discount);
  } catch (error) {
    console.error('Error fetching discount:', error);
    res.status(500).json({ message: 'Error fetching discount' });
  }
});

// Create new discount (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const discountData = {
      ...req.body,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    };
    
    const discount = new UnifiedDiscount(discountData);
    await discount.save();
    
    res.status(201).json(discount);
  } catch (error) {
    console.error('Error creating discount:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating discount' });
  }
});

// Update discount (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const discountData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };
    
    const discount = await UnifiedDiscount.findByIdAndUpdate(
      req.params.id,
      discountData,
      { new: true, runValidators: true }
    );
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    res.json(discount);
  } catch (error) {
    console.error('Error updating discount:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating discount' });
  }
});

// Delete discount (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const discount = await UnifiedDiscount.findByIdAndDelete(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({ message: 'Error deleting discount' });
  }
});

// Activate/Deactivate discount (admin only)
router.patch('/:id/toggle', auth, admin, async (req, res) => {
  try {
    const discount = await UnifiedDiscount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    discount.isActive = !discount.isActive;
    discount.status = discount.isActive ? 'active' : 'paused';
    discount.lastModifiedBy = req.user._id;
    
    await discount.save();
    res.json(discount);
  } catch (error) {
    console.error('Error toggling discount:', error);
    res.status(500).json({ message: 'Error toggling discount' });
  }
});

// Record discount view (public)
router.post('/:id/view', async (req, res) => {
  try {
    const discount = await UnifiedDiscount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    await discount.recordView();
    res.json({ message: 'View recorded' });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ message: 'Error recording view' });
  }
});

// Record discount click (public)
router.post('/:id/click', async (req, res) => {
  try {
    const discount = await UnifiedDiscount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    await discount.recordClick();
    res.json({ message: 'Click recorded' });
  } catch (error) {
    console.error('Error recording click:', error);
    res.status(500).json({ message: 'Error recording click' });
  }
});

// Calculate discount for order (public)
router.post('/:id/calculate', async (req, res) => {
  try {
    const { orderAmount, productPrice = 0 } = req.body;
    const discount = await UnifiedDiscount.findById(req.params.id);
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    const discountAmount = discount.calculateDiscount(orderAmount, productPrice);
    res.json({ discountAmount, discount });
  } catch (error) {
    console.error('Error calculating discount:', error);
    res.status(500).json({ message: 'Error calculating discount' });
  }
});

// Get inventory-triggered discounts
router.get('/inventory/triggered', auth, admin, async (req, res) => {
  try {
    const discounts = await UnifiedDiscount.getInventoryTriggeredDiscounts();
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching inventory-triggered discounts:', error);
    res.status(500).json({ message: 'Error fetching inventory-triggered discounts' });
  }
});

// Get seasonal discounts
router.get('/seasonal/active', async (req, res) => {
  try {
    const discounts = await UnifiedDiscount.getSeasonalDiscounts();
    res.json(discounts);
  } catch (error) {
    console.error('Error fetching seasonal discounts:', error);
    res.status(500).json({ message: 'Error fetching seasonal discounts' });
  }
});

// Bulk actions (admin only)
router.post('/bulk-action', auth, admin, async (req, res) => {
  try {
    const { discountIds, action } = req.body;
    
    if (!discountIds || !Array.isArray(discountIds) || discountIds.length === 0) {
      return res.status(400).json({ message: 'Invalid discount IDs' });
    }
    
    let updateData = {};
    let message = '';
    
    switch (action) {
      case 'activate':
        updateData = { isActive: true, status: 'active' };
        message = 'Discounts activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false, status: 'paused' };
        message = 'Discounts deactivated successfully';
        break;
      case 'delete':
        await UnifiedDiscount.deleteMany({ _id: { $in: discountIds } });
        return res.json({ message: 'Discounts deleted successfully' });
      default:
        return res.status(400).json({ message: 'Invalid bulk action' });
    }
    
    await UnifiedDiscount.updateMany(
      { _id: { $in: discountIds } },
      { ...updateData, lastModifiedBy: req.user._id }
    );
    
    res.json({ message });
  } catch (error) {
    console.error('Error performing bulk discount action:', error);
    res.status(500).json({ message: 'Error performing bulk discount action' });
  }
});

// Get discount analytics (admin only)
router.get('/:id/analytics', auth, admin, async (req, res) => {
  try {
    const discount = await UnifiedDiscount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    const analytics = {
      views: discount.analytics.views,
      clicks: discount.analytics.clicks,
      conversions: discount.analytics.conversions,
      revenue: discount.analytics.revenue,
      usageCount: discount.analytics.usageCount,
      totalDiscount: discount.analytics.totalDiscount,
      ctr: discount.analytics.views > 0 ? (discount.analytics.clicks / discount.analytics.views * 100).toFixed(2) : 0,
      conversionRate: discount.analytics.clicks > 0 ? (discount.analytics.conversions / discount.analytics.clicks * 100).toFixed(2) : 0,
      effectivenessScore: discount.effectivenessScore
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching discount analytics:', error);
    res.status(500).json({ message: 'Error fetching discount analytics' });
  }
});

// Get discount performance insights (admin only)
router.get('/analytics/insights', auth, admin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const insights = await UnifiedDiscount.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$analytics.views' },
          totalClicks: { $sum: '$analytics.clicks' },
          totalConversions: { $sum: '$analytics.conversions' },
          totalRevenue: { $sum: '$analytics.revenue' },
          totalDiscounts: { $sum: '$analytics.totalDiscount' },
          avgEffectiveness: { $avg: '$effectivenessScore' }
        }
      }
    ]);
    
    const result = insights[0] || {
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      totalDiscounts: 0,
      avgEffectiveness: 0
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching discount insights:', error);
    res.status(500).json({ message: 'Error fetching discount insights' });
  }
});

module.exports = router;
