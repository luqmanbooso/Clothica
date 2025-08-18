// Quick database check script
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('🔍 Checking Google accounts...\n');
  
  const googleUsers = await User.find({ isGoogleAccount: true })
    .sort({ createdAt: -1 })
    .select('name email googleId createdAt')
    .limit(3);
  
  googleUsers.forEach((user, index) => {
    const idFormat = user.googleId?.startsWith('google_') ? 'CUSTOM (OLD)' : 'RAW (CORRECT)';
    console.log(`${index + 1}. ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Google ID: ${user.googleId}`);
    console.log(`   Format: ${idFormat}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log('');
  });
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
