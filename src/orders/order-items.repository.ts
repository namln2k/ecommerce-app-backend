import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrderItemsRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly repository: Repository<OrderItem>,
  ) {}

  findByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.repository.find({ where: { orderId }, relations: { product: true } });
  }

  save(orderItem: OrderItem): Promise<OrderItem> {
    return this.repository.save(orderItem);
  }
}
