import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { SearchProductsQueryDto } from './dto/search-products-query.dto';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: {
    findAll: jest.MockedFunction<ProductsRepository['findAll']>;
    findById: jest.MockedFunction<ProductsRepository['findById']>;
    findBySku: jest.MockedFunction<ProductsRepository['findBySku']>;
  };
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    const productList = {
      data: [],
      meta: {
        page: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    productsRepository = {
      findAll: jest.fn().mockResolvedValue(productList),
      findById: jest.fn().mockResolvedValue(null),
      findBySku: jest.fn().mockResolvedValue(null),
    };

    cacheManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: productsRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return products from the repository', async () => {
    const query = new ListQueryDto();

    await expect(service.findAll(query)).resolves.toEqual({
      data: [],
      meta: {
        page: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    expect(productsRepository.findAll).toHaveBeenCalledWith(query);
    expect(cacheManager.set).toHaveBeenCalledWith(
      'products:list:{"page":1,"limit":20,"sortBy":"createdAt","sortOrder":"desc","search":null,"filter":[]}',
      expect.any(Object),
    );
  });

  it('should return cached products without querying the repository', async () => {
    const cachedProducts = {
      data: [],
      meta: {
        page: 2,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    };

    cacheManager.get.mockResolvedValue(cachedProducts);

    await expect(service.findAll({ page: 2, limit: 10 } as ListQueryDto)).resolves.toEqual(cachedProducts);
    expect(productsRepository.findAll).not.toHaveBeenCalled();
    expect(cacheManager.set).not.toHaveBeenCalled();
  });

  it('should search products and cache search results separately', async () => {
    const query: SearchProductsQueryDto = {
      q: '  iPhone  ',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    const searchResults = {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    productsRepository.findAll.mockResolvedValue(searchResults);

    await expect(service.search(query)).resolves.toEqual(searchResults);

    expect(productsRepository.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: 'iPhone',
    });
    expect(cacheManager.set).toHaveBeenCalledWith(
      'products:search:{"q":"iphone","page":1,"limit":10,"sortBy":"createdAt","sortOrder":"desc"}',
      expect.any(Object),
    );
  });

  it('should return cached search results without querying the repository', async () => {
    const cachedProducts = {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    cacheManager.get.mockResolvedValue(cachedProducts);

    await expect(service.search({ q: 'phone', page: 1, limit: 10 } as SearchProductsQueryDto)).resolves.toEqual(
      cachedProducts,
    );
    expect(productsRepository.findAll).not.toHaveBeenCalled();
    expect(cacheManager.set).not.toHaveBeenCalled();
  });

  it('should return a product by id and cache the lookup separately', async () => {
    const product = {
      id: 'd2b8f2e8-8bd6-4aa7-b0a0-6d3f6be1b7d1',
      name: 'Phone',
      sku: 'PHONE-001',
    };

    productsRepository.findById.mockResolvedValue(product as never);

    await expect(service.findById(product.id)).resolves.toEqual(product);
    expect(productsRepository.findById).toHaveBeenCalledWith(product.id);
    expect(cacheManager.set).toHaveBeenCalledWith(`products:id:${product.id}`, expect.any(Object));
  });

  it('should return a product by sku and cache the lookup separately', async () => {
    const product = {
      id: 'd2b8f2e8-8bd6-4aa7-b0a0-6d3f6be1b7d1',
      name: 'Phone',
      sku: 'PHONE-001',
    };

    productsRepository.findBySku.mockResolvedValue(product as never);

    await expect(service.findBySku('  PHONE-001  ')).resolves.toEqual(product);
    expect(productsRepository.findBySku).toHaveBeenCalledWith('PHONE-001');
    expect(cacheManager.set).toHaveBeenCalledWith('products:sku:PHONE-001', expect.any(Object));
  });

  it('should return cached id lookups without querying the repository', async () => {
    const cachedProduct = {
      id: 'd2b8f2e8-8bd6-4aa7-b0a0-6d3f6be1b7d1',
      name: 'Phone',
      sku: 'PHONE-001',
    };

    cacheManager.get.mockResolvedValue(cachedProduct);

    await expect(service.findById(cachedProduct.id)).resolves.toEqual(cachedProduct);
    expect(productsRepository.findById).not.toHaveBeenCalled();
    expect(cacheManager.set).not.toHaveBeenCalled();
  });

  it('should return cached sku lookups without querying the repository', async () => {
    const cachedProduct = {
      id: 'd2b8f2e8-8bd6-4aa7-b0a0-6d3f6be1b7d1',
      name: 'Phone',
      sku: 'PHONE-001',
    };

    cacheManager.get.mockResolvedValue(cachedProduct);

    await expect(service.findBySku('PHONE-001')).resolves.toEqual(cachedProduct);
    expect(productsRepository.findBySku).not.toHaveBeenCalled();
    expect(cacheManager.set).not.toHaveBeenCalled();
  });
});
