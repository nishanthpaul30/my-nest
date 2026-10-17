import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/enums/role.enum.js';

export const ROLES_KEY = 'roles';

/**
 * @Roles(Role.ADMIN) decorator marks a route or controller
 * as requiring one or more DB-backed roles.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(Role.ADMIN)
 *   @Get('admin-only')
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
