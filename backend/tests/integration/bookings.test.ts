import request from 'supertest';
import { App } from '../../src/app';
import { UserRepository } from '../../src/repositories/UserRepository';
import { RoomRepository } from '../../src/repositories/RoomRepository';
import { GuestRepository } from '../../src/repositories/GuestRepository';
import { UserRole } from '../../src/entities/User';
import { RoomType } from '../../src/entities/Room';
import * as bcrypt from 'bcrypt';

describe('Bookings Integration Tests', () => {
  let app: App;
  let server: any;
  let userRepository: UserRepository;
  let roomRepository: RoomRepository;
  let guestRepository: GuestRepository;
  let adminToken: string;
  let roomId: number;
  let guestId: number;

  beforeAll(async () => {
    app = new App();
    server = app.app;
    userRepository = new UserRepository();
    roomRepository = new RoomRepository();
    guestRepository = new GuestRepository();

    const adminPassword = await bcrypt.hash('admin123', 10);
    await userRepository.create({
      name: 'Admin User',
      username: 'admin',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    const room = await roomRepository.create({
      roomNumber: '101',
      type: RoomType.SINGLE,
      capacity: 1,
      pricePerNight: 100,
      isActive: true,
    });
    roomId = room.id;

    const guest = await guestRepository.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
    });
    guestId = guest.id;

    const adminLogin = await request(server).post('/auth/login').send({
      username: 'admin',
      password: 'admin123',
    });
    adminToken = adminLogin.body.accessToken;
  });

  describe('POST /bookings', () => {
    it('should create booking successfully', async () => {
      const response = await request(server)
        .post('/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roomId,
          guestId,
          checkInDate: '2024-01-01',
          checkOutDate: '2024-01-05',
          status: 'PENDING',
        })
        .expect(201);

      expect(response.body.roomId).toBe(roomId);
      expect(response.body.guestId).toBe(guestId);
      expect(response.body.status).toBe('PENDING');
    });

    it('should return 409 when booking overlaps', async () => {
      const response = await request(server)
        .post('/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roomId,
          guestId,
          checkInDate: '2024-01-03',
          checkOutDate: '2024-01-07',
          status: 'PENDING',
        })
        .expect(409);

      expect(response.body.error.code).toBe('BOOKING_CONFLICT');
    });

    it('should return 400 when checkIn >= checkOut', async () => {
      const response = await request(server)
        .post('/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roomId,
          guestId,
          checkInDate: '2024-02-10',
          checkOutDate: '2024-02-10',
          status: 'PENDING',
        })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_DATES');
    });

    it('should allow booking after cancelled booking', async () => {
      const room2 = await roomRepository.create({
        roomNumber: '102',
        type: RoomType.DOUBLE,
        capacity: 2,
        pricePerNight: 150,
        isActive: true,
      });

      const booking1 = await request(server)
        .post('/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roomId: room2.id,
          guestId,
          checkInDate: '2024-03-01',
          checkOutDate: '2024-03-05',
          status: 'CONFIRMED',
        })
        .expect(201);

      await request(server)
        .delete(`/bookings/${booking1.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      await request(server)
        .post('/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roomId: room2.id,
          guestId,
          checkInDate: '2024-03-01',
          checkOutDate: '2024-03-05',
          status: 'PENDING',
        })
        .expect(201);
    });
  });

  describe('GET /bookings', () => {
    it('should get bookings with filters', async () => {
      const response = await request(server)
        .get('/bookings')
        .query({ status: 'PENDING' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('bookings');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(server)
        .get('/bookings')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });
  });
});
