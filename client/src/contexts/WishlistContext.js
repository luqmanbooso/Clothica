import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setWishlist(Array.isArray(parsed) ? parsed : []);
        } catch {
          setWishlist([]);
        }
      }
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = async (product) => {
    setLoading(true);
    setWishlist((prev) => {
      const exists = prev.find((item) => (item._id || item.id) === (product._id || product.id));
      if (exists) return prev;
      return [...prev, { ...product, _id: product._id || product.id }];
    });
    setLoading(false);
    return { success: true, message: 'Added to wishlist' };
  };

  const removeFromWishlist = async (productId) => {
    setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== productId));
    return { success: true, message: 'Removed from wishlist' };
  };

  const isInWishlist = (productId) => wishlist.some((item) => (item._id || item.id) === productId);

  const clearWishlist = () => {
    setWishlist([]);
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    loadWishlist: () => {}
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

