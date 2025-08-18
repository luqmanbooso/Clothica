import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  GiftIcon, 
  ChartBarIcon,
  CogIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import axios from 'axios';

const MonetizationDashboard = () => {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [loyaltyStats, setLoyaltyStats] = useState(null);
  const [affiliateStats, setAffiliateStats] = useState(null);
  const [offerStats, setOfferStats] = useState(null);
  const [spinSystemStatus, setSpinSystemStatus] = useState({
    isActive: true,
    totalSpins: 0,
    totalWins: 0,
    winRate: 0,
    averageDiscount: 0,
    activeEvents: 0
  });
  const [monetizationData, setMonetizationData] = useState(null);

  useEffect(() => {
    fetchMonetizationData();
  }, []);

  const fetchMonetizationData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/monetization');
      setMonetizationData(response.data);
    } catch (error) {
      console.error('Error fetching monetization data:', error);
      // Fallback to sample data if API fails
      setMonetizationData({
        overview: {
          totalRevenue: 125000,
          affiliateEarnings: 8750,
          couponUsage: 2340
        },
        monthlyRevenue: [
          { month: 1, revenue: 8500, orders: 120 },
          { month: 2, revenue: 9200, orders: 135 },
          { month: 3, revenue: 10500, orders: 150 }
        ],
        topProducts: [
          { productId: '1', totalSold: 45, revenue: 2250 },
          { productId: '2', totalSold: 38, revenue: 1900 }
        ],
        revenueByCategory: [
          { category: 'men', revenue: 45000, orders: 600 },
          { category: 'women', revenue: 55000, orders: 750 }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`text-${trend > 0 ? 'green' : 'red'}-600 font-medium`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-gray-500 ml-1">from last month</span>
        </div>
      )}
    </motion.div>
  );

  const MetricCard = ({ title, value, description, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg p-4 shadow-md"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </motion.div>
  );

  const handleLoyaltySettings = async () => {
    try {
      const response = await axios.put('/api/admin/monetization/loyalty', {
        isActive: !loyaltyStats?.isActive,
        pointMultiplier: loyaltyStats?.pointMultiplier || 1,
        tierThresholds: loyaltyStats?.tierThresholds || { bronze: 100, silver: 500, gold: 1000, vip: 2000 }
      });
      
      setLoyaltyStats(response.data);
      showSuccess('Loyalty settings updated successfully');
    } catch (error) {
      console.error('Error updating loyalty settings:', error);
      showError('Failed to update loyalty settings');
    }
  };

  const handleAffiliateSettings = async () => {
    try {
      const response = await axios.put('/api/admin/monetization/affiliate', {
        isActive: !affiliateStats?.isActive,
        commissionRate: affiliateStats?.commissionRate || 10,
        minimumPayout: affiliateStats?.minimumPayout || 50
      });
      
      setAffiliateStats(response.data);
      showSuccess('Affiliate settings updated successfully');
    } catch (error) {
      console.error('Error updating affiliate settings:', error);
      showError('Failed to update affiliate settings');
    }
  };

  const handleOfferSettings = async () => {
    try {
      const response = await axios.put('/api/admin/monetization/offers', {
        isActive: !offerStats?.isActive,
        maxDiscount: offerStats?.maxDiscount || 50,
        autoExpiry: offerStats?.autoExpiry || true
      });
      
      setOfferStats(response.data);
      showSuccess('Offer settings updated successfully');
    } catch (error) {
      console.error('Error updating offer settings:', error);
      showError('Failed to update offer settings');
    }
  };

  const handleSpinSystemToggle = async () => {
    try {
      const response = await axios.put('/api/admin/monetization/spin-system', {
        isActive: !spinSystemStatus.isActive
      });
      
      setSpinSystemStatus(prev => ({ ...prev, ...response.data }));
      showSuccess(`Spin system ${response.data.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling spin system:', error);
      showError('Failed to toggle spin system');
    }
  };

  const handleRevenueOptimization = async () => {
    try {
      const response = await axios.post('/api/admin/monetization/optimize');
      showSuccess('Revenue optimization analysis completed');
      
      // Update stats with optimization results
      if (response.data.recommendations) {
        setMonetizationData(prev => ({
          ...prev,
          optimization: response.data
        }));
      }
    } catch (error) {
      console.error('Error starting optimization analysis:', error);
      showError('Failed to start optimization analysis');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Monetization Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Monitor and manage your revenue streams, loyalty system, and spin mechanics
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`LKR ${(loyaltyStats?.pointStats?.totalRedemptionValue || 0).toLocaleString()}`}
            subtitle="From loyalty redemptions"
            icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />}
            color="green"
            trend={12.5}
          />
          
          <StatCard
            title="Active Users"
            value={(loyaltyStats?.userStats?.total || 0).toLocaleString()}
            subtitle="Total registered users"
            icon={<UsersIcon className="h-6 w-6 text-blue-600" />}
            color="blue"
            trend={8.2}
          />
          
          <StatCard
            title="Active Offers"
            value={(offerStats?.activeOffers || 0).toLocaleString()}
            subtitle="Currently running"
            icon={<GiftIcon className="h-6 w-6 text-purple-600" />}
            color="purple"
            trend={-2.1}
          />
          
          <StatCard
            title="Total Affiliates"
            value={(affiliateStats?.totalAffiliates || 0).toLocaleString()}
            subtitle="Partner network"
            icon={<UserGroupIcon className="h-6 w-6 text-indigo-600" />}
            color="indigo"
            trend={15.7}
          />
        </div>

        {/* Spin System Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 shadow-lg text-white mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎰 Spin System Overview</h2>
              <p className="text-purple-100">
                Monitor your addictive spin mechanics and user engagement
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{spinSystemStatus.totalSpins.toLocaleString()}</div>
              <div className="text-purple-200">Total Spins</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{spinSystemStatus.totalWins.toLocaleString()}</div>
              <div className="text-sm text-purple-200">Total Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{spinSystemStatus.winRate}%</div>
              <div className="text-sm text-purple-200">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{spinSystemStatus.averageDiscount}%</div>
              <div className="text-sm text-purple-200">Avg Discount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{spinSystemStatus.activeEvents}</div>
              <div className="text-sm text-purple-200">Active Events</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dialog StarPay Loyalty Metrics */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <StarIcon className="h-6 w-6 mr-2 text-yellow-500" />
              Dialog StarPay Loyalty System
            </h2>
            
            <div className="space-y-4">
              <MetricCard
                title="Points Redeemed"
                value={(loyaltyStats?.pointStats?.totalRedeemed || 0).toLocaleString()}
                description="Total points converted to value"
                icon={<CurrencyDollarIcon className="h-5 w-5 text-green-600" />}
                color="green"
              />
              
              <MetricCard
                title="Redemption Value"
                value={`LKR ${(loyaltyStats?.pointStats?.totalRedemptionValue || 0).toLocaleString()}`}
                description="Total monetary value generated"
                icon={<TrophyIcon className="h-5 w-5 text-yellow-600" />}
                color="yellow"
              />
              
              <MetricCard
                title="Premium Users"
                value={((loyaltyStats?.userStats?.gold || 0) + (loyaltyStats?.userStats?.vip || 0)).toLocaleString()}
                description="Premium + VIP memberships"
                icon={<SparklesIcon className="h-5 w-5 text-purple-600" />}
                color="purple"
              />
              
              <MetricCard
                title="Monthly Revenue"
                value={`LKR ${Math.floor((loyaltyStats?.pointStats?.totalRedemptionValue || 0) / 12).toLocaleString()}`}
                description="Average monthly from subscriptions"
                icon={<ChartBarIcon className="h-5 w-5 text-blue-600" />}
                color="blue"
              />
            </div>
          </motion.div>

          {/* Addiction Mechanics Status */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FireIcon className="h-6 w-6 mr-2 text-orange-500" />
              Addiction Mechanics Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FireIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Login Streaks</span>
                </div>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <StarIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Weekend Bonuses</span>
                </div>
                <span className="text-blue-600 font-semibold">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <GiftIcon className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Birthday Bonuses</span>
                </div>
                <span className="text-purple-600 font-semibold">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium text-gray-900">Referral System</span>
                </div>
                <span className="text-indigo-600 font-semibold">Active</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Cog6ToothIcon className="h-6 w-6 mr-2 text-[#6C7A59]" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleSpinSystemToggle}
              className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎰</div>
                <div className="font-semibold">Toggle Spin System</div>
                <div className="text-sm opacity-90">
                  {spinSystemStatus.isActive ? 'Deactivate' : 'Activate'} spin campaigns
                </div>
              </div>
            </button>
            
            <button 
              onClick={handleOfferSettings}
              className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎁</div>
                <div className="font-semibold">Manage Offers</div>
                <div className="text-sm opacity-90">Create special promotions</div>
              </div>
            </button>
            
            <button 
              onClick={handleRevenueOptimization}
              className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">Revenue Optimization</div>
                <div className="text-sm opacity-90">Analyze performance metrics</div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MonetizationDashboard;

