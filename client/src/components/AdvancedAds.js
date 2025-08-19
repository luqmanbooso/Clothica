import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  XMarkIcon, 
  FireIcon, 
  SparklesIcon, 
  GiftIcon,
  ClockIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLoyalty } from '../contexts/LoyaltyContext';
import { useCoupons } from '../contexts/CouponContext';
import api from '../utils/api';

const AdvancedAds = () => {
  const { user, isAuthenticated } = useAuth();
  const { level, points } = useLoyalty();
  const { coupons } = useCoupons();
  const location = useLocation();
  
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [closedAds, setClosedAds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  // Fetch ads based on current context
  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get context-aware ads
      const context = {
        location: getLocationFromPath(location.pathname),
        userType: getUserType(),
        loyaltyLevel: level,
        hasCoupons: coupons.length > 0
      };
      
      const response = await api.get('/api/banners/context', { params: context });
      const contextAds = response.data || [];
      
      // Get special offers that should be displayed as ads
      const offersResponse = await api.get('/api/special-offers/banner');
      const offerAds = (offersResponse.data || []).map(offer => ({
        id: `offer_${offer._id}`,
        type: 'special_offer',
        title: offer.displayTitle || offer.name,
        subtitle: offer.displaySubtitle || offer.description,
        message: offer.displayMessage,
        image: offer.displayImage,
        color: offer.displayColor,
        gradient: offer.displayGradient,
        icon: offer.displayIcon,
        badge: offer.displayBadge,
        actionType: 'offer',
        actionUrl: `/offers/${offer._id}`,
        ctaText: 'Shop Now',
        priority: offer.bannerPriority || 1,
        startDate: offer.startDate,
        endDate: offer.endDate,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        minOrderAmount: offer.minOrderAmount,
        targetUserGroups: offer.targetUserGroups,
        isFlashSale: offer.type === 'flash_sale',
        isSeasonal: offer.type === 'seasonal',
        isLoyaltyReward: offer.type === 'loyalty_reward'
      }));
      
      // Get spin wheel events
      const spinResponse = await api.get('/api/spin-wheel/active');
      const spinAds = (spinResponse.data || []).map(spin => ({
        id: `spin_${spin._id}`,
        type: 'spin_wheel',
        title: '🎯 Spin & Win!',
        subtitle: spin.description || 'Take a chance to win amazing rewards!',
        message: 'Earn points and spin for discounts, free shipping, and more!',
        image: '/spin-wheel-banner.jpg',
        color: '#8B5CF6',
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        icon: '🎰',
        badge: 'NEW',
        actionType: 'spin',
        actionUrl: '/spin-wheel',
        ctaText: 'Spin Now',
        priority: 8,
        cost: '50 points per spin',
        maxSpinsPerDay: spin.usage?.maxSpinsPerDay || 3
      }));
      
      // Combine and sort all ads by priority
      const allAds = [...contextAds, ...offerAds, ...spinAds]
        .filter(ad => isAdValidForUser(ad))
        .sort((a, b) => b.priority - a.priority);
      
      setAds(allAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [location.pathname, level, coupons.length]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Auto-advance ads
  useEffect(() => {
    if (!autoPlay || ads.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => {
        const nextIndex = (prev + 1) % ads.length;
        // Skip closed ads
        if (closedAds.has(ads[nextIndex]?.id)) {
          return (nextIndex + 1) % ads.length;
        }
        return nextIndex;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [ads, closedAds, autoPlay]);

  // Helper functions
  const getLocationFromPath = (pathname) => {
    if (pathname === '/') return 'homepage';
    if (pathname.startsWith('/shop')) return 'shop';
    if (pathname.startsWith('/product')) return 'product';
    if (pathname.startsWith('/cart')) return 'cart';
    if (pathname.startsWith('/checkout')) return 'checkout';
    return 'all';
  };

  const getUserType = () => {
    if (!isAuthenticated) return 'guest';
    if (level === 'Diamond' || level === 'Platinum') return 'vip';
    if (level === 'Gold' || level === 'Silver') return 'loyal';
    return 'user';
  };

  const isAdValidForUser = (ad) => {
    if (!ad) return false;
    
    // Check if ad is closed
    if (closedAds.has(ad.id)) return false;
    
    // Check user targeting
    if (ad.targetUserGroups && ad.targetUserGroups.length > 0) {
      const userGroup = getUserType();
      if (!ad.targetUserGroups.includes('all') && !ad.targetUserGroups.includes(userGroup)) {
        return false;
      }
    }
    
    // Check date validity
    const now = new Date();
    if (ad.startDate && new Date(ad.startDate) > now) return false;
    if (ad.endDate && new Date(ad.endDate) < now) return false;
    
    return true;
  };

  const closeAd = (adId) => {
    setClosedAds(prev => new Set([...prev, adId]));
    // Move to next non-closed ad
    const nextIndex = ads.findIndex((ad, index) => 
      index > currentAdIndex && !closedAds.has(ad.id)
    );
    if (nextIndex !== -1) {
      setCurrentAdIndex(nextIndex);
    } else {
      // Find first non-closed ad
      const firstOpenIndex = ads.findIndex(ad => !closedAds.has(ad.id));
      if (firstOpenIndex !== -1) {
        setCurrentAdIndex(firstOpenIndex);
      }
    }
  };

  const goToAd = (index) => {
    setCurrentAdIndex(index);
  };

  const goToPrevious = () => {
    let prevIndex = currentAdIndex - 1;
    while (prevIndex >= 0 && closedAds.has(ads[prevIndex]?.id)) {
      prevIndex--;
    }
    if (prevIndex < 0) {
      prevIndex = ads.length - 1;
      while (prevIndex >= 0 && closedAds.has(ads[prevIndex]?.id)) {
        prevIndex--;
      }
    }
    setCurrentAdIndex(prevIndex);
  };

  const goToNext = () => {
    let nextIndex = (currentAdIndex + 1) % ads.length;
    while (nextIndex !== currentAdIndex && closedAds.has(ads[nextIndex]?.id)) {
      nextIndex = (nextIndex + 1) % ads.length;
    }
    setCurrentAdIndex(nextIndex);
  };

  const getAdStyle = (ad) => {
    if (ad.gradient) {
      return { background: ad.gradient };
    }
    if (ad.color) {
      return { backgroundColor: ad.color };
    }
    return { background: 'linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%)' };
  };

  const getAdIcon = (ad) => {
    if (ad.icon) return ad.icon;
    
    switch (ad.type) {
      case 'special_offer':
        return ad.isFlashSale ? '🔥' : ad.isSeasonal ? '🍂' : '🎉';
      case 'spin_wheel':
        return '🎰';
      case 'loyalty_reward':
        return '⭐';
      default:
        return '📢';
    }
  };

  const getAdBadge = (ad) => {
    if (ad.badge) return ad.badge;
    
    if (ad.isFlashSale) return 'FLASH SALE';
    if (ad.isSeasonal) return 'SEASONAL';
    if (ad.isLoyaltyReward) return 'LOYALTY';
    if (ad.type === 'spin_wheel') return 'SPIN & WIN';
    
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-64 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-xl"></div>
    );
  }

  if (!ads || ads.length === 0 || ads.every(ad => closedAds.has(ad.id))) {
    return null;
  }

  const currentAd = ads[currentAdIndex];
  if (!currentAd || closedAds.has(currentAd.id)) {
    return null;
  }

  const openAdsCount = ads.filter(ad => !closedAds.has(ad.id)).length;

  return (
    <div className="relative w-full mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-2xl"
          style={getAdStyle(currentAd)}
        >
          {/* Background Image (if available) */}
          {currentAd.image && (
            <div className="absolute inset-0">
              <img
                src={currentAd.image}
                alt={currentAd.title}
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => closeAd(currentAd.id)}
            className="absolute top-4 right-4 z-20 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all duration-200 shadow-lg"
            aria-label="Close advertisement"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Badge */}
          {getAdBadge(currentAd) && (
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-block bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                {getAdBadge(currentAd)}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center p-8">
            <div className="text-center text-white max-w-4xl">
              {/* Icon */}
              <div className="text-6xl mb-4 animate-bounce">
                {getAdIcon(currentAd)}
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                {currentAd.title}
              </h2>

              {/* Subtitle */}
              {currentAd.subtitle && (
                <p className="text-lg md:text-xl mb-4 max-w-2xl mx-auto drop-shadow-md">
                  {currentAd.subtitle}
                </p>
              )}

              {/* Message */}
              {currentAd.message && (
                <p className="text-base md:text-lg mb-6 max-w-3xl mx-auto drop-shadow-md">
                  {currentAd.message}
                </p>
              )}

              {/* Special Features */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {currentAd.isFlashSale && (
                  <div className="flex items-center bg-red-500 bg-opacity-80 px-3 py-1 rounded-full">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-semibold">Limited Time!</span>
                  </div>
                )}
                
                {currentAd.discountType && (
                  <div className="flex items-center bg-green-500 bg-opacity-80 px-3 py-1 rounded-full">
                    <GiftIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-semibold">
                      {currentAd.discountType === 'percentage' 
                        ? `${currentAd.discountValue}% OFF`
                        : `Rs. ${currentAd.discountValue} OFF`
                      }
                    </span>
                  </div>
                )}

                {currentAd.minOrderAmount && (
                  <div className="flex items-center bg-blue-500 bg-opacity-80 px-3 py-1 rounded-full">
                    <StarIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-semibold">
                      Min. Order: Rs. {currentAd.minOrderAmount}
                    </span>
                  </div>
                )}

                {currentAd.type === 'spin_wheel' && (
                  <div className="flex items-center bg-purple-500 bg-opacity-80 px-3 py-1 rounded-full">
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-semibold">{currentAd.cost}</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              {currentAd.actionUrl && currentAd.ctaText && (
                <Link
                  to={currentAd.actionUrl}
                  className="inline-block bg-white text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-xl"
                  onClick={() => {
                    // Record ad click for analytics
                    if (currentAd.id) {
                      api.post(`/api/banners/${currentAd.id}/click`).catch(console.error);
                    }
                  }}
                >
                  {currentAd.ctaText}
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          {openAdsCount > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full transition-all duration-200 shadow-lg z-20"
                aria-label="Previous advertisement"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full transition-all duration-200 shadow-lg z-20"
                aria-label="Next advertisement"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {openAdsCount > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {ads.map((ad, index) => {
                if (closedAds.has(ad.id)) return null;
                return (
                  <button
                    key={ad.id}
                    onClick={() => goToAd(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentAdIndex
                        ? 'bg-white'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                    aria-label={`Go to advertisement ${index + 1}`}
                  />
                );
              })}
            </div>
          )}

          {/* Auto-play Toggle */}
          {openAdsCount > 1 && (
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="absolute bottom-4 right-4 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 px-2 py-1 rounded text-xs font-medium transition-all duration-200"
            >
              {autoPlay ? '⏸️ Pause' : '▶️ Play'}
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Ad Counter */}
      {openAdsCount > 1 && (
        <div className="text-center mt-2 text-sm text-gray-600">
          Advertisement {ads.findIndex(ad => ad.id === currentAd.id) + 1} of {openAdsCount}
        </div>
      )}
    </div>
  );
};

export default AdvancedAds;
