import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from './Booking';

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  SUITE = 'SUITE',
  DELUXE = 'DELUXE',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_number', unique: true })
  roomNumber: string;

  @Column({
    type: 'enum',
    enum: RoomType,
  })
  type: RoomType;

  @Column()
  capacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'price_per_night' })
  pricePerNight: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];
}
