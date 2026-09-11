import "dotenv/config";
import config from "../drizzle.config";
import { readMigrationFiles, type MigrationConfig } from "drizzle-orm/migrator";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: config.out!,
  migrationsTable: config.migrations?.table ?? "__drizzle_migrations",
  migrationsSchema: config.migrations?.schema ?? "drizzle",
};

const migrations = readMigrationFiles(migrationConfig);
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const tableRef = `${migrationConfig.migrationsSchema}.${migrationConfig.migrationsTable}`;

async function main() {
  await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS ${migrationConfig.migrationsSchema}`);
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS ${tableRef} (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  const existing = await sql`SELECT hash FROM ${sql(tableRef)}`;
  const existingHashes = new Set(existing.map((r) => r.hash as string));

  let added = 0;
  for (const migration of migrations) {
    if (!existingHashes.has(migration.hash)) {
      console.log(`+ Backfilling ${migration.hash} (created_at=${migration.folderMillis})`);
      await sql`
        INSERT INTO ${sql(tableRef)} (hash, created_at)
        VALUES (${migration.hash}, ${migration.folderMillis})
      `;
      added++;
    }
  }

  console.log(
    added === 0
      ? "Ledger already in sync — nothing to do."
      : `Synced ${added} migration(s) into ${tableRef}.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => sql.end());