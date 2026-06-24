import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import jwtConfig from '../config/jwt.config';
import { User, UserRole } from '../users/user.entity';
import { UsersRepository } from '../users/users.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: Pick<UsersRepository, 'create' | 'findByEmail' | 'findById' | 'save'>;
  let savedUser: User;
  const cloneUser = (user: User): User => ({
    ...user,
  });

  beforeEach(async () => {
    savedUser = {
      createdAt: new Date(),
      email: 'customer@example.com',
      id: 'user-id',
      name: 'Demo Customer',
      orders: [],
      passwordHash: await bcrypt.hash('Password123!', 4),
      refreshTokenHash: null,
      role: UserRole.Customer,
      updatedAt: new Date(),
    };

    usersRepository = {
      create: jest.fn((user: Partial<User>) => user as User),
      findByEmail: jest.fn().mockResolvedValue(null),
      findById: jest
        .fn()
        .mockImplementation((id: string) => Promise.resolve(id === savedUser.id ? cloneUser(savedUser) : null)),
      save: jest.fn().mockImplementation((user: User) => {
        savedUser = {
          ...savedUser,
          ...user,
        };

        return Promise.resolve(savedUser);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            expiresIn: '15m',
            refreshExpiresIn: '7d',
            refreshSecret: 'test-refresh-secret',
            secret: 'test-access-secret',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registers customers with hashed passwords and token pair', async () => {
    const response = await service.register({
      email: 'new@example.com',
      name: 'New Customer',
      password: 'Password123!',
    });

    expect(response.accessToken).toBeTruthy();
    expect(response.refreshToken).toBeTruthy();
    expect(response.user.role).toBe(UserRole.Customer);
    expect(response.user.passwordHash).not.toBe('Password123!');
    expect(await bcrypt.compare('Password123!', response.user.passwordHash)).toBe(true);
    expect(response.user.refreshTokenHash).toBeTruthy();
  });

  it('rejects login with invalid credentials', async () => {
    jest.mocked(usersRepository.findByEmail).mockResolvedValue(cloneUser(savedUser));

    await expect(
      service.login({
        email: savedUser.email,
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates refresh tokens and revokes reused refresh tokens', async () => {
    jest
      .mocked(usersRepository.findByEmail)
      .mockImplementation((email: string) => Promise.resolve(email === savedUser.email ? cloneUser(savedUser) : null));

    const loginResponse = await service.login({
      email: savedUser.email,
      password: 'Password123!',
    });
    const firstRefreshHash = savedUser.refreshTokenHash;

    const rotatedTokens = await service.refresh(loginResponse.refreshToken);

    expect(rotatedTokens.accessToken).toBeTruthy();
    expect(rotatedTokens.refreshToken).toBeTruthy();
    expect(rotatedTokens.refreshToken).not.toBe(loginResponse.refreshToken);
    expect(savedUser.refreshTokenHash).toBeTruthy();
    expect(savedUser.refreshTokenHash).not.toBe(firstRefreshHash);
    expect(await bcrypt.compare(loginResponse.refreshToken, savedUser.refreshTokenHash!)).toBe(false);

    await expect(service.refresh(loginResponse.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(savedUser.refreshTokenHash).toBeNull();
  });
});
