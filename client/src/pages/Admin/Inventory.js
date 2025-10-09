import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CubeIcon,
  TagIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  FireIcon,
  StarIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Inventory = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({
    overview: {
      totalProducts: 0,
      lowStock: 0,
      criticalStock: 0,
      outOfStock: 0,
      totalValue: 0,
      restockNeeded: 0
    },
    alerts: [],
    recommendations: [],
    trends: [],
    categories: [],
    suppliers: []
  });

  // Enhanced Inventory Management
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(50);
  const [restockReason, setRestockReason] = useState('');
  const [restockNotes, setRestockNotes] = useState('');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState('increase'); // increase, decrease
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [warehouseData, setWarehouseData] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [inventoryView, setInventoryView] = useState('overview'); // overview, alerts, analytics, warehouse, stock-management
  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState({});

  // Enhanced Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [stockLevelFilter, setStockLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('urgency');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch inventory data
  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, alertsRes, recommendationsRes, trendsRes] = await Promise.all([
        axios.get('/api/smart-inventory/analytics/overview'),
        axios.get('/api/smart-inventory/alerts/low-stock'),
        axios.get('/api/smart-inventory/recommendations/restock'),
        axios.get('/api/smart-inventory/analytics/trends?period=30d')
      ]);

      setInventoryData({
        overview: overviewRes.data || {},
        alerts: alertsRes.data || [],
        recommendations: recommendationsRes.data || [],
        trends: trendsRes.data || [],
        categories: [],
        suppliers: []
      });
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      showError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Old useEffect removed - now handled in enhanced useEffect above

  // Enhanced restock handling
  const handleRestock = async (productId, quantity, reason = 'Manual restock', notes = '') => {
    try {
      const response = await axios.patch(`/api/smart-inventory/${productId}/stock`, {
        quantity,
        action: 'restock',
        reason: reason,
        notes: notes,
        warehouse: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
        timestamp: new Date().toISOString()
      });
      
      showSuccess('Product restocked successfully');
      
      // Refresh inventory data
      fetchInventoryData();
      
      // Reset form
      setRestockQuantity(50);
      setRestockReason('');
      setRestockNotes('');
      setShowRestockModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error restocking product:', error);
      showError('Failed to restock product');
    }
  };

  // Handle restock submission
  const handleRestockSubmit = async () => {
    if (!selectedProduct || !restockQuantity || !restockReason) {
      showError('Please fill in all required fields');
      return;
    }

    await handleRestock(
      selectedProduct._id || selectedProduct.id,
      restockQuantity,
      restockReason,
      restockNotes
    );
  };

  // Get stock status color
  const getStockStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      case 'healthy': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get urgency score color
  const getUrgencyColor = (score) => {
    if (score >= 8) return 'text-red-600 bg-red-50';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Filter and sort alerts
  const getFilteredAlerts = () => {
    let filtered = [...inventoryData.alerts];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(alert => alert.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by urgency score
    filtered.sort((a, b) => {
      if (sortBy === 'urgency') {
        return sortOrder === 'desc' ? b.urgencyScore - a.urgencyScore : a.urgencyScore - b.urgencyScore;
      }
      return 0;
    });
    
    return filtered;
  };

  // Enhanced inventory filtering
  const filteredInventoryData = useMemo(() => {
    let filtered = inventoryData.alerts || [];
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.productId?.category === categoryFilter);
    }
    
    if (supplierFilter !== 'all') {
      filtered = filtered.filter(item => item.productId?.supplier?.name === supplierFilter);
    }
    
    if (stockLevelFilter !== 'all') {
      filtered = filtered.filter(item => {
        const stock = item.currentStock || 0;
        const threshold = item.thresholds?.lowStock || 10;
        const critical = item.thresholds?.criticalStock || 5;
        
        switch (stockLevelFilter) {
          case 'critical':
            return stock <= critical;
          case 'low':
            return stock > critical && stock <= threshold;
          case 'out-of-stock':
            return stock === 0;
          default:
            return true;
        }
      });
    }
    
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.lastUpdated || item.createdAt);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        
        if (startDate && endDate) {
          return itemDate >= startDate && itemDate <= endDate;
        } else if (startDate) {
          return itemDate >= startDate;
        } else if (endDate) {
          return itemDate <= endDate;
        }
        return true;
      });
    }
    
    return filtered;
  }, [inventoryData.alerts, categoryFilter, supplierFilter, stockLevelFilter, dateRange]);

  // Get warehouse data
  const fetchWarehouseData = async () => {
    try {
      // For now, using mock data. In a real implementation, you'd fetch from API
      const mockWarehouses = [
        { id: 'main', name: 'Main Warehouse', location: 'Mumbai, India', capacity: 10000, currentStock: 7500 },
        { id: 'north', name: 'North Region', location: 'Delhi, India', capacity: 5000, currentStock: 3200 },
        { id: 'south', name: 'South Region', location: 'Bangalore, India', capacity: 5000, currentStock: 4100 }
      ];
      setWarehouseData(mockWarehouses);
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
      showError('Failed to load warehouse data');
    }
  };

  // Fetch products with stock information
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/admin/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    }
  };

  // Fetch sales data for products
  const fetchSalesData = async () => {
    try {
      const response = await axios.get('/api/admin/orders/analytics/product-sales');
      setSalesData(response.data || {});
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Don't show error for sales data as it's supplementary info
    }
  };

  // Enhanced useEffect to fetch all data
  useEffect(() => {
    fetchInventoryData();
    fetchProducts();
    fetchSalesData();
    fetchWarehouseData();
    
    const interval = setInterval(() => {
      fetchInventoryData();
      fetchProducts();
      fetchSalesData();
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [fetchInventoryData]);

  // Stock adjustment functions
  const handleStockAdjustment = async () => {
    if (!selectedProduct || !adjustmentQuantity || !adjustmentReason) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const quantity = adjustmentType === 'increase' ? Math.abs(adjustmentQuantity) : -Math.abs(adjustmentQuantity);
      
      await axios.patch(`/api/admin/products/${selectedProduct._id}/stock`, {
        quantity,
        action: 'adjustment',
        reason: adjustmentReason,
        notes: `${adjustmentType === 'increase' ? 'Increase' : 'Decrease'} by ${Math.abs(adjustmentQuantity)}`
      });

      showSuccess(`Stock ${adjustmentType}d by ${Math.abs(adjustmentQuantity)} units`);
      setShowAdjustmentModal(false);
      setAdjustmentQuantity(0);
      setAdjustmentReason('');
      fetchProducts();
      fetchInventoryData();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      showError('Failed to adjust stock');
    }
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  const openAdjustmentModal = (product) => {
    setSelectedProduct(product);
    setShowAdjustmentModal(true);
  };

  const openRestockModal = (product) => {
    setSelectedProduct(product);
    setRestockQuantity(product.inventory?.reorderQuantity || 50);
    setShowRestockModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  const filteredAlerts = getFilteredAlerts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Inventory Management</h1>
          <p className="text-gray-600">Intelligent stock monitoring and predictive analytics</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={fetchInventoryData}
            className="px-4 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors"
          >
            <ChartBarIcon className="h-5 w-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-1 shadow-sm border">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'stock-management', label: 'Stock Management', icon: CubeIcon },
            { id: 'alerts', label: 'Alerts', icon: BellIcon },
            { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#6C7A59] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#6C7A59]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">
                {inventoryData.overview.totalProducts || 0}
              </p>
              <p className="text-sm text-[#6C7A59] flex items-center gap-1">
                <CubeIcon className="h-4 w-4" />
                Active inventory
              </p>
            </div>
            <CubeIcon className="h-12 w-12 text-[#6C7A59]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Stock</p>
              <p className="text-3xl font-bold text-gray-900">
                {inventoryData.overview.criticalStock || 0}
              </p>
              <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Need immediate attention
              </p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-gray-900">
                {inventoryData.overview.lowStock || 0}
              </p>
              <p className="text-sm text-yellow-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                Restock soon
              </p>
            </div>
            <ExclamationCircleIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(inventoryData.overview.totalValue || 0)}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CurrencyDollarIcon className="h-4 w-4" />
                Inventory worth
              </p>
            </div>
            <CurrencyDollarIcon className="h-12 w-12 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Smart Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restock Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Restock Recommendations</h3>
            <CogIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {inventoryData.recommendations.length > 0 ? (
              inventoryData.recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">{rec.productName || 'Product'}</p>
                      <p className="text-sm text-blue-700">
                        Current: {rec.currentStock} | Recommended: {rec.recommendedQuantity}
                      </p>
                      <p className="text-xs text-blue-600">
                        Urgency: {rec.urgencyScore}/10
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(rec);
                        setRestockQuantity(rec.recommendedQuantity);
                        setShowRestockModal(true);
                      }}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p>No restock recommendations needed!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Inventory Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock Movement Trends</h3>
            <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          {inventoryData.trends.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={inventoryData.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="quantity" stroke="#6C7A59" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>No trend data available yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Inventory Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
            <p className="text-sm text-gray-600">Products requiring attention</p>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="shoes">Shoes</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
            >
              <option value="urgency">Sort by Urgency</option>
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
            </select>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent text-sm"
            >
              <option value="all">All Categories</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="shoes">Shoes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent text-sm"
            >
              <option value="all">All Suppliers</option>
              <option value="Clothica">Clothica</option>
              <option value="Denim Ltd">Denim Ltd</option>
              <option value="Footwear Inc">Footwear Inc</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Stock Level</label>
            <select
              value={stockLevelFilter}
              onChange={(e) => setStockLevelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent text-sm"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical</option>
              <option value="low">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
          
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
        </div>
        
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    alert.urgencyScore >= 8 ? 'bg-red-100' : 
                    alert.urgencyScore >= 5 ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {alert.urgencyScore >= 8 ? (
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    ) : alert.urgencyScore >= 5 ? (
                      <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
                    ) : (
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">{alert.productName || 'Product'}</p>
                    <p className="text-sm text-gray-600">{alert.category || 'Category'}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(alert.urgencyScore)}`}>
                        Urgency: {alert.urgencyScore}/10
                      </span>
                      <span className="text-xs text-gray-500">
                        Stock: {alert.currentStock} | Threshold: {alert.thresholds?.lowStock || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProduct(alert);
                      setRestockQuantity(alert.recommendedQuantity || 50);
                      setShowRestockModal(true);
                    }}
                    className="px-3 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6A4A] transition-colors text-sm"
                  >
                    Restock
                  </button>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CheckCircleIcon className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-medium">All inventory levels are healthy!</p>
              <p className="text-sm">No alerts to display</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Restock Modal */}
      <AnimatePresence>
        {showRestockModal && selectedProduct && (
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
              className="bg-white rounded-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Restock Product</h3>
                <button
                  onClick={() => setShowRestockModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Product</p>
                  <p className="text-gray-900">{selectedProduct.productName || 'Product'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Current Stock</p>
                  <p className="text-gray-900">{selectedProduct.currentStock || 0}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restock Quantity
                  </label>
                  <input
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={restockReason}
                    onChange={(e) => setRestockReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="">Select Reason</option>
                    <option value="Low stock replenishment">Low stock replenishment</option>
                    <option value="Seasonal restock">Seasonal restock</option>
                    <option value="Supplier delivery">Supplier delivery</option>
                    <option value="Inventory adjustment">Inventory adjustment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse
                  </label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="all">All Warehouses</option>
                    {warehouseData.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} - {warehouse.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={restockNotes}
                    onChange={(e) => setRestockNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Additional notes about this restock..."
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowRestockModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleRestockSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors"
                  >
                    Confirm Restock
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}

      {/* Stock Management Tab */}
      {activeTab === 'stock-management' && (
        <div className="space-y-6">
          {/* Stock Management Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Stock Management</h2>
                <p className="text-gray-600">Manage inventory levels, adjustments, and restocking</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                  <option value="accessories">Accessories</option>
                  <option value="shoes">Shoes</option>
                  <option value="bags">Bags</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Stock Management Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Product Inventory</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales (30d)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products
                    .filter(product => {
                      const matchesSearch = !searchTerm || 
                        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
                      return matchesSearch && matchesCategory;
                    })
                    .map((product) => {
                      const currentStock = product.inventory?.totalStock || 0;
                      const lowThreshold = product.inventory?.lowStockThreshold || 10;
                      const criticalThreshold = product.inventory?.criticalStockThreshold || 5;
                      const productSales = salesData[product._id] || { total: 0, quantity: 0 };
                      
                      let stockStatus = 'healthy';
                      let stockColor = 'text-green-600 bg-green-50';
                      
                      if (currentStock === 0) {
                        stockStatus = 'out-of-stock';
                        stockColor = 'text-red-600 bg-red-50';
                      } else if (currentStock <= criticalThreshold) {
                        stockStatus = 'critical';
                        stockColor = 'text-red-600 bg-red-50';
                      } else if (currentStock <= lowThreshold) {
                        stockStatus = 'low';
                        stockColor = 'text-yellow-600 bg-yellow-50';
                      }

                      return (
                        <motion.tr
                          key={product._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0">
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={product.images?.[0] || '/api/products/placeholder-image'}
                                  alt={product.name}
                                  onError={(e) => {
                                    e.target.src = '/api/products/placeholder-image';
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.brand}</div>
                                <div className="text-xs text-gray-400">SKU: {product.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{currentStock} units</div>
                            <div className="text-xs text-gray-500">
                              Reorder at: {product.inventory?.reorderPoint || 20}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockColor}`}>
                              {stockStatus === 'out-of-stock' ? 'Out of Stock' :
                               stockStatus === 'critical' ? 'Critical' :
                               stockStatus === 'low' ? 'Low Stock' : 'Healthy'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{productSales.quantity} sold</div>
                            <div className="text-xs text-gray-500">
                              ${productSales.total?.toFixed(2) || '0.00'} revenue
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openStockModal(product)}
                                className="text-[#6C7A59] hover:text-[#5A6A4A] flex items-center gap-1"
                              >
                                <EyeIcon className="h-4 w-4" />
                                View
                              </button>
                              <button
                                onClick={() => openAdjustmentModal(product)}
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <PencilIcon className="h-4 w-4" />
                                Adjust
                              </button>
                              <button
                                onClick={() => openRestockModal(product)}
                                className="text-green-600 hover:text-green-800 flex items-center gap-1"
                              >
                                <PlusIcon className="h-4 w-4" />
                                Restock
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory Alerts</h2>
            <p className="text-gray-600">Monitor critical stock levels and automated alerts</p>
          </div>
          {/* Add existing alerts content here */}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory Analytics</h2>
            <p className="text-gray-600">Detailed insights and performance metrics</p>
          </div>
          {/* Add analytics content here */}
        </div>
      )}

      {/* Stock Detail Modal */}
      <AnimatePresence>
        {showStockModal && selectedProduct && (
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
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Stock Details</h3>
                <button
                  onClick={() => setShowStockModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img
                    className="h-16 w-16 rounded-lg object-cover"
                    src={selectedProduct.images?.[0] || '/api/products/placeholder-image'}
                    alt={selectedProduct.name}
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedProduct.name}</h4>
                    <p className="text-gray-600">{selectedProduct.brand}</p>
                    <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedProduct.inventory?.totalStock || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Available Stock</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedProduct.inventory?.availableStock || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Reserved Stock</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {selectedProduct.inventory?.reservedStock || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Reorder Point</p>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedProduct.inventory?.reorderPoint || 20}
                    </p>
                  </div>
                </div>

                {/* Size-wise Stock Breakdown */}
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div>
                    <h5 className="text-md font-semibold text-gray-900 mb-3">Size-wise Stock</h5>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {selectedProduct.sizes.map((size, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm font-medium text-gray-900">{size.name}</p>
                          <p className="text-lg font-bold text-gray-700">{size.stock || 0}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sales Information */}
                <div>
                  <h5 className="text-md font-semibold text-gray-900 mb-3">Sales Performance (30 days)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">Units Sold</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {salesData[selectedProduct._id]?.quantity || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">Revenue</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${salesData[selectedProduct._id]?.total?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {showAdjustmentModal && selectedProduct && (
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
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Adjust Stock</h3>
                <button
                  onClick={() => setShowAdjustmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    className="h-12 w-12 rounded-lg object-cover"
                    src={selectedProduct.images?.[0] || '/api/products/placeholder-image'}
                    alt={selectedProduct.name}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600">Current: {selectedProduct.inventory?.totalStock || 0} units</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="increase">Increase Stock</option>
                    <option value="decrease">Decrease Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={Math.abs(adjustmentQuantity)}
                    onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <select
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="">Select Reason</option>
                    <option value="Inventory count correction">Inventory count correction</option>
                    <option value="Damaged goods">Damaged goods</option>
                    <option value="Lost or stolen">Lost or stolen</option>
                    <option value="Return to supplier">Return to supplier</option>
                    <option value="Quality issue">Quality issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowAdjustmentModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStockAdjustment}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                      adjustmentType === 'increase' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {adjustmentType === 'increase' ? 'Increase Stock' : 'Decrease Stock'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Restock Modal */}
      <AnimatePresence>
        {showRestockModal && selectedProduct && (
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
              className="bg-white rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Restock Product</h3>
                <button
                  onClick={() => setShowRestockModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    className="h-12 w-12 rounded-lg object-cover"
                    src={selectedProduct.images?.[0] || '/api/products/placeholder-image'}
                    alt={selectedProduct.name}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600">Current: {selectedProduct.inventory?.totalStock || 0} units</p>
                    <p className="text-xs text-gray-500">Recommended: {selectedProduct.inventory?.reorderQuantity || 50} units</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restock Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Enter quantity to add"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason *
                  </label>
                  <select
                    value={restockReason}
                    onChange={(e) => setRestockReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="">Select Reason</option>
                    <option value="Low stock replenishment">Low stock replenishment</option>
                    <option value="Seasonal restock">Seasonal restock</option>
                    <option value="Supplier delivery">Supplier delivery</option>
                    <option value="Inventory adjustment">Inventory adjustment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse
                  </label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                  >
                    <option value="all">All Warehouses</option>
                    {warehouseData.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} - {warehouse.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={restockNotes}
                    onChange={(e) => setRestockNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
                    placeholder="Additional notes about this restock..."
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowRestockModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleRestockSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#6C7A59] rounded-lg hover:bg-[#5A6A4A] transition-colors"
                  >
                    Confirm Restock
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
