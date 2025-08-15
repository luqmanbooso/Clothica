const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Get all events (admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10, search } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('campaign.banners.bannerId', 'name title image')
        .populate('campaign.coupons.couponId', 'code discount')
        .populate('campaign.specialOffers.offerId', 'title description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);
    
    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get active events (public)
router.get('/active', async (req, res) => {
  try {
    const events = await Event.getActiveEvents()
      .populate('campaign.banners.bannerId', 'name title image displayMode')
      .populate('campaign.coupons.couponId', 'code discount validUntil')
      .populate('campaign.specialOffers.offerId', 'title description');
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching active events:', error);
    res.status(500).json({ message: 'Error fetching active events' });
  }
});

// Get events by type
router.get('/type/:type', async (req, res) => {
  try {
    const events = await Event.getEventsByType(req.params.type)
      .populate('campaign.banners.bannerId', 'name title image')
      .populate('campaign.coupons.couponId', 'code discount');
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events by type:', error);
    res.status(500).json({ message: 'Error fetching events by type' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('campaign.banners.bannerId')
      .populate('campaign.coupons.couponId')
      .populate('campaign.specialOffers.offerId')
      .populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Create new event (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const event = new Event(eventData);
    await event.save();
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    if (error.message === 'Start date must be before end date') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Update event (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    if (error.message === 'Start date must be before end date') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete event (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Deactivate campaign before deleting
    await event.deactivateCampaign();
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

// Activate event campaign (admin only)
router.post('/:id/activate', auth, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await event.activateCampaign();
    
    res.json({ message: 'Campaign activated successfully', event });
  } catch (error) {
    console.error('Error activating campaign:', error);
    res.status(500).json({ message: 'Error activating campaign' });
  }
});

// Deactivate event campaign (admin only)
router.post('/:id/deactivate', auth, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await event.deactivateCampaign();
    
    res.json({ message: 'Campaign deactivated successfully', event });
  } catch (error) {
    console.error('Error deactivating campaign:', error);
    res.status(500).json({ message: 'Error deactivating campaign' });
  }
});

// Get event analytics (admin only)
router.get('/:id/analytics', auth, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Aggregate analytics from associated banners, coupons, and products
    const bannerAnalytics = await Banner.aggregate([
      { $match: { eventId: event._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$analytics.views' },
          totalClicks: { $sum: '$analytics.clicks' },
          totalConversions: { $sum: '$analytics.conversions' },
          totalRevenue: { $sum: '$analytics.revenue' }
        }
      }
    ]);
    
    const couponAnalytics = await Coupon.aggregate([
      { $match: { _id: { $in: event.campaign.coupons.map(c => c.couponId) } } },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: '$usageCount' },
          totalDiscount: { $sum: '$totalDiscount' }
        }
      }
    ]);
    
    const analytics = {
      event: {
        views: event.metrics.views,
        clicks: event.metrics.clicks,
        conversions: event.metrics.conversions,
        revenue: event.metrics.revenue
      },
      banners: bannerAnalytics[0] || {
        totalViews: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0
      },
      coupons: couponAnalytics[0] || {
        totalUsage: 0,
        totalDiscount: 0
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({ message: 'Error fetching event analytics' });
  }
});

// Get context-aware banners for specific page/user
router.get('/banners/context', async (req, res) => {
  try {
    const { location = 'homepage', userType = 'guest', userId } = req.query;
    
    // Determine user type if userId is provided
    let finalUserType = userType;
    if (userId && userId !== 'guest') {
      // You can add logic here to determine user type based on user data
      finalUserType = 'user';
    }
    
    const context = {
      location,
      userType: finalUserType
    };
    
    // Get banners for this context
    const banners = await Banner.getBannersForContext(context);
    
    // Get event banners if any
    const activeEvents = await Event.getActiveEvents();
    const eventBanners = [];
    
    for (const event of activeEvents) {
      if (event.campaign.banners.length > 0) {
        const eventBannerList = await Banner.getEventBanners(event._id);
        eventBanners.push(...eventBannerList);
      }
    }
    
    // Combine and sort banners by priority
    const allBanners = [...banners, ...eventBanners]
      .sort((a, b) => {
        // Event banners get higher priority
        if (a.eventId && !b.eventId) return -1;
        if (!a.eventId && b.eventId) return 1;
        
        // Sort by priority and order
        if (a.displayRules?.priority !== b.displayRules?.priority) {
          return (b.displayRules?.priority || 1) - (a.displayRules?.priority || 1);
        }
        
        return (a.order || 0) - (b.order || 0);
      });
    
    // Remove duplicates
    const uniqueBanners = allBanners.filter((banner, index, self) => 
      index === self.findIndex(b => b._id.toString() === banner._id.toString())
    );
    
    res.json(uniqueBanners);
  } catch (error) {
    console.error('Error fetching context banners:', error);
    res.status(500).json({ message: 'Error fetching context banners' });
  }
});

// Record banner view (for analytics)
router.post('/banners/:id/view', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    await banner.recordView();
    
    res.json({ message: 'View recorded' });
  } catch (error) {
    console.error('Error recording banner view:', error);
    res.status(500).json({ message: 'Error recording view' });
  }
});

// Record banner click (for analytics)
router.post('/banners/:id/click', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    await banner.recordClick();
    
    res.json({ message: 'Click recorded' });
  } catch (error) {
    console.error('Error recording banner click:', error);
    res.status(500).json({ message: 'Error recording click' });
  }
});

module.exports = router;
