import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

//  Custom Error Class 
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global Error Handler Middleware 
// Must have 4 params for Express to recognize as error handler
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log operational and system errors
  const meta = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: err.stack,
  };

  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`, meta);
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Prisma not found error (P2025)
  if ((err as any).code === 'P2025') {
    logger.warn('Resource not found via Prisma (P2025)', meta);
    res.status(404).json({ success: false, error: 'Không tìm thấy công việc' });
    return;
  }

  // Log unhandled exceptions with ERROR level
  logger.error(`System Error: ${err.message}`, meta);

  res.status(500).json({
    success: false,
    error: 'Lỗi máy chủ nội bộ',
  });
}
