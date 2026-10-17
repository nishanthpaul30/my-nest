import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * @RequirePermissions() decorator specifies which Auth0 permissions
 * are needed to access a route. Used together with PermissionsGuard.
 *
 * Auth0 permissions are defined in your Auth0 Dashboard under
 * APIs > [your API] > Permissions.
 *
 * Usage:
 *   @RequirePermissions('read:users')
 *   @RequirePermissions('read:orders', 'write:orders')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
