import { Injectable } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { KafkaEventPublisherService } from '../kafka/kafka-event-publisher.service';
import { Stock } from './stock.entity';
import { StockRepository } from './stock.repository';

@Injectable()
export class StockService {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly kafkaEventPublisher: KafkaEventPublisherService,
  ) {}

  findAll(query: ListQueryDto) {
    return this.stockRepository.findAll(query);
  }

  publishStockDepleted(stock: Stock): Promise<void> {
    return this.kafkaEventPublisher.publishStockDepleted(stock);
  }
}
