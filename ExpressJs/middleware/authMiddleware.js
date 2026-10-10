import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'healpoint_jwt_super_secure_secret_key_2026';

/**
 * Middleware to verify JWT Authentication Token
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check if session user exists in headers or query for fallback
    const customUserId = req.headers['x-user-id'];
    const customRole = req.headers['x-user-role'];
    
    if (customUserId && customRole) {
      req.user = {
        user_id: Number(customUserId),
        role: customRole.toUpperCase()
      };
      return next();
    }
    
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
};

/**
 * Middleware to restrict access to ADMIN role only
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Administrator privileges required.'
    });
  }
  next();
};

/**
 * Middleware to restrict access to DOCTOR role only
 */
export const requireDoctor = (req, res, next) => {
  if (!req.user || (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Doctor access required.'
    });
  }
  next();
};

/**
 * Middleware to restrict access to PATIENT role only
 */
export const requirePatient = (req, res, next) => {
  if (!req.user || (req.user.role !== 'PATIENT' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Patient access required.'
    });
  }
  next();
};

/**
 * Middleware to optionally decode authentication token if provided
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) {}
  } else {
    const customUserId = req.headers['x-user-id'];
    const customRole = req.headers['x-user-role'];
    if (customUserId && customRole) {
      req.user = {
        user_id: Number(customUserId),
        role: customRole.toUpperCase()
      };
    }
  }
  next();
};

export { JWT_SECRET };
