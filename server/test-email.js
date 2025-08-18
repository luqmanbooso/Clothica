#!/usr/bin/env node

/**
 * Email Service Test Script
 * 
 * This script tests the email service functionality
 * Run with: node test-email.js
 */

require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailService() {
  console.log('🧪 Testing Clothica Email Service...\n');

  // 1. Check service status
  console.log('📊 Service Status:');
  const status = emailService.getStatus();
  console.log(JSON.stringify(status, null, 2));
  console.log('');

  // 2. Test basic email functionality
  if (status.hasTransporter) {
    console.log('📧 Testing email functionality...');
    
    try {
      // Test with a sample email (replace with your email for testing)
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      console.log(`Sending test email to: ${testEmail}`);
      
      const result = await emailService.testEmail(testEmail);
      console.log('✅ Test email sent successfully!');
      console.log('Result:', result);
      
    } catch (error) {
      console.error('❌ Test email failed:', error.message);
      
      if (error.message.includes('Mock Email Sent')) {
        console.log('ℹ️  This is expected in development mode with mock emails enabled');
      }
    }
  } else {
    console.log('⚠️  Email transporter not available');
  }

  console.log('\n🔍 Configuration Summary:');
  console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- SMTP User: ${process.env.SMTP_USER ? 'Configured' : 'Not configured'}`);
  console.log(`- SMTP Pass: ${process.env.SMTP_PASS ? 'Configured' : 'Not configured'}`);
  console.log(`- PDF Invoices: ${process.env.ENABLE_PDF_INVOICES === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`- Mock Emails: ${process.env.ENABLE_MOCK_EMAILS === 'true' ? 'Enabled' : 'Disabled'}`);

  console.log('\n📚 Next Steps:');
  if (!status.smtpConfigured) {
    console.log('1. Configure SMTP settings in your .env file');
    console.log('2. See EMAIL_SETUP.md for detailed instructions');
    console.log('3. For Gmail: Use app passwords or OAuth2');
  } else {
    console.log('1. Test order creation to verify invoice emails');
    console.log('2. Check your email for test messages');
    console.log('3. Monitor server logs for email delivery status');
  }

  console.log('\n✨ Email service test completed!');
}

// Run the test
testEmailService().catch(console.error);
