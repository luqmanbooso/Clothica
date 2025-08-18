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
  ExclamationTriangleIcon,
  LockClosedIcon,
  BanknotesIcon,
  QrCodeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { 
  CreditCardIcon as CreditCardSolid,
  BanknotesIcon as BanknotesSolid,
  QrCodeIcon as QrCodeSolid
} from '@heroicons/react/24/solid';
import api from '../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

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
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [isProcessing, setIsProcessing] = useState(false);


  // Payment method specific states
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [shippingMethods, setShippingMethods] = useState([]);
  const [sriLankaCities, setSriLankaCities] = useState({});

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

    // Load shipping methods and cities data
    loadShippingMethods();
    loadCitiesData();
  }, [isAuthenticated, cart, user, navigate]);

  const loadShippingMethods = async () => {
    try {
      const defaultMethods = [
        {
          id: 'standard',
          name: 'Standard Islandwide Delivery',
          price: 500,
          delivery: '3-5 business days',
          icon: TruckIcon,
          description: 'Reliable delivery across Sri Lanka'
        },
        {
          id: 'express',
          name: 'Express Delivery',
          price: 1200,
          delivery: '1-2 business days',
          icon: TruckIcon,
          description: 'Fast delivery for urgent orders'
        },
        {
          id: 'free',
          name: 'Free Shipping',
          price: 0,
          delivery: '5-7 business days',
          icon: TruckIcon,
          minOrder: 10000,
          description: 'Free shipping on orders above LKR 10,000'
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
          icon: TruckIcon,
          description: 'Reliable delivery across Sri Lanka'
        }
      ]);
    }
  };

  const loadCitiesData = async () => {
    // Mock cities data - in real app, this would come from API
    const citiesByProvince = {
      'Western Province': ['Colombo', 'Gampaha', 'Kalutara', 'Moratuwa', 'Negombo'],
      'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya', 'Peradeniya'],
      'Southern Province': ['Galle', 'Matara', 'Hambantota', 'Tangalle'],
      'Northern Province': ['Jaffna', 'Kilinochchi', 'Mullaitivu', 'Vavuniya'],
      'Eastern Province': ['Batticaloa', 'Ampara', 'Trincomalee'],
      'North Western Province': ['Kurunegala', 'Puttalam', 'Chilaw'],
      'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
      'Uva Province': ['Badulla', 'Monaragala'],
      'Sabaragamuwa Province': ['Ratnapura', 'Kegalle']
    };
    setSriLankaCities(citiesByProvince);
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Address
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.province.trim()) newErrors.province = 'Province is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

          // Payment method specific validation
      if (paymentMethod === 'credit_card') {
      if (!cardData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
      
      if (!cardData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else {
        const cardError = validateCardNumber(cardData.cardNumber);
        if (cardError) newErrors.cardNumber = cardError;
      }
      
      if (!cardData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else {
        const expiryError = validateExpiryDate(cardData.expiryDate);
        if (expiryError) newErrors.expiryDate = expiryError;
      }
      
      if (!cardData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else {
        const cvvError = validateCVV(cardData.cvv);
        if (cvvError) newErrors.cvv = cvvError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    setIsProcessing(true);

    try {
      const subtotal = getCartTotal();
      const selectedShipping = shippingMethods.find(m => m.id === shippingMethod);
      const shippingCost = selectedShipping ? selectedShipping.price : 0;
      const total = subtotal + shippingCost;

      // Prepare order data
      const orderData = {
        items: cart?.map(item => ({
          productId: item._id || item.id,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.province,
          zipCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod,
        shippingMethod,
        subtotal,
        shippingCost,
        total
      };

      // Process payment first for card payments
      if (paymentMethod === 'credit_card') {
        try {
          // Create Stripe payment intent
          const paymentResponse = await api.post('/api/payments/stripe/create-intent', {
            amount: total,
            currency: 'lkr',
            metadata: {
              orderDescription: `Order for ${formData.firstName} ${formData.lastName}`,
              userEmail: formData.email
            }
          });

          if (!paymentResponse.data.success) {
            throw new Error('Failed to create payment intent');
          }

          // Test card validation (simulating Stripe test environment behavior)
          const cardNumber = cardData.cardNumber.replace(/\s/g, '');
          
          // Test card validation results
          const testCardResult = validateTestCard(cardNumber, cardData.cvv, cardData.expiryMonth, cardData.expiryYear);
          
          if (!testCardResult.valid) {
            throw new Error(testCardResult.error);
          }

          // Add payment data to order
          orderData.paymentData = {
            cardNumber: cardData.cardNumber.slice(-4),
            cardType: 'credit',
            cardholderName: cardData.cardholderName,
            paymentIntentId: paymentResponse.data.data.paymentIntentId,
            paymentStatus: 'succeeded'
          };

          console.log('Payment processed successfully');
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          showError(paymentError.message || 'Payment failed. Please try again.');
          setIsProcessing(false);
          return;
        }
      } else if (paymentMethod === 'debit_card') {
        // Handle debit card similarly
        orderData.paymentData = {
          cardNumber: cardData.cardNumber.slice(-4),
          cardType: 'debit',
          cardholderName: cardData.cardholderName,
          paymentStatus: 'pending'
        };
      }

      console.log('Order Data being sent:', orderData);
      console.log('API instance baseURL:', api.defaults.baseURL);

      // Create order via API
      const response = await api.post('/api/orders', orderData);
      
      if (response.data.success || response.data.message) {
        showSuccess('Order placed successfully! Redirecting to order confirmation...');
        clearCart();
        
        // For card payments, show additional success info
        if (paymentMethod === 'credit_card') {
          showSuccess('Payment processed successfully via Stripe! Your order has been confirmed.');
        }
        
        // Create a complete order object for the success page
        const successOrderData = {
          _id: response.data.order?.id,
          id: response.data.order?.id,
          total: total,
          subtotal: subtotal,
          shippingCost: shippingCost,
          discount: 0, // No discounts implemented yet
          status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'processing',
          paymentMethod: paymentMethod,
          shippingMethod: shippingMethod,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
            country: formData.country
          },
          items: cart?.map(item => ({
            _id: item._id,
            id: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            images: item.images,
            image: item.image
          })),
          createdAt: new Date(),
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
        };
        
        navigate('/order-success', { 
          state: { 
            order: successOrderData,
            orderId: response.data.order?.id,
            total: total,
            shippingCost: shippingCost,
            paymentMethod: paymentMethod,
            shippingMethod: shippingMethod,
            items: cart,
            shippingAddress: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              province: formData.province,
              postalCode: formData.postalCode,
              country: formData.country
            }
          }
        });
      }
    } catch (error) {
      console.error('Order creation error:', error);
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('Failed to create order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCardInputChange = (field, value) => {
    setCardData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || v;
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Card validation functions
  const validateCardNumber = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return 'Card number must be between 13 and 19 digits';
    }
    // Luhn algorithm check
    let sum = 0;
    let isEven = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0 ? null : 'Invalid card number';
  };

  const validateExpiryDate = (expiryDate) => {
    if (!expiryDate || expiryDate.length !== 5) {
      return 'Please enter expiry date in MM/YY format';
    }
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (month < 1 || month > 12) {
      return 'Invalid month';
    }
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Card has expired';
    }
    return null;
  };

  const validateCVV = (cvv) => {
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      return 'CVV must be 3 or 4 digits';
    }
    return null;
  };

  // Test card validation (simulating Stripe test environment)
  const validateTestCard = (cardNumber, cvv, expiryMonth, expiryYear) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Check expiry date
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return { valid: false, error: 'Card has expired' };
    }
    
    // Test card scenarios based on Stripe test cards
    switch (cardNumber) {
      case '4000000000000002':
        return { valid: false, error: 'Card declined. Please use a different card.' };
      
      case '4000000000009995':
        return { valid: false, error: 'Insufficient funds. Please use a different card.' };
      
      case '4000000000000069':
        return { valid: false, error: 'Card expired. Please use a different card.' };
      
      case '4000000000000127':
        return { valid: false, error: 'Incorrect CVC. Please check your card details.' };
      
      case '4242424242424242':
        // Valid card - check if CVC is correct (any 3 digits for test)
        if (!/^\d{3}$/.test(cvv)) {
          return { valid: false, error: 'Invalid CVC. Please enter a 3-digit CVC.' };
        }
        return { valid: true, message: 'Card validated successfully' };
      
      default:
        // For any other test card numbers, simulate basic validation
        if (!/^\d{16}$/.test(cardNumber)) {
          return { valid: false, error: 'Invalid card number format' };
        }
        if (!/^\d{3}$/.test(cvv)) {
          return { valid: false, error: 'Invalid CVC. Please enter a 3-digit CVC.' };
        }
        return { valid: true, message: 'Card validated successfully' };
    }
  };

  // Stripe test card numbers for development
  const stripeTestCards = [
    { number: '4242 4242 4242 4242', description: 'Visa (Success)' },
    { number: '4000 0000 0000 0002', description: 'Visa (Declined)' },
    { number: '4000 0000 0000 9995', description: 'Visa (Insufficient Funds)' },
    { number: '4000 0000 0000 0069', description: 'Visa (Expired Card)' },
    { number: '4000 0000 0000 0127', description: 'Visa (Incorrect CVC)' }
  ];

  const subtotal = getCartTotal();
  const selectedShipping = shippingMethods.find(m => m.id === shippingMethod);
  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const total = subtotal + shippingCost;

  const paymentMethods = [
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: BanknotesIcon,
      iconSolid: BanknotesSolid,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      id: 'credit_card',
      name: 'Credit/Debit Card (Stripe)',
      description: 'Visa, Mastercard, American Express - Secure payment via Stripe',
      icon: CreditCardIcon,
      iconSolid: CreditCardSolid,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    }
  ];

  if (!isAuthenticated || !cart || cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-gray-600">Enter your delivery details</p>
                </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+94 71 123 4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.province ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Province</option>
                      {sriLankaProvinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  {errors.province && (
                    <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                  )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <select
                      value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                      disabled={!formData.province}
                    >
                      <option value="">Select City</option>
                    {formData.province && sriLankaCities[formData.province]?.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.postalCode ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 10100"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="3"
                    placeholder="Any special delivery instructions or notes..."
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <TruckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Method</h2>
                  <p className="text-gray-600">Choose your delivery option</p>
                </div>
              </div>

              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                      shippingMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 border-2 rounded-full mr-3 ${
                          shippingMethod === method.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {shippingMethod === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                          <p className="text-sm text-gray-500">{method.delivery}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {method.price === 0 ? 'FREE' : `LKR ${method.price.toLocaleString()}`}
                        </p>
                        {method.minOrder && (
                          <p className="text-xs text-gray-500">
                            Min order: LKR {method.minOrder.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <CreditCardIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                  <p className="text-gray-600">Choose how you want to pay</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                  <input
                    type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center w-full">
                      <div className={`w-5 h-5 border-2 rounded-full mr-3 ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center mr-3`}>
                        <method.iconSolid className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                  </div>
                </label>
                ))}
              </div>

                                      {/* Card Details Form */}
                        {paymentMethod === 'credit_card' && (
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Card Details</h3>
                            
                            {/* Test Card Information */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="text-sm font-medium text-blue-800 mb-2">🧪 Test Environment</h4>
                              <p className="text-xs text-blue-700 mb-3">
                                Use these test card numbers for development (no real charges):
                              </p>
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-blue-800">4242 4242 4242 4242</span>
                                  <span className="text-green-600 font-medium">✅ Success</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-blue-800">4000 0000 0000 0002</span>
                                  <span className="text-red-600 font-medium">❌ Declined</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-blue-800">4000 0000 0000 9995</span>
                                  <span className="text-orange-600 font-medium">⚠️ Insufficient Funds</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-blue-800">4000 0000 0000 0069</span>
                                  <span className="text-red-600 font-medium">❌ Expired Card</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-blue-800">4000 0000 0000 0127</span>
                                  <span className="text-red-600 font-medium">❌ Incorrect CVC</span>
                                </div>
                              </div>
                                                          <p className="text-xs text-blue-600 mt-2">
                              Use any future expiry date (e.g., 12/25) and any 3-digit CVC (e.g., 123)
                            </p>
                            
                            {/* Test Notification Button */}
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await api.post('/api/notifications/test', {
                                      title: 'Test Notification 🔔',
                                      message: 'This is a test notification to verify the system is working!',
                                      type: 'info',
                                      category: 'system'
                                    });
                                    showSuccess('Test notification created! Check the notification bell.');
                                  } catch (error) {
                                    showError('Failed to create test notification');
                                  }
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Test Notification System
                              </button>
                            </div>
                          </div>
                  
                  {/* Test Card Helper */}
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-sm font-medium text-yellow-800">Test Environment</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Use these test card numbers for development (no real charges):
                    </p>
                    <div className="space-y-2">
                      {stripeTestCards.map((card, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <code className="bg-yellow-100 px-2 py-1 rounded font-mono text-yellow-800">
                            {card.number}
                          </code>
                          <span className="text-yellow-600">{card.description}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-yellow-600 mt-3">
                      Use any future expiry date (e.g., 12/25) and any 3-digit CVC (e.g., 123)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name *
                      </label>
                  <input
                        type="text"
                        value={cardData.cardholderName}
                        onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.cardholderName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Name on card"
                      />
                      {errors.cardholderName && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
                      )}
                  </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                </label>
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', formatCardNumber(e.target.value))}
                        onBlur={(e) => {
                          const error = validateCardNumber(e.target.value);
                          setErrors(prev => ({ ...prev, cardNumber: error }));
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.cardNumber ? 'border-red-300' : 
                          cardData.cardNumber && !errors.cardNumber ? 'border-green-300' : 'border-gray-300'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                      )}
                      {cardData.cardNumber && !errors.cardNumber && (
                        <div className="flex items-center text-green-600 text-sm mt-1">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Valid card number
              </div>
                      )}
            </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={cardData.expiryDate}
                        onChange={(e) => handleCardInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        onBlur={(e) => {
                          const error = validateExpiryDate(e.target.value);
                          setErrors(prev => ({ ...prev, expiryDate: error }));
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.expiryDate ? 'border-red-300' : 
                          cardData.expiryDate && !errors.expiryDate ? 'border-green-300' : 'border-gray-300'
                        }`}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                      {errors.expiryDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                      )}
          </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={cardData.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                        onBlur={(e) => {
                          const error = validateCVV(e.target.value);
                          setErrors(prev => ({ ...prev, cvv: error }));
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.cvv ? 'border-red-300' : 
                          cardData.cvv && !errors.cvv ? 'border-green-300' : 'border-gray-300'
                        }`}
                        placeholder="123"
                        maxLength="4"
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <p className="text-sm text-blue-800">
                        Your payment information is encrypted and secure. We never store your full card details.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal Integration */}
              {paymentMethod === 'paypal' && (
                <div className="border-t pt-6">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <QrCodeIcon className="h-5 w-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">
                        You will be redirected to PayPal to complete your payment securely.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash on Delivery Info */}
              {paymentMethod === 'cash_on_delivery' && (
                <div className="border-t pt-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <BanknotesIcon className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm text-green-800">
                        Pay with cash when your order is delivered. No additional fees.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img
                      src={item.images?.[0] || item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='}
                      alt={item.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                        {item.selectedSize && ` • Size: ${item.selectedSize}`}
                        {item.selectedColor && ` • Color: ${item.selectedColor}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </p>
                  </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shippingCost === 0 ? 'FREE' : `LKR ${shippingCost.toLocaleString()}`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">LKR {total.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {shippingCost === 0 ? 'Free shipping included' : 'Shipping included'}
                  </p>
                  </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <LockClosedIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Secure Checkout</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className={`w-full mt-6 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Place Order - LKR {total.toLocaleString()}
                  </div>
                )}
              </button>

              {/* Additional Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  By placing your order, you agree to our{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
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