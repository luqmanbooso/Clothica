import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  GiftIcon, 
  SparklesIcon, 
  TrophyIcon,
  ArrowPathIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const LoyaltyDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [activeOffers, setActiveOffers] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [referralInput, setReferralInput] = useState('');

  useEffect(() => {
    fetchLoyaltyData();
    fetchActiveOffers();
    fetchReferralCode();
  }, []);

  const fetchLoyaltyData = useCallback(async () => {
    try {
      const response = await axios.get('/api/loyalty/profile');
      setLoyaltyData(response.data);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      showToast('Error loading loyalty data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchActiveOffers = useCallback(async () => {
    try {
      const response = await axios.get('/api/special-offers');
      setActiveOffers(response.data.filter(offer => offer.isActive));
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  }, []);

  const fetchReferralCode = useCallback(async () => {
    try {
      const response = await axios.get('/api/loyalty/referral-code');
      setReferralCode(response.data.referralCode);
    } catch (error) {
      console.error('Error fetching referral code:', error);
    }
  }, []);

  const handleSpin = async () => {
    if (spinning || !loyaltyData?.availableSpins) return;
    
    setSpinning(true);
    setSpinResult(null);
    
    try {
      const response = await axios.post('/api/loyalty/spin');
      setSpinResult(response.data.spinResult);
      setShowSpinModal(true);
      
      // Update loyalty data
      await fetchLoyaltyData();
      
      showToast(
        response.data.spinResult.won 
          ? ` Congratulations! You won ${response.data.spinResult.discount}% off!` 
          : 'Better luck next time!',
        response.data.spinResult.won ? 'success' : 'info'
      );
    } catch (error) {
      console.error('Error during spin:', error);
      showToast(error.response?.data?.message || 'Error during spin', 'error');
    } finally {
      setSpinning(false);
    }
  };

  const handleReferral = async () => {
    if (!referralInput.trim()) return;
    
    try {
      await axios.post('/api/loyalty/refer', { referralCode: referralInput });
      showToast('Referral applied successfully!', 'success');
      setReferralInput('');
      fetchLoyaltyData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error applying referral', 'error');
    }
  };

  const handleRedeemPoints = async (points) => {
    try {
      await axios.post('/api/loyalty/redeem', { points });
      showToast('Points redeemed successfully!', 'success');
      fetchLoyaltyData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error redeeming points', 'error');
    }
  };

  const handleUpgradeMembership = async (membershipType) => {
    try {
      await axios.post('/api/loyalty/upgrade', { membershipType });
      showToast('Membership upgraded successfully!', 'success');
      fetchLoyaltyData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error upgrading membership', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#6C7A59]"></div>
      </div>
    );
  }

  const getBadgeInfo = (badge) => {
    const badges = {
      none: { name: 'No Badge', color: 'gray', icon: '⭐', description: 'Start earning points to get your first badge!' },
      bronze: { name: 'Bronze', color: 'amber', icon: '', description: 'Great start! You\'re on your way!' },
      silver: { name: 'Silver', color: 'gray', icon: '', description: 'Impressive! You\'re a loyal customer!' },
      gold: { name: 'Gold', color: 'yellow', icon: '', description: 'Excellent! You\'re a VIP customer!' },
      vip: { name: 'VIP', color: 'purple', icon: '', description: 'Elite status! You\'re our top customer!' }
    };
    return badges[badge] || badges.none;
  };

  const currentBadge = getBadgeInfo(loyaltyData?.currentBadge);

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
             Lucky Spin & Loyalty Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Spin to win amazing discounts and unlock exclusive rewards!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Points & Badge */}
          <div className="lg:col-span-2 space-y-6">
            {/* Points Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Points</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${currentBadge.color}-100 text-${currentBadge.color}-800`}>
                  {currentBadge.icon} {currentBadge.name}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {(loyaltyData?.loyaltyPoints || 0).toLocaleString()}
                </div>
                <p className="text-gray-600 mb-4">Available Points</p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(loyaltyData?.totalPointsEarned || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Earned</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(loyaltyData?.totalPointsRedeemed || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Redeemed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      LKR {(loyaltyData?.totalRedemptionValue || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Value</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Spin System */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 shadow-lg text-white"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2"> Lucky Spin</h2>
                <p className="text-purple-100 mb-4">
                  {loyaltyData?.availableSpins > 0 
                    ? `You have ${loyaltyData.availableSpins} spin${loyaltyData.availableSpins > 1 ? 's' : ''} remaining!`
                    : 'No spins remaining this month'
                  }
                </p>
                
                <div className="mb-4">
                  <div className="text-sm text-purple-200 mb-2">Spin Rewards:</div>
                  <div className="flex justify-center space-x-2 text-xs">
                    <span className="px-2 py-1 bg-white/20 rounded">5% off</span>
                    <span className="px-2 py-1 bg-white/20 rounded">10% off</span>
                    <span className="px-2 py-1 bg-white/20 rounded">15% off</span>
                    <span className="px-2 py-1 bg-white/20 rounded">20% off</span>
                  </div>
                </div>

                <button
                  onClick={handleSpin}
                  disabled={spinning || !loyaltyData?.availableSpins}
                  className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
                    spinning || !loyaltyData?.availableSpins
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-white text-purple-600 hover:bg-purple-100 hover:scale-105 shadow-lg'
                  }`}
                >
                  {spinning ? (
                    <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    ' SPIN NOW!'
                  )}
                </button>
              </div>
            </motion.div>

            {/* Active Offers */}
            {activeOffers.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <GiftIcon className="h-6 w-6 mr-2 text-[#6C7A59]" />
                  Active Offers
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeOffers.slice(0, 4).map((offer, index) => (
                    <motion.div
                      key={offer._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="relative overflow-hidden rounded-lg p-4"
                      style={{
                        background: offer.displayGradient || `linear-gradient(135deg, ${offer.displayColor} 0%, ${offer.displayColor}dd 100%)`
                      }}
                    >
                      <div className="text-white">
                        <div className="text-2xl mb-2">{offer.displayIcon}</div>
                        <h3 className="font-semibold mb-1">{offer.displayTitle || offer.name}</h3>
                        <p className="text-sm opacity-90">{offer.displayMessage || offer.description}</p>
                        <div className="mt-2 text-lg font-bold">
                          {offer.discountType === 'percentage' && `${offer.discountValue}% OFF`}
                          {offer.discountType === 'fixed' && `LKR ${offer.discountValue} OFF`}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Badge Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrophyIcon className="h-6 w-6 mr-2 text-[#6C7A59]" />
                Your Badge
              </h2>
              
              <div className="text-center">
                <div className="text-6xl mb-4">{currentBadge.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{currentBadge.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{currentBadge.description}</p>
                
                {loyaltyData?.badgeHistory?.length > 0 && (
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 mb-2">Badge History:</h4>
                    {loyaltyData.badgeHistory.slice(-3).map((badge, index) => (
                      <div key={index} className="flex items-center justify-between text-sm py-1">
                        <span className="capitalize">{badge.badge}</span>
                        <span className="text-gray-500">
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CogIcon className="h-6 w-6 mr-2 text-[#6C7A59]" />
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleRedeemPoints(100)}
                  disabled={!loyaltyData?.loyaltyPoints || loyaltyData.loyaltyPoints < 100}
                  className="w-full px-4 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6B4A] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                   Redeem 100 Points
                </button>
                
                <button
                  onClick={() => handleUpgradeMembership('premium')}
                  disabled={!loyaltyData?.loyaltyPoints || loyaltyData.loyaltyPoints < 500}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  ⭐ Upgrade to Premium
                </button>
                
                <button
                  onClick={() => handleUpgradeMembership('vip')}
                  disabled={!loyaltyData?.loyaltyPoints || loyaltyData.loyaltyPoints < 1000}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                   Upgrade to VIP
                </button>
              </div>
            </motion.div>

            {/* Referral System */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="h-6 w-6 mr-2 text-[#6C7A59]" />
                Refer Friends
              </h2>
              
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Your Referral Code:</p>
                  <div className="bg-gray-100 p-3 rounded-lg font-mono text-lg text-center">
                    {referralCode}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Apply Referral Code:</p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C7A59]"
                    />
                    <button
                      onClick={handleReferral}
                      className="px-4 py-2 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6B4A] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Spin Result Modal */}
        <AnimatePresence>
          {showSpinModal && spinResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSpinModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-6xl mb-4">
                  {spinResult.won ? spinResult.icon : ''}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {spinResult.won ? 'Congratulations!' : 'Better Luck Next Time!'}
                </h2>
                
                <p className="text-gray-600 mb-4">
                  {spinResult.description}
                </p>
                
                {spinResult.won && (
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="text-2xl font-bold text-green-800">
                      {spinResult.discount}% OFF
                    </div>
                    <div className="text-sm text-green-600">
                      Coupon code: {spinResult.couponCode}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setShowSpinModal(false)}
                  className="px-6 py-3 bg-[#6C7A59] text-white rounded-lg hover:bg-[#5A6B4A] transition-colors"
                >
                  {spinResult.won ? 'Use Coupon Now!' : 'Close'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;



