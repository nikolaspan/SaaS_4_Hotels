import { injectable, inject } from 'tsyringe';
import { UserRepository } from '../repositories/UserRepository';
import { AuthService } from './AuthService';
import { User } from '../entities/User';
import { AppError } from '../utils/AppError';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(AuthService) private authService: AuthService
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }
    return user;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByUsername(data.username);
    if (existingUser) {
      throw new AppError(409, 'USERNAME_EXISTS', 'Username already exists');
    }

    const passwordHash = await this.authService.hashPassword(data.password);

    const user = await this.userRepository.create({
      name: data.name,
      username: data.username,
      passwordHash,
      role: data.role,
    });

    return user;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    if (data.username && data.username !== user.username) {
      const existingUser = await this.userRepository.findByUsername(data.username);
      if (existingUser) {
        throw new AppError(409, 'USERNAME_EXISTS', 'Username already exists');
      }
    }

    const updateData: Partial<User> = {
      ...data,
    };

    if (data.password) {
      updateData.passwordHash = await this.authService.hashPassword(data.password);
      delete (updateData as any).password;
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return updatedUser;
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await this.userRepository.deactivate(id);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }
    return user;
  }
}
