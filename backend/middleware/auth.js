require('dotenv').config()
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'SCMS_SECURITY_ENFORCEMENT_KEY_2026';

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ message: 'Access Denied' });
  }
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { 
    res.status(401).json({ message: 'Invalid Session Token' }); 
  }
};

module.exports = authenticate;