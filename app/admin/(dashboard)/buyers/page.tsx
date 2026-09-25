import React from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { BuyersTable } from "./buyers-table";

export default async function AdminBuyersPage() {
  const buyersList = await db
    .select()
    .from(users)
    .where(eq(users.role, "user"))
    .orderBy(desc(users.createdAt));

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

      <BuyersTable initialBuyers={buyersList} />
    </div>
  );
}
