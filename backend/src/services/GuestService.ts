import { injectable, inject } from 'tsyringe';
import { GuestRepository } from '../repositories/GuestRepository';
import { Guest } from '../entities/Guest';
import { AppError } from '../utils/AppError';
import { CreateGuestDto, UpdateGuestDto } from '../dto/guest.dto';

@injectable()
export class GuestService {
  constructor(@inject(GuestRepository) private guestRepository: GuestRepository) {}

  async getAllGuests(): Promise<Guest[]> {
    return this.guestRepository.findAll();
  }

  async getGuestById(id: number): Promise<Guest> {
    const guest = await this.guestRepository.findById(id);
    if (!guest) {
      throw new AppError(404, 'GUEST_NOT_FOUND', 'Guest not found');
    }
    return guest;
  }

  async createGuest(data: CreateGuestDto): Promise<Guest> {
    return this.guestRepository.create(data);
  }

  async updateGuest(id: number, data: UpdateGuestDto): Promise<Guest> {
    const guest = await this.guestRepository.findById(id);
    if (!guest) {
      throw new AppError(404, 'GUEST_NOT_FOUND', 'Guest not found');
    }

    const updatedGuest = await this.guestRepository.update(id, data);
    if (!updatedGuest) {
      throw new AppError(404, 'GUEST_NOT_FOUND', 'Guest not found');
    }

    return updatedGuest;
  }

  async deleteGuest(id: number): Promise<void> {
    const guest = await this.guestRepository.findById(id);
    if (!guest) {
      throw new AppError(404, 'GUEST_NOT_FOUND', 'Guest not found');
    }

    await this.guestRepository.delete(id);
  }
}
