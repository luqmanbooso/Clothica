const { auth } = require('./auth');

const admin = async (req, res, next) => {
  try {
    // First authenticate the user
    await new Promise((resolve, reject) => {
      auth(req, res, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    // If we get here, user is authenticated and is admin
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication error' 
    });
  }
};

module.exports = { admin };
