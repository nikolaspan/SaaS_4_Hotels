import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from './config/data-source';
import { App } from './app';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001');

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const app = new App();
    app.listen(PORT);
  } catch (error) {
    console.error('Error during application bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
