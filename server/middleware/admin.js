const { auth } = require('./auth');

const admin = (req, res, next) => {
  auth(req, res, (err) => {
    if (err) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    next();
  });
};

module.exports = { admin };
