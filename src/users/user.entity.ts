import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../orders/order.entity';

export enum UserRole {
  Admin = 'admin',
  Customer = 'customer',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Exclude()
  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Customer })
  role!: UserRole;

  @Exclude()
  @Column({ name: 'refresh_token_hash', type: 'text', nullable: true })
  refreshTokenHash!: string | null;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
