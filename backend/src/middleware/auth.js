const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes with JWT verification
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Authentication token required',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'agritech_jwt_secure_secret_token_key_2026'
    );

    // Try finding user in MongoDB if connected
    let user;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // In case MongoDB is offline or in fallback mode
    }

    // If user found in DB, use it; otherwise construct session from verified JWT payload
    req.user = user || {
      _id: decoded.id,
      name: decoded.name || 'Agri User',
      email: decoded.email,
      role: decoded.role || 'farmer',
      language: decoded.language || 'en',
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.',
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to Agri-Tech administrators only',
    });
  }
  next();
};

module.exports = { protect, authorize, adminOnly };
