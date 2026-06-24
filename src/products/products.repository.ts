import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { applyListQuery, toPaginatedResponse } from '../common/utils/list-query.util';
import { Product } from './product.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  findAll(query: ListQueryDto): Promise<PaginatedResponse<Product>> {
    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.stockItems', 'stockItems');

    applyListQuery(queryBuilder, query, {
      defaultSortBy: 'createdAt',
      sortFields: {
        id: 'product.id',
        name: 'product.name',
        sku: 'product.sku',
        priceCents: 'product.priceCents',
        createdAt: 'product.createdAt',
        updatedAt: 'product.updatedAt',
      },
      filterFields: {
        id: { column: 'product.id', type: 'exact' },
        name: { column: 'product.name', type: 'string' },
        sku: { column: 'product.sku', type: 'string' },
        priceCents: { column: 'product.priceCents', type: 'number' },
      },
      searchFields: ['product.name', 'product.description', 'product.sku'],
    });

    return toPaginatedResponse(queryBuilder, query);
  }

  findById(id: string): Promise<Product | null> {
    return this.repository.findOne({ where: { id }, relations: { stockItems: true } });
  }

  findBySku(sku: string): Promise<Product | null> {
    return this.repository.findOne({ where: { sku }, relations: { stockItems: true } });
  }

  save(product: Product): Promise<Product> {
    return this.repository.save(product);
  }
}
