CREATE TABLE "vendor_company_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_response_internal_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"address_line_1" varchar(255) NOT NULL,
	"address_line_2" varchar(255),
	"city" varchar(255) DEFAULT 'Unknown' NOT NULL,
	"state" varchar(255) DEFAULT 'Unknown' NOT NULL,
	"postal_code" varchar(20) DEFAULT 'Unknown' NOT NULL,
	"country" varchar(100) DEFAULT 'Unknown' NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"business_type" text NOT NULL,
	"logo_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_response_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_response_internal_id" integer NOT NULL,
	"revision_number" integer NOT NULL,
	"is_current" boolean DEFAULT true,
	"scope_of_work" jsonb,
	"boq_details" jsonb,
	"evaluation_criteria" jsonb,
	"financial_terms" jsonb,
	"general_terms" jsonb,
	"special_terms" jsonb,
	"buyer_notes" jsonb,
	"other_information" jsonb,
	"attachments" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_response_id" text NOT NULL,
	"rfp_id" text NOT NULL,
	"vendor_id" text NOT NULL,
	"vendor_email" text NOT NULL,
	"status" text DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vendor_responses_vendor_response_id_unique" UNIQUE("vendor_response_id")
);
--> statement-breakpoint
ALTER TABLE "vendor_company_details" ADD CONSTRAINT "vcd_vendor_resp_id_fk" FOREIGN KEY ("vendor_response_internal_id") REFERENCES "public"."vendor_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_response_revisions" ADD CONSTRAINT "vrr_vendor_resp_id_fk" FOREIGN KEY ("vendor_response_internal_id") REFERENCES "public"."vendor_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_responses" ADD CONSTRAINT "vendor_responses_rfp_id_rfq_id_fk" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vendor_company_details_email_idx" ON "vendor_company_details" USING btree ("email");--> statement-breakpoint
CREATE INDEX "vendor_company_details_company_name_idx" ON "vendor_company_details" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "vendor_company_details_created_at_idx" ON "vendor_company_details" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vendor_company_details_city_idx" ON "vendor_company_details" USING btree ("city");--> statement-breakpoint
CREATE INDEX "vendor_company_details_state_idx" ON "vendor_company_details" USING btree ("state");--> statement-breakpoint
CREATE INDEX "vendor_responses_updated_at_idx" ON "vendor_responses" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "vendor_responses_rfp_id_idx" ON "vendor_responses" USING btree ("rfp_id");--> statement-breakpoint
CREATE INDEX "vendor_responses_vendor_email_idx" ON "vendor_responses" USING btree ("vendor_email");