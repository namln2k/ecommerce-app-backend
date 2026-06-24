import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: { findAll: jest.Mock; search: jest.Mock; findBySku: jest.Mock; findById: jest.Mock };

  beforeEach(async () => {
    productsService = {
      findAll: jest.fn(),
      search: jest.fn(),
      findBySku: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should proxy list requests to the service', () => {
    const query = { page: 1 } as never;

    controller.findAll(query);

    expect(productsService.findAll).toHaveBeenCalledWith(query);
  });

  it('should proxy search requests to the service', () => {
    const query = { q: 'phone' } as never;

    controller.search(query);

    expect(productsService.search).toHaveBeenCalledWith(query);
  });

  it('should proxy sku requests to the service', () => {
    const sku = 'SKU-123';

    controller.findBySku(sku);

    expect(productsService.findBySku).toHaveBeenCalledWith(sku);
  });

  it('should proxy id requests to the service', () => {
    const id = 'd2b8f2e8-8bd6-4aa7-b0a0-6d3f6be1b7d1';

    controller.findById(id);

    expect(productsService.findById).toHaveBeenCalledWith(id);
  });
});
