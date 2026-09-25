import React from "react";
import { db } from "@/db";
import { giftingVendors } from "@/db/schema";
import { desc } from "drizzle-orm";
import { VendorsTable } from "./vendors-table";

export default async function AdminVendorsPage() {
  const vendorsList = await db
    .select()
    .from(giftingVendors)
    .orderBy(desc(giftingVendors.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Registered Vendors
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Catalog of corporate gifting vendors and suppliers.
        </p>
      </div>

      <VendorsTable initialVendors={vendorsList} />
    </div>
  );
}
