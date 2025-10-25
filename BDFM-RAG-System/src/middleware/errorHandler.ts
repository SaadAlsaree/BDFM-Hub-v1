import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    timestamp: new Date().toISOString(),
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      code: 'NOT_FOUND',
    },
    timestamp: new Date().toISOString(),
  });
}
