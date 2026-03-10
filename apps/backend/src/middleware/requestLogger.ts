import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import crypto from 'crypto';

// Hash IP address for privacy
const hashIP = (ip: string | undefined): string => {
  if (!ip) return 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log request
  const requestLog = {
    method: req.method,
    path: req.path,
    query: req.query,
    ipHash: hashIP(req.ip),
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  };

  // Skip logging for health checks in production
  if (req.path === '/health' && process.env.NODE_ENV === 'production') {
    return next();
  }

  logger.info('Incoming request', requestLog);

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const duration = Date.now() - startTime;

    // Log response
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ipHash: hashIP(req.ip)
    });

    return originalSend.call(this, data);
  };

  next();
};
