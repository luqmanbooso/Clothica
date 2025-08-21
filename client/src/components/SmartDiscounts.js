import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GiftIcon, 
  TagIcon, 
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLoyalty } from '../contexts/LoyaltyContext';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';

const SmartDiscounts = ({ onCouponApplied, onCouponRemoved, appliedCoupon = null }) => {
  const { user, isAuthenticated } = useAuth();
  const { level, points } = useLoyalty();
  const { cart, cartTotal } = useCart();
  
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('savings');

  // Mock coupons data - replace with real API call
  const mockCoupons = [
    {
      id: '1',
      code: 'WELCOME15',
      type: 'percentage',
      value: 15,
      minCartValue: 1000,
      maxDiscount: 500,
      description: 'Welcome discount for new customers',
      category: 'welcome',
      userGroups: ['new', 'returning'],
      loyaltyLevels: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxUses: 1000,
      currentUses: 450,
      maxUsesPerUser: 1,
      isActive: true,
      priority: 1
    },
    {
      id: '2',
      code: 'FLASH20',
      type: 'percentage',
      value: 20,
      minCartValue: 2000,
      maxDiscount: 800,
      description: 'Flash sale - limited time only!',
      category: 'flash_sale',
      userGroups: ['all'],
      loyaltyLevels: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      maxUses: 500,
      currentUses: 320,
      maxUsesPerUser: 1,
      isActive: true,
      priority: 2
    },
    {
      id: '3',
      code: 'LOYALTY25',
      type: 'percentage',
      value: 25,
      minCartValue: 3000,
      maxDiscount: 1200,
      description: 'Exclusive discount for loyalty members',
      category: 'loyalty',
      userGroups: ['returning'],
      loyaltyLevels: ['silver', 'gold', 'platinum', 'diamond'],
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      maxUses: 200,
      currentUses: 89,
      maxUsesPerUser: 2,
      isActive: true,
      priority: 3
    },
    {
      id: '4',
      code: 'FREESHIP',
      type: 'free_shipping',
      value: 0,
      minCartValue: 1500,
      maxDiscount: 300,
      description: 'Free shipping on orders above Rs. 1500',
      category: 'shipping',
      userGroups: ['all'],
      loyaltyLevels: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      maxUses: 2000,
      currentUses: 1200,
      maxUsesPerUser: 3,
      isActive: true,
      priority: 4
    },
    {
      id: '5',
      code: 'VOLUME30',
      type: 'percentage',
      value: 30,
      minCartValue: 5000,
      maxDiscount: 2000,
      description: 'Volume discount for large orders',
      category: 'volume',
      userGroups: ['all'],
      loyaltyLevels: ['all'],
      startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      maxUses: 100,
      currentUses: 45,
      maxUsesPerUser: 1,
      isActive: true,
      priority: 5
    },
    {
      id: '6',
      code: 'VIP40',
      type: 'percentage',
      value: 40,
      minCartValue: 8000,
      maxDiscount: 4000,
      description: 'VIP exclusive discount',
      category: 'vip',
      userGroups: ['returning'],
      loyaltyLevels: ['platinum', 'diamond'],
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      maxUses: 50,
      currentUses: 12,
      maxUsesPerUser: 1,
      isActive: true,
      priority: 6
    }
  ];

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Fetch available coupons from API
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch active coupons from the public endpoint
      const response = await api.get('/api/coupons/available');
      const apiCoupons = response.data || [];
      
      // Filter coupons based on user context and cart
      const eligibleCoupons = apiCoupons.filter(coupon => {
        // Check if coupon is active and within date range
        if (!coupon.isActive) return false;
        
        const now = new Date();
        const startDate = new Date(coupon.validFrom || coupon.startDate);
        const endDate = new Date(coupon.validUntil || coupon.endDate);
        if (now < startDate || now > endDate) return false;
        
        // Check user group eligibility
        if (coupon.userGroups && coupon.userGroups.length > 0 && !coupon.userGroups.includes('all')) {
          if (!isAuthenticated && !coupon.userGroups.includes('guest')) return false;
          if (isAuthenticated && user?.isNew && !coupon.userGroups.includes('new')) return false;
          if (isAuthenticated && !user?.isNew && !coupon.userGroups.includes('returning')) return false;
        }
        
        // Check loyalty level eligibility
        if (coupon.loyaltyLevels && coupon.loyaltyLevels.length > 0 && !coupon.loyaltyLevels.includes('all')) {
          if (!level || !coupon.loyaltyLevels.includes(level)) return false;
        }
        
        return true;
      });
      
      setCoupons(eligibleCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setError('Failed to load coupons');
      // Fallback to mock data if API fails
      setCoupons(mockCoupons);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort coupons
  const filteredAndSortedCoupons = useCallback(() => {
    let filtered = coupons.filter(coupon => {
      // Filter by search term
      if (searchTerm && !coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !coupon.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by type
      if (filterType !== 'all' && coupon.category !== filterType) {
        return false;
      }
      
      // Filter by user eligibility
      if (!isUserEligible(coupon)) {
        return false;
      }
      
      // Filter by cart value
      if (cartTotal < coupon.minCartValue) {
        return false;
      }
      
      return true;
    });

    // Sort coupons
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'savings':
          return calculatePotentialSavings(b) - calculatePotentialSavings(a);
        case 'expiry':
          return new Date(a.endDate) - new Date(b.endDate);
        case 'priority':
          return a.priority - b.priority;
        case 'value':
          return b.value - a.value;
        default:
          return 0;
      }
    });

    return filtered;
  }, [coupons, searchTerm, filterType, sortBy, cartTotal]);

  // Check if user is eligible for a coupon
  const isUserEligible = (coupon) => {
    if (!isAuthenticated) return false;
    
    // Check user groups
    if (coupon.userGroups.includes('new') && user?.joinDate) {
      const daysSinceJoin = (Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceJoin > 30) return false;
    }
    
    // Check loyalty level
    if (coupon.loyaltyLevels.includes('all')) return true;
    if (!coupon.loyaltyLevels.includes(level)) return false;
    
    return true;
  };

  // Calculate potential savings for a coupon
  const calculatePotentialSavings = (coupon) => {
    if (coupon.type === 'free_shipping') {
      return Math.min(coupon.maxDiscount, 300); // Assume shipping cost
    }
    
    if (coupon.type === 'percentage') {
      const discount = (cartTotal * coupon.value) / 100;
      return Math.min(discount, coupon.maxDiscount);
    }
    
    if (coupon.type === 'fixed') {
      return Math.min(coupon.value, coupon.maxDiscount);
    }
    
    return 0;
  };

  // Get best coupon suggestion
  const getBestCoupon = () => {
    const eligibleCoupons = filteredAndSortedCoupons();
    return eligibleCoupons.length > 0 ? eligibleCoupons[0] : null;
  };

  // Apply coupon
  const handleApplyCoupon = async (coupon) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onCouponApplied) {
        onCouponApplied(coupon);
      }
      
      // Show success message
      console.log(`Applied coupon: ${coupon.code}`);
      
    } catch (error) {
      setError('Failed to apply coupon. Please try again.');
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    if (onCouponRemoved) {
      onCouponRemoved();
    }
  };

  // Get coupon display info
  const getCouponDisplay = (coupon) => {
    const savings = calculatePotentialSavings(coupon);
    const isExpiringSoon = new Date(coupon.endDate) - Date.now() < 24 * 60 * 60 * 1000; // 24 hours
    
    return {
      savings,
      isExpiringSoon,
      discountText: coupon.type === 'free_shipping' ? 'Free Shipping' : 
                   coupon.type === 'percentage' ? `${coupon.value}% OFF` :
                   coupon.type === 'fixed' ? `Rs. ${coupon.value} OFF` : 'Special Offer',
      badge: isExpiringSoon ? 'expiring' : coupon.category === 'flash_sale' ? 'flash' : 
             coupon.category === 'vip' ? 'vip' : 'normal'
    };
  };

  // Get coupon icon
  const getCouponIcon = (category) => {
    switch (category) {
      case 'welcome':
        return <GiftIcon className="w-5 h-5" />;
      case 'flash_sale':
        return <FireIcon className="w-5 h-5" />;
      case 'loyalty':
        return <StarIcon className="w-5 h-5" />;
      case 'shipping':
        return <TruckIcon className="w-5 h-5" />;
      case 'volume':
        return <CurrencyDollarIcon className="w-5 h-5" />;
      case 'vip':
        return <SparklesIcon className="w-5 h-5" />;
      default:
        return <TagIcon className="w-5 h-5" />;
    }
  };

  // Get badge styling
  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'expiring':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'flash':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const bestCoupon = getBestCoupon();
  const filteredCoupons = filteredAndSortedCoupons();

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <GiftIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Smart Discounts</h2>
              <p className="text-gray-600">Find the best deals for your cart</p>
            </div>
          </div>
          
          {appliedCoupon && (
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ {appliedCoupon.code} Applied
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Best Deal Highlight */}
        {bestCoupon && !appliedCoupon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FireIcon className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Best Deal Available!</div>
                  <div className="text-sm opacity-90">
                    Use {bestCoupon.code} to save Rs. {calculatePotentialSavings(bestCoupon)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleApplyCoupon(bestCoupon)}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search coupons by code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <GiftIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="welcome">Welcome</option>
              <option value="flash_sale">Flash Sale</option>
              <option value="loyalty">Loyalty</option>
              <option value="shipping">Shipping</option>
              <option value="volume">Volume</option>
              <option value="vip">VIP</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="savings">Best Savings</option>
              <option value="expiry">Expiring Soon</option>
              <option value="priority">Priority</option>
              <option value="value">Highest Value</option>
            </select>

            {/* Show All Toggle */}
            <button
              onClick={() => setShowAllCoupons(!showAllCoupons)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              {showAllCoupons ? 'Show Less' : 'Show All'}
            </button>
          </div>
        </div>

        {/* Coupons List */}
        <div className="space-y-4">
          {filteredCoupons.slice(0, showAllCoupons ? filteredCoupons.length : 3).map((coupon) => {
            const display = getCouponDisplay(coupon);
            const isEligible = isUserEligible(coupon);
            const canApply = cartTotal >= coupon.minCartValue && !appliedCoupon;
            
            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Coupon Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                        {getCouponIcon(coupon.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-800">{coupon.code}</h3>
                          <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getBadgeStyle(display.badge)}`}>
                            {display.badge === 'expiring' ? 'Expiring Soon' :
                             display.badge === 'flash' ? 'Flash Sale' :
                             display.badge === 'vip' ? 'VIP Only' : coupon.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{coupon.description}</p>
                      </div>
                    </div>

                    {/* Coupon Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Discount</div>
                        <div className="font-semibold text-green-600">{display.discountText}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Min. Cart Value</div>
                        <div className="font-semibold">Rs. {coupon.minCartValue}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Max. Savings</div>
                        <div className="font-semibold text-green-600">Rs. {coupon.maxDiscount}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Expires</div>
                        <div className="font-semibold">
                          {new Date(coupon.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Eligibility Info */}
                    {!isEligible && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-yellow-800">
                          <InformationCircleIcon className="w-4 h-4" />
                          <span className="text-sm">
                            {coupon.loyaltyLevels.includes('all') ? 
                              'Available to all users' : 
                              `Requires ${coupon.loyaltyLevels.join(' or ')} loyalty level`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      Rs. {display.savings}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">Potential Savings</div>
                    
                    {canApply && isEligible ? (
                      <button
                        onClick={() => handleApplyCoupon(coupon)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
                      >
                        {!isEligible ? 'Not Eligible' : 
                         cartTotal < coupon.minCartValue ? 'Cart Too Small' : 'Already Applied'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* No Coupons Message */}
        {filteredCoupons.length === 0 && (
          <div className="text-center py-8">
            <GiftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Coupons Available</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 
               'Check back later for new offers and discounts'}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartDiscounts;
