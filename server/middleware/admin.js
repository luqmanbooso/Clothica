const { auth } = require('./auth');

const admin = (req, res, next) => {
  // First authenticate the user
  auth(req, res, () => {
    // Check if user is admin
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    // If we get here, user is authenticated and is admin
    next();
  });
};

module.exports = { admin };
