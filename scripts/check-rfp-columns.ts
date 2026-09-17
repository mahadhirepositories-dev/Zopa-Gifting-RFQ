import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function checkColumns() {
  const tables = ['rfq_company', 'rfq_category', 'rfq_requirement'];
  
  for (const table of tables) {
    const cols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${table} AND column_name IN ('rfp_id', 'rfq_id')
    `;
    console.log(`Table ${table} has:`, cols.map(c => c.column_name).join(', '));
  }
}

checkColumns()
  .catch(console.error)
  .finally(() => sql.end());
