import { Response, NextFunction } from 'express';
import { AuthRequest } from './authJWT';
import { UserRole } from '../entities/User';
import { AppError } from '../utils/AppError';

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const error = new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
      return res.status(error.statusCode).json(error.toJSON());
    }

    if (!roles.includes(req.user.role as UserRole)) {
      const error = new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
      return res.status(error.statusCode).json(error.toJSON());
    }

    next();
  };
};
