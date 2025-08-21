import React, { useState, useEffect, useCallback } from 'react';
import { BanknotesIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, SparklesIcon, StarIcon, GiftIcon, FireIcon, CogIcon, ArrowPathIcon, CubeIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const Finance = () => {
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState({
    grossRevenue: 0,
    netProfit: 0,
    totalCosts: 0,
    profitMargin: 0,
    averageProfitPerOrder: 0,
    monthlyGrowth: 0,
    topRevenueProducts: [],
    revenueByCategory: [],
    costBreakdown: {
      productCosts: 0,
      shippingCosts: 0,
      marketingCosts: 0,
      operationalCosts: 0
    }
  });

  // Fetch real finance data
  const fetchFinanceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/dashboard/finance');
      if (response.data) {
        setFinanceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
      showError('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance & Profit Management</h1>
        <p className="text-gray-600">Monitor financial performance and profitability</p>
          </div>
          <button
            onClick={fetchFinanceData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#6C7A59] hover:bg-[#5A6B4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C7A59] disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gross Revenue</p>
              <p className="text-2xl font-bold text-gray-900">LKR {financeData.grossRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900">LKR {financeData.netProfit.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-emerald-100">
              <BanknotesIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">{(financeData.profitMargin * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Costs</p>
              <p className="text-2xl font-bold text-gray-900">LKR {financeData.totalCosts.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <ArrowTrendingDownIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Finance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Profit per Order</p>
              <p className="text-2xl font-bold text-gray-900">LKR {financeData.averageProfitPerOrder?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <BanknotesIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
              <p className="text-2xl font-bold text-gray-900">+{((financeData.monthlyGrowth || 0) * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{financeData.topRevenueProducts?.length || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <CubeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      {financeData.costBreakdown && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 capitalize">Product Costs</h3>
              <p className="text-2xl font-bold text-gray-900">LKR {financeData.costBreakdown.productCosts?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600">
                {financeData.grossRevenue ? ((financeData.costBreakdown.productCosts / financeData.grossRevenue) * 100).toFixed(1) : 0}% of revenue
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 capitalize">Shipping Costs</h3>
              <p className="text-2xl font-bold text-gray-900">LKR {financeData.costBreakdown.shippingCosts?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600">
                {financeData.grossRevenue ? ((financeData.costBreakdown.shippingCosts / financeData.grossRevenue) * 100).toFixed(1) : 0}% of revenue
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 capitalize">Marketing Costs</h3>
              <p className="text-2xl font-bold text-gray-900">LKR {financeData.costBreakdown.marketingCosts?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600">
                {financeData.grossRevenue ? ((financeData.costBreakdown.marketingCosts / financeData.grossRevenue) * 100).toFixed(1) : 0}% of revenue
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 capitalize">Operational Costs</h3>
              <p className="text-2xl font-bold text-gray-900">LKR {financeData.costBreakdown.operationalCosts?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600">
                {financeData.grossRevenue ? ((financeData.costBreakdown.operationalCosts / financeData.grossRevenue) * 100).toFixed(1) : 0}% of revenue
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Revenue Products */}
      {financeData.topRevenueProducts && financeData.topRevenueProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Products</h2>
          <div className="space-y-3">
            {financeData.topRevenueProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <CubeIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name || `Product ${index + 1}`}</p>
                    <p className="text-sm text-gray-600">Revenue: LKR {product.revenue?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+LKR {product.profit?.toLocaleString() || 0}</p>
                  <p className="text-sm text-gray-600">Profit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monetization Coming Soon Section */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Monetization Dashboard</h2>
            <p className="text-sm text-gray-600">Coming Soon - Advanced revenue management</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <StarIcon className="h-5 w-5 text-yellow-500" />
              <span className="font-medium text-gray-900">Loyalty Management</span>
            </div>
            <p className="text-sm text-gray-600">User tiers, points system, rewards configuration</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <GiftIcon className="h-5 w-5 text-purple-500" />
              <span className="font-medium text-gray-900">Spin Wheel System</span>
            </div>
            <p className="text-sm text-gray-600">Gamified rewards, campaign management</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <FireIcon className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-gray-900">Campaign Management</span>
            </div>
            <p className="text-sm text-gray-600">Special offers, coupons, banner ads</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-blue-100 rounded">
              <CogIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">What Monetization Will Include:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Loyalty Program:</strong> Configure user tiers, points, and rewards</li>
                <li>• <strong>Spin Wheel:</strong> Create gamified reward campaigns</li>
                <li>• <strong>Special Offers:</strong> Manage promotional campaigns and discounts</li>
                <li>• <strong>Coupon System:</strong> Generate and track discount codes</li>
                <li>• <strong>Banner Management:</strong> Create promotional banners and ads</li>
                <li>• <strong>Revenue Analytics:</strong> Track performance across all monetization channels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
