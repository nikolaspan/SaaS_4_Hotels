import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from './Booking';

@Entity('guests')
export class Guest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => Booking, (booking) => booking.guest)
  bookings: Booking[];
}
