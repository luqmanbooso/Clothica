import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  const [shippingMethods, setShippingMethods] = useState([]);

  useEffect(() => {
    loadShippingMethods();
  }, []);

  const loadShippingMethods = async () => {
    try {
      // In a real app, this would come from an API
      // For now, we'll use default methods but make them configurable
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
      // Fallback to basic methods
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
  
  // Calculate discount based on applied coupon
  const discount = appliedCoupon ? calculateDiscount(appliedCoupon, subtotal) : 0;
  
  // Check if free shipping applies (orders above Rs. 10,000)
  const finalShipping = subtotal >= 10000 ? 0 : shipping;
  const total = subtotal + finalShipping - discount;

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(index, newQuantity);
    }
  };

  const handleRemoveItem = (index) => {
    removeFromCart(index);
  };

  const handleAddToWishlist = (product) => {
    addToWishlist(product);
    success(`${product.name} added to wishlist!`);
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {cart?.length || 0} item{(cart?.length || 0) !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
              </div>
              
                <div className="divide-y divide-gray-200">
                  {cart?.map((item, index) => (
                    <div key={index} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.images?.[0] || item.image || '/placeholder-product.jpg'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {item.name}
                            </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Size: {item.selectedSize || 'One Size'}</span>
                                <span>Color: {item.selectedColor || 'Default'}</span>
                            </div>
                          </div>
                          
                          {/* Price */}
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-gray-900">
                                  Rs. {(item.price * item.quantity).toFixed(2)}
                                </span>
                                {item.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    Rs. {(item.originalPrice * item.quantity).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Rs. {item.price} each
                              </p>
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-3">
                            <button
                                onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MinusIcon className="h-4 w-4" />
                            </button>
                              
                              <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                              
                            <button
                                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                disabled={item.quantity >= 10}
                                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                              
                              <span className="text-sm text-gray-500">
                                Max 10
                              </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAddToWishlist(item)}
                              className={`p-2 rounded-lg transition-colors ${
                                isInWishlist(item._id) 
                                  ? 'bg-red-100 text-red-600' 
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                              }`}
                              title="Add to Wishlist"
                            >
                              <svg className="w-5 h-5" fill={isInWishlist(item._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-700 transition-colors"
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
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={clearCart}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Clear Cart
                    </button>
                    <Link
                      to="/shop"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-green-800">
                          {appliedCoupon.code} applied
                        </span>
                        <p className="text-xs text-green-600">
                          {appliedCoupon.type === 'percentage' 
                            ? `${appliedCoupon.value}% off` 
                            : `Rs. ${appliedCoupon.value} off`}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-green-600 hover:text-green-700 text-sm"
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59]"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="px-4 py-2 bg-[#6C7A59] text-white font-medium rounded-lg hover:bg-[#5A6A4A] transition-colors disabled:opacity-50"
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                      
                      {/* Welcome Coupon Suggestion */}
                      <div className="bg-[#6C7A59]/10 border border-[#6C7A59]/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <GiftIcon className="h-4 w-4 text-[#6C7A59]" />
                          <span className="text-sm font-medium text-[#6C7A59]">Try these coupons:</span>
                        </div>
                        <div className="space-y-1 text-xs text-[#6C7A59]">
                          <p><strong>WELCOME20</strong> - 20% off first order</p>
                          <p><strong>FREESHIP100</strong> - Free shipping above Rs. 10,000</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping Method */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Shipping Method</h3>
                  <div className="space-y-2">
                    {shippingMethods.map((method) => (
                      <label key={method.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="h-4 w-4 text-[#6C7A59] focus:ring-[#6C7A59] border-gray-300"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-900">
                          {method.name}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {method.price === 0 ? 'Free' : `Rs. ${method.price}`}
                        </span>
                </div>
                          <p className="text-xs text-gray-500">{method.delivery}</p>
                  </div>
                      </label>
                    ))}
                </div>
              </div>
              
                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {finalShipping === 0 ? 'Free' : `Rs. ${finalShipping.toLocaleString()}`}
                    </span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="font-medium text-green-600">-Rs. {discount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">Rs. {total.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Including tax</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  to="/checkout"
                  className="w-full flex items-center justify-center px-6 py-3 bg-[#6C7A59] text-white font-semibold rounded-lg hover:bg-[#5A6A4A] transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                
                {/* Trust Indicators */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Secure checkout
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Easy returns
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <TruckIcon className="h-4 w-4 mr-2" />
                    Free shipping on orders over Rs. 10,000
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 