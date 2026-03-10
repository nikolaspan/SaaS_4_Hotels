import { injectable } from 'tsyringe';
import { Repository, Between, Not } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Booking, BookingStatus } from '../entities/Booking';

@injectable()
export class BookingRepository {
  private repository: Repository<Booking>;

  constructor() {
    this.repository = AppDataSource.getRepository(Booking);
  }

  async findAll(filters?: {
    from?: Date;
    to?: Date;
    status?: BookingStatus;
    page?: number;
    limit?: number;
  }): Promise<{ bookings: Booking[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.from && filters?.to) {
      // Bookings that overlap with the date range
      where.checkInDate = Between(filters.from, filters.to);
    } else if (filters?.from) {
      where.checkOutDate = Between(filters.from, new Date('2100-01-01'));
    } else if (filters?.to) {
      where.checkInDate = Between(new Date('1900-01-01'), filters.to);
    }

    const [bookings, total] = await this.repository.findAndCount({
      where,
      relations: ['room', 'guest'],
      skip,
      take: limit,
      order: { checkInDate: 'DESC' },
    });

    return { bookings, total };
  }

  async findById(id: number): Promise<Booking | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['room', 'guest'],
    });
  }

  async findOverlapping(
    roomId: number,
    checkInDate: Date,
    checkOutDate: Date,
    excludeBookingId?: number
  ): Promise<Booking[]> {
    const query = this.repository
      .createQueryBuilder('booking')
      .where('booking.roomId = :roomId', { roomId })
      .andWhere('booking.status != :cancelledStatus', { cancelledStatus: BookingStatus.CANCELLED })
      .andWhere('booking.checkInDate < :checkOutDate', { checkOutDate })
      .andWhere('booking.checkOutDate > :checkInDate', { checkInDate });

    if (excludeBookingId) {
      query.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    return query.getMany();
  }

  async create(booking: Partial<Booking>): Promise<Booking> {
    const newBooking = this.repository.create(booking);
    return this.repository.save(newBooking);
  }

  async update(id: number, data: Partial<Booking>): Promise<Booking | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async cancel(id: number): Promise<Booking | null> {
    await this.repository.update(id, { status: BookingStatus.CANCELLED });
    return this.findById(id);
  }
}
