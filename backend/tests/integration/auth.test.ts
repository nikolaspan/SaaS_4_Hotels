import request from 'supertest';
import { App } from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { UserRepository } from '../../src/repositories/UserRepository';
import { UserRole } from '../../src/entities/User';
import * as bcrypt from 'bcrypt';

describe('Auth Integration Tests', () => {
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
  });

  describe('POST /auth/login', () => {
    it('should return token when credentials are valid', async () => {
      const response = await request(server)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('admin');
      expect(response.body.user.role).toBe('ADMIN');

      adminToken = response.body.accessToken;
    });

    it('should return 401 when credentials are invalid', async () => {
      const response = await request(server)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should login staff user and get token', async () => {
      const response = await request(server)
        .post('/auth/login')
        .send({
          username: 'staff',
          password: 'staff123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      staffToken = response.body.accessToken;
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user when authenticated', async () => {
      const response = await request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.username).toBe('admin');
      expect(response.body.role).toBe('ADMIN');
    });

    it('should return 401 when not authenticated', async () => {
      await request(server).get('/auth/me').expect(401);
    });
  });
});
