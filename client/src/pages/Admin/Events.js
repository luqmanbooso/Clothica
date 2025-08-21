import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  CalendarIcon,
  ChartBarIcon,
  PhotoIcon,
  TicketIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const Events = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [events, setEvents] = useState([]);
  const [banners, setBanners] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    type: 'promotional',
    description: '',
    startDate: '',
    endDate: '',
    priority: 1,
    budget: 0,
    expectedROI: 0,
    targetConversionRate: 0,
    campaign: {
      banners: [],
      discounts: [],
      products: {
        categories: [],
        tags: [],
        autoHighlight: true,
        seasonalPricing: false,
        inventoryOptimization: true
      }
    },
    inventory: {
      enableRestockAlerts: true,
      lowStockThreshold: 10,
      criticalStockThreshold: 5,
      autoReorder: false,
      reorderQuantity: 50
    },
    settings: {
      targetAudience: 'all',
      timeBasedDisplay: {
        enabled: false,
        startHour: 9,
        endHour: 21
      },
      userBehaviorTriggers: {
        enabled: false,
        triggers: []
      }
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bannerForm, setBannerForm] = useState({
    name: '',
    title: '',
    description: '',
    image: '',
    actionType: 'link',
    actionUrl: '',
    targetAudience: 'all',
    showOnPages: 'home',
    status: 'draft',
    priority: 1
  });

  const [discountForm, setDiscountForm] = useState({
    name: '',
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    targetUserGroups: ['all'],
    targetCategories: [],
    status: 'draft',
    isActive: true
  });

  // Fetch data
  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.get(`/api/events?page=${currentPage}&type=${filterType !== 'all' ? filterType : ''}&status=${filterStatus !== 'all' ? filterStatus : ''}&search=${searchTerm}`);
      setEvents(response.data.events);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching events:', error);
      showError('Failed to fetch events');
    }
  }, [currentPage, filterType, filterStatus, searchTerm, showError]);

  const fetchBanners = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/banners');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  }, []);

  const fetchDiscounts = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/unified-discounts');
      setDiscounts(response.data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  }, []);



  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEvents(),
        fetchBanners(),
        fetchDiscounts()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchEvents, fetchBanners, fetchDiscounts]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };



  const addBannerToCampaign = (bannerId) => {
    const banner = banners.find(b => b._id === bannerId);
    if (banner) {
      setFormData(prev => ({
        ...prev,
        campaign: {
          ...prev.campaign,
          banners: [...prev.campaign.banners, {
            bannerId: bannerId,
            displayMode: 'slideshow',
            priority: 1
          }]
        }
      }));
    }
  };

  const removeBannerFromCampaign = (index) => {
    setFormData(prev => ({
      ...prev,
      campaign: {
        ...prev.campaign,
        banners: prev.campaign.banners.filter((_, i) => i !== index)
      }
    }));
  };

  const addDiscountToCampaign = (discountId) => {
    const discount = discounts.find(d => d._id === discountId);
    if (discount) {
      setFormData(prev => ({
        ...prev,
        campaign: {
          ...prev.campaign,
          discounts: [...prev.campaign.discounts, {
            discountId: discountId,
            autoActivate: true,
            priority: 1
          }]
        }
      }));
    }
  };

  const removeDiscountFromCampaign = (index) => {
    setFormData(prev => ({
      ...prev,
      campaign: {
        ...prev.campaign,
        discounts: prev.campaign.discounts.filter((_, i) => i !== index)
      }
    }));
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/admin/banners', bannerForm);
      showSuccess('Banner created successfully');
      setShowBannerModal(false);
      setBannerForm({
        name: '',
        title: '',
        description: '',
        image: '',
        actionType: 'link',
        actionUrl: '',
        targetAudience: 'all',
        showOnPages: 'home',
        status: 'draft',
        priority: 1
      });
      fetchBanners();
    } catch (error) {
      console.error('Error creating banner:', error);
      showError('Failed to create banner');
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/admin/unified-discounts', discountForm);
      showSuccess('Discount created successfully');
      setShowDiscountModal(false);
      setDiscountForm({
        name: '',
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscount: 0,
        startDate: '',
        endDate: '',
        targetUserGroups: ['all'],
        targetCategories: [],
        status: 'draft',
        isActive: true
      });
      fetchDiscounts();
    } catch (error) {
      console.error('Error creating discount:', error);
      showError('Failed to create discount');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      showError('Please fix the validation errors');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingEvent) {
        await api.put(`/api/events/${editingEvent._id}`, formData);
        showSuccess('Campaign updated successfully! 🎉');
      } else {
        await api.post('/api/events', formData);
        showSuccess('Campaign created successfully! 🚀');
      }
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      showError('Failed to save campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = 'Priority must be between 1-10';
    }
    if (formData.budget < 0) newErrors.budget = 'Budget cannot be negative';
    if (formData.expectedROI < 0) newErrors.expectedROI = 'Expected ROI cannot be negative';
    if (formData.targetConversionRate < 0 || formData.targetConversionRate > 100) {
      newErrors.targetConversionRate = 'Conversion rate must be between 0-100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      type: event.type,
      description: event.description,
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      priority: event.priority,
             campaign: event.campaign || {
         banners: [],
         discounts: [],
         products: {
           categories: [],
           tags: [],
           autoHighlight: true,
           seasonalPricing: false,
           inventoryOptimization: true
         }
       },
      inventory: event.inventory || {
        enableRestockAlerts: true,
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        autoReorder: false,
        reorderQuantity: 50
      },
      settings: event.settings || {
        targetAudience: 'all',
        timeBasedDisplay: {
          enabled: false,
          startHour: 9,
          endHour: 21
        },
        userBehaviorTriggers: {
          enabled: false,
          triggers: []
        }
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/api/events/${eventId}`);
        showSuccess('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        showError('Failed to delete event');
      }
    }
  };

  const handleActivate = async (eventId) => {
    try {
      await api.post(`/api/events/${eventId}/activate`);
      showSuccess('Event activated successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error activating event:', error);
      showError('Failed to activate event');
    }
  };

  const handleDeactivate = async (eventId) => {
    try {
      await api.post(`/api/events/${eventId}/deactivate`);
      showSuccess('Event deactivated successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deactivating event:', error);
      showError('Failed to deactivate event');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'promotional',
      description: '',
      startDate: '',
      endDate: '',
      priority: 1,
      budget: 0,
      expectedROI: 0,
      targetConversionRate: 0,
      campaign: {
        banners: [],
        discounts: [],
        products: {
          categories: [],
          tags: [],
          autoHighlight: true,
          seasonalPricing: false,
          inventoryOptimization: true
        }
      },
      inventory: {
        enableRestockAlerts: true,
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        autoReorder: false,
        reorderQuantity: 50
      },
      settings: {
        targetAudience: 'all',
        timeBasedDisplay: {
          enabled: false,
          startHour: 9,
          endHour: 21
        },
        userBehaviorTriggers: {
          enabled: false,
          triggers: []
        }
      }
    });
    setEditingEvent(null);
    setErrors({});
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'seasonal':
        return <CalendarIcon className="h-5 w-5" />;
      case 'holiday':
        return <CalendarIcon className="h-5 w-5" />;
      case 'promotional':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'custom':
        return <CubeIcon className="h-5 w-5" />;
      default:
        return <CubeIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Campaigns</h1>
            <p className="mt-2 text-gray-600">Create and manage integrated marketing campaigns with banners, discounts, and product targeting</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Campaign Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900">
                {events.filter(e => e.isActive && e.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <PhotoIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Banners</p>
              <p className="text-2xl font-semibold text-gray-900">
                {banners.filter(b => b.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TicketIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Discounts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {discounts.filter(d => d.isActive && d.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CubeIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Targeted Products</p>
              <p className="text-2xl font-semibold text-gray-900">
                {events.reduce((total, event) => total + (event.campaign?.products?.categories?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="seasonal">Seasonal</option>
            <option value="holiday">Holiday</option>
            <option value="promotional">Promotional</option>
            <option value="custom">Custom</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Event Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#6C7A59] rounded-lg text-white">
                      {getTypeIcon(event.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">{event.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-4">{event.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <span>to</span>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(event.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Campaign Summary */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#6C7A59]">{event.campaign?.banners?.length || 0}</div>
                    <div className="text-xs text-gray-600">Banners</div>
                  </div>
                                     <div className="text-center">
                     <div className="text-2xl font-bold text-[#6C7A59]">{event.campaign?.discounts?.length || 0}</div>
                     <div className="text-xs text-gray-600">Discounts</div>
                   </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#6C7A59]">{event.campaign?.products?.categories?.length || 0}</div>
                    <div className="text-xs text-gray-600">Categories</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-[#6C7A59] hover:bg-[#6C7A59] hover:text-white rounded-lg transition-colors border border-[#6C7A59]"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  
                  {event.status === 'active' ? (
                    <button
                      onClick={() => handleDeactivate(event._id)}
                      className="px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                    >
                      <PauseIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(event._id)}
                      className="px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
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
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                 {/* Basic Information */}
                 <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                     Campaign Basics
                   </h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Campaign Name <span className="text-red-500">*</span>
                       </label>
                       <input
                         type="text"
                         name="name"
                         value={formData.name}
                         onChange={handleInputChange}
                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent transition-all ${
                           errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                         }`}
                         placeholder="Enter campaign name..."
                       />
                       {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                     </div>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Campaign Type <span className="text-red-500">*</span>
                       </label>
                       <select
                         name="type"
                         value={formData.type}
                         onChange={handleInputChange}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                       >
                         <option value="seasonal">🌱 Seasonal</option>
                         <option value="holiday">🎉 Holiday</option>
                         <option value="promotional">📈 Promotional</option>
                         <option value="custom">⚡ Custom</option>
                       </select>
                     </div>
                   </div>
                   
                   <div className="mt-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Description <span className="text-red-500">*</span>
                     </label>
                     <textarea
                       name="description"
                       value={formData.description}
                       onChange={handleInputChange}
                       rows={3}
                       className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent transition-all ${
                         errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                       }`}
                       placeholder="Describe your campaign goals and strategy..."
                     />
                     {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Start Date <span className="text-red-500">*</span>
                       </label>
                       <input
                         type="date"
                         name="startDate"
                         value={formData.startDate}
                         onChange={handleInputChange}
                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent transition-all ${
                           errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                         }`}
                       />
                       {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                     </div>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         End Date <span className="text-red-500">*</span>
                       </label>
                       <input
                         type="date"
                         name="endDate"
                         value={formData.endDate}
                         onChange={handleInputChange}
                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent transition-all ${
                           errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                         }`}
                       />
                       {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                     </div>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Priority Level <span className="text-red-500">*</span>
                       </label>
                       <input
                         type="number"
                         name="priority"
                         value={formData.priority}
                         onChange={handleInputChange}
                         min="1"
                         max="10"
                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent transition-all ${
                           errors.priority ? 'border-red-300 bg-red-50' : 'border-gray-300'
                         }`}
                       />
                       {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
                       <p className="mt-1 text-xs text-gray-500">1 = Low, 10 = High</p>
                     </div>
                   </div>
                 </div>

                 {/* Campaign Goals & Metrics */}
                 <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
                     Campaign Goals & Metrics
                   </h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Budget ($)</label>
                       <input
                         type="number"
                         name="budget"
                         value={formData.budget}
                         onChange={handleInputChange}
                         min="0"
                         step="0.01"
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                         placeholder="0.00"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Expected ROI (%)</label>
                       <input
                         type="number"
                         name="expectedROI"
                         value={formData.expectedROI}
                         onChange={handleInputChange}
                         min="0"
                         step="0.1"
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                         placeholder="0.0"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Target Conversion (%)</label>
                       <input
                         type="number"
                         name="targetConversionRate"
                         value={formData.targetConversionRate}
                         onChange={handleInputChange}
                         min="0"
                         max="100"
                         step="0.1"
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                         placeholder="0.0"
                       />
                     </div>
                   </div>
                 </div>

                {/* Campaign Configuration */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Configuration</h3>
                  
                  {/* Banners */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">Banners</label>
                      <button
                        type="button"
                        onClick={() => setShowBannerModal(true)}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        + Create New Banner
                      </button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <select
                        onChange={(e) => addBannerToCampaign(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      >
                        <option value="">Select Existing Banner</option>
                        {banners.map(banner => (
                          <option key={banner._id} value={banner._id}>{banner.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.campaign.banners.map((banner, index) => {
                        const bannerData = banners.find(b => b._id === banner.bannerId);
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <PhotoIcon className="h-5 w-5 text-gray-500" />
                            <span className="flex-1 text-sm">{bannerData?.name || 'Unknown Banner'}</span>
                            <button
                              type="button"
                              onClick={() => removeBannerFromCampaign(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Discounts */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">Discounts</label>
                      <button
                        type="button"
                        onClick={() => setShowDiscountModal(true)}
                        className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                      >
                        + Create New Discount
                      </button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <select
                        onChange={(e) => addDiscountToCampaign(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      >
                        <option value="">Select Existing Discount</option>
                        {discounts.map(discount => (
                          <option key={discount._id} value={discount._id}>{discount.name} ({discount.code})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.campaign.discounts.map((discount, index) => {
                        const discountData = discounts.find(d => d._id === discount.discountId);
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <TicketIcon className="h-5 w-5 text-gray-500" />
                            <span className="flex-1 text-sm">{discountData?.name || 'Unknown Discount'}</span>
                            <button
                              type="button"
                              onClick={() => removeDiscountFromCampaign(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Product Targeting */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Product Targeting</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Categories</label>
                        <input
                          type="text"
                          placeholder="e.g., summer, casual, formal"
                          value={formData.campaign.products.categories.join(', ')}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            campaign: {
                              ...prev.campaign,
                              products: {
                                ...prev.campaign.products,
                                categories: e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat)
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Tags</label>
                        <input
                          type="text"
                          placeholder="e.g., trending, new, sale"
                          value={formData.campaign.products.tags.join(', ')}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            campaign: {
                              ...prev.campaign,
                              products: {
                                ...prev.campaign.products,
                                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.campaign.products.autoHighlight}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            campaign: {
                              ...prev.campaign,
                              products: {
                                ...prev.campaign.products,
                                autoHighlight: e.target.checked
                              }
                            }
                          }))}
                          className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Auto-highlight targeted products</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.campaign.products.inventoryOptimization}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            campaign: {
                              ...prev.campaign,
                              products: {
                                ...prev.campaign.products,
                                inventoryOptimization: e.target.checked
                              }
                            }
                          }))}
                          className="rounded border-gray-300 text-[#6C7A59] focus:ring-[#6C7A59]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable inventory optimization</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] hover:from-[#5A6A4A] hover:to-[#4A5A3A] hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingEvent ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {editingEvent ? '🔄 Update Campaign' : '🚀 Create Campaign'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner Creation Modal */}
      <AnimatePresence>
        {showBannerModal && (
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
                <h2 className="text-2xl font-bold text-gray-900">Create New Banner</h2>
              </div>

              <form onSubmit={handleCreateBanner} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banner Name</label>
                    <input
                      type="text"
                      value={bannerForm.name}
                      onChange={(e) => setBannerForm({...bannerForm, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={bannerForm.description}
                    onChange={(e) => setBannerForm({...bannerForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={bannerForm.image}
                      onChange={(e) => setBannerForm({...bannerForm, image: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                    <select
                      value={bannerForm.actionType}
                      onChange={(e) => setBannerForm({...bannerForm, actionType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="link">Link</option>
                      <option value="product">Product</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <select
                      value={bannerForm.targetAudience}
                      onChange={(e) => setBannerForm({...bannerForm, targetAudience: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="new">New Users</option>
                      <option value="returning">Returning Users</option>
                      <option value="vip">VIP Users</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Show On Pages</label>
                    <select
                      value={bannerForm.showOnPages}
                      onChange={(e) => setBannerForm({...bannerForm, showOnPages: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="home">Home</option>
                      <option value="shop">Shop</option>
                      <option value="category">Category</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBannerModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors"
                  >
                    Create Banner
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discount Creation Modal */}
      <AnimatePresence>
        {showDiscountModal && (
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
                <h2 className="text-2xl font-bold text-gray-900">Create New Discount</h2>
              </div>

              <form onSubmit={handleCreateDiscount} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Name</label>
                    <input
                      type="text"
                      value={discountForm.name}
                      onChange={(e) => setDiscountForm({...discountForm, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                    <input
                      type="text"
                      value={discountForm.code}
                      onChange={(e) => setDiscountForm({...discountForm, code: e.target.value.toUpperCase()})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={discountForm.description}
                    onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select
                      value={discountForm.discountType}
                      onChange={(e) => setDiscountForm({...discountForm, discountType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                    <input
                      type="number"
                      value={discountForm.discountValue}
                      onChange={(e) => setDiscountForm({...discountForm, discountValue: parseFloat(e.target.value)})}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Amount</label>
                    <input
                      type="number"
                      value={discountForm.minOrderAmount}
                      onChange={(e) => setDiscountForm({...discountForm, minOrderAmount: parseFloat(e.target.value)})}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={discountForm.startDate}
                      onChange={(e) => setDiscountForm({...discountForm, startDate: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={discountForm.endDate}
                      onChange={(e) => setDiscountForm({...discountForm, endDate: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDiscountModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors"
                  >
                    Create Discount
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
