import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { RoomType } from '../entities/Room';

export class CreateRoomDto {
  @IsString()
  roomNumber: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsNumber()
  @Min(0)
  pricePerNight: number;
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsEnum(RoomType)
  @IsOptional()
  type?: RoomType;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerNight?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
