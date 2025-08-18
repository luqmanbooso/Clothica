import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  // Load cart when authentication status changes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    
    if (isAuthenticated && user) {
      console.log('🛒 User authenticated, loading cart from backend for:', user.email);
      loadCartFromBackend();
    } else {
      console.log('🛒 User not authenticated, clearing cart');
      setCart([]); // Clear cart when user logs out
      localStorage.removeItem('cart'); // Clear localStorage cart
    }
  }, [isAuthenticated, user, authLoading]);

  // Load cart from backend (requires authentication)
  const loadCartFromBackend = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cart');
      const cartData = Array.isArray(response.data) ? response.data : [];
      setCart(cartData);
      // Also save to localStorage as backup
      localStorage.setItem('cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      // If it's a 401 error, user is not authenticated, fallback to localStorage
      if (error.response?.status === 401) {
        console.log('User not authenticated, loading cart from localStorage');
        loadCartFromLocalStorage();
      } else {
        // For other errors, still try localStorage
        loadCartFromLocalStorage();
      }
    } finally {
      setLoading(false);
    }
  };

  // Load cart from localStorage
  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const cartData = Array.isArray(parsedCart) ? parsedCart : [];
        setCart(cartData);
      } catch (parseError) {
        console.error('Error parsing localStorage cart:', parseError);
        localStorage.removeItem('cart');
        setCart([]); // Ensure cart is always an array
      }
    } else {
      setCart([]); // Initialize empty cart if no localStorage data
    }
  };

  // Save cart to localStorage whenever it changes (as backup)
  useEffect(() => {
    if (cart && Array.isArray(cart) && cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = async (product, quantity = 1, size, color) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('🚫 User not authenticated, cannot add to cart');
      return { success: false, message: 'Please login to add items to cart' };
    }

    // Optimistic update - update UI immediately for better UX
    const optimisticItem = {
      _id: product._id || product.id,
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      images: product.images || [],
      image: product.image || (product.images && product.images[0]),
      quantity,
      selectedSize: size,
      selectedColor: color,
      addedAt: new Date()
    };

    // Check if item already exists in cart
    const currentCart = Array.isArray(cart) ? cart : [];
    const existingItemIndex = currentCart.findIndex(
      item => 
        item._id === optimisticItem._id && 
        item.selectedSize === size && 
        item.selectedColor === color
    );

    let optimisticCart;
    if (existingItemIndex > -1) {
      // Update existing item quantity
      optimisticCart = [...currentCart];
      optimisticCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      optimisticCart = [...currentCart, optimisticItem];
    }

    // Update cart immediately for instant UI feedback
    setCart(optimisticCart);
    console.log('🚀 Optimistic update applied, syncing with server...');

    try {
      const response = await api.post('/api/cart/add', {
        productId: product._id || product.id,
        quantity,
        selectedSize: size,
        selectedColor: color
      });

      // Update with real server response
      const cartData = Array.isArray(response.data) ? response.data : [];
      setCart(cartData);
      console.log('✅ Cart synced with server successfully');
      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      console.error('❌ Error syncing cart with server:', error);
      
      // Rollback optimistic update on error
      setCart(currentCart);
      console.log('↩️ Rolled back optimistic update');
      
      if (error.response?.status === 401) {
        return { success: false, message: 'Please login to add items to cart' };
      }
      return { success: false, message: 'Failed to add item to cart' };
    }
  };

    const removeFromCart = async (itemId) => {
    if (!isAuthenticated || !user) {
      console.log('🚫 User not authenticated, cannot remove from cart');
      return;
    }

    // Store current cart for rollback
    const currentCart = Array.isArray(cart) ? [...cart] : [];
    
    // Optimistic update - remove item immediately
    const optimisticCart = currentCart.filter(item => item._id !== itemId);
    setCart(optimisticCart);
    console.log('🚀 Optimistic cart removal applied');

    try {
      const response = await api.delete(`/api/cart/remove/${itemId}`);
      const cartData = Array.isArray(response.data) ? response.data : [];
      setCart(cartData);
      console.log('✅ Item removed from cart successfully');
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      
      // Rollback on error
      setCart(currentCart);
      console.log('↩️ Rolled back cart removal');
    }
  };

    const updateCartItem = async (itemId, quantity) => {
    if (!isAuthenticated || !user) {
      console.log('🚫 User not authenticated, cannot update cart');
      return;
    }

    // Store current cart for rollback
    const currentCart = Array.isArray(cart) ? [...cart] : [];
    
    // Optimistic update
    const optimisticCart = currentCart.map(item => 
      item._id === itemId ? { ...item, quantity } : item
    );
    setCart(optimisticCart);
    console.log('� Optimistic cart update applied');

    try {
      const response = await api.put('/api/cart/update', {
        itemId,
        quantity
      });

      const cartData = Array.isArray(response.data) ? response.data : [];
      setCart(cartData);
      console.log('✅ Cart quantity updated successfully');
    } catch (error) {
      console.error('❌ Error updating cart item:', error);
      
      // Rollback on error
      setCart(currentCart);
      console.log('↩️ Rolled back cart update');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !user) {
      console.log('🚫 User not authenticated, cannot clear cart');
      return;
    }

    // Store current cart for rollback
    const currentCart = Array.isArray(cart) ? [...cart] : [];
    
    // Optimistic update - clear cart immediately
    setCart([]);
    localStorage.removeItem('cart');
    console.log('🚀 Optimistic cart clear applied');

    try {
      await api.delete('/api/cart/clear');
      console.log('✅ Cart cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      
      // Rollback on error
      setCart(currentCart);
      console.log('↩️ Rolled back cart clear');
    }
  };

  const getCartTotal = () => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartItems = () => {
    return Array.isArray(cart) ? cart : [];
  };

  // Debug: Log cart changes for real-time monitoring
  useEffect(() => {
    console.log('🔄 Cart state updated:', {
      itemCount: getCartCount(),
      totalValue: getCartTotal(),
      items: cart?.map(item => ({ name: item.name, qty: item.quantity })) || []
    });
  }, [cart]);

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

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 