export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  SUITE = 'SUITE',
  DELUXE = 'DELUXE',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  type: RoomType;
  capacity: number;
  pricePerNight: number;
  isActive: boolean;
}

export interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface Booking {
  id: number;
  roomId: number;
  guestId: number;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  notes?: string;
  totalPrice?: number;
  room?: Room;
  guest?: Guest;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: UserRole;
  };
}
