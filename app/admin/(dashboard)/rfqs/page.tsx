import React from "react";
import { db } from "@/db";
import { rfqs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { RfqsTable } from "./rfqs-table";

export default async function AdminRFQsPage() {
  const rfqList = await db
    .select({
      id: rfqs.id,
      title: rfqs.title,
      status: rfqs.status,
      category: rfqs.category,
      quantity: rfqs.quantity,
      estimatedBudget: rfqs.estimatedBudget,
      deliveryLocation: rfqs.deliveryLocation,
      createdAt: rfqs.createdAt,
      userId: rfqs.userId,
      buyerName: users.name,
      buyerEmail: users.email,
      buyerCompany: users.companyName,
    })
    .from(rfqs)
    .leftJoin(users, eq(rfqs.userId, users.id))
    .orderBy(desc(rfqs.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          All RFQs
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor and inspect all quotations requested across the platform.
        </p>
      </div>

      <RfqsTable initialRfqs={rfqList} />
    </div>
  );
}
