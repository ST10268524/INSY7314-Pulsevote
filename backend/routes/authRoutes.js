import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { securityLogger, appLogger } from '../config/logger.js';

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 */
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  
  // Validation
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password, and email are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ 
        message: userExists.username === username ? 'Username already exists' : 'Email already exists' 
      });
    }
    
    const user = await User.create({ username, password, email });
    user.lastLogin = new Date();
    await user.save();
    
    // Log successful registration
    appLogger.userRegistered(user._id, user.username);
    
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    if (user.isLocked) {
      return res.status(423).json({ message: 'Account is temporarily locked due to too many failed attempts' });
    }
    
    const isMatch = await user.matchPassword(password);
    
    if (isMatch) {
      // Reset login attempts on successful login
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = new Date();
      await user.save();
      
      // Log successful login
      securityLogger.loginAttempt(username, true, req.ip);
      
      res.json({ 
        _id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        token: generateToken(user._id) 
      });
    } else {
      // Increment login attempts
      await user.incrementLoginAttempts();
      
      // Log failed login attempt
      securityLogger.loginAttempt(username, false, req.ip);
      
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 */
router.get('/profile', protect, async (req, res) => {
  try {
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

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 */
router.post('/logout', protect, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
