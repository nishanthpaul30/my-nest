import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../strategies/jwt.strategy.js';

/**
 * @CurrentUser() decorator extracts the authenticated user from the request.
 *
 * Usage in a controller:
 *   @Get('profile')
 *   @UseGuards(JwtAuthGuard)
 *   getProfile(@CurrentUser() user: AuthenticatedUser) {
 *     return user;
 *   }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
