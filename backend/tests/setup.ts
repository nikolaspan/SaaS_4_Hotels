import { AppDataSource } from '../src/config/data-source';

beforeAll(async () => {
  await AppDataSource.initialize();
  await AppDataSource.synchronize(true); // Drop and recreate schema
});

afterAll(async () => {
  await AppDataSource.destroy();
});
