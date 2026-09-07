import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL as string;

const client = postgres(connectionString, { max: 10 });

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
