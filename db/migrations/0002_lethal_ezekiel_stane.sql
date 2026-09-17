CREATE TABLE "rfq_approval_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"approval_id" integer,
	"vendor_response_id" text NOT NULL,
	"reason" text,
	"status" varchar(50) DEFAULT 'recommended' NOT NULL,
	"recommender_role" varchar(50) DEFAULT 'buyer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending_approval' NOT NULL,
	"approval_level" varchar(20) DEFAULT 'level1' NOT NULL,
	"level1_approver_email" varchar(255),
	"level2_approver_email" varchar(255),
	"level1_status" varchar(50) DEFAULT 'pending',
	"level2_status" varchar(50) DEFAULT 'pending',
	"buyer_comments" text,
	"level1_comments" text,
	"level2_comments" text,
	"level1_reviewed_at" timestamp,
	"level2_reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendor_company_details" DROP CONSTRAINT "vcd_vendor_resp_id_fk";
--> statement-breakpoint
ALTER TABLE "vendor_response_revisions" DROP CONSTRAINT "vrr_vendor_resp_id_fk";
--> statement-breakpoint
ALTER TABLE "vendor_responses" ADD COLUMN "qualification_status" text DEFAULT 'qualified';--> statement-breakpoint
ALTER TABLE "rfq_approval_recommendations" ADD CONSTRAINT "rfq_approval_recommendations_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_approval_recommendations" ADD CONSTRAINT "rfq_approval_recommendations_approval_id_rfq_approvals_id_fk" FOREIGN KEY ("approval_id") REFERENCES "public"."rfq_approvals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_approvals" ADD CONSTRAINT "rfq_approvals_rfq_id_rfq_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_company_details" ADD CONSTRAINT "vendor_company_details_vendor_response_internal_id_vendor_responses_id_fk" FOREIGN KEY ("vendor_response_internal_id") REFERENCES "public"."vendor_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_response_revisions" ADD CONSTRAINT "vendor_response_revisions_vendor_response_internal_id_vendor_responses_id_fk" FOREIGN KEY ("vendor_response_internal_id") REFERENCES "public"."vendor_responses"("id") ON DELETE cascade ON UPDATE no action;