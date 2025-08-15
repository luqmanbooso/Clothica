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
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  FireIcon,
  StarIcon,
  GiftIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
      averageOrderValue: 0,
    conversionRate: 0,
      growthRate: 0
    },
    recentOrders: [],
    topProducts: [],
    inventoryAlerts: [],
    eventInsights: [],
    smartRecommendations: [],
    revenueTrends: [],
    userGrowth: [],
    campaignPerformance: [],
    inventoryOverview: {},
    realTimeMetrics: {}
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 days

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, ordersRes, productsRes, inventoryRes, eventsRes, analyticsRes, campaignRes, inventoryOverviewRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/orders?limit=5'),
        axios.get('/api/admin/products?limit=4'),
        axios.get('/api/smart-inventory/alerts/low-stock'),
        axios.get('/api/events?status=active&limit=3'),
        axios.get(`/api/admin/analytics?range=${timeRange}&period=month`),
        axios.get('/api/events?status=active'),
        axios.get('/api/smart-inventory/analytics/overview')
      ]);

      setDashboardData({
        overview: overviewRes.data.overview || {},
        recentOrders: ordersRes.data.orders || [],
        topProducts: productsRes.data.products || [],
        inventoryAlerts: inventoryRes.data || [],
        eventInsights: eventsRes.data.events || [],
        smartRecommendations: generateSmartRecommendations(overviewRes.data, inventoryRes.data, eventsRes.data.events),
        revenueTrends: analyticsRes.data.revenueData || [],
        userGrowth: analyticsRes.data.userData || [],
        campaignPerformance: generateCampaignPerformance(campaignRes.data.events || []),
        inventoryOverview: inventoryOverviewRes.data || {},
        realTimeMetrics: generateRealTimeMetrics(overviewRes.data, inventoryRes.data, eventsRes.data.events)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [showError, timeRange]);

  // Generate smart recommendations based on data
  const generateSmartRecommendations = (overview, inventory, events) => {
    const recommendations = [];
    
    if (overview.conversionRate < 0.03) {
      recommendations.push({
        type: 'warning',
        title: 'Low Conversion Rate',
        message: 'Consider optimizing product pages and checkout flow',
        action: 'Review Analytics',
        priority: 'high',
        icon: 'ChartBarIcon'
      });
    }

    if (inventory && inventory.length > 5) {
      recommendations.push({
        type: 'alert',
        title: 'Multiple Low Stock Items',
        message: `${inventory.length} products need restocking`,
        action: 'View Inventory',
        priority: 'high',
        icon: 'ExclamationTriangleIcon'
      });
    }

    if (events && events.length === 0) {
      recommendations.push({
        type: 'info',
        title: 'No Active Campaigns',
        message: 'Create marketing campaigns to boost sales',
        action: 'Create Campaign',
        priority: 'medium',
        icon: 'CalendarIcon'
      });
    }

    if (overview.averageOrderValue < 50) {
      recommendations.push({
        type: 'suggestion',
        title: 'Low Average Order Value',
        message: 'Consider bundle deals and upselling strategies',
        action: 'Review Products',
        priority: 'medium',
        icon: 'GiftIcon'
      });
    }

    return recommendations;
  };

  // Generate campaign performance metrics
  const generateCampaignPerformance = (events) => {
    if (!events || events.length === 0) return [];
    
    return events.map(event => ({
      id: event._id,
      name: event.name,
      type: event.type,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      bannerCount: event.campaign?.banners?.length || 0,
      discountCount: event.campaign?.discounts?.length || 0,
      targetCategories: event.campaign?.products?.categories?.length || 0,
      isActive: event.isActive
    }));
  };

  // Generate real-time metrics
  const generateRealTimeMetrics = (overview, inventory, events) => {
    return {
      lowStockCount: inventory?.length || 0,
      activeCampaigns: events?.filter(e => e.isActive && e.status === 'active').length || 0,
      todayOrders: overview.todayOrders || 0,
      todayRevenue: overview.todayRevenue || 0,
      pendingOrders: overview.pendingOrders || 0
    };
  };

  // Auto-refresh dashboard
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchDashboardData, refreshInterval]);

  // Handle quick actions
  const handleQuickAction = (action) => {
    switch (action) {
      case 'addProduct':
        window.location.href = '/admin/products';
        break;
      case 'viewOrders':
        window.location.href = '/admin/orders';
        break;
      case 'manageCoupons':
        window.location.href = '/admin/coupons';
        break;
      case 'manageBanners':
        window.location.href = '/admin/banners';
        break;
      case 'manageEvents':
        window.location.href = '/admin/events';
        break;
      case 'inventory':
        window.location.href = '/admin/inventory';
        break;
      default:
        break;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get alert color
  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'alert': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Time Range Selector */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Real-time insights and intelligent recommendations</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Refresh
            </button>
            </div>
          </div>
        </div>

      {/* Real-Time Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Today's Orders</p>
              <p className="text-2xl font-bold">{dashboardData.realTimeMetrics.todayOrders || 0}</p>
            </div>
            <ShoppingCartIcon className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Today's Revenue</p>
              <p className="text-2xl font-bold">${(dashboardData.realTimeMetrics.todayRevenue || 0).toLocaleString()}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Campaigns</p>
              <p className="text-2xl font-bold">{dashboardData.realTimeMetrics.activeCampaigns || 0}</p>
            </div>
            <CalendarIcon className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Low Stock Items</p>
              <p className="text-2xl font-bold">{dashboardData.realTimeMetrics.lowStockCount || 0}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 opacity-80" />
                </div>
            </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Orders</p>
              <p className="text-2xl font-bold">{dashboardData.realTimeMetrics.pendingOrders || 0}</p>
            </div>
            <ClockIcon className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

      {/* Main Dashboard Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'campaigns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Campaign Performance
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Smart Insights
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trends Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* User Growth Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Users']} />
                    <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Total Revenue</h4>
                <p className="text-2xl font-bold text-blue-600">${(dashboardData.overview.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Total Orders</h4>
                <p className="text-2xl font-bold text-green-600">{dashboardData.overview.totalOrders || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Total Users</h4>
                <p className="text-2xl font-bold text-purple-600">{dashboardData.overview.totalUsers || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900">Conversion Rate</h4>
                <p className="text-2xl font-bold text-yellow-600">{((dashboardData.overview.conversionRate || 0) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Performance Tab */}
        {activeTab === 'campaigns' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Campaigns</h3>
              {dashboardData.campaignPerformance.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active campaigns</h3>
                  <p className="mt-1 text-sm text-gray-500">Create your first marketing campaign to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.campaignPerformance.map((campaign) => (
                    <div key={campaign.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Type: {campaign.type}</p>
                        <p>Banners: {campaign.bannerCount}</p>
                        <p>Discounts: {campaign.discountCount}</p>
                        <p>Target Categories: {campaign.targetCategories}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campaign Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Total Campaigns</h4>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.campaignPerformance.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Active Campaigns</h4>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.campaignPerformance.filter(c => c.isActive && c.status === 'active').length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Total Banners</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData.campaignPerformance.reduce((total, c) => total + c.bannerCount, 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Analytics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* User Analytics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analytics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Users']} />
                    <Bar dataKey="users" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
                </div>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Growth Rate</h4>
                <p className="text-2xl font-bold text-blue-600">{((dashboardData.overview.growthRate || 0) * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Average Order Value</h4>
                <p className="text-2xl font-bold text-green-600">${(dashboardData.overview.averageOrderValue || 0).toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Total Products</h4>
                <p className="text-2xl font-bold text-purple-600">{dashboardData.overview.totalProducts || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900">Time Range</h4>
                <p className="text-2xl font-bold text-yellow-600">{timeRange} days</p>
            </div>
          </div>
        </div>
        )}

        {/* Smart Insights Tab */}
        {activeTab === 'recommendations' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Intelligent Recommendations</h3>
              {dashboardData.smartRecommendations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">All systems optimal</h3>
                  <p className="mt-1 text-sm text-gray-500">No immediate actions required.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.smartRecommendations.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      rec.type === 'alert' ? 'bg-red-50 border-red-400' :
                      rec.type === 'info' ? 'bg-blue-50 border-blue-400' :
                      'bg-green-50 border-green-400'
                    }`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {rec.type === 'warning' ? (
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                          ) : rec.type === 'alert' ? (
                            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                          ) : rec.type === 'info' ? (
                            <BellIcon className="h-5 w-5 text-blue-400" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                          <div className="mt-2">
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                              {rec.action} →
                            </button>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                </div>
            </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="flex flex-wrap gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  Create Campaign
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                  View Inventory
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
                  Review Analytics
                </button>
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm">
                  Manage Products
                </button>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => handleQuickAction('addProduct')}
            className="flex flex-col items-center gap-2 p-4 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors"
          >
            <CubeIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Add Product</span>
          </button>
          
          <button
            onClick={() => handleQuickAction('viewOrders')}
            className="flex flex-col items-center gap-2 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            <span className="text-sm font-medium">View Orders</span>
          </button>
          
          <button
            onClick={() => handleQuickAction('manageCoupons')}
            className="flex flex-col items-center gap-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <GiftIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Manage Coupons</span>
          </button>
          
          <button
            onClick={() => handleQuickAction('manageBanners')}
            className="flex flex-col items-center gap-2 p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <TagIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Manage Banners</span>
          </button>
          
          <button
            onClick={() => handleQuickAction('manageEvents')}
            className="flex flex-col items-center gap-2 p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <CalendarIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Manage Events</span>
          </button>
          
          <button
            onClick={() => handleQuickAction('inventory')}
            className="flex flex-col items-center gap-2 p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <ExclamationTriangleIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Inventory</span>
          </button>
        </div>
      </motion.div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button
              onClick={() => handleQuickAction('viewOrders')}
              className="text-sm text-[#6C7A59] hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {dashboardData.recentOrders.slice(0, 5).map((order, index) => (
              <div key={order._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#6C7A59] rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {order.customerName ? order.customerName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                    <p className="font-medium text-sm">{order.customerName || 'Customer'}</p>
                    <p className="text-xs text-gray-500">{order._id || 'Order ID'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(order.totalAmount)}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            <button
              onClick={() => handleQuickAction('addProduct')}
              className="text-sm text-[#6C7A59] hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {dashboardData.topProducts.slice(0, 5).map((product, index) => (
              <div key={product._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {product.name ? product.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                    <p className="font-medium text-sm">{product.name || 'Product'}</p>
                    <p className="text-xs text-gray-500">{product.category || 'Category'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(product.price)}</p>
                  <div className="flex items-center gap-1 text-xs text-yellow-600">
                    <StarIcon className="h-3 w-3 fill-current" />
                    {product.rating || '4.5'}
                  </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      {dashboardData.revenueTrends.length > 0 && (
      <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#6C7A59" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
        </div>
      </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard; 