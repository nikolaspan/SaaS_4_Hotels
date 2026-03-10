import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { RoomController } from './controllers/RoomController';
import { GuestController } from './controllers/GuestController';
import { BookingController } from './controllers/BookingController';
import { errorHandler } from './middleware/errorHandler';
import { setupContainer } from './config/container';

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeDependencyInjection();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeDependencyInjection() {
    setupContainer();
  }

  private initializeRoutes() {
    const authController = new AuthController();
    const userController = new UserController();
    const roomController = new RoomController();
    const guestController = new GuestController();
    const bookingController = new BookingController();

    this.app.use('/auth', authController.router);
    this.app.use('/users', userController.router);
    this.app.use('/rooms', roomController.router);
    this.app.use('/guests', guestController.router);
    this.app.use('/bookings', bookingController.router);

    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public listen(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
