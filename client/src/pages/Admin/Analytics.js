import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiShoppingCart, FiDollarSign, FiPackage, FiCalendar, FiBarChart } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

const AdminAnalytics = () => {
  const { error: showError } = useToast();
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalProducts: 0,
      averageOrderValue: 0,
      conversionRate: 0
    },
    revenueData: [],
    orderData: [],
    userData: [],
    topProducts: [],
    categoryPerformance: [],
    salesByStatus: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/analytics?range=${dateRange}&period=${selectedPeriod}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      showError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'shipped': return '#8B5CF6';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'refunded': return '#6B7280';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Comprehensive insights into your store performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalOrders.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.averageOrderValue)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(analyticsData.overview.conversionRate)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <FiBarChart className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.orderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value, 'Orders']}
                labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Products</h2>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                  <p className="text-sm text-gray-600">{product.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.categoryPerformance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.categoryPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales by Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales by Order Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.salesByStatus}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
            <Bar dataKey="revenue" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User Growth */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.userData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [value, 'Users']}
              labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminAnalytics;
