import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockQuantityNonNegative1760000001000 implements MigrationInterface {
  name = 'AddStockQuantityNonNegative1760000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "stock"
      ADD CONSTRAINT "CHK_stock_quantity_non_negative"
      CHECK ("quantity" >= 0)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "stock" DROP CONSTRAINT "CHK_stock_quantity_non_negative"');
  }
}
