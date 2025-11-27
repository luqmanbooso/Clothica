import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  CalendarIcon,
  TagIcon,
  SparklesIcon,
  FireIcon,
  GiftIcon,
  StarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const EventsPromotions = () => {
  const [events, setEvents] = useState([]);
  const [banners, setBanners] = useState([]);
  const [spinWheels, setSpinWheels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const { showSuccess, showError } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsRes, bannersRes, spinWheelsRes, analyticsRes] = await Promise.all([
        api.get('/api/admin/events'),
        api.get('/api/admin/banners'),
        api.get('/api/admin/spin-wheels'),
        api.get('/api/promotions/admin/analytics')
      ]);

      setEvents(eventsRes.data.data || []);
      setBanners(bannersRes.data.data || []);
      setSpinWheels(spinWheelsRes.data.data || []);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load events and promotions data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleCreateEvent = async (eventData) => {
    try {
      const response = await api.post('/api/promotions/admin/events', eventData);
      setEvents([response.data.data, ...events]);
      setShowCreateModal(false);
      showSuccess('Event created successfully');
    } catch (error) {
      console.error('Error creating event:', error);
      showError('Failed to create event');
    }
  };

  const handleToggleEventStatus = async (eventId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await api.put(`/api/admin/events/${eventId}/status`, { status: newStatus });
      
      setEvents(events.map(event => 
        event._id === eventId ? { ...event, status: newStatus } : event
      ));
      
      showSuccess(`Event ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
    } catch (error) {
      console.error('Error toggling event status:', error);
      showError('Failed to update event status');
    }
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      flash_sale: FireIcon,
      seasonal: SparklesIcon,
      holiday: GiftIcon,
      loyalty_boost: StarIcon,
      promotional: TagIcon,
      custom: CalendarIcon
    };
    return icons[type] || CalendarIcon;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.draft;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Events & Promotions</h1>
              <p className="text-gray-600">Manage promotional campaigns, events, and marketing activities</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-md"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Event
            </button>
          </div>
        </motion.div>

        {/* Analytics Overview */}
        {analytics && (
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.events?.totalEvents || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rs. {(analytics.events?.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Banner Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.banners?.totalClicks || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <EyeIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Spin Wheels</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.spinWheels?.totalSpins || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div className="mb-6" variants={itemVariants}>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'events', name: 'Events', icon: CalendarIcon },
                { id: 'banners', name: 'Banners', icon: TagIcon },
                { id: 'spinwheels', name: 'Spin Wheels', icon: SparklesIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[#6C7A59] text-[#6C7A59]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div variants={itemVariants}>
          {activeTab === 'events' && (
            <div className="space-y-6">
              {events.map((event) => {
                const EventIcon = getEventTypeIcon(event.type);
                return (
                  <div key={event._id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-xl flex items-center justify-center`}>
                          <EventIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                          <p className="text-gray-600">{event.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <button
                          onClick={() => handleToggleEventStatus(event._id, event.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            event.status === 'active' 
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {event.status === 'active' ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                        </button>
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Start Date</div>
                        <div className="font-medium">{new Date(event.startDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">End Date</div>
                        <div className="font-medium">{new Date(event.endDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Views</div>
                        <div className="font-medium">{event.performance?.views || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Revenue</div>
                        <div className="font-medium">Rs. {(event.performance?.revenue || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Components */}
                    <div className="flex flex-wrap gap-2">
                      {event.components?.banners?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {event.components.banners.length} Banner{event.components.banners.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {event.components?.discounts?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {event.components.discounts.length} Discount{event.components.discounts.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {event.components?.spinWheel?.enabled && (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          Spin Wheel
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <div key={banner._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {banner.image && (
                    <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${banner.image})` }} />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{banner.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{banner.title}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Position</div>
                        <div className="font-medium capitalize">{banner.position}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Clicks</div>
                        <div className="font-medium">{banner.analytics?.clicks || 0}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit Banner
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'spinwheels' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spinWheels.map((wheel) => (
                <div key={wheel._id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <SparklesIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{wheel.name}</h3>
                        <p className="text-sm text-gray-600">{wheel.title}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      wheel.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {wheel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Total Spins</div>
                      <div className="text-xl font-bold text-gray-900">{wheel.analytics?.totalSpins || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Rewards Given</div>
                      <div className="text-xl font-bold text-gray-900">{wheel.analytics?.rewardsGiven || 0}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    {wheel.segments?.length || 0} segments configured
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit Wheel
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
      />
    </motion.div>
  );
};

// Create Event Modal Component
const CreateEventModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'promotional',
    description: '',
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    priority: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      type: 'promotional',
      description: '',
      startDate: '',
      endDate: '',
      targetAudience: 'all',
      priority: 1
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                >
                  <option value="promotional">Promotional</option>
                  <option value="flash_sale">Flash Sale</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="holiday">Holiday</option>
                  <option value="loyalty_boost">Loyalty Boost</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="new_users">New Users</option>
                  <option value="returning">Returning Users</option>
                  <option value="vip">VIP Members</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventsPromotions;
