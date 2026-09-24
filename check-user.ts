import "dotenv/config";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

async function checkUser() {
  const [user] = await db.select().from(users).where(eq(users.email, "anbuselvanrajavel@outlook.com")).limit(1);
  console.log("User found:", user);
  process.exit(0);
}

checkUser();
