import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  serial,
  boolean,
  numeric,
  json,
  uuid,
  date,
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
  rfqId: text("rfq_id")
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
  rfqId: text("rfq_id")
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
  rfqId: text("rfq_id")
    .notNull()
    .unique()
    .references(() => rfqs.id, { onDelete: "cascade" }),
  projectName: text("project_name").notNull(),
  purpose: text("purpose").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rfqScope = pgTable("rfq_scope", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .notNull()
    .unique()
    .references(() => rfqs.id, { onDelete: "cascade" }),
  deliverables: text("deliverables"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rfqBoqItems = pgTable("rfq_boq_items", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .references(() => rfqs.id, { onDelete: "cascade" })
    .notNull(),
  itemRef: uuid("item_ref").defaultRandom(),
  category: varchar("category", { length: 255 }),
  description: text("description"),
  qty: numeric("quantity").notNull(),
  uom: varchar("uom", { length: 50 }),
  specification: json("specification").default({}),
  targetPrice: numeric("target_price"),
  remarks: text("remarks"),
  isVisible: boolean("is_visible").default(true),
  lopPrice: numeric("lop_price"),
  lopGst: numeric("lop_gst"),
  lopUpdatedAt: timestamp("lop_updated_at"),
  lopUpdatedBy: varchar("lop_updated_by", { length: 255 }),
  attachmentUrl: text("attachment_url"),
  attachmentName: text("attachment_name"),
  attachmentType: varchar("attachment_type", { length: 100 }),
  attachmentSize: integer("attachment_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rfqEvaluationCriteria = pgTable("rfq_evaluation_criteria", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .references(() => rfqs.id, { onDelete: "cascade" })
    .notNull(),
  evaluation: varchar("evaluation_criterion", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Financial details
export const rfqFinancials = pgTable("rfq_financials", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .references(() => rfqs.id, { onDelete: "cascade" }),
  budgetType: varchar("budget_type", { length: 50 }),
  currency: varchar("currency", { length: 50 }),
  financialNotes: text("financial_notes"),
  paymentTerm: text("payment_term"),
  paymentTerms: json("payment_terms").default([]),
  pbg: varchar("pbg", { length: 255 }),
  pricingModel: varchar("pricing_model", { length: 255 }),
  pbgAmount: varchar("pbg_amount", { length: 255 }),
  pbgNotes: text("pbg_notes"),
  pricingModelNotes: text("pricing_model_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const rfqGeneralTerms = pgTable("rfq_general_terms", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .references(() => rfqs.id, { onDelete: "cascade" })
    .notNull(),
  selectedTerms: json("general_terms").default([]),
  customTerms: json("custom_terms").default([]),
  deliveryTimeValue: numeric("delivery_time_value"),
  deliveryTimeUnit: varchar("delivery_time_unit", { length: 50 }),
  deliveryLocations: json("delivery_locations").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Special terms
export const rfqSpecialTerms = pgTable("rfq_special_terms", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .references(() => rfqs.id, { onDelete: "cascade" })
    .notNull(),
  selectedTerms: json("special_terms").default([]),
  customTerms: json("custom_terms").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Documents to share
export const rfqDocuments = pgTable("rfq_documents", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .references(() => rfqs.id, { onDelete: "cascade" })
    .notNull(),
  documentsToShare: text("documents_to_share").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact information

export const rfqContacts = pgTable("rfq_contacts", {
  id: serial("id").primaryKey(),
  contactName: varchar("contact_name", { length: 255 }),
  contactTitle: varchar("contact_title", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }).unique(),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactAddressLine1: varchar("contact_address_line_1", { length: 255 }),
  contactAddressLine2: varchar("contact_address_line_2", { length: 255 }),
  contactCity: varchar("contact_city", { length: 255 }),
  contactState: varchar("contact_state", { length: 255 }),
  contactPostalCode: varchar("contact_postal_code", { length: 20 }),
  contactCountry: varchar("contact_country", { length: 100 }),
  contactDepartment: varchar("contact_department", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 1024 }),
  logoPath: varchar("logo_path", { length: 512 }),
  logoData: text("logo_data"),
  logoMimeType: varchar("logo_mime_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  expressInterest: boolean("express_interest").default(false),
  rfqLimit: integer("rfq_limit"),
  buyerLimit: integer("buyer_limit"),
  maxVendorsPerrfq: integer("max_vendors_per_rfq"),
  creditExpiresAt: timestamp("credit_expires_at"),
  useCustomLimits: boolean("use_custom_limits").default(false).notNull(),
  isGlobalLimitApplied: boolean("is_global_limit_applied")
    .default(true)
    .notNull(),
  lastGlobalUpdateAt: timestamp("last_global_update_at"),
});

export const rfqContactsMembers = pgTable("rfq_contacts_members", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .references(() => rfqs.id, { onDelete: "cascade" })
    .notNull(),
  rfqContactId: integer("rfq_contact_id")
    .references(() => rfqContacts.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vendor selection criteria
export const rfqVendors = pgTable("rfq_vendors", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .references(() => rfqs.id, { onDelete: "cascade" })
    .notNull(),
  selectionMethod: varchar("selection_method", { length: 255 }),
  vendorRequirements: text("vendor_requirements").notNull(),
  vendorSelectionProcess: text("vendor_selection_process").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rfqVendorContacts = pgTable("rfq_vendor_contacts", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .notNull()
    .references(() => rfqs.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  mobileNo: varchar("mobile_no", { length: 50 }).notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  email_sent: boolean("email_sent").default(false),
  whatsapp_sent: boolean("whatsapp_sent").default(false),
  countryCode: varchar("country_code", { length: 10 }).default("+91"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rfqDates = pgTable("rfq_dates", {
  id: serial("id").primaryKey(),
  rfqId: text("rfq_id")
    .references(() => rfqs.id, { onDelete: "cascade" })
    .notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  originalEndDate: date("original_end_date"),
  extensionCount: integer("extension_count").default(0).notNull(),
  lastExtendedAt: timestamp("last_extended_at"),
  lastExtendedBy: text("last_extended_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rfqApprovalStatus = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected",
  REVISION_REQUESTED: "revision_requested",
  SENT: "sent",
} as const;
