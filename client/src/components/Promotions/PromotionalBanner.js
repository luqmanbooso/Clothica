import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  SparklesIcon,
  FireIcon,
  GiftIcon,
  ClockIcon,
  TagIcon,
  TruckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const PromotionalBanner = ({ position = 'hero', page = 'home', userTier = 'Bronze' }) => {
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const navigate = useNavigate();

  const fetchPromotionalBanners = useCallback(async () => {
    try {
      const response = await api.get(`/api/promotions/banners/${position}?page=${page}&userTier=${userTier}`);
      setBanners(response.data.data.banners || []);
    } catch (error) {
      console.error('Error fetching promotional banners:', error);
    }
  }, [position, page, userTier]);

  useEffect(() => {
    fetchPromotionalBanners();
  }, [fetchPromotionalBanners]);

  useEffect(() => {
    // Auto-rotate banners every 5 seconds if multiple banners
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  useEffect(() => {
    // Update countdown timer for flash sales
    const currentBanner = banners[currentBannerIndex];
    if (currentBanner?.eventId?.endDate) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(currentBanner.eventId.endDate).getTime();
        const remaining = endTime - now;
        
        if (remaining > 0) {
          setTimeRemaining(remaining);
        } else {
          setTimeRemaining(0);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [banners, currentBannerIndex]);


  const trackBannerInteraction = async (bannerId, action, revenue = 0) => {
    try {
      await api.post(`/api/promotions/banners/${bannerId}/track`, {
        action,
        revenue
      });
    } catch (error) {
      console.error('Error tracking banner interaction:', error);
    }
  };

  const handleBannerClick = (banner) => {
    trackBannerInteraction(banner._id, 'click');
    
    if (banner.cta?.link) {
      if (banner.cta.target === '_blank') {
        window.open(banner.cta.link, '_blank');
      } else {
        navigate(banner.cta.link);
      }
    }
  };

  const handleBannerDisplay = useCallback((bannerId) => {
    trackBannerInteraction(bannerId, 'display');
  }, []);

  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return null;
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getBannerTypeIcon = (eventType) => {
    const icons = {
      flash_sale: FireIcon,
      seasonal: SparklesIcon,
      holiday: GiftIcon,
      loyalty_boost: StarIcon,
      promotional: TagIcon
    };
    return icons[eventType] || SparklesIcon;
  };

  const getBannerStyle = (banner) => {
    const baseStyles = "relative overflow-hidden rounded-2xl shadow-lg";
    
    switch (position) {
      case 'hero':
        return `${baseStyles} h-96 md:h-[500px]`;
      case 'top':
        return `${baseStyles} h-24 md:h-32`;
      case 'sidebar':
        return `${baseStyles} h-64`;
      case 'popup':
        return `${baseStyles} max-w-md mx-auto`;
      default:
        return `${baseStyles} h-48`;
    }
  };

  const currentBanner = banners[currentBannerIndex];

  // Track display when banner is shown
  useEffect(() => {
    if (currentBanner) {
      handleBannerDisplay(currentBanner._id);
    }
  }, [currentBanner, handleBannerDisplay]);

  if (!banners.length || !isVisible) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentBannerIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className={getBannerStyle(currentBanner)}
      >
        {/* Banner Content */}
        <div className="relative h-full">
          {/* Background */}
          {currentBanner.bannerType === 'image' && currentBanner.image ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentBanner.image})` }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: currentBanner.textContent?.backgroundColor || 
                  'linear-gradient(135deg, #6C7A59 0%, #D6BFAF 100%)'
              }}
            />
          )}

          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: currentBanner.overlayOpacity || 0.3 }}
          />

          {/* Content */}
          <div className="relative h-full flex items-center justify-between p-6 md:p-8 text-white">
            <div className="flex-1">
              {/* Event Type Badge */}
              {currentBanner.eventId && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1 mb-4"
                >
                  {React.createElement(getBannerTypeIcon(currentBanner.eventId.type), {
                    className: "h-4 w-4"
                  })}
                  <span className="text-sm font-medium capitalize">
                    {currentBanner.eventId.type.replace('_', ' ')}
                  </span>
                </motion.div>
              )}

              {/* Title */}
              <motion.h2
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4"
                style={{ color: currentBanner.textColor || '#ffffff' }}
              >
                {currentBanner.title}
              </motion.h2>

              {/* Subtitle */}
              {currentBanner.subtitle && (
                <motion.p
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl mb-6 opacity-90"
                >
                  {currentBanner.subtitle}
                </motion.p>
              )}

              {/* Description */}
              {currentBanner.description && (
                <motion.p
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-base md:text-lg mb-6 opacity-80 max-w-2xl"
                >
                  {currentBanner.description}
                </motion.p>
              )}

              {/* Countdown Timer for Flash Sales */}
              {timeRemaining && timeRemaining > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center space-x-2 bg-red-600 bg-opacity-90 rounded-lg px-4 py-2 mb-6"
                >
                  <ClockIcon className="h-5 w-5" />
                  <span className="font-mono text-lg font-bold">
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                  <span className="text-sm">left</span>
                </motion.div>
              )}

              {/* CTA Button */}
              {currentBanner.cta && (
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => handleBannerClick(currentBanner)}
                  className="inline-flex items-center space-x-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-105 duration-200"
                  style={{
                    backgroundColor: currentBanner.cta.buttonStyle?.backgroundColor || '#ffffff',
                    color: currentBanner.cta.buttonStyle?.textColor || '#1f2937'
                  }}
                >
                  <span>{currentBanner.cta.text || 'Shop Now'}</span>
                  {currentBanner.cta.action === 'external' && (
                    <TruckIcon className="h-4 w-4" />
                  )}
                </motion.button>
              )}

              {/* Special Offers */}
              {currentBanner.eventId?.type === 'flash_sale' && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4 flex flex-wrap gap-2"
                >
                  <span className="inline-flex items-center bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                    <TagIcon className="h-4 w-4 mr-1" />
                    Up to 70% OFF
                  </span>
                  <span className="inline-flex items-center bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-medium">
                    <TruckIcon className="h-4 w-4 mr-1" />
                    Free Shipping
                  </span>
                </motion.div>
              )}
            </div>

            {/* Right Side Content - Tier-specific benefits */}
            {userTier !== 'guest' && (
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="hidden md:block ml-8"
              >
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <StarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-lg font-bold mb-1">{userTier} Member</div>
                  <div className="text-sm opacity-90">Extra Benefits Available</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Close Button for Popup */}
          {position === 'popup' && (
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}

          {/* Banner Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentBannerIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Urgency Indicator for Flash Sales */}
          {currentBanner.eventId?.type === 'flash_sale' && timeRemaining && timeRemaining < 3600000 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold"
            >
              <FireIcon className="h-4 w-4 inline mr-1" /> ENDING SOON!
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromotionalBanner;

