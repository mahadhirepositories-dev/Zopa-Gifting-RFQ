import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const rfqs = pgTable("rfq", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull(),
  estimatedBudget: varchar("estimated_budget", { length: 100 }),
  deliveryLocation: varchar("delivery_location", { length: 255 }),
  customizationDetails: text("customization_details"),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rfqCompanies = pgTable("rfq_company", {
  id: serial("id").primaryKey(),
  rfpId: text("rfp_id")
    .notNull()
    .unique()
    .references(() => rfqs.id, { onDelete: "cascade" }),
  contactId: integer("contact_id"),
  name: text("company_name").notNull(),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull().default("Unknown"),
  state: text("state").notNull().default("Unknown"),
  postalCode: text("postal_code").notNull().default("Unknown"),
  country: text("country").notNull().default("Unknown"),
  businessType: text("business_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rfqCategories = pgTable("rfq_category", {
  id: serial("id").primaryKey(),
  rfpId: text("rfp_id")
    .notNull()
    .unique()
    .references(() => rfqs.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  subCategory: text("sub_category"),
  tags: text("tags"),
  serviceAreas: text("service_areas"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rfqRequirements = pgTable("rfq_requirement", {
  id: serial("id").primaryKey(),
  rfpId: text("rfp_id")
    .notNull()
    .unique()
    .references(() => rfqs.id, { onDelete: "cascade" }),
  projectName: text("project_name").notNull(),
  purpose: text("purpose").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
