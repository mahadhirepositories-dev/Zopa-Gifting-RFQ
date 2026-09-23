import "dotenv/config";
import { GET } from "../app/api/gifting-vendor/route";

async function testApi() {
  const req = new Request("http://localhost:3000/api/gifting-vendor");
  const res = await GET(req);
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Fetched vendors count:", data.length);
  console.log("Sample vendor from API:", data[0]);
}

testApi();
