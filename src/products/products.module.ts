import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Product } from './product.entity';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), AuthModule],
  controllers: [ProductsController],
  providers: [ProductsRepository, ProductsService],
  exports: [ProductsRepository, ProductsService],
})
export class ProductsModule {}
