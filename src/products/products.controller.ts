import { Controller, Get, Query } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.productsService.findAll(query);
  }
}
