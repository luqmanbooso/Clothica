import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArchiveBoxIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const InventoryDashboard = ({ inventoryAlerts, products, onViewProduct }) => {
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('stock'); // stock, name, category
  const [sortOrder, setSortOrder] = useState('asc');

  const getStockStatus = (stock) => {
    if (stock <= 0) return { status: 'Out of Stock', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800', priority: 1 };
    if (stock <= 5) return { status: 'Critical Stock', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800', priority: 2 };
    if (stock <= 10) return { status: 'Low Stock', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', priority: 3 };
    if (stock <= 25) return { status: 'Stock Warning', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800', priority: 4 };
    return { status: 'In Stock', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800', priority: 5 };
  };

  const getStockTrend = (product) => {
    // This would typically come from analytics data
    // For now, we'll simulate based on stock levels
    if (product.stock <= 5) return 'decreasing';
    if (product.stock <= 15) return 'stable';
    return 'increasing';
  };

  const getInventoryInsights = () => {
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.stock <= 0).length;
    const criticalStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const lowStock = products.filter(p => p.stock > 5 && p.stock <= 10).length;
    const stockWarning = products.filter(p => p.stock > 10 && p.stock <= 25).length;
    const inStock = products.filter(p => p.stock > 25).length;

    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStockValue = products
      .filter(p => p.stock <= 25)
      .reduce((sum, p) => sum + (p.price * p.stock), 0);

    return {
      totalProducts,
      outOfStock,
      criticalStock,
      lowStock,
      stockWarning,
      inStock,
      totalValue: totalValue.toFixed(2),
      lowStockValue: lowStockValue.toFixed(2),
      lowStockPercentage: ((outOfStock + criticalStock + lowStock + stockWarning) / totalProducts * 100).toFixed(1)
    };
  };

  const insights = getInventoryInsights();

  const getSortedProducts = () => {
    let filteredProducts = products;
    
    if (showLowStockOnly) {
      filteredProducts = products.filter(p => p.stock <= 25);
    }

    return filteredProducts.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'stock':
          aValue = a.stock || 0;
          bValue = b.stock || 0;
          break;
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        default:
          aValue = a.stock || 0;
          bValue = b.stock || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Inventory Overview</h3>
          <p className="text-gray-600">Monitor stock levels and manage inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ArchiveBoxIcon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">{insights.outOfStock}</p>
              <p className="text-xs text-red-700">Critical</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Critical Stock</p>
              <p className="text-2xl font-bold text-orange-900">{insights.criticalStock}</p>
              <p className="text-xs text-orange-700">≤5 items</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-900">{insights.lowStock}</p>
              <p className="text-xs text-yellow-700">≤10 items</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">In Stock</p>
              <p className="text-2xl font-bold text-green-900">{insights.inStock}</p>
              <p className="text-xs text-green-700">>25 items</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Inventory Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Inventory Insights</h4>
              <p className="text-sm text-blue-700">
                {insights.lowStockPercentage}% of products need attention • 
                Total Value: ${insights.totalValue} • 
                Low Stock Value: ${insights.lowStockValue}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-900">Total Products</p>
            <p className="text-2xl font-bold text-blue-900">{insights.totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Show Low Stock Only</span>
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="stock">Sort by Stock</option>
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Inventory Alerts */}
      {inventoryAlerts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-red-500" />
              Inventory Alerts
            </h4>
            <span className="text-sm text-gray-500">{inventoryAlerts.length} alerts</span>
          </div>
          <div className="space-y-3">
            {inventoryAlerts.slice(0, 5).map((alert, index) => (
              <motion.div
                key={alert.product._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high' 
                    ? 'bg-red-50 border-red-200' 
                    : alert.severity === 'medium'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'high' 
                        ? 'bg-red-100' 
                        : alert.severity === 'medium'
                        ? 'bg-yellow-100'
                        : 'bg-orange-100'
                    }`}>
                      <ArchiveBoxIcon className={`h-5 w-5 ${
                        alert.severity === 'high' 
                          ? 'text-red-600' 
                          : alert.severity === 'medium'
                          ? 'text-yellow-600'
                          : 'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.product.name}</p>
                      <p className={`text-sm ${
                        alert.severity === 'high' 
                          ? 'text-red-600' 
                          : alert.severity === 'medium'
                          ? 'text-yellow-600'
                          : 'text-orange-600'
                      }`}>
                        {alert.type === 'out_of_stock' && 'Out of stock'}
                        {alert.type === 'low_stock' && `Low stock: ${alert.product.stock} remaining`}
                        {alert.type === 'stock_warning' && `Stock warning: ${alert.product.stock} remaining`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewProduct(alert.product)}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View
                  </button>
                </div>
              </motion.div>
            ))}
            {inventoryAlerts.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                +{inventoryAlerts.length - 5} more alerts
              </p>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Low Stock Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Low Stock Products</h4>
          <span className="text-sm text-gray-500">
            {sortedProducts.filter(p => p.stock <= 25).length} products need attention
          </span>
        </div>
        <div className="space-y-3">
          {sortedProducts
            .filter(p => p.stock <= 25)
            .slice(0, 8)
            .map((product, index) => {
              const stockStatus = getStockStatus(product.stock);
              const stockTrend = getStockTrend(product);
              
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors border-l-4 ${
                    stockStatus.priority === 1 ? 'border-l-red-500 bg-red-50' :
                    stockStatus.priority === 2 ? 'border-l-red-400 bg-red-50' :
                    stockStatus.priority === 3 ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-orange-400 bg-orange-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stockStatus.bgColor}`}>
                      <ArchiveBoxIcon className={`h-5 w-5 ${stockStatus.textColor}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>SKU: {product.sku || 'N/A'}</span>
                        <span>•</span>
                        <span>{product.category || 'Uncategorized'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${stockStatus.textColor}`}>
                        {stockStatus.status}
                      </p>
                      <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {stockTrend === 'increasing' && (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                      )}
                      {stockTrend === 'decreasing' && (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      {stockTrend === 'stable' && (
                        <div className="h-4 w-4 border-2 border-gray-400 rounded-full"></div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => onViewProduct(product)}
                      className="px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                </motion.div>
              );
            })}
          
          {sortedProducts.filter(p => p.stock <= 25).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircleIcon className="h-12 w-12 mx-auto text-green-400 mb-2" />
              <p>All products have sufficient stock!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
