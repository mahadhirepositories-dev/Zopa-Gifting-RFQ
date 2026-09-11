import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const connectionString = process.env.DATABASE_URL;

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.client ?? postgres(connectionString, { max: 10 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });

interface MockUser {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  companyName: string;
  passwordHash: string;
  createdAt: Date;
}

export const mockUsersStore: MockUser[] = [];
