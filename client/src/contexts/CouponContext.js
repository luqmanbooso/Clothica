import React, { createContext, useContext, useState, useCallback } from 'react';
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
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate coupon code against the backend
  const validateCoupon = useCallback(async (code, subtotal, cartItems = []) => {
    if (!code || !code.trim()) {
      return { valid: false, message: 'Please enter a coupon code' };
    }

    setLoading(true);
    setError(null);

    try {
      // Get user ID from local storage or default
      const userId = parseInt(localStorage.getItem('userId') || '1', 10);

      // Build cart items for validation
      const items = cartItems.map(item => ({
        productId: item.id || item._id || item.productId,
        quantity: item.quantity || 1,
        price: item.price || 0,
        categoryId: item.categoryId || item.category || null
      }));

      // Call the discount validation API
      const response = await api.post('/api/discounts/validate', {
        customerId: userId,
        couponCode: code.toUpperCase().trim(),
        items: items,
        subtotal: subtotal
      });

      if (response.data && response.data.valid) {
        const couponData = {
          code: code.toUpperCase().trim(),
          name: response.data.discountName || code,
          type: response.data.discountType || 'percentage',
          value: response.data.discountValue || 0,
          discountAmount: response.data.discountAmount || 0,
          message: response.data.message || 'Coupon applied successfully!',
          valid: true,
          discountId: response.data.discountId
        };

        setAppliedCoupon(couponData);
        return {
          valid: true,
          coupon: couponData,
          message: couponData.message
        };
      } else {
        const errorMsg = response.data?.message || 'Invalid coupon code';
        setError(errorMsg);
        return { valid: false, message: errorMsg };
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to validate coupon';
      setError(errorMsg);
      return { valid: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply coupon and get order summary
  const applyCoupon = useCallback(async (code, subtotal, cartItems = []) => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Please enter a coupon code' };
    }

    setLoading(true);
    setError(null);

    try {
      const userId = parseInt(localStorage.getItem('userId') || '1', 10);

      const items = cartItems.map(item => ({
        productId: item.id || item._id || item.productId,
        quantity: item.quantity || 1,
        price: item.price || 0,
        categoryId: item.categoryId || item.category || null
      }));

      const response = await api.post('/api/discounts/apply', {
        customerId: userId,
        couponCode: code.toUpperCase().trim(),
        items: items,
        subtotal: subtotal
      });

      if (response.data) {
        const orderSummary = response.data;
        const couponData = {
          code: code.toUpperCase().trim(),
          name: orderSummary.appliedCouponCode || code,
          type: orderSummary.discountType || 'percentage',
          value: orderSummary.discountValue || 0,
          discountAmount: orderSummary.totalDiscount || 0,
          valid: true
        };

        setAppliedCoupon(couponData);
        return {
          success: true,
          coupon: couponData,
          orderSummary: orderSummary,
          message: 'Coupon applied successfully!'
        };
      }
    } catch (err) {
      console.error('Coupon apply error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to apply coupon';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate discount amount
  const calculateDiscount = useCallback((coupon, subtotal) => {
    if (!coupon || !coupon.valid) return 0;

    // If we have a pre-calculated discount amount from the backend
    if (coupon.discountAmount) {
      return coupon.discountAmount;
    }

    // Fallback to client-side calculation
    if (coupon.type === 'percentage' || coupon.type === 'PERCENTAGE') {
      return Math.min((subtotal * coupon.value) / 100, subtotal);
    } else if (coupon.type === 'fixed' || coupon.type === 'FIXED_AMOUNT') {
      return Math.min(coupon.value, subtotal);
    }
    return 0;
  }, []);

  // Remove applied coupon
  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setError(null);
  }, []);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get welcome coupon for new users (static suggestion)
  const getWelcomeCoupon = useCallback(() => {
    return {
      code: 'SUMMER20',
      name: 'Summer Sale!',
      type: 'percentage',
      value: 20,
      description: '20% off your order',
      valid: false, // Not pre-validated
      isWelcome: true
    };
  }, []);

  // Get free shipping coupon suggestion
  const getFreeShippingCoupon = useCallback(() => {
    return {
      code: 'FREESHIP',
      name: 'Free Shipping',
      type: 'fixed',
      value: 500,
      description: 'Free shipping on orders above Rs. 10,000',
      valid: false,
      isShipping: true,
      minOrder: 10000
    };
  }, []);

  // Get bonus points coupon suggestion
  const getBonusPointsCoupon = useCallback(() => {
    return {
      code: 'SAVE10',
      name: 'Save Rs. 10',
      type: 'fixed',
      value: 10,
      description: 'Rs. 10 off your order',
      valid: false,
      isPoints: true
    };
  }, []);

  const value = {
    appliedCoupon,
    loading,
    error,
    validateCoupon,
    applyCoupon,
    calculateDiscount,
    removeCoupon,
    clearError,
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
