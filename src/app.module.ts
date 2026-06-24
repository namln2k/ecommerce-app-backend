import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyvAdapter } from 'cache-manager';
import type { CacheManagerStore } from 'cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import Keyv from 'keyv';
import { validate } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { StockModule } from './stock/stock.module';
import databaseConfig from './config/database.config';
import kafkaConfig from './config/kafka.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import { AuthModule } from './auth/auth.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [databaseConfig, jwtConfig, redisConfig, kafkaConfig],
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [redisConfig.KEY],
      useFactory: async (redis: ConfigType<typeof redisConfig>) => {
        const redisUrl = new URL(redis.url);

        const store = await redisStore({
          host: redisUrl.hostname,
          port: Number(redisUrl.port || 6379),
          username: redisUrl.username ? decodeURIComponent(redisUrl.username) : undefined,
          password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
          db: redisUrl.pathname.length > 1 ? Number(redisUrl.pathname.slice(1)) : undefined,
          ttl: redis.ttlMs,
        });

        return {
          stores: [
            new Keyv({
              store: new KeyvAdapter(store as unknown as CacheManagerStore),
              namespace: redis.namespace,
              ttl: redis.ttlMs,
            }),
          ],
          ttl: redis.ttlMs,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (database: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        url: database.url,
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    UsersModule,
    AuthModule,
    KafkaModule,
    ProductsModule,
    StockModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
