import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, TagIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { getSocket } from '../utils/socket';

const Banner = ({
  position = 'hero',
  page = 'home',
  eventId = null,
  autoPlay = true,
  interval = 5000,
  showNavigation = true,
  showDots = true,
  height = 'h-64 md:h-80 lg:h-96'
}) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch banners based on context
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/banners/active';
      const params = new URLSearchParams({
        page,
        position,
        userType: 'guest',
        device: 'desktop'
      });

      if (eventId) {
        params.append('eventId', eventId);
      }

      const response = await api.get(`${url}?${params}`);
      const activeBanners = Array.isArray(response.data)
        ? response.data.filter((banner) => banner.isActive)
        : [];

      activeBanners.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return (a.order || 0) - (b.order || 0);
      });

      setBanners(activeBanners);
      if (activeBanners.length === 0) {
        setError('No banners available');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setError('Failed to load banners');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [position, page, eventId]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Listen for banner updates via socket
  useEffect(() => {
    const socket = getSocket();
    const handleUpdate = () => fetchBanners();
    socket.on('banners:update', handleUpdate);
    return () => {
      socket.off('banners:update', handleUpdate);
    };
  }, [fetchBanners]);

  // Auto-advance banners
  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, banners.length]);

  // Navigation functions
  const goToBanner = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1));
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % banners.length);
  }, [banners.length]);

  // Performance tracking
  const trackDisplay = useCallback(async (bannerId) => {
    try {
      await api.post(`/api/banners/${bannerId}/display`);
    } catch (err) {
      // Silently fail for analytics
      console.debug('Banner display tracking failed:', err);
    }
  }, []);

  const trackClick = useCallback(async (bannerId) => {
    try {
      await api.post(`/api/banners/${bannerId}/click`);
    } catch (err) {
      // Silently fail for analytics
      console.debug('Banner click tracking failed:', err);
    }
  }, []);

  // Handle banner click
  const handleBannerClick = useCallback(async (banner) => {
    await trackClick(banner._id);

    if (banner.cta?.link) {
      if (banner.cta.target === '_blank') {
        window.open(banner.cta.link, '_blank');
      } else {
        window.location.href = banner.cta.link;
      }
    }
  }, [trackClick]);

  // Loading state
  if (loading) {
    return (
      <div className={`w-full ${height} bg-gray-200 animate-pulse rounded-lg flex items-center justify-center`}>
        <div className="text-gray-400">Loading banners...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full ${height} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-gray-500 text-center">
          <div className="text-sm">{error}</div>
          <button
            onClick={fetchBanners}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No banners
  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className={`relative w-full ${height} overflow-hidden rounded-lg shadow-lg`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentBanner._id}-${currentIndex}`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
          onAnimationStart={() => trackDisplay(currentBanner._id)}
        >
          {/* Banner Image */}
          <img
            src={currentBanner.image}
            alt={currentBanner.title || currentBanner.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkJhbm5lciBJbWFnZTwvdGV4dD48L3N2Zz4=';
            }}
          />

          {/* Banner Content Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent">
            <div className="flex flex-col justify-center h-full px-8 text-white">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                {currentBanner.title || currentBanner.name}
              </h2>
              {currentBanner.subtitle && (
                <p className="text-lg md:text-xl mb-6 max-w-md">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.cta && currentBanner.cta.text && (
                <button
                  onClick={() => handleBannerClick(currentBanner)}
                  className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit cursor-pointer"
                  style={{
                    backgroundColor: currentBanner.cta.buttonStyle?.backgroundColor || '#FFFFFF',
                    color: currentBanner.cta.buttonStyle?.textColor || '#000000',
                    borderRadius: currentBanner.cta.buttonStyle?.borderRadius || '8px',
                    padding: currentBanner.cta.buttonStyle?.padding || '12px 24px'
                  }}
                >
                  {currentBanner.cta.text}
                </button>
              )}
            </div>
          </div>

          {/* Event Badge */}
          {currentBanner.eventId && (
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <TagIcon className="h-4 w-4 mr-1" />
                {currentBanner.eventId.name}
              </span>
            </div>
          )}

          {/* Position Badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {currentBanner.position}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {showNavigation && banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
            aria-label="Previous banner"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
            aria-label="Next banner"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToBanner(index)}
              className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex
                  ? 'bg-white shadow-lg'
                  : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Banner Counter */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 right-4">
          <span className="text-white text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
            {currentIndex + 1} / {banners.length}
          </span>
        </div>
      )}

      {/* Pause/Play Indicator */}
      {autoPlay && banners.length > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
            Auto-play
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner;

