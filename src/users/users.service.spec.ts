import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Pick<UsersRepository, 'findAll'>;

  beforeEach(async () => {
    usersRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return users from the repository', async () => {
    await expect(service.findAll()).resolves.toEqual([]);
    expect(usersRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
