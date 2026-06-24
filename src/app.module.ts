import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { StockModule } from './stock/stock.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [databaseConfig, jwtConfig],
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (database: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        url: database.url,
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),
    UsersModule,
    ProductsModule,
    StockModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
