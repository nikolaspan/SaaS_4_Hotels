import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

@injectable()
export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return this.repository.save(newUser);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deactivate(id: string): Promise<User | null> {
    await this.repository.update(id, { isActive: false });
    return this.findById(id);
  }
}
