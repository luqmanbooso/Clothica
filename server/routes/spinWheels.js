const express = require('express');
const router = express.Router();
const SpinWheel = require('../models/SpinWheel');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Get all spin wheels (admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, eventId, status, search } = req.query;
    
    const query = {};
    
    if (eventId && eventId !== 'all') query.eventId = eventId;
    if (status && status !== 'all') {
      if (status === 'active') query.isActive = true;
      else if (status === 'inactive') query.isActive = false;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [spinWheels, total] = await Promise.all([
      SpinWheel.find(query)
        .populate('eventId', 'name status')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SpinWheel.countDocuments(query)
    ]);

    res.json({
      spinWheels,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSpinWheels: total,
        hasNextPage: skip + spinWheels.length < total,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching spin wheels:', error);
    res.status(500).json({ message: 'Error fetching spin wheels' });
  }
});

// Get single spin wheel
router.get('/:id', async (req, res) => {
  try {
    const spinWheel = await SpinWheel.findById(req.params.id)
      .populate('eventId', 'name status')
      .populate('createdBy', 'name email');
    
    if (!spinWheel) {
      return res.status(404).json({ message: 'Spin wheel not found' });
    }
    
    res.json(spinWheel);
  } catch (error) {
    console.error('Error fetching spin wheel:', error);
    res.status(500).json({ message: 'Error fetching spin wheel' });
  }
});

// Create new spin wheel (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const spinWheelData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const spinWheel = new SpinWheel(spinWheelData);
    await spinWheel.save();
    
    res.status(201).json(spinWheel);
  } catch (error) {
    console.error('Error creating spin wheel:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating spin wheel' });
  }
});

// Update spin wheel (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const spinWheelData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };
    
    const spinWheel = await SpinWheel.findByIdAndUpdate(
      req.params.id,
      spinWheelData,
      { new: true, runValidators: true }
    );
    
    if (!spinWheel) {
      return res.status(404).json({ message: 'Spin wheel not found' });
    }
    
    res.json(spinWheel);
  } catch (error) {
    console.error('Error updating spin wheel:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating spin wheel' });
  }
});

// Delete spin wheel (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const spinWheel = await SpinWheel.findByIdAndDelete(req.params.id);
    
    if (!spinWheel) {
      return res.status(404).json({ message: 'Spin wheel not found' });
    }
    
    res.json({ message: 'Spin wheel deleted successfully' });
  } catch (error) {
    console.error('Error deleting spin wheel:', error);
    res.status(500).json({ message: 'Error deleting spin wheel' });
  }
});

// Toggle spin wheel status (admin only)
router.patch('/:id/toggle', auth, admin, async (req, res) => {
  try {
    const spinWheel = await SpinWheel.findById(req.params.id);
    
    if (!spinWheel) {
      return res.status(404).json({ message: 'Spin wheel not found' });
    }
    
    spinWheel.isActive = !spinWheel.isActive;
    await spinWheel.save();
    
    res.json(spinWheel);
  } catch (error) {
    console.error('Error toggling spin wheel status:', error);
    res.status(500).json({ message: 'Error toggling spin wheel status' });
  }
});

// Record spin (public)
router.post('/:id/spin', async (req, res) => {
  try {
    const { userId } = req.body;
    const spinWheel = await SpinWheel.findById(req.params.id);
    
    if (!spinWheel) {
      return res.status(404).json({ message: 'Spin wheel not found' });
    }
    
    if (!spinWheel.isValid) {
      return res.status(400).json({ message: 'Spin wheel is not active' });
    }
    
    await spinWheel.recordSpin(userId);
    
    // Get random segment based on probability
    const result = spinWheel.getRandomSegment();
    
    res.json({
      message: 'Spin recorded successfully',
      result,
      spinWheel: {
        id: spinWheel._id,
        name: spinWheel.name,
        analytics: spinWheel.analytics
      }
    });
  } catch (error) {
    console.error('Error recording spin:', error);
    res.status(500).json({ message: 'Error recording spin' });
  }
});

// Get spin wheel analytics (admin only)
router.get('/:id/analytics', auth, admin, async (req, res) => {
  try {
    const spinWheel = await SpinWheel.findById(req.params.id);
    
    if (!spinWheel) {
      return res.status(404).json({ message: 'Spin wheel not found' });
    }
    
    const analytics = {
      spinWheelId: spinWheel._id,
      name: spinWheel.name,
      eventId: spinWheel.eventId,
      analytics: spinWheel.analytics,
      isValid: spinWheel.isValid,
      segments: spinWheel.segments
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching spin wheel analytics:', error);
    res.status(500).json({ message: 'Error fetching spin wheel analytics' });
  }
});

module.exports = router;
