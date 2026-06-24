import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: Pick<ProductsRepository, 'findAll'>;
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
});
