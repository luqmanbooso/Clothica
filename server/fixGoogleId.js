const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import User model
const User = require('./models/User');

async function fixGoogleId() {
  try {
    console.log('🔍 Looking for user: cryptonkadet@gmail.com');
    
    // Find the user by email
    const user = await User.findOne({ email: 'cryptonkadet@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      currentGoogleId: user.googleId,
      isGoogleAccount: user.isGoogleAccount
    });
    
    // Update with the real Google ID from the logs
    const realGoogleId = '1066612180'; // This is what Google is sending
    
    console.log('🔄 Updating Google ID from:', user.googleId, 'to:', realGoogleId);
    
    user.googleId = realGoogleId;
    await user.save();
    
    console.log('✅ Google ID updated successfully!');
    console.log('🔄 New user data:', {
      id: user._id,
      googleId: user.googleId,
      email: user.email
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the fix
fixGoogleId();
