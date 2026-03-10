import { Router, Response } from 'express';
import { container } from 'tsyringe';
import { BookingService } from '../services/BookingService';
import { CreateBookingDto, UpdateBookingDto } from '../dto/booking.dto';
import { validateDto } from '../utils/validation';
import { authJWT, AuthRequest } from '../middleware/authJWT';
import { BookingStatus } from '../entities/Booking';

export class BookingController {
  public router: Router;
  private bookingService: BookingService;

  constructor() {
    this.router = Router();
    this.bookingService = container.resolve(BookingService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authJWT);

    this.router.get('/', this.getAllBookings.bind(this));
    this.router.post('/', this.createBooking.bind(this));
    this.router.put('/:id', this.updateBooking.bind(this));
    this.router.delete('/:id', this.deleteBooking.bind(this));
  }

  private async getAllBookings(req: AuthRequest, res: Response) {
    try {
      const { from, to, status, page, limit } = req.query;

      const filters: any = {};
      if (from) filters.from = from as string;
      if (to) filters.to = to as string;
      if (status) filters.status = status as BookingStatus;
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await this.bookingService.getAllBookings(filters);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  private async createBooking(req: AuthRequest, res: Response) {
    try {
      const dto = await validateDto(CreateBookingDto, req.body);
      const booking = await this.bookingService.createBooking(dto);
      res.status(201).json(booking);
    } catch (error) {
      throw error;
    }
  }

  private async updateBooking(req: AuthRequest, res: Response) {
    try {
      const dto = await validateDto(UpdateBookingDto, req.body);
      const booking = await this.bookingService.updateBooking(parseInt(req.params.id), dto);
      res.json(booking);
    } catch (error) {
      throw error;
    }
  }

  private async deleteBooking(req: AuthRequest, res: Response) {
    try {
      await this.bookingService.deleteBooking(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
