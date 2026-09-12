import {
  pgTable,
  text,
  jsonb,
  timestamp,
  serial,
  integer,
  boolean,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { rfqs } from "./rfp-create";

// Main vendor response table
export const vendorResponses = pgTable(
  "vendor_responses",
  {
    id: serial("id").primaryKey(),
    vendorResponseId: text("vendor_response_id").notNull().unique(),
    rfpId: text("rfp_id")
      .references(() => rfqs.id, { onDelete: "cascade" })
      .notNull(),
    vendorId: text("vendor_id").notNull(),
    vendorEmail: text("vendor_email").notNull(),
    status: text("status").default("draft"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("vendor_responses_updated_at_idx").on(table.updatedAt),
    index("vendor_responses_rfp_id_idx").on(table.rfpId),
    index("vendor_responses_vendor_email_idx").on(table.vendorEmail),
  ]
);

export const vendorCompanyDetails = pgTable(
  "vendor_company_details",
  {
    id: serial("id").primaryKey(),
    vendorResponseInternalId: integer("vendor_response_internal_id")
      .references(() => vendorResponses.id, { onDelete: "cascade" })
      .notNull(),
    companyName: text("company_name").notNull(),
    addressLine1: varchar("address_line_1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line_2", { length: 255 }),
    city: varchar("city", { length: 255 }).notNull().default("Unknown"),
    state: varchar("state", { length: 255 }).notNull().default("Unknown"),
    postalCode: varchar("postal_code", { length: 20 }).notNull().default("Unknown"),
    country: varchar("country", { length: 100 }).notNull().default("Unknown"),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    businessType: text("business_type").notNull(),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("vendor_company_details_email_idx").on(table.email),
    index("vendor_company_details_company_name_idx").on(table.companyName),
    index("vendor_company_details_created_at_idx").on(table.createdAt),
    index("vendor_company_details_city_idx").on(table.city),
    index("vendor_company_details_state_idx").on(table.state),
  ]
);

// Revisions table
export const vendorResponseRevisions = pgTable("vendor_response_revisions", {
  id: serial("id").primaryKey(),
  vendorResponseInternalId: integer("vendor_response_internal_id")
    .references(() => vendorResponses.id, { onDelete: "cascade" })
    .notNull(),
  revisionNumber: integer("revision_number").notNull(),
  isCurrent: boolean("is_current").default(true),
  scopeOfWork: jsonb("scope_of_work"),
  boqDetails: jsonb("boq_details"),
  evaluationCriteria: jsonb("evaluation_criteria"),
  financialTerms: jsonb("financial_terms"),
  generalTerms: jsonb("general_terms"),
  specialTerms: jsonb("special_terms"),
  buyerNotes: jsonb("buyer_notes"),
  otherInformation: jsonb("other_information"),
  attachments: jsonb("attachments").default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const vendorResponsesRelations = relations(
  vendorResponses,
  ({ one, many }) => ({
    rfq: one(rfqs, {
      fields: [vendorResponses.rfpId],
      references: [rfqs.id],
    }),
    companyDetails: one(vendorCompanyDetails, {
      fields: [vendorResponses.id],
      references: [vendorCompanyDetails.vendorResponseInternalId],
    }),
    revisions: many(vendorResponseRevisions),
  })
);

export const vendorResponseRevisionsRelations = relations(
  vendorResponseRevisions,
  ({ one }) => ({
    vendorResponse: one(vendorResponses, {
      fields: [vendorResponseRevisions.vendorResponseInternalId],
      references: [vendorResponses.id],
    }),
  })
);

export const vendorCompanyDetailsRelations = relations(
  vendorCompanyDetails,
  ({ one }) => ({
    vendorResponse: one(vendorResponses, {
      fields: [vendorCompanyDetails.vendorResponseInternalId],
      references: [vendorResponses.id],
    }),
  })
);
