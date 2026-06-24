import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { Stock } from './stock.entity';
import { StockRepository } from './stock.repository';
import { StockService } from './stock.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stock])],
  controllers: [StockController],
  providers: [StockRepository, StockService],
  exports: [StockRepository, StockService],
})
export class StockModule {}
