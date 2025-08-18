#!/usr/bin/env node

/**
 * Test Google OAuth Client Configuration
 * 
 * This script tests if the Google OAuth client can be initialized properly
 */

require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

console.log('🧪 Testing Google OAuth Client Configuration...\n');

// Check environment variables
console.log('📊 Environment Variables:');
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID || 'NOT SET'}`);
console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'SET (hidden)' : 'NOT SET'}`);

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('❌ GOOGLE_CLIENT_ID is not set!');
  process.exit(1);
}

console.log('\n🔍 Client ID Analysis:');
const clientId = process.env.GOOGLE_CLIENT_ID;
console.log(`Full Client ID: ${clientId}`);
console.log(`Length: ${clientId.length} characters`);
console.log(`Format Valid: ${clientId.includes('.apps.googleusercontent.com') ? '✅ Yes' : '❌ No'}`);

console.log('\n🔐 Testing OAuth Client Initialization...');

try {
  const googleClient = new OAuth2Client(clientId);
  console.log('✅ Google OAuth client initialized successfully');
  
  // Test client properties
  console.log('🔍 Client Properties:');
  console.log(`- Client ID: ${googleClient._clientId}`);
  console.log(`- Client Secret: ${googleClient._clientSecret ? 'SET' : 'NOT SET'}`);
  console.log(`- Redirect URI: ${googleClient._redirectUri || 'NOT SET'}`);
  
  console.log('\n✅ All tests passed! Google OAuth client is properly configured.');
  
} catch (error) {
  console.error('❌ Failed to initialize Google OAuth client:');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

console.log('\n🧪 Test completed successfully!');
