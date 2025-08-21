# 💳 CLOTHICA PAYMENT INTEGRATION GUIDE

## **🎯 OVERVIEW**

Clothica now supports **dual payment gateways** with **testing environments**:
- **Stripe** - Credit/Debit Card Processing
- **PayPal** - Digital Wallet & Account Payments
- **Mock Mode** - Development & Testing Support

## **🚀 QUICK START**

### **1. Environment Setup**

```bash
# Copy environment template
cp .env.example .env

# Enable mock payments for development
ENABLE_MOCK_PAYMENTS=true
NODE_ENV=development
```

### **2. Install Dependencies**

```bash
cd server
npm install stripe @paypal/paypal-server-sdk
```

### **3. Configure Payment Gateways**

#### **Stripe Configuration**
```env
# Stripe Test Keys (Sandbox)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Live Keys (Production)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

#### **PayPal Configuration**
```env
# PayPal Sandbox
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# PayPal Live
PAYPAL_CLIENT_ID=your_live_paypal_client_id
PAYPAL_CLIENT_SECRET=your_live_paypal_client_secret
PAYPAL_MODE=live
```

## **🔧 API ENDPOINTS**

### **Payment Gateway Status**
```http
GET /api/payments/status
```
Returns gateway configuration and supported payment methods.

### **Stripe Payments**

#### **Create Payment Intent**
```http
POST /api/payments/stripe/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 99.99,
  "currency": "lkr",
  "orderId": "order_123",
  "metadata": {
    "description": "Clothica Purchase"
  }
}
```

#### **Confirm Payment**
```http
POST /api/payments/stripe/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890"
}
```

### **PayPal Payments**

#### **Create Order**
```http
POST /api/payments/paypal/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 99.99,
  "currency": "LKR",
  "orderId": "order_123",
  "metadata": {
    "description": "Clothica Purchase"
  }
}
```

#### **Capture Payment**
```http
POST /api/payments/paypal/capture
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "PAYPAL_ORDER_ID"
}
```

### **Unified Payment Processing**
```http
POST /api/payments/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "stripe",
  "amount": 99.99,
  "currency": "LKR",
  "orderId": "order_123"
}
```

### **Refunds (Admin Only)**
```http
POST /api/payments/refund
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "paymentMethod": "stripe",
  "paymentId": "pi_1234567890",
  "amount": 99.99,
  "reason": "Customer requested refund"
}
```

## **🧪 TESTING & DEVELOPMENT**

### **Mock Mode Activation**
```env
# Enable mock payments
ENABLE_MOCK_PAYMENTS=true
NODE_ENV=development
```

### **Test Configuration**
```bash
# Use test environment
cp config/test.env .env
npm run test:payments
```

### **Test Scripts**
```bash
# Run payment tests
node scripts/testPayments.js

# Test specific scenarios
npm run test:stripe
npm run test:paypal
```

## **🔐 SECURITY FEATURES**

### **Authentication & Authorization**
- **JWT Token Required** for all payment endpoints
- **Admin Role Required** for refund operations
- **Input Validation** with express-validator
- **Webhook Signature Verification** for Stripe

### **Data Protection**
- **PCI Compliance** through Stripe integration
- **Encrypted Communication** with payment gateways
- **Secure Token Storage** in environment variables
- **Audit Logging** for all payment operations

## **📊 PAYMENT FLOWS**

### **Stripe Flow**
```
1. Create Payment Intent → 2. Client Confirms → 3. Webhook Updates Order
```

### **PayPal Flow**
```
1. Create Order → 2. User Approves → 3. Capture Payment → 4. Update Order
```

### **Mock Flow (Development)**
```
1. Create Mock Intent → 2. Simulate Success → 3. Update Order Status
```

## **🔄 WEBHOOK HANDLING**

### **Stripe Webhooks**
```http
POST /api/payments/webhooks/stripe
```
Handles: `payment_intent.succeeded`, `payment_intent.payment_failed`

### **PayPal Webhooks**
```http
POST /api/payments/webhooks/paypal
```
Handles: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

## **💡 INTEGRATION EXAMPLES**

### **Frontend Integration (React)**
```javascript
import { usePayment } from '../hooks/usePayment';

const CheckoutComponent = () => {
  const { processPayment, loading, error } = usePayment();

  const handleStripePayment = async () => {
    try {
      const result = await processPayment({
        method: 'stripe',
        amount: 99.99,
        currency: 'LKR',
        orderId: 'order_123'
      });
      
      // Handle success
      console.log('Payment successful:', result);
    } catch (error) {
      // Handle error
      console.error('Payment failed:', error);
    }
  };

  return (
    <button onClick={handleStripePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Pay with Card'}
    </button>
  );
};
```

### **Backend Integration (Node.js)**
```javascript
const paymentService = require('./services/paymentService');

// Process payment
const paymentResult = await paymentService.processPayment('stripe', {
  amount: 99.99,
  currency: 'LKR',
  metadata: { orderId: 'order_123' }
});

// Handle refund
const refundResult = await paymentService.refundPayment('stripe', {
  paymentIntentId: 'pi_1234567890',
  amount: 99.99,
  reason: 'Customer requested refund'
});
```

## **🚨 ERROR HANDLING**

### **Common Error Codes**
- `400` - Validation Error (invalid amount, currency, etc.)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (admin access required)
- `500` - Payment Gateway Error

### **Error Response Format**
```json
{
  "success": false,
  "message": "Payment processing failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

## **📈 MONITORING & ANALYTICS**

### **Payment Metrics**
- Success/Failure Rates
- Processing Times
- Revenue by Payment Method
- Refund Statistics

### **Logging**
```javascript
// Payment events are logged with:
console.log('Payment succeeded:', paymentIntent.id);
console.log('Payment failed:', failedPayment.id);
console.log('Refund processed:', refund.id);
```

## **🔧 TROUBLESHOOTING**

### **Common Issues**

#### **1. Stripe Not Initialized**
```bash
# Check environment variables
echo $STRIPE_SECRET_KEY

# Verify Stripe package installation
npm list stripe
```

#### **2. PayPal Authentication Failed**
```bash
# Verify credentials
echo $PAYPAL_CLIENT_ID
echo $PAYPAL_CLIENT_SECRET

# Check mode (sandbox/live)
echo $PAYPAL_MODE
```

#### **3. Mock Payments Not Working**
```bash
# Ensure mock mode is enabled
echo $ENABLE_MOCK_PAYMENTS
echo $NODE_ENV
```

### **Debug Mode**
```env
DEBUG=true
LOG_LEVEL=debug
```

## **🚀 DEPLOYMENT CHECKLIST**

### **Pre-Production**
- [ ] Test with real payment gateways
- [ ] Verify webhook endpoints
- [ ] Test refund functionality
- [ ] Validate error handling
- [ ] Check security headers

### **Production**
- [ ] Use live API keys
- [ ] Enable webhook signature verification
- [ ] Monitor payment logs
- [ ] Set up alerting
- [ ] Backup payment data

## **📚 ADDITIONAL RESOURCES**

### **Documentation**
- [Stripe API Reference](https://stripe.com/docs/api)
- [PayPal Developer Docs](https://developer.paypal.com/)
- [Clothica API Docs](./API_DOCUMENTATION.md)

### **Support**
- **Stripe Support**: https://support.stripe.com/
- **PayPal Developer Support**: https://developer.paypal.com/support/
- **Clothica Team**: support@clothica.com

---

## **🎉 CONGRATULATIONS!**

Your Clothica e-commerce platform now has **enterprise-grade payment processing** with:
- ✅ **Dual Payment Gateways** (Stripe + PayPal)
- ✅ **Testing Environment** (Mock Payments)
- ✅ **Security Features** (JWT + Validation)
- ✅ **Webhook Support** (Real-time Updates)
- ✅ **Refund Management** (Admin Controls)
- ✅ **Comprehensive Testing** (Test Scripts)

**Ready for production! 🚀**


