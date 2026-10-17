import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

/**
 * JWT Strategy that validates tokens issued by Auth0.
 *
 * It automatically fetches the public key from Auth0's JWKS endpoint
 * (/.well-known/jwks.json) to verify the token's signature — no
 * client secret is ever exposed in your app.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
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
   * Whatever you return here is attached to `req.user`.
   *
   * @param payload - The decoded JWT payload from Auth0
   */
  validate(payload: Auth0JwtPayload): AuthenticatedUser {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      sub: payload.sub,           // Auth0 user ID (e.g., "auth0|abc123")
      email: payload.email,
      permissions: payload.permissions ?? [],
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
}
