import React from "react";
import { db } from "@/db";
import { users, giftingVendors, rfqs } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FileText } from "lucide-react";

export default async function AdminDashboard() {
  const [buyersCount] = await db.select({ value: count() }).from(users).where(eq(users.role, "user"));
  const [vendorsCount] = await db.select({ value: count() }).from(giftingVendors);
  const [rfqsCount] = await db.select({ value: count() }).from(rfqs);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      
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
