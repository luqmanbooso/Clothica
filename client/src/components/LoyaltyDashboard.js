import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  GiftIcon, 
  TrophyIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  UserIcon,
  ShoppingBagIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLoyalty } from '../contexts/LoyaltyContext';
import { useCoupons } from '../contexts/CouponContext';
import api from '../utils/api';

const LoyaltyDashboard = ({ compact = false }) => {
  const { user, isAuthenticated } = useAuth();
  const { points, level, nextReward, totalSpent, ordersCount } = useLoyalty();
  const { coupons } = useCoupons();
  
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllRewards, setShowAllRewards] = useState(false);

  // Fetch available rewards
  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/loyalty/rewards', {
        params: { level, points }
      });
      setRewards(response.data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  }, [level, points]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRewards();
    }
  }, [isAuthenticated, fetchRewards]);

  // Get level information
  const getLevelInfo = (userLevel) => {
    const levels = {
      'Bronze': {
        color: 'from-amber-600 to-orange-700',
        icon: <GiftIcon className="w-6 h-6" />,
        minPoints: 0,
        maxPoints: 49,
        benefits: [
          'Earn 1 point per Rs. 10 spent',
          'Access to basic coupons',
          'Standard customer support'
        ]
      },
      'Silver': {
        color: 'from-gray-300 to-gray-500',
        icon: <StarIcon className="w-6 h-6" />,
        minPoints: 50,
        maxPoints: 199,
        benefits: [
          'Earn 1.2 points per Rs. 10 spent',
          'Access to premium coupons',
          'Priority customer support',
          'Birthday rewards'
        ]
      },
      'Gold': {
        color: 'from-yellow-400 to-orange-500',
        icon: <StarIcon className="w-6 h-6" />,
        minPoints: 200,
        maxPoints: 499,
        benefits: [
          'Earn 1.5 points per Rs. 10 spent',
          'Exclusive Gold member coupons',
          'VIP customer support',
          'Birthday rewards + bonus',
          'Early access to sales'
        ]
      },
      'Platinum': {
        color: 'from-gray-400 to-gray-600',
        icon: <TrophyIcon className="w-6 h-6" />,
        minPoints: 500,
        maxPoints: 999,
        benefits: [
          'Earn 2 points per Rs. 10 spent',
          'Platinum exclusive coupons',
          'Dedicated customer support',
          'Premium birthday rewards',
          'Early access to sales',
          'Free shipping on all orders'
        ]
      },
      'Diamond': {
        color: 'from-purple-500 to-pink-500',
        icon: <SparklesIcon className="w-6 h-6" />,
        minPoints: 1000,
        maxPoints: Infinity,
        benefits: [
          'Earn 3 points per Rs. 10 spent',
          'Diamond exclusive coupons',
          'Personal account manager',
          'Luxury birthday rewards',
          'First access to all sales',
          'Free shipping + express delivery',
          'Exclusive product access'
        ]
      }
    };
    
    return levels[userLevel] || levels['Bronze'];
  };

  // Calculate progress to next level
  const getProgressToNext = () => {
    if (!nextReward || nextReward.pointsNeeded <= 0) return 100;
    
    const currentLevelInfo = getLevelInfo(level);
    const pointsInCurrentLevel = points - currentLevelInfo.minPoints;
    const pointsNeededForCurrentLevel = currentLevelInfo.maxPoints - currentLevelInfo.minPoints;
    
    return Math.min(100, Math.max(0, (pointsInCurrentLevel / pointsNeededForCurrentLevel) * 100));
  };

  // Get next level info
  const getNextLevelInfo = () => {
    if (!nextReward || nextReward.pointsNeeded <= 0) return null;
    
    const nextLevel = nextReward.next;
    return getLevelInfo(nextLevel);
  };

  // Format points with commas
  const formatPoints = (pts) => {
    return pts.toLocaleString();
  };

  // Get reward display info
  const getRewardDisplay = (reward) => {
    switch (reward.type) {
      case 'coupon':
        return {
          icon: '',
          color: 'bg-green-500',
          text: `${reward.discount}% OFF Coupon`
        };
      case 'free_shipping':
        return {
          icon: '',
          color: 'bg-blue-500',
          text: 'Free Shipping'
        };
      case 'bonus_points':
        return {
          icon: '⭐',
          color: 'bg-yellow-500',
          text: `${reward.points} Bonus Points`
        };
      case 'product_discount':
        return {
          icon: '',
          color: 'bg-red-500',
          text: `${reward.discount}% Product Discount`
        };
      default:
        return {
          icon: '',
          color: 'bg-purple-500',
          text: reward.name || 'Special Reward'
        };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center">
        <div className="text-4xl mb-4">⭐</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Join Our Loyalty Program</h3>
        <p className="text-gray-600 mb-4">Earn points with every purchase and unlock amazing rewards!</p>
        <Link
          to="/login"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Sign In to Start Earning
        </Link>
      </div>
    );
  }

  const levelInfo = getLevelInfo(level);
  const nextLevelInfo = getNextLevelInfo();
  const progressToNext = getProgressToNext();

  if (compact) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 bg-gradient-to-br ${levelInfo.color} rounded-full flex items-center justify-center text-white`}>
              {levelInfo.icon}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{level}</div>
              <div className="text-sm text-gray-500">{formatPoints(points)} pts</div>
            </div>
          </div>
          <Link
            to="/loyalty"
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            View Details →
          </Link>
        </div>
        
        {/* Progress Bar */}
        {nextReward && nextReward.pointsNeeded > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress to {nextReward.next}</span>
              <span>{nextReward.pointsNeeded} pts needed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressToNext}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-br ${levelInfo.color} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {levelInfo.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{level} Member</h2>
              <p className="text-white text-opacity-90">Exclusive benefits & rewards</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatPoints(points)}</div>
            <div className="text-white text-opacity-90">Total Points</div>
          </div>
        </div>

        {/* Progress to next level */}
        {nextReward && nextReward.pointsNeeded > 0 && (
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Progress to {nextReward.next}</span>
              <span className="text-sm">{nextReward.pointsNeeded} points needed</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
              <motion.div
                className="bg-white h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{formatPoints(points)}</div>
          <div className="text-sm text-gray-600">Available Points</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">Rs. {totalSpent?.toLocaleString() || '0'}</div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{ordersCount || 0}</div>
          <div className="text-sm text-gray-600">Orders Placed</div>
        </div>
      </div>

      {/* Current Level Benefits */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
          Your {level} Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {levelInfo.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Available Rewards */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <GiftIcon className="w-5 h-5 text-purple-500 mr-2" />
            Available Rewards
          </h3>
          <button
            onClick={() => setShowAllRewards(!showAllRewards)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
          >
            {showAllRewards ? 'Show Less' : 'Show All'}
            <ChevronRightIcon className={`w-4 h-4 ml-1 transition-transform ${showAllRewards ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">{error}</div>
        ) : (
          <div className="space-y-3">
            {rewards.slice(0, showAllRewards ? rewards.length : 3).map((reward, index) => {
              const display = getRewardDisplay(reward);
              return (
                <motion.div
                  key={reward.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${display.color} rounded-full flex items-center justify-center text-white text-lg`}>
                      {display.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{display.text}</div>
                      {reward.description && (
                        <div className="text-sm text-gray-600">{reward.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-purple-600">
                      {reward.pointsCost ? `${reward.pointsCost} pts` : 'Free'}
                    </div>
                    {reward.expiresAt && (
                      <div className="text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3 inline mr-1" />
                        {new Date(reward.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {rewards.length === 0 && !loading && (
          <div className="text-center py-6 text-gray-500">
            <GiftIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No rewards available at the moment</p>
            <p className="text-sm">Keep shopping to unlock more rewards!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            to="/shop"
            className="flex items-center justify-center space-x-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>Shop & Earn Points</span>
          </Link>
          
          <Link
            to="/spin-wheel"
            className="flex items-center justify-center space-x-2 p-3 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
          >
            <FireIcon className="w-5 h-5" />
            <span>Spin & Win</span>
          </Link>
          
          <Link
            to="/coupons"
            className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <GiftIcon className="w-5 h-5" />
            <span>View Coupons</span>
          </Link>
          
          <Link
            to="/profile"
            className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <UserIcon className="w-5 h-5" />
            <span>Profile Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;


