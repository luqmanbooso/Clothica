import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading] = useState(false);
  const [hasMore] = useState(false);
  const [currentPage] = useState(1);

  const fetchNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const fetchUnreadCount = () => setUnreadCount(0);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const archiveNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
  };

  const deleteNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const loadMore = () => {};
  const refreshNotifications = () => {};
  const getNotificationsByType = () => [];
  const getNotificationsByCategory = () => [];
  const getUnreadNotifications = () => notifications.filter((n) => !n.isRead);

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

