ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "rfq_company" ADD COLUMN "is_phone_masked" boolean DEFAULT false;