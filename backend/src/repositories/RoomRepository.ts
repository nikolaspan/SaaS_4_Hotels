import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Room } from '../entities/Room';

@injectable()
export class RoomRepository {
  private repository: Repository<Room>;

  constructor() {
    this.repository = AppDataSource.getRepository(Room);
  }

  async findAll(): Promise<Room[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<Room | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByRoomNumber(roomNumber: string): Promise<Room | null> {
    return this.repository.findOne({ where: { roomNumber } });
  }

  async create(room: Partial<Room>): Promise<Room> {
    const newRoom = this.repository.create(room);
    return this.repository.save(newRoom);
  }

  async update(id: number, data: Partial<Room>): Promise<Room | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
