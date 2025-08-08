import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChartBarIcon,
  TicketIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    activeCoupons: 0,
    activeBanners: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    conversionRate: 0,
    averageOrderValue: 0
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalRevenue: 125430,
        totalOrders: 1247,
        totalUsers: 8923,
        totalProducts: 156,
        pendingOrders: 23,
        activeCoupons: 8,
        activeBanners: 3
      });
      
      setQuickStats({
        todayRevenue: 2847.50,
        todayOrders: 12,
        conversionRate: 3.2,
        averageOrderValue: 237.29
      });
      
      setRecentOrders([
        {
          id: '#ORD-001',
          customer: 'John Doe',
          amount: 299.99,
          status: 'completed',
          date: '2024-01-15'
        },
        {
          id: '#ORD-002',
          customer: 'Jane Smith',
          amount: 149.50,
          status: 'pending',
          date: '2024-01-14'
        },
        {
          id: '#ORD-003',
          customer: 'Mike Johnson',
          amount: 89.99,
          status: 'processing',
          date: '2024-01-14'
        },
        {
          id: '#ORD-004',
          customer: 'Sarah Wilson',
          amount: 199.99,
          status: 'completed',
          date: '2024-01-13'
        }
      ]);

      setTopProducts([
        {
          id: 1,
          name: 'Premium Cotton T-Shirt',
          sales: 234,
          revenue: 11700,
          rating: 4.8
        },
        {
          id: 2,
          name: 'Denim Jeans Classic',
          sales: 189,
          revenue: 9450,
          rating: 4.6
        },
        {
          id: 3,
          name: 'Casual Sneakers',
          sales: 156,
          revenue: 7800,
          rating: 4.7
        },
        {
          id: 4,
          name: 'Summer Dress',
          sales: 142,
          revenue: 7100,
          rating: 4.5
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
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
      className="space-y-8"
    >
      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-display font-bold text-[#1E1E1E]">
                ${stats.totalRevenue.toLocaleString()}
              </p>
                              <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+12.5%</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-display font-bold text-[#1E1E1E]">
                {stats.totalOrders.toLocaleString()}
              </p>
                              <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+8.2%</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <ShoppingBagIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-display font-bold text-[#1E1E1E]">
                {stats.totalUsers.toLocaleString()}
              </p>
                              <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+15.3%</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-display font-bold text-[#1E1E1E]">
                {stats.totalProducts}
              </p>
                              <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+5.7%</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <CubeIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
          variants={itemVariants}
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-display font-bold text-[#1E1E1E]">Recent Orders</h3>
            <p className="text-sm text-gray-600 mt-1">Latest orders from your customers</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-lg flex items-center justify-center">
                      <ShoppingBagIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1E1E1E]">{order.customer}</p>
                      <p className="text-sm text-gray-600">{order.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1E1E1E]">${order.amount}</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
          variants={itemVariants}
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-display font-bold text-[#1E1E1E]">Top Products</h3>
            <p className="text-sm text-gray-600 mt-1">Best performing products this month</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-lg flex items-center justify-center">
                      <CubeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1E1E1E]">{product.name}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                        </div>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">{product.sales} sales</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1E1E1E]">${product.revenue}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        variants={itemVariants}
      >
        <h3 className="text-xl font-display font-bold text-[#1E1E1E] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/products" className="flex items-center justify-center p-4 bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </Link>
          <Link to="/admin/orders" className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            View Orders
          </Link>
          <Link to="/admin/coupons" className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <TicketIcon className="h-5 w-5 mr-2" />
            Manage Coupons
          </Link>
          <Link to="/admin/banners" className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <PhotoIcon className="h-5 w-5 mr-2" />
            Manage Banners
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard; 