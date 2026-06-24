import AppDataSource from './data-source';

const customerPasswordHash = '$2b$10$dZAaPnOiEZMHeBQiWYdxeOzIfkAo2EVINoICpOZZosM8VtNM7kFSe';
const adminPasswordHash = '$2b$10$mlH1vNaEV6F9o5i4EzFO9OYUieUKUFRXNRXOPIcVcglMjRLYxYDdm';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (manager) => {
      await manager.query(
        `
          INSERT INTO "users" ("id", "name", "email", "password_hash", "role")
          VALUES
            ($1, $2, $3, $4, $5),
            ($6, $7, $8, $9, $10)
          ON CONFLICT ("email") DO UPDATE
          SET
            "name" = EXCLUDED."name",
            "password_hash" = EXCLUDED."password_hash",
            "role" = EXCLUDED."role",
            "updated_at" = now()
        `,
        [
          '11111111-1111-1111-1111-111111111111',
          'Demo Customer',
          'customer@example.com',
          customerPasswordHash,
          'customer',
          '55555555-5555-5555-5555-555555555555',
          'Demo Admin',
          'admin@example.com',
          adminPasswordHash,
          'admin',
        ],
      );

      await manager.query(
        `
          INSERT INTO "products" ("id", "name", "description", "image_url", "sku", "price_cents")
          VALUES
            ($1, $2, $3, $4, $5, $6),
            ($7, $8, $9, $10, $11, $12)
          ON CONFLICT ("sku") DO UPDATE
          SET
            "name" = EXCLUDED."name",
            "description" = EXCLUDED."description",
            "image_url" = EXCLUDED."image_url",
            "price_cents" = EXCLUDED."price_cents",
            "updated_at" = now()
        `,
        [
          '22222222-2222-2222-2222-222222222222',
          'Everyday Backpack',
          'Durable backpack with laptop storage.',
          'https://example.com/images/everyday-backpack.jpg',
          'BAG-001',
          5900,
          '33333333-3333-3333-3333-333333333333',
          'Insulated Bottle',
          'Stainless steel bottle for hot and cold drinks.',
          'https://example.com/images/insulated-bottle.jpg',
          'BOT-001',
          2400,
        ],
      );

      await manager.query(
        `
          INSERT INTO "stock" ("product_id", "warehouse_code", "warehouse_name", "quantity", "reserved_quantity")
          VALUES
            ($1, $2, $3, $4, $5),
            ($6, $7, $8, $9, $10),
            ($11, $12, $13, $14, $15)
          ON CONFLICT ("product_id", "warehouse_code") DO UPDATE
          SET
            "warehouse_name" = EXCLUDED."warehouse_name",
            "quantity" = EXCLUDED."quantity",
            "reserved_quantity" = EXCLUDED."reserved_quantity",
            "updated_at" = now()
        `,
        [
          '22222222-2222-2222-2222-222222222222',
          'HN-01',
          'Hanoi Warehouse',
          25,
          0,
          '22222222-2222-2222-2222-222222222222',
          'HCM-01',
          'Ho Chi Minh Warehouse',
          40,
          0,
          '33333333-3333-3333-3333-333333333333',
          'HN-01',
          'Hanoi Warehouse',
          75,
          0,
        ],
      );

      await manager.query(
        `
          INSERT INTO "orders" ("id", "user_id", "status", "total_cents")
          VALUES ($1, $2, $3, $4)
          ON CONFLICT ("id") DO UPDATE
          SET "status" = EXCLUDED."status", "total_cents" = EXCLUDED."total_cents", "updated_at" = now()
        `,
        ['44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'pending', 8300],
      );

      await manager.query(
        `
          INSERT INTO "order_items" ("order_id", "product_id", "quantity", "unit_price_cents", "line_total_cents")
          VALUES
            ($1, $2, $3, $4, $5),
            ($6, $7, $8, $9, $10)
          ON CONFLICT ("order_id", "product_id") DO UPDATE
          SET
            "quantity" = EXCLUDED."quantity",
            "unit_price_cents" = EXCLUDED."unit_price_cents",
            "line_total_cents" = EXCLUDED."line_total_cents",
            "updated_at" = now()
        `,
        [
          '44444444-4444-4444-4444-444444444444',
          '22222222-2222-2222-2222-222222222222',
          1,
          5900,
          5900,
          '44444444-4444-4444-4444-444444444444',
          '33333333-3333-3333-3333-333333333333',
          1,
          2400,
          2400,
        ],
      );
    });
  } finally {
    await AppDataSource.destroy();
  }
}

seed()
  .then(() => {
    console.log('Seed data inserted.');
  })
  .catch((error: unknown) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
