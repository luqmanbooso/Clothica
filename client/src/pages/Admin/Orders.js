import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { getProductImageUrl } from '../../utils/imageHelpers';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();
  
  // Enhanced Order Management States
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [lowStockIssues, setLowStockIssues] = useState([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState({
    type: 'full',
    reason: '',
    amount: 0,
    items: []
  });
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  
  // Enhanced Shipping Modal States
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState(null);
  const [shippingData, setShippingData] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
    shippingNotes: '',
    notifyCustomer: true
  });
  
  // Enhanced Status Change Modal States
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [selectedOrderForStatusChange, setSelectedOrderForStatusChange] = useState(null);
  const [statusChangeData, setStatusChangeData] = useState({
    newStatus: '',
    reason: '',
    notes: '',
    notifyCustomer: true
  });
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10); // Orders per page
  const [totalPages, setTotalPages] = useState(1);

  // Order Details & Management
  const [orderDetails, setOrderDetails] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  const [fulfillmentData, setFulfillmentData] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
    notes: ''
  });
  const [selectedOrderForFulfillment, setSelectedOrderForFulfillment] = useState(null);

  // Enhanced Filters
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [customerFilter, setCustomerFilter] = useState('');
  const [paymentMethodFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const generateInvoice = async (orderId) => {
    try {
      setGeneratingInvoice(true);
      const response = await api.get(`/api/admin/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      // Create blob and download - now properly handles PDF from backend
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Invoice generated successfully');
    } catch (error) {
      console.error('Error generating invoice:', error);
      showError('Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Enhanced Ship Complete with shipping details modal
  const handleShipComplete = async (orderId) => {
    try {
      setProcessingAction(true);
      
      // First check inventory
      const inventoryResponse = await api.post(`/api/orders/${orderId}/check-inventory`);
      
      if (!inventoryResponse.data.canShip) {
        // Show low stock modal
        setLowStockIssues(inventoryResponse.data.issues);
        setShowLowStockModal(true);
        setProcessingAction(false);
        return;
      }
      
      // If inventory is sufficient, show shipping details modal
      const order = orders.find(o => o._id === orderId || o.id === orderId);
      setSelectedOrderForShipping(order);
      setShippingData({
        trackingNumber: '',
        carrier: '',
        estimatedDelivery: '',
        shippingNotes: '',
        notifyCustomer: true
      });
      setShowShippingModal(true);
      
    } catch (error) {
      console.error('Error checking inventory:', error);
      const errorMessage = error.response?.data?.message || 'Failed to check inventory';
      
      if (error.response?.data?.issues) {
        setLowStockIssues(error.response.data.issues);
        setShowLowStockModal(true);
      } else {
        showError(errorMessage);
      }
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Process shipping with details
  const processShipping = async () => {
    try {
      setProcessingAction(true);
      
      const response = await api.post(`/api/orders/${selectedOrderForShipping._id}/ship-complete`, {
        trackingNumber: shippingData.trackingNumber,
        carrier: shippingData.carrier,
        estimatedDelivery: shippingData.estimatedDelivery,
        shippingNotes: shippingData.shippingNotes,
        notifyCustomer: shippingData.notifyCustomer
      });
      
      showSuccess('Order shipped successfully with tracking details!');
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === selectedOrderForShipping._id 
          ? { ...order, status: 'shipped', shippedAt: new Date().toISOString() }
          : order
      ));
      
      // Close modal and reset
      setShowShippingModal(false);
      setSelectedOrderForShipping(null);
      setShippingData({ trackingNumber: '', carrier: '', estimatedDelivery: '', shippingNotes: '', notifyCustomer: true });
      
      // Refresh orders after a short delay
      setTimeout(() => {
        fetchOrders();
      }, 2000);
      
    } catch (error) {
      console.error('Error shipping order:', error);
      showError(error.response?.data?.message || 'Failed to ship order');
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Handle refund process
  const handleRefund = async () => {
    try {
      setProcessingAction(true);
      
      const refundPayload = {
        type: refundData.type,
        reason: refundData.reason
      };
      
      if (refundData.type === 'partial') {
        refundPayload.items = refundData.items;
      }
      
      const response = await api.post(`/api/orders/${selectedOrderForRefund._id}/refund`, refundPayload);
      
      showSuccess(`${refundData.type.charAt(0).toUpperCase() + refundData.type.slice(1)} refund processed successfully!`);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === selectedOrderForRefund._id 
          ? { ...order, status: response.data.order.status, refundAmount: response.data.order.totalRefunded }
          : order
      ));
      
      // Reset and close modal
      setRefundData({ type: 'full', reason: '', amount: 0, items: [] });
      setShowRefundModal(false);
      setSelectedOrderForRefund(null);
      
    } catch (error) {
      console.error('Error processing refund:', error);
      showError(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Navigate to inventory management
  const navigateToInventory = (productIds = []) => {
    const queryParams = productIds.length > 0 ? `?filter=low-stock&products=${productIds.join(',')}` : '?filter=low-stock';
    navigate(`/admin/products${queryParams}`);
    setShowLowStockModal(false);
  };
  
  // Enhanced order status update with detailed modal
  const initiateStatusChange = (orderId, newStatus) => {
    const order = orders.find(o => o._id === orderId || o.id === orderId);
    setSelectedOrderForStatusChange(order);
    setStatusChangeData({
      newStatus: newStatus,
      reason: '',
      notes: '',
      notifyCustomer: true
    });
    setShowStatusChangeModal(true);
  };
  
  const processStatusChange = async () => {
    try {
      setProcessingAction(true);
      
      await api.put(`/api/orders/${selectedOrderForStatusChange._id}/status`, {
        status: statusChangeData.newStatus,
        reason: statusChangeData.reason,
        notes: statusChangeData.notes,
        notifyCustomer: statusChangeData.notifyCustomer,
        updatedAt: new Date().toISOString()
      });
      
      showSuccess(`Order status updated to ${statusChangeData.newStatus} successfully!`);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === selectedOrderForStatusChange._id 
          ? { ...order, status: statusChangeData.newStatus, lastUpdated: new Date().toISOString() }
          : order
      ));
      
      // Close modal and reset
      setShowStatusChangeModal(false);
      setSelectedOrderForStatusChange(null);
      setStatusChangeData({ newStatus: '', reason: '', notes: '', notifyCustomer: true });
      
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Failed to update order status');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle order fulfillment
  const handleFulfillment = async () => {
    if (!selectedOrderForFulfillment || !fulfillmentData.trackingNumber || !fulfillmentData.carrier) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      await api.post(`/api/admin/orders/${selectedOrderForFulfillment._id}/fulfill`, {
        trackingNumber: fulfillmentData.trackingNumber,
        carrier: fulfillmentData.carrier,
        estimatedDelivery: fulfillmentData.estimatedDelivery,
        notes: fulfillmentData.notes,
        fulfilledAt: new Date().toISOString()
      });
      
      showSuccess('Order fulfilled successfully');
      
      // Update order status to shipped
      await api.put(`/api/orders/${selectedOrderForFulfillment._id}/status`, {
        status: 'shipped',
        notes: 'Order fulfilled and shipped',
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === selectedOrderForFulfillment._id 
          ? { ...order, status: 'shipped', lastUpdated: new Date().toISOString() }
          : order
      ));
      
      // Reset form
      setFulfillmentData({
        trackingNumber: '',
        carrier: '',
        estimatedDelivery: '',
        notes: ''
      });
      setShowFulfillmentModal(false);
      setSelectedOrderForFulfillment(null);
    } catch (error) {
      console.error('Error fulfilling order:', error);
      showError('Failed to fulfill order');
    }
  };

  // Get order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/api/admin/orders/${orderId}`);
      setOrderDetails(response.data);
      setShowOrderDetailsModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      showError('Failed to load order details');
    }
  };

  const statuses = ['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunded', 'partially_refunded'];
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'total', label: 'Total' },
    { value: 'status', label: 'Status' }
  ];

  // Enhanced order filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        (order.user?.name || order.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.email || order.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderNumber || order._id || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      
      const matchesDateRange = (!dateRange.start || new Date(order.createdAt || order.date) >= new Date(dateRange.start)) &&
                              (!dateRange.end || new Date(order.createdAt || order.date) <= new Date(dateRange.end));
      
      const matchesPriceRange = (!priceRange.min || (order.total || 0) >= parseFloat(priceRange.min)) &&
                               (!priceRange.max || (order.total || 0) <= parseFloat(priceRange.max));
      
      const matchesCustomer = !customerFilter || 
        (order.user?.name || order.customer || '').toLowerCase().includes(customerFilter.toLowerCase());
      
      const matchesPaymentMethod = paymentMethodFilter === 'all' || order.paymentMethod === paymentMethodFilter;
      
      return matchesSearch && matchesStatus && matchesDateRange && matchesPriceRange && 
             matchesCustomer && matchesPaymentMethod;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        case 'total':
          return (b.total || 0) - (a.total || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });
  }, [orders, searchTerm, selectedStatus, dateRange, priceRange, customerFilter, paymentMethodFilter, sortBy]);
  
  // Pagination logic
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginated = filteredOrders.slice(startIndex, endIndex);
    
    // Update total pages
    const totalPagesCount = Math.ceil(filteredOrders.length / ordersPerPage);
    setTotalPages(totalPagesCount);
    
    return paginated;
  }, [filteredOrders, currentPage, ordersPerPage]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, dateRange, priceRange, customerFilter, paymentMethodFilter, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      case 'partially_refunded':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'processing':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'shipped':
        return <TruckIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4" />;
      case 'refunded':
      case 'partially_refunded':
        return <ArrowPathIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-[#1E1E1E]">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
      </div>
      </motion.div>
 {/* Summary Stats Footer */}
 <motion.div 
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">
            Showing <span className="text-blue-600">{filteredOrders.length}</span> orders
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              Rs. {filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      </motion.div>

       {/* Stats */}
       <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-display font-bold text-[#1E1E1E]">
                {orders.length}
              </p>
              </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <ShoppingBagIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-display font-bold text-[#1E1E1E]">
                {orders.filter(o => o.status === 'completed').length}
              </p>
        </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-white" />
        </div>
        </div>
      </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
      <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-display font-bold text-[#1E1E1E]">
                {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                               <p className="text-2xl font-display font-bold text-[#1E1E1E]">
                   Rs. {orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
                 </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
      </div>
    </div>
      </motion.div>


      {/* Filters and Search */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent transition-all duration-200"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent transition-all duration-200"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-center md:justify-end">
            <span className="text-sm text-gray-600">
              {filteredOrders.length} orders found
            </span>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent text-sm"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Min Price</label>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max Price</label>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent text-sm"
            />
          </div>

          {/* Customer Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer</label>
            <input
              type="text"
              placeholder="Customer name"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Professional Order Cards - Clean Admin Design */}
      <motion.div 
        className="space-y-4"
        variants={itemVariants}
      >
        {paginatedOrders.map((order, index) => {
          const statusConfig = {
            pending: { 
              icon: ClockIcon, 
              bgColor: 'bg-yellow-500', 
              textColor: 'text-yellow-700', 
              bgLight: 'bg-yellow-50',
              borderColor: 'border-yellow-200'
            },
            processing: { 
              icon: ExclamationTriangleIcon, 
              bgColor: 'bg-blue-500', 
              textColor: 'text-blue-700', 
              bgLight: 'bg-blue-50',
              borderColor: 'border-blue-200'
            },
            shipped: { 
              icon: TruckIcon, 
              bgColor: 'bg-purple-500', 
              textColor: 'text-purple-700', 
              bgLight: 'bg-purple-50',
              borderColor: 'border-purple-200'
            },
            completed: { 
              icon: CheckCircleIcon, 
              bgColor: 'bg-green-500', 
              textColor: 'text-green-700', 
              bgLight: 'bg-green-50',
              borderColor: 'border-green-200'
            },
            delivered: { 
              icon: CheckCircleIcon, 
              bgColor: 'bg-green-600', 
              textColor: 'text-green-700', 
              bgLight: 'bg-green-50',
              borderColor: 'border-green-200'
            },
            cancelled: { 
              icon: XMarkIcon, 
              bgColor: 'bg-red-500', 
              textColor: 'text-red-700', 
              bgLight: 'bg-red-50',
              borderColor: 'border-red-200'
            },
            refunded: { 
              icon: ArrowPathIcon, 
              bgColor: 'bg-orange-500', 
              textColor: 'text-orange-700', 
              bgLight: 'bg-orange-50',
              borderColor: 'border-orange-200'
            },
            partially_refunded: { 
              icon: ArrowPathIcon, 
              bgColor: 'bg-amber-500', 
              textColor: 'text-amber-700', 
              bgLight: 'bg-amber-50',
              borderColor: 'border-amber-200'
            }
          };
          
          const config = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          
          return (
            <motion.div
              key={order._id || order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Status Header Bar */}
              <div className={`h-1 ${config.bgColor}`}></div>
              
              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {/* Left: Order Info */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center`}>
                      <StatusIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        #{order.orderNumber || `ORD-${order._id?.slice(-6) || '000000'}`}
                      </h3>
                      <p className="text-gray-600">{order.user?.name || order.customer || 'Unknown Customer'}</p>
                      <p className="text-sm text-gray-500">{order.user?.email || order.email || 'No email'}</p>
                    </div>
                  </div>
                  
                  {/* Right: Amount & Status */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      Rs. {(order.total || 0).toLocaleString()}
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgLight} ${config.textColor} border ${config.borderColor}`}>
                      <StatusIcon className="h-4 w-4 mr-2" />
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                    </div>
                    {order.refundAmount > 0 && (
                      <div className="text-sm text-red-600 mt-1 font-medium">
                        Refunded: Rs. {order.refundAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Order Details */}
                <div className="grid grid-cols-4 gap-6 mb-6 py-4 px-6 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{order.items?.length || 0}</div>
                    <div className="text-sm text-gray-600">Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-600">Order Date</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{order.paymentMethod || 'Credit Card'}</div>
                    <div className="text-xs text-gray-600">Payment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {order.shippedAt ? 
                        new Date(order.shippedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
                        'Not shipped'
                      }
                    </div>
                    <div className="text-xs text-gray-600">Ship Date</div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  {/* Primary Action */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      className="flex items-center px-4 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-sm"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                    
                    {/* Status-Specific Actions */}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => initiateStatusChange(order._id || order.id, 'processing')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        Start Processing
                      </button>
                    )}
                    
                    {order.status === 'processing' && (
                      <button
                        onClick={() => handleShipComplete(order._id || order.id)}
                        disabled={processingAction}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        {processingAction ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <TruckIcon className="h-4 w-4 mr-2" />
                        )}
                        Ship Complete
                      </button>
                    )}
                    
                    {['shipped', 'completed'].includes(order.status) && (
                      <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        {order.status === 'shipped' ? 'Order Shipped' : 'Order Completed'}
                      </div>
                    )}
                    
                    {['cancelled', 'refunded'].includes(order.status) && (
                      <div className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        {order.status === 'cancelled' ? (
                          <XMarkIcon className="h-4 w-4 mr-2" />
                        ) : (
                          <ArrowPathIcon className="h-4 w-4 mr-2" />
                        )}
                        {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Refunded'}
                      </div>
                    )}
                  </div>
                  
                  {/* Secondary Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Refund Button */}
                    {['processing', 'shipped', 'completed'].includes(order.status) && (
                      <button
                        onClick={() => {
                          setSelectedOrderForRefund(order);
                          setRefundData({ type: 'full', reason: '', amount: order.total, items: [] });
                          setShowRefundModal(true);
                        }}
                        className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm shadow-sm"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Refund
                      </button>
                    )}
                    
                    {/* More Actions - Only show if there are available actions */}
                    {(() => {
                      const availableActions = [];
                      
                      // Check what actions are available for this order
                      if (order.status !== 'pending') availableActions.push('pending');
                      if (order.status !== 'processing' && !['shipped', 'completed', 'delivered'].includes(order.status)) availableActions.push('processing');
                      if (!['cancelled', 'refunded'].includes(order.status)) availableActions.push('cancel');
                      
                      // Only render if there are actions available
                      if (availableActions.length === 0) return null;
                      
                      return (
                        <div className="relative group">
                          <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 overflow-hidden">
                            <div className="py-1">
                              {order.status !== 'pending' && (
                                <button
                                  onClick={() => initiateStatusChange(order._id || order.id, 'pending')}
                                  className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors"
                                >
                                  <ClockIcon className="h-4 w-4 mr-3" />
                                  Mark as Pending
                                </button>
                              )}
                              {order.status !== 'processing' && !['shipped', 'completed', 'delivered'].includes(order.status) && (
                                <button
                                  onClick={() => initiateStatusChange(order._id || order.id, 'processing')}
                                  className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                                >
                                  <ExclamationTriangleIcon className="h-4 w-4 mr-3" />
                                  Mark as Processing
                                </button>
                              )}
                              {!['cancelled', 'refunded'].includes(order.status) && (
                                <button
                                  onClick={() => initiateStatusChange(order._id || order.id, 'cancelled')}
                                  className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors border-t border-gray-100"
                                >
                                  <XMarkIcon className="h-4 w-4 mr-3" />
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Pagination Controls */}
      {filteredOrders.length > 0 && (
        <motion.div 
          className="bg-white rounded-xl border border-gray-200 p-4 mt-6"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            {/* Left: Results Info */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * ordersPerPage) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ordersPerPage, filteredOrders.length)}
                </span> of{' '}
                <span className="font-medium">{filteredOrders.length}</span> orders
              </div>
              
              {/* Orders per page info */}
              <div className="text-sm text-gray-500">
                ({ordersPerPage} per page)
              </div>
            </div>
            
            {/* Right: Pagination Buttons */}
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  // Adjust start if we're near the end
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  // First page + ellipsis
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="px-2 py-2 text-sm text-gray-500">...</span>
                      );
                    }
                  }
                  
                  // Visible page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          i === currentPage
                            ? 'text-white bg-[#6C7A59] border border-[#6C7A59]'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  // Last page + ellipsis
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="px-2 py-2 text-sm text-gray-500">...</span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Bottom Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total Revenue: <span className="font-semibold text-green-600">
                Rs. {filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-16"
          variants={itemVariants}
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBagIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || selectedStatus !== 'all' ? 
              'No orders match your current filters. Try adjusting your search criteria.' :
              'No orders have been placed yet. Orders will appear here once customers start purchasing.'
            }
          </p>
          {(searchTerm || selectedStatus !== 'all' || dateRange.start || dateRange.end || priceRange.min || priceRange.max || customerFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setDateRange({ start: '', end: '' });
                setPriceRange({ min: '', max: '' });
                setCustomerFilter('');
                setCurrentPage(1);
              }}
              className="inline-flex items-center px-6 py-3 bg-[#6C7A59] text-white rounded-xl hover:bg-[#5A6A4A] transition-colors font-medium"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Clear All Filters
            </button>
          )}
        </motion.div>
      )}

     
      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
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
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Information</h3>
                      <p className="text-sm text-gray-600">Order ID: #{selectedOrder.orderNumber || `ORD-${selectedOrder._id?.slice(-6) || '000000'}`}</p>
                      <p className="text-sm text-gray-600">Date: {new Date(selectedOrder.createdAt || selectedOrder.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Status: <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1) || 'Unknown'}
                      </span></p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h3>
                      <p className="text-sm text-gray-600">Name: {selectedOrder.user?.name || selectedOrder.customer || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Email: {selectedOrder.user?.email || selectedOrder.email || 'No email'}</p>
                      <p className="text-sm text-gray-600">Phone: {selectedOrder.user?.phone || selectedOrder.phone || 'No phone'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Information</h3>
                      <p className="text-sm text-gray-600">Method: {selectedOrder.paymentMethod || 'Not specified'}</p>
                      <p className="text-sm text-gray-600">Total: <span className="font-bold text-lg text-[#6C7A59]">Rs. {(selectedOrder.total || 0).toLocaleString()}</span></p>
                      <p className="text-sm text-gray-600">Items: {selectedOrder.items?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            {item.product?.images?.[0] ? (
                              <img 
                                src={getProductImageUrl(item.product)} 
                                alt={item.product?.name || item.name} 
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.product?.name || item.name || 'Product'}</h4>
                            <p className="text-sm text-gray-600">SKU: {item.product?.sku || item.sku || 'N/A'}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">Rs. {(item.price || 0).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Total: Rs. {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                {selectedOrder.shippingAddress && (
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.street}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.postalCode}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => generateInvoice(selectedOrder._id || selectedOrder.id)}
                      disabled={generatingInvoice}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {generatingInvoice ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                          Generate Invoice
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                  
                  {/* Status Update */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Update Status:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        initiateStatusChange(selectedOrder._id || selectedOrder.id, e.target.value);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      {showOrderDetailsModal && orderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details - #{orderDetails.orderNumber || orderDetails._id}
                </h2>
                <button
                  onClick={() => {
                    setShowOrderDetailsModal(false);
                    setOrderDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Order Date:</span>
                    <p className="text-gray-900">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails.status)}`}>
                      {orderDetails.status?.charAt(0).toUpperCase() + orderDetails.status?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total:</span>
                    <p className="text-lg font-bold text-green-600">Rs. {(orderDetails.total || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Payment Method:</span>
                    <p className="text-gray-900">{orderDetails.paymentMethod || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-900">{orderDetails.user?.name || orderDetails.customer || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{orderDetails.user?.email || orderDetails.email || 'No email'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-900">{orderDetails.user?.phone || 'No phone'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Customer ID:</span>
                    <p className="text-gray-900">{orderDetails.user?._id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {orderDetails.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.product?.images?.[0] ? (
                            <img 
                              src={getProductImageUrl(item.product)} 
                              alt={item.product?.name || item.name} 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.product?.name || item.name || 'Product'}</h4>
                          <p className="text-sm text-gray-600">SKU: {item.product?.sku || item.sku || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">Rs. {(item.price || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Total: Rs. {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Billing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderDetails.shippingAddress && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-sm text-gray-600">{orderDetails.shippingAddress.street}</p>
                      <p className="text-sm text-gray-600">{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}</p>
                      <p className="text-sm text-gray-600">{orderDetails.shippingAddress.postalCode}</p>
                      <p className="text-sm text-gray-600">{orderDetails.shippingAddress.country}</p>
                    </div>
                  </div>
                )}
                
                {orderDetails.billingAddress && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing Address</h3>
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-sm text-gray-600">{orderDetails.billingAddress.street}</p>
                      <p className="text-sm text-gray-600">{orderDetails.billingAddress.city}, {orderDetails.billingAddress.state}</p>
                      <p className="text-sm text-gray-600">{orderDetails.billingAddress.postalCode}</p>
                      <p className="text-sm text-gray-600">{orderDetails.billingAddress.country}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => generateInvoice(orderDetails._id)}
                    disabled={generatingInvoice}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {generatingInvoice ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        Generate Invoice
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowOrderDetailsModal(false);
                      setOrderDetails(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
                
                {/* Status Update */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Update Status:</span>
                  <select
                    value={orderDetails.status}
                    onChange={(e) => {
                      initiateStatusChange(orderDetails._id, e.target.value);
                      setOrderDetails({ ...orderDetails, status: e.target.value });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fulfillment Modal */}
      {showFulfillmentModal && selectedOrderForFulfillment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Fulfillment - #{selectedOrderForFulfillment.orderNumber || selectedOrderForFulfillment._id}
                </h2>
                <button
                  onClick={() => {
                    setShowFulfillmentModal(false);
                    setSelectedOrderForFulfillment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Customer:</span>
                    <p className="text-gray-900">{selectedOrderForFulfillment.user?.name || selectedOrderForFulfillment.customer}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total:</span>
                    <p className="text-gray-900">Rs. {(selectedOrderForFulfillment.total || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Items:</span>
                    <p className="text-gray-900">{selectedOrderForFulfillment.items?.length || 0}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Order Date:</span>
                    <p className="text-gray-900">{new Date(selectedOrderForFulfillment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Fulfillment Form */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Fulfillment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tracking Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fulfillmentData.trackingNumber}
                      onChange={(e) => setFulfillmentData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                      placeholder="Enter tracking number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Carrier <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={fulfillmentData.carrier}
                      onChange={(e) => setFulfillmentData(prev => ({ ...prev, carrier: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    >
                      <option value="">Select Carrier</option>
                      <option value="FedEx">FedEx</option>
                      <option value="UPS">UPS</option>
                      <option value="USPS">USPS</option>
                      <option value="DHL">DHL</option>
                      <option value="Local Delivery">Local Delivery</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={fulfillmentData.estimatedDelivery}
                    onChange={(e) => setFulfillmentData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={fulfillmentData.notes}
                    onChange={(e) => setFulfillmentData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Additional notes about this fulfillment..."
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                <button
                  onClick={() => {
                    setShowFulfillmentModal(false);
                    setSelectedOrderForFulfillment(null);
                  }}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleFulfillment}
                  className="px-8 py-3 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors shadow-md"
                >
                  Fulfill Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Low Stock Alert Modal */}
      <AnimatePresence>
        {showLowStockModal && (
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
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Inventory Issue Detected</h2>
                      <p className="text-gray-600">Cannot ship order due to insufficient stock</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLowStockModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">Items with Stock Issues</h3>
                  <div className="space-y-3">
                    {lowStockIssues.map((issue, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                        <div>
                          <h4 className="font-medium text-gray-900">{issue.name}</h4>
                          <p className="text-sm text-red-600">{issue.issue}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Requested: <span className="font-medium">{issue.requested}</span></p>
                          <p className="text-sm text-gray-600">Available: <span className="font-medium text-red-600">{issue.available}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2"> Next Steps</h3>
                  <p className="text-blue-800 mb-4">
                    <strong>Oops! Not enough items in stock.</strong> You need to restock these items before shipping. 
                    Click "Resolve Inventory" to go directly to the product management page where you can update stock levels.
                  </p>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                       <strong>Pro Tip:</strong> The system will pre-filter the products page to show only the items with stock issues, 
                      making it easy to update inventory levels quickly.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowLowStockModal(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={() => navigateToInventory(lowStockIssues.map(issue => issue.productId))}
                    className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                    Resolve Inventory
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Refund Modal */}
      <AnimatePresence>
        {showRefundModal && selectedOrderForRefund && (
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
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <ArrowPathIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Process Refund</h2>
                      <p className="text-gray-600">Order #{selectedOrderForRefund.orderNumber || `ORD-${selectedOrderForRefund._id?.slice(-6) || '000000'}`}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowRefundModal(false);
                      setSelectedOrderForRefund(null);
                      setRefundData({ type: 'full', reason: '', amount: 0, items: [] });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Customer:</span>
                      <p className="text-gray-900">{selectedOrderForRefund.user?.name || selectedOrderForRefund.customer || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total:</span>
                      <p className="text-lg font-bold text-green-600">Rs. {(selectedOrderForRefund.total || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrderForRefund.status)}`}>
                        {selectedOrderForRefund.status?.charAt(0).toUpperCase() + selectedOrderForRefund.status?.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Items:</span>
                      <p className="text-gray-900">{selectedOrderForRefund.items?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Refund Type Selection */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="refundType"
                        value="full"
                        checked={refundData.type === 'full'}
                        onChange={(e) => setRefundData(prev => ({ ...prev, type: e.target.value, amount: selectedOrderForRefund.total }))}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Full Refund</div>
                        <div className="text-sm text-gray-600">Refund entire order amount</div>
                        <div className="text-sm font-medium text-green-600">Rs. {(selectedOrderForRefund.total || 0).toLocaleString()}</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="refundType"
                        value="partial"
                        checked={refundData.type === 'partial'}
                        onChange={(e) => setRefundData(prev => ({ ...prev, type: e.target.value, amount: 0 }))}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Partial Refund</div>
                        <div className="text-sm text-gray-600">Select specific items to refund</div>
                        <div className="text-sm font-medium text-orange-600">Custom amount</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Partial Refund Item Selection */}
                {refundData.type === 'partial' && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Items to Refund</h3>
                    <div className="space-y-3">
                      {selectedOrderForRefund.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={refundData.items.some(refundItem => refundItem.itemId === item._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRefundData(prev => ({
                                    ...prev,
                                    items: [...prev.items, { itemId: item._id, quantity: item.quantity }],
                                    amount: prev.amount + (item.price * item.quantity)
                                  }));
                                } else {
                                  setRefundData(prev => ({
                                    ...prev,
                                    items: prev.items.filter(refundItem => refundItem.itemId !== item._id),
                                    amount: prev.amount - (item.price * item.quantity)
                                  }));
                                }
                              }}
                              className="mr-3"
                            />
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              {item.product?.images?.[0] ? (
                                <img 
                                  src={getProductImageUrl(item.product)} 
                                  alt={item.product?.name || item.name} 
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.product?.name || item.name || 'Product'}</h4>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Partial Refund Total:</span>
                        <span className="text-lg font-bold text-orange-600">Rs. {(refundData.amount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Refund Reason */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Reason</h3>
                  <select
                    value={refundData.reason}
                    onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="Customer Request">Customer Request</option>
                    <option value="Product Defect">Product Defect</option>
                    <option value="Wrong Item Sent">Wrong Item Sent</option>
                    <option value="Damaged in Transit">Damaged in Transit</option>
                    <option value="Order Error">Order Error</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Confirmation */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Confirmation Required</h3>
                  <p className="text-red-800 mb-4">
                    <strong>This action is irreversible!</strong><br/>
                    You are about to process a {refundData.type} refund of <strong>Rs. {(refundData.amount || 0).toLocaleString()}</strong>.
                    {refundData.type === 'full' && ' This will refund the entire order amount.'}
                    {refundData.type === 'partial' && ` This will refund ${refundData.items.length} selected item(s).`}
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowRefundModal(false);
                      setSelectedOrderForRefund(null);
                      setRefundData({ type: 'full', reason: '', amount: 0, items: [] });
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleRefund}
                    disabled={!refundData.reason || processingAction || (refundData.type === 'partial' && refundData.items.length === 0)}
                    className="flex items-center px-8 py-3 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    {processingAction ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Confirm Refund - Rs. {(refundData.amount || 0).toLocaleString()}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Shipping Details Modal */}
      <AnimatePresence>
        {showShippingModal && selectedOrderForShipping && (
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
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <TruckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Ship Order</h2>
                      <p className="text-gray-600">Order #{selectedOrderForShipping.orderNumber || `ORD-${selectedOrderForShipping._id?.slice(-6) || '000000'}`}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowShippingModal(false);
                      setSelectedOrderForShipping(null);
                      setShippingData({ trackingNumber: '', carrier: '', estimatedDelivery: '', shippingNotes: '', notifyCustomer: true });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3"> Order Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Customer:</span>
                      <p className="text-gray-900">{selectedOrderForShipping.user?.name || selectedOrderForShipping.customer || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total:</span>
                      <p className="text-lg font-bold text-green-600">Rs. {(selectedOrderForShipping.total || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Items:</span>
                      <p className="text-gray-900">{selectedOrderForShipping.items?.length || 0} items</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Details Form */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4"> Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number *</label>
                      <input
                        type="text"
                        value={shippingData.trackingNumber}
                        onChange={(e) => setShippingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter tracking number"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Carrier *</label>
                      <select
                        value={shippingData.carrier}
                        onChange={(e) => setShippingData(prev => ({ ...prev, carrier: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select carrier</option>
                        <option value="TCS">TCS</option>
                        <option value="Leopards">Leopards</option>
                        <option value="PostEx">PostEx</option>
                        <option value="M&P">M&P Express</option>
                        <option value="BlueEx">BlueEx</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery</label>
                      <input
                        type="date"
                        value={shippingData.estimatedDelivery}
                        onChange={(e) => setShippingData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notification</label>
                      <div className="flex items-center space-x-3 mt-3">
                        <input
                          type="checkbox"
                          id="notifyCustomer"
                          checked={shippingData.notifyCustomer}
                          onChange={(e) => setShippingData(prev => ({ ...prev, notifyCustomer: e.target.checked }))}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notifyCustomer" className="text-sm text-gray-700">
                          Send shipping notification to customer
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Notes (Optional)</label>
                    <textarea
                      value={shippingData.shippingNotes}
                      onChange={(e) => setShippingData(prev => ({ ...prev, shippingNotes: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="3"
                      placeholder="Add any special shipping instructions or notes..."
                    />
                  </div>
                </div>

                {/* Confirmation */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Ready to Ship</h3>
                  <p className="text-green-800 mb-4">
                    This will mark the order as <strong>shipped</strong> and send tracking information to the customer.
                    The order will automatically be marked as <strong>completed</strong> after shipping.
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowShippingModal(false);
                      setSelectedOrderForShipping(null);
                      setShippingData({ trackingNumber: '', carrier: '', estimatedDelivery: '', shippingNotes: '', notifyCustomer: true });
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={processShipping}
                    disabled={!shippingData.trackingNumber || !shippingData.carrier || processingAction}
                    className="flex items-center px-8 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    {processingAction ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Shipping...
                      </>
                    ) : (
                      <>
                        <TruckIcon className="h-4 w-4 mr-2" />
                        Ship Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Status Change Modal */}
      <AnimatePresence>
        {showStatusChangeModal && selectedOrderForStatusChange && (
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
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      statusChangeData.newStatus === 'pending' ? 'bg-yellow-100' :
                      statusChangeData.newStatus === 'processing' ? 'bg-blue-100' :
                      statusChangeData.newStatus === 'cancelled' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {statusChangeData.newStatus === 'pending' && <ClockIcon className="h-6 w-6 text-yellow-600" />}
                      {statusChangeData.newStatus === 'processing' && <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />}
                      {statusChangeData.newStatus === 'cancelled' && <XMarkIcon className="h-6 w-6 text-red-600" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Change Order Status</h2>
                      <p className="text-gray-600">Order #{selectedOrderForStatusChange.orderNumber || `ORD-${selectedOrderForStatusChange._id?.slice(-6) || '000000'}`}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowStatusChangeModal(false);
                      setSelectedOrderForStatusChange(null);
                      setStatusChangeData({ newStatus: '', reason: '', notes: '', notifyCustomer: true });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Status */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3"> Status Change</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrderForStatusChange.status)}`}>
                        {getStatusIcon(selectedOrderForStatusChange.status)}
                        <span className="ml-1">{selectedOrderForStatusChange.status?.charAt(0).toUpperCase() + selectedOrderForStatusChange.status?.slice(1)}</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Current Status</p>
                    </div>
                    <div className="text-2xl text-gray-400">→</div>
                    <div className="text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        statusChangeData.newStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        statusChangeData.newStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                        statusChangeData.newStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {statusChangeData.newStatus === 'pending' && <ClockIcon className="h-4 w-4" />}
                        {statusChangeData.newStatus === 'processing' && <ExclamationTriangleIcon className="h-4 w-4" />}
                        {statusChangeData.newStatus === 'cancelled' && <XMarkIcon className="h-4 w-4" />}
                        <span className="ml-1">{statusChangeData.newStatus?.charAt(0).toUpperCase() + statusChangeData.newStatus?.slice(1)}</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">New Status</p>
                    </div>
                  </div>
                </div>

                {/* Reason Selection */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3"> Reason for Change</h3>
                  <select
                    value={statusChangeData.reason}
                    onChange={(e) => setStatusChangeData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a reason</option>
                    {statusChangeData.newStatus === 'pending' && (
                      <>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="Customer Request">Customer Request</option>
                        <option value="Inventory Check">Inventory Check</option>
                        <option value="Address Verification">Address Verification</option>
                      </>
                    )}
                    {statusChangeData.newStatus === 'processing' && (
                      <>
                        <option value="Payment Confirmed">Payment Confirmed</option>
                        <option value="Ready for Fulfillment">Ready for Fulfillment</option>
                        <option value="Inventory Available">Inventory Available</option>
                      </>
                    )}
                    {statusChangeData.newStatus === 'cancelled' && (
                      <>
                        <option value="Customer Cancellation">Customer Cancellation</option>
                        <option value="Payment Failed">Payment Failed</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Fraud Detection">Fraud Detection</option>
                        <option value="Address Issue">Address Issue</option>
                      </>
                    )}
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Additional Notes */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3"> Additional Notes</h3>
                  <textarea
                    value={statusChangeData.notes}
                    onChange={(e) => setStatusChangeData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    placeholder="Add any additional notes or comments about this status change..."
                  />
                  
                  <div className="flex items-center space-x-3 mt-4">
                    <input
                      type="checkbox"
                      id="notifyCustomerStatus"
                      checked={statusChangeData.notifyCustomer}
                      onChange={(e) => setStatusChangeData(prev => ({ ...prev, notifyCustomer: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifyCustomerStatus" className="text-sm text-gray-700">
                      Send status update notification to customer
                    </label>
                  </div>
                </div>

                {/* Confirmation */}
                <div className={`p-4 rounded-xl border ${
                  statusChangeData.newStatus === 'cancelled' 
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    statusChangeData.newStatus === 'cancelled' ? 'text-red-900' : 'text-blue-900'
                  }`}>
                    {statusChangeData.newStatus === 'cancelled' ? 'Confirm Cancellation' : 'Confirm Status Change'}
                  </h3>
                  <p className={statusChangeData.newStatus === 'cancelled' ? 'text-red-800' : 'text-blue-800'}>
                    {statusChangeData.newStatus === 'cancelled' 
                      ? 'This will cancel the order and may trigger a refund process if payment was already processed.'
                      : `This will change the order status to "${statusChangeData.newStatus}" and update the customer accordingly.`
                    }
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowStatusChangeModal(false);
                      setSelectedOrderForStatusChange(null);
                      setStatusChangeData({ newStatus: '', reason: '', notes: '', notifyCustomer: true });
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={processStatusChange}
                    disabled={!statusChangeData.reason || processingAction}
                    className={`flex items-center px-8 py-3 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md ${
                      statusChangeData.newStatus === 'cancelled' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : statusChangeData.newStatus === 'processing'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {processingAction ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        {statusChangeData.newStatus === 'cancelled' && <XMarkIcon className="h-4 w-4 mr-2" />}
                        {statusChangeData.newStatus === 'processing' && <ExclamationTriangleIcon className="h-4 w-4 mr-2" />}
                        {statusChangeData.newStatus === 'pending' && <ClockIcon className="h-4 w-4 mr-2" />}
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Orders; 

