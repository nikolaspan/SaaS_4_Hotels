import { Router, Response } from 'express';
import { container } from 'tsyringe';
import { AuthService } from '../services/AuthService';
import { LoginDto } from '../dto/auth.dto';
import { validateDto } from '../utils/validation';
import { authJWT, AuthRequest } from '../middleware/authJWT';

export class AuthController {
  public router: Router;
  private authService: AuthService;

  constructor() {
    this.router = Router();
    this.authService = container.resolve(AuthService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/login', this.login.bind(this));
    this.router.post('/logout', this.logout.bind(this));
    this.router.get('/me', authJWT, this.getCurrentUser.bind(this));
  }

  private async login(req: AuthRequest, res: Response) {
    try {
      const dto = await validateDto(LoginDto, req.body);
      const { accessToken, user } = await this.authService.login(dto.username, dto.password);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  private async logout(req: AuthRequest, res: Response) {
    res.clearCookie('accessToken');
    res.json({ message: 'Logged out successfully' });
  }

  private async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const user = await this.authService.getCurrentUser(req.user!.userId);
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      throw error;
    }
  }
}
