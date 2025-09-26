/**
 * Authentication Routes
 * 
 * Handles user authentication endpoints including registration, login,
 * profile management, and logout functionality.
 * 
 * Features:
 * - User registration with validation
 * - Secure login with account locking
 * - JWT token generation
 * - Profile management
 * - Security logging
 * 
 * @author PulseVote Team
 * @version 1.0.0
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { securityLogger, appLogger } from '../config/logger.js';

// Create Express router
const router = express.Router();

/**
 * Generate JWT token for authenticated user
 * @param {string} id - User ID
 * @returns {string} - JWT token
 */
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ============================================================================
// REGISTRATION ENDPOINT
// ============================================================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with username, password, and email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               password:
 *                 type: string
 *                 minLength: 6
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  
  // Input validation
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password, and email are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  try {
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ 
        message: userExists.username === username ? 'Username already exists' : 'Email already exists' 
      });
    }
    
    // Create new user
    const user = await User.create({ username, password, email });
    user.lastLogin = new Date();
    await user.save();
    
    // Log successful registration
    appLogger.userRegistered(user._id, user.username);
    
    // Return user data with JWT token
    res.status(201).json({ 
      _id: user._id, 
      username: user.username, 
      email: user.email,
      role: user.role,
      token: generateToken(user._id) 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// LOGIN ENDPOINT
// ============================================================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates user with username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials or account issues
 *       423:
 *         description: Account locked
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  try {
    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ message: 'Account is temporarily locked due to too many failed attempts' });
    }
    
    // Verify password
    const isMatch = await user.matchPassword(password);
    
    if (isMatch) {
      // Reset login attempts on successful login
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = new Date();
      await user.save();
      
      // Log successful login
      securityLogger.loginAttempt(username, true, req.ip);
      
      // Return user data with JWT token
      res.json({ 
        _id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        token: generateToken(user._id) 
      });
    } else {
      // Increment login attempts for failed login
      await user.incrementLoginAttempts();
      
      // Log failed login attempt
      securityLogger.loginAttempt(username, false, req.ip);
      
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// PROFILE ENDPOINT
// ============================================================================

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Returns the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/profile', protect, async (req, res) => {
  try {
    // Return user profile data (excluding sensitive information)
    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// LOGOUT ENDPOINT
// ============================================================================

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/logout', protect, async (req, res) => {
  try {
    // Note: In a more sophisticated setup, you might want to blacklist the token
    // For now, we rely on client-side token removal
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// EXPORT
// ============================================================================

export default router;
