import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
