/**
 * PulseVote Backend Server
 *
 * This is the main entry point for the PulseVote backend API server.
 * It sets up Express.js with security middleware, database connection,
 * authentication, and API routes for the polling application.
 *
 * Features:
 * - JWT-based authentication
 * - Rate limiting and security headers
 * - MongoDB database connection
 * - Swagger API documentation
 * - Comprehensive logging
 * - HTTPS support for production
 *
 * @author PulseVote Team
 * @version 1.0.0
 */

// Core Express and Node.js imports
import express from 'express';
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';

// Security and middleware imports
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Application-specific imports
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import setupSwagger from './config/swagger.js';
import logger, { morganStream, requestLogger } from './config/logger.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Connect to MongoDB database
connectDB();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Parse JSON request bodies
app.use(express.json());

// Security headers using Helmet
app.use(helmet());

// Content Security Policy configuration
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ['\'self\''],
    scriptSrc: ['\'self\'', '\'unsafe-inline\'', 'https://apis.google.com'],
    styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
    fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
    imgSrc: ['\'self\'', 'data:', 'https:'],
    connectSrc: ['\'self\'', process.env.CLIENT_URL || 'http://localhost:5173'],
    frameSrc: ['\'none\''],
    objectSrc: ['\'none\''],
    baseUri: ['\'self\''],
    formAction: ['\'self\''],
    frameAncestors: ['\'none\''],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined
  }
}));

// CORS configuration - allow requests from frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// HTTP request logging using Morgan
app.use(morgan('combined', { stream: morganStream }));

// Custom request logging middleware
app.use(requestLogger);

// Enable gzip compression for responses
app.use(compression());
// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================

// General rate limiting for all routes
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}));

// Stricter rate limiting for authentication routes to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply auth rate limiting to authentication routes
app.use('/api/auth', authLimiter);

// ============================================================================
// API ROUTES
// ============================================================================

// Authentication routes (login, register, profile)
app.use('/api/auth', authRoutes);

// Poll management routes (create, vote, list polls)
app.use('/api/polls', pollRoutes);

// Setup Swagger API documentation
setupSwagger(app);

// Health check endpoint
app.get('/', (req, res) => res.send('PulseVote backend API running securely ✅'));

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handler middleware
app.use((err, req, res, _next) => {
  // Log error details for debugging
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Return generic error message to client
  res.status(500).json({ message: 'Server Error' });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Define server ports
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// Start HTTP server
app.listen(PORT, () => {
  logger.info(`HTTP Server started on port ${PORT}`, {
    type: 'server',
    event: 'server_started',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start HTTPS server if certificates exist (production only)
if (process.env.NODE_ENV === 'production' &&
    fs.existsSync('./certs/server.crt') &&
    fs.existsSync('./certs/server.key')) {

  const httpsOptions = {
    cert: fs.readFileSync('./certs/server.crt'),
    key: fs.readFileSync('./certs/server.key')
  };

  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    logger.info(`HTTPS Server started on port ${HTTPS_PORT}`, {
      type: 'server',
      event: 'https_server_started',
      port: HTTPS_PORT,
      environment: process.env.NODE_ENV
    });
  });
} else if (process.env.NODE_ENV === 'production') {
  logger.warn('HTTPS certificates not found. Running HTTP only in production.', {
    type: 'server',
    event: 'https_certificates_missing'
  });
}
