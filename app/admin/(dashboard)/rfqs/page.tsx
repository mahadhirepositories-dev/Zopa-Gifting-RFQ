import React from "react";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { RfqsTable } from "./rfqs-table";

export default async function AdminRFQsPage() {
  const rfqList = await db
    .select()
    .from(rfqs)
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
