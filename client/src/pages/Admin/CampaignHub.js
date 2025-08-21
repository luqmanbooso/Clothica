import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, PencilIcon, TrashIcon, PlayIcon, PauseIcon, 
  CalendarIcon, ChartBarIcon, PhotoIcon, TicketIcon, 
  CubeIcon, StarIcon, GiftIcon, SparklesIcon, FireIcon, 
  UsersIcon, CurrencyDollarIcon, EyeIcon, ClockIcon,
  CheckCircleIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const CampaignHub = () => {
  const { success: showSuccess, error: showError } = useToast();
  
  // State Management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Event Form State
  const [eventForm, setEventForm] = useState({
    name: '',
    type: 'promotional',
    description: '',
    startDate: '',
    endDate: '',
    priority: 1,
    targetAudience: 'all',
    status: 'draft'
  });

  // Fetch Events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/events');
      setEvents(response.data.events || response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      showError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Initialize
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle Event Status Change
  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await api.put(`/api/admin/events/${eventId}/status`, { status: newStatus });
      showSuccess(`Event ${newStatus} successfully`);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
      showError('Failed to update event status');
    }
  };

  // Handle Event Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/api/admin/events/${editingEvent._id}`, eventForm);
        showSuccess('Event updated successfully! 🎉');
      } else {
        await api.post('/api/admin/events', eventForm);
        showSuccess('Event created successfully! 🚀');
      }
      setShowEventModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      showError('Failed to save event');
    }
  };

  // Reset Form
  const resetForm = () => {
    setEventForm({
      name: '',
      type: 'promotional',
      description: '',
      startDate: '',
      endDate: '',
      priority: 1,
      targetAudience: 'all',
      status: 'draft'
    });
    setEditingEvent(null);
  };

  // Handle Edit
  const handleEdit = (event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name || '',
      type: event.type || 'promotional',
      description: event.description || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      priority: event.priority || 1,
      targetAudience: event.targetAudience || 'all',
      status: event.status || 'draft'
    });
    setShowEventModal(true);
  };

  // Handle Delete
  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/api/admin/events/${eventId}`);
        showSuccess('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        showError('Failed to delete event');
      }
    }
  };

  // Get Status Color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get Type Icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'seasonal': return <CalendarIcon className="h-5 w-5" />;
      case 'holiday': return <StarIcon className="h-5 w-5" />;
      case 'promotional': return <FireIcon className="h-5 w-5" />;
      case 'flash_sale': return <SparklesIcon className="h-5 w-5" />;
      case 'loyalty_boost': return <GiftIcon className="h-5 w-5" />;
      default: return <CubeIcon className="h-5 w-5" />;
    }
  };

  // Calculate Event Stats
  const eventStats = {
    total: events.length,
    active: events.filter(e => e.status === 'active').length,
    draft: events.filter(e => e.status === 'draft').length,
    completed: events.filter(e => e.status === 'completed').length
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🎯 Event-Driven Campaign Hub
      </h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{eventStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CubeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-green-600">{eventStats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft Events</p>
              <p className="text-2xl font-bold text-gray-600">{eventStats.draft}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-purple-600">{eventStats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Campaign Events</h2>
            <p className="text-gray-600">Manage your event-driven campaigns with ads, discounts, and special offers</p>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowEventModal(true);
            }}
            className="flex items-center px-6 py-3 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59] mx-auto"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600">Create your first event to start managing campaigns</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Event Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getTypeIcon(event.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{event.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                {/* Event Dates */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(event.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Component Counts */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <PhotoIcon className="h-4 w-4" />
                    <span>{event.components?.banners?.length || 0} Banners</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TicketIcon className="h-4 w-4" />
                    <span>{event.components?.discounts?.length || 0} Discounts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GiftIcon className="h-4 w-4" />
                    <span>{event.components?.specialOffers?.length || 0} Offers</span>
                  </div>
                </div>
              </div>

              {/* Event Actions */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Priority:</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                      {event.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Target:</span>
                    <span className="px-2 py-1 bg-blue-100 rounded text-sm font-medium capitalize">
                      {event.targetAudience.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {event.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(event._id, 'active')}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Activate
                    </button>
                  )}
                  
                  {event.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(event._id, 'paused')}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      <PauseIcon className="h-4 w-4 mr-1" />
                      Pause
                    </button>
                  )}
                  
                  {event.status === 'paused' && (
                    <button
                      onClick={() => handleStatusChange(event._id, 'active')}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Resume
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEdit(event)}
                    className="px-3 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors text-sm"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eventForm.name}
                      onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter event name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="promotional">Promotional</option>
                      <option value="seasonal">Seasonal</option>
                      <option value="holiday">Holiday</option>
                      <option value="flash_sale">Flash Sale</option>
                      <option value="loyalty_boost">Loyalty Boost</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Describe your event..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={eventForm.priority}
                      onChange={(e) => setEventForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value={1}>1 - Highest</option>
                      <option value={2}>2 - High</option>
                      <option value={3}>3 - Medium</option>
                      <option value={4}>4 - Low</option>
                      <option value={5}>5 - Lowest</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={eventForm.targetAudience}
                      onChange={(e) => setEventForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="new_users">New Users</option>
                      <option value="returning">Returning Users</option>
                      <option value="vip">VIP Users</option>
                      <option value="specific">Specific Segments</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-8 py-3 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-md"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CampaignHub;
