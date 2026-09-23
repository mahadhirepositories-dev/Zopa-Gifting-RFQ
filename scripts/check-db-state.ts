import "dotenv/config";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 10, idle_timeout: 5 });

async function main() {
  // Check all public tables
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
  console.log("=== PUBLIC TABLES ===");
  tables.forEach((t) => console.log(" ", t.tablename));

  // Check vendor_responses columns
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'vendor_responses' AND table_schema = 'public' ORDER BY ordinal_position`;
  console.log("\n=== vendor_responses COLUMNS ===");
  cols.forEach((c) => console.log(" ", c.column_name));

  // Check rfq_approvals exists
  const approvals = await sql`SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rfq_approvals') as exists`;
  console.log("\nrfq_approvals exists:", approvals[0].exists);

  // Check rfq_approval_recommendations exists  
  const recs = await sql`SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rfq_approval_recommendations') as exists`;
  console.log("rfq_approval_recommendations exists:", recs[0].exists);

  // Check migration ledger
  const ledger = await sql`SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at`;
  console.log("\n=== MIGRATION LEDGER ===");
  ledger.forEach((r, i) => console.log(`  [${i}] hash=${r.hash} created_at=${r.created_at}`));
}

main()
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  })
  .finally(() => sql.end());
