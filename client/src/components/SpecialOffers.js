import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GiftIcon, 
  FireIcon, 
  StarIcon, 
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLoyalty } from '../contexts/LoyaltyContext';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';

const SpecialOffers = ({ maxOffers = 5, showCountdown = true }) => {
  const { user, isAuthenticated } = useAuth();
  const { level, points } = useLoyalty();
  const { cart, cartTotal } = useCart();
  
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [countdowns, setCountdowns] = useState({});

  // Mock offers data - replace with real API call
  const mockOffers = [
    {
      id: '1',
      title: 'Flash Sale - 50% OFF Everything!',
      description: 'Limited time offer on all clothing items. Hurry up before it ends!',
      type: 'flash_sale',
      discount: 50,
      minCartValue: 1000,
      maxDiscount: 2000,
      startDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endDate: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      backgroundColor: 'from-red-500 to-orange-500',
      textColor: 'text-white',
      priority: 1,
      userGroups: ['all'],
      loyaltyLevels: ['all'],
      isActive: true,
      usage: {
        maxUses: 1000,
        currentUses: 450,
        maxUsesPerUser: 1
      }
    },
    {
      id: '2',
      title: 'New Customer Welcome - 30% OFF',
      description: 'Special discount for first-time shoppers. Start your fashion journey with us!',
      type: 'welcome',
      discount: 30,
      minCartValue: 500,
      maxDiscount: 1000,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days from now
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      backgroundColor: 'from-blue-500 to-purple-500',
      textColor: 'text-white',
      priority: 2,
      userGroups: ['new'],
      loyaltyLevels: ['bronze'],
      isActive: true,
      usage: {
        maxUses: 500,
        currentUses: 120,
        maxUsesPerUser: 1
      }
    },
    {
      id: '3',
      title: 'Loyalty Members - Buy 2 Get 1 Free',
      description: 'Exclusive offer for our loyal customers. Mix and match your favorite items!',
      type: 'loyalty',
      discount: 100,
      minCartValue: 3000,
      maxDiscount: 1500,
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000), // 27 days from now
      imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
      backgroundColor: 'from-purple-500 to-pink-500',
      textColor: 'text-white',
      priority: 3,
      userGroups: ['returning'],
      loyaltyLevels: ['silver', 'gold', 'platinum', 'diamond'],
      isActive: true,
      usage: {
        maxUses: 200,
        currentUses: 89,
        maxUsesPerUser: 2
      }
    },
    {
      id: '4',
      title: 'Free Shipping on Orders Above Rs. 2000',
      description: 'No shipping costs when you spend more. Perfect for stocking up on essentials!',
      type: 'shipping',
      discount: 0,
      minCartValue: 2000,
      maxDiscount: 300,
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      backgroundColor: 'from-green-500 to-teal-500',
      textColor: 'text-white',
      priority: 4,
      userGroups: ['all'],
      loyaltyLevels: ['all'],
      isActive: true,
      usage: {
        maxUses: 2000,
        currentUses: 1200,
        maxUsesPerUser: 5
      }
    },
    {
      id: '5',
      title: 'VIP Members - 40% OFF Premium Collection',
      description: 'Exclusive access to our premium collection with massive discounts!',
      type: 'vip',
      discount: 40,
      minCartValue: 5000,
      maxDiscount: 3000,
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      endDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000), // 29 days from now
      imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
      backgroundColor: 'from-yellow-500 to-orange-500',
      textColor: 'text-gray-900',
      priority: 5,
      userGroups: ['returning'],
      loyaltyLevels: ['platinum', 'diamond'],
      isActive: true,
      usage: {
        maxUses: 100,
        currentUses: 23,
        maxUsesPerUser: 1
      }
    }
  ];

  useEffect(() => {
    fetchOffers();
  }, []);

  // Fetch offers from API
  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch active special offers from the backend
      const response = await api.get('/api/special-offers/public');
      const apiOffers = response.data || [];
      
      // Filter offers based on user context
      const filteredOffers = apiOffers.filter(offer => {
        // Check if offer is active and within date range
        if (!offer.isActive) return false;
        
        const now = new Date();
        const startDate = new Date(offer.startDate);
        const endDate = new Date(offer.endDate);
        if (now < startDate || now > endDate) return false;
        
        // Check user group eligibility
        if (offer.userGroups && offer.userGroups.length > 0 && !offer.userGroups.includes('all')) {
          if (!isAuthenticated && !offer.userGroups.includes('guest')) return false;
          if (isAuthenticated && user?.isNew && !offer.userGroups.includes('new')) return false;
          if (isAuthenticated && !user?.isNew && !offer.userGroups.includes('returning')) return false;
        }
        
        // Check loyalty level eligibility
        if (offer.loyaltyLevels && offer.loyaltyLevels.length > 0 && !offer.loyaltyLevels.includes('all')) {
          if (!level || !offer.loyaltyLevels.includes(level)) return false;
        }
        
        return true;
      });
      
      // Sort by priority and take max offers
      const sortedOffers = filteredOffers
        .sort((a, b) => (a.priority || 0) - (b.priority || 0))
        .slice(0, maxOffers);
      
      setOffers(sortedOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('Failed to load offers');
      // Fallback to mock data if API fails
      setOffers(mockOffers.slice(0, maxOffers));
    } finally {
      setLoading(false);
    }
  };

  // Initialize countdown timers
  useEffect(() => {
    if (!showCountdown || offers.length === 0) return;

    const initializeCountdowns = () => {
      const newCountdowns = {};
      offers.forEach(offer => {
        if (offer.endDate) {
          const now = new Date().getTime();
          const end = new Date(offer.endDate).getTime();
          const timeLeft = Math.max(0, end - now);
          
          if (timeLeft > 0) {
            newCountdowns[offer.id] = timeLeft;
          }
        }
      });
      setCountdowns(newCountdowns);
    };

    initializeCountdowns();
    const interval = setInterval(() => {
      const newCountdowns = {};
      offers.forEach(offer => {
        if (offer.endDate) {
          const now = new Date().getTime();
          const end = new Date(offer.endDate).getTime();
          const timeLeft = Math.max(0, end - now);
          
          if (timeLeft > 0) {
            newCountdowns[offer.id] = timeLeft;
          }
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [offers, showCountdown]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || offers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentOfferIndex(prev => (prev + 1) % offers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, offers.length]);

  // Filter offers based on user eligibility
  const eligibleOffers = useCallback(() => {
    return offers.filter(offer => {
      if (!offer.isActive) return false;
      
      // Check user groups
      if (offer.userGroups.includes('new') && user?.joinDate) {
        const daysSinceJoin = (Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceJoin > 30) return false;
      }
      
      // Check loyalty level
      if (offer.loyaltyLevels.includes('all')) return true;
      if (!offer.loyaltyLevels.includes(level)) return false;
      
      return true;
    });
  }, [offers, user, level]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentOfferIndex(prev => (prev - 1 + offers.length) % offers.length);
  };

  const goToNext = () => {
    setCurrentOfferIndex(prev => (prev + 1) % offers.length);
  };

  const goToOffer = (index) => {
    setCurrentOfferIndex(index);
  };

  // Format countdown time
  const formatTimeLeft = (timeLeft) => {
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Get offer icon
  const getOfferIcon = (type) => {
    if (!type) return <GiftIcon className="w-6 h-6" />;
    switch (type) {
      case 'flash_sale':
        return <FireIcon className="w-6 h-6" />;
      case 'welcome':
        return <GiftIcon className="w-6 h-6" />;
      case 'loyalty':
        return <StarIcon className="w-6 h-6" />;
      case 'shipping':
        return <TruckIcon className="w-6 h-6" />;
      case 'vip':
        return <SparklesIcon className="w-6 h-6" />;
      default:
        return <GiftIcon className="w-6 h-6" />;
    }
  };

  // Get offer badge
  const getOfferBadge = (offer) => {
    if (!offer) return 'SPECIAL OFFER';
    if (offer.type === 'flash_sale') return 'FLASH SALE';
    if (offer.type === 'vip') return 'VIP ONLY';
    if (offer.type === 'loyalty') return 'LOYALTY';
    if (offer.type === 'welcome') return 'WELCOME';
    if (offer.type === 'shipping') return 'FREE SHIPPING';
    return 'SPECIAL OFFER';
  };

  // Get offer style
  const getOfferStyle = (offer) => {
    if (!offer) return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    const baseClasses = `bg-gradient-to-r ${offer.backgroundColor} ${offer.textColor}`;
    return baseClasses;
  };

  // Get discount text
  const getDiscountText = (offer) => {
    if (!offer) return 'SPECIAL OFFER';
    if (offer.type === 'shipping') return 'FREE SHIPPING';
    if (offer.type === 'loyalty' && offer.discount === 100) return 'BUY 2 GET 1 FREE';
    if (offer.discount > 0) return `${offer.discount}% OFF`;
    return 'SPECIAL OFFER';
  };

  // Check if offer is expiring soon
  const isExpiringSoon = (offer) => {
    if (!offer || !offer.endDate) return false;
    const timeLeft = new Date(offer.endDate).getTime() - Date.now();
    return timeLeft < 24 * 60 * 60 * 1000; // Less than 24 hours
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredOffers = eligibleOffers();
  
  if (filteredOffers.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
        <GiftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Special Offers Available</h3>
        <p className="text-gray-500">Check back later for exciting deals and promotions!</p>
      </div>
    );
  }

  const currentOffer = filteredOffers[currentOfferIndex];
  const isExpiring = currentOffer ? isExpiringSoon(currentOffer) : false;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <FireIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Special Offers & Promotions</h2>
              <p className="text-gray-600">Limited time deals you don't want to miss!</p>
            </div>
          </div>
          
          {/* Auto-play toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Auto-play</span>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`w-12 h-8 rounded-full transition-colors ${
                autoPlay ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                autoPlay ? 'translate-x-4' : 'translate-x-0'
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Offer Display */}
      <div className="relative">
        {/* Navigation Arrows */}
        {filteredOffers.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}

        {/* Current Offer */}
        {currentOffer && (
          <motion.div
            key={currentOffer.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className={`relative h-80 ${getOfferStyle(currentOffer)} overflow-hidden`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${currentOffer.imageUrl})` }}
            />
          
          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  {getOfferIcon(currentOffer.type)}
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium ${currentOffer.textColor}`}>
                    {getOfferBadge(currentOffer)}
                  </span>
                </div>
              </div>
              
                             {/* Countdown Timer */}
               {showCountdown && currentOffer && countdowns[currentOffer.id] && (
                 <div className="text-right">
                   <div className="text-sm opacity-80">Expires in</div>
                   <div className={`text-2xl font-bold ${isExpiring ? 'text-red-200' : ''}`}>
                     {formatTimeLeft(countdowns[currentOffer.id])}
                   </div>
                   {isExpiring && (
                     <div className="text-sm text-red-200 flex items-center">
                       <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                       Hurry!
                     </div>
                   )}
                 </div>
               )}
            </div>

                         {/* Main Content */}
             {currentOffer ? (
               <div className="flex-1 flex flex-col justify-center">
                 <h3 className="text-3xl font-bold mb-4 max-w-2xl">
                   {currentOffer.title}
                 </h3>
                 <p className="text-lg opacity-90 mb-6 max-w-xl">
                   {currentOffer.description}
                 </p>
                 
                 {/* Offer Details */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                   <div className="text-center">
                     <div className="text-2xl font-bold">{getDiscountText(currentOffer)}</div>
                     <div className="text-sm opacity-80">Discount</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold">Rs. {currentOffer.minCartValue}</div>
                     <div className="text-sm opacity-80">Min. Cart Value</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold">Rs. {currentOffer.maxDiscount}</div>
                     <div className="text-sm opacity-80">Max. Savings</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold">
                       {Math.round((currentOffer.usage.currentUses / currentOffer.usage.maxUses) * 100)}%
                     </div>
                     <div className="text-sm opacity-80">Used</div>
                   </div>
                 </div>
                 
                 {/* CTA Button */}
                 <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors self-start">
                   Shop Now
                 </button>
               </div>
             ) : (
               <div className="flex-1 flex items-center justify-center">
                 <div className="text-center">
                   <div className="text-2xl font-bold mb-2">Loading...</div>
                   <div className="text-lg opacity-80">Please wait while we load the offers</div>
                 </div>
               </div>
             )}
          </div>
        </motion.div>
        )}
      </div>

      {/* Navigation Dots */}
      {filteredOffers.length > 1 && (
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-center space-x-2">
            {filteredOffers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToOffer(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentOfferIndex
                    ? 'bg-purple-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default SpecialOffers;
