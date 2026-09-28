/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Calendar,
  FileText,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Download,
  ExternalLink,
  Users,
  Send,
  MessageSquare,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminRfqDetailViewProps {
  data: any;
  fromBuyerId?: string | null;
}

export function AdminRfqDetailView({ data, fromBuyerId }: AdminRfqDetailViewProps) {
  const [activeTab, setActiveTab] = useState<string>("company");

  const {
    rfq,
    creatorUser,
    company,
    contact,
    requirement,
    scope,
    category,
    boq,
    evaluationCriteria,
    financials,
    generalTerms,
    specialTerms,
    documentsToShare,
    vendorContacts,
    dates,
  } = data;

  const isSubmitted =
    (rfq.status || "").toLowerCase() === "submitted" ||
    (rfq.status || "").toLowerCase() === "published";

  const backLink = fromBuyerId
    ? `/admin/buyers/${fromBuyerId}`
    : "/admin/rfqs";
  const backLabel = fromBuyerId
    ? "Back to Buyer Details"
    : "Back to All RFQs";

  const fullContactAddress = [
    contact.addressLine1,
    contact.addressLine2,
    contact.city,
    contact.state,
    contact.postalCode,
    contact.country,
  ]
    .filter(Boolean)
    .join(", ");

  const fullCompanyAddress = [
    company.addressLine1,
    company.addressLine2,
    company.city,
    company.state,
    company.postalCode,
    company.country,
  ]
    .filter(Boolean)
    .join(", ");

  const contactInitial = (contact.name || "C").charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-slate-600 hover:text-slate-900 border-slate-200 gap-1.5 h-9"
          >
            <Link href={backLink}>
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 text-xs gap-1.5 h-9"
          >
            <Link
              href={`/rfq/buyer-preview/${rfq.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Live Buyer Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            className={`text-xs px-3 py-1 font-semibold capitalize ${
              isSubmitted
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Status: {rfq.status || "Draft"}
          </Badge>
        </div>
      </div>

      {/* Main Grid: Left Contact Card + Right Tabbed Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Contact Information */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-slate-200 bg-white shadow-xs rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Contact Information
              </h3>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Avatar / Logo */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  {contact.logoPreview || contact.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={contact.logoPreview || contact.logoUrl}
                      alt={contact.name}
                      className="h-20 w-20 object-contain rounded-2xl border border-slate-200 p-1 bg-white shadow-xs"
                    />
                  ) : (
                    <Avatar className="h-20 w-20 border-2 border-slate-100 shadow-xs">
                      <AvatarImage src={creatorUser?.image || undefined} alt={contact.name} />
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-2xl">
                        {contactInitial}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-lg mt-3">
                  {contact.name}
                </h4>
                {contact.department && (
                  <p className="text-xs text-slate-500 font-medium">
                    {contact.department}
                  </p>
                )}
              </div>

              {/* Details List */}
              <div className="space-y-3.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Email Address
                  </span>
                  <p className="text-slate-800 font-medium break-all flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {contact.email || "Not specified"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Phone Number
                  </span>
                  <p className="text-slate-800 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {contact.phone || "Not specified"}
                    {company.isPhoneMasked && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Masked from vendors
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Department
                  </span>
                  <p className="text-slate-800 font-medium">
                    {contact.department || "Not specified"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Contact Address
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {fullContactAddress || "Not specified"}
                  </p>
                </div>

                {creatorUser && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Registered Buyer Account
                    </span>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1.5 border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Link href={`/admin/buyers/${creatorUser.id}`}>
                        <Building className="w-3.5 h-3.5" />
                        <span>View Buyer Profile & RFQs</span>
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabbed Sections */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-xl w-full flex flex-wrap gap-1 h-auto">
              <TabsTrigger
                value="company"
                className="flex-1 py-2 text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
              >
                Company
              </TabsTrigger>
              <TabsTrigger
                value="project"
                className="flex-1 py-2 text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
              >
                Project
              </TabsTrigger>
              <TabsTrigger
                value="financials"
                className="flex-1 py-2 text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger
                value="terms"
                className="flex-1 py-2 text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
              >
                Terms
              </TabsTrigger>
              <TabsTrigger
                value="vendors"
                className="flex-1 py-2 text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Vendor Contacts</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 font-bold">
                  {vendorContacts.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: COMPANY */}
            <TabsContent value="company" className="space-y-5 mt-4">
              <Card className="border border-slate-200 bg-white shadow-xs rounded-2xl">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    Company Information
                  </h3>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Company Details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Company Details
                    </h4>
                    <div className="grid gap-2 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-slate-500 font-medium">Name:</span>
                        <span className="font-bold text-slate-900">{company.name}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Address:</span>
                        <span className="text-slate-800 font-medium sm:text-right max-w-md">
                          {fullCompanyAddress || "Not specified"}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Business Type:</span>
                        <span className="font-semibold text-slate-800">{company.businessType}</span>
                      </div>
                    </div>
                  </div>

                  {/* RFQ Information */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      RFQ Information
                    </h4>
                    <div className="grid gap-2 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-slate-500 font-medium">RFQ ID:</span>
                        <span className="font-mono text-slate-900 font-semibold select-all">
                          {rfq.id}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Title:</span>
                        <span className="font-semibold text-slate-900">{rfq.title}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Category:</span>
                        <span className="font-medium text-slate-800">{category.category}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Required Quantity:</span>
                        <span className="font-semibold text-slate-900">
                          {rfq.quantity ? rfq.quantity.toLocaleString() : "Not specified"}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Status:</span>
                        <Badge
                          variant={isSubmitted ? "default" : "secondary"}
                          className="capitalize text-[11px] font-semibold w-fit"
                        >
                          {rfq.status || "Draft"}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Created:</span>
                        <span className="text-slate-800 font-medium">
                          {rfq.createdAt ? format(new Date(rfq.createdAt), "PPP") : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Project Schedule */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Project Schedule
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-[11px] text-slate-400 font-medium">Start Date</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">
                            {dates.startDate
                              ? format(new Date(dates.startDate), "PPP")
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-600 shrink-0" />
                        <div>
                          <p className="text-[11px] text-slate-400 font-medium">End Date</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">
                            {dates.endDate
                              ? format(new Date(dates.endDate), "PPP")
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: PROJECT */}
            <TabsContent value="project" className="space-y-5 mt-4">
              <Card className="border border-slate-200 bg-white shadow-xs rounded-2xl">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Project Requirements
                  </h3>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Project Overview */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Project Overview
                    </h4>
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium block">Project Name:</span>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">
                          {requirement.projectName}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium block">Purpose:</span>
                        <p className="text-slate-800 leading-relaxed mt-0.5 font-medium">
                          {requirement.purpose}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scope of Work */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Scope of Work
                    </h4>
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      {Array.isArray(scope.deliverables) && scope.deliverables.length > 0 ? (
                        <ul className="space-y-2 text-xs text-slate-800 list-disc list-inside">
                          {scope.deliverables.map((item: any, idx: number) => (
                            <li key={idx} className="leading-relaxed">
                              {typeof item === "string" ? item : JSON.stringify(item)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500">
                          {typeof scope.deliverables === "string" && scope.deliverables
                            ? scope.deliverables
                            : "No specific scope of work items provided."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Evaluation Criteria */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Evaluation Criteria
                    </h4>
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      {evaluationCriteria && evaluationCriteria.length > 0 ? (
                        <ul className="space-y-2 text-xs text-slate-800 list-disc list-inside">
                          {evaluationCriteria.map((crit: string, idx: number) => (
                            <li key={idx} className="leading-relaxed font-medium">
                              {crit}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500">
                          No specific evaluation criteria configured.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: FINANCIALS */}
            <TabsContent value="financials" className="space-y-5 mt-4">
              <Card className="border border-slate-200 bg-white shadow-xs rounded-2xl">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Financial Information & BOQ
                  </h3>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Bill of Quantities Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Bill of Quantities (BOQ)
                      </h4>
                      <Badge variant="outline" className="text-[11px] font-semibold">
                        {boq.length} {boq.length === 1 ? "Item" : "Items"}
                      </Badge>
                    </div>

                    <div className="rounded-xl border border-slate-200 overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/80">
                          <TableRow>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Category</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Description</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">UOM</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Qty</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Target Price</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Specification</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Remarks</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600 text-right">Attachment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {boq.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center text-slate-500 py-8 text-xs">
                                No items defined in the Bill of Quantities.
                              </TableCell>
                            </TableRow>
                          ) : (
                            boq.map((item: any) => (
                              <TableRow key={item.id} className="text-xs">
                                <TableCell className="font-semibold text-slate-900">
                                  {item.category || "-"}
                                </TableCell>
                                <TableCell className="font-medium text-slate-800 max-w-xs">
                                  {item.description || "-"}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {item.uom || "-"}
                                </TableCell>
                                <TableCell className="font-bold text-slate-900">
                                  {item.qty ? item.qty.toLocaleString() : "-"}
                                </TableCell>
                                <TableCell className="font-semibold text-emerald-700">
                                  {item.targetPrice ? `₹${item.targetPrice.toLocaleString()}` : "-"}
                                </TableCell>
                                <TableCell className="text-slate-600 max-w-xs truncate" title={item.specification}>
                                  {item.specification || "-"}
                                </TableCell>
                                <TableCell className="text-slate-600 max-w-xs truncate" title={item.remarks}>
                                  {item.remarks || "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.attachmentUrl ? (
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs text-blue-600 hover:text-blue-700 gap-1 px-2"
                                    >
                                      <a
                                        href={item.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={item.attachmentName || "Download Attachment"}
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>File</span>
                                      </a>
                                    </Button>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Financial Terms */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Financials & Payment Terms
                    </h4>
                    <div className="grid gap-2 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-slate-500 font-medium">Cost Model / Pricing Model:</span>
                        <span className="font-bold text-slate-900">{financials.pricingModel}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Currency:</span>
                        <span className="font-semibold text-slate-800">{financials.currency}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">PBG Amount:</span>
                        <span className="font-semibold text-slate-800">{financials.pbgAmount}</span>
                      </div>
                      {financials.pbgNotes && (
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                          <span className="text-slate-500 font-medium">PBG Notes:</span>
                          <span className="text-slate-800 font-medium max-w-md sm:text-right">
                            {financials.pbgNotes}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Payment Terms:</span>
                        <div className="sm:text-right max-w-md">
                          {Array.isArray(financials.paymentTerms) && financials.paymentTerms.length > 0 ? (
                            financials.paymentTerms.map((pt: any, idx: number) => (
                              <p key={idx} className="font-medium text-slate-800">
                                {typeof pt === "string" ? pt : JSON.stringify(pt)}
                              </p>
                            ))
                          ) : (
                            <span className="text-slate-500">Not specified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: TERMS */}
            <TabsContent value="terms" className="space-y-5 mt-4">
              <Card className="border border-slate-200 bg-white shadow-xs rounded-2xl">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    Terms & Documents
                  </h3>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* General Terms */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      General Terms & Conditions
                    </h4>
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-3 text-xs">
                      {generalTerms.deliveryTimeValue && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Delivery Timeline:</span>
                          <span className="font-bold text-slate-900">
                            {generalTerms.deliveryTimeValue} {generalTerms.deliveryTimeUnit}
                          </span>
                        </div>
                      )}

                      {Array.isArray(generalTerms.deliveryLocations) && generalTerms.deliveryLocations.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/50">
                          <span className="text-slate-500 font-medium block mb-1">Delivery Locations:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {generalTerms.deliveryLocations.map((loc: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-white">
                                {typeof loc === "string" ? loc : JSON.stringify(loc)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {Array.isArray(generalTerms.selectedTerms) && generalTerms.selectedTerms.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/50">
                          <span className="text-slate-500 font-medium block mb-1">Standard Terms Chosen:</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-800">
                            {generalTerms.selectedTerms.map((term: any, idx: number) => (
                              <li key={idx}>
                                {typeof term === "string" ? term : term.title || term.text || JSON.stringify(term)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(generalTerms.customTerms) && generalTerms.customTerms.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/50">
                          <span className="text-slate-500 font-medium block mb-1">Custom Terms:</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-800">
                            {generalTerms.customTerms.map((term: any, idx: number) => (
                              <li key={idx}>
                                {typeof term === "string" ? term : term.text || JSON.stringify(term)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Terms */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Special Terms
                    </h4>
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-3 text-xs">
                      {Array.isArray(specialTerms.selectedTerms) && specialTerms.selectedTerms.length > 0 ? (
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Standard Special Terms:</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-800">
                            {specialTerms.selectedTerms.map((term: any, idx: number) => (
                              <li key={idx}>
                                {typeof term === "string" ? term : term.title || term.text || JSON.stringify(term)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-slate-500">No standard special terms selected.</p>
                      )}

                      {Array.isArray(specialTerms.customTerms) && specialTerms.customTerms.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/50">
                          <span className="text-slate-500 font-medium block mb-1">Custom Special Terms:</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-800">
                            {specialTerms.customTerms.map((term: any, idx: number) => (
                              <li key={idx}>
                                {typeof term === "string" ? term : term.text || JSON.stringify(term)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents to Share */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Documents to Share
                    </h4>
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
                      {documentsToShare ? (
                        typeof documentsToShare === "string" ? (
                          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {documentsToShare}
                          </p>
                        ) : Array.isArray(documentsToShare) ? (
                          <ul className="list-disc list-inside space-y-1 text-slate-800">
                            {documentsToShare.map((doc: any, idx: number) => (
                              <li key={idx}>
                                {typeof doc === "string" ? doc : doc.name || JSON.stringify(doc)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <pre className="text-xs text-slate-800 whitespace-pre-wrap font-mono">
                            {JSON.stringify(documentsToShare, null, 2)}
                          </pre>
                        )
                      ) : (
                        <p className="text-slate-500">No documents configured to share.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 5: VENDOR CONTACTS INVITED */}
            <TabsContent value="vendors" className="space-y-5 mt-4">
              <Card className="border border-slate-200 bg-white shadow-xs rounded-2xl">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    Vendor Contacts Sent for this RFQ
                  </h3>
                  <Badge variant="outline" className="text-xs font-semibold bg-white">
                    {vendorContacts.length} {vendorContacts.length === 1 ? "Vendor" : "Vendors"}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  {vendorContacts.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <Users className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="font-semibold text-slate-700 text-sm">
                        No Vendor Contacts Invited Yet
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        The buyer has not invited any vendor contacts for this RFQ yet.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/80">
                          <TableRow>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Vendor Name</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Company</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Email Address</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Mobile Number</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">Email Sent</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600">WhatsApp Sent</TableHead>
                            <TableHead className="text-[11px] uppercase font-bold text-slate-600 text-right">Invited Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vendorContacts.map((vc: any) => (
                            <TableRow key={vc.id} className="text-xs hover:bg-slate-50/60">
                              <TableCell className="font-semibold text-slate-900">
                                {vc.name}
                              </TableCell>
                              <TableCell className="font-medium text-slate-700">
                                {vc.companyName}
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {vc.email}
                              </TableCell>
                              <TableCell className="text-slate-600 font-mono">
                                {vc.countryCode || "+91"} {vc.mobileNo}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-semibold gap-1 ${
                                    vc.email_sent
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {vc.email_sent ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Sent
                                    </>
                                  ) : (
                                    "Pending"
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-semibold gap-1 ${
                                    vc.whatsapp_sent
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {vc.whatsapp_sent ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Sent
                                    </>
                                  ) : (
                                    "Pending"
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-slate-500">
                                {vc.createdAt
                                  ? format(new Date(vc.createdAt), "dd MMM yyyy")
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
