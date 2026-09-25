import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { users, giftingVendors, rfqs } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building2, FileText, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { getGiftingVendorsCount } from "@/lib/get-vendors";

export default async function AdminDashboard() {
  let buyersCount = [{ value: 0 }];
  let fluxVendorsCount = 0;
  let rfqsCount = [{ value: 0 }];
  let recentBuyers: any[] = [];
  let recentRfqs: any[] = [];
  let dbError = null;

  try {
    const [buyersRes, rfqsRes, vendorsRes] = await Promise.all([
      db.select({ value: count() }).from(users).where(eq(users.role, "user")).catch(() => [{ value: 0 }]),
      db.select({ value: count() }).from(rfqs).catch(() => [{ value: 0 }]),
      getGiftingVendorsCount().catch(() => 0),
    ]);

    buyersCount = buyersRes;
    rfqsCount = rfqsRes;
    fluxVendorsCount = vendorsRes;

    recentBuyers = await db
      .select()
      .from(users)
      .where(eq(users.role, "user"))
      .orderBy(desc(users.createdAt))
      .limit(5);

    recentRfqs = await db
      .select()
      .from(rfqs)
      .orderBy(desc(rfqs.createdAt))
      .limit(5);
  } catch (error: any) {
    console.error("Dashboard DB Error:", error);
    dbError = error.message;
  }

  const totalBuyers = Number(buyersCount[0]?.value || 0);
  const totalVendors = fluxVendorsCount;
  const totalRfqs = Number(rfqsCount[0]?.value || 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome to the ZOPA Gifting RFQ Administration Portal.
        </p>
      </div>

      {dbError && (
        <div className="p-4 text-red-900 bg-red-100 border border-red-200 rounded-lg">
          <p className="font-semibold">Database Error</p>
          <p className="text-sm">{dbError}</p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-600">
              Total Buyers
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">
              {totalBuyers}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered procurement buyers
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-600">
              Total Vendors
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Building2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">
              {totalVendors}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active corporate gifting suppliers
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-600">
              Total RFQs
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <FileText className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">
              {totalRfqs}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gifting quotes requested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Buyers */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Recent Buyers
              </CardTitle>
              <CardDescription className="text-xs">
                Latest buyer registrations
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-blue-600 hover:text-blue-700">
              <Link href="/admin/buyers">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Company</TableHead>
                  <TableHead className="text-xs">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBuyers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-slate-400 py-6 text-sm"
                    >
                      No buyers registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentBuyers.map((buyer) => (
                    <TableRow key={buyer.id} className="hover:bg-slate-50/50">
                      <TableCell className="py-2.5">
                        <div className="font-medium text-slate-900 text-xs">
                          {buyer.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {buyer.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {buyer.companyName || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {buyer.createdAt
                          ? format(new Date(buyer.createdAt), "dd MMM yyyy")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent RFQs */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Recent RFQs
              </CardTitle>
              <CardDescription className="text-xs">
                Latest quotations created
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-blue-600 hover:text-blue-700">
              <Link href="/admin/rfqs">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRfqs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-slate-400 py-6 text-sm"
                    >
                      No RFQs submitted yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentRfqs.map((rfq) => (
                    <TableRow key={rfq.id} className="hover:bg-slate-50/50">
                      <TableCell className="py-2.5 font-medium text-slate-900 text-xs">
                        {rfq.title || "Untitled RFQ"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {rfq.category || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rfq.status === "published"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px] capitalize px-2 py-0.5"
                        >
                          {rfq.status || "draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {rfq.createdAt
                          ? format(new Date(rfq.createdAt), "dd MMM yyyy")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
