import React, { useState, useEffect } from 'react';
import { BanknotesIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, SparklesIcon, StarIcon, GiftIcon, FireIcon, CogIcon } from '@heroicons/react/24/outline';

const Finance = () => {
  const [financeData, setFinanceData] = useState({
    grossRevenue: 1250000,
    netProfit: 312500,
    totalCosts: 937500,
    profitMargin: 0.25
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance & Profit Management</h1>
        <p className="text-gray-600">Monitor financial performance and profitability</p>
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
