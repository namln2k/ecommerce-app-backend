import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.repository.find({ relations: { stockItems: true } });
  }

  findById(id: string): Promise<Product | null> {
    return this.repository.findOne({ where: { id }, relations: { stockItems: true } });
  }

  findBySku(sku: string): Promise<Product | null> {
    return this.repository.findOne({ where: { sku } });
  }

  save(product: Product): Promise<Product> {
    return this.repository.save(product);
  }
}
