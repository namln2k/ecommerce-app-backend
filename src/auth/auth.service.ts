import { ConflictException, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import jwtConfig from '../config/jwt.config';
import { User, UserRole } from '../users/user.entity';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends TokenPair {
  user: User;
}

interface RefreshTokenPayload {
  email: string;
  role: UserRole;
  sub: string;
  type: 'refresh';
}

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: ConfigType<typeof jwtConfig>,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersRepository.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, this.saltRounds);
    const user = this.usersRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      passwordHash,
      role: UserRole.Customer,
    });

    const savedUser = await this.usersRepository.save(user);
    const tokens = await this.issueTokenPair(savedUser);

    return {
      user: savedUser,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokenPair(user);

    return {
      user,
      ...tokens,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.jwtSettings.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersRepository.findById(payload.sub);

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const isRefreshTokenValid = await bcrypt.compare(this.digestRefreshToken(refreshToken), user.refreshTokenHash);

    if (!isRefreshTokenValid) {
      await this.clearRefreshToken(user);
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    return this.issueTokenPair(user);
  }

  async logout(userId: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (user) {
      await this.clearRefreshToken(user);
    }
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          email: user.email,
          role: user.role,
          sub: user.id,
          type: 'access',
        },
        {
          expiresIn: this.jwtSettings.expiresIn as JwtSignOptions['expiresIn'],
          secret: this.jwtSettings.secret,
        },
      ),
      this.jwtService.signAsync(
        {
          email: user.email,
          jti: randomUUID(),
          role: user.role,
          sub: user.id,
          type: 'refresh',
        },
        {
          expiresIn: this.jwtSettings.refreshExpiresIn as JwtSignOptions['expiresIn'],
          secret: this.jwtSettings.refreshSecret,
        },
      ),
    ]);

    user.refreshTokenHash = await bcrypt.hash(this.digestRefreshToken(refreshToken), this.saltRounds);
    await this.usersRepository.save(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async clearRefreshToken(user: User): Promise<void> {
    user.refreshTokenHash = null;
    await this.usersRepository.save(user);
  }

  private digestRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }
}
