import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockReservedQuantity1760000002000 implements MigrationInterface {
  name = 'AddStockReservedQuantity1760000002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "stock"
      ADD "reserved_quantity" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "stock"
      ADD CONSTRAINT "CHK_stock_reserved_quantity_non_negative"
      CHECK ("reserved_quantity" >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE "stock"
      ADD CONSTRAINT "CHK_stock_reserved_quantity_lte_quantity"
      CHECK ("reserved_quantity" <= "quantity")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "stock" DROP CONSTRAINT "CHK_stock_reserved_quantity_lte_quantity"');
    await queryRunner.query('ALTER TABLE "stock" DROP CONSTRAINT "CHK_stock_reserved_quantity_non_negative"');
    await queryRunner.query('ALTER TABLE "stock" DROP COLUMN "reserved_quantity"');
  }
}
