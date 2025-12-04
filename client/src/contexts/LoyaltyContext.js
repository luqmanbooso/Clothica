import React, { createContext, useContext, useState } from 'react';

const LoyaltyContext = createContext();

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};

export const LoyaltyProvider = ({ children }) => {
  const [points] = useState(0);
  const [level] = useState('Bronze');
  const [loading] = useState(false);
  const [history] = useState([]);
  const [totalSpent] = useState(0);
  const [ordersCount] = useState(0);

  const levels = {
    Bronze: {
      benefits: [
        'Earn 1 point per Rs. 10 spent',
        'Access to basic coupons',
        'Standard customer support'
      ],
      next: 'Silver',
      pointsNeeded: 50
    },
    Silver: {
      benefits: [
        'Earn 1.2 points per Rs. 10 spent',
        'Access to premium coupons',
        'Priority support'
      ],
      next: 'Gold',
      pointsNeeded: 200
    },
    Gold: {
      benefits: [
        'Earn 1.5 points per Rs. 10 spent',
        'Exclusive coupons',
        'VIP support'
      ],
      next: 'Platinum',
      pointsNeeded: 500
    },
    Platinum: {
      benefits: [
        'Earn 2 points per Rs. 10 spent',
        'Free shipping',
        'Early access to sales'
      ],
      next: 'Diamond',
      pointsNeeded: 1000
    },
    Diamond: {
      benefits: [
        'Earn 3 points per Rs. 10 spent',
        'Personal account manager',
        'Exclusive product access'
      ],
      next: null,
      pointsNeeded: null
    }
  };

  const getLevelBenefits = (lvl) => levels[lvl] || levels['Bronze'];

  const nextReward = (() => {
    const current = getLevelBenefits(level);
    return current?.next
      ? { next: current.next, pointsNeeded: current.pointsNeeded ?? 0 }
      : { next: null, pointsNeeded: 0 };
  })();

  const value = {
    points,
    level,
    nextReward,
    totalSpent,
    ordersCount,
    loading,
    history,
    getLevelBenefits,
    refresh: () => {},
    spin: () => ({ success: false, message: 'Loyalty features are not enabled yet.' })
  };

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>;
};
