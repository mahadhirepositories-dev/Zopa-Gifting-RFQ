import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USER) {
  throw new Error("Missing required environment variables");
}

export default defineConfig({
  schema: "./db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  },
  verbose: true,
  strict: true,
});
