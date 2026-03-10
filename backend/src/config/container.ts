import 'reflect-metadata';
import { container } from 'tsyringe';
import { UserRepository } from '../repositories/UserRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { GuestRepository } from '../repositories/GuestRepository';
import { BookingRepository } from '../repositories/BookingRepository';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { RoomService } from '../services/RoomService';
import { GuestService } from '../services/GuestService';
import { BookingService } from '../services/BookingService';

export function setupContainer() {
  container.register(UserRepository, { useClass: UserRepository });
  container.register(RoomRepository, { useClass: RoomRepository });
  container.register(GuestRepository, { useClass: GuestRepository });
  container.register(BookingRepository, { useClass: BookingRepository });

  container.register(AuthService, { useClass: AuthService });
  container.register(UserService, { useClass: UserService });
  container.register(RoomService, { useClass: RoomService });
  container.register(GuestService, { useClass: GuestService });
  container.register(BookingService, { useClass: BookingService });
}
