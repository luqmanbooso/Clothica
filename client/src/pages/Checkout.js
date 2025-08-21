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
  BuildingOfficeIcon,
  SparklesIcon,
  StarIcon,
  UserIcon
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

  // Enhanced color palette
  const colors = {
    primary: '#1E1E1E',
    secondary: '#F9F9F9',
    accent: '#D6BFAF',
    cta: '#6C7A59',
    sale: '#B35D5D',
    background: '#F4F1EE',
    hover: '#CCCCCC',
    // New complementary colors
    gold: '#D4AF37',
    rose: '#E8B4B8',
    sage: '#9CAF88',
    cream: '#F5F1E8',
    charcoal: '#2C2C2C',
    lavender: '#E6E6FA'
  };

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

  // Individual field validation function
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return `${fieldName === 'firstName' ? 'First' : 'Last'} name is required`;
        if (value.trim().length < 2) return `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return `${fieldName === 'firstName' ? 'First' : 'Last'} name contains invalid characters`;
        return null;
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
        return null;
      
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^(\+94|0)?[1-9][0-9]{8}$/.test(value.trim().replace(/\s/g, ''))) return 'Please enter a valid Sri Lankan phone number';
        return null;
      
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10) return 'Address must be at least 10 characters';
        return null;
      
      case 'postalCode':
        if (!value.trim()) return 'Postal code is required';
        if (!/^\d{5}$/.test(value.trim())) return 'Postal code must be 5 digits';
        return null;
      
      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Enhanced Personal Information Validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name contains invalid characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name contains invalid characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+94|0)?[1-9][0-9]{8}$/.test(formData.phone.trim().replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Sri Lankan phone number';
    }

    // Enhanced Address Validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.province.trim()) {
      newErrors.province = 'Province is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{5}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Postal code must be 5 digits';
    }

    // Enhanced Shipping Method Validation
    if (!shippingMethod) {
      newErrors.shippingMethod = 'Please select a shipping method';
    }

    // Enhanced Payment Method Validation
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    } else if (paymentMethod === 'credit_card') {
      if (!cardData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      } else if (cardData.cardholderName.trim().length < 3) {
        newErrors.cardholderName = 'Cardholder name must be at least 3 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(cardData.cardholderName.trim())) {
        newErrors.cardholderName = 'Cardholder name contains invalid characters';
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
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1E3A8A] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#D4AF37] to-[#E8B4B8] rounded-full opacity-20 blur-3xl animate-float-gentle"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#9CAF88] to-[#7C3AED] rounded-full opacity-15 blur-3xl animate-float-gentle" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#B35D5D] to-[#059669] rounded-full opacity-10 blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-[#8B4513] to-[#800020] rounded-full opacity-20 blur-2xl animate-float-gentle" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-[#4A5568] to-[#7C3AED] rounded-full opacity-15 blur-2xl animate-float-gentle" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="mb-12 text-center animate-fade-in-up">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-[#D4AF37] hover:text-[#F5F1E8] mb-6 transition-all duration-300 transform hover:scale-105 group bg-[#2D2D2D]/50 backdrop-blur-sm px-4 py-2 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#2D2D2D]/80"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Cart</span>
          </button>

          <div className="relative">
            <h1 className="text-6xl font-display font-bold mb-6 bg-gradient-to-r from-[#F5F1E8] via-[#D4AF37] to-[#E8B4B8] bg-clip-text text-transparent animate-fade-in-up">
              Complete Your Style
            </h1>
          <div className="text-center mb-8">
              <p className="text-2xl text-[#F5F1E8] font-bold bg-gradient-to-r from-[#D4AF37] via-[#E8B4B8] to-[#7C3AED] bg-clip-text text-transparent animate-text-shimmer mb-6">
                Secure & Fashion-Forward Checkout
              </p>
              
              {/* Checkout Progress Indicator */}
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center mr-3 animate-pulse-soft">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
                    <span className="text-[#F5F1E8] font-medium">Personal Info</span>
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-[#059669] to-[#6C7A59] mx-4 animate-pulse-soft"></div>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${shippingMethod ? 'bg-[#059669]' : 'bg-[#6C7A59]/50'} rounded-full flex items-center justify-center mr-3 transition-all duration-500 ${shippingMethod ? 'animate-pulse-soft' : ''}`}>
                      {shippingMethod ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <TruckIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className={`font-medium transition-colors duration-500 ${shippingMethod ? 'text-[#F5F1E8]' : 'text-[#6C7A59]'}`}>Shipping</span>
                  </div>
                  <div className={`flex-1 h-1 mx-4 transition-all duration-500 ${shippingMethod ? 'bg-gradient-to-r from-[#059669] to-[#6C7A59]' : 'bg-[#6C7A59]/30'}`}></div>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${paymentMethod ? 'bg-[#059669]' : 'bg-[#6C7A59]/50'} rounded-full flex items-center justify-center mr-3 transition-all duration-500 ${paymentMethod ? 'animate-pulse-soft' : ''}`}>
                      {paymentMethod ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <CreditCardIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className={`font-medium transition-colors duration-500 ${paymentMethod ? 'text-[#F5F1E8]' : 'text-[#6C7A59]'}`}>Payment</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[#9CAF88] text-sm font-medium animate-fade-in-up">
                    {!shippingMethod && !paymentMethod ? 'Step 1 of 3: Personal Information' :
                     shippingMethod && !paymentMethod ? 'Step 2 of 3: Shipping Method' :
                     'Step 3 of 3: Payment Method'}
            </p>
          </div>
              </div>
            </div>
            <p className="text-[#9CAF88] text-xl font-medium bg-[#2D2D2D]/50 backdrop-blur-sm px-6 py-2 rounded-full inline-block border border-[#9CAF88]/30">
              Your journey to effortless elegance ends here
            </p>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-10">
            {/* Personal Information */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#D4AF37]/20 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] animate-fade-in-up relative overflow-hidden">
              {/* Subtle accent border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#E8B4B8] to-[#7C3AED]"></div>
              
              {/* Form Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#6C7A59]">Form Progress</span>
                  <span className="text-sm font-bold text-[#1E1E1E]">
                    {Math.round((Object.keys(formData).filter(key => formData[key] && formData[key].toString().trim()).length / Object.keys(formData).length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#F5F1E8] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#D4AF37] to-[#7C3AED] h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(Object.keys(formData).filter(key => formData[key] && formData[key].toString().trim()).length / Object.keys(formData).length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              
                <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] via-[#E8B4B8] to-[#7C3AED] rounded-2xl flex items-center justify-center mr-6 shadow-lg animate-pulse-soft">
                  <MapPinIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                  <h2 className="text-3xl font-display font-bold text-[#1E1E1E] mb-3 bg-gradient-to-r from-[#1E1E1E] to-[#2D2D2D] bg-clip-text text-transparent">
                    Personal Information
                  </h2>
                  <p className="text-[#6C7A59] font-semibold text-lg">Where should we deliver your style?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                      First Name *
                    </label>
                    <div className="relative">
                    <input
                      type="text"
                      value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            const error = validateField('firstName', e.target.value);
                            setErrors(prev => ({ ...prev, firstName: error }));
                          }
                        }}
                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] font-medium ${
                          errors.firstName 
                            ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                            : formData.firstName.trim() && !errors.firstName
                            ? 'border-[#059669] bg-white ring-[#059669]/20'
                            : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/80'
                        }`}
                        placeholder="Enter your first name"
                        required
                        minLength="2"
                        maxLength="50"
                      />
                      {formData.firstName.trim() && !errors.firstName && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  {errors.firstName && (
                      <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.firstName}
                      </p>
                  )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                      Last Name *
                    </label>
                    <div className="relative">
                    <input
                      type="text"
                      value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            const error = validateField('lastName', e.target.value);
                            setErrors(prev => ({ ...prev, lastName: error }));
                          }
                        }}
                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] font-medium ${
                          errors.lastName 
                            ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                            : formData.lastName.trim() && !errors.lastName
                            ? 'border-[#059669] bg-white ring-[#059669]/20'
                            : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/80'
                        }`}
                        placeholder="Enter your last name"
                        required
                        minLength="2"
                        maxLength="50"
                      />
                      {formData.lastName.trim() && !errors.lastName && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  {errors.lastName && (
                      <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.lastName}
                      </p>
                  )}
                </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                      Email Address *
                    </label>
                    <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            const error = validateField('email', e.target.value);
                            setErrors(prev => ({ ...prev, email: error }));
                          }
                        }}
                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] font-medium ${
                          errors.email 
                            ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                            : formData.email.trim() && !errors.email
                            ? 'border-[#059669] bg-white ring-[#059669]/20'
                            : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/80'
                        }`}
                        placeholder="Enter your email address"
                        required
                        autoComplete="email"
                      />
                      {formData.email.trim() && !errors.email && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  {errors.email && (
                      <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.email}
                      </p>
                  )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                    Phone Number *
                    </label>
                    <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            const error = validateField('phone', e.target.value);
                            setErrors(prev => ({ ...prev, phone: error }));
                          }
                        }}
                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] font-medium ${
                          errors.phone 
                            ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                            : formData.phone.trim() && !errors.phone
                            ? 'border-[#059669] bg-white ring-[#059669]/20'
                            : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/80'
                    }`}
                    placeholder="+94 71 123 4567"
                        required
                        autoComplete="tel"
                        pattern="(\+94|0)?[1-9][0-9]{8}"
                      />
                      {formData.phone.trim() && !errors.phone && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  {errors.phone && (
                      <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.phone}
                      </p>
                  )}
                </div>

                <div className="md:col-span-2 group">
                  <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                    Street Address *
                  </label>
                  <div className="relative">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          const error = validateField('address', e.target.value);
                          setErrors(prev => ({ ...prev, address: error }));
                        }
                      }}
                      className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] font-medium ${
                        errors.address 
                          ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                          : formData.address.trim() && !errors.address
                          ? 'border-[#059669] bg-white ring-[#059669]/20'
                          : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/80'
                      }`}
                      placeholder="Enter your complete street address"
                      required
                      autoComplete="street-address"
                      minLength="10"
                    />
                    {formData.address.trim() && !errors.address && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.address && (
                    <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      {errors.address}
                    </p>
                  )}
                </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                      Province *
                    </label>
                    <div className="relative">
                    <select
                      value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] bg-white/80 font-medium ${
                          errors.province 
                            ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                            : formData.province && !errors.province
                            ? 'border-[#059669] bg-white ring-[#059669]/20'
                            : 'border-[#D6BFAF] hover:border-[#9CAF88]'
                        }`}
                        required
                      >
                        <option value="" className="text-[#9CAF88] font-medium">Select Province</option>
                      {sriLankaProvinces.map(province => (
                          <option key={province} value={province} className="text-[#1E1E1E] font-medium">{province}</option>
                      ))}
                    </select>
                      {formData.province && !errors.province && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  {errors.province && (
                      <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.province}
                      </p>
                  )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                      City *
                    </label>
                    <div className="relative">
                    <select
                      value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] bg-white/80 font-medium ${
                          errors.city 
                            ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                            : formData.city && !errors.city
                            ? 'border-[#059669] bg-white ring-[#059669]/20'
                            : 'border-[#D6BFAF] hover:border-[#9CAF88]'
                        } ${!formData.province ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                      disabled={!formData.province}
                        required
                    >
                        <option value="" className="text-[#9CAF88] font-medium">
                          {formData.province ? 'Select City' : 'Select Province First'}
                        </option>
                    {formData.province && sriLankaCities[formData.province]?.map(city => (
                          <option key={city} value={city} className="text-[#1E1E1E] font-medium">{city}</option>
                      ))}
                    </select>
                      {formData.city && !errors.city && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  {errors.city && (
                      <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.city}
                      </p>
                  )}
                </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                      Postal Code *
                    </label>
                    <div className="relative">
                    <input
                      type="text"
                      value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            const error = validateField('postalCode', e.target.value);
                            setErrors(prev => ({ ...prev, postalCode: error }));
                          }
                        }}
                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] font-medium ${
                          errors.postalCode 
                            ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                            : formData.postalCode.trim() && !errors.postalCode
                            ? 'border-[#059669] bg-white ring-[#059669]/20'
                            : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/80'
                    }`}
                    placeholder="e.g., 10100"
                        required
                        pattern="[0-9]{5}"
                        maxLength="5"
                        autoComplete="postal-code"
                      />
                      {formData.postalCode.trim() && !errors.postalCode && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  {errors.postalCode && (
                      <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.postalCode}
                      </p>
                  )}
                </div>

                <div className="md:col-span-2 group">
                  <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                    Additional Information
                  </label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    className="w-full px-6 py-4 border-2 border-[#D6BFAF] rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] bg-white/80 hover:border-[#9CAF88] font-medium resize-none"
                    rows="4"
                    placeholder="Any special delivery instructions, building access codes, or notes for the delivery person..."
                    maxLength="500"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-[#9CAF88] font-medium">
                      Optional: Help us deliver your order more efficiently
                    </p>
                    <span className="text-xs text-[#6C7A59] font-medium">
                      {formData.additionalInfo.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#059669]/20 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] animate-fade-in-up relative overflow-hidden" style={{animationDelay: '0.1s'}}>
              {/* Subtle accent border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#059669] via-[#9CAF88] to-[#6C7A59]"></div>
              
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#059669] via-[#9CAF88] to-[#6C7A59] rounded-2xl flex items-center justify-center mr-6 shadow-lg animate-pulse-soft">
                  <TruckIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-[#1E1E1E] mb-3 bg-gradient-to-r from-[#059669] to-[#6C7A59] bg-clip-text text-transparent">
                    Shipping Method
                  </h2>
                  <p className="text-[#6C7A59] font-semibold text-lg">How fast do you want your style?</p>
                </div>
              </div>

              <div className="space-y-4">
                {shippingMethods.map((method, index) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      shippingMethod === method.id
                        ? 'border-[#6C7A59] bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] shadow-lg'
                        : errors.shippingMethod
                        ? 'border-[#B35D5D] bg-[#F5F1E8]'
                        : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/50 hover:bg-white/70'
                    }`}
                    style={{animationDelay: `${0.2 + index * 0.1}s`}}
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
                        <div className={`w-6 h-6 border-2 rounded-full mr-4 transition-all duration-300 ${
                          shippingMethod === method.id
                            ? 'border-[#6C7A59] bg-[#6C7A59] scale-110'
                            : 'border-[#D6BFAF]'
                        }`}>
                          {shippingMethod === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-1 animate-scale-in"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1E1E1E] text-lg mb-1">{method.name}</h3>
                          <p className="text-[#6C7A59] font-medium mb-1">{method.description}</p>
                          <p className="text-[#9CAF88] text-sm">{method.delivery}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-2xl ${
                          method.price === 0 ? 'text-[#9CAF88]' : 'text-[#1E1E1E]'
                        }`}>
                          {method.price === 0 ? 'FREE' : `LKR ${method.price.toLocaleString()}`}
                        </p>
                        {method.minOrder && (
                          <p className="text-xs text-[#B35D5D] font-medium">
                            Min order: LKR {method.minOrder.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Shipping Method Error */}
              {errors.shippingMethod && (
                <div className="mt-4 p-4 bg-[#F5F1E8] border border-[#B35D5D] rounded-xl">
                  <p className="text-[#B35D5D] text-sm flex items-center font-medium">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    {errors.shippingMethod}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#B35D5D]/20 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] animate-fade-in-up relative overflow-hidden" style={{animationDelay: '0.2s'}}>
              {/* Subtle accent border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B35D5D] via-[#D4AF37] to-[#E8B4B8]"></div>
              
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#B35D5D] via-[#D4AF37] to-[#E8B4B8] rounded-2xl flex items-center justify-center mr-6 shadow-lg animate-pulse-soft">
                  <CreditCardIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-[#1E1E1E] mb-3 bg-gradient-to-r from-[#B35D5D] to-[#D4AF37] bg-clip-text text-transparent">
                    Payment Method
                  </h2>
                  <p className="text-[#6C7A59] font-semibold text-lg">Secure payment options for your style</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {paymentMethods.map((method, index) => (
                  <label
                    key={method.id}
                    className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      paymentMethod === method.id
                        ? 'border-[#6C7A59] bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] shadow-lg'
                        : errors.paymentMethod
                        ? 'border-[#B35D5D] bg-[#F5F1E8]'
                        : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/50 hover:bg-white/70'
                    }`}
                    style={{animationDelay: `${0.3 + index * 0.1}s`}}
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
                      <div className={`w-6 h-6 border-2 rounded-full mr-4 transition-all duration-300 ${
                        paymentMethod === method.id
                          ? 'border-[#6C7A59] bg-[#6C7A59] scale-110'
                          : 'border-[#D6BFAF]'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full m-1 animate-scale-in"></div>
                        )}
                      </div>
                      <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center mr-4 shadow-md`}>
                        <method.iconSolid className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1E1E1E] text-lg mb-1">{method.name}</h3>
                        <p className="text-[#6C7A59] text-sm leading-relaxed">{method.description}</p>
                      </div>
                  </div>
                </label>
                ))}
              </div>
              
              {/* Payment Method Error */}
              {errors.paymentMethod && (
                <div className="mb-6 p-4 bg-[#F5F1E8] border border-[#B35D5D] rounded-xl">
                  <p className="text-[#B35D5D] text-sm flex items-center font-medium">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    {errors.paymentMethod}
                  </p>
                </div>
              )}

                                      {/* Card Details Form */}
                        {paymentMethod === 'credit_card' && (
                          <div className="border-t border-[#D6BFAF] pt-8">
                            <div className="flex items-center mb-6">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#D4AF37] rounded-xl flex items-center justify-center mr-4">
                                <CreditCardIcon className="h-6 w-6 text-white" />
                                </div>
                              <div>
                                <h3 className="text-xl font-display font-semibold text-[#1E1E1E] mb-1">Card Details</h3>
                                <p className="text-[#6C7A59] font-medium">Enter your payment information securely</p>
                                </div>
                                </div>
                            
                            {/* Test Card Information */}
                            <div className="mb-8 p-6 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl border border-[#D4AF37]/30">
                              <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#059669] rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <h4 className="text-sm font-semibold text-[#1E1E1E]">Test Environment</h4>
                                </div>
                              <p className="text-sm text-[#6C7A59] mb-4 font-medium">
                                Use these test card numbers for development (no real charges):
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                                  <code className="font-mono text-[#7C3AED] font-semibold">4242 4242 4242 4242</code>
                                  <span className="text-[#059669] font-semibold">Success</span>
                            </div>
                                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                                  <code className="font-mono text-[#7C3AED] font-semibold">4000 0000 0000 0002</code>
                                  <span className="text-[#B35D5D] font-semibold">Declined</span>
                          </div>
                                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                                  <code className="font-mono text-[#7C3AED] font-semibold">4000 0000 0000 9995</code>
                                  <span className="text-[#D4AF37] font-semibold">Insufficient Funds</span>
                    </div>
                                <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                                  <code className="font-mono text-[#7C3AED] font-semibold">4000 0000 0000 0069</code>
                                  <span className="text-[#B35D5D] font-semibold">Expired Card</span>
                        </div>
                    </div>
                              <p className="text-xs text-[#6C7A59] mt-4 font-medium">
                      Use any future expiry date (e.g., 12/25) and any 3-digit CVC (e.g., 123)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                        Cardholder Name *
                      </label>
                      <div className="relative">
                  <input
                        type="text"
                        value={cardData.cardholderName}
                        onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              const error = validateField('cardholderName', e.target.value);
                              setErrors(prev => ({ ...prev, cardholderName: error }));
                            }
                          }}
                          className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] font-medium ${
                            errors.cardholderName 
                              ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                              : cardData.cardholderName.trim() && !errors.cardholderName
                              ? 'border-[#059669] bg-white ring-[#059669]/20'
                              : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/80'
                          }`}
                          placeholder="Name as it appears on your card"
                          required
                          autoComplete="cc-name"
                          minLength="3"
                          maxLength="50"
                        />
                        {cardData.cardholderName.trim() && !errors.cardholderName && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.cardholderName && (
                        <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          {errors.cardholderName}
                        </p>
                      )}
                  </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                        Card Number *
                </label>
                      <div className="relative">
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', formatCardNumber(e.target.value))}
                        onBlur={(e) => {
                          const error = validateCardNumber(e.target.value);
                          setErrors(prev => ({ ...prev, cardNumber: error }));
                        }}
                          className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] font-medium ${
                            errors.cardNumber 
                              ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                              : cardData.cardNumber && !errors.cardNumber
                              ? 'border-[#059669] bg-white ring-[#059669]/20'
                              : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/80'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                          required
                          autoComplete="cc-number"
                          pattern="[0-9\s]{13,19}"
                        />
                        {cardData.cardNumber && !errors.cardNumber && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.cardNumber && (
                        <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          {errors.cardNumber}
                        </p>
                      )}
                      {cardData.cardNumber && !errors.cardNumber && (
                        <div className="flex items-center text-[#059669] text-sm mt-2 font-medium">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Valid card number
              </div>
                      )}
            </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                        Expiry Date *
                      </label>
                      <div className="relative">
                      <input
                        type="text"
                        value={cardData.expiryDate}
                        onChange={(e) => handleCardInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        onBlur={(e) => {
                          const error = validateExpiryDate(e.target.value);
                          setErrors(prev => ({ ...prev, expiryDate: error }));
                        }}
                          className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] font-medium ${
                            errors.expiryDate 
                              ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                              : cardData.expiryDate && !errors.expiryDate
                              ? 'border-[#059669] bg-white ring-[#059669]/20'
                              : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/80'
                        }`}
                        placeholder="MM/YY"
                        maxLength="5"
                          required
                          autoComplete="cc-exp"
                          pattern="[0-9]{2}/[0-9]{2}"
                        />
                        {cardData.expiryDate && !errors.expiryDate && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.expiryDate && (
                        <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          {errors.expiryDate}
                        </p>
                      )}
          </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1E1E1E] mb-3 group-hover:text-[#6C7A59] transition-colors duration-300">
                        Security Code (CVV) *
                      </label>
                      <div className="relative">
                      <input
                        type="text"
                        value={cardData.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                        onBlur={(e) => {
                          const error = validateCVV(e.target.value);
                          setErrors(prev => ({ ...prev, cvv: error }));
                        }}
                          className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/30 focus:border-[#6C7A59] transition-all duration-300 text-[#1E1E1E] placeholder-[#9CAF88] font-medium ${
                            errors.cvv 
                              ? 'border-[#B35D5D] bg-[#F5F1E8] ring-[#B35D5D]/20' 
                              : cardData.cvv && !errors.cvv
                              ? 'border-[#059669] bg-white ring-[#059669]/20'
                              : 'border-[#D6BFAF] hover:border-[#9CAF88] bg-white/80'
                        }`}
                        placeholder="123"
                        maxLength="4"
                          required
                          autoComplete="cc-csc"
                          pattern="[0-9]{3,4}"
                        />
                        {cardData.cvv && !errors.cvv && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-6 h-6 bg-[#059669] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.cvv && (
                        <p className="text-[#B35D5D] text-sm mt-2 flex items-center font-medium">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 p-6 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl border border-[#059669]/30">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#059669] to-[#9CAF88] rounded-xl flex items-center justify-center mr-4">
                        <ShieldCheckIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1E1E1E] mb-1">Secure Payment</h4>
                        <p className="text-sm text-[#6C7A59] font-medium">
                          Your payment information is encrypted with 256-bit SSL encryption. We never store your full card details.
                        </p>
                      </div>
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
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#7C3AED]/20 sticky top-8 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] animate-fade-in-up relative overflow-hidden" style={{animationDelay: '0.3s'}}>
              {/* Subtle accent border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C3AED] via-[#D4AF37] to-[#059669]"></div>
              
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#7C3AED] via-[#D4AF37] to-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse-soft">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-[#1E1E1E] mb-3 bg-gradient-to-r from-[#7C3AED] to-[#059669] bg-clip-text text-transparent">
                  Order Summary
                </h2>
                <p className="text-[#6C7A59] font-semibold text-lg">Your curated style selection</p>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-8">
                {cart?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-6 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border border-[#D4AF37]/20 hover:border-[#D4AF37]/40" style={{animationDelay: `${0.4 + index * 0.1}s`}}>
                    <div className="relative">
                    <img
                      src={item.images?.[0] || item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='}
                      alt={item.name || 'Product'}
                        className="w-20 h-20 object-cover rounded-xl shadow-md"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1E1E1E] truncate text-lg mb-1">{item.name}</h3>
                      <div className="space-y-1">
                        {item.selectedSize && (
                          <p className="text-sm text-[#6C7A59] font-medium bg-[#F5F1E8] px-2 py-1 rounded-full inline-block">
                            Size: {item.selectedSize}
                          </p>
                        )}
                        {item.selectedColor && (
                          <p className="text-sm text-[#6C7A59] font-medium bg-[#E6E6FA] px-2 py-1 rounded-full inline-block ml-2">
                            Color: {item.selectedColor}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1E1E1E] text-lg">
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </p>
                  </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t-2 border-[#D4AF37] pt-6 space-y-4 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl p-6 border border-[#D4AF37]/20">
                <div className="flex justify-between items-center">
                  <span className="text-[#6C7A59] font-medium">Subtotal</span>
                  <span className="text-[#1E1E1E] font-semibold text-lg">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6C7A59] font-medium">Shipping</span>
                  <span className={`font-semibold text-lg ${
                    shippingCost === 0 ? 'text-[#9CAF88]' : 'text-[#1E1E1E]'
                  }`}>
                    {shippingCost === 0 ? 'FREE' : `LKR ${shippingCost.toLocaleString()}`}
                  </span>
                </div>
                <div className="border-t-2 border-[#D6BFAF] pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#1E1E1E] font-bold text-xl">Total</span>
                    <span className="text-[#1E1E1E] font-bold text-2xl bg-gradient-to-r from-[#6C7A59] to-[#B35D5D] bg-clip-text text-transparent">
                      LKR {total.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#9CAF88] font-medium mt-2 text-center">
                    {shippingCost === 0 ? 'Free shipping included' : 'Shipping included'}
                  </p>
                  </div>
              </div>

              {/* Security Badge */}
              <div className="mt-8 p-6 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl border-2 border-[#059669] relative overflow-hidden">
                {/* Subtle accent border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#059669] to-[#9CAF88]"></div>
                
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#059669] to-[#9CAF88] rounded-full flex items-center justify-center shadow-md animate-pulse-soft">
                    <LockClosedIcon className="h-6 w-6 text-white" />
                </div>
                  <div className="text-center">
                    <span className="text-[#059669] font-bold text-xl">Secure Checkout</span>
                    <p className="text-[#6C7A59] font-semibold">256-bit SSL encryption</p>
                  </div>
                </div>
              </div>

              {/* Form Completion Status */}
              <div className="mt-8 p-6 bg-gradient-to-r from-[#F5F1E8] to-[#E6E6FA] rounded-2xl border border-[#D4AF37]/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#1E1E1E]">Form Completion Status</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#6C7A59] font-medium">Progress:</span>
                    <span className="text-lg font-bold text-[#059669]">
                      {(() => {
                        let completed = 0;
                        if (Object.keys(formData).every(key => formData[key]?.trim())) completed += 33;
                        if (shippingMethod) completed += 33;
                        if (paymentMethod) completed += 34;
                        return `${completed}%`;
                      })()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className={`text-center p-3 rounded-xl ${Object.keys(formData).every(key => formData[key]?.trim()) ? 'bg-[#059669]/20] text-[#059669]' : 'bg-[#6C7A59]/20] text-[#6C7A59]'}`}>
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${Object.keys(formData).every(key => formData[key]?.trim()) ? 'bg-[#059669]' : 'bg-[#6C7A59]/50'}`}>
                      {Object.keys(formData).every(key => formData[key]?.trim()) ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <UserIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="font-medium">Personal Info</span>
                  </div>
                  
                  <div className={`text-center p-3 rounded-xl ${shippingMethod ? 'bg-[#059669]/20] text-[#059669]' : 'bg-[#6C7A59]/20] text-[#6C7A59]'}`}>
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${shippingMethod ? 'bg-[#059669]' : 'bg-[#6C7A59]/50'}`}>
                      {shippingMethod ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <TruckIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="font-medium">Shipping</span>
                  </div>
                  
                  <div className={`text-center p-3 rounded-xl ${paymentMethod ? 'bg-[#059669]/20] text-[#059669]' : 'bg-[#6C7A59]/20] text-[#6C7A59]'}`}>
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${paymentMethod ? 'bg-[#059669]' : 'bg-[#6C7A59]/50'}`}>
                      {paymentMethod ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <CreditCardIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="font-medium">Payment</span>
                  </div>
                </div>
                
                {Object.keys(formData).every(key => formData[key]?.trim()) && shippingMethod && paymentMethod && (
                  <div className="mt-4 p-3 bg-[#059669]/20 rounded-xl border border-[#059669]/30">
                    <p className="text-[#059669] text-sm font-medium text-center">
                      All sections completed! You can now place your order.
                    </p>
                  </div>
                )}
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !(Object.keys(formData).every(key => formData[key]?.trim()) && shippingMethod && paymentMethod)}
                className={`w-full mt-8 py-6 px-8 rounded-2xl font-bold text-white transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-xl ${
                  isProcessing || !(Object.keys(formData).every(key => formData[key]?.trim()) && shippingMethod && paymentMethod)
                    ? 'bg-[#9CAF88] cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#7C3AED] via-[#B35D5D] to-[#D4AF37] hover:from-[#6D28D9] hover:via-[#A04D4D] hover:to-[#C49F2F] animate-glow'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center text-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing Your Style...
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-lg">
                    <CheckCircleIcon className="h-6 w-6 mr-3" />
                    Complete Your Style - LKR {total.toLocaleString()}
                  </div>
                )}
              </button>

              {/* Additional Info */}
              <div className="mt-6 text-center p-4 bg-[#F5F1E8] rounded-2xl">
                <p className="text-sm text-[#6C7A59] font-medium">
                  By completing your style, you agree to our{' '}
                  <a href="/terms" className="text-[#B35D5D] hover:text-[#A04D4D] underline font-semibold transition-colors duration-300">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-[#B35D5D] hover:text-[#A04D4D] underline font-semibold transition-colors duration-300">Privacy Policy</a>
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