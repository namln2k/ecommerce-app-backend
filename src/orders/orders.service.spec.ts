import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: Pick<OrdersRepository, 'findAll'>;

  beforeEach(async () => {
    ordersRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: ordersRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return orders from the repository', async () => {
    await expect(service.findAll()).resolves.toEqual([]);
    expect(ordersRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
