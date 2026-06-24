import { MigrationInterface, QueryRunner } from 'typeorm';

const defaultCustomerPasswordHash = '$2b$10$dZAaPnOiEZMHeBQiWYdxeOzIfkAo2EVINoICpOZZosM8VtNM7kFSe';

export class AddUserAuthFields1760000003000 implements MigrationInterface {
  name = 'AddUserAuthFields1760000003000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM ('admin', 'customer')`);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD "password_hash" text NOT NULL DEFAULT '${defaultCustomerPasswordHash}'
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD "role" "users_role_enum" NOT NULL DEFAULT 'customer'
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD "refresh_token_hash" text
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "refresh_token_hash"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "role"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "password_hash"');
    await queryRunner.query('DROP TYPE "users_role_enum"');
  }
}
