import { Injectable } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { KafkaEventPublisherService } from '../kafka/kafka-event-publisher.service';
import { Order } from './order.entity';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly kafkaEventPublisher: KafkaEventPublisherService,
  ) {}

  findAll(query: ListQueryDto) {
    return this.ordersRepository.findAll(query);
  }

  publishOrderCreated(order: Order): Promise<void> {
    return this.kafkaEventPublisher.publishOrderCreated(order);
  }
}
