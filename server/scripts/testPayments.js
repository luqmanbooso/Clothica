const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: './config/test.env' });

// Test configuration
const BASE_URL = 'http://localhost:5001';
const TEST_USER_TOKEN = 'test_token_placeholder';

// Mock user data
const mockUser = {
  id: 'test_user_id',
  email: 'test@example.com'
};

// Test payment data
const testPaymentData = {
  amount: 99.99,
  currency: 'LKR',
  orderId: 'test_order_123',
  metadata: {
    description: 'Test payment for Clothica',
    testMode: true
  }
};

async function testPaymentService() {
  console.log('🧪 Testing Payment Service...\n');

  try {
    // Test 1: Payment Gateway Status
    console.log('1️⃣ Testing Payment Gateway Status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/payments/status`);
    console.log('✅ Status Response:', statusResponse.data);
    console.log('');

    // Test 2: Mock Stripe Payment Intent
    console.log('2️⃣ Testing Mock Stripe Payment Intent...');
    const stripeResponse = await axios.post(
      `${BASE_URL}/api/payments/stripe/create-intent`,
      testPaymentData,
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Stripe Response:', stripeResponse.data);
    console.log('');

    // Test 3: Mock PayPal Order
    console.log('3️⃣ Testing Mock PayPal Order...');
    const paypalResponse = await axios.post(
      `${BASE_URL}/api/payments/paypal/create-order`,
      testPaymentData,
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ PayPal Response:', paypalResponse.data);
    console.log('');

    // Test 4: Unified Payment Processing
    console.log('4️⃣ Testing Unified Payment Processing...');
    const unifiedResponse = await axios.post(
      `${BASE_URL}/api/payments/process`,
      {
        ...testPaymentData,
        paymentMethod: 'mock_stripe'
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Unified Payment Response:', unifiedResponse.data);
    console.log('');

    console.log('🎉 All Payment Tests Completed Successfully!');

  } catch (error) {
    console.error('❌ Payment Test Failed:', error.response?.data || error.message);
  }
}

async function testPaymentValidation() {
  console.log('\n🔍 Testing Payment Validation...\n');

  const testCases = [
    {
      name: 'Valid Payment Data',
      data: { amount: 100, currency: 'LKR', paymentMethod: 'stripe' },
      shouldPass: true
    },
    {
      name: 'Invalid Amount (0)',
      data: { amount: 0, currency: 'LKR', paymentMethod: 'stripe' },
      shouldPass: false
    },
    {
      name: 'Missing Currency',
      data: { amount: 100, paymentMethod: 'stripe' },
      shouldPass: false
    },
    {
      name: 'Missing Payment Method',
      data: { amount: 100, currency: 'LKR' },
      shouldPass: false
    }
  ];

  for (const testCase of testCases) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/payments/process`,
        testCase.data,
        {
          headers: {
            'Authorization': `Bearer ${TEST_USER_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (testCase.shouldPass) {
        console.log(`✅ ${testCase.name}: PASSED`);
      } else {
        console.log(`❌ ${testCase.name}: FAILED (should have failed but didn't)`);
      }
    } catch (error) {
      if (testCase.shouldPass) {
        console.log(`❌ ${testCase.name}: FAILED (should have passed)`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
      } else {
        console.log(`✅ ${testCase.name}: PASSED (correctly failed)`);
      }
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Payment System Tests...\n');
  console.log('📋 Test Configuration:');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Mock Payments: ${process.env.ENABLE_MOCK_PAYMENTS}`);
  console.log('');

  // Test payment service functionality
  await testPaymentService();
  
  // Test payment validation
  await testPaymentValidation();

  console.log('\n🏁 Payment System Tests Completed!');
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testPaymentService,
  testPaymentValidation,
  runTests
};






