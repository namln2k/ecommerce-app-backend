import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { UserRole } from '../users/user.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin, UserRole.Customer)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.ordersService.findAll(query);
  }
}
