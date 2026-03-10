import { injectable, inject } from 'tsyringe';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/AppError';
import { User } from '../entities/User';

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

@injectable()
export class AuthService {
  constructor(@inject(UserRepository) private userRepository: UserRepository) {}

  async login(username: string, password: string): Promise<{ accessToken: string; user: User }> {
    const user = await this.userRepository.findByUsername(username);

    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
    }

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    return { accessToken, user };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      return payload;
    } catch (error) {
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
