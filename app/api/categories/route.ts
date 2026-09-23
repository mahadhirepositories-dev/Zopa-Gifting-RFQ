/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { categoriesMaster, subCategoriesMaster, tagsMaster } from "@/db/schema";
import { eq } from "drizzle-orm";
import { seedCategories } from "@/db/seed";

interface CategoryHierarchyFilters {
  categoryNames?: string[];
  subCategoryNames?: string[];
}

async function fetchCategoryHierarchy(filters: CategoryHierarchyFilters = {}) {
  const { categoryNames = [], subCategoryNames = [] } = filters;

  const categories = await db.select().from(categoriesMaster);

  let subCategories = await db
    .select({
      id: subCategoriesMaster.id,
      categoryId: subCategoriesMaster.categoryId,
      categoryName: categoriesMaster.name,
      name: subCategoriesMaster.name,
    })
    .from(subCategoriesMaster)
    .innerJoin(
      categoriesMaster,
      eq(subCategoriesMaster.categoryId, categoriesMaster.id),
    );

  if (categoryNames.length > 0) {
    subCategories = subCategories.filter((sub) =>
      categoryNames.includes(sub.categoryName),
    );
  }

  let tags = await db
    .select({
      id: tagsMaster.id,
      subCategoryId: tagsMaster.subCategoryId,
      subCategoryName: subCategoriesMaster.name,
      name: tagsMaster.name,
    })
    .from(tagsMaster)
    .innerJoin(
      subCategoriesMaster,
      eq(tagsMaster.subCategoryId, subCategoriesMaster.id),
    );

  if (subCategoryNames.length > 0) {
    tags = tags.filter((tag) => subCategoryNames.includes(tag.subCategoryName));
  } else if (categoryNames.length > 0) {
    const allowedSubCatIds = subCategories.map((s) => s.id);
    tags = tags.filter((t) => allowedSubCatIds.includes(t.subCategoryId));
  }

  return { categories, subCategories, tags };
}

// GET /api/categories?
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryNames =
      searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const subCategoryNames =
      searchParams.get("subcategories")?.split(",").filter(Boolean) || [];

    const existingCount = await db
      .select({ id: categoriesMaster.id })
      .from(categoriesMaster)
      .limit(1);

    if (existingCount.length === 0) {
      console.log("[categories] Table empty — running one-time seed.");
      await seedCategories(false);
    }

    const { categories, subCategories, tags } = await fetchCategoryHierarchy({
      categoryNames,
      subCategoryNames,
    });

    return NextResponse.json({ categories, subCategories, tags });
  } catch (error: any) {
    console.error("[categories] Error fetching category hierarchy:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch categories hierarchy." },
      { status: 500 },
    );
  }
}

// POST /api/categories
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body.force !== undefined && typeof body.force !== "boolean") {
      return NextResponse.json(
        { error: "'force' must be a boolean if provided." },
        { status: 400 },
      );
    }

    const force = body.force === true;

    await seedCategories(force);

    const { categories, subCategories, tags } = await fetchCategoryHierarchy();

    return NextResponse.json({
      success: true,
      message: force
        ? "Categories, subcategories, and tags reseeded (existing data cleared)."
        : "Categories, subcategories, and tags seeded (existing data preserved).",
      counts: {
        categories: categories.length,
        subCategories: subCategories.length,
        tags: tags.length,
      },
      categories,
      subCategories,
      tags,
    });
  } catch (error: any) {
    console.error("[categories] Error seeding category hierarchy:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to seed categories hierarchy." },
      { status: 500 },
    );
  }
}
