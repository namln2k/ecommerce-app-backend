import { Test, TestingModule } from '@nestjs/testing';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { KafkaEventPublisherService } from '../kafka/kafka-event-publisher.service';
import { StockService } from './stock.service';
import { StockRepository } from './stock.repository';

describe('StockService', () => {
  let service: StockService;
  let stockRepository: Pick<StockRepository, 'findAll'>;
  let kafkaEventPublisher: { publishStockDepleted: jest.Mock };

  beforeEach(async () => {
    stockRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    kafkaEventPublisher = {
      publishStockDepleted: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: StockRepository,
          useValue: stockRepository,
        },
        {
          provide: KafkaEventPublisherService,
          useValue: kafkaEventPublisher,
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return stock from the repository', async () => {
    const query = new ListQueryDto();

    await expect(service.findAll(query)).resolves.toEqual([]);
    expect(stockRepository.findAll).toHaveBeenCalledWith(query);
  });

  it('should publish stock depleted events', async () => {
    const stock = { id: 'stock-1' } as never;

    await expect(service.publishStockDepleted(stock)).resolves.toBeUndefined();
    expect(kafkaEventPublisher.publishStockDepleted).toHaveBeenCalledWith(stock);
  });
});
