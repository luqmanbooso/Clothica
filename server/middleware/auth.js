const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware processing request to:', req.path);
    console.log('📋 Request headers:', req.headers);
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('🔑 Token received:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token decoded:', { userId: decoded.userId });
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(401).json({ message: 'Token is not valid' });
    }

    console.log('✅ User authenticated:', { id: user._id, email: user.email });
    req.user = user;
    req.user.id = user._id; // Ensure compatibility with existing code
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const admin = async (req, res, next) => {
  try {
    // First authenticate the user
    await auth(req, res, () => {});
    
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    next();
  } catch (error) {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

module.exports = { auth, admin }; 