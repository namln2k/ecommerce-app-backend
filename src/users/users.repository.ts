import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { applyListQuery, toPaginatedResponse } from '../common/utils/list-query.util';
import { User } from './user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findAll(query: ListQueryDto): Promise<PaginatedResponse<User>> {
    const queryBuilder = this.repository.createQueryBuilder('user');

    applyListQuery(queryBuilder, query, {
      defaultSortBy: 'createdAt',
      sortFields: {
        id: 'user.id',
        name: 'user.name',
        email: 'user.email',
        createdAt: 'user.createdAt',
        updatedAt: 'user.updatedAt',
      },
      filterFields: {
        id: { column: 'user.id', type: 'exact' },
        name: { column: 'user.name', type: 'string' },
        email: { column: 'user.email', type: 'string' },
      },
      searchFields: ['user.name', 'user.email'],
    });

    return toPaginatedResponse(queryBuilder, query);
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  create(user: Partial<User>): User {
    return this.repository.create(user);
  }
}
