import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { UserRole } from '../users/user.entity';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.productsService.findAll(query);
  }
}
