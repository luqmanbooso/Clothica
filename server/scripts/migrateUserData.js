const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function migrateUserData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothica');
    console.log('Connected to MongoDB');
    
    // Run the migration
    const result = await User.migrateUserData();
    console.log('Migration result:', result);
    
    // Verify the migration by checking a few users
    const users = await User.find({}).limit(5);
    console.log('\nSample users after migration:');
    users.forEach(user => {
      console.log(`User: ${user.name}`);
      console.log(`  loyaltyMembership: ${user.loyaltyMembership}`);
      console.log(`  loyaltyTier: ${user.loyaltyTier}`);
      console.log(`  lastLoginDate: ${user.lastLoginDate}`);
      console.log(`  lastLogin: ${user.lastLogin}`);
      console.log(`  loyaltyPoints: ${user.loyaltyPoints}`);
      console.log(`  currentBadge: ${user.currentBadge}`);
      console.log(`  spinChances: ${user.spinChances}`);
      console.log(`  spinsUsed: ${user.spinsUsed}`);
      console.log('---');
    });
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateUserData();
}

module.exports = migrateUserData;
