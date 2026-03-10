import request from 'supertest';
import { App } from '../../src/app';
import { UserRepository } from '../../src/repositories/UserRepository';
import { UserRole } from '../../src/entities/User';
import * as bcrypt from 'bcrypt';

describe('Users Integration Tests', () => {
  let app: App;
  let server: any;
  let userRepository: UserRepository;
  let adminToken: string;
  let staffToken: string;

  beforeAll(async () => {
    app = new App();
    server = app.app;
    userRepository = new UserRepository();

    const adminPassword = await bcrypt.hash('admin123', 10);
    await userRepository.create({
      name: 'Admin User',
      username: 'admin',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    const staffPassword = await bcrypt.hash('staff123', 10);
    await userRepository.create({
      name: 'Staff User',
      username: 'staff',
      passwordHash: staffPassword,
      role: UserRole.STAFF,
      isActive: true,
    });

    const adminLogin = await request(server).post('/auth/login').send({
      username: 'admin',
      password: 'admin123',
    });
    adminToken = adminLogin.body.accessToken;

    const staffLogin = await request(server).post('/auth/login').send({
      username: 'staff',
      password: 'staff123',
    });
    staffToken = staffLogin.body.accessToken;
  });

  describe('GET /users', () => {
    it('should allow ADMIN to access users', async () => {
      const response = await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 403 when STAFF tries to access users', async () => {
      const response = await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);

      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /users', () => {
    it('should allow ADMIN to create user', async () => {
      const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          username: 'newuser',
          password: 'password123',
          role: 'VIEWER',
        })
        .expect(201);

      expect(response.body.username).toBe('newuser');
      expect(response.body.role).toBe('VIEWER');
    });

    it('should return 409 when username already exists', async () => {
      const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate User',
          username: 'admin',
          password: 'password123',
          role: 'VIEWER',
        })
        .expect(409);

      expect(response.body.error.code).toBe('USERNAME_EXISTS');
    });
  });
});
