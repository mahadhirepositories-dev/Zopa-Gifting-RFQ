CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_registration" (
	"email" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company_name" text NOT NULL,
	"mobile_number" text NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"country" text NOT NULL,
	"state" text NOT NULL,
	"city" text NOT NULL,
	"postal_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"mobile_number" text,
	"company_name" text,
	"address_line1" text,
	"address_line2" text,
	"country" text,
	"state" text,
	"city" text,
	"postal_code" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gifting_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "gifting_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "gifting_subcategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gifting_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"subcategory_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gifting_vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"mobile_no" varchar(50),
	"category" text,
	"tags" text,
	"description" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100),
	"service_areas" text,
	"rating" integer DEFAULT 5,
	"logo_url" text,
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_boq_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"item_ref" uuid DEFAULT gen_random_uuid(),
	"category" varchar(255),
	"description" text,
	"quantity" numeric NOT NULL,
	"uom" varchar(50),
	"specification" json DEFAULT '{}'::json,
	"target_price" numeric,
	"logo_requirement" varchar(50) DEFAULT 'without_logo',
	"remarks" text,
	"is_visible" boolean DEFAULT true,
	"lop_price" numeric,
	"lop_gst" numeric,
	"lop_updated_at" timestamp,
	"lop_updated_by" varchar(255),
	"attachment_url" text,
	"attachment_name" text,
	"attachment_type" varchar(100),
	"attachment_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"category" text NOT NULL,
	"sub_category" text,
	"tags" text,
	"service_areas" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rfq_category_rfq_id_unique" UNIQUE("rfq_id")
);
--> statement-breakpoint
CREATE TABLE "rfq_company" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"contact_id" integer,
	"company_name" text NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"city" text DEFAULT 'Unknown' NOT NULL,
	"state" text DEFAULT 'Unknown' NOT NULL,
	"postal_code" text DEFAULT 'Unknown' NOT NULL,
	"country" text DEFAULT 'Unknown' NOT NULL,
	"business_type" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rfq_company_rfq_id_unique" UNIQUE("rfq_id")
);
--> statement-breakpoint
CREATE TABLE "rfq_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_name" varchar(255),
	"contact_title" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"contact_address_line_1" varchar(255),
	"contact_address_line_2" varchar(255),
	"contact_city" varchar(255),
	"contact_state" varchar(255),
	"contact_postal_code" varchar(20),
	"contact_country" varchar(100),
	"contact_department" varchar(255),
	"logo_url" varchar(1024),
	"logo_path" varchar(512),
	"logo_data" text,
	"logo_mime_type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"express_interest" boolean DEFAULT false,
	"rfq_limit" integer,
	"buyer_limit" integer,
	"max_vendors_per_rfq" integer,
	"credit_expires_at" timestamp,
	"use_custom_limits" boolean DEFAULT false NOT NULL,
	"is_global_limit_applied" boolean DEFAULT true NOT NULL,
	"last_global_update_at" timestamp,
	CONSTRAINT "rfq_contacts_contact_email_unique" UNIQUE("contact_email")
);
--> statement-breakpoint
CREATE TABLE "rfq_contacts_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"rfq_contact_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"original_end_date" date,
	"extension_count" integer DEFAULT 0 NOT NULL,
	"last_extended_at" timestamp,
	"last_extended_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"documents_to_share" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_evaluation_criteria" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"evaluation_criterion" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_financials" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text,
	"budget_type" varchar(50),
	"currency" varchar(50),
	"financial_notes" text,
	"payment_term" text,
	"payment_terms" json DEFAULT '[]'::json,
	"pbg" varchar(255),
	"pricing_model" varchar(255),
	"pbg_amount" varchar(255),
	"pbg_notes" text,
	"pricing_model_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_general_terms" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"general_terms" json DEFAULT '[]'::json,
	"custom_terms" json DEFAULT '[]'::json,
	"delivery_time_value" numeric,
	"delivery_time_unit" varchar(50),
	"delivery_locations" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_requirement" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"project_name" text NOT NULL,
	"purpose" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rfq_requirement_rfq_id_unique" UNIQUE("rfq_id")
);
--> statement-breakpoint
CREATE TABLE "rfq_scope" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"deliverables" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rfq_scope_rfq_id_unique" UNIQUE("rfq_id")
);
--> statement-breakpoint
CREATE TABLE "rfq_special_terms" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"special_terms" json DEFAULT '[]'::json,
	"custom_terms" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_vendor_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"mobile_no" varchar(50) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"email_sent" boolean DEFAULT false,
	"whatsapp_sent" boolean DEFAULT false,
	"country_code" varchar(10) DEFAULT '+91',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"selection_method" varchar(255),
	"vendor_requirements" text NOT NULL,
	"vendor_selection_process" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"quantity" integer NOT NULL,
	"estimated_budget" varchar(100),
	"delivery_location" varchar(255),
	"customization_details" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gifting_subcategories" ADD CONSTRAINT "gifting_subcategories_category_id_gifting_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."gifting_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gifting_tags" ADD CONSTRAINT "gifting_tags_subcategory_id_gifting_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."gifting_subcategories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_boq_items" ADD CONSTRAINT "rfq_boq_items_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_category" ADD CONSTRAINT "rfq_category_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_company" ADD CONSTRAINT "rfq_company_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_contacts_members" ADD CONSTRAINT "rfq_contacts_members_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_contacts_members" ADD CONSTRAINT "rfq_contacts_members_rfq_contact_id_rfq_contacts_id_fk" FOREIGN KEY ("rfq_contact_id") REFERENCES "public"."rfq_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_dates" ADD CONSTRAINT "rfq_dates_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_documents" ADD CONSTRAINT "rfq_documents_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_evaluation_criteria" ADD CONSTRAINT "rfq_evaluation_criteria_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_financials" ADD CONSTRAINT "rfq_financials_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_general_terms" ADD CONSTRAINT "rfq_general_terms_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_requirement" ADD CONSTRAINT "rfq_requirement_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_scope" ADD CONSTRAINT "rfq_scope_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_special_terms" ADD CONSTRAINT "rfq_special_terms_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_vendor_contacts" ADD CONSTRAINT "rfq_vendor_contacts_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_vendors" ADD CONSTRAINT "rfq_vendors_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq" ADD CONSTRAINT "rfq_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_subcategory_category_id" ON "gifting_subcategories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_tag_subcategory_id" ON "gifting_tags" USING btree ("subcategory_id");