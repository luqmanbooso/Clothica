import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GiftIcon, 
  FireIcon, 
  StarIcon, 
  XMarkIcon,
  CurrencyDollarIcon,
  TruckIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLoyalty } from '../contexts/LoyaltyContext';
import api from '../utils/api';

const SpinWheel = ({ onClose, onRewardApplied, triggerType = 'post_purchase' }) => {
  const { user, isAuthenticated } = useAuth();
  const { points, level } = useLoyalty();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [wheelConfig, setWheelConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spinHistory, setSpinHistory] = useState([]);

  // Mock wheel configuration - replace with real API call
  const mockWheelConfig = {
    name: "Lucky Spin Wheel",
    cost: { type: 'points', amount: 50 },
    rewards: [
      { type: 'coupon', value: 15, probability: 25, name: '15% OFF Coupon', icon: '🎫', color: 'bg-green-500' },
      { type: 'coupon', value: 20, probability: 15, name: '20% OFF Coupon', icon: '🎫', color: 'bg-blue-500' },
      { type: 'free_shipping', value: 0, probability: 20, name: 'Free Shipping', icon: '🚚', color: 'bg-purple-500' },
      { type: 'points', value: 100, probability: 25, name: '100 Bonus Points', icon: '⭐', color: 'bg-yellow-500' },
      { type: 'points', value: 200, probability: 10, name: '200 Bonus Points', icon: '⭐', color: 'bg-orange-500' },
      { type: 'product_discount', value: 25, probability: 5, name: '25% Product Discount', icon: '🎁', color: 'bg-red-500' }
    ],
    cooldown: 1440, // 24 hours in minutes
    lastSpin: null
  };

  // Mock spin history - replace with real API call
  const mockSpinHistory = [
    { timestamp: new Date(Date.now() - 86400000), reward: { type: 'coupon', value: 15, name: '15% OFF Coupon' }, applied: true },
    { timestamp: new Date(Date.now() - 172800000), reward: { type: 'points', value: 100, name: '100 Bonus Points' }, applied: true },
    { timestamp: new Date(Date.now() - 259200000), reward: { type: 'free_shipping', value: 0, name: 'Free Shipping' }, applied: false }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setWheelConfig(mockWheelConfig);
      setSpinHistory(mockSpinHistory);
      setLoading(false);
    }, 1000);
  }, []);

  const canSpin = useCallback(() => {
    if (!wheelConfig || !isAuthenticated) return false;
    
    // Check if user has enough points
    if (wheelConfig.cost.type === 'points' && points < wheelConfig.cost.amount) {
      return false;
    }
    
    // Check cooldown
    if (wheelConfig.lastSpin) {
      const timeSinceLastSpin = Date.now() - new Date(wheelConfig.lastSpin).getTime();
      const cooldownMs = wheelConfig.cooldown * 60 * 1000;
      if (timeSinceLastSpin < cooldownMs) {
        return false;
      }
    }
    
    return true;
  }, [wheelConfig, isAuthenticated, points]);

  const getSpinResult = () => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const reward of wheelConfig.rewards) {
      cumulative += reward.probability;
      if (random <= cumulative) {
        return reward;
      }
    }
    
    return wheelConfig.rewards[0]; // Fallback
  };

  const handleSpin = async () => {
    if (!canSpin() || isSpinning) return;
    
    setIsSpinning(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = getSpinResult();
      setSpinResult(result);
      
      // Update mock data
      setWheelConfig(prev => ({
        ...prev,
        lastSpin: new Date().toISOString()
      }));
      
      // Add to history
      setSpinHistory(prev => [{
        timestamp: new Date(),
        reward: result,
        applied: false
      }, ...prev]);
      
      // Simulate points deduction
      if (wheelConfig.cost.type === 'points') {
        // In real app, this would update the loyalty context
        console.log(`Deducted ${wheelConfig.cost.amount} points`);
      }
      
      setShowResult(true);
      
      if (onRewardApplied) {
        onRewardApplied(result);
      }
      
    } catch (error) {
      setError('Failed to spin the wheel. Please try again.');
    } finally {
      setIsSpinning(false);
    }
  };

  const applyReward = async (reward) => {
    try {
      // Simulate applying reward
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update history to show reward as applied
      setSpinHistory(prev => 
        prev.map((spin, index) => 
          index === 0 ? { ...spin, applied: true } : spin
        )
      );
      
      setShowResult(false);
      setSpinResult(null);
      
      // Show success message
      // In real app, this would trigger a toast notification
      console.log(`Applied reward: ${reward.name}`);
      
    } catch (error) {
      setError('Failed to apply reward. Please try again.');
    }
  };

  const getCooldownTime = () => {
    if (!wheelConfig?.lastSpin) return null;
    
    const timeSinceLastSpin = Date.now() - new Date(wheelConfig.lastSpin).getTime();
    const cooldownMs = wheelConfig.cooldown * 60 * 1000;
    const remainingMs = cooldownMs - timeSinceLastSpin;
    
    if (remainingMs <= 0) return null;
    
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getRewardIcon = (reward) => {
    switch (reward.type) {
      case 'coupon':
        return <GiftIcon className="w-6 h-6" />;
      case 'free_shipping':
        return <TruckIcon className="w-6 h-6" />;
      case 'points':
        return <StarIcon className="w-6 h-6" />;
      case 'product_discount':
        return <SparklesIcon className="w-6 h-6" />;
      default:
        return <GiftIcon className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Spin Wheel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🎰</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login to Spin!</h2>
          <p className="text-gray-600 mb-6">Sign in to your account to access the spin wheel and win amazing rewards!</p>
          <button
            onClick={onClose}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FireIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{wheelConfig?.name}</h2>
                <p className="text-white text-opacity-90">Spin to win amazing rewards!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-30 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Spin Wheel Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wheel Display */}
            <div className="text-center">
              <div className="relative w-64 h-64 mx-auto mb-6">
                {/* Wheel Background */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-200 flex items-center justify-center">
                  {isSpinning ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, ease: "easeOut" }}
                      className="text-4xl"
                    >
                      🎰
                    </motion.div>
                  ) : (
                    <div className="text-4xl">🎰</div>
                  )}
                </div>
                
                {/* Spin Button */}
                <button
                  onClick={handleSpin}
                  disabled={!canSpin() || isSpinning}
                  className={`absolute inset-0 m-auto w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all ${
                    canSpin() && !isSpinning
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSpinning ? 'SPINNING...' : 'SPIN!'}
                </button>
              </div>

              {/* Spin Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span>Cost: {wheelConfig?.cost.amount} {wheelConfig?.cost.type === 'points' ? 'Points' : 'Credits'}</span>
                </div>
                
                {!canSpin() && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {points < (wheelConfig?.cost.amount || 0) ? (
                      <span>Not enough points. You need {wheelConfig?.cost.amount - points} more points.</span>
                    ) : (
                      <span>Cooldown active. Try again in {getCooldownTime()}.</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Rewards & Info */}
            <div className="space-y-6">
              {/* Available Rewards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <GiftIcon className="w-5 h-5 text-purple-500 mr-2" />
                  Available Rewards
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {wheelConfig?.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 ${reward.color} rounded-full flex items-center justify-center text-white`}>
                        {getRewardIcon(reward)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800">{reward.name}</div>
                        <div className="text-xs text-gray-500">{reward.probability}% chance</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Stats */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Your Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Current Points</div>
                    <div className="font-bold text-purple-600">{points?.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Loyalty Level</div>
                    <div className="font-bold text-purple-600">{level || 'Bronze'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spin History */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
              Recent Spins
            </h3>
            <div className="space-y-3">
              {spinHistory.slice(0, 5).map((spin, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      {getRewardIcon(spin.reward)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{spin.reward.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(spin.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {spin.applied ? (
                      <span className="text-green-600 text-sm font-medium">✓ Applied</span>
                    ) : (
                      <button
                        onClick={() => applyReward(spin.reward)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && spinResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
          >
            <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
              <p className="text-gray-600 mb-6">You won:</p>
              
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl mb-6">
                <div className="text-4xl mb-2">{getRewardIcon(spinResult)}</div>
                <div className="text-xl font-bold text-gray-800">{spinResult.name}</div>
                {spinResult.type === 'coupon' && (
                  <div className="text-2xl font-bold text-purple-600">{spinResult.value}% OFF</div>
                )}
                {spinResult.type === 'points' && (
                  <div className="text-2xl font-bold text-purple-600">+{spinResult.value} Points</div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => applyReward(spinResult)}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Apply Reward
                </button>
                <button
                  onClick={() => setShowResult(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpinWheel;
