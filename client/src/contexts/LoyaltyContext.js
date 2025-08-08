import React, { createContext, useContext, useReducer, useEffect } from 'react';

const LoyaltyContext = createContext();

const initialState = {
  points: 0,
  level: 'Bronze',
  coupons: [],
  totalSpent: 0,
  ordersCount: 0,
  nextReward: null
};

const loyaltyReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_POINTS':
      const newPoints = state.points + action.payload;
      const newLevel = getLevel(newPoints);
      const nextReward = getNextReward(newPoints, newLevel);
      
      return {
        ...state,
        points: newPoints,
        level: newLevel,
        nextReward
      };
    
    case 'ADD_PURCHASE':
      const { amount } = action.payload;
      const pointsEarned = Math.floor(amount * 0.1); // 10% points back
      const newTotalSpent = state.totalSpent + amount;
      const newOrdersCount = state.ordersCount + 1;
      
      // Check for milestone rewards
      const milestoneRewards = checkMilestoneRewards(newTotalSpent, newOrdersCount);
      
      return {
        ...state,
        totalSpent: newTotalSpent,
        ordersCount: newOrdersCount,
        points: state.points + pointsEarned,
        coupons: [...state.coupons, ...milestoneRewards],
        level: getLevel(state.points + pointsEarned),
        nextReward: getNextReward(state.points + pointsEarned, getLevel(state.points + pointsEarned))
      };
    
    case 'USE_COUPON':
      return {
        ...state,
        coupons: state.coupons.filter(coupon => coupon.id !== action.payload)
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
};

const getLevel = (points) => {
  if (points >= 1000) return 'Diamond';
  if (points >= 500) return 'Platinum';
  if (points >= 200) return 'Gold';
  if (points >= 50) return 'Silver';
  return 'Bronze';
};

const getNextReward = (points, level) => {
  const levels = {
    'Bronze': { next: 'Silver', pointsNeeded: 50 - points },
    'Silver': { next: 'Gold', pointsNeeded: 200 - points },
    'Gold': { next: 'Platinum', pointsNeeded: 500 - points },
    'Platinum': { next: 'Diamond', pointsNeeded: 1000 - points },
    'Diamond': { next: null, pointsNeeded: 0 }
  };
  
  return levels[level];
};

const checkMilestoneRewards = (totalSpent, ordersCount) => {
  const rewards = [];
  
  // Spending milestones
  if (totalSpent >= 100 && totalSpent < 200) {
    rewards.push({
      id: `spend-${Date.now()}`,
      code: 'WELCOME10',
      discount: 10,
      type: 'percentage',
      minSpend: 50,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      description: 'Welcome to Silver! 10% off your next order'
    });
  }
  
  if (totalSpent >= 500 && totalSpent < 600) {
    rewards.push({
      id: `spend-${Date.now()}`,
      code: 'GOLD20',
      discount: 20,
      type: 'percentage',
      minSpend: 100,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      description: 'Gold member reward! 20% off your next order'
    });
  }
  
  // Order count milestones
  if (ordersCount === 5) {
    rewards.push({
      id: `order-${Date.now()}`,
      code: 'LOYAL5',
      discount: 15,
      type: 'percentage',
      minSpend: 75,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
      description: '5th order milestone! 15% off your next order'
    });
  }
  
  if (ordersCount === 10) {
    rewards.push({
      id: `order-${Date.now()}`,
      code: 'LOYAL10',
      discount: 25,
      type: 'percentage',
      minSpend: 150,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      description: '10th order milestone! 25% off your next order'
    });
  }
  
  return rewards;
};

export const LoyaltyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(loyaltyReducer, initialState);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('loyaltyState');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach(key => {
        if (key === 'coupons') {
          // Recreate Date objects for coupons
          parsed[key] = parsed[key].map(coupon => ({
            ...coupon,
            expiresAt: new Date(coupon.expiresAt)
          }));
        }
      });
      // Reset to saved state
      dispatch({ type: 'RESET' });
      Object.entries(parsed).forEach(([key, value]) => {
        if (key === 'points') dispatch({ type: 'ADD_POINTS', payload: value });
        if (key === 'totalSpent') dispatch({ type: 'ADD_PURCHASE', payload: { amount: value } });
      });
    }
  }, []);
  
  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem('loyaltyState', JSON.stringify(state));
  }, [state]);
  
  const addPurchase = (amount) => {
    dispatch({ type: 'ADD_PURCHASE', payload: { amount } });
  };
  
  const useCoupon = (couponId) => {
    dispatch({ type: 'USE_COUPON', payload: couponId });
  };
  
  const getValidCoupons = () => {
    const now = new Date();
    return state.coupons.filter(coupon => coupon.expiresAt > now);
  };
  
  const calculateDiscount = (coupon, subtotal) => {
    if (subtotal < coupon.minSpend) return 0;
    
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.discount) / 100;
    }
    
    return Math.min(coupon.discount, subtotal);
  };
  
  const getLevelBenefits = (level) => {
    const benefits = {
      'Bronze': {
        pointsRate: 0.1,
        freeShipping: false,
        exclusiveAccess: false,
        prioritySupport: false
      },
      'Silver': {
        pointsRate: 0.15,
        freeShipping: false,
        exclusiveAccess: false,
        prioritySupport: false
      },
      'Gold': {
        pointsRate: 0.2,
        freeShipping: true,
        exclusiveAccess: false,
        prioritySupport: true
      },
      'Platinum': {
        pointsRate: 0.25,
        freeShipping: true,
        exclusiveAccess: true,
        prioritySupport: true
      },
      'Diamond': {
        pointsRate: 0.3,
        freeShipping: true,
        exclusiveAccess: true,
        prioritySupport: true
      }
    };
    
    return benefits[level] || benefits['Bronze'];
  };
  
  const value = {
    ...state,
    addPurchase,
    useCoupon,
    getValidCoupons,
    calculateDiscount,
    getLevelBenefits
  };
  
  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};
