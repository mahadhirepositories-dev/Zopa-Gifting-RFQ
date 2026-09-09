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
ALTER TABLE "gifting_subcategories" ADD CONSTRAINT "gifting_subcategories_category_id_gifting_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."gifting_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gifting_tags" ADD CONSTRAINT "gifting_tags_subcategory_id_gifting_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."gifting_subcategories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_subcategory_category_id" ON "gifting_subcategories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_tag_subcategory_id" ON "gifting_tags" USING btree ("subcategory_id");