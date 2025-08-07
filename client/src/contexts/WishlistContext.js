import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
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

  // Load wishlist from localStorage for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (error) {
          console.error('Error loading wishlist from localStorage:', error);
          localStorage.removeItem('wishlist');
        }
      }
    }
  }, [isAuthenticated]);

  // Save wishlist to localStorage for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await axios.get('/api/users/wishlist');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
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
    if (isAuthenticated) {
      try {
        await axios.put(`/api/users/wishlist/${product._id}`);
        await loadWishlist();
        toast.success(`${product.name} added to wishlist!`);
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        toast.error('Failed to add to wishlist');
      }
    } else {
      setWishlist(prev => {
        const exists = prev.find(item => item._id === product._id);
        if (!exists) {
          toast.success(`${product.name} added to wishlist!`);
          return [...prev, product];
        }
        return prev;
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated) {
      try {
        await axios.put(`/api/users/wishlist/${productId}`);
        await loadWishlist();
        toast.success('Removed from wishlist');
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        toast.error('Failed to remove from wishlist');
      }
    } else {
      setWishlist(prev => {
        const updated = prev.filter(item => item._id !== productId);
        toast.success('Removed from wishlist');
        return updated;
      });
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
    toast.success('Wishlist cleared');
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