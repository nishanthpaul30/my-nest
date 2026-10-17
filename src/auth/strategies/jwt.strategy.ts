import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service.js';
import { Role } from '../../users/enums/role.enum.js';

/**
 * JWT Strategy that validates tokens issued by Auth0.
 *
 * It automatically fetches the public key from Auth0's JWKS endpoint
 * (/.well-known/jwks.json) to verify the token's signature — no
 * client secret is ever exposed in your app.
 *
 * After verifying the token, it looks up (or auto-creates) the user
 * in MongoDB so that their real database roles are attached to req.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const domain = configService.get<string>('auth0.domain');
    const audience = configService.get<string>('auth0.audience');

    super({
      // Extract the Bearer token from the Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Reject expired tokens immediately
      ignoreExpiration: false,

      // Use Auth0's JWKS endpoint to automatically fetch & cache the public key
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),

      // Validate the token's audience and issuer to prevent token misuse
      audience,
      issuer: `https://${domain}/`,
      algorithms: ['RS256'],
    });
  }

  /**
   * Called after the JWT signature is verified.
   * Finds or creates the user in MongoDB and attaches their DB record
   * and roles to `req.user`.
   */
  async validate(payload: Auth0JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Sync / fetch the user from MongoDB
    const dbUser = await this.usersService.findOrCreateByAuth0Id(
      payload.sub,
      payload.email,
    );

    return {
      sub: payload.sub,                   // Auth0 user ID (e.g., "auth0|abc123")
      email: payload.email || dbUser.email,
      permissions: payload.permissions ?? [],
      roles: dbUser.roles,                // Loaded directly from MongoDB!
      dbId: dbUser._id.toString(),        // MongoDB ObjectId
    };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Auth0JwtPayload {
  sub: string;
  email?: string;
  permissions?: string[];
  iat: number;
  exp: number;
  aud: string | string[];
  iss: string;
}

export interface AuthenticatedUser {
  sub: string;
  email?: string;
  permissions: string[];
  roles: Role[];
  dbId?: string;
}

