import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: [],
    },
  });
};
