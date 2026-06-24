import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Product } from './product.entity';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(query: ListQueryDto): Promise<PaginatedResponse<Product>> {
    const cacheKey = this.buildProductListCacheKey(query);
    const cachedProducts = await this.cacheManager.get<PaginatedResponse<Product>>(cacheKey);

    if (cachedProducts) {
      return cachedProducts;
    }

    const products = await this.productsRepository.findAll(query);
    await this.cacheManager.set(cacheKey, products);

    return products;
  }

  private buildProductListCacheKey(query: ListQueryDto): string {
    return `products:list:${JSON.stringify({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: (query.sortOrder ?? 'desc').toLowerCase(),
      search: query.search ?? null,
      filter: this.normalizeFilters(query.filter),
    })}`;
  }

  private normalizeFilters(rawFilters: string | string[] | undefined): string[] {
    if (!rawFilters) {
      return [];
    }

    const filters = Array.isArray(rawFilters) ? rawFilters : [rawFilters];

    return filters
      .flatMap((filter) =>
        filter
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      )
      .sort();
  }
}
