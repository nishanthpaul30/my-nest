import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ── Security Headers ──────────────────────────────────────────────────────
  // Sets secure HTTP headers (XSS, clickjacking, MIME sniffing protection, etc.)
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────────────────
  // Allow requests from your frontend; restrict in production
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // ── Global Validation Pipe ────────────────────────────────────────────────
  // Automatically validates & transforms all incoming request bodies
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip unknown properties
      forbidNonWhitelisted: true, // Throw 400 if unknown properties are sent
      transform: true,            // Auto-convert payloads to DTO instances
    }),
  );

  // ── API Prefix ────────────────────────────────────────────────────────────
  // All routes are prefixed with /api/v1 (e.g., GET /api/v1/profile)
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
}
await bootstrap();

