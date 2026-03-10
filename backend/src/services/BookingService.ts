import { injectable, inject } from 'tsyringe';
import { BookingRepository } from '../repositories/BookingRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { GuestRepository } from '../repositories/GuestRepository';
import { Booking, BookingStatus } from '../entities/Booking';
import { AppError } from '../utils/AppError';
import { CreateBookingDto, UpdateBookingDto } from '../dto/booking.dto';

@injectable()
export class BookingService {
  constructor(
    @inject(BookingRepository) private bookingRepository: BookingRepository,
    @inject(RoomRepository) private roomRepository: RoomRepository,
    @inject(GuestRepository) private guestRepository: GuestRepository
  ) {}

  async getAllBookings(filters?: {
    from?: string;
    to?: string;
    status?: BookingStatus;
    page?: number;
    limit?: number;
  }): Promise<{ bookings: Booking[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    const filterParams: any = { page, limit };

    if (filters?.from) {
      filterParams.from = new Date(filters.from);
    }
    if (filters?.to) {
      filterParams.to = new Date(filters.to);
    }
    if (filters?.status) {
      filterParams.status = filters.status;
    }

    const { bookings, total } = await this.bookingRepository.findAll(filterParams);

    return { bookings, total, page, limit };
  }

  async getBookingById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
    }
    return booking;
  }

  async createBooking(data: CreateBookingDto): Promise<Booking> {
    const checkInDate = new Date(data.checkInDate);
    const checkOutDate = new Date(data.checkOutDate);

    if (checkInDate >= checkOutDate) {
      throw new AppError(400, 'INVALID_DATES', 'Check-in date must be before check-out date');
    }

    const room = await this.roomRepository.findById(data.roomId);
    if (!room) {
      throw new AppError(404, 'ROOM_NOT_FOUND', 'Room not found');
    }

    const guest = await this.guestRepository.findById(data.guestId);
    if (!guest) {
      throw new AppError(404, 'GUEST_NOT_FOUND', 'Guest not found');
    }

    const overlappingBookings = await this.bookingRepository.findOverlapping(
      data.roomId,
      checkInDate,
      checkOutDate
    );

    if (overlappingBookings.length > 0) {
      throw new AppError(
        409,
        'BOOKING_CONFLICT',
        'Room is already booked for the selected dates'
      );
    }

    return this.bookingRepository.create({
      ...data,
      checkInDate,
      checkOutDate,
    });
  }

  async updateBooking(id: number, data: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
    }

    const checkInDate = data.checkInDate ? new Date(data.checkInDate) : booking.checkInDate;
    const checkOutDate = data.checkOutDate ? new Date(data.checkOutDate) : booking.checkOutDate;

    if (checkInDate >= checkOutDate) {
      throw new AppError(400, 'INVALID_DATES', 'Check-in date must be before check-out date');
    }

    const roomId = data.roomId || booking.roomId;

    if (data.roomId) {
      const room = await this.roomRepository.findById(data.roomId);
      if (!room) {
        throw new AppError(404, 'ROOM_NOT_FOUND', 'Room not found');
      }
    }

    if (data.guestId) {
      const guest = await this.guestRepository.findById(data.guestId);
      if (!guest) {
        throw new AppError(404, 'GUEST_NOT_FOUND', 'Guest not found');
      }
    }

    if (data.checkInDate || data.checkOutDate || data.roomId) {
      const overlappingBookings = await this.bookingRepository.findOverlapping(
        roomId,
        checkInDate,
        checkOutDate,
        id
      );

      if (overlappingBookings.length > 0) {
        throw new AppError(
          409,
          'BOOKING_CONFLICT',
          'Room is already booked for the selected dates'
        );
      }
    }

    const updateData: any = { ...data };
    if (data.checkInDate) updateData.checkInDate = checkInDate;
    if (data.checkOutDate) updateData.checkOutDate = checkOutDate;

    const updatedBooking = await this.bookingRepository.update(id, updateData);
    if (!updatedBooking) {
      throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
    }

    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<void> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
    }

    await this.bookingRepository.cancel(id);
  }
}
