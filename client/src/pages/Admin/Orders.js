import React, { useState, useEffect } from 'react';
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setOrders([
        {
          id: '#ORD-001',
          customer: 'John Doe',
          email: 'john@example.com',
          total: 299.99,
          status: 'completed',
          date: '2024-01-15',
          items: 3,
          paymentMethod: 'Credit Card'
        },
        {
          id: '#ORD-002',
          customer: 'Jane Smith',
          email: 'jane@example.com',
          total: 149.50,
          status: 'pending',
          date: '2024-01-14',
          items: 2,
          paymentMethod: 'PayPal'
        },
        {
          id: '#ORD-003',
          customer: 'Mike Johnson',
          email: 'mike@example.com',
          total: 89.99,
          status: 'processing',
          date: '2024-01-14',
          items: 1,
          paymentMethod: 'Credit Card'
        },
        {
          id: '#ORD-004',
          customer: 'Sarah Wilson',
          email: 'sarah@example.com',
          total: 199.99,
          status: 'shipped',
          date: '2024-01-13',
          items: 4,
          paymentMethod: 'Credit Card'
        },
        {
          id: '#ORD-005',
          customer: 'David Brown',
          email: 'david@example.com',
          total: 79.99,
          status: 'cancelled',
          date: '2024-01-12',
          items: 1,
          paymentMethod: 'PayPal'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const statuses = ['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled'];
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'total', label: 'Total' },
    { value: 'status', label: 'Status' }
  ];

  const filteredOrders = orders
    .filter(order => 
      (order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === 'all' || order.status === selectedStatus)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'total':
          return b.total - a.total;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'processing':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'shipped':
        return <TruckIcon className="h-4 w-4" />;
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
            key={order.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-xl flex items-center justify-center">
                  <ShoppingBagIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E1E1E]">{order.customer}</h3>
                  <p className="text-sm text-gray-600">{order.email}</p>
                  <p className="text-sm text-gray-500">{order.id}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-[#1E1E1E]">${order.total}</p>
                <p className="text-sm text-gray-600">{order.items} items</p>
                <p className="text-sm text-gray-500">{order.paymentMethod}</p>
              </div>

              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize">{order.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{order.date}</p>
              </div>

              <div className="flex space-x-2">
                <button className="flex items-center justify-center px-3 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                  <TruckIcon className="h-4 w-4" />
                </button>
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
                ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Orders; 