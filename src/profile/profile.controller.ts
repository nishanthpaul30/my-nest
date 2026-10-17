import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy.js';

/**
 * ProfileController demonstrates how to protect routes using Auth0 JWT.
 *
 * All routes in this controller require a valid Auth0 access token.
 */
@Controller('profile')
@UseGuards(JwtAuthGuard) // Apply JWT guard to the entire controller
export class ProfileController {
  /**
   * GET /profile
   * Returns the authenticated user's basic info from the JWT payload.
   * Only requires a valid token — no extra permissions needed.
   */
  @Get()
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Authenticated successfully!',
      user,
    };
  }

  /**
   * GET /profile/admin
   * Requires the token to contain the 'read:admin' permission.
   * Configure this permission in Auth0 Dashboard > APIs > Permissions.
   */
  @Get('admin')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('read:admin')
  getAdminData(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Admin access granted',
      sub: user.sub,
    };
  }
}
