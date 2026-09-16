import postgres from "postgres";

async function countRows() {
  const connString = "postgres://postgres:12345@localhost:5432/zopa-rfp";
  const sql = postgres(connString);
  try {
    const masterVendorContacts = await sql`SELECT COUNT(*) FROM master_vendor_contacts`;
    console.log("Count in master_vendor_contacts:", masterVendorContacts[0].count);

    const giftingVendors = await sql`SELECT COUNT(*) FROM gifting_vendors`;
    console.log("Count in gifting_vendors:", giftingVendors[0].count);

    const sampleMaster = await sql`SELECT id, name, company_name, email, phone_number, category, description, tags, city, state, country FROM master_vendor_contacts LIMIT 3`;
    console.log("Sample master_vendor_contacts:", sampleMaster);

    const sampleGifting = await sql`SELECT id, name, company_name, email, phone_number, category, description, tags, city, state, country FROM gifting_vendors LIMIT 3`;
    console.log("Sample gifting_vendors:", sampleGifting);

  } catch (err) {
    console.error("Error querying zopa-rfp:", err);
  } finally {
    await sql.end();
  }
}

countRows();
