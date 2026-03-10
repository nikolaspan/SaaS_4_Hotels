import { IsNumber, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../entities/Booking';

export class CreateBookingDto {
  @IsNumber()
  roomId: number;

  @IsNumber()
  guestId: number;

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  checkOutDate: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  totalPrice?: number;
}

export class UpdateBookingDto {
  @IsNumber()
  @IsOptional()
  roomId?: number;

  @IsNumber()
  @IsOptional()
  guestId?: number;

  @IsDateString()
  @IsOptional()
  checkInDate?: string;

  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  totalPrice?: number;
}
