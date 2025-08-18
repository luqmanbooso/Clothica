import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Banner = () => {
  const { isAuthenticated } = useAuth();
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBanners();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000); // Change banner every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products/banners');
      
      // The backend already filters active banners, so we don't need to filter again
      const activeBanners = response.data || [];
      setBanners(activeBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const goToBanner = (index) => {
    setCurrentBannerIndex(index);
  };

  const goToPrevious = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
    );
  }

  if (!banners || banners.length === 0) {
    return null; // Don't show anything if no banners
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg">
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <img
          src={currentBanner.image || '/placeholder-banner.jpg'}
          alt={currentBanner.title || currentBanner.name || 'Banner'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-banner.jpg';
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Banner Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6">
            {currentBanner.title && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                {currentBanner.title}
              </h2>
            )}
            
            {currentBanner.subtitle && (
              <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
                {currentBanner.subtitle}
              </p>
            )}
            
            {currentBanner.actionUrl && currentBanner.ctaText && (
              <Link
                to={currentBanner.actionUrl}
                className="inline-block bg-[#6C7A59] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#5A6A4A] transition-colors text-lg"
              >
                {currentBanner.ctaText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all duration-200"
            aria-label="Previous banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all duration-200"
            aria-label="Next banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToBanner(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentBannerIndex
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banner;
