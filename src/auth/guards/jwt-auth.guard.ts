import { CanActivate, ExecutionContext, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from '../../config/jwt.config';
import type { AuthenticatedRequest, JwtUser } from '../interfaces/authenticated-request.interface';

interface AccessTokenPayload extends JwtUser {
  type: 'access';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.jwtSettings.secret,
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      request.user = {
        email: payload.email,
        role: payload.role,
        sub: payload.sub,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
