import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';
import { Logger } from '@nestjs/common';

async function run() {
  const logger = new Logger('SeedRunner');
  logger.log('Bootstrapping application context for seeding...');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const seedService = app.get(SeedService);
    await seedService.seed();
    logger.log('Seed runner completed successfully.');
    await app.close();
    process.exit(0);
  } catch (error: any) {
    logger.error('Seed runner failed:', error.message);
    await app.close();
    process.exit(1);
  }
}

run();
