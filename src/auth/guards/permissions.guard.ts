import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { AuthenticatedUser } from '../strategies/jwt.strategy.js';

/**
 * PermissionsGuard enforces fine-grained access control based on
 * Auth0 permissions embedded in the JWT payload.
 *
 * Must be used AFTER JwtAuthGuard (which populates req.user).
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, PermissionsGuard)
 *   @RequirePermissions('read:users', 'write:users')
 *   @Get()
 *   findAll() { ... }
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read the required permissions from the @RequirePermissions() decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required for this route, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;

    const hasAllPermissions = requiredPermissions.every((perm) =>
      user.permissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
