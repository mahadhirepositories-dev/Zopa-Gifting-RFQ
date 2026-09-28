import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBuyerWithRfqs } from "@/lib/admin-rfq-data";
import { format } from "date-fns";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  FileText,
  Clock,
  Send,
  Eye,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BuyerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BuyerDetailPage({ params }: BuyerDetailPageProps) {
  const { id } = await params;
  const data = await getBuyerWithRfqs(id);

  if (!data || !data.buyer) {
    notFound();
  }

  const { buyer, rfqs } = data;
  const initial = (buyer.name || buyer.email || "B").charAt(0).toUpperCase();

  const totalRfqs = rfqs.length;
  const submittedRfqs = rfqs.filter(
    (r) => (r.status || "").toLowerCase() === "submitted" || (r.status || "").toLowerCase() === "published"
  ).length;
  const draftRfqs = rfqs.filter(
    (r) => !r.status || (r.status || "").toLowerCase() === "draft"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-slate-600 hover:text-slate-900 border-slate-200 gap-1.5 h-9"
          >
            <Link href="/admin/buyers">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Registered Buyers</span>
            </Link>
          </Button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Buyer Details & RFQs
          </span>
        </div>
      </div>

      {/* Buyer Profile Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-slate-100 shadow-xs">
              <AvatarImage src={buyer.image || undefined} alt={buyer.name} />
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xl">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {buyer.name}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Buyer
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {buyer.email}
                </span>
                {buyer.mobileNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {buyer.mobileNumber}
                  </span>
                )}
                {buyer.companyName && (
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Building className="w-4 h-4 text-slate-400" />
                    {buyer.companyName}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {buyer.createdAt ? format(new Date(buyer.createdAt), "dd MMM yyyy") : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards for this Buyer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200 bg-white shadow-2xs">
          <CardContent className="p-5 sm:p-6 pt-5 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total RFQs Created
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {totalRfqs}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-2xs">
          <CardContent className="p-5 sm:p-6 pt-5 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Submitted / Active RFQs
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
                  {submittedRfqs}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-2xs">
          <CardContent className="p-5 sm:p-6 pt-5 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Draft RFQs
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1">
                  {draftRfqs}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFQs List for this Buyer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              RFQs Submitted by {buyer.name || "this Buyer"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review all procurement requirements and quotations created by this account.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold bg-slate-50">
            {rfqs.length} {rfqs.length === 1 ? "RFQ" : "RFQs"}
          </Badge>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="w-[320px]">RFQ Title & ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-slate-500 py-12 text-sm"
                  >
                    No RFQs have been submitted or created by this buyer yet.
                  </TableCell>
                </TableRow>
              ) : (
                rfqs.map((rfq) => {
                  const isSubmitted =
                    (rfq.status || "").toLowerCase() === "submitted" ||
                    (rfq.status || "").toLowerCase() === "published";

                  return (
                    <TableRow key={rfq.id} className="hover:bg-slate-50/60">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-900 text-sm truncate">
                              {rfq.title || "Untitled RFQ"}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID: {rfq.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-700">
                        {rfq.category || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {rfq.quantity ? rfq.quantity.toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isSubmitted ? "default" : "secondary"}
                          className={`text-[10px] capitalize px-2 py-0.5 ${
                            isSubmitted
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {rfq.status || "draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {rfq.createdAt
                          ? format(new Date(rfq.createdAt), "dd MMM yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1.5 h-8 border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Link href={`/admin/rfqs/${rfq.id}?from=buyer&buyerId=${buyer.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect RFQ</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
