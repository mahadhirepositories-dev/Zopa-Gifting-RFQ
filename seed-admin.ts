import "dotenv/config";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

async function makeAdmin(email) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      console.log(`User with email ${email} not found. Please log in once via magic link so the user record is created, then run this again.`);
      process.exit(1);
    }

    await db.update(users).set({ role: "admin" }).where(eq(users.email, email));
    console.log(`Success! ${email} has been granted admin access.`);
    process.exit(0);
  } catch (error) {
    console.error("Error making admin:", error);
    process.exit(1);
  }
}

const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.log("Usage: npm run tsx seed-admin.ts <email>");
  process.exit(1);
}

makeAdmin(emailToPromote);
