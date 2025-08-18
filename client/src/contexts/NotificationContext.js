import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await api.get(`/api/notifications?page=${page}&limit=20`);
      
      if (response.data.success) {
        const { notifications: newNotifications, hasMore: moreAvailable } = response.data.data;
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setHasMore(moreAvailable);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get('/api/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await api.put('/api/notifications/mark-all-read');
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Archive notification
  const archiveNotification = useCallback(async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/archive`);
      if (response.data.success) {
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        );
        
        // Update unread count if it was unread
        const archivedNotif = notifications.find(n => n._id === notificationId);
        if (archivedNotif && !archivedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  }, [notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await api.delete(`/api/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        );
        
        // Update unread count if it was unread
        const deletedNotif = notifications.find(n => n._id === notificationId);
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, fetchNotifications]);

  // Refresh notifications
  const refreshNotifications = useCallback(() => {
    fetchNotifications(1, false);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Filter notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notif => notif.type === type);
  }, [notifications]);

  // Filter notifications by category
  const getNotificationsByCategory = useCallback((category) => {
    return notifications.filter(notif => notif.category === category);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notif => !notif.isRead);
  }, [notifications]);

  // Initialize notifications when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications(1, false);
      fetchUnreadCount();
      
      // Create a welcome notification for new users (for testing)
      if (notifications.length === 0) {
        createWelcomeNotification();
      }
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [isAuthenticated, user, fetchNotifications, fetchUnreadCount, notifications.length]);

  // Create welcome notification
  const createWelcomeNotification = async () => {
    try {
      await api.post('/api/notifications/test', {
        title: 'Welcome to Clothica! 🎉',
        message: 'Thank you for joining us. Start exploring our amazing collection!',
        type: 'info',
        category: 'system'
      });
      
      // Refresh notifications
      fetchNotifications(1, false);
      fetchUnreadCount();
    } catch (error) {
      console.error('Error creating welcome notification:', error);
    }
  };

  // Set up polling for new notifications (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    hasMore,
    currentPage,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    loadMore,
    refreshNotifications,
    getNotificationsByType,
    getNotificationsByCategory,
    getUnreadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
