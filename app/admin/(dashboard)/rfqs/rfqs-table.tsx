"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Search,
  Eye,
  FileText,
  Boxes,
  Calendar,
  ExternalLink,
  DollarSign,
  MapPin,
  Clock,
  Building,
  User,
} from "lucide-react";

interface RFQ {
  id: string;
  title: string;
  status: string | null;
  category: string | null;
  quantity: number | null;
  estimatedBudget?: string | number | null;
  deliveryLocation?: string | null;
  timeline?: string | null;
  createdAt: Date | string | null;
  userId?: string | null;
  buyerName?: string | null;
  buyerEmail?: string | null;
  buyerCompany?: string | null;
}

interface RfqsTableProps {
  initialRfqs: RFQ[];
}

export function RfqsTable({ initialRfqs }: RfqsTableProps) {
  const [search, setSearch] = useState("");
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRfqs = initialRfqs.filter((rfq) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (rfq.title || "").toLowerCase().includes(term) ||
      (rfq.category || "").toLowerCase().includes(term) ||
      (rfq.status || "").toLowerCase().includes(term) ||
      (rfq.buyerName || "").toLowerCase().includes(term) ||
      (rfq.buyerCompany || "").toLowerCase().includes(term) ||
      (rfq.buyerEmail || "").toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      (rfq.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by title, category, buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {["all", "submitted", "draft"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                  statusFilter === status
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredRfqs.length} of {initialRfqs.length} RFQs
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[280px]">RFQ Title & ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRfqs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-slate-500 py-10 text-sm"
                >
                  {search ? "No RFQs match your filters." : "No RFQs found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredRfqs.map((rfq) => {
                const isSubmitted =
                  (rfq.status || "").toLowerCase() === "submitted" ||
                  (rfq.status || "").toLowerCase() === "published";

                return (
                  <TableRow key={rfq.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-md bg-blue-50 text-blue-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-900 text-sm truncate max-w-[220px]">
                            {rfq.title || "Corporate Gifting RFQ"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {rfq.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {rfq.userId ? (
                        <Link
                          href={`/admin/buyers/${rfq.userId}`}
                          className="group inline-flex flex-col"
                        >
                          <span className="font-semibold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                            {rfq.buyerName || rfq.buyerEmail || "Buyer Profile"}
                          </span>
                          {rfq.buyerCompany && (
                            <span className="text-[11px] text-slate-500">
                              {rfq.buyerCompany}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-xs">
                            {rfq.buyerName || rfq.buyerEmail || "Guest User"}
                          </span>
                          {rfq.buyerCompany && (
                            <span className="text-[11px] text-slate-500">
                              {rfq.buyerCompany}
                            </span>
                          )}
                        </div>
                      )}
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
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1.5 h-8 border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Link href={`/admin/rfqs/${rfq.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* RFQ Details Dialog (Quick Overview) */}
      <Dialog
        open={!!selectedRfq}
        onOpenChange={(open) => !open && setSelectedRfq(null)}
      >
        {selectedRfq && (
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {selectedRfq.title || "RFQ Details"}
              </DialogTitle>
              <DialogDescription>
                Overview of requirements and quotation details.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid gap-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <FileText className="w-4 h-4 text-slate-400" />
                    RFQ ID
                  </span>
                  <span className="font-mono text-slate-800 text-xs select-all">
                    {selectedRfq.id}
                  </span>
                </div>

                {selectedRfq.buyerName && (
                  <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                    <span className="text-slate-500 flex items-center gap-2 font-medium">
                      <User className="w-4 h-4 text-slate-400" />
                      Buyer Name
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedRfq.buyerName} ({selectedRfq.buyerCompany || "-"})
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Boxes className="w-4 h-4 text-slate-400" />
                    Category
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedRfq.category || "General Gifting"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Boxes className="w-4 h-4 text-slate-400" />
                    Quantity Required
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedRfq.quantity
                      ? `${selectedRfq.quantity.toLocaleString()} units`
                      : "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Created Date
                  </span>
                  <span className="font-medium text-slate-700">
                    {selectedRfq.createdAt
                      ? format(new Date(selectedRfq.createdAt), "PPP")
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Link href={`/admin/rfqs/${selectedRfq.id}`}>
                    <Eye className="w-4 h-4" />
                    <span>View Full RFQ Configuration</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 gap-2"
                >
                  <Link
                    href={`/rfq/buyer-preview/${selectedRfq.id}?from=admin`}
                    target="_blank"
                  >
                    <span>Open Live Buyer Preview</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
