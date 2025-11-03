import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.colorize({ all: true }),
    format.printf(({ level, message, timestamp, stack }) => {
      const logMessage = stack || message;
      return `[${timestamp}] ${level.toUpperCase()}: ${logMessage}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ level, message, timestamp, stack }) => {
          const logMessage = stack || message;
          return `[${timestamp}] ${level}: ${logMessage}`;
        })
      ),
    }),
    new transports.File({
      filename: "test-results/playwright.log",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ level, message, timestamp, stack }) => {
          const logMessage = stack || message;
          return `[${timestamp}] ${level.toUpperCase()}: ${logMessage}`;
        })
      ),
    }),
    new transports.File({
      filename: "test-results/errors.log",
      level: "error",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.printf(({ level, message, timestamp, stack }) => {
          const logMessage = stack || message;
          return `[${timestamp}] ${level.toUpperCase()}: ${logMessage}`;
        })
      ),
    }),
  ],
});

logger.success = (message) => logger.info(` ${message}`);
logger.failure = (message) => logger.error(` ${message}`);
logger.step = (message) => logger.info(`🔹 ${message}`);

export default logger;
