/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Plus,
  Search,
  FileText,
  Boxes,
  Calendar,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  MessageSquare,
  LogOut,
  Loader2,
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Send,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { signOut } from "@/lib/auth-client";
import { toast } from "react-toastify";

interface BuyerRFQ {
  id: string;
  rfpUniqueId: string;
  title: string;
  purpose: string;
  category: string;
  quantity: number;
  status: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  vendorsCount: number;
  responsesCount: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  companyName?: string;
}

export default function BuyerDashboardPage() {
  const router = useRouter();

  const [rfqs, setRfqs] = useState<BuyerRFQ[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "draft">("all");

  // Deletion Modal state
  const [rfqToDelete, setRfqToDelete] = useState<BuyerRFQ | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Logout state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/buyer/rfqs");
      if (res.status === 401) {
        router.push("/?mode=login&callbackUrl=/dashboard");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load RFQs");
      }

      const data = await res.json();
      setRfqs(data.rfqs || []);
      if (data.user) {
        setUser(data.user);
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateNewRfq = () => {
    const newRfpId = crypto.randomUUID();
    router.push(`/rfq/${newRfpId}/requirement`);
  };
  const handleCreateNewRfp = handleCreateNewRfq;

  const handleEditRfq = (rfpId: string) => {
    router.push(`/rfq/${rfpId}/requirement`);
  };

  const handleDeleteConfirm = async () => {
    if (!rfqToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/rfps/${rfqToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || "Failed to delete RFQ");
      }

      setRfqs((prev) => prev.filter((r) => r.id !== rfqToDelete.id));
      toast.success(`RFQ ${rfqToDelete.rfpUniqueId} deleted successfully.`);
      setRfqToDelete(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err?.message || "Could not delete RFQ.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.location.href = "/";
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = rfqs.length;
    const submitted = rfqs.filter(
      (r) =>
        r.status.toLowerCase() === "submitted" ||
        r.status.toLowerCase() === "published" ||
        r.status.toLowerCase() === "approved",
    ).length;
    const drafts = rfqs.filter((r) => r.status.toLowerCase() === "draft").length;
    const totalQuotes = rfqs.reduce((acc, curr) => acc + (curr.responsesCount || 0), 0);

    return { total, submitted, drafts, totalQuotes };
  }, [rfqs]);

  // Filtered RFQs
  const filteredRfqs = useMemo(() => {
    return rfqs.filter((rfq) => {
      const query = search.toLowerCase();
      const matchesSearch =
        rfq.title.toLowerCase().includes(query) ||
        rfq.rfpUniqueId.toLowerCase().includes(query) ||
        rfq.category.toLowerCase().includes(query) ||
        rfq.purpose.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (statusFilter === "submitted") {
        return (
          rfq.status.toLowerCase() === "submitted" ||
          rfq.status.toLowerCase() === "published" ||
          rfq.status.toLowerCase() === "approved"
        );
      }

      if (statusFilter === "draft") {
        return rfq.status.toLowerCase() === "draft";
      }

      return true;
    });
  }, [rfqs, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    const s = (status || "draft").toLowerCase();
    if (s === "submitted" || s === "published") {
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-medium text-xs gap-1">
          <Send className="w-3 h-3" /> Submitted
        </Badge>
      );
    }
    if (s === "approved") {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium text-xs gap-1">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 font-medium text-xs gap-1">
        <Clock className="w-3 h-3" /> Draft
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/zopa-logo.svg"
                alt="ZOPA FLUX Logo"
                width={140}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
            <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Buyer Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateNewRfp}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New RFQ</span>
            </Button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {user && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  {user.companyName || user.email}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs h-9 px-3 gap-1.5 cursor-pointer"
              title="Log out"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Buyer Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your corporate gifting requirements, track quotes, and create new RFQs.
            </p>
          </div>

          <Button
            onClick={handleCreateNewRfp}
            variant="outline"
            className="sm:hidden w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create New RFQ
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-1 sm:pt-2">
          <Card className="border border-slate-200 bg-white shadow-2xs">
            <CardContent className="p-5 sm:p-6 pt-5 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total RFQs
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    {metrics.total}
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
                    Active / Submitted
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
                    {metrics.submitted}
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
                    Drafts
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1">
                    {metrics.drafts}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-2xs">
            <CardContent className="p-5 sm:p-6 pt-5 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Quotes Received
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
                    {metrics.totalQuotes}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RFQ List Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by project title, ID, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-white border-slate-200 text-sm focus-visible:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({rfqs.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("submitted")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === "submitted"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Submitted ({metrics.submitted})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === "draft"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Drafts ({metrics.drafts})
              </button>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Loading your RFQs...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-3 px-4">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <p className="text-base font-bold text-slate-800">Failed to Load RFQs</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                className="mt-2 text-xs"
              >
                Try Again
              </Button>
            </div>
          ) : filteredRfqs.length === 0 ? (
            <div className="py-20 text-center space-y-4 px-4">
              <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
                <Boxes className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  {search || statusFilter !== "all"
                    ? "No RFQs match your search"
                    : "No RFQs Created Yet"}
                </h3>
                <p className="text-xs text-slate-500">
                  {search || statusFilter !== "all"
                    ? "Try clearing filters or changing your search terms."
                    : "Get started by creating your first corporate gifting requirement to receive vendor quotes."}
                </p>
              </div>
              {search || statusFilter !== "all" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={handleCreateNewRfp}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create First RFQ
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-xs text-slate-700">
                      RFQ Details
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700">
                      Category & Quantity
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700">
                      Vendor Quotes
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700">
                      Created Date
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 text-right pr-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRfqs.map((rfq) => {
                    const formattedDate = rfq.createdAt
                      ? format(new Date(rfq.createdAt), "dd MMM, yyyy")
                      : "—";

                    return (
                      <TableRow key={rfq.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* RFQ Details */}
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {rfq.rfpUniqueId}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 truncate max-w-xs" title={rfq.title}>
                              {rfq.title}
                            </p>
                            {rfq.purpose && (
                              <p className="text-xs text-slate-500 truncate max-w-xs" title={rfq.purpose}>
                                Purpose: {rfq.purpose}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Category & Quantity */}
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {rfq.category}
                            </span>
                            <p className="text-slate-600 font-mono">
                              Qty: {rfq.quantity?.toLocaleString() || "—"}
                            </p>
                          </div>
                        </TableCell>

                        {/* Vendor Quotes */}
                        <TableCell>
                          {rfq.responsesCount > 0 ? (
                            <Link
                              href={`/rfq/buyer-preview/${rfq.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{rfq.responsesCount} {rfq.responsesCount === 1 ? "quote" : "quotes"} received</span>
                            </Link>
                          ) : rfq.vendorsCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{rfq.vendorsCount} invited (0 quotes)</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">No vendors invited</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(rfq.status)}</TableCell>

                        {/* Created Date */}
                        <TableCell className="text-xs text-slate-600 font-mono">
                          {formattedDate}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View / Compare Quotes */}
                            {rfq.responsesCount > 0 ? (
                              <Link
                                href={`/rfq/buyer-preview/${rfq.id}`}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                title="Compare Vendor Quotes"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            ) : (
                              <Link
                                href={`/rfq/preview/${rfq.id}`}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                title="View RFQ Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            )}

                            {/* Edit RFQ */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRfq(rfq.id)}
                              className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit RFQ"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            {/* Delete RFQ */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRfqToDelete(rfq)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Delete RFQ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(rfqToDelete)}
        onOpenChange={(open) => !open && setRfqToDelete(null)}
      >
        <DialogContent className="max-w-md bg-white p-6 rounded-xl border border-slate-200">
          <DialogHeader className="space-y-2 text-left">
            <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
              <Trash2 className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Delete RFQ
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900 font-semibold">
                {rfqToDelete?.rfpUniqueId} ({rfqToDelete?.title})
              </strong>
              ? All requirement items, criteria, and vendor responses will be permanently removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-row justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRfqToDelete(null)}
              disabled={isDeleting}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete RFQ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
