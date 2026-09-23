import {
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
  integer,
} from "drizzle-orm/pg-core";

export const giftingVendors = pgTable("gifting_vendors", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  mobileNo: varchar("mobile_no", { length: 50 }),
  category: text("category"),
  tags: text("tags"),
  description: text("description"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  serviceAreas: text("service_areas"),
  rating: integer("rating").default(5),
  logoUrl: text("logo_url"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GiftingVendor = typeof giftingVendors.$inferSelect;
