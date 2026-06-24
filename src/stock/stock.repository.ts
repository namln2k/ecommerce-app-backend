import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { applyListQuery, toPaginatedResponse } from '../common/utils/list-query.util';
import { Stock } from './stock.entity';

@Injectable()
export class StockRepository {
  constructor(
    @InjectRepository(Stock)
    private readonly repository: Repository<Stock>,
  ) {}

  findAll(query: ListQueryDto): Promise<PaginatedResponse<Stock>> {
    const queryBuilder = this.repository.createQueryBuilder('stock').leftJoinAndSelect('stock.product', 'product');

    applyListQuery(queryBuilder, query, {
      defaultSortBy: 'createdAt',
      sortFields: {
        id: 'stock.id',
        productId: 'stock.productId',
        warehouseCode: 'stock.warehouseCode',
        warehouseName: 'stock.warehouseName',
        quantity: 'stock.quantity',
        reservedQuantity: 'stock.reservedQuantity',
        createdAt: 'stock.createdAt',
        updatedAt: 'stock.updatedAt',
      },
      filterFields: {
        id: { column: 'stock.id', type: 'exact' },
        productId: { column: 'stock.productId', type: 'exact' },
        warehouseCode: { column: 'stock.warehouseCode', type: 'string' },
        warehouseName: { column: 'stock.warehouseName', type: 'string' },
        quantity: { column: 'stock.quantity', type: 'number' },
        reservedQuantity: { column: 'stock.reservedQuantity', type: 'number' },
      },
      searchFields: ['stock.warehouseCode', 'stock.warehouseName', 'product.name', 'product.sku'],
    });

    return toPaginatedResponse(queryBuilder, query);
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
