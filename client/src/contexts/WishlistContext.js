import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
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
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  // Load wishlist when authentication status changes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    
    if (isAuthenticated && user) {
      console.log('❤️ User authenticated, loading wishlist from backend for:', user.email);
      loadWishlist();
    } else {
      console.log('❤️ User not authenticated, clearing wishlist');
      setWishlist([]); // Clear wishlist when user logs out
      localStorage.removeItem('wishlist'); // Clear localStorage wishlist
    }
  }, [isAuthenticated, user, authLoading]);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await api.get('/api/users/wishlist');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Note: Toast will be handled by the component using this context
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load wishlist from server for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated, loadWishlist]);

  const addToWishlist = async (product) => {
    if (!isAuthenticated || !user) {
      console.log('🚫 User not authenticated, cannot add to wishlist');
      return { success: false, message: 'Please login to add items to wishlist' };
    }

    // Store current wishlist for rollback
    const currentWishlist = Array.isArray(wishlist) ? [...wishlist] : [];
    
    // Check if product is already in wishlist
    if (!isInWishlist(product._id)) {
      // Optimistic update - add to wishlist immediately
      const optimisticWishlist = [...currentWishlist, product];
      setWishlist(optimisticWishlist);
      console.log('🚀 Optimistic wishlist add applied');
    }

    try {
      console.log('❤️ Adding to wishlist for user:', user.email, 'Product:', product.name);
      await api.put(`/api/users/wishlist/${product._id}`);
      
      // Reload to get the latest server state
      await loadWishlist();
      console.log('✅ Item added to wishlist successfully');
      return { success: true, message: 'Item added to wishlist' };
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error);
      
      // Rollback optimistic update on error
      setWishlist(currentWishlist);
      console.log('↩️ Rolled back wishlist add');
      
      if (error.response?.status === 401) {
        return { success: false, message: 'Please login to add items to wishlist' };
      }
      return { success: false, message: 'Failed to add item to wishlist' };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated || !user) {
      console.log('🚫 User not authenticated, cannot remove from wishlist');
      return { success: false, message: 'Please login to manage wishlist' };
    }

    // Store current wishlist for rollback
    const currentWishlist = Array.isArray(wishlist) ? [...wishlist] : [];
    
    // Optimistic update - remove from wishlist immediately
    const optimisticWishlist = currentWishlist.filter(item => item._id !== productId);
    setWishlist(optimisticWishlist);
    console.log('🚀 Optimistic wishlist remove applied');

    try {
      console.log('❤️‍💔 Removing from wishlist for user:', user.email);
      await api.put(`/api/users/wishlist/${productId}`);
      
      // Reload to get the latest server state
      await loadWishlist();
      console.log('✅ Item removed from wishlist successfully');
      return { success: true, message: 'Item removed from wishlist' };
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      
      // Rollback optimistic update on error
      setWishlist(currentWishlist);
      console.log('↩️ Rolled back wishlist remove');
      
      return { success: false, message: 'Failed to remove item from wishlist' };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    if (!isAuthenticated) {
      localStorage.removeItem('wishlist');
    }
    // Note: Toast will be handled by the component using this context
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    loadWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 