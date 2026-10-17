import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';

/**
 * AuthModule wires together all authentication components.
 * Import this module into AppModule (or any feature module that needs auth).
 *
 * Exports JwtAuthGuard and PermissionsGuard so they can be used
 * directly in other modules without re-importing AuthModule's internals.
 */
@Module({
  imports: [
    // Registers Passport with 'jwt' as the default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [
    JwtAuthGuard,
    PermissionsGuard,
    PassportModule,
  ],
})
export class AuthModule {}
