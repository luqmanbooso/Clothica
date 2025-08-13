import React, { useState, useEffect } from 'react';
import { 
  StarIcon, 
  GiftIcon, 
  FireIcon, 
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const LoyaltyDashboard = () => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState(100);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState('premium');
  const [referralCode, setReferralCode] = useState('');
  const { success, error, info } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/loyalty/profile');
      setLoyaltyData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching loyalty data:', err);
      error('Failed to load loyalty data');
      setLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    try {
      if (redeemAmount < 100) {
        error('Minimum redemption is 100 points');
        return;
      }

      if (redeemAmount > (loyaltyData.loyaltyPoints || 0)) {
        error('Insufficient points');
        return;
      }

      const response = await axios.post('/api/loyalty/redeem', { points: redeemAmount });
      success(`Successfully redeemed ${redeemAmount} points for LKR ${response.data.redemptionValue}`);
      fetchLoyaltyData(); // Refresh data
      setRedeemAmount(100);
    } catch (err) {
      console.error('Error redeeming points:', err);
      error(err.response?.data?.message || 'Failed to redeem points');
    }
  };

  const handleUpgradeMembership = async () => {
    try {
      const response = await axios.post('/api/loyalty/upgrade', { 
        membershipType: selectedMembership,
        paymentMethod: 'card'
      });
      
      success(`Successfully upgraded to ${selectedMembership} membership! Welcome bonus: ${response.data.welcomeBonus} points`);
      setShowUpgradeModal(false);
      fetchLoyaltyData();
    } catch (err) {
      console.error('Error upgrading membership:', err);
      error('Failed to upgrade membership');
    }
  };

  const handleReferral = async () => {
    try {
      if (!referralCode.trim()) {
        error('Please enter a referral code');
        return;
      }

      const response = await axios.post('/api/loyalty/refer', { referralCode: referralCode.trim() });
      success(`Referral successful! You earned ${response.data.bonusPoints} bonus points`);
      setReferralCode('');
      fetchLoyaltyData();
    } catch (err) {
      console.error('Error processing referral:', err);
      error(err.response?.data?.message || 'Failed to process referral');
    }
  };

  const updateLoginStreak = async () => {
    try {
      await axios.post('/api/loyalty/login-streak');
      fetchLoyaltyData();
    } catch (err) {
      console.error('Error updating login streak:', err);
    }
  };

  useEffect(() => {
    if (user) {
      updateLoginStreak();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loyalty System Unavailable</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  const membershipTiers = {
    free: { name: 'Free', color: 'gray', price: 'Free' },
    premium: { name: 'Premium', color: 'blue', price: 'LKR 9.99/month' },
    vip: { name: 'VIP', color: 'purple', price: 'LKR 19.99/month' }
  };

  const currentTier = membershipTiers[loyaltyData.membership];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Rewards</h1>
          <p className="text-gray-600 mt-2">Earn points, redeem rewards, and unlock exclusive benefits</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Points Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Points</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${currentTier.color}-100 text-${currentTier.color}-800`}>
                  {currentTier.name}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {(loyaltyData.loyaltyPoints || 0).toLocaleString()}
                </div>
                <p className="text-gray-600 mb-4">Available Points</p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(loyaltyData.totalPointsEarned || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Earned</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(loyaltyData.totalPointsRedeemed || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Redeemed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      LKR {(loyaltyData.totalRedemptionValue || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Value</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Point Redemption */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Redeem Points</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points to Redeem (Min: 100)
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setRedeemAmount(Math.max(100, redeemAmount - 100))}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(parseInt(e.target.value) || 100)}
                      min="100"
                      step="100"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setRedeemAmount(redeemAmount + 100)}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Redemption Value:</strong> LKR {Math.floor(redeemAmount * (1 + ((loyaltyData.benefits?.redemptionBonus || 10) / 100)))}
                    <br />
                    <span className="text-xs">Bonus: +{loyaltyData.benefits?.redemptionBonus || 10}%</span>
                  </div>
                </div>
                
                <button
                  onClick={handleRedeemPoints}
                  disabled={redeemAmount < 100 || redeemAmount > (loyaltyData.loyaltyPoints || 0)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Redeem Points
                </button>
              </div>
            </motion.div>

            {/* Addiction Mechanics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Bonuses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <FireIcon className="h-6 w-6 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">Login Streak</div>
                    <div className="text-sm text-gray-600">{loyaltyData.loginStreak || 0} days</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Weekend Bonus</div>
                    <div className="text-sm text-gray-600">2x points active</div>
                  </div>
                </div>
                
                {loyaltyData.birthday && new Date().getMonth() === new Date(loyaltyData.birthday).getMonth() && (
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg md:col-span-2">
                    <GiftIcon className="h-6 w-6 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Birthday Month Bonus</div>
                      <div className="text-sm text-gray-600">3x points active!</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Membership Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership</h3>
              
              <div className="text-center mb-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-${currentTier.color}-100 text-${currentTier.color}-800 mb-2`}>
                  {currentTier.name}
                </div>
                <div className="text-sm text-gray-600">{currentTier.price}</div>
              </div>

              {loyaltyData.membership === 'free' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  <ArrowUpIcon className="h-5 w-5 inline mr-2" />
                  Upgrade Now
                </button>
              )}

              {loyaltyData.membership !== 'free' && loyaltyData.membershipExpiry && (
                <div className="text-center text-sm text-gray-600">
                  Expires: {new Date(loyaltyData.membershipExpiry).toLocaleDateString()}
                </div>
              )}
            </motion.div>

            {/* Referral System */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Refer Friends</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Referral Code</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={loyaltyData.referralCode || 'Loading...'}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(loyaltyData.referralCode)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Use Referral Code</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleReferral}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                Earn 500 bonus points per referral!
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{loyaltyData.benefits.pointMultiplier}x Points</div>
                    <div className="text-gray-600">on purchases</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">+{loyaltyData.benefits.redemptionBonus}% Bonus</div>
                    <div className="text-gray-600">on redemption</div>
                  </div>
                </div>
                
                {loyaltyData.benefits.freeShipping && (
                  <div className="flex items-center space-x-3">
                    <TrophyIcon className="h-5 w-5 text-blue-500" />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Free Shipping</div>
                      <div className="text-gray-600">on all orders</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upgrade Membership</h3>
            
            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="membership"
                      value="premium"
                      checked={selectedMembership === 'premium'}
                      onChange={(e) => setSelectedMembership(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="font-medium text-gray-900">Premium</span>
                  </label>
                  <span className="text-lg font-bold text-blue-600">LKR 9.99/month</span>
                </div>
                <div className="text-sm text-gray-600 ml-6">
                  1.5x points • 15% redemption bonus • Free shipping • Early access
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="membership"
                      value="vip"
                      checked={selectedMembership === 'vip'}
                      onChange={(e) => setSelectedMembership(e.target.value)}
                      className="text-purple-600"
                    />
                    <span className="font-medium text-gray-900">VIP</span>
                  </label>
                  <span className="text-lg font-bold text-purple-600">LKR 19.99/month</span>
                </div>
                <div className="text-sm text-gray-600 ml-6">
                  2x points • 20% redemption bonus • Free shipping • Early access • Exclusive offers
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeMembership}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyDashboard;
