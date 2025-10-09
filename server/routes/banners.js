const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Get all banners with advanced filtering (admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      position,
      eventId,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Apply filters
    if (type && type !== 'all') query.type = type;
    if (position && position !== 'all') query.position = position;
    if (eventId && eventId !== 'all') query.eventId = eventId;
    if (status && status !== 'all') {
      if (status === 'active') query.isActive = true;
      else if (status === 'inactive') query.isActive = false;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    
    const [banners, total] = await Promise.all([
      Banner.find(query)
        .populate('eventId', 'name status')
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Banner.countDocuments(query)
    ]);

    res.json({
      banners,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBanners: total,
        hasNextPage: skip + banners.length < total,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Error fetching banners' });
  }
});

// Get banner templates
router.get('/templates', auth, admin, async (req, res) => {
  try {
    const templates = await Banner.getTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Error fetching templates' });
  }
});

// Create banner from template
router.post('/from-template', auth, admin, async (req, res) => {
  try {
    const { templateId, customizations } = req.body;
    
    if (!templateId) {
      return res.status(400).json({ message: 'Template ID is required' });
    }
    
    const banner = await Banner.createFromTemplate(templateId, customizations, req.user._id);
    await banner.save();
    
    res.status(201).json(banner);
  } catch (error) {
    console.error('Error creating banner from template:', error);
    res.status(500).json({ message: 'Error creating banner from template' });
  }
});

// Get active banners for public display with context
router.get('/active', async (req, res) => {
  try {
    const { page = 'all', userType = 'guest', device = 'desktop', eventId } = req.query;
    
    const context = { page, userType, device };
    let banners;
    
    if (eventId) {
      // Get event-specific banners
      banners = await Banner.getActiveEventBanners(eventId, null, page);
    } else {
      // Get all active banners
      banners = await Banner.getActiveBanners(context);
    }
    
    res.json(banners);
  } catch (error) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({ message: 'Error fetching active banners' });
  }
});

// Get banners for specific page
router.get('/page/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;
    const { eventId, userType = 'guest', device = 'desktop' } = req.query;
    
    const context = { page: pageName, userType, device };
    let banners;
    
    if (eventId) {
      banners = await Banner.getActiveEventBanners(eventId, null, pageName);
    } else {
      banners = await Banner.getActiveBanners(context);
    }
    
    res.json(banners);
  } catch (error) {
    console.error('Error fetching page banners:', error);
    res.status(500).json({ message: 'Error fetching page banners' });
  }
});

// Get single banner
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate('eventId', 'name status')
      .populate('createdBy', 'name email');
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({ message: 'Error fetching banner' });
  }
});

// Create new banner (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const bannerData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const banner = new Banner(bannerData);
    await banner.save();
    
    res.status(201).json(banner);
  } catch (error) {
    console.error('Error creating banner:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating banner' });
  }
});

// Update banner (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const bannerData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };
    
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      bannerData,
      { new: true, runValidators: true }
    );
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating banner' });
  }
});

// Delete banner (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Error deleting banner' });
  }
});

// Toggle banner status (admin only)
router.patch('/:id/toggle', auth, admin, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    banner.isActive = !banner.isActive;
    await banner.save();
    
    res.json(banner);
  } catch (error) {
    console.error('Error toggling banner status:', error);
    res.status(500).json({ message: 'Error toggling banner status' });
  }
});

// Update banner order (admin only)
router.patch('/:id/order', auth, admin, async (req, res) => {
  try {
    const { order } = req.body;
    
    if (typeof order !== 'number') {
      return res.status(400).json({ message: 'Order must be a number' });
    }
    
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { order },
      { new: true }
    );
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json(banner);
  } catch (error) {
    console.error('Error updating banner order:', error);
    res.status(500).json({ message: 'Error updating banner order' });
  }
});

// Record banner display (public)
router.post('/:id/display', async (req, res) => {
  try {
    const { userId } = req.body;
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    await banner.recordDisplay(userId);
    res.json({ message: 'Display recorded' });
  } catch (error) {
    console.error('Error recording banner display:', error);
    res.status(500).json({ message: 'Error recording display' });
  }
});

// Record banner click (public)
router.post('/:id/click', async (req, res) => {
  try {
    const { userId } = req.body;
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    await banner.recordClick(userId);
    res.json({ message: 'Click recorded' });
  } catch (error) {
    console.error('Error recording banner click:', error);
    res.status(500).json({ message: 'Error recording click' });
  }
});

// Record banner conversion (public)
router.post('/:id/conversion', async (req, res) => {
  try {
    const { userId, revenue = 0 } = req.body;
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    await banner.recordConversion(revenue, userId);
    res.json({ message: 'Conversion recorded' });
  } catch (error) {
    console.error('Error recording banner conversion:', error);
    res.status(500).json({ message: 'Error recording conversion' });
  }
});

// Get banner performance analytics (admin only)
router.get('/:id/analytics', auth, admin, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    const analytics = {
      bannerId: banner._id,
      name: banner.name,
      type: banner.type,
      position: banner.position,
      eventId: banner.eventId,
      analytics: banner.analytics,
      ctr: banner.ctr,
      conversionRate: banner.conversionRate,
      rpi: banner.rpi,
      isValid: banner.isValid
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching banner analytics:', error);
    res.status(500).json({ message: 'Error fetching banner analytics' });
  }
});

// Get overall banner performance (admin only)
router.get('/analytics/overview', auth, admin, async (req, res) => {
  try {
    const { startDate, endDate, eventId } = req.query;
    
    const dateRange = {};
    if (startDate) dateRange.start = new Date(startDate);
    if (endDate) dateRange.end = new Date(endDate);
    
    let matchStage = {};
    if (eventId) matchStage.eventId = eventId;
    
    const analytics = await Banner.getPerformanceAnalytics(
      matchStage._id ? Object.keys(matchStage._id.$in) : null,
      dateRange
    );
    
    res.json(analytics[0] || {
      totalBanners: 0,
      totalDisplays: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      totalImpressions: 0,
      avgCTR: 0,
      avgConversionRate: 0
    });
  } catch (error) {
    console.error('Error fetching banner analytics overview:', error);
    res.status(500).json({ message: 'Error fetching analytics overview' });
  }
});

// Bulk banner actions (admin only)
router.post('/bulk-action', auth, admin, async (req, res) => {
  try {
    const { bannerIds, action } = req.body;
    
    if (!bannerIds || !Array.isArray(bannerIds) || bannerIds.length === 0) {
      return res.status(400).json({ message: 'Invalid banner IDs' });
    }
    
    let updateData = {};
    let message = '';
    
    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        message = 'Banners activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        message = 'Banners deactivated successfully';
        break;
      case 'delete':
        await Banner.deleteMany({ _id: { $in: bannerIds } });
        return res.json({ message: 'Banners deleted successfully' });
      default:
        return res.status(400).json({ message: 'Invalid bulk action' });
    }
    
    await Banner.updateMany(
      { _id: { $in: bannerIds } },
      { ...updateData, lastModifiedBy: req.user._id }
    );
    
    res.json({ message });
  } catch (error) {
    console.error('Error performing bulk banner action:', error);
    res.status(500).json({ message: 'Error performing bulk action' });
  }
});

module.exports = router;


