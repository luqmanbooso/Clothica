const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const paymentService = require('../services/paymentService');
const Order = require('../models/Order');
const User = require('../models/User');
const stripe = require('stripe');

const router = express.Router();

// ========================================
// PAYMENT GATEWAY STATUS
// ========================================

// Get payment gateway status and supported methods
router.get('/status', async (req, res) => {
  try {
    const status = paymentService.getPaymentGatewayStatus();
    const methods = paymentService.getSupportedPaymentMethods();
    
    res.json({
      success: true,
      status: status,
      supportedMethods: methods,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
});

// ========================================
// STRIPE PAYMENTS
// ========================================

// Create Stripe payment intent
router.post('/stripe/create-intent', [
  auth,
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isIn(['lkr', 'usd', 'eur']).withMessage('Invalid currency'),
  body('orderId').optional().isString().withMessage('Order ID must be a string'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { amount, currency = 'lkr', orderId, metadata = {} } = req.body;

    // Add order and user info to metadata
    const enhancedMetadata = {
      ...metadata,
      orderId: orderId,
      userId: req.user.id,
      userEmail: req.user.email,
      timestamp: new Date().toISOString()
    };

    let paymentIntent;
    
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_MOCK_PAYMENTS === 'true') {
      // Use mock payment for development
      paymentIntent = await paymentService.createMockPaymentIntent(amount, currency, enhancedMetadata);
    } else {
      // Use real Stripe
      paymentIntent = await paymentService.createStripePaymentIntent(amount, currency, enhancedMetadata);
    }

    res.json({
      success: true,
      data: paymentIntent
    });
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
});

// Confirm Stripe payment
router.post('/stripe/confirm', [
  auth,
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { paymentIntentId } = req.body;

    let paymentResult;
    
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_MOCK_PAYMENTS === 'true') {
      // Mock confirmation for development
      paymentResult = {
        success: true,
        paymentIntentId: paymentIntentId,
        amount: 0,
        currency: 'lkr',
        status: 'succeeded'
      };
    } else {
      // Real Stripe confirmation
      paymentResult = await paymentService.confirmStripePayment(paymentIntentId);
    }

    // Update order status if payment successful
    if (paymentResult.success && paymentResult.status === 'succeeded') {
      // Find order by payment intent ID in metadata
      const order = await Order.findOne({
        'paymentResult.id': paymentIntentId
      });

      if (order) {
        order.status = 'processing';
        order.isPaid = true;
        order.paidAt = new Date();
        await order.save();
      }
    }

    res.json({
      success: true,
      data: paymentResult
    });
  } catch (error) {
    console.error('Stripe payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm payment'
    });
  }
});





// ========================================
// UNIFIED PAYMENT PROCESSING
// ========================================

// Process payment with any supported method
router.post('/process', [
  auth,
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isString().withMessage('Currency must be a string'),
  body('orderId').optional().isString().withMessage('Order ID must be a string'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { paymentMethod, amount, currency = 'LKR', orderId, metadata = {} } = req.body;

    // Validate payment data
    const validation = paymentService.validatePaymentData({
      amount,
      currency,
      paymentMethod
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment data',
        errors: validation.errors
      });
    }

    // Add order and user info to metadata
    const enhancedMetadata = {
      ...metadata,
      orderId: orderId,
      userId: req.user.id,
      userEmail: req.user.email,
      timestamp: new Date().toISOString()
    };

    // Process payment
    const paymentData = {
      amount,
      currency,
      metadata: enhancedMetadata,
      orderId,
      paymentMethodId: req.body.paymentMethodId
    };

    const result = await paymentService.processPayment(paymentMethod, paymentData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed'
    });
  }
});

// ========================================
// REFUNDS (Admin Only)
// ========================================

// Process refund
router.post('/refund', [
  auth,
  admin,
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { paymentMethod, paymentId, amount, reason = 'Admin requested refund' } = req.body;

    let refundData;
    
    if (paymentMethod === 'stripe') {
      refundData = {
        paymentIntentId: paymentId,
        amount: amount,
        reason: reason
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported payment method for refund'
      });
    }

    const refundResult = await paymentService.refundPayment(paymentMethod, refundData);

    // Update order status if refund successful
    if (refundResult.success) {
      // Find order by payment ID
      const order = await Order.findOne({
        $or: [
          { 'paymentResult.id': paymentId },
          { 'paymentResult.paymentIntentId': paymentId },
          { 'paymentResult.captureId': paymentId }
        ]
      });

      if (order) {
        order.status = 'refunded';
        order.refundedAt = new Date();
        order.refundAmount = refundResult.amount;
        order.refundReason = reason;
        await order.save();
      }
    }

    res.json({
      success: true,
      data: refundResult
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Refund processing failed'
    });
  }
});

// ========================================
// PAYMENT WEBHOOKS
// ========================================

// Stripe webhook
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update order status
        await handleStripePaymentSuccess(paymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Update order status
        await handleStripePaymentFailure(failedPayment);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});



// ========================================
// HELPER FUNCTIONS
// ========================================

async function handleStripePaymentSuccess(paymentIntent) {
  try {
    const order = await Order.findOne({
      'paymentResult.id': paymentIntent.id
    });

    if (order) {
      order.status = 'processing';
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();
      
      console.log(`Order ${order._id} updated to processing after Stripe payment success`);
    }
  } catch (error) {
    console.error('Error handling Stripe payment success:', error);
  }
}

async function handleStripePaymentFailure(paymentIntent) {
  try {
    const order = await Order.findOne({
      'paymentResult.id': paymentIntent.id
    });

    if (order) {
      order.status = 'payment_failed';
      order.paymentFailureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
      await order.save();
      
      console.log(`Order ${order._id} updated to payment_failed after Stripe payment failure`);
    }
  } catch (error) {
    console.error('Error handling Stripe payment failure:', error);
  }
}



module.exports = router;
