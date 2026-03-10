import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AuthService } from '../services/AuthService';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
  };
}

export const authJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.accessToken || authHeader?.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'NO_TOKEN', 'No authentication token provided');
    }

    const authService = container.resolve(AuthService);
    const payload = await authService.verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.toJSON());
    }
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        details: [],
      },
    });
  }
};
