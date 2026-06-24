import { Test, TestingModule } from '@nestjs/testing';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { KafkaEventPublisherService } from '../kafka/kafka-event-publisher.service';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: Pick<OrdersRepository, 'findAll'>;
  let kafkaEventPublisher: { publishOrderCreated: jest.Mock };

  beforeEach(async () => {
    ordersRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    kafkaEventPublisher = {
      publishOrderCreated: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: ordersRepository,
        },
        {
          provide: KafkaEventPublisherService,
          useValue: kafkaEventPublisher,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return orders from the repository', async () => {
    const query = new ListQueryDto();

    await expect(service.findAll(query)).resolves.toEqual([]);
    expect(ordersRepository.findAll).toHaveBeenCalledWith(query);
  });

  it('should publish order created events', async () => {
    const order = { id: 'order-1' } as never;

    await expect(service.publishOrderCreated(order)).resolves.toBeUndefined();
    expect(kafkaEventPublisher.publishOrderCreated).toHaveBeenCalledWith(order);
  });
});
