import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard protects routes by verifying the Auth0 JWT token.
 *
 * Apply it to:
 *   - A single route:    @UseGuards(JwtAuthGuard)
 *   - An entire controller class: @UseGuards(JwtAuthGuard)
 *   - Globally (all routes): app.useGlobalGuards(new JwtAuthGuard())
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
