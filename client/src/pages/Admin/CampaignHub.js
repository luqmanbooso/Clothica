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
  CubeIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  GiftIcon,
  StarIcon,
  CheckCircleIcon,
  CogIcon,
  InformationCircleIcon,
  ArrowRightIcon
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
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Data for dynamic selection
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Component Creation States
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showSpinWheelModal, setShowSpinWheelModal] = useState(false);
  
  // Component Management States
  const [editingBanner, setEditingBanner] = useState(null);
  const [showBannerEditModal, setShowBannerEditModal] = useState(false);
  const [showBannerDeleteModal, setShowBannerDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  
  // Discount Management States
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [showDiscountEditModal, setShowDiscountEditModal] = useState(false);
  const [showDiscountDeleteModal, setShowDiscountDeleteModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);
  
  // Offer Management States
  const [editingOffer, setEditingOffer] = useState(null);
  const [showOfferEditModal, setShowOfferEditModal] = useState(false);
  const [showOfferDeleteModal, setShowOfferDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  
  // Spin Wheel Management States
  const [editingSpinWheel, setEditingSpinWheel] = useState(null);
  const [showSpinWheelEditModal, setShowSpinWheelEditModal] = useState(false);
  const [showSpinWheelDeleteModal, setShowSpinWheelDeleteModal] = useState(false);
  const [spinWheelToDelete, setSpinWheelToDelete] = useState(null);
  
  // Component Form States
  const [bannerForm, setBannerForm] = useState({
    name: '',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    imageFile: null,
    bannerType: 'image', // 'image' or 'text'
    textContent: {
      mainText: '',
      subText: '',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontSize: '2xl',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    position: 'hero',
    priority: 1,
    cta: { text: 'Shop Now', link: '', action: 'navigate', target: '_self' },
    startDate: '',
    endDate: '',
    isActive: true,
    displayRules: {
      showOnPages: ['all'],
      targetAudience: ['all'],
      timeBased: { enabled: false, startHour: 9, endHour: 21 }
    }
  });
  
  const [discountForm, setDiscountForm] = useState({
    name: '',
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    maxUses: -1,
    maxUsesPerUser: 1,
    applicableCategories: [],
    isActive: true
  });
  
  const [offerForm, setOfferForm] = useState({
    name: '',
    title: '',
    description: '',
    type: 'flash_sale',
    offerValue: '',
    applicableProducts: [],
    applicableCategories: [],
    isActive: true
  });
  
  const [spinWheelForm, setSpinWheelForm] = useState({
    name: '',
    title: '',
    description: '',
    maxSpinsPerUser: 1,
    cooldownHours: 24,
    segments: [
      { name: '10% Off', probability: 25, reward: '10% discount' },
      { name: 'Free Shipping', probability: 25, reward: 'Free shipping' },
      { name: '5% Off', probability: 25, reward: '5% discount' },
      { name: 'Try Again', probability: 25, reward: 'No reward' }
    ],
    isActive: true
  });
  
  // Event Form State - Updated to match new Event model
  const [eventForm, setEventForm] = useState({
      name: '',
    type: 'promotional',
      description: '',
      startDate: '',
      endDate: '',
      priority: 1,
      targetAudience: 'all',
      status: 'draft',
    components: {
      banners: [],
      discounts: [],
      specialOffers: [],
      spinWheel: { enabled: false, wheelId: null }
    },
    rules: {
      minOrderAmount: 0,
      maxDiscount: 0,
      userGroups: [],
      productCategories: [],
      excludedProducts: []
    }
  });

  // Fetch Events with proper API endpoint
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

  // Fetch Products and Categories for dynamic selection
  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/products?limit=100');
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchEvents();
    fetchProducts();
    fetchCategories();
  }, [fetchEvents, fetchProducts, fetchCategories]);

  // Handle Event Status Change - Updated to use new Event methods
  const handleStatusChange = async (eventId, action) => {
    try {
      const event = events.find(e => e._id === eventId);
      
      // Validate that event has essential components before activation
      if (action === 'activate') {
        const hasBanners = event.components?.banners?.length > 0;
        const hasDiscounts = event.components?.discounts?.length > 0;
        const hasOffers = event.components?.specialOffers?.length > 0;
        
        if (!hasBanners && !hasDiscounts && !hasOffers) {
          showError('Events must have at least one banner, discount, or special offer before activation. Please add components first.');
          return;
        }
        
        // Show warning if missing some components
        if (!hasBanners || !hasDiscounts || !hasOffers) {
          const missingComponents = [];
          if (!hasBanners) missingComponents.push('banners');
          if (!hasDiscounts) missingComponents.push('discounts');
          if (!hasOffers) missingComponents.push('special offers');
          
          if (!window.confirm(
            `Event will be activated but is missing: ${missingComponents.join(', ')}. ` +
            'For best results, we recommend adding all three component types. Continue anyway?'
          )) {
            return;
          }
        }
      }
      
      const response = await api.post(`/api/admin/events/${eventId}/status`, { action });
      
      if (response.data.success) {
        showSuccess(`Event ${action === 'activate' ? 'activated' : 'deactivated'} successfully!`);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error changing event status:', error);
      showError('Failed to change event status: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle Event Submit - Updated to include components
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

  // Reset Form - Updated to include components
  const resetForm = () => {
    setEventForm({
        name: '', 
      type: 'promotional',
        description: '', 
      startDate: '',
      endDate: '',
      priority: 1,
      targetAudience: 'all',
      status: 'draft',
        components: {
        banners: [],
        discounts: [],
        specialOffers: [],
        spinWheel: { enabled: false, wheelId: null }
      },
      rules: {
        minOrderAmount: 0,
        maxDiscount: 0,
        userGroups: [],
        productCategories: [],
        excludedProducts: []
      }
    });
    setEditingEvent(null);
  };

  // Handle Edit - Updated to include components
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
      status: event.status || 'draft',
      components: event.components || {
        banners: [],
        discounts: [],
        specialOffers: [],
        spinWheel: { enabled: false, wheelId: null }
      },
      rules: event.rules || {
        minOrderAmount: 0,
        maxDiscount: 0,
        userGroups: [],
        productCategories: [],
        excludedProducts: []
      }
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

  // Open Component Management
  const openComponentManagement = (event) => {
    if (!event) {
      showError('No event selected for component management');
      return;
    }
    setSelectedEvent(event);
    setShowComponentModal(true);
  };

  // Component Creation Functions
  const handleCreateBanner = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields based on banner type
      if (!bannerForm.name || !bannerForm.title) {
        showError('Please fill in banner name and title');
        return;
      }

      if (bannerForm.bannerType === 'image' && !bannerForm.image && !bannerForm.imageFile) {
        showError('Please upload an image or provide image URL for image banners');
        return;
      }

      if (bannerForm.bannerType === 'text' && !bannerForm.textContent.mainText) {
        showError('Please enter main text content for text banners');
        return;
      }

      let imageUrl = bannerForm.image;
      
      // Handle file upload if imageFile exists
      if (bannerForm.imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', bannerForm.imageFile);
          
          // Upload image first using the correct endpoint
          const uploadResponse = await api.post('/api/admin/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          imageUrl = uploadResponse.data.imageUrl;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          showError('Failed to upload image: ' + (uploadError.response?.data?.message || uploadError.message));
      return;
    }
      }

      const bannerData = {
        name: bannerForm.name,
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        description: bannerForm.description,
        bannerType: bannerForm.bannerType,
        image: bannerForm.bannerType === 'image' ? imageUrl : null,
        textContent: bannerForm.bannerType === 'text' ? bannerForm.textContent : null,
        position: bannerForm.position,
        priority: bannerForm.priority,
        cta: bannerForm.cta,
        startDate: selectedEvent.startDate, // Auto-assign from event
        endDate: selectedEvent.endDate, // Auto-assign from event
        isActive: bannerForm.isActive,
        displayRules: bannerForm.displayRules,
        eventId: selectedEvent._id
        // createdBy will be handled by the backend
      };
      
      const response = await api.post('/api/admin/banners', bannerData);
      
      // Update the event's components
      const updatedEvent = { ...selectedEvent };
      if (!updatedEvent.components) updatedEvent.components = {};
      if (!updatedEvent.components.banners) updatedEvent.components.banners = [];
      
      updatedEvent.components.banners.push({
        bannerId: response.data._id,
        displayMode: 'hero',
        priority: bannerForm.priority
      });
      
      // Update event in backend - only send the components that changed
      await api.put(`/api/admin/events/${selectedEvent._id}`, {
        components: updatedEvent.components
      });
      
      showSuccess('Banner created and linked to event successfully!');
      setShowBannerModal(false);
      resetBannerForm();
      fetchEvents(); // Refresh events to show new component
    } catch (error) {
      console.error('Error creating banner:', error);
      showError('Failed to create banner: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    try {
      // Enhanced validation
      if (!discountForm.name || !discountForm.code || discountForm.value <= 0) {
        showError('Please fill in all required fields and set a valid discount value');
        return;
      }

      if (discountForm.code.length < 3) {
        showError('Discount code must be at least 3 characters long');
        return;
      }

      if (discountForm.value > 100 && discountForm.type === 'percentage') {
        showError('Percentage discount cannot exceed 100%');
        return;
      }

      const discountData = {
        name: discountForm.name,
        code: discountForm.code,
        description: discountForm.description,
        type: discountForm.type,
        value: discountForm.value,
        minOrderAmount: discountForm.minOrderAmount,
        maxDiscountAmount: discountForm.maxDiscountAmount,
        maxUses: discountForm.maxUses,
        maxUsesPerUser: discountForm.maxUsesPerUser,
        startDate: selectedEvent.startDate, // Auto-assign from event
        endDate: selectedEvent.endDate, // Auto-assign from event
        applicableCategories: discountForm.applicableCategories,
        isActive: discountForm.isActive,
        eventId: selectedEvent._id
        // createdBy will be handled by the backend
      };
      
      const response = await api.post('/api/admin/unified-discounts', discountData);
      
      // Update the event's components
      const updatedEvent = { ...selectedEvent };
      if (!updatedEvent.components) updatedEvent.components = {};
      if (!updatedEvent.components.discounts) updatedEvent.components.discounts = [];
      
      updatedEvent.components.discounts.push({
        discountId: response.data._id,
        priority: 1
      });
      
      // Update event in backend - only send the components that changed
      await api.put(`/api/admin/events/${selectedEvent._id}`, {
        components: updatedEvent.components
      });
      
      showSuccess('Discount created and linked to event successfully!');
      setShowDiscountModal(false);
      resetDiscountForm();
      fetchEvents(); // Refresh events to show new component
    } catch (error) {
      console.error('Error creating discount:', error);
      showError('Failed to create discount: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      // Enhanced validation
      if (!offerForm.name || !offerForm.title || !offerForm.offerValue) {
        showError('Please fill in all required fields');
        return;
      }

      if (offerForm.name.length < 3) {
        showError('Offer name must be at least 3 characters long');
        return;
      }

      if (offerForm.offerValue.length < 5) {
        showError('Offer value description must be at least 5 characters long');
        return;
      }

      const offerData = {
        name: offerForm.name,
        title: offerForm.title,
        description: offerForm.description,
        type: offerForm.type,
        offerValue: offerForm.offerValue,
        applicableProducts: offerForm.applicableProducts,
        applicableCategories: offerForm.applicableCategories,
        startDate: selectedEvent.startDate, // Auto-assign from event
        endDate: selectedEvent.endDate, // Auto-assign from event
        isActive: offerForm.isActive,
        eventId: selectedEvent._id
        // createdBy will be handled by the backend
      };
      
      const response = await api.post('/api/admin/special-offers', offerData);
      
      // Update the event's components
      const updatedEvent = { ...selectedEvent };
      if (!updatedEvent.components) updatedEvent.components = {};
      if (!updatedEvent.components.specialOffers) updatedEvent.components.specialOffers = [];
      
      updatedEvent.components.specialOffers.push({
        offerId: response.data._id,
        priority: 1
      });
      
      // Update event in backend - only send the components that changed
      await api.put(`/api/admin/events/${selectedEvent._id}`, {
        components: updatedEvent.components
      });
      
      showSuccess('Special offer created and linked to event successfully!');
      setShowOfferModal(false);
      resetOfferForm();
      fetchEvents(); // Refresh events to show new component
    } catch (error) {
      console.error('Error creating special offer:', error);
      showError('Failed to create special offer: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateSpinWheel = async (e) => {
    e.preventDefault();
    try {
      // Enhanced validation
      if (!spinWheelForm.name || !spinWheelForm.title) {
        showError('Please fill in all required fields');
        return;
      }

      if (spinWheelForm.name.length < 3) {
        showError('Spin wheel name must be at least 3 characters long');
        return;
      }

      if (spinWheelForm.segments.length < 2) {
        showError('Spin wheel must have at least 2 segments');
        return;
      }

      // Validate segment probabilities add up to 100%
      const totalProbability = spinWheelForm.segments.reduce((sum, segment) => sum + segment.probability, 0);
      if (Math.abs(totalProbability - 100) > 1) { // Allow small rounding errors
        showError('Segment probabilities must add up to 100% (current total: ' + totalProbability + '%)');
        return;
      }

      const spinWheelData = {
        name: spinWheelForm.name,
        title: spinWheelForm.title,
        description: spinWheelForm.description,
        maxSpinsPerUser: spinWheelForm.maxSpinsPerUser,
        cooldownHours: spinWheelForm.cooldownHours,
        segments: spinWheelForm.segments,
        startDate: selectedEvent.startDate, // Auto-assign from event
        endDate: selectedEvent.endDate, // Auto-assign from event
        isActive: spinWheelForm.isActive,
        eventId: selectedEvent._id
        // createdBy will be handled by the backend
      };
      
      const response = await api.post('/api/admin/spin-wheels', spinWheelData);
      
      // Update the event's components
      const updatedEvent = { ...selectedEvent };
      if (!updatedEvent.components) updatedEvent.components = {};
      if (!updatedEvent.components.spinWheel) updatedEvent.components.spinWheel = {};
      
      updatedEvent.components.spinWheel = {
        enabled: true,
        wheelId: response.data._id,
        priority: 1
      };
      
      // Update event in backend - only send the components that changed
      await api.put(`/api/admin/events/${selectedEvent._id}`, {
        components: updatedEvent.components
      });
      
      showSuccess('Spin wheel created and linked to event successfully!');
      setShowSpinWheelModal(false);
      resetSpinWheelForm();
      fetchEvents(); // Refresh events to show new component
    } catch (error) {
      console.error('Error creating spin wheel:', error);
      showError('Failed to create spin wheel: ' + (error.response?.data?.message || error.message));
    }
  };

  // Reset Component Forms
  const resetBannerForm = () => {
    setBannerForm({
      name: '',
      title: '',
      subtitle: '',
      description: '',
      image: '',
      imageFile: null,
      bannerType: 'image',
      textContent: {
        mainText: '',
        subText: '',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontSize: '2xl',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      position: 'hero',
      priority: 1,
      cta: { text: 'Shop Now', link: '', action: 'navigate', target: '_self' },
      startDate: '',
      endDate: '',
      isActive: true,
      displayRules: {
        showOnPages: ['all'],
        targetAudience: ['all'],
        timeBased: { enabled: false, startHour: 9, endHour: 21 }
      }
    });
  };

  const resetDiscountForm = () => {
    setDiscountForm({
      name: '',
      code: '',
      description: '',
      type: 'percentage',
      value: 0,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      maxUses: -1,
      maxUsesPerUser: 1,
      applicableCategories: [],
      isActive: true
    });
  };

  const resetOfferForm = () => {
    setOfferForm({
      name: '',
      title: '',
      description: '',
      type: 'flash_sale',
      offerValue: '',
      applicableProducts: [],
      applicableCategories: [],
      isActive: true
    });
  };

  const resetSpinWheelForm = () => {
    setSpinWheelForm({
      name: '',
      title: '',
      description: '',
      maxSpinsPerUser: 1,
      cooldownHours: 24,
      segments: [
        { name: '10% Off', probability: 25, reward: '10% discount' },
        { name: 'Free Shipping', probability: 25, reward: 'Free shipping' },
        { name: '5% Off', probability: 25, reward: '5% discount' },
        { name: 'Try Again', probability: 25, reward: 'No reward' }
      ],
      isActive: true
    });
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
      case 'promotional': return <GiftIcon className="h-5 w-5" />;
      case 'flash_sale': return <StarIcon className="h-5 w-5" />;
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

  // Calculate Component Stats
  const componentStats = {
    totalBanners: events.reduce((sum, e) => sum + (e.components?.banners?.length || 0), 0),
    totalDiscounts: events.reduce((sum, e) => sum + (e.components?.discounts?.length || 0), 0),
    totalOffers: events.reduce((sum, e) => sum + (e.components?.specialOffers?.length || 0), 0),
    totalSpinWheels: events.reduce((sum, e) => sum + (e.components?.spinWheel?.enabled ? 1 : 0), 0)
  };

  // Banner Management Functions
  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setBannerForm({
      name: banner.name || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image: banner.image || '',
      imageFile: null,
      bannerType: banner.bannerType || 'image',
      textContent: banner.textContent || {
        mainText: '',
        subText: '',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontSize: '2xl',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      position: banner.position || 'hero',
      priority: banner.priority || 1,
      cta: banner.cta || { text: 'Shop Now', link: '', action: 'navigate', target: '_self' },
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      displayRules: banner.displayRules || {
        showOnPages: ['all'],
        targetAudience: ['all'],
        timeBased: { enabled: false, startHour: 9, endHour: 21 }
      }
    });
    setShowBannerEditModal(true);
  };

  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields based on banner type
      if (!bannerForm.name || !bannerForm.title) {
        showError('Please fill in banner name and title');
        return;
      }

      if (bannerForm.bannerType === 'image' && !bannerForm.image && !bannerForm.imageFile) {
        showError('Please upload an image or provide image URL for image banners');
        return;
      }

      if (bannerForm.bannerType === 'text' && !bannerForm.textContent.mainText) {
        showError('Please enter main text content for text banners');
        return;
      }

      let imageUrl = bannerForm.image;
      
      // Handle file upload if imageFile exists
      if (bannerForm.imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', bannerForm.imageFile);
          
          const uploadResponse = await api.post('/api/admin/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          imageUrl = uploadResponse.data.imageUrl;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          showError('Failed to upload image: ' + (uploadError.response?.data?.message || uploadError.message));
          return;
        }
      }

      const bannerData = {
        name: bannerForm.name,
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        description: bannerForm.description,
        bannerType: bannerForm.bannerType,
        image: bannerForm.bannerType === 'image' ? imageUrl : null,
        textContent: bannerForm.bannerType === 'text' ? bannerForm.textContent : null,
        position: bannerForm.position,
        priority: bannerForm.priority,
        cta: bannerForm.cta,
        startDate: bannerForm.startDate,
        endDate: bannerForm.endDate,
        isActive: bannerForm.isActive,
        displayRules: bannerForm.displayRules
      };
      
      await api.put(`/api/admin/banners/${editingBanner._id}`, bannerData);
      
      showSuccess('Banner updated successfully!');
      setShowBannerEditModal(false);
      setEditingBanner(null);
      resetBannerForm();
      fetchEvents(); // Refresh events to show updated component
    } catch (error) {
      console.error('Error updating banner:', error);
      showError('Failed to update banner: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return;
    
    try {
      await api.delete(`/api/admin/banners/${bannerToDelete._id}`);
      
      // Remove banner from event components
      const updatedEvent = { ...selectedEvent };
      if (updatedEvent.components?.banners) {
        updatedEvent.components.banners = updatedEvent.components.banners.filter(
          b => b.bannerId !== bannerToDelete._id
        );
        
        await api.put(`/api/admin/events/${selectedEvent._id}`, {
          components: updatedEvent.components
        });
      }
      
      showSuccess('Banner deleted successfully!');
      setShowBannerDeleteModal(false);
      setBannerToDelete(null);
      fetchEvents(); // Refresh events to show updated component
    } catch (error) {
      console.error('Error deleting banner:', error);
      showError('Failed to delete banner: ' + (error.response?.data?.message || error.message));
    }
  };

  const confirmDeleteBanner = (banner) => {
    setBannerToDelete(banner);
    setShowBannerDeleteModal(true);
  };

  // Discount Management Functions
  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setDiscountForm({
      name: discount.name || '',
      code: discount.code || '',
      description: discount.description || '',
      type: discount.type || 'percentage',
      value: discount.value || 0,
      minOrderAmount: discount.minOrderAmount || 0,
      maxDiscountAmount: discount.maxDiscountAmount || 0,
      maxUses: discount.maxUses || -1,
      maxUsesPerUser: discount.maxUsesPerUser || 1,
      applicableCategories: discount.applicableCategories || [],
      isActive: discount.isActive !== undefined ? discount.isActive : true
    });
    setShowDiscountEditModal(true);
  };

  const handleUpdateDiscount = async (e) => {
    e.preventDefault();
    try {
      // Enhanced validation
      if (!discountForm.name || !discountForm.code || discountForm.value <= 0) {
        showError('Please fill in all required fields and set a valid discount value');
        return;
      }

      if (discountForm.code.length < 3) {
        showError('Discount code must be at least 3 characters long');
        return;
      }

      if (discountForm.value > 100 && discountForm.type === 'percentage') {
        showError('Percentage discount cannot exceed 100%');
        return;
      }

      const discountData = {
        name: discountForm.name,
        code: discountForm.code,
        description: discountForm.description,
        type: discountForm.type,
        value: discountForm.value,
        minOrderAmount: discountForm.minOrderAmount,
        maxDiscountAmount: discountForm.maxDiscountAmount,
        maxUses: discountForm.maxUses,
        maxUsesPerUser: discountForm.maxUsesPerUser,
        applicableCategories: discountForm.applicableCategories,
        isActive: discountForm.isActive
      };
      
      await api.put(`/api/admin/unified-discounts/${editingDiscount._id}`, discountData);
      
      showSuccess('Discount updated successfully!');
      setShowDiscountEditModal(false);
      setEditingDiscount(null);
      resetDiscountForm();
      fetchEvents(); // Refresh events to show updated component
    } catch (error) {
      console.error('Error updating discount:', error);
      showError('Failed to update discount: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteDiscount = async () => {
    if (!discountToDelete) return;
    
    try {
      await api.delete(`/api/admin/unified-discounts/${discountToDelete._id}`);
      
      // Remove discount from event components
      const updatedEvent = { ...selectedEvent };
      if (updatedEvent.components?.discounts) {
        updatedEvent.components.discounts = updatedEvent.components.discounts.filter(
          d => d.discountId !== discountToDelete._id
        );
        
        await api.put(`/api/admin/events/${selectedEvent._id}`, {
          components: updatedEvent.components
        });
      }
      
      showSuccess('Discount deleted successfully!');
      setShowDiscountDeleteModal(false);
      setDiscountToDelete(null);
      fetchEvents(); // Refresh events to show updated component
    } catch (error) {
      console.error('Error deleting discount:', error);
      showError('Failed to delete discount: ' + (error.response?.data?.message || error.message));
    }
  };

  const confirmDeleteDiscount = (discount) => {
    setDiscountToDelete(discount);
    setShowDiscountDeleteModal(true);
  };

  // Offer Management Functions
  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      name: offer.name || '',
      title: offer.title || '',
      description: offer.description || '',
      type: offer.type || 'flash_sale',
      offerValue: offer.offerValue || '',
      applicableProducts: offer.applicableProducts || [],
      applicableCategories: offer.applicableCategories || [],
      isActive: offer.isActive !== undefined ? offer.isActive : true
    });
    setShowOfferEditModal(true);
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    try {
      // Enhanced validation
      if (!offerForm.name || !offerForm.title || !offerForm.offerValue) {
        showError('Please fill in all required fields');
        return;
      }

      if (offerForm.name.length < 3) {
        showError('Offer name must be at least 3 characters long');
        return;
      }

      if (offerForm.offerValue.length < 5) {
        showError('Offer value description must be at least 5 characters long');
        return;
      }

      const offerData = {
        name: offerForm.name,
        title: offerForm.title,
        description: offerForm.description,
        type: offerForm.type,
        offerValue: offerForm.offerValue,
        applicableProducts: offerForm.applicableProducts,
        applicableCategories: offerForm.applicableCategories,
        isActive: offerForm.isActive
      };
      
      await api.put(`/api/admin/special-offers/${editingOffer._id}`, offerData);
      
      showSuccess('Special offer updated successfully!');
      setShowOfferEditModal(false);
      setEditingOffer(null);
      resetOfferForm();
      fetchEvents(); // Refresh events to show updated component
    } catch (error) {
      console.error('Error updating special offer:', error);
      showError('Failed to update special offer: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteOffer = async () => {
    if (!offerToDelete) return;
    
    try {
      await api.delete(`/api/admin/special-offers/${offerToDelete._id}`);
      
      // Remove offer from event components
      const updatedEvent = { ...selectedEvent };
      if (updatedEvent.components?.specialOffers) {
        updatedEvent.components.specialOffers = updatedEvent.components.specialOffers.filter(
          o => o.offerId !== offerToDelete._id
        );
        
        await api.put(`/api/admin/events/${selectedEvent._id}`, {
          components: updatedEvent.components
        });
      }
      
      showSuccess('Special offer deleted successfully!');
      setShowOfferDeleteModal(false);
      setOfferToDelete(null);
      fetchEvents(); // Refresh events to show updated component
    } catch (error) {
      console.error('Error deleting special offer:', error);
      showError('Failed to delete special offer: ' + (error.response?.data?.message || error.message));
    }
  };

  const confirmDeleteOffer = (offer) => {
    setOfferToDelete(offer);
    setShowOfferDeleteModal(true);
  };

  // Spin Wheel Management Functions
  const handleEditSpinWheel = (spinWheel) => {
    setEditingSpinWheel(spinWheel);
    setSpinWheelForm({
      name: spinWheel.name || '',
      title: spinWheel.title || '',
      description: spinWheel.description || '',
      maxSpinsPerUser: spinWheel.maxSpinsPerUser || 1,
      cooldownHours: spinWheel.cooldownHours || 24,
      segments: spinWheel.segments || [
        { name: '10% Off', probability: 25, reward: '10% discount' },
        { name: 'Free Shipping', probability: 25, reward: 'Free shipping' },
        { name: '5% Off', probability: 25, reward: '5% discount' },
        { name: 'Try Again', probability: 25, reward: 'No reward' }
      ],
      isActive: spinWheel.isActive !== undefined ? spinWheel.isActive : true
    });
    setShowSpinWheelEditModal(true);
  };

  const handleUpdateSpinWheel = async (e) => {
    e.preventDefault();
    try {
      // Enhanced validation
      if (!spinWheelForm.name || !spinWheelForm.title) {
        showError('Please fill in all required fields');
        return;
      }

      if (spinWheelForm.name.length < 3) {
        showError('Spin wheel name must be at least 3 characters long');
        return;
      }

      if (spinWheelForm.segments.length < 2) {
        showError('Spin wheel must have at least 2 segments');
        return;
      }

      // Validate segment probabilities add up to 100%
      const totalProbability = spinWheelForm.segments.reduce((sum, segment) => sum + segment.probability, 0);
      if (Math.abs(totalProbability - 100) > 1) { // Allow small rounding errors
        showError('Segment probabilities must add up to 100% (current total: ' + totalProbability + '%)');
        return;
      }

      const spinWheelData = {
        name: spinWheelForm.name,
        title: spinWheelForm.title,
        description: spinWheelForm.description,
        maxSpinsPerUser: spinWheelForm.maxSpinsPerUser,
        cooldownHours: spinWheelForm.cooldownHours,
        segments: spinWheelForm.segments,
        startDate: selectedEvent.startDate, // Auto-assign from event
        endDate: selectedEvent.endDate, // Auto-assign from event
        isActive: spinWheelForm.isActive,
        eventId: selectedEvent._id
        // createdBy will be handled by the backend
      };
      
      await api.put(`/api/admin/spin-wheels/${editingSpinWheel._id}`, spinWheelData);
      
      showSuccess('Spin wheel updated successfully!');
      setShowSpinWheelEditModal(false);
      setEditingSpinWheel(null);
      resetSpinWheelForm();
      fetchEvents(); // Refresh events to show updated component
    } catch (error) {
      console.error('Error updating spin wheel:', error);
      showError('Failed to update spin wheel: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteSpinWheel = async () => {
    if (!spinWheelToDelete) return;
    
    try {
      await api.delete(`/api/admin/spin-wheels/${spinWheelToDelete._id}`);
      
      // Remove spin wheel from event components
      const updatedEvent = { ...selectedEvent };
      if (updatedEvent.components?.spinWheel) {
        updatedEvent.components.spinWheel = {};
        
        await api.put(`/api/admin/events/${selectedEvent._id}`, {
          components: updatedEvent.components
        });
      }
      
      showSuccess('Spin wheel deleted successfully!');
      setShowSpinWheelDeleteModal(false);
      setSpinWheelToDelete(null);
      fetchEvents(); // Refresh events to show updated component
    } catch (error) {
      console.error('Error deleting spin wheel:', error);
      showError('Failed to delete spin wheel: ' + (error.response?.data?.message || error.message));
    }
  };

  const confirmDeleteSpinWheel = (spinWheel) => {
    setSpinWheelToDelete(spinWheel);
    setShowSpinWheelDeleteModal(true);
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
              <p className="text-sm font-medium text-gray-600">Total Components</p>
              <p className="text-2xl font-bold text-purple-600">
                {componentStats.totalBanners + componentStats.totalDiscounts + componentStats.totalOffers + componentStats.totalSpinWheels}
              </p>
                </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CogIcon className="h-6 w-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-orange-600">
                {events.reduce((sum, e) => sum + (e.performance?.views || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total Views</p>
              </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
            </div>
                        </div>
        </motion.div>
                    </div>
                    
      {/* Component Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`bg-white rounded-xl p-4 shadow-lg border border-gray-200 transition-all duration-300 ${
            events.length > 0 ? 'hover:shadow-xl cursor-pointer group' : 'cursor-not-allowed opacity-75'
          }`}
          onClick={() => events.length > 0 ? openComponentManagement(events[0]) : showError('Create an event first to manage components')}
        >
          <div className="text-center">
            <div className={`w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 ${
              events.length > 0 ? 'group-hover:bg-blue-200 transition-colors' : ''
            }`}>
              <PhotoIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className={`text-2xl font-bold text-gray-900 ${
              events.length > 0 ? 'group-hover:text-blue-600 transition-colors' : ''
            }`}>{componentStats.totalBanners}</p>
            <p className={`text-sm text-gray-600 ${
              events.length > 0 ? 'group-hover:text-blue-700 transition-colors' : ''
            }`}>Banners</p>
            {events.length > 0 ? (
              <p className="text-xs text-blue-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to manage</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Create event first</p>
            )}
                      </div>
        </motion.div>
    
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`bg-white rounded-xl p-4 shadow-lg border border-gray-200 transition-all duration-300 ${
            events.length > 0 ? 'hover:shadow-xl cursor-pointer group' : 'cursor-not-allowed opacity-75'
          }`}
          onClick={() => events.length > 0 ? openComponentManagement(events[0]) : showError('Create an event first to manage components')}
        >
          <div className="text-center">
            <div className={`w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 ${
              events.length > 0 ? 'group-hover:bg-green-200 transition-colors' : ''
            }`}>
              <TicketIcon className="h-6 w-6 text-green-600" />
                    </div>
            <p className={`text-2xl font-bold text-gray-900 ${
              events.length > 0 ? 'group-hover:text-green-600 transition-colors' : ''
            }`}>{componentStats.totalDiscounts}</p>
            <p className={`text-sm text-gray-600 ${
              events.length > 0 ? 'group-hover:text-green-700 transition-colors' : ''
            }`}>Discounts</p>
            {events.length > 0 ? (
              <p className="text-xs text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to manage</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Create event first</p>
            )}
                  </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`bg-white rounded-xl p-4 shadow-lg border border-gray-200 transition-all duration-300 ${
            events.length > 0 ? 'hover:shadow-xl cursor-pointer group' : 'cursor-not-allowed opacity-75'
          }`}
          onClick={() => events.length > 0 ? openComponentManagement(events[0]) : showError('Create an event first to manage components')}
        >
          <div className="text-center">
            <div className={`w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 ${
              events.length > 0 ? 'group-hover:bg-purple-200 transition-colors' : ''
            }`}>
              <GiftIcon className="h-6 w-6 text-purple-600" />
                      </div>
            <p className={`text-2xl font-bold text-gray-900 ${
              events.length > 0 ? 'group-hover:text-purple-600 transition-colors' : ''
            }`}>{componentStats.totalOffers}</p>
            <p className={`text-sm text-gray-600 ${
              events.length > 0 ? 'group-hover:text-purple-700 transition-colors' : ''
            }`}>Special Offers</p>
            {events.length > 0 ? (
              <p className="text-xs text-purple-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to manage</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Create event first</p>
            )}
                        </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`bg-white rounded-xl p-4 shadow-lg border border-gray-200 transition-all duration-300 ${
            events.length > 0 ? 'hover:shadow-xl cursor-pointer group' : 'cursor-not-allowed opacity-75'
          }`}
          onClick={() => events.length > 0 ? openComponentManagement(events[0]) : showError('Create an event first to manage components')}
        >
          <div className="text-center">
            <div className={`w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3 ${
              events.length > 0 ? 'group-hover:bg-yellow-200 transition-colors' : ''
            }`}>
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <p className={`text-2xl font-bold text-gray-900 ${
              events.length > 0 ? 'group-hover:text-yellow-600 transition-colors' : ''
            }`}>{componentStats.totalSpinWheels}</p>
            <p className={`text-sm text-gray-600 ${
              events.length > 0 ? 'group-hover:text-yellow-700 transition-colors' : ''
            }`}>Spin Wheels</p>
            {events.length > 0 ? (
              <p className="text-xs text-yellow-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to manage</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Create event first</p>
                      )}
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
                  
      {/* Component Requirements Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <InformationCircleIcon className="h-6 w-6 text-blue-600" />
                        </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🎯 Component Requirements for Event Activation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span><strong>Banners:</strong> Required for visibility and engagement</span>
                      </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span><strong>Discounts:</strong> Required for conversion optimization</span>
                        </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span><strong>Special Offers:</strong> Required for urgency and exclusivity</span>
                      </div>
                        </div>
            <div className="mt-3 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Events can only be activated when they have at least one of the three essential components. 
                Spin wheels are optional but recommended for increased engagement. The green/red dots in event cards show component status.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                <strong>Pro Tip:</strong> Banners can be image-based or text-only with custom styling. Text-only banners are perfect for quick announcements without needing to design graphics!
              </p>
                      </div>
                        </div>
                      </div>
                    </div>

      {/* Helpful Tips Section */}
      {events.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-8 border border-indigo-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <InformationCircleIcon className="h-6 w-6 text-indigo-600" />
                      </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">💡 Campaign Hub Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-800">
                <div>
                  <h4 className="font-medium mb-2 text-indigo-900">🎯 Event Strategy</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Start with promotional events</li>
                    <li>Set clear start/end dates</li>
                    <li>Use priority levels (1-5)</li>
                    <li>Target specific audiences</li>
                  </ul>
                      </div>
                <div>
                  <h4 className="font-medium mb-2 text-indigo-900">🔗 Component Integration</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Create components first</li>
                    <li>Link them to events</li>
                    <li>Track performance metrics</li>
                    <li>Optimize based on data</li>
                  </ul>
                    </div>
                <div>
                  <h4 className="font-medium mb-2 text-indigo-900">📊 Performance Tracking</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Monitor views & clicks</li>
                    <li>Track conversions</li>
                    <li>Measure revenue impact</li>
                    <li>Compare event performance</li>
                  </ul>
                      </div>
                      </div>
              <div className="mt-4 flex gap-3">
                    <button
                  onClick={() => window.open('/admin/analytics', '_blank')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                  <ChartBarIcon className="h-4 w-4 mr-1 inline" />
                  View Analytics
                    </button>
                    <button
                  onClick={() => window.open('/admin/banners', '_blank')}
                  className="px-4 py-2 bg-white text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium"
                    >
                  <PhotoIcon className="h-4 w-4 mr-1 inline" />
                  Manage Banners
                    </button>
                  </div>
                </div>
              </div>
                </div>
              )}

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59] mx-auto"></div>
                    </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CubeIcon className="h-16 w-16 text-blue-600" />
                  </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">🚀 Ready to Launch Your First Campaign?</h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Create an event to start building engaging campaigns with banners, discounts, and special offers! 
              Our event-driven system will help you track performance and optimize your marketing efforts.
            </p>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PhotoIcon className="h-6 w-6 text-blue-600" />
                  </div>
                <h4 className="font-semibold text-gray-900 mb-2">🎨 Dynamic Banners</h4>
                <p className="text-sm text-gray-600">Create engaging visual content that adapts to your events</p>
                </div>
                
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TicketIcon className="h-6 w-6 text-green-600" />
                      </div>
                <h4 className="font-semibold text-gray-900 mb-2">💰 Smart Discounts</h4>
                <p className="text-sm text-gray-600">Automated discount management with performance tracking</p>
                      </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <GiftIcon className="h-6 w-6 text-purple-600" />
                      </div>
                <h4 className="font-semibold text-gray-900 mb-2">🎁 Special Offers</h4>
                <p className="text-sm text-gray-600">Create urgency and boost conversions with targeted offers</p>
                    </div>
              </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => {
                  resetForm();
                  setShowEventModal(true);
                }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] text-white rounded-xl hover:from-[#5A6A4A] hover:to-[#4A5A3A] transition-all duration-300 transform hover:scale-105 shadow-lg text-lg font-semibold"
              >
                <PlusIcon className="h-6 w-6 mr-2" />
                Create Your First Event
                    </button>
                    
                    <button
                onClick={() => window.open('/admin/banners', '_blank')}
                className="inline-flex items-center px-6 py-4 bg-white text-[#6C7A59] border-2 border-[#6C7A59] rounded-xl hover:bg-[#6C7A59] hover:text-white transition-all duration-300 text-lg font-semibold shadow-lg"
                    >
                <PhotoIcon className="h-5 w-5 mr-2" />
                Start with Banners
                    </button>
              </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-2">Need help getting started?</p>
              <div className="flex justify-center gap-4 text-sm">
                <button className="text-blue-600 hover:text-blue-800 underline">📚 View Tutorial</button>
                <button className="text-blue-600 hover:text-blue-800 underline">🎥 Watch Demo</button>
                <button className="text-blue-600 hover:text-blue-800 underline">💬 Get Support</button>
              </div>
            </div>
          </motion.div>
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
                          
                {/* Event Actions */}
                          <div className="p-6">
                  {/* Component Counts */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{event.components?.banners?.length || 0}</div>
                      <div className="text-xs text-blue-600">Banners</div>
                                </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{event.components?.discounts?.length || 0}</div>
                      <div className="text-xs text-green-600">Discounts</div>
                              </div>
                            </div>
                            
                  {/* Component Engagement Call-to-Action */}
                  {(!event.components?.banners?.length && !event.components?.discounts?.length && 
                    !event.components?.specialOffers?.length && !event.components?.spinWheel?.enabled) && (
                    <div className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border border-orange-200 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                                  </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-orange-900 mb-1">No Components Added Yet</h4>
                          <p className="text-sm text-orange-700 mb-3">
                            This event needs components to be effective. Start with banners for visibility!
                          </p>
                          <button
                            onClick={() => openComponentManagement(event)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                          >
                            Add Components Now
                          </button>
                                </div>
                                  </div>
                                </div>
                  )}

                  {/* Performance Preview */}
                  {event.performance && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-center text-xs text-gray-600 mb-2">Performance Preview</div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-sm font-semibold text-blue-600">{event.performance.views || 0}</div>
                          <div className="text-xs text-gray-500">Views</div>
                                  </div>
                        <div>
                          <div className="text-sm font-semibold text-green-600">{event.performance.clicks || 0}</div>
                          <div className="text-xs text-gray-500">Clicks</div>
                                </div>
                        <div>
                          <div className="text-sm font-semibold text-purple-600">{event.performance.conversions || 0}</div>
                          <div className="text-xs text-gray-500">Sales</div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                              <button 
                      onClick={() => openComponentManagement(event)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-[#6C7A59] hover:bg-[#6C7A59] hover:text-white rounded-lg transition-colors border border-[#6C7A59]"
                              >
                      <CubeIcon className="h-4 w-4 mr-1" />
                      Manage Components
                              </button>
                    
                    {/* Component Status Indicator */}
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${event.components?.banners?.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} title="Banners"></div>
                      <div className={`w-2 h-2 rounded-full ${event.components?.discounts?.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} title="Discounts"></div>
                      <div className={`w-2 h-2 rounded-full ${event.components?.specialOffers?.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} title="Offers"></div>
                    </div>
                    
                    {event.status === 'active' ? (
                              <button 
                        onClick={() => handleStatusChange(event._id, 'deactivate')}
                        className="px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Pause Event"
                              >
                        <PauseIcon className="h-4 w-4" />
                              </button>
                    ) : (
                              <button 
                        onClick={() => handleStatusChange(event._id, 'activate')}
                        disabled={!event.components?.banners?.length && !event.components?.discounts?.length && !event.components?.specialOffers?.length}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          !event.components?.banners?.length && !event.components?.discounts?.length && !event.components?.specialOffers?.length
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-green-700 hover:bg-green-50'
                        }`}
                        title={
                          !event.components?.banners?.length && !event.components?.discounts?.length && !event.components?.specialOffers?.length
                            ? 'Add at least one component to activate'
                            : 'Activate Event'
                        }
                      >
                        <PlayIcon className="h-4 w-4" />
                              </button>
                    )}
                    
                              <button 
                      onClick={() => handleEdit(event)}
                      className="px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Event"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Event"
                    >
                      <TrashIcon className="h-4 w-4" />
                              </button>
                  </div>
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

      {/* Component Management Modal */}
      <AnimatePresence>
        {showComponentModal && selectedEvent && (
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
              className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                         <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      🎯 Component Management
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Manage components for: <span className="font-semibold text-[#6C7A59]">{selectedEvent.name}</span>
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>📅 {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}</span>
                      <span>🎯 {selectedEvent.targetAudience.replace('_', ' ')}</span>
                      <span>⭐ Priority: {selectedEvent.priority}</span>
                         </div>
                       </div>
                         <button
                    onClick={() => setShowComponentModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                         >
                    ×
                         </button>
                </div>
              </div>

              <div className="p-6">
                {/* Component Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Banners */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-200">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <PhotoIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-blue-900 text-lg">Banners & Ads</h3>
                      <p className="text-blue-700 text-sm mb-3">
                        {selectedEvent.components?.banners?.length || 0} active banner{selectedEvent.components?.banners?.length !== 1 ? 's' : ''}
                      </p>
                      {!selectedEvent.components?.banners?.length && (
                        <div className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          No banners yet
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                         <button
                        onClick={() => setShowBannerModal(true)}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        {selectedEvent.components?.banners?.length ? 'Add Another Banner' : 'Create First Banner'}
                         </button>
                      
                      {selectedEvent.components?.banners?.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
                              {selectedEvent.performance?.bannerMetrics?.displays || 0} displays
                            </span>
                          </div>
                          
                          {/* Banner Management Buttons */}
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                // TODO: Show banner list modal
                                showSuccess('Banner management coming soon!');
                              }}
                              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
                            >
                              View {selectedEvent.components.banners.length} Banner{selectedEvent.components.banners.length !== 1 ? 's' : ''}
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowBannerModal(true)}
                                className="flex-1 bg-blue-400 text-white py-2 rounded-lg hover:bg-blue-500 transition-colors text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: Show banner selection for editing
                                  showSuccess('Banner editing coming soon!');
                                }}
                                className="flex-1 bg-red-400 text-white py-2 rounded-lg hover:bg-red-500 transition-colors text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                               </div>
                                 </div>
                  
                  {/* Discounts */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-green-200">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TicketIcon className="h-8 w-8 text-green-600" />
                               </div>
                      <h3 className="font-bold text-green-900 text-lg">Discounts & Coupons</h3>
                      <p className="text-green-700 text-sm mb-3">
                        {selectedEvent.components?.discounts?.length || 0} active discount{selectedEvent.components?.discounts?.length !== 1 ? 's' : ''}
                      </p>
                      {!selectedEvent.components?.discounts?.length && (
                        <div className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          No discounts yet
                             </div>
                      )}
                           </div>
                           
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowDiscountModal(true)}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        {selectedEvent.components?.discounts?.length ? 'Add Another Discount' : 'Create First Discount'}
                      </button>
                      
                      {selectedEvent.components?.discounts?.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                              {selectedEvent.performance?.discountMetrics?.issued || 0} issued
                            </span>
                          </div>
                          
                          {/* Discount Management Buttons */}
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                // TODO: Show discount list modal
                                showSuccess('Discount management coming soon!');
                              }}
                              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                            >
                              View {selectedEvent.components.discounts.length} Discount{selectedEvent.components.discounts.length !== 1 ? 's' : ''}
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowDiscountModal(true)}
                                className="flex-1 bg-green-400 text-white py-2 rounded-lg hover:bg-green-500 transition-colors text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: Show discount selection for editing
                                  showSuccess('Discount editing coming soon!');
                                }}
                                className="flex-1 bg-red-400 text-white py-2 rounded-lg hover:bg-red-500 transition-colors text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                               </div>
                             </div>
                             
                  {/* Special Offers */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-purple-200">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <GiftIcon className="h-8 w-8 text-purple-600" />
                                 </div>
                      <h3 className="font-bold text-purple-900 text-lg">Special Offers</h3>
                      <p className="text-purple-700 text-sm mb-3">
                        {selectedEvent.components?.specialOffers?.length || 0} active offer{selectedEvent.components?.specialOffers?.length !== 1 ? 's' : ''}
                      </p>
                      {!selectedEvent.components?.specialOffers?.length && (
                        <div className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                          No offers yet
                                 </div>
                      )}
                                 </div>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowOfferModal(true)}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        {selectedEvent.components?.specialOffers?.length ? 'Add Another Offer' : 'Create First Offer'}
                      </button>
                      
                      {selectedEvent.components?.specialOffers?.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded-full">
                              {selectedEvent.performance?.offerMetrics?.activations || 0} activations
                            </span>
                          </div>
                          
                          {/* Offer Management Buttons */}
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                // TODO: Show offer list modal
                                showSuccess('Offer management coming soon!');
                              }}
                              className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors text-xs font-medium"
                            >
                              View {selectedEvent.components.specialOffers.length} Offer{selectedEvent.components.specialOffers.length !== 1 ? 's' : ''}
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowOfferModal(true)}
                                className="flex-1 bg-purple-400 text-white py-2 rounded-lg hover:bg-purple-500 transition-colors text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: Show offer selection for editing
                                  showSuccess('Offer editing coming soon!');
                                }}
                                className="flex-1 bg-red-400 text-white py-2 rounded-lg hover:bg-red-500 transition-colors text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                           </div>
                     </div>
                  
                  {/* Spin Wheel */}
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-yellow-200">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <StarIcon className="h-8 w-8 text-yellow-600" />
                       </div>
                      <h3 className="font-bold text-yellow-900 text-lg">Spin Wheel</h3>
                      <p className="text-yellow-700 text-sm mb-3">
                        {selectedEvent.components?.spinWheel?.enabled ? 'Active & Running' : 'Not Enabled'}
                      </p>
                      {!selectedEvent.components?.spinWheel?.enabled && (
                        <div className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                          Not enabled
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                       <button
                        onClick={() => setShowSpinWheelModal(true)}
                        className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                       >
                        {selectedEvent.components?.spinWheel?.enabled ? 'Reconfigure Wheel' : 'Enable Spin Wheel'}
                       </button>
                      
                      {selectedEvent.components?.spinWheel?.enabled && (
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-xs text-yellow-600 bg-yellow-200 px-2 py-1 rounded-full">
                              {selectedEvent.performance?.spinWheelMetrics?.spins || 0} spins
                            </span>
                          </div>
                          
                          {/* Spin Wheel Management Buttons */}
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                // TODO: Show spin wheel details modal
                                showSuccess('Spin wheel management coming soon!');
                              }}
                              className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors text-xs font-medium"
                            >
                              View Details
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowSpinWheelModal(true)}
                                className="flex-1 bg-yellow-400 text-white py-2 rounded-lg hover:bg-yellow-500 transition-colors text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: Show spin wheel deletion confirmation
                                  showSuccess('Spin wheel deletion coming soon!');
                                }}
                                className="flex-1 bg-red-400 text-white py-2 rounded-lg hover:bg-red-500 transition-colors text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                               </div>
                             </div>
                             
                {/* Component Integration Guide */}
                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <LinkIcon className="h-6 w-6 text-indigo-600" />
                                 </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-indigo-900 mb-2">🔗 Component Integration Guide</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
                        <div>
                          <h4 className="font-medium mb-2">📋 How to Connect Components:</h4>
                          <ul className="space-y-1 list-disc list-inside">
                            <li>Create components directly in this modal</li>
                            <li>They're automatically linked to "{selectedEvent.name}"</li>
                            <li>Components appear here immediately</li>
                            <li>Performance metrics are tracked per event</li>
                          </ul>
                                 </div>
                        <div>
                          <h4 className="font-medium mb-2">🎯 Best Practices:</h4>
                          <ul className="space-y-1 list-disc list-inside">
                            <li>Start with banners for visibility</li>
                            <li>Add discounts for conversion</li>
                            <li>Use special offers for urgency</li>
                            <li>Enable spin wheel for engagement</li>
                          </ul>
                                 </div>
                                 </div>
                               </div>
                           </div>
                         </div>
                
                {/* Performance Overview */}
                <div className="mt-8 bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Event Performance Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{selectedEvent.performance?.views || 0}</div>
                      <div className="text-sm text-gray-600">Total Views</div>
                      <div className="text-xs text-blue-500 mt-1">Across all components</div>
                     </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-green-600 mb-1">{selectedEvent.performance?.clicks || 0}</div>
                      <div className="text-sm text-gray-600">Total Clicks</div>
                      <div className="text-xs text-green-500 mt-1">User engagement</div>
                   </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-purple-600 mb-1">{selectedEvent.performance?.conversions || 0}</div>
                      <div className="text-sm text-gray-600">Conversions</div>
                      <div className="text-xs text-purple-500 mt-1">Sales & actions</div>
                  </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-3xl font-bold text-orange-600 mb-1">
                        ${(selectedEvent.performance?.revenue || 0).toFixed(2)}
              </div>
                      <div className="text-sm text-gray-600">Revenue</div>
                      <div className="text-xs text-orange-500 mt-1">Generated</div>
            </div>
        </div>

                  {/* Component-specific Performance */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-blue-700">Banners</div>
                      <div className="text-sm text-blue-600">
                        {selectedEvent.performance?.bannerMetrics?.displays || 0} displays
                  </div>
                  </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-green-700">Discounts</div>
                      <div className="text-sm text-green-600">
                        {selectedEvent.performance?.discountMetrics?.issued || 0} issued
                  </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-purple-700">Offers</div>
                      <div className="text-sm text-purple-600">
                        {selectedEvent.performance?.offerMetrics?.activations || 0} activations
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-yellow-700">Spin Wheel</div>
                      <div className="text-sm text-yellow-600">
                        {selectedEvent.performance?.spinWheelMetrics?.spins || 0} spins
                      </div>
                    </div>
                    </div>
                  </div>
                  
                {/* Action Buttons */}
                <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.open('/admin/analytics', '_blank')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <ChartBarIcon className="h-4 w-4 mr-1 inline" />
                      View Analytics
                    </button>
                    <button
                      onClick={() => window.open('/admin/events', '_blank')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <CubeIcon className="h-4 w-4 mr-1 inline" />
                      Manage Events
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowComponentModal(false)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowComponentModal(false);
                        handleEdit(selectedEvent);
                      }}
                      className="px-6 py-3 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors font-medium"
                    >
                      <PencilIcon className="h-4 w-4 mr-1 inline" />
                      Edit Event
                    </button>
                  </div>
              </div>
            </div>
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
                <h2 className="text-2xl font-bold text-gray-900">Create Banner for {selectedEvent?.name}</h2>
                <p className="text-gray-600 mt-1">This banner will be automatically linked to your event</p>
              </div>

              <form onSubmit={handleCreateBanner} className="p-6 space-y-6">
                {/* Banner Type Selection */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-3">Banner Type</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bannerType"
                        value="image"
                        checked={bannerForm.bannerType === 'image'}
                        onChange={(e) => setBannerForm({...bannerForm, bannerType: e.target.value})}
                        className="mr-2 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-purple-800">Image Banner</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bannerType"
                        value="text"
                        checked={bannerForm.bannerType === 'text'}
                        onChange={(e) => setBannerForm({...bannerForm, bannerType: e.target.value})}
                        className="mr-2 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-purple-800">Text-Only Banner</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banner Name *</label>
                    <input
                      type="text"
                      value={bannerForm.name}
                      onChange={(e) => setBannerForm({...bannerForm, name: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter banner name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter banner title..."
                    />
                  </div>
                  </div>
                  
                      <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Enter subtitle..."
                  />
                      </div>

                      <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={bannerForm.description}
                    onChange={(e) => setBannerForm({...bannerForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Enter banner description..."
                  />
                    </div>
                    
                {/* Conditional Content Based on Banner Type */}
                {bannerForm.bannerType === 'image' ? (
                  /* Enhanced Image Upload Section */
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image *</label>
                    <div className="space-y-4">
                      {/* Image Upload Area */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#6C7A59] transition-colors">
                        <div className="text-center">
                          {bannerForm.image || bannerForm.imageFile ? (
                            <div className="space-y-4">
                              <div className="relative inline-block">
                                <img
                                  src={bannerForm.imageFile ? URL.createObjectURL(bannerForm.imageFile) : bannerForm.image}
                              alt="Banner preview" 
                                  className="max-w-full h-48 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                                  onClick={() => {
                                    setBannerForm({...bannerForm, image: '', imageFile: null});
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                >
                                  ×
                            </button>
                              </div>
                              <p className="text-sm text-gray-600">
                                {bannerForm.imageFile ? `File: ${bannerForm.imageFile.name}` : 'Image loaded'}
                              </p>
                          </div>
                        ) : (
                            <>
                              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  <label className="cursor-pointer text-[#6C7A59] hover:text-[#5A6A4A] font-medium">
                                    Click to upload
                                  </label>
                                  {' '}or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </>
                          )}
                          
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                              if (file) {
                                setBannerForm({...bannerForm, imageFile: file, image: ''});
                              }
                              }}
                              className="hidden"
                            id="banner-image-upload"
                            />
                            <label
                            htmlFor="banner-image-upload"
                            className="mt-4 inline-flex items-center px-4 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors cursor-pointer"
                            >
                                <PhotoIcon className="h-4 w-4 mr-2" />
                            {bannerForm.image || bannerForm.imageFile ? 'Change Image' : 'Upload Image'}
                            </label>
                          </div>
                      </div>
                      
                      {/* URL Input Alternative */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="url"
                            value={bannerForm.image}
                            onChange={(e) => setBannerForm({...bannerForm, image: e.target.value, imageFile: null})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                            placeholder="Or paste image URL here..."
                          />
                    </div>
                        <span className="text-gray-500 text-sm">OR</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Text-Only Banner Content */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Main Text Content *</label>
                      <textarea
                        value={bannerForm.textContent.mainText}
                        onChange={(e) => setBannerForm({
                          ...bannerForm, 
                          textContent: {...bannerForm.textContent, mainText: e.target.value}
                        })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                        placeholder="Enter your main banner text..."
                      />
                    </div>
                    
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sub Text (Optional)</label>
                      <input
                        type="text"
                        value={bannerForm.textContent.subText}
                        onChange={(e) => setBannerForm({
                          ...bannerForm, 
                          textContent: {...bannerForm.textContent, subText: e.target.value}
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                        placeholder="Enter sub text..."
                      />
                    </div>
                    
                    {/* Text Styling Options */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Text Styling</h4>
                      
                      {/* Live Preview */}
                      <div className="mb-4 p-4 rounded-lg border-2 border-dashed border-gray-300">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Live Preview:</h5>
                        <div 
                          className="p-4 rounded-lg text-center"
                          style={{
                            backgroundColor: bannerForm.textContent.backgroundColor,
                            color: bannerForm.textContent.textColor
                          }}
                        >
                          <div 
                            className={`font-${bannerForm.textContent.fontWeight} text-${bannerForm.textContent.fontSize} text-${bannerForm.textContent.textAlign}`}
                          >
                            {bannerForm.textContent.mainText || 'Your main text will appear here...'}
                      </div>
                          {bannerForm.textContent.subText && (
                            <div className="mt-2 text-sm opacity-80">
                              {bannerForm.textContent.subText}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                          <div className="flex gap-2">
                        <input
                              type="color"
                              value={bannerForm.textContent.backgroundColor}
                              onChange={(e) => setBannerForm({
                                ...bannerForm, 
                                textContent: {...bannerForm.textContent, backgroundColor: e.target.value}
                              })}
                              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={bannerForm.textContent.backgroundColor}
                              onChange={(e) => setBannerForm({
                                ...bannerForm, 
                                textContent: {...bannerForm.textContent, backgroundColor: e.target.value}
                              })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={bannerForm.textContent.textColor}
                              onChange={(e) => setBannerForm({
                                ...bannerForm, 
                                textContent: {...bannerForm.textContent, textColor: e.target.value}
                              })}
                              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={bannerForm.textContent.textColor}
                              onChange={(e) => setBannerForm({
                                ...bannerForm, 
                                textContent: {...bannerForm.textContent, textColor: e.target.value}
                              })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                        <select
                            value={bannerForm.textContent.fontSize}
                            onChange={(e) => setBannerForm({
                              ...bannerForm, 
                              textContent: {...bannerForm.textContent, fontSize: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                          >
                            <option value="xs">Extra Small</option>
                            <option value="sm">Small</option>
                            <option value="base">Base</option>
                            <option value="lg">Large</option>
                            <option value="xl">Extra Large</option>
                            <option value="2xl">2XL</option>
                            <option value="3xl">3XL</option>
                            <option value="4xl">4XL</option>
                        </select>
                      </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                          <select
                            value={bannerForm.textContent.fontWeight}
                            onChange={(e) => setBannerForm({
                              ...bannerForm, 
                              textContent: {...bannerForm.textContent, fontWeight: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                          >
                            <option value="normal">Normal</option>
                            <option value="medium">Medium</option>
                            <option value="semibold">Semi Bold</option>
                            <option value="bold">Bold</option>
                            <option value="extrabold">Extra Bold</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
                          <select
                            value={bannerForm.textContent.textAlign}
                            onChange={(e) => setBannerForm({
                              ...bannerForm, 
                              textContent: {...bannerForm.textContent, textAlign: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>
                      </div>
                    </div>
                  )}
                  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <select
                      value={bannerForm.position}
                      onChange={(e) => setBannerForm({...bannerForm, position: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="hero">Hero (Main Banner)</option>
                      <option value="top">Top of Page</option>
                      <option value="middle">Middle of Page</option>
                      <option value="bottom">Bottom of Page</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="sticky">Sticky (Fixed)</option>
                        </select>
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <input
                          type="number"
                      value={bannerForm.priority}
                      onChange={(e) => setBannerForm({...bannerForm, priority: parseInt(e.target.value)})}
                          min="1"
                      max="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                        />
                    <p className="text-xs text-gray-500 mt-1">1 = Highest, 10 = Lowest</p>
                      </div>
                    </div>

                {/* Enhanced CTA Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Call to Action</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                      <input
                        type="text"
                        value={bannerForm.cta.text}
                        onChange={(e) => setBannerForm({...bannerForm, cta: {...bannerForm.cta, text: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                      <select
                        value={bannerForm.cta.action}
                        onChange={(e) => setBannerForm({...bannerForm, cta: {...bannerForm.cta, action: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      >
                        <option value="navigate">Navigate to Page</option>
                        <option value="modal">Open Modal</option>
                        <option value="scroll">Scroll to Section</option>
                        <option value="external">External Link</option>
                        <option value="product">Product Page</option>
                        <option value="category">Category Page</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                      <select
                        value={bannerForm.cta.target}
                        onChange={(e) => setBannerForm({...bannerForm, cta: {...bannerForm.cta, target: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      >
                        <option value="_self">Same Tab</option>
                        <option value="_blank">New Tab</option>
                        <option value="_parent">Parent Frame</option>
                        <option value="_top">Top Frame</option>
                      </select>
                  </div>
              </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action URL/Link</label>
                    <input
                      type="text"
                      value={bannerForm.cta.link}
                      onChange={(e) => setBannerForm({...bannerForm, cta: {...bannerForm.cta, link: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="https://... or /page-path"
                    />
            </div>
          </div>

                {/* Display Rules */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Display Rules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Show On Pages</label>
                      <select
                        multiple
                        value={bannerForm.displayRules.showOnPages}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setBannerForm({
                            ...bannerForm, 
                            displayRules: {...bannerForm.displayRules, showOnPages: selected}
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      >
                        <option value="all">All Pages</option>
                        <option value="home">Home Page</option>
                        <option value="shop">Shop Page</option>
                        <option value="product">Product Pages</option>
                        <option value="category">Category Pages</option>
                        <option value="cart">Cart Page</option>
                        <option value="checkout">Checkout Page</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                      <select
                        multiple
                        value={bannerForm.displayRules.targetAudience}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setBannerForm({
                            ...bannerForm, 
                            displayRules: {...bannerForm.displayRules, targetAudience: selected}
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      >
                        <option value="all">All Users</option>
                        <option value="guest">Guest Users</option>
                        <option value="new_users">New Users</option>
                        <option value="returning">Returning Users</option>
                        <option value="vip">VIP Users</option>
                      </select>
                  </div>
                  </div>
                </div>
                
                {/* Event Date Info */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Event Dates (Auto-Assigned)</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">Start:</span>
                      <span className="ml-2 text-green-800">{new Date(selectedEvent.startDate).toLocaleDateString()}</span>
                  </div>
                    <div>
                      <span className="text-green-700 font-medium">End:</span>
                      <span className="ml-2 text-green-800">{new Date(selectedEvent.endDate).toLocaleDateString()}</span>
                  </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Banner dates are automatically set to match the event schedule. No need to set them manually!
                  </p>
                </div>
                
                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBannerModal(false);
                      resetBannerForm();
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-md"
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
                <h2 className="text-2xl font-bold text-gray-900">Create Discount for {selectedEvent?.name}</h2>
                <p className="text-gray-600 mt-1">This discount will be automatically linked to your event</p>
                </div>
                
              <form onSubmit={handleCreateDiscount} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Name *</label>
                    <input
                      type="text"
                      value={discountForm.name}
                      onChange={(e) => setDiscountForm({...discountForm, name: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter discount name..."
                    />
                  </div>
                        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                          <input
                            type="text"
                      value={discountForm.code}
                      onChange={(e) => setDiscountForm({...discountForm, code: e.target.value.toUpperCase()})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="SUMMER20"
                          />
                        </div>
                </div>

                        <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                    value={discountForm.description}
                    onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})}
                            rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Enter discount description..."
                          />
                        </div>
                        
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                              <select
                      value={discountForm.type}
                      onChange={(e) => setDiscountForm({...discountForm, type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="free_shipping">Free Shipping</option>
                              </select>
                            </div>
                            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Value *</label>
                    <input
                      type="number"
                      value={discountForm.value}
                      onChange={(e) => setDiscountForm({...discountForm, value: parseFloat(e.target.value)})}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="20"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="0.00"
                    />
                          </div>
                </div>
                        
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Uses</label>
                    <input
                      type="number"
                      value={discountForm.maxUses}
                      onChange={(e) => setDiscountForm({...discountForm, maxUses: parseInt(e.target.value)})}
                      min="-1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">-1 for unlimited uses</p>
                            </div>
                            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Uses Per User</label>
                              <input
                                type="number"
                      value={discountForm.maxUsesPerUser}
                      onChange={(e) => setDiscountForm({...discountForm, maxUsesPerUser: parseInt(e.target.value)})}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                              />
                            </div>
                          </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Uses</label>
                    <input
                      type="number"
                      value={discountForm.maxUses}
                      onChange={(e) => setDiscountForm({...discountForm, maxUses: parseInt(e.target.value)})}
                      min="-1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">-1 for unlimited uses</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Uses Per User</label>
                    <input
                      type="number"
                      value={discountForm.maxUsesPerUser}
                      onChange={(e) => setDiscountForm({...discountForm, maxUsesPerUser: parseInt(e.target.value)})}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                      </div>
                    </div>
                    
                {/* Event Date Info */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Event Dates (Auto-Assigned)</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">Start:</span>
                      <span className="ml-2 text-green-800">{new Date(selectedEvent.startDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">End:</span>
                      <span className="ml-2 text-green-800">{new Date(selectedEvent.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Discount dates are automatically set to match the event schedule. No need to set them manually!
                  </p>
                </div>

                {/* Applicable Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Categories</label>
                  <select
                    multiple
                    value={discountForm.applicableCategories}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setDiscountForm({...discountForm, applicableCategories: selected});
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="">Select Categories</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
                    
                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                      <button
                    type="button"
                    onClick={() => {
                      setShowDiscountModal(false);
                      resetDiscountForm();
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                      </button>
                      <button
                    type="submit"
                    className="px-8 py-3 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-md"
                      >
                    Create Discount
                      </button>
                    </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Special Offer Creation Modal */}
      <AnimatePresence>
        {showOfferModal && (
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
                <h2 className="text-2xl font-bold text-gray-900">Create Special Offer for {selectedEvent?.name}</h2>
                <p className="text-gray-600 mt-1">This offer will be automatically linked to your event</p>
                  </div>
                  
              <form onSubmit={handleCreateOffer} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Offer Name *</label>
                    <input
                      type="text"
                      value={offerForm.name}
                      onChange={(e) => setOfferForm({...offerForm, name: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter offer name..."
                    />
                      </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={offerForm.title}
                      onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter offer title..."
                    />
                      </div>
                      </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={offerForm.description}
                    onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Enter offer description..."
                  />
                    </div>
                    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type</label>
                    <select
                      value={offerForm.type}
                      onChange={(e) => setOfferForm({...offerForm, type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="flash_sale">Flash Sale</option>
                      <option value="bundle_deal">Bundle Deal</option>
                      <option value="limited_edition">Limited Edition</option>
                      <option value="early_access">Early Access</option>
                      <option value="exclusive">Exclusive</option>
                    </select>
                      </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Offer Value</label>
                    <input
                      type="text"
                      value={offerForm.offerValue}
                      onChange={(e) => setOfferForm({...offerForm, offerValue: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="e.g., Buy 2 Get 1 Free"
                    />
                      </div>
                    </div>
                    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Products</label>
                    <select
                      multiple
                      value={offerForm.applicableProducts}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setOfferForm({...offerForm, applicableProducts: selected});
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="">Select Products</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Categories</label>
                    <select
                      multiple
                      value={offerForm.applicableCategories}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setOfferForm({...offerForm, applicableCategories: selected});
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="">Select Categories</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                </div>
                    
                {/* Event Date Info */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Event Dates (Auto-Assigned)</h4>
                            </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">Start:</span>
                      <span className="ml-2 text-green-800">{new Date(selectedEvent.startDate).toLocaleDateString()}</span>
                          </div>
                    <div>
                      <span className="text-green-700 font-medium">End:</span>
                      <span className="ml-2 text-green-800">{new Date(selectedEvent.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                  <p className="text-xs text-green-600 mt-2">
                    Special offer dates are automatically set to match the event schedule. No need to set them manually!
                  </p>
                      </div>

                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOfferModal(false);
                      resetOfferForm();
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-md"
                  >
                    Create Offer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin Wheel Creation Modal */}
      <AnimatePresence>
        {showSpinWheelModal && (
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
                <h2 className="text-2xl font-bold text-gray-900">Create Spin Wheel for {selectedEvent?.name}</h2>
                <p className="text-gray-600 mt-1">This spin wheel will be automatically linked to your event</p>
                </div>
                
              <form onSubmit={handleCreateSpinWheel} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spin Wheel Name *</label>
                      <input
                        type="text"
                      value={spinWheelForm.name}
                      onChange={(e) => setSpinWheelForm({...spinWheelForm, name: e.target.value})}
                        required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter spin wheel name..."
                      />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={spinWheelForm.title}
                      onChange={(e) => setSpinWheelForm({...spinWheelForm, title: e.target.value})}
                        required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter spin wheel title..."
                      />
                    </div>
                  </div>
                
                        <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={spinWheelForm.description}
                    onChange={(e) => setSpinWheelForm({...spinWheelForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Enter spin wheel description..."
                  />
                        </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Spins Per User</label>
                    <input
                      type="number"
                      value={spinWheelForm.maxSpinsPerUser}
                      onChange={(e) => setSpinWheelForm({...spinWheelForm, maxSpinsPerUser: parseInt(e.target.value)})}
                      min="1"
                      max="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                        </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cooldown (Hours)</label>
                    <input
                      type="number"
                      value={spinWheelForm.cooldownHours}
                      onChange={(e) => setSpinWheelForm({...spinWheelForm, cooldownHours: parseInt(e.target.value)})}
                      min="1"
                      max="168"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    />
                      </div>
                </div>
                    
                        <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wheel Segments</label>
                  <div className="space-y-3">
                    {spinWheelForm.segments.map((segment, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={segment.name}
                          onChange={(e) => {
                            const newSegments = [...spinWheelForm.segments];
                            newSegments[index].name = e.target.value;
                            setSpinWheelForm({...spinWheelForm, segments: newSegments});
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                          placeholder="Segment name"
                        />
                          <input
                            type="number"
                          value={segment.probability}
                          onChange={(e) => {
                            const newSegments = [...spinWheelForm.segments];
                            newSegments[index].probability = parseInt(e.target.value);
                            setSpinWheelForm({...spinWheelForm, segments: newSegments});
                          }}
                            min="0"
                          max="100"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                          placeholder="%"
                        />
                        <input
                          type="text"
                          value={segment.reward}
                          onChange={(e) => {
                            const newSegments = [...spinWheelForm.segments];
                            newSegments[index].reward = e.target.value;
                            setSpinWheelForm({...spinWheelForm, segments: newSegments});
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                          placeholder="Reward description"
                          />
                        </div>
                    ))}
                      </div>
                  </div>

                {/* Event Date Info */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Event Dates (Auto-Assigned)</h4>
                      </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">Start:</span>
                      <span className="ml-2 text-green-800">{new Date(selectedEvent.startDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">End:</span>
                      <span className="ml-2 text-green-800">{new Date(selectedEvent.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Spin wheel dates are automatically set to match the event schedule. No need to set them manually!
                  </p>
                </div>
                
                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                    <button
                    type="button"
                    onClick={() => {
                      setShowSpinWheelModal(false);
                      resetSpinWheelForm();
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    className="px-8 py-3 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-md"
                    >
                    Create Spin Wheel
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
