import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(index, newQuantity);
  };

  const handleRemoveItem = (index) => {
    removeFromCart(index);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <FiShoppingBag className="mx-auto h-16 w-16 text-secondary-400" />
            <h2 className="mt-4 text-2xl font-display font-semibold text-secondary-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-secondary-600">
              Looks like you haven't added any items to your cart yet.
            </p>
          </div>
          <Link
            to="/shop"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Start Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            Shopping Cart
          </h1>
          <p className="mt-2 text-secondary-600">
            {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
              <div className="p-6 border-b border-secondary-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-900">
                    Cart Items
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-error-600 hover:text-error-700 font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-secondary-200">
                {cart.map((item, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-secondary-900 truncate">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-secondary-600 mt-1">
                              Brand: {item.product.brand}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-secondary-600">
                                Size: {item.size}
                              </span>
                              <span className="text-sm text-secondary-600">
                                Color: {item.color}
                              </span>
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right ml-4">
                            <p className="text-lg font-semibold text-secondary-900">
                              ${item.product.discountedPrice || item.product.price}
                            </p>
                            {item.product.discount > 0 && (
                              <p className="text-sm text-secondary-500 line-through">
                                ${item.product.price}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(index, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center text-secondary-600 hover:bg-secondary-50 transition-colors"
                            >
                              <FiMinus className="h-3 w-3" />
                            </button>
                            <span className="w-12 text-center text-secondary-900 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(index, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center text-secondary-600 hover:bg-secondary-50 transition-colors"
                            >
                              <FiPlus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-error-600 hover:text-error-700 transition-colors"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-secondary-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-secondary-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                {!isAuthenticated && (
                  <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                    <p className="text-sm text-accent-800">
                      Sign in to save your cart and get faster checkout
                    </p>
                    <Link
                      to="/login"
                      className="text-sm text-accent-600 hover:text-accent-700 font-medium"
                    >
                      Sign in
                    </Link>
                  </div>
                )}
                
                <Link
                  to="/checkout"
                  className="btn-primary w-full text-center"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  to="/shop"
                  className="btn-outline w-full text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 