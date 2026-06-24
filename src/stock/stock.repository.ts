import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';

@Injectable()
export class StockRepository {
  constructor(
    @InjectRepository(Stock)
    private readonly repository: Repository<Stock>,
  ) {}

  findAll(): Promise<Stock[]> {
    return this.repository.find({ relations: { product: true } });
  }

  findById(id: string): Promise<Stock | null> {
    return this.repository.findOne({ where: { id }, relations: { product: true } });
  }

  findByProductId(productId: string): Promise<Stock[]> {
    return this.repository.find({ where: { productId }, relations: { product: true } });
  }

  save(stock: Stock): Promise<Stock> {
    return this.repository.save(stock);
  }
}
