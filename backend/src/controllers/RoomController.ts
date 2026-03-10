import { Router, Response } from 'express';
import { container } from 'tsyringe';
import { RoomService } from '../services/RoomService';
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto';
import { validateDto } from '../utils/validation';
import { authJWT, AuthRequest } from '../middleware/authJWT';

export class RoomController {
  public router: Router;
  private roomService: RoomService;

  constructor() {
    this.router = Router();
    this.roomService = container.resolve(RoomService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authJWT);

    this.router.get('/', this.getAllRooms.bind(this));
    this.router.post('/', this.createRoom.bind(this));
    this.router.put('/:id', this.updateRoom.bind(this));
    this.router.delete('/:id', this.deleteRoom.bind(this));
  }

  private async getAllRooms(req: AuthRequest, res: Response) {
    try {
      const rooms = await this.roomService.getAllRooms();
      res.json(rooms);
    } catch (error) {
      throw error;
    }
  }

  private async createRoom(req: AuthRequest, res: Response) {
    try {
      const dto = await validateDto(CreateRoomDto, req.body);
      const room = await this.roomService.createRoom(dto);
      res.status(201).json(room);
    } catch (error) {
      throw error;
    }
  }

  private async updateRoom(req: AuthRequest, res: Response) {
    try {
      const dto = await validateDto(UpdateRoomDto, req.body);
      const room = await this.roomService.updateRoom(parseInt(req.params.id), dto);
      res.json(room);
    } catch (error) {
      throw error;
    }
  }

  private async deleteRoom(req: AuthRequest, res: Response) {
    try {
      await this.roomService.deleteRoom(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}
