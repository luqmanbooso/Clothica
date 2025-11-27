import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  SparklesIcon,
  GiftIcon,
  CurrencyDollarIcon,
  StarIcon,
  ChevronRightIcon,
  CalendarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophySolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import SpinWheel from '../SpinWheel/SpinWheel';

const LoyaltyDashboard = () => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchLoyaltyData();
    fetchPointsHistory();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const response = await api.get('/api/loyalty-member/profile');
      setLoyaltyData(response.data.data);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      showError('Failed to load loyalty information');
    } finally {
      setLoading(false);
    }
  };

  const fetchPointsHistory = async () => {
    try {
      const response = await api.get('/api/loyalty-member/points/history?limit=10');
      setPointsHistory(response.data.data.history);
    } catch (error) {
      console.error('Error fetching points history:', error);
    }
  };

  const handleSpinReward = (reward) => {
    // Refresh loyalty data after spin
    fetchLoyaltyData();
    fetchPointsHistory();
  };

  const getTierColor = (tier) => {
    const colors = {
      Bronze: 'from-amber-600 to-yellow-600',
      Silver: 'from-gray-400 to-gray-600',
      Gold: 'from-yellow-400 to-yellow-600',
      Platinum: 'from-purple-400 to-purple-600'
    };
    return colors[tier] || colors.Bronze;
  };

  const getTierIcon = (tier) => {
    const icons = {
      Bronze: '🥉',
      Silver: '🥈', 
      Gold: '🥇',
      Platinum: '💎'
    };
    return icons[tier] || icons.Bronze;
  };

  const getProgressToNextTier = () => {
    if (!loyaltyData?.nextTierRequirements) return 100;
    
    const { points, totalSpent } = loyaltyData;
    const { points: requiredPoints, spent: requiredSpent } = loyaltyData.nextTierRequirements;
    
    const pointsProgress = (points / requiredPoints) * 100;
    const spentProgress = (totalSpent / requiredSpent) * 100;
    
    return Math.min(pointsProgress, spentProgress);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

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
      className="min-h-screen bg-gray-50 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loyalty Dashboard</h1>
          <p className="text-gray-600">Manage your rewards, points, and exclusive benefits</p>
        </motion.div>

        {/* Tier Status Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${getTierColor(loyaltyData.tier)} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                {getTierIcon(loyaltyData.tier)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{loyaltyData.tier} Member</h2>
                <p className="text-gray-600">Member since {new Date(loyaltyData.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-[#6C7A59]">{loyaltyData.points.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Points Available</div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {loyaltyData.nextTierRequirements && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress to {loyaltyData.nextTierRequirements.tier}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(getProgressToNextTier())}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className={`h-3 bg-gradient-to-r ${getTierColor(loyaltyData.nextTierRequirements.tier)} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressToNextTier()}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{loyaltyData.points} / {loyaltyData.nextTierRequirements.points} points</span>
                <span>${loyaltyData.totalSpent} / ${loyaltyData.nextTierRequirements.spent} spent</span>
              </div>
            </div>
          )}

          {/* Tier Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6 text-[#6C7A59] mx-auto mb-2" />
              <div className="font-semibold text-gray-900">{loyaltyData.benefits.discount}% OFF</div>
              <div className="text-xs text-gray-600">Member Discount</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <StarIcon className="h-6 w-6 text-[#6C7A59] mx-auto mb-2" />
              <div className="font-semibold text-gray-900">{loyaltyData.benefits.pointsMultiplier}x</div>
              <div className="text-xs text-gray-600">Points Multiplier</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <GiftIcon className="h-6 w-6 text-[#6C7A59] mx-auto mb-2" />
              <div className="font-semibold text-gray-900">
                {loyaltyData.benefits.freeShippingThreshold === 0 ? 'FREE' : `$${loyaltyData.benefits.freeShippingThreshold}+`}
              </div>
              <div className="text-xs text-gray-600">Free Shipping</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <SparklesIcon className="h-6 w-6 text-[#6C7A59] mx-auto mb-2" />
              <div className="font-semibold text-gray-900">{loyaltyData.benefits.spinWheelMultiplier}x</div>
              <div className="text-xs text-gray-600">Spin Multiplier</div>
            </div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Spin Wheel Card */}
          <motion.div
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-transform duration-200"
            variants={itemVariants}
            onClick={() => setShowSpinWheel(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <SparklesIcon className="h-8 w-8" />
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {loyaltyData.spinWheelData?.availableSpins || 0}
                </div>
                <div className="text-sm opacity-90">Spins Available</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Spin to Win!</h3>
            <p className="text-sm opacity-90">Try your luck for exclusive rewards</p>
          </motion.div>

          {/* Redeem Points Card */}
          <motion.div
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-transform duration-200"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <GiftIcon className="h-8 w-8" />
              <div className="text-right">
                <div className="text-2xl font-bold">${(loyaltyData.points * 0.01).toFixed(2)}</div>
                <div className="text-sm opacity-90">Reward Value</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Redeem Points</h3>
            <p className="text-sm opacity-90">Convert points to discounts</p>
          </motion.div>

          {/* Refer Friends Card */}
          <motion.div
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-transform duration-200"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <TrophyIcon className="h-8 w-8" />
              <div className="text-right">
                <div className="text-2xl font-bold">500</div>
                <div className="text-sm opacity-90">Points Each</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Refer Friends</h3>
            <p className="text-sm opacity-90">Earn points for referrals</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div className="mb-6" variants={itemVariants}>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: TrophyIcon },
                { id: 'history', name: 'Points History', icon: CalendarIcon },
                { id: 'rewards', name: 'Available Rewards', icon: GiftIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[#6C7A59] text-[#6C7A59]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div variants={itemVariants}>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {pointsHistory.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          entry.type === 'earned' ? 'bg-green-100 text-green-600' :
                          entry.type === 'redeemed' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {entry.type === 'earned' ? '+' : entry.type === 'redeemed' ? '-' : '★'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{entry.description}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        entry.type === 'earned' ? 'text-green-600' :
                        entry.type === 'redeemed' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {entry.type === 'redeemed' ? '-' : '+'}{entry.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Points Earned</span>
                    <span className="font-semibold text-gray-900">
                      {pointsHistory.reduce((sum, entry) => 
                        entry.type === 'earned' ? sum + entry.amount : sum, 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold text-gray-900">${loyaltyData.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(loyaltyData.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Spins</span>
                    <span className="font-semibold text-gray-900">
                      {loyaltyData.spinWheelData?.totalSpins || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Points History</h3>
              <div className="space-y-4">
                {pointsHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        entry.type === 'earned' ? 'bg-green-100 text-green-600' :
                        entry.type === 'redeemed' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {entry.type === 'earned' ? <TrophySolid className="h-5 w-5" /> :
                         entry.type === 'redeemed' ? <GiftIcon className="h-5 w-5" /> :
                         <StarSolid className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{entry.description}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold text-lg ${
                        entry.type === 'earned' ? 'text-green-600' :
                        entry.type === 'redeemed' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {entry.type === 'redeemed' ? '-' : '+'}{entry.amount}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">{entry.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample rewards - you can fetch these from API */}
              {[
                { name: '10% Off Next Order', points: 500, type: 'discount' },
                { name: 'Free Shipping', points: 200, type: 'shipping' },
                { name: '$25 Store Credit', points: 2500, type: 'credit' },
                { name: 'Exclusive Early Access', points: 1000, type: 'access' },
                { name: 'Birthday Bonus Points', points: 0, type: 'birthday' },
                { name: 'VIP Customer Support', points: 1500, type: 'support' }
              ].map((reward, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <GiftIcon className="h-8 w-8 text-[#6C7A59]" />
                    <span className="text-sm font-medium text-gray-600">
                      {reward.points > 0 ? `${reward.points} pts` : 'Free'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{reward.name}</h4>
                  <button
                    disabled={loyaltyData.points < reward.points}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      loyaltyData.points >= reward.points
                        ? 'bg-[#6C7A59] text-white hover:bg-[#5A6A4A]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loyaltyData.points >= reward.points ? 'Redeem' : 'Not Enough Points'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Spin Wheel Modal */}
      <SpinWheel
        isOpen={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        onReward={handleSpinReward}
      />
    </motion.div>
  );
};

export default LoyaltyDashboard;
