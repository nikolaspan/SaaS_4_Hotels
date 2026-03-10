import { injectable, inject } from 'tsyringe';
import { RoomRepository } from '../repositories/RoomRepository';
import { Room } from '../entities/Room';
import { AppError } from '../utils/AppError';
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto';

@injectable()
export class RoomService {
  constructor(@inject(RoomRepository) private roomRepository: RoomRepository) {}

  async getAllRooms(): Promise<Room[]> {
    return this.roomRepository.findAll();
  }

  async getRoomById(id: number): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new AppError(404, 'ROOM_NOT_FOUND', 'Room not found');
    }
    return room;
  }

  async createRoom(data: CreateRoomDto): Promise<Room> {
    const existingRoom = await this.roomRepository.findByRoomNumber(data.roomNumber);
    if (existingRoom) {
      throw new AppError(409, 'ROOM_NUMBER_EXISTS', 'Room number already exists');
    }

    return this.roomRepository.create(data);
  }

  async updateRoom(id: number, data: UpdateRoomDto): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new AppError(404, 'ROOM_NOT_FOUND', 'Room not found');
    }

    if (data.roomNumber && data.roomNumber !== room.roomNumber) {
      const existingRoom = await this.roomRepository.findByRoomNumber(data.roomNumber);
      if (existingRoom) {
        throw new AppError(409, 'ROOM_NUMBER_EXISTS', 'Room number already exists');
      }
    }

    const updatedRoom = await this.roomRepository.update(id, data);
    if (!updatedRoom) {
      throw new AppError(404, 'ROOM_NOT_FOUND', 'Room not found');
    }

    return updatedRoom;
  }

  async deleteRoom(id: number): Promise<void> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new AppError(404, 'ROOM_NOT_FOUND', 'Room not found');
    }

    await this.roomRepository.delete(id);
  }
}
