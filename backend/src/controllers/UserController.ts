import { Router, Response } from 'express';
import { container } from 'tsyringe';
import { UserService } from '../services/UserService';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { validateDto } from '../utils/validation';
import { authJWT, AuthRequest } from '../middleware/authJWT';
import { requireRole } from '../middleware/requireRole';
import { UserRole } from '../entities/User';

export class UserController {
  public router: Router;
  private userService: UserService;

  constructor() {
    this.router = Router();
    this.userService = container.resolve(UserService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authJWT);
    this.router.use(requireRole(UserRole.ADMIN));

    this.router.get('/', this.getAllUsers.bind(this));
    this.router.post('/', this.createUser.bind(this));
    this.router.put('/:id', this.updateUser.bind(this));
    this.router.patch('/:id/deactivate', this.deactivateUser.bind(this));
  }

  private async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      throw error;
    }
  }

  private async createUser(req: AuthRequest, res: Response) {
    try {
      const dto = await validateDto(CreateUserDto, req.body);
      const user = await this.userService.createUser(dto);
      res.status(201).json(user);
    } catch (error) {
      throw error;
    }
  }

  private async updateUser(req: AuthRequest, res: Response) {
    try {
      const dto = await validateDto(UpdateUserDto, req.body);
      const user = await this.userService.updateUser(req.params.id, dto);
      res.json(user);
    } catch (error) {
      throw error;
    }
  }

  private async deactivateUser(req: AuthRequest, res: Response) {
    try {
      const user = await this.userService.deactivateUser(req.params.id);
      res.json(user);
    } catch (error) {
      throw error;
    }
  }
}
