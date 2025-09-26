/**
 * Authentication Middleware
 * 
 * Provides JWT-based authentication and authorization middleware functions.
 * Includes token verification, user validation, and role-based access control.
 * 
 * @author PulseVote Team
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and validates user account status
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = async (req, res, next) => {
  // Extract token from Authorization header (Bearer token)
  let token = req.headers.authorization?.split(' ')[1];
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID, excluding password field
    const user = await User.findById(decoded.id).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ message: 'Account is temporarily locked' });
    }
    
    // Add user to request object for use in route handlers
    req.user = user;
    next();
  } catch (err) {
    // Handle different JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Token invalid' });
  }
};

/**
 * Authorization middleware factory
 * Creates middleware to check if user has required roles
 * 
 * @param {...string} roles - Required roles for access
 * @returns {Function} - Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check if user has any of the required roles
    if (!req.user.hasAnyRole(roles)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    
    next();
  };
};

// ============================================================================
// PREDEFINED AUTHORIZATION MIDDLEWARE
// ============================================================================

// Require admin role
const requireAdmin = authorize('admin');

// Require moderator or admin role
const requireModerator = authorize('moderator', 'admin');

// Require any authenticated user role
const requireUser = authorize('user', 'moderator', 'admin');

// ============================================================================
// EXPORTS
// ============================================================================

export { protect, authorize, requireAdmin, requireModerator, requireUser };
export default protect;
