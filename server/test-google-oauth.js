#!/usr/bin/env node

/**
 * Google OAuth Configuration Test Script
 * 
 * This script tests your Google OAuth setup
 * Run with: node test-google-oauth.js
 */

require('dotenv').config();

console.log('🧪 Testing Google OAuth Configuration...\n');

// Check environment variables
console.log('📊 Environment Variables:');
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

console.log('\n🔍 Google OAuth Client ID Format:');
if (process.env.GOOGLE_CLIENT_ID) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  console.log(`Client ID: ${clientId.substring(0, 20)}...${clientId.substring(clientId.length - 10)}`);
  console.log(`Length: ${clientId.length} characters`);
  console.log(`Format: ${clientId.includes('.apps.googleusercontent.com') ? '✅ Valid' : '❌ Invalid format'}`);
} else {
  console.log('❌ GOOGLE_CLIENT_ID not set');
}

console.log('\n📱 Frontend Configuration Needed:');
console.log('In your client/.env file, you need:');
console.log('REACT_APP_GOOGLE_CLIENT_ID=your-frontend-client-id');

console.log('\n🌐 Google Cloud Console Setup:');
console.log('1. Go to: https://console.cloud.google.com/');
console.log('2. Select your project');
console.log('3. Go to APIs & Services > Credentials');
console.log('4. Create TWO OAuth 2.0 clients:');

console.log('\n   📱 Frontend Client (for React app):');
console.log('   - Type: Web application');
console.log('   - Authorized JavaScript origins: http://localhost:3000');
console.log('   - Authorized redirect URIs: http://localhost:3000');

console.log('\n   🔧 Backend Client (for server):');
console.log('   - Type: Web application');
console.log('   - Authorized JavaScript origins: http://localhost:5000');
console.log('   - Authorized redirect URIs: http://localhost:5000/api/auth/google/callback');

console.log('\n⚠️  Important Notes:');
console.log('- Frontend and backend need DIFFERENT client IDs');
console.log('- Wait 5-10 minutes after saving changes');
console.log('- Clear browser cache after changes');
console.log('- Restart both client and server after changes');

console.log('\n🧪 Testing Steps:');
console.log('1. Fix Google Cloud Console configuration');
console.log('2. Update environment variables');
console.log('3. Restart server and client');
console.log('4. Try Google login again');
console.log('5. Check browser console for detailed logs');

console.log('\n✨ Google OAuth test completed!');


