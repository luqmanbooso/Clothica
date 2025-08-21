import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrashIcon, MinusIcon, PlusIcon, ArrowRightIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, GiftIcon } from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCoupons } from '../contexts/CouponContext';
import { useToast } from '../contexts/ToastContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { validateCoupon, calculateDiscount, getWelcomeCoupon, getFreeShippingCoupon } = useCoupons();
  const { success, error, warning, info } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [couponLoading, setCouponLoading] = useState(false);
  const [isRemovingItem, setIsRemovingItem] = useState(null);
  const [showSaveForLater, setShowSaveForLater] = useState(false);
  const [savedItems, setSavedItems] = useState([]);

  const [shippingMethods, setShippingMethods] = useState([]);

  useEffect(() => {
    loadShippingMethods();
  }, []);

  const loadShippingMethods = async () => {
    try {
      const defaultMethods = [
        {
          id: 'standard',
          name: 'Standard Islandwide Delivery',
          price: 500,
          delivery: '3-5 business days',
          icon: TruckIcon
        },
        {
          id: 'express',
          name: 'Express Delivery',
          price: 1200,
          delivery: '1-2 business days',
          icon: TruckIcon
        },
        {
          id: 'free',
          name: 'Free Shipping',
          price: 0,
          delivery: '5-7 business days',
          icon: TruckIcon,
          minOrder: 10000
        }
      ];
      setShippingMethods(defaultMethods);
    } catch (error) {
      console.error('Error loading shipping methods:', error);
      setShippingMethods([
        {
          id: 'standard',
          name: 'Standard Delivery',
          price: 500,
          delivery: '3-5 business days',
          icon: TruckIcon
        }
      ]);
    }
  };

  const subtotal = getCartTotal();
  const shipping = shippingMethods.find(m => m.id === shippingMethod)?.price || 0;
  const discount = appliedCoupon ? calculateDiscount(appliedCoupon, subtotal) : 0;
  const finalShipping = subtotal >= 10000 ? 0 : shipping;
  const total = subtotal + finalShipping - discount;

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(index, newQuantity);
    }
  };

  const handleRemoveItem = (index) => {
    setIsRemovingItem(index);
    setTimeout(() => {
      removeFromCart(index);
      setIsRemovingItem(null);
      success('Item removed from cart');
    }, 300);
  };

  const handleAddToWishlist = (product) => {
    addToWishlist(product);
    success(`${product.name} added to wishlist!`);
  };

  const handleSaveForLater = (item, index) => {
    setSavedItems(prev => [...prev, { ...item, originalIndex: index }]);
    removeFromCart(index);
    success(`${item.name} saved for later`);
  };

  const handleMoveToCart = (savedItem) => {
    setSavedItems(prev => prev.filter(item => item.originalIndex !== savedItem.originalIndex));
    success(`${savedItem.name} moved back to cart`);
  };

  const handleRemoveSaved = (savedItem) => {
    setSavedItems(prev => prev.filter(item => item.originalIndex !== savedItem.originalIndex));
    success(`${savedItem.name} removed from saved items`);
  };

  const cartProgress = Math.min((subtotal / 10000) * 100, 100);
  const isFreeShippingEligible = subtotal >= 10000;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode, subtotal);
      
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setCouponCode('');
        success(result.message);
      } else {
        error(result.message);
      }
    } catch (err) {
      error('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    success('Coupon removed');
  };

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-[#6C7A59] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-soft">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Your cart is empty</h2>
          <p className="text-[#6C7A59] mb-8">
            Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center px-6 py-3 bg-[#6C7A59] text-white font-semibold rounded-lg hover:bg-[#5A6A4A] transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Shopping
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] to-[#E6E6FA]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header with Progress */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-display font-bold text-[#1E1E1E] mb-3">Shopping Cart</h1>
            <p className="text-[#6C7A59] text-lg font-medium mb-6">
              {cart?.length || 0} item{(cart?.length || 0) !== 1 ? 's' : ''} in your cart
            </p>
            
            {/* Free Shipping Progress Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#6C7A59]/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#1E1E1E] font-semibold">Free Shipping Progress</span>
                  <span className={`text-sm font-bold ${
                    isFreeShippingEligible ? 'text-[#059669]' : 'text-[#6C7A59]'
                  }`}>
                    {isFreeShippingEligible ? '🎉 Eligible!' : `Rs. ${(10000 - subtotal).toLocaleString()} more needed`}
                  </span>
                </div>
                
                <div className="w-full bg-[#6C7A59]/20 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      isFreeShippingEligible 
                        ? 'bg-gradient-to-r from-[#059669] to-[#9CAF88]' 
                        : 'bg-gradient-to-r from-[#6C7A59] to-[#9CAF88]'
                    }`}
                    style={{ width: `${cartProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-[#6C7A59]">
                  <span>Rs. 0</span>
                  <span>Rs. 10,000</span>
                </div>
              </div>
            </div>
            
            {/* Cart Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#6C7A59]/20">
                <div className="text-2xl font-bold text-[#6C7A59]">{cart?.length || 0}</div>
                <div className="text-sm text-[#6C7A59]">Items</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#6C7A59]/20">
                <div className="text-2xl font-bold text-[#6C7A59]">Rs. {subtotal.toLocaleString()}</div>
                <div className="text-sm text-[#6C7A59]">Subtotal</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#6C7A59]/20">
                <div className={`text-2xl font-bold ${
                  finalShipping === 0 ? 'text-[#059669]' : 'text-[#6C7A59]'
                }`}>
                  {finalShipping === 0 ? 'FREE' : `Rs. ${finalShipping.toLocaleString()}`}
                </div>
                <div className="text-sm text-[#6C7A59]">Shipping</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#6C7A59]/20">
                <div className="p-6 border-b border-[#6C7A59]/20">
                  <h2 className="text-xl font-display font-semibold text-[#1E1E1E] flex items-center">
                    <div className="w-8 h-8 bg-[#6C7A59] rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    Cart Items
                  </h2>
                </div>
                
                <div className="divide-y divide-[#6C7A59]/20">
                  {cart?.map((item, index) => (
                    <div 
                      key={index} 
                      className={`p-6 hover:bg-[#F5F1E8]/50 transition-all duration-500 transform hover:scale-[1.02] ${
                        isRemovingItem === index ? 'opacity-50 scale-95' : ''
                      }`}
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 relative group">
                          <img
                            src={item.images?.[0] || item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.jpg';
                            }}
                          />
                          {/* Quick View Overlay */}
                          <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button className="bg-white text-[#1E1E1E] px-3 py-1 rounded-lg text-sm font-medium hover:bg-[#F5F1E8] transition-colors">
                              Quick View
                            </button>
                          </div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2 hover:text-[#6C7A59] transition-colors cursor-pointer">
                                {item.name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-[#6C7A59] mb-3">
                                <span className="bg-[#F5F1E8] px-3 py-1 rounded-full font-medium">Size: {item.selectedSize || 'One Size'}</span>
                                <span className="bg-[#E6E6FA] px-3 py-1 rounded-full font-medium">Color: {item.selectedColor || 'Default'}</span>
                              </div>
                              
                              {/* Stock Status */}
                              <div className="flex items-center space-x-2 text-xs">
                                <div className={`w-2 h-2 rounded-full ${
                                  item.stock > 10 ? 'bg-[#059669]' : item.stock > 0 ? 'bg-[#D4AF37]' : 'bg-[#B35D5D]'
                                }`}></div>
                                <span className={`${
                                  item.stock > 10 ? 'text-[#059669]' : item.stock > 0 ? 'text-[#D4AF37]' : 'text-[#B35D5D]'
                                } font-medium`}>
                                  {item.stock > 10 ? 'In Stock' : item.stock > 0 ? `Only ${item.stock} left` : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-[#1E1E1E]">
                                  Rs. {(item.price * item.quantity).toFixed(2)}
                                </span>
                                {item.originalPrice && (
                                  <span className="text-sm text-[#9CAF88] line-through">
                                    Rs. {(item.originalPrice * item.quantity).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#6C7A59] mt-1">
                                Rs. {item.price} each
                              </p>
                              
                              {/* Savings Badge */}
                              {item.originalPrice && (
                                <div className="mt-2 inline-block bg-[#059669]/20 text-[#059669] text-xs px-2 py-1 rounded-full font-medium">
                                  Save Rs. {((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-10 h-10 border-2 border-[#6C7A59] rounded-xl flex items-center justify-center hover:bg-[#6C7A59] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#6C7A59]"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              
                              <span className="w-16 text-center font-bold text-lg text-[#1E1E1E] bg-[#F5F1E8] px-4 py-2 rounded-xl">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                disabled={item.quantity >= 10}
                                className="w-10 h-10 border-2 border-[#6C7A59] rounded-xl flex items-center justify-center hover:bg-[#6C7A59] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#6C7A59]"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                              
                              <span className="text-sm text-[#6C7A59] font-medium">
                                Max 10
                              </span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleAddToWishlist(item)}
                                className={`p-3 rounded-xl transition-all duration-300 ${
                                  isInWishlist(item._id) 
                                    ? 'bg-[#D4AF37] text-white shadow-lg' 
                                    : 'text-[#6C7A59] hover:text-[#D4AF37] hover:bg-[#F5F1E8]'
                                }`}
                                title="Add to Wishlist"
                              >
                                <svg className="w-5 h-5" fill={isInWishlist(item._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleSaveForLater(item, index)}
                                className="p-3 text-[#6C7A59] hover:text-[#5A6A4A] hover:bg-[#F5F1E8] rounded-xl transition-all duration-300"
                                title="Save for Later"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleRemoveItem(index)}
                                className="p-3 text-[#B35D5D] hover:text-[#A04D4D] hover:bg-[#F5F1E8] rounded-xl transition-all duration-300"
                                title="Remove Item"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Actions */}
                <div className="p-6 border-t border-[#6C7A59]/20 bg-[#F5F1E8]/30">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={clearCart}
                      className="text-[#6C7A59] hover:text-[#5A6A4A] font-medium transition-all duration-300 hover:scale-105 transform"
                    >
                      Clear Cart
                    </button>
                    <Link
                      to="/shop"
                      className="text-[#6C7A59] hover:text-[#5A6A4A] font-medium transition-all duration-300 hover:scale-105 transform flex items-center"
                    >
                      Continue Shopping
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sticky top-8 border border-[#6C7A59]/20">
                <h2 className="text-xl font-display font-semibold text-[#1E1E1E] mb-6 flex items-center">
                  <div className="w-8 h-8 bg-[#6C7A59] rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Order Summary
                </h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#1E1E1E] mb-3">
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-4 bg-[#059669]/20 border border-[#059669]/30 rounded-2xl">
                      <div>
                        <span className="text-sm font-medium text-[#059669]">
                          {appliedCoupon.code} applied
                        </span>
                        <p className="text-xs text-[#059669]">
                          {appliedCoupon.type === 'percentage' 
                            ? `${appliedCoupon.value}% off` 
                            : `Rs. ${appliedCoupon.value} off`}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[#059669] hover:text-[#047857] text-sm font-medium hover:scale-105 transform transition-all duration-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-3 border-2 border-[#6C7A59]/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6C7A59]/20 focus:border-[#6C7A59] transition-all duration-300"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="px-6 py-3 bg-[#6C7A59] text-white font-medium rounded-2xl hover:bg-[#5A6A4A] transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                      
                      {/* Welcome Coupon Suggestion */}
                      <div className="bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] border border-[#D4AF37]/30 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center">
                            <GiftIcon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-[#1E1E1E]">Try these coupons:</span>
                        </div>
                        <div className="space-y-2 text-xs text-[#6C7A59]">
                          <p><strong className="text-[#D4AF37]">WELCOME20</strong> - 20% off first order</p>
                          <p><strong className="text-[#D4AF37]">FREESHIP100</strong> - Free shipping above Rs. 10,000</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping Method */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#1E1E1E] mb-3">Shipping Method</h3>
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label key={method.id} className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                        shippingMethod === method.id 
                          ? 'border-[#6C7A59] bg-[#F5F1E8] shadow-lg' 
                          : 'border-[#6C7A59]/30 hover:border-[#6C7A59]/50 hover:bg-[#F5F1E8]/50'
                      }`}>
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="h-5 w-5 text-[#6C7A59] focus:ring-[#6C7A59] border-[#6C7A59]/30"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#1E1E1E]">
                              {method.name}
                            </span>
                            <span className={`text-sm font-bold ${
                              method.price === 0 ? 'text-[#059669]' : 'text-[#1E1E1E]'
                            }`}>
                              {method.price === 0 ? 'Free' : `Rs. ${method.price}`}
                            </span>
                          </div>
                          <p className="text-xs text-[#6C7A59] mt-1">{method.delivery}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              
                {/* Enhanced Price Breakdown */}
                <div className="space-y-4 mb-6 p-6 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl border border-[#6C7A59]/20">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-[#6C7A59] font-medium">Subtotal</span>
                    <span className="font-semibold text-[#1E1E1E]">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-[#6C7A59] font-medium">Shipping</span>
                    <div className="flex items-center space-x-2">
                      {finalShipping === 0 && (
                        <div className="w-4 h-4 bg-[#059669] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <span className={`font-semibold ${
                        finalShipping === 0 ? 'text-[#059669]' : 'text-[#1E1E1E]'
                      }`}>
                        {finalShipping === 0 ? 'Free' : `Rs. ${finalShipping.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-[#059669] font-medium">Discount</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-[#059669] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="font-semibold text-[#059669]">-Rs. {discount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Estimated Tax */}
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-[#6C7A59] font-medium">Estimated Tax</span>
                    <span className="font-semibold text-[#1E1E1E]">Rs. {(total * 0.15).toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-[#6C7A59]/30 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#1E1E1E]">Total</span>
                      <span className="text-xl font-bold text-[#6C7A59]">Rs. {total.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-[#6C7A59] mt-2 text-center">Including estimated tax</p>
                  </div>
                  
                  {/* Savings Summary */}
                  {appliedCoupon && (
                    <div className="mt-4 p-3 bg-[#059669]/10 rounded-xl border border-[#059669]/20">
                      <div className="text-center">
                        <p className="text-sm text-[#059669] font-medium">You're saving</p>
                        <p className="text-lg font-bold text-[#059669]">Rs. {discount.toLocaleString()}</p>
                        <p className="text-xs text-[#059669]">with {appliedCoupon.code}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Checkout Section */}
                <div className="space-y-4">
                  {/* Checkout Button */}
                  <Link
                    to="/checkout"
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-[#6C7A59] to-[#5A6A4A] text-white font-bold rounded-2xl hover:from-[#5A6A4A] hover:to-[#4A5A3A] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span>Proceed to Checkout</span>
                      <ArrowRightIcon className="ml-2 h-6 w-6" />
                    </div>
                  </Link>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="px-4 py-3 bg-[#F5F1E8] text-[#6C7A59] rounded-xl hover:bg-[#E6E6FA] transition-all duration-300 font-medium border border-[#6C7A59]/20">
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Save Cart</span>
                      </div>
                    </button>
                    
                    <button className="px-4 py-3 bg-[#F5F1E8] text-[#6C7A59] rounded-xl hover:bg-[#E6E6FA] transition-all duration-300 font-medium border border-[#6C7A59]/20">
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Need Help?</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-6 space-y-4 p-4 bg-white/50 rounded-2xl border border-[#6C7A59]/20">
                  <div className="flex items-center text-sm text-[#6C7A59]">
                    <div className="w-6 h-6 bg-[#6C7A59] rounded-full flex items-center justify-center mr-3">
                      <ShieldCheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">Secure checkout</span>
                  </div>
                  <div className="flex items-center text-sm text-[#6C7A59]">
                    <div className="w-6 h-6 bg-[#6C7A59] rounded-full flex items-center justify-center mr-3">
                      <ArrowPathIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">Easy returns</span>
                  </div>
                  <div className="flex items-center text-sm text-[#6C7A59]">
                    <div className="w-6 h-6 bg-[#6C7A59] rounded-full flex items-center justify-center mr-3">
                      <TruckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">Free shipping on orders over Rs. 10,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <div className="mt-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#D4AF37]/20">
                <div className="p-6 border-b border-[#D4AF37]/20">
                  <h2 className="text-xl font-display font-semibold text-[#1E1E1E] flex items-center">
                    <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                    Saved for Later ({savedItems.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-[#D4AF37]/20">
                  {savedItems.map((savedItem, index) => (
                    <div key={savedItem.originalIndex} className="p-6 hover:bg-[#F5F1E8]/30 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <img
                          src={savedItem.images?.[0] || savedItem.image || '/placeholder-product.jpg'}
                          alt={savedItem.name}
                          className="w-20 h-20 object-cover rounded-2xl shadow-md"
                        />
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">{savedItem.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-[#6C7A59] mb-3">
                            <span className="bg-[#F5F1E8] px-3 py-1 rounded-full font-medium">Size: {savedItem.selectedSize || 'One Size'}</span>
                            <span className="bg-[#E6E6FA] px-3 py-1 rounded-full font-medium">Color: {savedItem.selectedColor || 'Default'}</span>
                          </div>
                          <p className="text-lg font-bold text-[#6C7A59]">Rs. {savedItem.price}</p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleMoveToCart(savedItem)}
                            className="px-4 py-2 bg-[#6C7A59] text-white rounded-xl hover:bg-[#5A6A4A] transition-all duration-300 font-medium"
                          >
                            Move to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveSaved(savedItem)}
                            className="p-2 text-[#B35D5D] hover:bg-[#F5F1E8] rounded-xl transition-all duration-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
