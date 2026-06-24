import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Product } from './product.entity';
import { ProductsRepository } from './products.repository';
import { SearchProductsQueryDto } from './dto/search-products-query.dto';

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

  async search(query: SearchProductsQueryDto): Promise<PaginatedResponse<Product>> {
    const normalizedQuery = this.toSearchListQuery(query);
    const cacheKey = this.buildProductSearchCacheKey(query);
    const cachedProducts = await this.cacheManager.get<PaginatedResponse<Product>>(cacheKey);

    if (cachedProducts) {
      return cachedProducts;
    }

    const products = await this.productsRepository.findAll(normalizedQuery);
    await this.cacheManager.set(cacheKey, products);

    return products;
  }

  async findById(id: string): Promise<Product | null> {
    return this.findSingleProductWithCache(this.buildProductIdCacheKey(id), () => this.productsRepository.findById(id));
  }

  async findBySku(sku: string): Promise<Product | null> {
    const normalizedSku = sku.trim();

    return this.findSingleProductWithCache(this.buildProductSkuCacheKey(normalizedSku), () =>
      this.productsRepository.findBySku(normalizedSku),
    );
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

  private buildProductSearchCacheKey(query: SearchProductsQueryDto): string {
    return `products:search:${JSON.stringify({
      q: query.q.trim().toLowerCase(),
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: (query.sortOrder ?? 'desc').toLowerCase(),
    })}`;
  }

  private buildProductIdCacheKey(id: string): string {
    return `products:id:${id}`;
  }

  private buildProductSkuCacheKey(sku: string): string {
    return `products:sku:${sku}`;
  }

  private toSearchListQuery(query: SearchProductsQueryDto): ListQueryDto {
    const normalizedSearch = query.q.trim();

    return {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      search: normalizedSearch,
    };
  }

  private async findSingleProductWithCache(
    cacheKey: string,
    loader: () => Promise<Product | null>,
  ): Promise<Product | null> {
    const cachedProduct = await this.cacheManager.get<Product | null>(cacheKey);

    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await loader();

    if (product) {
      await this.cacheManager.set(cacheKey, product);
    }

    return product;
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
