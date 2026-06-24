import { Injectable } from '@nestjs/common';
import { StockRepository } from './stock.repository';

@Injectable()
export class StockService {
  constructor(private readonly stockRepository: StockRepository) {}

  findAll() {
    return this.stockRepository.findAll();
  }
}
