import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon,
  GiftIcon,
  TagIcon,
  StarIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const ClientFeatures = () => {
  const [activeTab, setActiveTab] = useState('spinWheel');
  const [features, setFeatures] = useState({
    spinWheel: {
      enabled: true,
      config: {
        cost: 50,
        cooldown: 1440,
        maxSpinsPerDay: 3,
        rewards: [
          { type: 'coupon', value: 15, probability: 25, name: '15% OFF Coupon' },
          { type: 'coupon', value: 20, probability: 15, name: '20% OFF Coupon' },
          { type: 'free_shipping', value: 0, probability: 20, name: 'Free Shipping' },
          { type: 'points', value: 100, probability: 25, name: '100 Bonus Points' },
          { type: 'points', value: 200, probability: 10, name: '200 Bonus Points' },
          { type: 'product_discount', value: 25, probability: 5, name: '25% Product Discount' }
        ]
      },
      analytics: {
        totalSpins: 1250,
        rewardsGiven: 980,
        userEngagement: 0.78,
        conversionRate: 0.65
      }
    },
    smartDiscounts: {
      enabled: true,
      config: {
        autoGeneration: true,
        rules: [
          { condition: 'cartValue > 1000', discount: 10, type: 'percentage' },
          { condition: 'userLoyaltyLevel === "gold"', discount: 15, type: 'percentage' },
          { condition: 'abandonedCart', discount: 20, type: 'percentage' }
        ]
      },
      analytics: {
        totalCoupons: 25,
        activeCoupons: 18,
        totalSavings: 125000,
        conversionRate: 0.72
      }
    },
    specialOffers: {
      enabled: true,
      config: {
        flashSales: true,
        seasonalPricing: true,
        bundleDeals: true,
        loyaltyRewards: true
      },
      analytics: {
        totalOffers: 12,
        activeOffers: 8,
        totalEngagement: 850,
        conversionRate: 0.68
      }
    },
    loyaltyProgram: {
      enabled: true,
      config: {
        pointsPerDollar: 0.1,
        levels: [
          { name: 'Bronze', minPoints: 0, benefits: ['Basic rewards', 'Standard support'] },
          { name: 'Silver', minPoints: 50, benefits: ['Premium rewards', 'Priority support', 'Birthday bonus'] },
          { name: 'Gold', minPoints: 200, benefits: ['Exclusive rewards', 'VIP support', 'Early access'] },
          { name: 'Platinum', minPoints: 500, benefits: ['Luxury rewards', 'Personal manager', 'Custom offers'] }
        ]
      },
      analytics: {
        totalPoints: 125000,
        activeUsers: 680,
        averagePointsPerUser: 147,
        levelDistribution: {
          bronze: 320,
          silver: 180,
          gold: 120,
          platinum: 60
        }
      }
    }
  });

  const toggleFeature = (featureName) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: {
        ...prev[featureName],
        enabled: !prev[featureName].enabled
      }
    }));
  };

  const updateFeatureConfig = (featureName, config) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: {
        ...prev[featureName],
        config: { ...prev[featureName].config, ...config }
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Features Management</h1>
            <p className="text-gray-600">Manage frontend features, gamification, and customer engagement tools</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              <PlusIcon className="h-5 w-5 inline mr-2" />
              Add Feature
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(features).map(([featureName, feature]) => (
          <div key={featureName} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {featureName.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <button
                onClick={() => toggleFeature(featureName)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  feature.enabled 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {feature.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  feature.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {feature.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {feature.analytics && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Quick Stats:</p>
                  {Object.entries(feature.analytics).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="font-medium">
                        {typeof value === 'number' && value < 1 ? 
                          `${(value * 100).toFixed(1)}%` : 
                          value.toLocaleString()
                        }
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'spinWheel', name: 'Spin Wheel', icon: GiftIcon },
              { id: 'smartDiscounts', name: 'Smart Discounts', icon: TagIcon },
              { id: 'specialOffers', name: 'Special Offers', icon: SparklesIcon },
              { id: 'loyaltyProgram', name: 'Loyalty Program', icon: StarIcon }
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
          {activeTab === 'spinWheel' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost per Spin (Points)
                      </label>
                      <input
                        type="number"
                        value={features.spinWheel.config.cost}
                        onChange={(e) => updateFeatureConfig('spinWheel', { cost: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cooldown (Minutes)
                      </label>
                      <input
                        type="number"
                        value={features.spinWheel.config.cooldown}
                        onChange={(e) => updateFeatureConfig('spinWheel', { cooldown: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Spins per Day
                      </label>
                      <input
                        type="number"
                        value={features.spinWheel.config.maxSpinsPerDay}
                        onChange={(e) => updateFeatureConfig('spinWheel', { maxSpinsPerDay: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">{features.spinWheel.analytics.totalSpins}</p>
                      <p className="text-sm text-purple-700">Total Spins</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{features.spinWheel.analytics.rewardsGiven}</p>
                      <p className="text-sm text-green-700">Rewards Given</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{(features.spinWheel.analytics.userEngagement * 100).toFixed(1)}%</p>
                      <p className="text-sm text-blue-700">User Engagement</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">{(features.spinWheel.analytics.conversionRate * 100).toFixed(1)}%</p>
                      <p className="text-sm text-orange-700">Conversion Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rewards Configuration */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rewards Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.spinWheel.config.rewards.map((reward, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{reward.name}</span>
                        <span className="text-sm text-gray-600">{reward.probability}%</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Type: {reward.type.replace('_', ' ')}
                        {reward.value > 0 && ` - ${reward.value}${reward.type === 'coupon' ? '%' : ' points'}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'smartDiscounts' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={features.smartDiscounts.config.autoGeneration}
                        onChange={(e) => updateFeatureConfig('smartDiscounts', { autoGeneration: e.target.checked })}
                        className="mr-3"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Enable Auto-Generation
                      </label>
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{features.smartDiscounts.analytics.totalCoupons}</p>
                      <p className="text-sm text-emerald-700">Total Coupons</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{features.smartDiscounts.analytics.activeCoupons}</p>
                      <p className="text-sm text-green-700">Active Coupons</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">LKR {features.smartDiscounts.analytics.totalSavings.toLocaleString()}</p>
                      <p className="text-sm text-blue-700">Total Savings</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">{(features.smartDiscounts.analytics.conversionRate * 100).toFixed(1)}%</p>
                      <p className="text-sm text-orange-700">Conversion Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules Configuration */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Generation Rules</h3>
                <div className="space-y-3">
                  {features.smartDiscounts.config.rules.map((rule, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Condition: {rule.condition}</p>
                          <p className="text-sm text-gray-600">
                            Discount: {rule.discount}{rule.type === 'percentage' ? '%' : ' LKR'}
                          </p>
                        </div>
                        <button className="text-red-500 hover:text-red-700">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specialOffers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
                  <div className="space-y-4">
                    {Object.entries(features.specialOffers.config).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateFeatureConfig('specialOffers', { [key]: e.target.checked })}
                          className="mr-3"
                        />
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytics */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">{features.specialOffers.analytics.totalOffers}</p>
                      <p className="text-sm text-purple-700">Total Offers</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{features.specialOffers.analytics.activeOffers}</p>
                      <p className="text-sm text-green-700">Active Offers</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{features.specialOffers.analytics.totalEngagement}</p>
                      <p className="text-sm text-blue-700">Total Engagement</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">{(features.specialOffers.analytics.conversionRate * 100).toFixed(1)}%</p>
                      <p className="text-sm text-orange-700">Conversion Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'loyaltyProgram' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points per Dollar Spent
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={features.loyaltyProgram.config.pointsPerDollar}
                        onChange={(e) => updateFeatureConfig('loyaltyProgram', { pointsPerDollar: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{features.loyaltyProgram.analytics.totalPoints.toLocaleString()}</p>
                      <p className="text-sm text-yellow-700">Total Points</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{features.loyaltyProgram.analytics.activeUsers}</p>
                      <p className="text-sm text-green-700">Active Users</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{features.loyaltyProgram.analytics.averagePointsPerUser}</p>
                      <p className="text-sm text-blue-700">Avg Points/User</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Levels Configuration */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Loyalty Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {features.loyaltyProgram.config.levels.map((level, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">{level.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">Min Points: {level.minPoints}</p>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Benefits:</p>
                        <ul className="list-disc list-inside mt-1">
                          {level.benefits.map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientFeatures;


