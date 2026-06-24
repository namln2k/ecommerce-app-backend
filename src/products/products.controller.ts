import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { SearchProductsQueryDto } from './dto/search-products-query.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('search')
  search(@Query() query: SearchProductsQueryDto) {
    return this.productsService.search(query);
  }

  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findById(id);
  }
}
