// scripts/migrate.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const main = async () => {
  const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/questions_db";
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "drizzle/migrations" });
  await sql.end();
  process.exit(0);
};

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});