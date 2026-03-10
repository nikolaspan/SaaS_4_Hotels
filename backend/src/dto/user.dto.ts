import { IsString, MinLength, IsEnum, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../entities/User';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
