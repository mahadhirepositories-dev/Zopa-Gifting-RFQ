import "dotenv/config";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

async function makeAdmin(email) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      console.log(`User with email ${email} not found. Creating new admin user...`);
      await db.insert(users).values({
        id: crypto.randomUUID(),
        name: "Admin User",
        email: email,
        emailVerified: false,
        role: "admin",
      });
      console.log(`Success! Admin user created for ${email}. You can now log in.`);
      process.exit(0);
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
