import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User';
import { Room } from '../entities/Room';
import { Guest } from '../entities/Guest';
import { Booking } from '../entities/Booking';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: isTest ? process.env.TEST_DB_HOST : process.env.DB_HOST,
  port: isTest ? parseInt(process.env.TEST_DB_PORT || '5433') : parseInt(process.env.DB_PORT || '5432'),
  username: isTest ? process.env.TEST_DB_USERNAME : process.env.DB_USERNAME,
  password: isTest ? process.env.TEST_DB_PASSWORD : process.env.DB_PASSWORD,
  database: isTest ? process.env.TEST_DB_DATABASE : process.env.DB_DATABASE,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Room, Guest, Booking],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});
