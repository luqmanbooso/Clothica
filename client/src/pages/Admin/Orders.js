import React, { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
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
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';
import { AnimatePresence } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus
      });
      showSuccess('Order status updated successfully');
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Failed to update order status');
    }
  };

  const statuses = ['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled'];
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'total', label: 'Total' },
    { value: 'status', label: 'Status' }
  ];

  const filteredOrders = orders
    .filter(order => 
      (order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.id?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === 'all' || order.status === selectedStatus)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'total':
          return b.total - a.total;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-all duration-200"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-[#1E1E1E]">
                  Order Details - #{selectedOrder._id?.slice(-8) || selectedOrder.id}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOrder.user?.name || selectedOrder.customer || 'Unknown'}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.user?.email || selectedOrder.email || 'No email'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.user?.phone || 'No phone'}</p>
                    <p><span className="font-medium">Order Date:</span> {new Date(selectedOrder.createdAt || selectedOrder.date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1) || 'Unknown'}
                      </span>
                    </p>
                    <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod || 'Not specified'}</p>
                    <p><span className="font-medium">Total Items:</span> {selectedOrder.items?.length || 0}</p>
                    <p><span className="font-medium">Total Amount:</span> Rs. {(selectedOrder.total || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name || 'Product Name'}</p>
                          <p className="text-sm text-gray-600">SKU: {item.sku || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">Rs. {(item.price || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}<br />
                      {selectedOrder.shippingAddress.address || 'No address'}<br />
                      {selectedOrder.shippingAddress.city || 'No city'}, {selectedOrder.shippingAddress.province || selectedOrder.shippingAddress.state || 'No province'} {selectedOrder.shippingAddress.postalCode || selectedOrder.shippingAddress.zipCode || 'No postal code'}<br />
                      {selectedOrder.shippingAddress.country || 'Sri Lanka'}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Email: {selectedOrder.shippingAddress.email || 'No email'}</p>
                      <p>Phone: {selectedOrder.shippingAddress.phone || 'No phone'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                                 <button
                   onClick={() => {
                     // View invoice functionality for admin
                     window.open(`/api/orders/${selectedOrder._id || selectedOrder.id}/invoice`, '_blank');
                   }}
                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                 >
                   View Invoice
                 </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Orders; 