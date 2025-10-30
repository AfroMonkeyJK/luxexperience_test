import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info', // Configurable log level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Include stack traces for errors
    format.colorize({ all: true }), // Add colors to console output
    format.printf(({ level, message, timestamp, stack }) => {
      // Include stack trace if available (for errors)
      const logMessage = stack || message;
      return `[${timestamp}] ${level.toUpperCase()}: ${logMessage}`;
    })
  ),
  transports: [
    // Console transport with colors
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ level, message, timestamp, stack }) => {
          const logMessage = stack || message;
          return `[${timestamp}] ${level}: ${logMessage}`;
        })
      )
    }),
    // File transport (no colors for file)
    new transports.File({
      filename: 'playwright.log',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ level, message, timestamp, stack }) => {
          const logMessage = stack || message;
          return `[${timestamp}] ${level.toUpperCase()}: ${logMessage}`;
        })
      )
    }),
    // Separate error log file
    new transports.File({
      filename: 'errors.log',
      level: 'error',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.printf(({ level, message, timestamp, stack }) => {
          const logMessage = stack || message;
          return `[${timestamp}] ${level.toUpperCase()}: ${logMessage}`;
        })
      )
    })
  ],
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new transports.File({ filename: 'exceptions.log' })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'rejections.log' })
  ]
});
// Add custom methods for better usability
logger.success = (message) => logger.info(`✅ ${message}`);
logger.failure = (message) => logger.error(`❌ ${message}`);
logger.step = (message) => logger.info(`🔍 ${message}`);
logger.result = (message) => logger.info(`📊 ${message}`);
if (process.env.NODE_ENV === 'qa') {
  logger.add(new transports.Console({
    level: 'debug',
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

export default logger;
