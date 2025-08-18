const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Create a new notification
  async createNotification(userId, notificationData) {
    try {
      const notification = new Notification({
        user: userId,
        ...notificationData
      });

      await notification.save();
      
      // Populate user info for real-time updates
      await notification.populate('user', 'name email');
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create order notification
  async createOrderNotification(userId, orderData) {
    const notificationData = {
      title: 'Order Update',
      message: `Your order #${orderData.orderId.toString().slice(-6)} has been ${orderData.status}`,
      type: 'order',
      category: 'order',
      priority: orderData.status === 'cancelled' ? 'high' : 'medium',
      actionUrl: `/orders/${orderData.orderId}`,
      actionText: 'View Order',
      metadata: {
        orderId: orderData.orderId.toString(),
        status: orderData.status,
        amount: orderData.amount
      }
    };

    return await this.createNotification(userId, notificationData);
  }

  // Create payment notification
  async createPaymentNotification(userId, paymentData) {
    const notificationData = {
      title: 'Payment Update',
      message: `Payment ${paymentData.status} for order #${paymentData.orderId}`,
      type: 'payment',
      category: 'payment',
      priority: paymentData.status === 'failed' ? 'high' : 'medium',
      actionUrl: `/orders/${paymentData.orderId}`,
      actionText: 'View Order',
      metadata: {
        orderId: paymentData.orderId,
        paymentId: paymentData.paymentId,
        status: paymentData.status,
        amount: paymentData.amount
      }
    };

    return await this.createNotification(userId, notificationData);
  }

  // Create stock notification
  async createStockNotification(userId, stockData) {
    const notificationData = {
      title: 'Stock Alert',
      message: `${stockData.productName} is running low on stock`,
      type: 'warning',
      category: 'inventory',
      priority: 'medium',
      actionUrl: `/products/${stockData.productId}`,
      actionText: 'View Product',
      metadata: {
        productId: stockData.productId,
        status: 'low_stock'
      }
    };

    return await this.createNotification(userId, notificationData);
  }

  // Create promotion notification
  async createPromotionNotification(userId, promotionData) {
    const notificationData = {
      title: 'Special Offer!',
      message: `${promotionData.title} - ${promotionData.description}`,
      type: 'promotion',
      category: 'promotion',
      priority: 'low',
      actionUrl: promotionData.url || '/promotions',
      actionText: 'Shop Now',
      metadata: {
        promotionId: promotionData.id,
        discount: promotionData.discount
      }
    };

    return await this.createNotification(userId, notificationData);
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        unreadOnly = false,
        type = null,
        category = null
      } = options;

      const query = { user: userId, isArchived: false };
      
      if (unreadOnly) {
        query.isRead = false;
      }
      
      if (type) {
        query.type = type;
      }
      
      if (category) {
        query.category = category;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('user', 'name email');

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasMore: page * limit < total
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
      );

      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Archive notification
  async archiveNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isArchived: true },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId
      });

      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        user: userId,
        isRead: false,
        isArchived: false
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Bulk create notifications (for system-wide announcements)
  async createBulkNotification(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        user: userId,
        ...notificationData
      }));

      const result = await Notification.insertMany(notifications);
      return result;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
