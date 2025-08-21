import React, { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { getProductImageUrl } from '../../utils/imageHelpers';
import { AnimatePresence } from 'framer-motion';

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

  // Enhanced order status update with workflow
  const updateOrderStatus = async (orderId, newStatus, notes = '') => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus,
        notes: notes,
        updatedAt: new Date().toISOString()
      });
      
      showSuccess('Order status updated successfully');
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus, lastUpdated: new Date().toISOString() }
          : order
      ));
      
      // If order is being shipped, show fulfillment modal
      if (newStatus === 'shipped' && !fulfillmentData.trackingNumber) {
        setSelectedOrderForFulfillment(orders.find(o => o._id === orderId));
        setShowFulfillmentModal(true);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Failed to update order status');
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
      await updateOrderStatus(selectedOrderForFulfillment._id, 'shipped', 'Order fulfilled and shipped');
      
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

  const statuses = ['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled'];
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'total', label: 'Total' },
    { value: 'status', label: 'Status' }
  ];

  // Enhanced order filtering
  const filteredOrders = orders.filter(order => {
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
  });

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

      {/* Orders List */}
      <motion.div 
        className="space-y-4"
        variants={itemVariants}
      >
        {filteredOrders.map((order) => (
          <motion.div
            key={order._id || order.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-xl flex items-center justify-center">
                  <ShoppingBagIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                  <h3 className="font-semibold text-[#1E1E1E]">{order.user?.name || order.customer || 'Unknown Customer'}</h3>
                  <p className="text-sm text-gray-600">{order.user?.email || order.email || 'No email'}</p>
                  <p className="text-sm text-gray-500">#{order.orderNumber || `ORD-${order._id?.slice(-6) || '000000'}`}</p>
              </div>
            </div>

              <div className="text-right">
                <p className="text-lg font-bold text-[#1E1E1E]">Rs. {(order.total || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-2">{order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}</span>
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Date: {new Date(order.createdAt || order.date).toLocaleDateString()}</p>
                <p>Payment: {order.paymentMethod || 'Not specified'}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderModal(true);
                  }}
                  className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Details
                </button>
                
                {/* Status Update Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => updateOrderStatus(order._id || order.id, 'pending')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      order.status === 'pending' 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                    title="Mark as Pending"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order._id || order.id, 'processing')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      order.status === 'processing' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    title="Mark as Processing"
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order._id || order.id, 'shipped')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      order.status === 'shipped' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                    title="Mark as Shipped"
                  >
                    Shipped
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order._id || order.id, 'completed')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      order.status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    title="Mark as Completed"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order._id || order.id, 'cancelled')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      order.status === 'cancelled' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    title="Cancel Order"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <motion.div 
          className="text-center py-12"
          variants={itemVariants}
        >
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria
          </p>
                <button
                  onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
                  }}
            className="px-4 py-2 bg-[#6C7A59] text-white rounded-xl hover:bg-[#5A6A4A] transition-colors"
                >
            Clear Filters
                </button>
        </motion.div>
      )}

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
                        updateOrderStatus(selectedOrder._id || selectedOrder.id, e.target.value);
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
                      updateOrderStatus(orderDetails._id, e.target.value);
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
    </motion.div>
  );
};

export default Orders; 