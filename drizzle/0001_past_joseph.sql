ALTER TABLE "rfq_financials" ALTER COLUMN "rfq_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rfq_financials" ALTER COLUMN "currency" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "rfq_financials" ALTER COLUMN "payment_term" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rfq_financials" ALTER COLUMN "pbg_amount" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "rfq_financials" ADD COLUMN "rfp_id" text;--> statement-breakpoint
ALTER TABLE "rfq_financials" ADD COLUMN "payment_terms" json DEFAULT '[]'::json;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rfq_financials" ADD CONSTRAINT "rfq_financials_rfp_id_rfq_id_fk" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfq"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;