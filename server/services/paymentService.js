const stripe = require('stripe');

class PaymentService {
  constructor() {
    this.stripe = null;
    this.isConfigured = false;
    this.initializePaymentGateways();
  }

  initializePaymentGateways() {
    // Initialize Stripe only
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        this.stripe = stripe(process.env.STRIPE_SECRET_KEY);
        console.log('✅ Stripe payment gateway initialized');
        this.isConfigured = true;
      } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error);
      }
    } else {
      console.warn('⚠️ Stripe secret key not configured');
    }
    
    if (!this.isConfigured) {
      console.log('📧 Payment service will use mock mode for development');
    }
  }

  // ========================================
  // STRIPE PAYMENT METHODS
  // ========================================

  async createStripePaymentIntent(amount, currency = 'lkr', metadata = {}) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  async confirmStripePayment(paymentIntentId) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentIntent: paymentIntent,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        };
      } else {
        throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  async refundStripePayment(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status
      };
    } catch (error) {
      console.error('Stripe refund failed:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  







  // ========================================
  // UNIFIED PAYMENT METHODS
  // ========================================

  async processPayment(paymentMethod, paymentData) {
    try {
      switch (paymentMethod.toLowerCase()) {
        case 'stripe':
        case 'credit_card':
        case 'debit_card':
          return await this.processStripePayment(paymentData);
        
        case 'cash_on_delivery':
          return {
            success: true,
            method: 'cash_on_delivery',
            status: 'pending',
            message: 'Payment will be collected on delivery'
          };
        
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }
    } catch (error) {
      console.error(`Payment processing failed for ${paymentMethod}:`, error);
      throw error;
    }
  }

  async processStripePayment(paymentData) {
    const { amount, currency, metadata, paymentMethodId } = paymentData;
    
    if (paymentMethodId) {
      // Payment method already exists, confirm payment
      return await this.confirmStripePayment(paymentMethodId);
    } else {
      // Create new payment intent
      return await this.createStripePaymentIntent(amount, currency, metadata);
    }
  }



  async refundPayment(paymentMethod, paymentData) {
    try {
      switch (paymentMethod.toLowerCase()) {
        case 'stripe':
        case 'credit_card':
        case 'debit_card':
          return await this.refundStripePayment(
            paymentData.paymentIntentId, 
            paymentData.amount, 
            paymentData.reason
          );
        
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }
    } catch (error) {
      console.error(`Refund failed for ${paymentMethod}:`, error);
      throw error;
    }
  }

  // Process refund for issue service
  async processRefund(refundRecord) {
    try {
      if (refundRecord.paymentGateway.provider === 'stripe') {
        const refundData = {
          paymentIntentId: refundRecord.metadata.originalPaymentIntent,
          amount: refundRecord.amount,
          reason: refundRecord.reason
        };
        
        return await this.refundStripePayment(
          refundData.paymentIntentId,
          refundData.amount,
          refundData.reason
        );
      } else {
        // Manual processing for other payment methods
        return {
          success: true,
          message: 'Manual refund processed',
          amount: refundRecord.amount,
          currency: refundRecord.currency
        };
      }
    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ========================================
  // MOCK PAYMENT METHODS (Development)
  // ========================================

  async createMockPaymentIntent(amount, currency = 'lkr', metadata = {}) {
    console.log('🧪 Mock Stripe Payment Intent Created:', {
      amount,
      currency,
      metadata,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      clientSecret: 'mock_client_secret_' + Date.now(),
      paymentIntentId: 'mock_pi_' + Date.now(),
      amount: amount,
      currency: currency,
      status: 'requires_payment_method'
    };
  }



  // ========================================
  // UTILITY METHODS
  // ========================================

  getSupportedPaymentMethods() {
    const methods = [];
    
    if (this.stripe) {
      methods.push({
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Pay with Visa, Mastercard, American Express',
        icon: '💳',
        enabled: true
      });
    }
    


    // Add mock methods for development
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_MOCK_PAYMENTS === 'true') {
      methods.push({
        id: 'mock_stripe',
        name: 'Mock Credit Card (Dev)',
        description: 'Test payment processing',
        icon: '🧪',
        enabled: true,
        isMock: true
      });
      

    }

    return methods;
  }

  getPaymentGatewayStatus() {
    return {
      isConfigured: this.isConfigured,
      stripe: {
        enabled: !!this.stripe,
        mode: this.stripe ? (this.stripe.getApiField('host') === 'api.stripe.com' ? 'live' : 'test') : 'disabled'
      },
      environment: process.env.NODE_ENV || 'development',
      mockEnabled: process.env.ENABLE_MOCK_PAYMENTS === 'true'
    };
  }

  // Validate payment data
  validatePaymentData(paymentData) {
    const errors = [];
    
    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Invalid amount');
    }
    
    if (!paymentData.currency) {
      errors.push('Currency is required');
    }
    
    if (!paymentData.paymentMethod) {
      errors.push('Payment method is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Format amount for display
  formatAmount(amount, currency = 'LKR') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Convert amount to smallest currency unit (cents for LKR)
  convertToSmallestUnit(amount, currency = 'LKR') {
    if (currency === 'LKR') {
      return Math.round(amount * 100); // Convert to cents
    }
    return amount;
  }

  // Convert from smallest currency unit
  convertFromSmallestUnit(amount, currency = 'LKR') {
    if (currency === 'LKR') {
      return amount / 100; // Convert from cents
    }
    return amount;
  }
}

module.exports = new PaymentService();
