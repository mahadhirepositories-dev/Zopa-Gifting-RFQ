import React from "react";
import { db } from "@/db";
import { users, rfqs } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { BuyersTable } from "./buyers-table";

export default async function AdminBuyersPage() {
  const buyersList = await db
    .select()
    .from(users)
    .where(eq(users.role, "user"))
    .orderBy(desc(users.createdAt));

  // Count RFQs per buyer
  const rfqCounts = await db
    .select({
      userId: rfqs.userId,
      count: sql<number>`count(*)::int`,
    })
    .from(rfqs)
    .groupBy(rfqs.userId);

  const rfqCountMap = new Map<string, number>();
  rfqCounts.forEach((rc) => {
    if (rc.userId) {
      rfqCountMap.set(rc.userId, rc.count);
    }
  });

  const enrichedBuyers = buyersList.map((buyer) => ({
    ...buyer,
    rfqCount: rfqCountMap.get(buyer.id) || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Registered Buyers
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage and review registered corporate procurement buyers.
        </p>
      </div>

      <BuyersTable initialBuyers={enrichedBuyers} />
    </div>
  );
}
