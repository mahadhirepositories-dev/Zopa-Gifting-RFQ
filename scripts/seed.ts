import "dotenv/config";
import { seedCategories } from "../db/seed";

async function main() {
  try {
    await seedCategories(true);
    console.log("[SEED] Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[SEED] Error seeding database:", error);
    process.exit(1);
  }
}

main();
