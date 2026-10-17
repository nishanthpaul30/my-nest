import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfileController } from './profile/profile.controller.js';
import auth0Config from './config/auth0.config.js';

@Module({
  imports: [
    // ── Configuration ───────────────────────────────────────────────────────
    // Makes ConfigService available globally; loads .env automatically
    ConfigModule.forRoot({
      isGlobal: true,
      load: [auth0Config],
    }),

    // ── Rate Limiting ────────────────────────────────────────────────────────
    // Protects all routes: max 60 requests per 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,  // time window in ms
        limit: 60,   // max requests per window
      },
    ]),

    // ── Database ─────────────────────────────────────────────────────────────
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/nestjs-app'),

    // ── Auth ──────────────────────────────────────────────────────────────────
    AuthModule,
  ],
  controllers: [AppController, ProfileController],
  providers: [
    AppService,

    // Apply rate limiting globally to ALL routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

