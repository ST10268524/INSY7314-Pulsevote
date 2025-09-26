import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'pulsevote-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      )
    }),

    // File transport for all logs
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
      )
    }),

    // File transport for error logs only
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
      )
    }),

    // File transport for access logs
    new DailyRotateFile({
      filename: 'logs/access-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(
        timestamp(),
        json()
      )
    })
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Create a stream for Morgan HTTP logging
export const morganStream = {
  write: (message) => {
    logger.info(message.trim(), { type: 'http' });
  }
};

// Logging middleware for Express
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Security event logger
export const securityLogger = {
  loginAttempt: (username, success, ip) => {
    logger.info('Login attempt', {
      type: 'security',
      event: 'login_attempt',
      username,
      success,
      ip
    });
  },

  accountLocked: (username, ip) => {
    logger.warn('Account locked', {
      type: 'security',
      event: 'account_locked',
      username,
      ip
    });
  },

  rateLimitExceeded: (ip, endpoint) => {
    logger.warn('Rate limit exceeded', {
      type: 'security',
      event: 'rate_limit_exceeded',
      ip,
      endpoint
    });
  },

  unauthorizedAccess: (ip, endpoint, reason) => {
    logger.warn('Unauthorized access attempt', {
      type: 'security',
      event: 'unauthorized_access',
      ip,
      endpoint,
      reason
    });
  }
};

// Application event logger
export const appLogger = {
  userRegistered: (userId, username) => {
    logger.info('User registered', {
      type: 'application',
      event: 'user_registered',
      userId,
      username
    });
  },

  pollCreated: (pollId, userId) => {
    logger.info('Poll created', {
      type: 'application',
      event: 'poll_created',
      pollId,
      userId
    });
  },

  pollVoted: (pollId, userId, option) => {
    logger.info('Poll voted', {
      type: 'application',
      event: 'poll_voted',
      pollId,
      userId,
      option
    });
  },

  databaseError: (operation, error) => {
    logger.error('Database error', {
      type: 'database',
      event: 'database_error',
      operation,
      error: error.message,
      stack: error.stack
    });
  }
};

export default logger;
