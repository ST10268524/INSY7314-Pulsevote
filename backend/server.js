import express from "express";
import https from "https";
import fs from "fs";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import setupSwagger from "./config/swagger.js";
import logger, { morganStream, requestLogger } from "./config/logger.js";

dotenv.config();
const app = express();
connectDB();

app.use(express.json());
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", process.env.CLIENT_URL || "http://localhost:5173"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined
  }
}));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(morgan("combined", { stream: morganStream }));
app.use(requestLogger);
app.use(compression());
// General rate limiting
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}));

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply auth rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
setupSwagger(app);

app.get('/', (req, res) => res.send('PulseVote backend API running securely ✅'));

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(500).json({ message: 'Server Error' });
});

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

// Start HTTPS server if certificates exist
if (process.env.NODE_ENV === 'production' && fs.existsSync('./certs/server.crt') && fs.existsSync('./certs/server.key')) {
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
