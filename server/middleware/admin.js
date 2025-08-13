const { auth } = require('./auth');

const admin = async (req, res, next) => {
  try {
    await auth(req, res, next);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
};

module.exports = { admin };
