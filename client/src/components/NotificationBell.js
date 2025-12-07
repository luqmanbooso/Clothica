import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ArchiveBoxIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  TruckIcon,
  CreditCardIcon,
  SparklesIcon,
  InformationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    loading,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }

    setIsOpen(false);
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.isRead);
      case 'orders':
        return notifications.filter((n) => n.category === 'order');
      case 'payments':
        return notifications.filter((n) => n.category === 'payment');
      case 'promotions':
        return notifications.filter((n) => n.category === 'promotion');
      default:
        return notifications;
    }
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'unread':
        return unreadCount;
      case 'orders':
        return notifications.filter((n) => n.category === 'order').length;
      case 'payments':
        return notifications.filter((n) => n.category === 'payment').length;
      case 'promotions':
        return notifications.filter((n) => n.category === 'promotion').length;
      default:
        return notifications.length;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'order':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'payment':
        return <CreditCardIcon className="h-5 w-5 text-purple-500" />;
      case 'promotion':
        return <SparklesIcon className="h-5 w-5 text-pink-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title={`${unreadCount} unread notifications`}
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {process.env.NODE_ENV === 'development' && (
        <div className="absolute right-0 mt-2 w-64 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div>Notifications: {notifications.length}</div>
          <div>Unread: {unreadCount}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
        </div>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-800">
                  Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-gray-200 overflow-x-auto">
            {['all', 'unread', 'orders', 'payments', 'promotions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{getTabCount(tab)}</span>
              </button>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                      !notification.isRead ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 text-xl">{getNotificationIcon(notification.type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {notification.title}
                          </p>
                          <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">{notification.timeAgo}</span>

                          {notification.actionText && (
                            <span className="flex items-center text-xs text-blue-600 font-medium">
                              {notification.actionText}
                              <ArrowRightIcon className="h-4 w-4 ml-1" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Mark as read"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveNotification(notification._id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Archive"
                        >
                          <ArchiveBoxIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
