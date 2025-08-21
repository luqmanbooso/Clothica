#!/usr/bin/env node

/**
 * Google OAuth Debug Script
 * 
 * This script helps debug Google OAuth issues
 */

require('dotenv').config();

console.log('🔍 Google OAuth Debug Information\n');

// Check environment variables
console.log('📊 Server Environment:');
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID || 'NOT SET'}`);
console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

console.log('\n🔍 Client ID Analysis:');
if (process.env.GOOGLE_CLIENT_ID) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  console.log(`Full Client ID: ${clientId}`);
  console.log(`Project Number: ${clientId.split('-')[0]}`);
  console.log(`Client Suffix: ${clientId.split('-')[1]}`);
  console.log(`Domain: ${clientId.split('.')[1]}.${clientId.split('.')[2]}`);
}

console.log('\n🚨 Current Error Analysis:');
console.log('Error: "The given origin is not allowed for the given client ID"');
console.log('This means:');
console.log('1. Your client ID is correct (516114873446-8698tbh84j0ik...)');
console.log('2. But http://localhost:3000 is NOT in authorized origins');
console.log('3. Or you\'re editing the wrong OAuth client');

console.log('\n✅ Solution Steps:');
console.log('1. Go to: https://console.cloud.google.com/');
console.log('2. Select project: 516114873446');
console.log('3. Go to: APIs & Services > Credentials');
console.log('4. Find OAuth client with ID: 516114873446-8698tbh84j0ik...');
console.log('5. Click on it to edit');
console.log('6. Add to Authorized JavaScript origins: http://localhost:3000');
console.log('7. Save changes');
console.log('8. Wait 5-10 minutes');
console.log('9. Clear browser cache and restart app');

console.log('\n⚠️  Common Mistakes:');
console.log('- Editing wrong OAuth client');
console.log('- Wrong project selected');
console.log('- Not saving changes');
console.log('- Not waiting for propagation');
console.log('- Wrong origin format (missing http://)');

console.log('\n🧪 Test After Fix:');
console.log('1. Restart your React app');
console.log('2. Clear browser cache');
console.log('3. Try Google login again');
console.log('4. Check browser console for new errors');

console.log('\n✨ Debug completed!');


