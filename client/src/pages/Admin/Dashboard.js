import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  CubeIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  FireIcon,
  StarIcon,
  GiftIcon,
  TagIcon,
  BanknotesIcon,
  CreditCardIcon,
  TruckIcon,
  SparklesIcon,
  TrophyIcon,
  HeartIcon,
  ShoppingBagIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { getSocket } from '../../utils/socket';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Dashboard Data - Will be populated from API
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    finance: {},
    clientFeatures: {},
    inventory: {},
    analytics: {},
    realTime: {},
    customerIntelligence: {}
  });



  // Fetch comprehensive dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [overviewRes, clientFeaturesRes, inventoryRes, analyticsRes, realTimeRes, customerIntelligenceRes] = await Promise.all([
        api.get('/api/admin/dashboard/overview'),
        api.get('/api/admin/dashboard/client-features'),
        api.get('/api/admin/dashboard/inventory'),
        api.get(`/api/admin/dashboard/analytics?range=${timeRange}&period=${selectedPeriod}`),
        api.get('/api/admin/dashboard/real-time'),
        api.get(`/api/admin/dashboard/customer-intelligence?range=${timeRange}&period=${selectedPeriod}`)
      ]);

      // Validate and sanitize the data
      const validateData = (data, sectionName) => {
        if (!data || typeof data !== 'object') {
          console.warn(`Invalid ${sectionName} data:`, data);
          return {};
        }
        return data;
      };

        setDashboardData({
        overview: validateData(overviewRes.data, 'overview'),
        finance: {},
        clientFeatures: validateData(clientFeaturesRes.data, 'clientFeatures'),
        inventory: validateData(inventoryRes.data, 'inventory'),
        analytics: validateData(analyticsRes.data, 'analytics'),
        realTime: validateData(realTimeRes.data, 'realTime'),
        customerIntelligence: validateData(customerIntelligenceRes.data, 'customerIntelligence')
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      showError('Failed to load dashboard data');
      setRetryCount(prev => prev + 1);
      
      // Set empty data instead of falling back to mock
      setDashboardData({
        overview: {},
        finance: {},
        clientFeatures: {},
        inventory: {},
        analytics: {},
        realTime: {},
        customerIntelligence: {}
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedPeriod, showError]);

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'addProduct':
        navigate('/admin/products');
        break;
      case 'viewOrders':
        navigate('/admin/orders');
        break;
      case 'manageCoupons':
        navigate('/admin/coupons');
        break;
      case 'manageBanners':
        navigate('/admin/banners');
        break;
      case 'manageEvents':
        navigate('/admin/events');
        break;
      case 'inventory':
        navigate('/admin/inventory');
        break;
      case 'analytics':
        navigate('/admin/analytics');
        break;
      case 'clientFeatures':
        navigate('/admin/client-features');
        break;
      default:
        break;
    }
  };

  // Retry function
  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    fetchDashboardData();
  };

  // Auto-refresh dashboard
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Listen for real-time dashboard updates
  useEffect(() => {
    const socket = getSocket();
    const handleUpdate = (payload) => {
      if (payload) {
        setDashboardData((prev) => ({
          ...prev,
          ...payload
        }));
      } else {
        fetchDashboardData();
      }
    };
    socket.on('dashboard:update', handleUpdate);
    return () => {
      socket.off('dashboard:update', handleUpdate);
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  // Check if we have any data and validate it
  const hasData = Object.values(dashboardData).some(section => 
    section && typeof section === 'object' && Object.keys(section).length > 0
  );

  // Data validation helper
  const getSafeValue = (obj, path, defaultValue = 0) => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch (error) {
      console.warn(`Error accessing path ${path}:`, error);
      return defaultValue;
    }
  };

  // Safe number formatting
  const formatNumber = (value, prefix = '') => {
    try {
      const num = Number(value);
      if (isNaN(num)) return `${prefix}0`;
      return `${prefix}${num.toLocaleString()}`;
    } catch (error) {
      console.warn('Error formatting number:', error);
      return `${prefix}0`;
    }
  };

  // Safe percentage formatting
  const formatPercentage = (value, decimals = 1) => {
    try {
      const num = Number(value);
      if (isNaN(num)) return '0%';
      return `${(num * 100).toFixed(decimals)}%`;
    } catch (error) {
      console.warn('Error formatting percentage:', error);
      return '0%';
    }
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {error ? 'Failed to load dashboard data' : 'No data available'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {error 
              ? 'There was an error loading your dashboard data. Please try again.'
              : 'Dashboard data will appear here once orders and products are added.'
            }
          </p>
          {error && (
            <p className="mt-2 text-xs text-red-500">
              Error: {error}
            </p>
          )}
          <div className="mt-6 space-x-3">
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#6C7A59] hover:bg-[#5A6B4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C7A59]"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              {retryCount > 0 ? `Retry (${retryCount})` : 'Retry'}
            </button>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C7A59]"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor your business performance and manage operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#6C7A59] hover:bg-[#5A6B4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C7A59] disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Status Indicator */}
      {hasData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Dashboard Data Loaded Successfully
              </span>
            </div>
            <div className="text-xs text-blue-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-700">
            {Object.entries(dashboardData).map(([section, data]) => (
              <span key={section} className="inline-block mr-3">
                {section}: {data && Object.keys(data).length > 0 ? '' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { name: 'Add Product', icon: PlusIcon, action: 'addProduct', color: 'bg-blue-500' },
          { name: 'View Orders', icon: ShoppingCartIcon, action: 'viewOrders', color: 'bg-green-500' },
          { name: 'Manage Coupons', icon: TagIcon, action: 'manageCoupons', color: 'bg-purple-500' },
          { name: 'Manage Events', icon: CalendarIcon, action: 'manageEvents', color: 'bg-orange-500' },
          { name: 'Inventory', icon: CubeIcon, action: 'inventory', color: 'bg-red-500' }
        ].map((item) => (
          <motion.button
            key={item.name}
            onClick={() => handleQuickAction(item.action)}
            className={`${item.color} text-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <item.icon className="h-8 w-8 mx-auto mb-2" />
            <span className="text-sm font-medium">{item.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Revenue',
            value: formatNumber(getSafeValue(dashboardData, 'overview.totalRevenue'), 'LKR '),
            change: `+${formatPercentage(getSafeValue(dashboardData, 'overview.growthRate'))}`,
            icon: CurrencyDollarIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          },
          {
            title: 'Total Orders',
            value: formatNumber(getSafeValue(dashboardData, 'overview.totalOrders')),
            change: `+${formatPercentage(getSafeValue(dashboardData, 'overview.growthRate'))}`,
            icon: ShoppingCartIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Total Users',
            value: formatNumber(getSafeValue(dashboardData, 'overview.totalUsers')),
            change: `+${formatPercentage(getSafeValue(dashboardData, 'overview.growthRate'))}`,
            icon: UsersIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          },
          {
            title: 'Profit Margin',
            value: formatPercentage(getSafeValue(dashboardData, 'finance.profitMargin')),
            change: `+${formatPercentage(getSafeValue(dashboardData, 'finance.monthlyGrowth'))}`,
            icon: BanknotesIcon,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100'
          }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className={`text-sm font-medium ${card.color}`}>{card.change}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'clientFeatures', name: 'Client Features', icon: SparklesIcon },
              { id: 'inventory', name: 'Inventory', icon: CubeIcon },
              { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
              { id: 'customerIntelligence', name: 'Customer Intelligence', icon: UsersIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Revenue Trends Chart */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dashboardData.analytics?.revenueTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Revenue']} />
                      <Area type="monotone" dataKey="value" stroke="#6C7A59" fill="#6C7A59" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Orders & Top Products */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                    <div className="space-y-3">
                      {(dashboardData.analytics?.topProducts || []).slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <CubeIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product?.name || 'Unknown Product'}</p>
                              <p className="text-sm text-gray-600">{product?.sales || 0} sales</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">LKR {(product?.revenue || 0).toLocaleString()}</p>
                            <p className="text-sm text-green-600">+LKR {(product?.profit || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                        data={dashboardData.analytics?.customerSegments || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ segment, percent }) => `${segment} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                        {(dashboardData.analytics?.customerSegments || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#6C7A59', '#D6BFAF', '#B35D5D', '#9CAF88'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'clientFeatures' && (
              <motion.div
                key="clientFeatures"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Loyalty features temporarily removed */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Loyalty & Spin Wheel</h3>
                  <p className="text-sm text-yellow-800">These insights are disabled until the backend reinstates loyalty features.</p>
                </div>

                {/* Smart Discounts */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">Smart Discounts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{dashboardData.clientFeatures.smartDiscounts.totalCoupons}</p>
                      <p className="text-sm text-emerald-700">Total Coupons</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">LKR {dashboardData.clientFeatures.smartDiscounts.totalSavings.toLocaleString()}</p>
                      <p className="text-sm text-green-700">Total Savings</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{(dashboardData.clientFeatures.smartDiscounts.conversionRate * 100).toFixed(1)}%</p>
                      <p className="text-sm text-blue-700">Conversion Rate</p>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-emerald-900 mb-3">Popular Coupon Codes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dashboardData.clientFeatures.smartDiscounts.popularCodes.map((coupon, index) => (
                      <div key={index} className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-emerald-600">{coupon.code}</span>
                          <span className="text-sm text-gray-600">{coupon.usage} uses</span>
                        </div>
                        <p className="text-sm text-emerald-700">LKR {coupon.savings.toLocaleString()} saved</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Inventory Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Critical Stock</h3>
                    <p className="text-3xl font-bold text-red-600">{dashboardData.inventory.criticalStock}</p>
                    <p className="text-sm text-red-700">Products need immediate attention</p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">Low Stock</h3>
                    <p className="text-3xl font-bold text-orange-600">{dashboardData.inventory.lowStock}</p>
                    <p className="text-sm text-orange-700">Products need restocking</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">In Stock</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {dashboardData.inventory.totalProducts - dashboardData.inventory.outOfStock - dashboardData.inventory.lowStock - dashboardData.inventory.criticalStock}
                    </p>
                    <p className="text-sm text-green-700">Products with sufficient stock</p>
                  </div>
                </div>

                {/* Stock Value Chart */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Value Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'In Stock', value: dashboardData.inventory.totalProducts - dashboardData.inventory.outOfStock - dashboardData.inventory.lowStock - dashboardData.inventory.criticalStock },
                          { name: 'Low Stock', value: dashboardData.inventory.lowStock },
                          { name: 'Critical Stock', value: dashboardData.inventory.criticalStock },
                          { name: 'Out of Stock', value: dashboardData.inventory.outOfStock }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#F59E0B" />
                        <Cell fill="#EF4444" />
                        <Cell fill="#6B7280" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Profit Trends */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.analytics.profitTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Profit']} />
                      <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* User Growth */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dashboardData.analytics.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Users']} />
                      <Area type="monotone" dataKey="value" stroke="#6C7A59" fill="#6C7A59" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {activeTab === 'customerIntelligence' && (
              <motion.div
                key="customerIntelligence"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Customer Engagement Metrics */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Customer Engagement Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{getSafeValue(dashboardData.customerIntelligence, 'customerEngagement.totalCustomers', 0)}</p>
                      <p className="text-sm text-blue-700">Total Customers</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">{getSafeValue(dashboardData.customerIntelligence, 'customerEngagement.repeatCustomers', 0)}</p>
                      <p className="text-sm text-purple-700">Repeat Customers</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{getSafeValue(dashboardData.customerIntelligence, 'customerEngagement.newCustomers', 0)}</p>
                      <p className="text-sm text-green-700">New Customers</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">Rs. {formatNumber(getSafeValue(dashboardData.customerIntelligence, 'customerEngagement.averageOrderValue', 0))}</p>
                      <p className="text-sm text-orange-700">Avg. Order Value</p>
                    </div>
                  </div>
                </div>

                {/* Product Engagement Analysis */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Top Product Performance</h3>
                  <div className="space-y-3">
                    {(dashboardData.customerIntelligence.productEngagement || []).slice(0, 5).map((product, index) => (
                      <div key={product._id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{product.productName}</p>
                            <p className="text-sm text-gray-600">Rating: {product.averageRating?.toFixed(1) || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">Rs. {formatNumber(product.totalRevenue)}</p>
                          <p className="text-sm text-gray-600">{product.totalPurchases} sold</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loyalty insights removed */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Loyalty Insights</h3>
                  <p className="text-sm text-purple-800">This section is disabled until loyalty returns.</p>
                </div>

                {/* Customer Segmentation */}
                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">Customer Value Segmentation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{getSafeValue(dashboardData.customerIntelligence, 'customerSegments.vipCustomers', 0)}</p>
                      <p className="text-sm text-red-700">VIP Customers</p>
                      <p className="text-xs text-gray-500">Rs. 10,000+ spent</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">{getSafeValue(dashboardData.customerIntelligence, 'customerSegments.highValueCustomers', 0)}</p>
                      <p className="text-sm text-orange-700">High Value</p>
                      <p className="text-xs text-gray-500">Rs. 5,000-10,000</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{getSafeValue(dashboardData.customerIntelligence, 'customerSegments.mediumValueCustomers', 0)}</p>
                      <p className="text-sm text-yellow-700">Medium Value</p>
                      <p className="text-xs text-gray-500">Rs. 1,000-5,000</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-600">{getSafeValue(dashboardData.customerIntelligence, 'customerSegments.lowValueCustomers', 0)}</p>
                      <p className="text-sm text-gray-700">Low Value</p>
                      <p className="text-xs text-gray-500">Under Rs. 1,000</p>
                    </div>
                  </div>
                </div>

                {/* Churn Risk Analysis */}
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">Churn Risk Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{getSafeValue(dashboardData.customerIntelligence, 'churnRisk.atRiskCustomers', 0)}</p>
                      <p className="text-sm text-yellow-700">At Risk (30+ days)</p>
                      <p className="text-xs text-gray-500">No order in 30+ days</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{getSafeValue(dashboardData.customerIntelligence, 'churnRisk.highRiskCustomers', 0)}</p>
                      <p className="text-sm text-red-700">High Risk (60+ days)</p>
                      <p className="text-xs text-gray-500">No order in 60+ days</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{getSafeValue(dashboardData.customerIntelligence, 'churnRisk.totalCustomers', 0) - getSafeValue(dashboardData.customerIntelligence, 'churnRisk.atRiskCustomers', 0) - getSafeValue(dashboardData.customerIntelligence, 'churnRisk.highRiskCustomers', 0)}</p>
                      <p className="text-sm text-green-700">Active Customers</p>
                      <p className="text-xs text-gray-500">Ordered recently</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 


