import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { OrderItemsRepository } from './order-items.repository';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [OrdersController],
  providers: [OrderItemsRepository, OrdersRepository, OrdersService],
  exports: [OrderItemsRepository, OrdersRepository, OrdersService],
})
export class OrdersModule {}
