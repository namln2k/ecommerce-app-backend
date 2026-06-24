import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import kafkaConfig from '../config/kafka.config';
import { KafkaEventPublisherService } from './kafka-event-publisher.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(kafkaConfig)],
  providers: [KafkaEventPublisherService],
  exports: [KafkaEventPublisherService],
})
export class KafkaModule {}

