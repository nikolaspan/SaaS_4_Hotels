import { Router, Response } from 'express';
import { container } from 'tsyringe';
import { GuestService } from '../services/GuestService';
import { CreateGuestDto, UpdateGuestDto } from '../dto/guest.dto';
import { validateDto } from '../utils/validation';
import { authJWT, AuthRequest } from '../middleware/authJWT';

export class GuestController {
  public router: Router;
  private guestService: GuestService;

  constructor() {
    this.router = Router();
    this.guestService = container.resolve(GuestService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authJWT);

    this.router.get('/', this.getAllGuests.bind(this));
    this.router.post('/', this.createGuest.bind(this));
    this.router.put('/:id', this.updateGuest.bind(this));
    this.router.delete('/:id', this.deleteGuest.bind(this));
  }

  private async getAllGuests(req: AuthRequest, res: Response) {
    try {
      const guests = await this.guestService.getAllGuests();
      res.json(guests);
    } catch (error) {
      throw error;
    }
  }

  private async createGuest(req: AuthRequest, res: Response) {
    try {
      const dto = await validateDto(CreateGuestDto, req.body);
      const guest = await this.guestService.createGuest(dto);
      res.status(201).json(guest);
    } catch (error) {
      throw error;
    }
  }

  private async updateGuest(req: AuthRequest, res: Response) {
    try {
      const dto = await validateDto(UpdateGuestDto, req.body);
      const guest = await this.guestService.updateGuest(parseInt(req.params.id), dto);
      res.json(guest);
    } catch (error) {
      throw error;
    }
  }

  private async deleteGuest(req: AuthRequest, res: Response) {
    try {
      await this.guestService.deleteGuest(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
