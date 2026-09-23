
import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  giftingCategories,
  giftingSubcategories,
  giftingTags,
} from "./schema/index";


export const SEED_DATA = [
  {
    category: "Festive Hampers",
    description: "Diwali, New Year, & Celebratory Gift Hampers",
    subcategories: [
      {
        name: "Diwali & New Year Hampers",
        description: "Premium hampers for Diwali and New Year celebrations",
        tags: [
          "Diwali Special",
          "Sweet Box",
          "Dry Fruits",
          "Pooja Thali",
          "Brass Lamps",
          "Eco Diya",
        ],
      },
      {
        name: "Holi & Spring Celebrations",
        description: "Colors, thandai, and spring festive hampers",
        tags: ["Organic Gulal", "Thandai Mix", "Sweets Hamper"],
      },
      {
        name: "Christmas & Year-End Gifts",
        description: "Plum cakes, candles, and winter celebratory gifts",
        tags: [
          "Plum Cake",
          "Scented Candles",
          "Winter Essentials",
          "New Year Diary",
        ],
      },
    ],
  },
  {
    category: "Corporate Gift Boxes",
    description: "Custom Branded Gift Boxes for Employees & Clients",
    subcategories: [
      {
        name: "Employee Welcome Kits",
        description: "Onboarding swag kits and desk essentials",
        tags: [
          "Onboarding Swag",
          "Custom Tumbler",
          "Lanyard & ID",
          "Notebook",
          "Branded Pen",
        ],
      },
      {
        name: "Client Appreciation Boxes",
        description: "Executive luxury hampers for valuable clients",
        tags: [
          "Executive Box",
          "Gourmet Treats",
          "Leather Portfolio",
          "Custom Flask",
        ],
      },
      {
        name: "Work Anniversary & Milestone Kits",
        description: "Kits celebrating milestones and service anniversaries",
        tags: ["Trophy & Plaque", "Achievement Pin", "Luxury Pen Set"],
      },
    ],
  },
  {
    category: "Custom Merchandise",
    description: "Apparel, Tech Gadgets, Drinkware, & Stationery",
    subcategories: [
      {
        name: "Apparel & Wearables",
        description: "Branded polo shirts, hoodies, jackets, and caps",
        tags: [
          "Polo T-Shirts",
          "Hoodies & Jackets",
          "Caps & Hats",
          "Custom Backpacks",
        ],
      },
      {
        name: "Tech Gadgets & Accessories",
        description: "Power banks, wireless earbuds, and chargers",
        tags: [
          "Power Banks",
          "Wireless Earbuds",
          "Bluetooth Speakers",
          "USB Drives",
        ],
      },
      {
        name: "Premium Drinkware",
        description: "Thermal bottles, mugs, and tumblers",
        tags: [
          "Stainless Steel Bottles",
          "Ceramic Mugs",
          "Thermal Flasks",
          "Coffee Tumblers",
        ],
      },
    ],
  },
  {
    category: "Eco-Friendly Gifting",
    description: "Sustainable, Recyclable, & Organic Products",
    subcategories: [
      {
        name: "Sustainable Office Supplies",
        description: "Seed paper, bamboo, and recycled paper items",
        tags: [
          "Seed Paper Notebooks",
          "Bamboo Pens",
          "Jute Folders",
          "Recycled Paper Bags",
        ],
      },
      {
        name: "Plant & Earth Hampers",
        description: "Desk plants, organic teas, and planters",
        tags: [
          "Desk Plants",
          "Organic Tea Set",
          "Terracotta Planters",
          "Handcrafted Soaps",
        ],
      },
    ],
  },
  {
    category: "Gourmet & Luxury",
    description: "Artisanal Chocolates, Dry Fruits, & Premium Hampers",
    subcategories: [
      {
        name: "Artisanal Chocolates & Confections",
        description: "Handcrafted truffles, baklava, and dark chocolates",
        tags: ["Handcrafted Truffles", "Dark Chocolates", "Baklava Box", "Macarons"],
      },
      {
        name: "Exotic Dry Fruits & Nuts",
        description: "Roasted cashews, almonds, and dates",
        tags: ["Roasted Cashews", "Flavored Almonds", "Organic Dates", "Berry Mix"],
      },
    ],
  },
  {
    category: "Tech Electronics",
    description: "Smart Devices, Wearables, and Desk Technology",
    subcategories: [
      {
        name: "Smart Devices & Desk Tech",
        description: "Fitness bands, wireless chargers, and desk organizers",
        tags: [
          "Smart Fitness Bands",
          "Desk Organizers",
          "Wireless Chargers",
          "Digital Clocks",
        ],
      },
    ],
  },
];

export async function seedCategories(force = false) {
  try {
    console.log("[SEED] Starting Category -> Subcategory -> Tags seeding...");

    await db.transaction(async (trx) => {
      if (force) {
        // Cascade delete tags, subcategories, and categories
        await trx.delete(giftingTags);
        await trx.delete(giftingSubcategories);
        await trx.delete(giftingCategories);
        console.log("[SEED] Cleared existing gifting categories data.");
      }

      for (const item of SEED_DATA) {
        // 1. Insert or find Category
        const [catRow] = await trx
          .insert(giftingCategories)
          .values({
            name: item.category,
            description: item.description,
          })
          .onConflictDoNothing({ target: giftingCategories.name })
          .returning({ id: giftingCategories.id });

        let categoryId = catRow?.id;

        if (!categoryId) {
          const [foundCat] = await trx
            .select({ id: giftingCategories.id })
            .from(giftingCategories)
            .where(eq(giftingCategories.name, item.category))
            .limit(1);
          categoryId = foundCat?.id;
        }

        if (!categoryId) continue;

        for (const sub of item.subcategories) {
          // 2. Insert Subcategory with FK categoryId
          const [subRow] = await trx
            .insert(giftingSubcategories)
            .values({
              categoryId: categoryId,
              name: sub.name,
              description: sub.description,
            })
            .returning({ id: giftingSubcategories.id });

          const subCategoryId = subRow?.id;
          if (!subCategoryId) continue;

          for (const tagName of sub.tags) {
            // 3. Insert Tag with FK subCategoryId
            await trx.insert(giftingTags).values({
              subCategoryId: subCategoryId,
              name: tagName,
            });
          }
        }
      }
    });

    console.log("[SEED] Gifting categories hierarchy seeded successfully!");
  } catch (error) {
    console.error("[SEED] Error seeding categories:", error);
    throw error;
  }
}

export async function seedAll() {
  await seedCategories(true);
}

if (typeof module !== "undefined" && typeof require !== "undefined" && require.main === module) {
  seedAll()
    .then(() => {
      console.log("[SEED] Seeding script completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[SEED] Seeding script failed:", err);
      process.exit(1);
    });
}
