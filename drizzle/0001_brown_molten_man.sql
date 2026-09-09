CREATE TABLE "rfq_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfp_id" text NOT NULL,
	"category" text NOT NULL,
	"sub_category" text,
	"tags" text,
	"service_areas" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rfq_category_rfp_id_unique" UNIQUE("rfp_id")
);
--> statement-breakpoint
CREATE TABLE "rfq_requirement" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfp_id" text NOT NULL,
	"project_name" text NOT NULL,
	"purpose" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rfq_requirement_rfp_id_unique" UNIQUE("rfp_id")
);
--> statement-breakpoint
ALTER TABLE "rfq_category" ADD CONSTRAINT "rfq_category_rfp_id_rfq_id_fk" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_requirement" ADD CONSTRAINT "rfq_requirement_rfp_id_rfq_id_fk" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;