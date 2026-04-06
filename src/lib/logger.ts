/**
 * Production-safe logger utility
 * Removes console logs in production while maintaining them in development
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Logger interface for type-safe logging
 */
interface Logger {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

/**
 * Create a production-safe logger
 * In production, logs only errors to external service
 * In development, uses native console
 */
const createLogger = (): Logger => {
  if (isDevelopment || isTest) {
    // In development, use native console
    return {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    };
  }

  // In production, suppress most logs except errors
  return {
    log: () => {}, // Silent in production
    warn: () => {}, // Silent in production
    info: () => {}, // Silent in production
    debug: () => {}, // Silent in production
    error: (...args: unknown[]) => {
      // In production, log errors to external service
      // For now, still use console.error but this should be replaced
      // with a proper error tracking service like Sentry
      console.error(...args);
      
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(args[0]);
    },
  };
};

export const logger = createLogger();

/**
 * Create a namespaced logger for better organization
 * @param namespace - The namespace for the logger (e.g., 'api', 'component', 'service')
 */
export const createNamespacedLogger = (namespace: string): Logger => {
  const baseLogger = createLogger();
  
  return {
    log: (...args: unknown[]) => baseLogger.log(`[${namespace}]`, ...args),
    error: (...args: unknown[]) => baseLogger.error(`[${namespace}]`, ...args),
    warn: (...args: unknown[]) => baseLogger.warn(`[${namespace}]`, ...args),
    info: (...args: unknown[]) => baseLogger.info(`[${namespace}]`, ...args),
    debug: (...args: unknown[]) => baseLogger.debug(`[${namespace}]`, ...args),
  };
};

export default logger;
