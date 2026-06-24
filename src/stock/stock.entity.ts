import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';

@Entity({ name: 'stock' })
@Index(['productId', 'warehouseCode'], { unique: true })
@Check('CHK_stock_quantity_non_negative', '"quantity" >= 0')
@Check('CHK_stock_reserved_quantity_non_negative', '"reserved_quantity" >= 0')
@Check('CHK_stock_reserved_quantity_lte_quantity', '"reserved_quantity" <= "quantity"')
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.stockItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'warehouse_code', type: 'varchar', length: 80 })
  warehouseCode!: string;

  @Column({ name: 'warehouse_name', type: 'varchar', length: 180, nullable: true })
  warehouseName!: string | null;

  @Column({ type: 'integer', default: 0 })
  quantity!: number;

  @Column({ name: 'reserved_quantity', type: 'integer', default: 0 })
  reservedQuantity!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
