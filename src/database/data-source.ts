import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { OrderItem } from '../orders/order-item.entity';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { Stock } from '../stock/stock.entity';
import { User } from '../users/user.entity';
import { InitialSchema1760000000000 } from './migrations/1760000000000-InitialSchema';
import { AddStockQuantityNonNegative1760000001000 } from './migrations/1760000001000-AddStockQuantityNonNegative';

config({ path: `.env.${process.env.NODE_ENV ?? 'development'}`, quiet: true });
config({ quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to initialize TypeORM');
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [User, Product, Stock, Order, OrderItem],
  migrations: [InitialSchema1760000000000, AddStockQuantityNonNegative1760000001000],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
});

export default AppDataSource;
