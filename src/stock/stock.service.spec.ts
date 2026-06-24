import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { StockRepository } from './stock.repository';

describe('StockService', () => {
  let service: StockService;
  let stockRepository: Pick<StockRepository, 'findAll'>;

  beforeEach(async () => {
    stockRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: StockRepository,
          useValue: stockRepository,
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return stock from the repository', async () => {
    await expect(service.findAll()).resolves.toEqual([]);
    expect(stockRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
