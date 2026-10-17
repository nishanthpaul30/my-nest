import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/enums/role.enum.js';
import { UsersService } from '../users/users.service.js';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy.js';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/profile
   * Returns authenticated user profile including roles loaded from MongoDB.
   */
  @Get()
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Authenticated successfully!',
      user,
    };
  }

  /**
   * GET /api/v1/profile/admin
   * Protected by RolesGuard: Requires the user to have Role.ADMIN in MongoDB.
   */
  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getAdminData(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Admin access granted from database role check!',
      user,
    };
  }

  /**
   * POST /api/v1/profile/promote-admin
   * Helper endpoint: Promotes current user to have [user, admin] roles in MongoDB.
   */
  @Post('promote-admin')
  async promoteToAdmin(@CurrentUser() user: AuthenticatedUser) {
    const updated = await this.usersService.updateRoles(user.sub, [
      Role.USER,
      Role.ADMIN,
    ]);
    return {
      message: 'User successfully promoted to ADMIN in database!',
      roles: updated.roles,
    };
  }
}

