const express = require('express');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const notificationService = require('../services/notificationService');

const router = express.Router();

// ========================================
// GET NOTIFICATIONS
// ========================================

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly, type, category } = req.query;
    
    const result = await notificationService.getUserNotifications(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      type,
      category
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

// ========================================
// UPDATE NOTIFICATIONS
// ========================================

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    
    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// ========================================
// MANAGE NOTIFICATIONS
// ========================================

// Archive notification
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const notification = await notificationService.archiveNotification(req.params.id, req.user.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error archiving notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive notification'
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await notificationService.deleteNotification(req.params.id, req.user.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: { message: 'Notification deleted successfully' }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// ========================================
// ADMIN NOTIFICATIONS
// ========================================

// Create system-wide notification (admin only)
router.post('/admin/broadcast', auth, admin, async (req, res) => {
  try {
    const { title, message, type, category, priority, actionUrl, actionText, userIds } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    let targetUserIds = userIds;
    
    // If no specific users, send to all users
    if (!userIds || userIds.length === 0) {
      const User = require('../models/User');
      const users = await User.find({}, '_id');
      targetUserIds = users.map(user => user._id);
    }

    const notificationData = {
      title,
      message,
      type: type || 'info',
      category: category || 'system',
      priority: priority || 'medium',
      actionUrl,
      actionText
    };

    const notifications = await notificationService.createBulkNotification(targetUserIds, notificationData);
    
    res.json({
      success: true,
      data: {
        message: `Notification sent to ${notifications.length} users`,
        count: notifications.length
      }
    });
  } catch (error) {
    console.error('Error creating broadcast notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create broadcast notification'
    });
  }
});

// Create test notification (for debugging)
router.post('/test', auth, async (req, res) => {
  try {
    const { title, message, type = 'info', category = 'system' } = req.body;
    
    const notification = await notificationService.createNotification(req.user.id, {
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      type,
      category,
      priority: 'medium',
      actionUrl: '/test',
      actionText: 'Test Action'
    });

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification'
    });
  }
});

// Get system statistics (admin only)
router.get('/admin/stats', auth, admin, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$isArchived', true] }, 1, 0] } }
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Notification.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, unread: 0, archived: 0 },
        byType: typeStats,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics'
    });
  }
});

module.exports = router;
