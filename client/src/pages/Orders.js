import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiPackage, 
  FiCalendar, 
  FiDollarSign, 
  FiMapPin, 
  FiEye, 
  FiFilter, 
  FiSearch, 
  FiDownload,
  FiRefreshCw,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTruck,
  FiCreditCard,
  FiUser
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Orders = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  const getUserId = () => {
    if (user?.id) return user.id;
    if (user?.userId) return user.userId;
    const stored = localStorage.getItem('userId');
    if (stored) return parseInt(stored, 10);
    if (process.env.REACT_APP_DEFAULT_USER_ID) {
      return parseInt(process.env.REACT_APP_DEFAULT_USER_ID, 10);
    }
    return null;
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) {
        setOrders([]);
        return;
      }
      const response = await api.get(`/api/orders/user/${userId}`);
      const list = Array.isArray(response.data) ? response.data : [];
      const normalized = list.map((order) => ({
        ...order,
        _id: order.id || order._id,
        id: order.id || order._id,
        orderNumber: order.orderNumber,
        total: order.totalAmount || order.total || 0,
        status: order.status?.toLowerCase() || 'pending',
        date: order.orderDate,
        items: (order.orderItems || []).map((item) => ({
          _id: item.productId,
          id: item.productId,
          name: item.productName,
          quantity: item.quantity,
          price: item.price || item.itemTotal || 0
        }))
      }));
      setOrders(normalized);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [showError, user]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [fetchOrders, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'processing': return <FiRefreshCw className="w-4 h-4" />;
      case 'shipped': return <FiTruck className="w-4 h-4" />;
      case 'completed': return <FiCheckCircle className="w-4 h-4" />;
      case 'cancelled': return <FiAlertCircle className="w-4 h-4" />;
      default: return <FiPackage className="w-4 h-4" />;
    }
  };



  // Filter and search functionality
  useEffect(() => {
    let filtered = [...orders];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        (order.orderNumber || order._id || order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Sort orders
    filtered.sort((a, b) => {
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
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy]);

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalSpent: orders.reduce((sum, o) => sum + (o.total || 0), 0)
  };

  const handleExportOrders = () => {
    // Export functionality placeholder
    showSuccess('Orders export feature coming soon!');
  };

  const handleRefreshOrders = () => {
    fetchOrders();
    showSuccess('Orders refreshed successfully!');
  };



  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-soft">
            <FiUser className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-[#1E1E1E] mb-4">Authentication Required</h2>
          <p className="text-[#6C7A59] mb-8 text-lg">Please log in to view your orders.</p>
          <Link to="/login" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#6C7A59] to-[#9CAF88] text-white font-bold rounded-2xl hover:from-[#9CAF88] hover:to-[#6C7A59] transition-all duration-300 transform hover:scale-105 shadow-lg">
            Go to Login
            <FiUser className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
            <FiPackage className="w-10 h-10 text-white" />
          </div>
          <p className="text-xl text-[#6C7A59] font-medium">Loading your orders...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6C7A59] via-[#D4AF37] to-[#E8B4B8] mb-4">
            MY ORDERS
          </h1>
          <p className="text-xl text-[#6C7A59] font-medium">
            Track your order history and status with precision
          </p>
        </motion.div>

        {/* Enhanced Order Statistics Dashboard with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              title: "Total Orders", 
              value: orderStats.total, 
              icon: FiPackage, 
              color: "from-[#6C7A59] to-[#9CAF88]",
              bgColor: "[#6C7A59]"
            },
            { 
              title: "Total Spent", 
              value: `Rs. ${orderStats.totalSpent.toLocaleString()}`, 
              icon: FiTrendingUp, 
              color: "from-[#D4AF37] to-[#E8B4B8]",
              bgColor: "[#D4AF37]"
            },
            { 
              title: "Completed", 
              value: orderStats.completed, 
              icon: FiCheckCircle, 
              color: "from-[#059669] to-[#9CAF88]",
              bgColor: "[#059669]"
            },
            { 
              title: "Active Orders", 
              value: orderStats.pending + orderStats.processing + orderStats.shipped, 
              icon: FiClock, 
              color: "from-[#9CAF88] to-[#6C7A59]",
              bgColor: "[#9CAF88]"
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group bg-white/95 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative"
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C7A59] font-medium mb-2">{stat.title}</p>
                  <p className="text-3xl font-black text-[#1E1E1E] group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              
              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Controls with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border border-[#6C7A59]/20 shadow-xl mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6C7A59]" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-[#6C7A59]/30 rounded-xl focus:ring-4 focus:ring-[#6C7A59]/20 focus:border-[#6C7A59] transition-all duration-300"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border-2 border-[#6C7A59]/30 rounded-xl focus:ring-4 focus:ring-[#6C7A59]/20 focus:border-[#6C7A59] transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-[#6C7A59]/30 rounded-xl focus:ring-4 focus:ring-[#6C7A59]/20 focus:border-[#6C7A59] transition-all duration-300"
              >
                <option value="date">Sort by Date</option>
                <option value="total">Sort by Total</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
            
            {/* Enhanced Action Buttons with Motion */}
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] text-[#6C7A59] rounded-xl hover:from-[#E6E6FA] hover:to-[#F5F1E8] transition-all duration-300 shadow-lg hover:shadow-xl"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefreshOrders}
                className="p-3 bg-gradient-to-r from-[#D4AF37] to-[#E8B4B8] text-white rounded-xl hover:from-[#E8B4B8] hover:to-[#D4AF37] transition-all duration-300 shadow-lg hover:shadow-xl"
                title="Refresh orders"
              >
                <FiRefreshCw className="w-5 h-5" />
              </motion.button>
              
              <button
                onClick={handleExportOrders}
                className="p-2 bg-[#F5F1E8] text-[#6C7A59] rounded-xl hover:bg-[#E6E6FA] transition-all duration-300"
                title="Export orders"
              >
                <FiDownload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#6C7A59]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="h-12 w-12 text-[#6C7A59]" />
            </div>
            <h2 className="text-3xl font-bold text-[#1E1E1E] mb-4">
              No orders yet
            </h2>
            <p className="text-[#6C7A59] text-lg mb-8 max-w-md mx-auto">
              Start shopping to see your orders here. Your order history will appear here once you make your first purchase.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] text-white font-bold rounded-2xl hover:from-[#5A6A4A] hover:to-[#4A5A3A] transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FiPackage className="mr-3 h-5 w-5" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className={`space-y-6 ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
              : 'space-y-6'
          }`}>
            {filteredOrders.map((order, index) => (
              <div 
                key={order.id || order._id} 
                className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#6C7A59]/20 p-6 hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Enhanced Order Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#1E1E1E] mb-2">
                      Order #{(order.orderNumber || order._id || order.id || '').toString().slice(-8) || 'Unknown'}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-[#6C7A59]">
                      <div className="flex items-center space-x-2">
                        <FiCalendar className="w-4 h-4" />
                        <span>Placed on {new Date(order.createdAt || order.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiClock className="w-4 h-4" />
                        <span>{new Date(order.createdAt || order.date).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 rounded-2xl text-sm font-semibold border-2 ${getStatusColor(order.status)} flex items-center space-x-2`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}</span>
                    </span>
                  </div>
                </div>

                {/* Enhanced Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl border border-[#6C7A59]/20">
                    <div className="w-10 h-10 bg-[#6C7A59] rounded-xl flex items-center justify-center">
                      <FiDollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6C7A59] font-medium">Total</p>
                      <p className="font-bold text-[#1E1E1E] text-lg">Rs. {(order.total || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl border border-[#D4AF37]/20">
                    <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                      <FiPackage className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6C7A59] font-medium">Items</p>
                      <p className="font-bold text-[#1E1E1E] text-lg">{order.items?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl border border-[#9CAF88]/20">
                    <div className="w-10 h-10 bg-[#9CAF88] rounded-xl flex items-center justify-center">
                      <FiCalendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6C7A59] font-medium">Updated</p>
                      <p className="font-bold text-[#1E1E1E] text-lg">
                        {new Date(order.updatedAt || order.createdAt || order.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl border border-[#059669]/20">
                    <div className="w-10 h-10 bg-[#059669] rounded-xl flex items-center justify-center">
                      <FiCreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6C7A59] font-medium">Payment</p>
                      <p className="font-bold text-[#1E1E1E] text-lg capitalize">
                        {order.paymentMethod === 'credit_card' ? 'Card' : 
                         order.paymentMethod === 'cash_on_delivery' ? 'COD' : 
                         order.paymentMethod || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Order Items Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[#1E1E1E] mb-4 flex items-center">
                    <FiPackage className="w-4 h-4 mr-2 text-[#6C7A59]" />
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl border border-[#6C7A59]/20 hover:bg-[#E6E6FA] transition-all duration-300">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
                          {(() => {
                            // The image data is in item.product.images, not item.image
                            let imageUrl = null;
                            
                            if (item.product && item.product.images && item.product.images.length > 0) {
                              // Handle array of image objects
                              if (typeof item.product.images[0] === 'object' && item.product.images[0].url) {
                                imageUrl = item.product.images[0].url;
                              } else if (typeof item.product.images[0] === 'string') {
                                imageUrl = item.product.images[0];
                              }
                            } else if (item.image) {
                              // Fallback to item.image if it exists
                              if (typeof item.image === 'object' && item.image.url) {
                                imageUrl = item.image.url;
                              } else if (typeof item.image === 'string') {
                                imageUrl = item.image;
                              }
                            }
                            
                            if (imageUrl && imageUrl.startsWith('http')) {
                              return <img src={imageUrl} alt={item.name || 'Product'} className="w-full h-full object-cover rounded-2xl" />;
                            }
                            
                            // Fallback to package icon
                            return <FiPackage className="h-8 w-8 text-[#6C7A59]" />;
                          })()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#1E1E1E] mb-1">{item.name || 'Product'}</p>
                          <div className="flex items-center space-x-3 text-xs text-[#6C7A59]">
                            <span className="bg-white px-2 py-1 rounded-full font-medium">{item.selectedColor || 'Default'}</span>
                            <span className="bg-white px-2 py-1 rounded-full font-medium">{item.selectedSize || 'Default'}</span>
                            <span className="bg-white px-2 py-1 rounded-full font-medium">Qty: {item.quantity || 1}</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-[#6C7A59]">
                          Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center space-x-2 bg-[#6C7A59]/20 text-[#6C7A59] px-4 py-2 rounded-full font-medium">
                          <FiPackage className="w-4 h-4" />
                          <span>+{order.items.length - 3} more items</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Shipping Address & Actions */}
                <div className="border-t border-[#6C7A59]/20 pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-[#6C7A59] rounded-lg flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-[#1E1E1E]">Shipping Address</p>
                      </div>
                      <div className="bg-[#F5F1E8]/50 rounded-2xl p-4 border border-[#6C7A59]/20">
                        <p className="text-sm text-[#1E1E1E] font-medium mb-2">
                          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                        </p>
                        <p className="text-sm text-[#6C7A59] leading-relaxed">
                          {order.shippingAddress?.address || 'No address'}<br />
                          {order.shippingAddress?.city || 'No city'}, {order.shippingAddress?.province || order.shippingAddress?.state || 'No province'} {order.shippingAddress?.postalCode || order.shippingAddress?.zipCode || 'No postal code'}<br />
                          {order.shippingAddress?.country || 'Sri Lanka'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-3">
                      <Link
                        to={`/order/${order.id || order._id}`}
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] text-white font-semibold rounded-2xl hover:from-[#5A6A4A] hover:to-[#4A5A3A] transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <FiEye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                      
                      {/* Quick Actions */}
                      <div className="flex space-x-2">
                        <button className="p-2 bg-[#F5F1E8] text-[#6C7A59] rounded-xl hover:bg-[#E6E6FA] transition-all duration-300" title="Track Order">
                          <FiTruck className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-[#F5F1E8] text-[#6C7A59] rounded-xl hover:bg-[#E6E6FA] transition-all duration-300" title="Download Invoice">
                          <FiDownload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 
