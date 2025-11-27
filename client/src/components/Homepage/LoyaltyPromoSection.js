import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  GiftIcon,
  TrophyIcon,
  StarIcon,
  ArrowRightIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import PromotionalBanner from '../Promotions/PromotionalBanner';
import SpinWheel from '../SpinWheel/SpinWheel';

const LoyaltyPromoSection = () => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [promotions, setPromotions] = useState(null);
  const [flashSales, setFlashSales] = useState([]);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPromotionalData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Fetch personalized data for authenticated users
        const [loyaltyRes, promotionsRes, flashSalesRes] = await Promise.all([
          api.get('/api/loyalty-member/profile'),
          api.get('/api/promotions/personalized?page=home'),
          api.get('/api/promotions/flash-sales')
        ]);
        
        setLoyaltyData(loyaltyRes.data.data);
        setPromotions(promotionsRes.data.data);
        setFlashSales(flashSalesRes.data.data.flashSales || []);
      } else {
        // Fetch general promotions for guests
        const [promotionsRes, flashSalesRes] = await Promise.all([
          api.get('/api/promotions/active?page=home'),
          api.get('/api/promotions/flash-sales')
        ]);
        
        setPromotions(promotionsRes.data.data);
        setFlashSales(flashSalesRes.data.data.flashSales || []);
      }
    } catch (error) {
      console.error('Error fetching promotional data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPromotionalData();
  }, [fetchPromotionalData]);


  const handleSpinReward = (reward) => {
    // Refresh loyalty data after spin
    if (user) {
      fetchPromotionalData();
    }
  };

  const getTierGradient = (tier) => {
    const gradients = {
      Bronze: 'from-amber-600 to-yellow-600',
      Silver: 'from-gray-400 to-gray-600',
      Gold: 'from-yellow-400 to-yellow-600',
      Platinum: 'from-purple-400 to-purple-600'
    };
    return gradients[tier] || gradients.Bronze;
  };


  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Promotional Banner */}
        {promotions?.banners?.length > 0 && (
          <div className="mb-16">
            <PromotionalBanner 
              position="hero" 
              page="home" 
              userTier={loyaltyData?.tier || 'guest'} 
            />
          </div>
        )}

        {/* Flash Sales Section */}
        {flashSales.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                <FireIcon className="h-8 w-8 text-red-500 mr-3" />
                Flash Sales
              </h2>
              <p className="text-gray-600">Limited time offers - Don't miss out!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashSales.slice(0, 3).map((sale, index) => (
                <motion.div
                  key={sale._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{sale.name}</h3>
                      <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
                        {sale.urgencyLevel.toUpperCase()}
                      </span>
                    </div>
                    
                    {sale.timeRemaining && (
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4" />
                        <span className="font-mono text-sm">
                          {sale.formattedTimeRemaining} left
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{sale.description}</p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Shop Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loyalty Section */}
        {user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Loyalty Rewards</h2>
              <p className="text-gray-600">Exclusive benefits just for you</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Loyalty Status Card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${getTierGradient(loyaltyData?.tier)} rounded-2xl flex items-center justify-center`}>
                        <TrophyIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{loyaltyData?.tier} Member</h3>
                        <p className="text-gray-600">
                          {loyaltyData?.points?.toLocaleString()} points available
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate('/loyalty')}
                      className="flex items-center space-x-2 bg-[#6C7A59] text-white px-4 py-2 rounded-lg hover:bg-[#5A6A4A] transition-colors"
                    >
                      <span>View Dashboard</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Benefits Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-[#6C7A59] mb-1">
                        {loyaltyData?.benefits?.discount}%
                      </div>
                      <div className="text-sm text-gray-600">Member Discount</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-[#6C7A59] mb-1">
                        {loyaltyData?.benefits?.pointsMultiplier}x
                      </div>
                      <div className="text-sm text-gray-600">Points Multiplier</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-[#6C7A59] mb-1">
                        {loyaltyData?.benefits?.freeShippingThreshold === 0 ? 'FREE' : `$${loyaltyData?.benefits?.freeShippingThreshold}+`}
                      </div>
                      <div className="text-sm text-gray-600">Free Shipping</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-[#6C7A59] mb-1">
                        {loyaltyData?.spinWheelData?.availableSpins || 0}
                      </div>
                      <div className="text-sm text-gray-600">Spins Available</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spin Wheel Card */}
              <div className="space-y-6">
                <div 
                  className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-transform duration-200"
                  onClick={() => setShowSpinWheel(true)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <SparklesIcon className="h-8 w-8" />
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {loyaltyData?.spinWheelData?.availableSpins || 0}
                      </div>
                      <div className="text-sm opacity-90">Spins Available</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Daily Spin Wheel</h3>
                  <p className="text-sm opacity-90">Spin for exclusive rewards and discounts!</p>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/loyalty/redeem')}
                      className="w-full flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <GiftIcon className="h-5 w-5" />
                        <span>Redeem Points</span>
                      </div>
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => navigate('/loyalty/history')}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <TrophyIcon className="h-5 w-5" />
                        <span>View History</span>
                      </div>
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Guest Loyalty CTA */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-r from-[#6C7A59] to-[#D6BFAF] rounded-2xl p-8 md:p-12 text-white text-center">
              <div className="max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <StarIcon className="h-10 w-10" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Join Our Loyalty Program
                </h2>
                
                <p className="text-xl mb-8 opacity-90">
                  Earn points on every purchase, get exclusive discounts, and unlock VIP benefits
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">5% - 20%</div>
                    <div className="text-sm opacity-90">Member Discounts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">1-3x</div>
                    <div className="text-sm opacity-90">Points Multiplier</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">FREE</div>
                    <div className="text-sm opacity-90">Shipping & Returns</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-white text-[#6C7A59] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Join Now - It's Free!
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-[#6C7A59] transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Seasonal Promotions */}
        {promotions?.events?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Special Events</h2>
              <p className="text-gray-600">Don't miss these limited-time opportunities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {promotions.events.slice(0, 2).map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#6C7A59] to-[#D6BFAF] rounded-xl flex items-center justify-center">
                        <SparklesIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{event.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{event.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Ends {new Date(event.endDate).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => navigate('/shop')}
                        className="bg-[#6C7A59] text-white px-4 py-2 rounded-lg hover:bg-[#5A6A4A] transition-colors"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Spin Wheel Modal */}
      <SpinWheel
        isOpen={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        onReward={handleSpinReward}
      />
    </div>
  );
};

export default LoyaltyPromoSection;
