import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import kafkaConfig from '../config/kafka.config';
import { Order } from '../orders/order.entity';
import { Stock } from '../stock/stock.entity';

interface DomainEventEnvelope<T> {
  eventName: string;
  occurredAt: string;
  data: T;
}

@Injectable()
export class KafkaEventPublisherService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaEventPublisherService.name);
  private producer?: Producer;
  private producerReady?: Promise<Producer>;

  constructor(@Inject(kafkaConfig.KEY) private readonly kafkaSettings: ConfigType<typeof kafkaConfig>) {}

  async publishOrderCreated(order: Order): Promise<void> {
    await this.publish('orders.created', {
      eventName: 'OrderCreated',
      occurredAt: new Date().toISOString(),
      data: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalCents: order.totalCents,
        createdAt: order.createdAt?.toISOString?.() ?? null,
        updatedAt: order.updatedAt?.toISOString?.() ?? null,
        items: (order.items ?? []).map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          lineTotalCents: item.lineTotalCents,
        })),
      },
    });
  }

  async publishStockDepleted(stock: Stock): Promise<void> {
    await this.publish('stock.depleted', {
      eventName: 'StockDepleted',
      occurredAt: new Date().toISOString(),
      data: {
        id: stock.id,
        productId: stock.productId,
        warehouseCode: stock.warehouseCode,
        warehouseName: stock.warehouseName,
        quantity: stock.quantity,
        reservedQuantity: stock.reservedQuantity,
        createdAt: stock.createdAt?.toISOString?.() ?? null,
        updatedAt: stock.updatedAt?.toISOString?.() ?? null,
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.producer) {
      return;
    }

    await this.producer.disconnect();
    this.producer = undefined;
    this.producerReady = undefined;
  }

  private async publish<T>(topic: string, payload: DomainEventEnvelope<T>): Promise<void> {
    const producer = await this.getProducer();

    await producer.send({
      topic,
      messages: [
        {
          key: payload.eventName,
          value: JSON.stringify(payload),
        },
      ],
    });

    this.logger.debug(`Published ${payload.eventName} to ${topic}`);
  }

  private async getProducer(): Promise<Producer> {
    if (this.producer) {
      return this.producer;
    }

    if (!this.producerReady) {
      const kafka = new Kafka({
        clientId: this.kafkaSettings.clientId,
        brokers: this.kafkaSettings.brokers,
      });

      this.producer = kafka.producer();
      this.producerReady = this.producer.connect().then(() => this.producer as Producer);
    }

    return this.producerReady;
  }
}
