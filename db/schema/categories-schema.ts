import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categoriesMaster = pgTable("gifting_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subCategoriesMaster = pgTable(
  "gifting_subcategories",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categoriesMaster.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("idx_subcategory_category_id").on(table.categoryId)],
);

export const tagsMaster = pgTable(
  "gifting_tags",
  {
    id: serial("id").primaryKey(),
    subCategoryId: integer("subcategory_id")
      .notNull()
      .references(() => subCategoriesMaster.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("idx_tag_subcategory_id").on(table.subCategoryId)],
);

// Drizzle Relations
export const categoriesRelations = relations(categoriesMaster, ({ many }) => ({
  subcategories: many(subCategoriesMaster),
}));

export const subCategoriesRelations = relations(
  subCategoriesMaster,
  ({ one, many }) => ({
    category: one(categoriesMaster, {
      fields: [subCategoriesMaster.categoryId],
      references: [categoriesMaster.id],
    }),
    tags: many(tagsMaster),
  }),
);

export const tagsRelations = relations(tagsMaster, ({ one }) => ({
  subcategory: one(subCategoriesMaster, {
    fields: [tagsMaster.subCategoryId],
    references: [subCategoriesMaster.id],
  }),
}));

// Aliases matching user seed convention
export const giftingCategories = categoriesMaster;
export const giftingSubcategories = subCategoriesMaster;
export const giftingTags = tagsMaster;
