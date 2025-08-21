const express = require('express');
const { auth, admin } = require('../middleware/auth');
const EventPerformanceService = require('../services/eventPerformanceService');

const router = express.Router();

// Track event performance (overall)
router.post('/track/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { metricType, value, userId } = req.body;
    
    if (!metricType) {
      return res.status(400).json({ message: 'Metric type is required' });
    }
    
    const result = await EventPerformanceService.trackEventPerformance(
      eventId, 
      metricType, 
      value || 1, 
      userId || req.user._id
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error tracking event performance:', error);
    res.status(500).json({ message: 'Failed to track performance' });
  }
});

// Track component performance
router.post('/track/:eventId/component/:componentType/:componentId', auth, async (req, res) => {
  try {
    const { eventId, componentType, componentId } = req.params;
    const { metricType, value, userId } = req.body;
    
    if (!metricType) {
      return res.status(400).json({ message: 'Metric type is required' });
    }
    
    const result = await EventPerformanceService.trackComponentPerformance(
      eventId,
      componentType,
      componentId,
      metricType,
      value || 1,
      userId || req.user._id
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error tracking component performance:', error);
    res.status(500).json({ message: 'Failed to track component performance' });
  }
});

// Get event analytics
router.get('/analytics/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const analytics = await EventPerformanceService.getEventAnalytics(eventId);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting event analytics:', error);
    res.status(500).json({ message: 'Failed to get analytics' });
  }
});

// Compare multiple events
router.post('/compare', auth, async (req, res) => {
  try {
    const { eventIds } = req.body;
    
    if (!eventIds || !Array.isArray(eventIds) || eventIds.length < 2) {
      return res.status(400).json({ message: 'At least 2 event IDs are required' });
    }
    
    const comparison = await EventPerformanceService.compareEvents(eventIds);
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing events:', error);
    res.status(500).json({ message: 'Failed to compare events' });
  }
});

// Get real-time performance
router.get('/realtime/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const liveData = await EventPerformanceService.getRealTimePerformance(eventId);
    res.json(liveData);
  } catch (error) {
    console.error('Error getting real-time performance:', error);
    res.status(500).json({ message: 'Failed to get real-time data' });
  }
});

// Generate performance report
router.post('/report/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const report = await EventPerformanceService.generatePerformanceReport(
      eventId,
      new Date(startDate),
      new Date(endDate)
    );
    
    res.json(report);
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Get performance summary for dashboard
router.get('/summary', auth, async (req, res) => {
  try {
    const { eventIds } = req.query;
    
    if (!eventIds) {
      return res.status(400).json({ message: 'Event IDs are required' });
    }
    
    const eventIdArray = eventIds.split(',');
    const summary = await EventPerformanceService.compareEvents(eventIdArray);
    
    res.json({
      totalEvents: summary.length,
      totalViews: summary.reduce((sum, event) => sum + event.performance.totalViews, 0),
      totalClicks: summary.reduce((sum, event) => sum + event.performance.totalClicks, 0),
      totalConversions: summary.reduce((sum, event) => sum + event.performance.totalConversions, 0),
      totalRevenue: summary.reduce((sum, event) => sum + event.performance.totalRevenue, 0),
      events: summary
    });
  } catch (error) {
    console.error('Error getting performance summary:', error);
    res.status(500).json({ message: 'Failed to get summary' });
  }
});

module.exports = router;
