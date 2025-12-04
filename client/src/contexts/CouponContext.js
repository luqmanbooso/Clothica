import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';

const CouponContext = createContext();

export const useCoupons = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupons must be used within a CouponProvider');
  }
  return context;
};

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available coupons (not yet supported in Spring Boot backend)
  const fetchCoupons = async () => {
    setLoading(false);
    setCoupons([]);
  };

  // Validate coupon code
  const validateCoupon = async (code, subtotal) => {
    return { valid: false, message: 'Coupons are not supported with the current backend' };
  };

  // Apply coupon discount
  const calculateDiscount = (coupon, subtotal) => {
    if (!coupon || !coupon.valid) return 0;

    if (coupon.type === 'percentage') {
      return (subtotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      return Math.min(coupon.value, subtotal);
    }
    return 0;
  };

  // Get welcome coupon for new users
  const getWelcomeCoupon = () => {
    return {
      code: 'WELCOME20',
      name: 'Welcome to Clothica!',
      type: 'percentage',
      value: 20,
      description: '20% off your first order',
      valid: true,
      isWelcome: true
    };
  };

  // Get free shipping coupon
  const getFreeShippingCoupon = () => {
    return {
      code: 'FREESHIP100',
      name: 'Free Islandwide Delivery',
      type: 'fixed',
      value: 500, // Rs. 500 shipping cost
      description: 'Free shipping on orders above Rs. 10,000',
      valid: true,
      isShipping: true,
      minOrder: 10000
    };
  };

  // Get bonus points coupon
  const getBonusPointsCoupon = () => {
    return {
      code: 'BONUS500',
      name: 'Bonus Loyalty Points',
      type: 'points',
      value: 500,
      description: '500 bonus points on signup',
      valid: true,
      isPoints: true
    };
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const value = {
    coupons,
    loading,
    error,
    fetchCoupons,
    validateCoupon,
    calculateDiscount,
    getWelcomeCoupon,
    getFreeShippingCoupon,
    getBonusPointsCoupon
  };

  return (
    <CouponContext.Provider value={value}>
      {children}
    </CouponContext.Provider>
  );
};
