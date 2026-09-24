import React from "react";
import { db } from "@/db";
import { users, giftingVendors, rfqs } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FileText } from "lucide-react";

export default async function AdminDashboard() {
  let buyersCount = [{ value: 0 }];
  let vendorsCount = [{ value: 0 }];
  let rfqsCount = [{ value: 0 }];
  let dbError = null;

  try {
    buyersCount = await db.select({ value: count() }).from(users).where(eq(users.role, "user"));
    vendorsCount = await db.select({ value: count() }).from(giftingVendors);
    rfqsCount = await db.select({ value: count() }).from(rfqs);
  } catch (error: any) {
    console.error("Dashboard DB Error:", error);
    dbError = error.message;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      
      {dbError && (
        <div className="p-4 mb-6 text-red-900 bg-red-100 border border-red-200 rounded-lg">
          <p className="font-semibold">Database Error</p>
          <p className="text-sm">{dbError}</p>
          <p className="text-sm mt-2 font-medium">Please ensure you have pushed the latest database schema (e.g., `npm run db:push`).</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total Buyers</CardTitle>
            <Users className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(buyersCount?.value || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total Vendors</CardTitle>
            <Building2 className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(vendorsCount?.value || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total RFQs</CardTitle>
            <FileText className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(rfqsCount?.value || 0)}</div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
