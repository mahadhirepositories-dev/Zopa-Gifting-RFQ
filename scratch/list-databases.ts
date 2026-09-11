import "dotenv/config";
import postgres from "postgres";

async function listDbs() {
  const sql = postgres("postgres://postgres:12345@localhost:5432/postgres");
  try {
    const dbs = await sql`SELECT datname FROM pg_database WHERE datistemplate = false;`;
    console.log("Databases on PostgreSQL server:", dbs.map(d => d.datname));
  } catch (err) {
    console.error("Error listing databases:", err);
  } finally {
    await sql.end();
  }
}

listDbs();
