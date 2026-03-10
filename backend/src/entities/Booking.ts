import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from './Room';
import { Guest } from './Guest';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @Column({ name: 'guest_id' })
  guestId: number;

  @Column({ type: 'date', name: 'check_in_date' })
  checkInDate: Date;

  @Column({ type: 'date', name: 'check_out_date' })
  checkOutDate: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'total_price' })
  totalPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Room, (room) => room.bookings)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => Guest, (guest) => guest.bookings)
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;
}
