import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  findAll(): Promise<Order[]> {
    return this.repository.find({
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
    });
  }

  findById(id: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
    });
  }

  save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }
}
