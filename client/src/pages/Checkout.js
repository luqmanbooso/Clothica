import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  MapPinIcon, 
  CreditCardIcon, 
  TruckIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  // Sri Lanka specific data
  const sriLankaProvinces = [
    'Western Province',
    'Central Province', 
    'Southern Province',
    'Northern Province',
    'Eastern Province',
    'North Western Province',
    'North Central Province',
    'Uva Province',
    'Sabaragamuwa Province'
  ];

  const sriLankaCities = {
    'Western Province': ['Colombo', 'Gampaha', 'Kalutara', 'Dehiwala', 'Moratuwa', 'Sri Jayawardenepura Kotte'],
    'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya', 'Peradeniya', 'Gampola'],
    'Southern Province': ['Galle', 'Matara', 'Hambantota', 'Tangalle', 'Weligama'],
    'Northern Province': ['Jaffna', 'Vavuniya', 'Mullaitivu', 'Kilinochchi'],
    'Eastern Province': ['Batticaloa', 'Ampara', 'Trincomalee', 'Kalmunai'],
    'North Western Province': ['Kurunegala', 'Puttalam', 'Chilaw', 'Kuliyapitiya'],
    'North Central Province': ['Anuradhapura', 'Polonnaruwa', 'Medawachchiya'],
    'Uva Province': ['Badulla', 'Monaragala', 'Bandarawela', 'Haputale'],
    'Sabaragamuwa Province': ['Ratnapura', 'Kegalle', 'Embilipitiya', 'Avissawella']
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Sri Lanka',
    additionalInfo: ''
  });

  const [errors, setErrors] = useState({});
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);

  const shippingMethods = [
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
      id: 'same_day',
      name: 'Same Day Delivery (Colombo Only)',
      price: 2000,
      delivery: 'Same day (order before 2 PM)',
      icon: TruckIcon
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (!cart || cart.length === 0) {
      navigate('/cart');
      return;
    }

    // Pre-fill form with user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, cart, user, navigate]);

  // Update available cities when province changes
  useEffect(() => {
    if (formData.province) {
      setAvailableCities(sriLankaCities[formData.province] || []);
      // Reset city if it's not in the new province
      if (!sriLankaCities[formData.province]?.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    }
  }, [formData.province, formData.city]);

  const subtotal = getCartTotal() || 0;
  const shipping = shippingMethods.find(m => m.id === shippingMethod)?.price || 0;
  const finalShipping = subtotal >= 10000 ? 0 : shipping; // Free shipping over Rs. 10,000
  const total = subtotal + finalShipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+94|0)[1-9][0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Sri Lankan phone number (e.g., +94 11 234 5678 or 011 234 5678)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address (at least 10 characters)';
    }

    if (!formData.province) {
      newErrors.province = 'Please select a province';
    }

    if (!formData.city) {
      newErrors.city = 'Please select a city';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 5-digit postal code';
    }

    // Special validation for same day delivery
    if (shippingMethod === 'same_day' && formData.city !== 'Colombo') {
      newErrors.shipping = 'Same day delivery is only available for Colombo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors below before proceeding');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order object
      const orderData = {
        items: cart.map(item => ({
          productId: item._id || item.id,
          quantity: item.quantity || 1,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
          country: formData.country,
          additionalInfo: formData.additionalInfo
        },
        paymentMethod: paymentMethod === 'card' ? 'credit_card' : 'cash_on_delivery',
        shippingMethod: shippingMethod,
        subtotal: subtotal,
        shippingCost: finalShipping,
        total: total
      };

      // Create order via API
      const response = await axios.post('/api/orders', orderData);
      
      if (response.data.success) {
        const order = response.data.order;
        
        // Clear cart and show success
        clearCart();
        showSuccess('Order placed successfully! You will receive a confirmation email shortly.');
        
        // Navigate to order confirmation with order details
        navigate('/order-success', { 
          state: { 
            order,
            orderId: order._id,
            invoiceUrl: `/api/orders/${order._id}/invoice`
          } 
        });
      } else {
        showError(response.data.message || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      if (err.response?.data?.message) {
        showError(err.response.data.message);
      } else {
        showError('Failed to place order. Please check your connection and try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] ? (
      <p className="text-red-600 text-sm mt-1 flex items-center">
        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
        {errors[fieldName]}
      </p>
    ) : null;
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart to proceed with checkout</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#6C7A59] text-white px-6 py-3 rounded-lg hover:bg-[#5A6A4A] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-[#6C7A59] hover:text-[#5A6A4A] mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPinIcon className="h-6 w-6 text-[#6C7A59] mr-3" />
                Shipping Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {getFieldError('firstName')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {getFieldError('lastName')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {getFieldError('email')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+94 11 234 5678"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {getFieldError('phone')}
                    <p className="text-xs text-gray-500 mt-1">Format: +94 11 234 5678 or 011 234 5678</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address, apartment, suite, etc."
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('address')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors ${
                        errors.province ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Province</option>
                      {sriLankaProvinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {getFieldError('province')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!formData.province}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      } ${!formData.province ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select City</option>
                      {availableCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {getFieldError('city')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="10300"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {getFieldError('postalCode')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Delivery instructions, landmarks, or any other information that might help with delivery"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C7A59] focus:border-[#6C7A59] transition-colors"
                  />
                </div>
              </form>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TruckIcon className="h-6 w-6 text-[#6C7A59] mr-3" />
                Shipping Method
              </h2>

              {errors.shipping && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                    {errors.shipping}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {shippingMethods.map((method) => (
                  <label key={method.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#6C7A59] transition-colors">
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="h-4 w-4 text-[#6C7A59] focus:ring-[#6C7A59] border-gray-300"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.delivery}</p>
                          {method.id === 'same_day' && (
                            <p className="text-xs text-orange-600 font-medium">Available only for Colombo</p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {method.price === 0 ? 'Free' : `Rs. ${method.price.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CreditCardIcon className="h-6 w-6 text-[#6C7A59] mr-3" />
                Payment Method
              </h2>

              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#6C7A59] transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-[#6C7A59] focus:ring-[#6C7A59] border-gray-300"
                  />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Credit/Debit Card</p>
                    <p className="text-sm text-gray-500">Pay securely with your card</p>
                    <p className="text-xs text-blue-600">Visa, MasterCard, American Express accepted</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#6C7A59] transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-[#6C7A59] focus:ring-[#6C7A59] border-gray-300"
                  />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    <p className="text-xs text-green-600">Available for orders up to Rs. 25,000</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart && cart.length > 0 ? cart.map((item) => (
                  <div key={`${item._id || item.id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}`} className="flex items-center space-x-4">
                    <img
                      src={item.images?.[0] || item.image || '/placeholder-product.jpg'}
                      alt={item.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name || 'Product'}</h3>
                      <p className="text-sm text-gray-500">
                        {item.selectedColor || 'Default'} • {item.selectedSize || 'Default'} • Qty: {item.quantity || 1}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500">
                    No items in cart
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
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

                {finalShipping === 0 && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                    🎉 Free shipping applied (orders over Rs. 10,000)
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

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full mt-6 bg-[#6C7A59] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#5A6A4A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-4 flex items-center text-xs text-gray-500">
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Secure checkout powered by SSL encryption
              </div>

              {/* Additional Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Need help?</strong> Contact us at support@clothica.lk or call +94 11 234 5678
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 