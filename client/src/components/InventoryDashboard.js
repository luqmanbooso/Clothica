import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CubeIcon,
  TagIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const InventoryDashboard = ({ inventoryAlerts, products, onViewProduct, onRestockProduct }) => {
  const [viewMode, setViewMode] = useState('overview'); // overview, alerts, seasonal, analytics
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const getInventoryInsights = useCallback(() => {
    if (!products || products.length === 0) return {};

    const insights = {
      totalProducts: products.length,
      outOfStock: 0,
      criticalStock: 0,
      lowStock: 0,
      stockWarning: 0,
      inStock: 0,
      seasonalProducts: 0,
      eventTaggedProducts: 0,
      totalValue: 0,
      restockNeeded: 0
    };

    products.forEach(product => {
      const stock = product.inventory?.stock || 0;
      const lowThreshold = product.inventory?.lowStockThreshold || 10;
      const criticalThreshold = product.inventory?.criticalStockThreshold || 5;
      const price = product.price || 0;

      insights.totalValue += stock * price;

      if (stock === 0) {
        insights.outOfStock++;
        insights.restockNeeded++;
      } else if (stock <= criticalThreshold) {
        insights.criticalStock++;
        insights.restockNeeded++;
      } else if (stock <= lowThreshold) {
        insights.lowStock++;
        insights.restockNeeded++;
      } else if (stock <= 25) {
        insights.stockWarning++;
      } else {
        insights.inStock++;
      }

      if (product.seasonal?.isSeasonal) {
        insights.seasonalProducts++;
      }

      if (product.seasonal?.eventTags && product.seasonal.eventTags.length > 0) {
        insights.eventTaggedProducts++;
      }
    });

    return insights;
  }, [products]);

  const getSortedProducts = useCallback(() => {
    if (!products || products.length === 0) return [];

    let sorted = [...products];

    // Filter by low stock if enabled
    if (showLowStockOnly) {
      sorted = sorted.filter(product => {
        const stock = product.inventory?.stock || 0;
        const lowThreshold = product.inventory?.lowStockThreshold || 10;
        return stock <= lowThreshold;
      });
    }

    // Sort products
    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'priority':
          const aStock = a.inventory?.stock || 0;
          const aCritical = a.inventory?.criticalStockThreshold || 5;
          const aLow = a.inventory?.lowStockThreshold || 10;
          
          const bStock = b.inventory?.stock || 0;
          const bCritical = b.inventory?.criticalStockThreshold || 5;
          const bLow = b.inventory?.lowStockThreshold || 10;

          // Priority: out of stock > critical > low > warning
          const getPriority = (stock, critical, low) => {
            if (stock === 0) return 4;
            if (stock <= critical) return 3;
            if (stock <= low) return 2;
            if (stock <= 25) return 1;
            return 0;
          };

          aValue = getPriority(aStock, aCritical, aLow);
          bValue = getPriority(bStock, bCritical, bLow);
          break;

        case 'stock':
          aValue = a.inventory?.stock || 0;
          bValue = b.inventory?.stock || 0;
          break;

        case 'value':
          aValue = (a.inventory?.stock || 0) * (a.price || 0);
          bValue = (b.inventory?.stock || 0) * (b.price || 0);
          break;

        case 'lastRestocked':
          aValue = a.inventory?.lastRestocked ? new Date(a.inventory.lastRestocked).getTime() : 0;
          bValue = b.inventory?.lastRestocked ? new Date(b.inventory.lastRestocked).getTime() : 0;
          break;

        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'desc') {
        return bValue - aValue;
      }
      return aValue - bValue;
    });

    return sorted;
  }, [products, showLowStockOnly, sortBy, sortOrder]);

  const getStockStatus = (product) => {
    const stock = product.inventory?.stock || 0;
    const critical = product.inventory?.criticalStockThreshold || 5;
    const low = product.inventory?.lowStockThreshold || 10;

    if (stock === 0) {
      return { status: 'out-of-stock', color: 'text-red-600', bg: 'bg-red-100', icon: ExclamationCircleIcon };
    } else if (stock <= critical) {
      return { status: 'critical', color: 'text-red-500', bg: 'bg-red-50', icon: ExclamationTriangleIcon };
    } else if (stock <= low) {
      return { status: 'low', color: 'text-orange-500', bg: 'bg-orange-50', icon: ExclamationTriangleIcon };
    } else if (stock <= 25) {
      return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: ClockIcon };
    } else {
      return { status: 'good', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircleIcon };
    }
  };

  const getSeasonalStatus = (product) => {
    if (!product.seasonal?.isSeasonal) return null;

    const currentMonth = new Date().getMonth();
    const seasons = {
      spring: [2, 3, 4], // March, April, May
      summer: [5, 6, 7], // June, July, August
      fall: [8, 9, 10],  // September, October, November
      winter: [11, 0, 1] // December, January, February
    };

    const currentSeason = Object.keys(seasons).find(season => 
      seasons[season].includes(currentMonth)
    );

    if (product.seasonal.seasons.includes(currentSeason)) {
      return { status: 'in-season', color: 'text-green-600', bg: 'bg-green-100' };
    } else if (product.seasonal.seasons.includes('all_year')) {
      return { status: 'all-year', color: 'text-blue-600', bg: 'bg-blue-100' };
    } else {
      return { status: 'off-season', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const insights = getInventoryInsights();
  const sortedProducts = getSortedProducts();

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Monitor stock levels, restock alerts, and seasonal optimization</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
          >
            <option value="overview">Overview</option>
            <option value="alerts">Alerts</option>
            <option value="seasonal">Seasonal</option>
            <option value="analytics">Analytics</option>
          </select>
          
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showLowStockOnly
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            {showLowStockOnly ? 'Show All' : 'Low Stock Only'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        variants={itemVariants}
      >
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{insights.totalProducts}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{insights.outOfStock}</p>
            </div>
            <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Stock</p>
              <p className="text-2xl font-bold text-orange-600">{insights.criticalStock}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{insights.lowStock}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Seasonal</p>
              <p className="text-2xl font-bold text-purple-600">{insights.seasonalProducts}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">${insights.totalValue.toLocaleString()}</p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#6C7A59] focus:border-transparent"
          >
            <option value="priority">Priority</option>
            <option value="stock">Stock Level</option>
            <option value="value">Value</option>
            <option value="lastRestocked">Last Restocked</option>
            <option value="name">Name</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? (
              <TrendingUpIcon className="h-4 w-4" />
            ) : (
              <TrendingDownIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {insights.restockNeeded > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              {insights.restockNeeded} products need restocking
            </span>
          </div>
        )}
      </motion.div>

      {/* Products List */}
      <motion.div 
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        variants={itemVariants}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Product Inventory</h3>
          <p className="text-sm text-gray-600">
            {sortedProducts.length} products • {insights.restockNeeded} need attention
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          <AnimatePresence>
            {sortedProducts.map((product, index) => {
              const stockStatus = getStockStatus(product);
              const seasonalStatus = getSeasonalStatus(product);
              const StockIcon = stockStatus.icon;

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${stockStatus.bg}`}>
                        <StockIcon className={`h-5 w-5 ${stockStatus.color}`} />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Stock: {product.inventory?.stock || 0}</span>
                          <span>•</span>
                          <span>Price: ${product.price || 0}</span>
                          {product.inventory?.lowStockThreshold && (
                            <>
                              <span>•</span>
                              <span>Low Stock: {product.inventory.lowStockThreshold}</span>
                            </>
                          )}
                        </div>
                        
                        {/* Seasonal and Event Tags */}
                        <div className="flex items-center gap-2 mt-2">
                          {seasonalStatus && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${seasonalStatus.bg} ${seasonalStatus.color}`}>
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {seasonalStatus.status}
                            </span>
                          )}
                          
                          {product.seasonal?.eventTags && product.seasonal.eventTags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${((product.inventory?.stock || 0) * (product.price || 0)).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Total Value</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewProduct(product)}
                          className="px-3 py-2 text-sm font-medium text-[#6C7A59] hover:bg-[#6C7A59] hover:text-white rounded-lg transition-colors"
                        >
                          View
                        </button>
                        
                        {(product.inventory?.stock || 0) <= (product.inventory?.lowStockThreshold || 10) && (
                          <button
                            onClick={() => onRestockProduct(product)}
                            className="px-3 py-2 text-sm font-medium text-white bg-[#6C7A59] hover:bg-[#5A6A4A] rounded-lg transition-colors"
                          >
                            Restock
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InventoryDashboard;
