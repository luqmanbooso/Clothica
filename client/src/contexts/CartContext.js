import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const getUserId = (user) => {
  if (user?.id) return user.id;
  if (user?.userId) return user.userId;
  const stored = localStorage.getItem('userId');
  if (stored) return parseInt(stored, 10);
  if (process.env.REACT_APP_DEFAULT_USER_ID) {
    return parseInt(process.env.REACT_APP_DEFAULT_USER_ID, 10);
  }
  return null;
};

const normalizeCartItems = (cartDto) => {
  const items = cartDto?.items || [];
  return items.map((item) => ({
    _id: item.productId,
    id: item.productId,
    name: item.productName,
    price: item.productPrice || 0,
    quantity: item.quantity,
    images: [],
    image: null,
    itemTotal: item.itemTotal
  }));
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user) {
      loadCartFromBackend();
    } else {
      setCart([]);
      localStorage.removeItem('cart');
    }
  }, [authLoading, isAuthenticated, user]);

  const loadCartFromBackend = async () => {
    const userId = getUserId(user);
    if (!userId) {
      loadCartFromLocalStorage();
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/api/cart/user/${userId}`);
      const cartData = normalizeCartItems(response.data);
      setCart(cartData);
      localStorage.setItem('cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      loadCartFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) {
      setCart([]);
      return;
    }
    try {
      const parsed = JSON.parse(savedCart);
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error('Error parsing local cart:', error);
      localStorage.removeItem('cart');
      setCart([]);
    }
  };

  useEffect(() => {
    if (cart && Array.isArray(cart)) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated || !user) {
      return { success: false, message: 'Please login to add items to cart' };
    }
    const userId = getUserId(user);
    if (!userId) return { success: false, message: 'User id is missing' };

    try {
      setLoading(true);
      const response = await api.post(
        `/api/cart/user/${userId}/add/${product._id || product.id}?quantity=${quantity}`
      );
      const cartData = normalizeCartItems(response.data);
      setCart(cartData);
      localStorage.setItem('cart', JSON.stringify(cartData));
      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Failed to add item to cart' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated || !user) return;
    const userId = getUserId(user);
    if (!userId) return;

    const currentCart = Array.isArray(cart) ? [...cart] : [];
    setCart(currentCart.filter((item) => item._id !== productId));

    try {
      const response = await api.delete(`/api/cart/user/${userId}/remove/${productId}`);
      const cartData = normalizeCartItems(response.data);
      setCart(cartData);
      localStorage.setItem('cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCart(currentCart);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated || !user) return;
    const userId = getUserId(user);
    if (!userId) return;

    const currentCart = Array.isArray(cart) ? [...cart] : [];
    setCart(currentCart.map((item) => (item._id === productId ? { ...item, quantity } : item)));

    try {
      const response = await api.put(
        `/api/cart/user/${userId}/update/${productId}?quantity=${quantity}`
      );
      const cartData = normalizeCartItems(response.data);
      setCart(cartData);
      localStorage.setItem('cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error updating cart item:', error);
      setCart(currentCart);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !user) return;
    const userId = getUserId(user);
    if (!userId) return;

    const currentCart = Array.isArray(cart) ? [...cart] : [];
    setCart([]);
    localStorage.removeItem('cart');

    try {
      await api.delete(`/api/cart/user/${userId}/clear`);
    } catch (error) {
      console.error('Error clearing cart:', error);
      setCart(currentCart);
    }
  };

  const getCartTotal = () => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  };

  const getCartCount = () => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartItems = () => (Array.isArray(cart) ? cart : []);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    getCartCount,
    getCartItems,
    loading,
    setLoading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

