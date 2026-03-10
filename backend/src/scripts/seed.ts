import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../config/data-source';
import { UserRepository } from '../repositories/UserRepository';
import { UserRole } from '../entities/User';
import * as bcrypt from 'bcrypt';

dotenv.config();

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepository = new UserRepository();

    const existingAdmin = await userRepository.findByUsername('admin');

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);

      await userRepository.create({
        name: 'System Administrator',
        username: 'admin',
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
      });

      console.log('Default ADMIN user created:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
    } else {
      console.log('ADMIN user already exists');
    }

    await AppDataSource.destroy();
    console.log('Seed completed');
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  }
}

seed();
