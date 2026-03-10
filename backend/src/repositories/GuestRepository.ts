import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Guest } from '../entities/Guest';

@injectable()
export class GuestRepository {
  private repository: Repository<Guest>;

  constructor() {
    this.repository = AppDataSource.getRepository(Guest);
  }

  async findAll(): Promise<Guest[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<Guest | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(guest: Partial<Guest>): Promise<Guest> {
    const newGuest = this.repository.create(guest);
    return this.repository.save(newGuest);
  }

  async update(id: number, data: Partial<Guest>): Promise<Guest | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
